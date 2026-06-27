/* ==========================================
   AUXILIAR BNCC - INTERACTIVE CORE JS
   ========================================== */

// Global State
let bnccHabilidades = [];
let originalCompleta = null;
let originalComputacao = null;
let selectedSkills = []; // Selected skills for export/prompt

// Filter State
const filters = {
  search: "",
  origin: "todos", // "todos", "geral", "computacao"
  stage: "todos", // "todos", "infantil", "fundamental", "medio"
  component: "todos",
  grade: "todos",
  axis: "todos"
};

// Competency State
const competencyFilters = {
  type: "gerais", // "gerais" or "especificas"
  discipline: "todos"
};

// DOM Elements - Sidebar & Search
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const filterOrigin = document.getElementById("filter-origin");
const filterStage = document.getElementById("filter-stage");
const selectComponent = document.getElementById("select-component");
const selectGrade = document.getElementById("select-grade");
const selectAxis = document.getElementById("select-axis");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const activeFiltersContainer = document.getElementById("active-filters-container");
const habilidadesContainer = document.getElementById("habilidades-container");
const resultsCountEl = document.getElementById("results-count");

// DOM Elements - Competencies
const sidebarExplorerContent = document.getElementById("sidebar-explorer-content");
const sidebarCompetenciesContent = document.getElementById("sidebar-competencies-content");
const filterCompType = document.getElementById("filter-comp-type");
const sectionCompDisciplinas = document.getElementById("section-comp-disciplinas");
const selectCompDiscipline = document.getElementById("select-comp-discipline");
const competenciesContainer = document.getElementById("competencies-container");
const competenciesPaneTitle = document.getElementById("competencies-pane-title");
const competenciesPaneSubtitle = document.getElementById("competencies-pane-subtitle");

// Planning Basket Elements
const planningBasket = document.getElementById("planning-basket");
const basketToggleBtn = document.getElementById("basket-toggle-btn");
const basketBadgeCount = document.getElementById("basket-badge-count");
const basketScrollArea = document.getElementById("basket-scroll-area");
const basketEmptyMsg = document.getElementById("basket-empty-msg");
const basketItemsListUl = document.getElementById("basket-items-list-ul");
const exportPdfBtn = document.getElementById("export-pdf-btn");
const exportPromptBtn = document.getElementById("export-prompt-btn");
const toastNotification = document.getElementById("toast-notification");

// Crossover Elements
const crossSelectGrade = document.getElementById("cross-select-grade");
const crossSelectComponent = document.getElementById("cross-select-component");
const crossActionBtn = document.getElementById("cross-action-btn");
const crossComputacaoContainer = document.getElementById("cross-computacao-container");
const crossGeralContainer = document.getElementById("cross-geral-container");

// Modals
const detailModal = document.getElementById("detail-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalCode = document.getElementById("modal-code");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");

const promptModal = document.getElementById("prompt-modal");
const closePromptModalBtn = document.getElementById("close-prompt-modal-btn");
const promptTextarea = document.getElementById("prompt-textarea");
const copyClipboardBtn = document.getElementById("copy-clipboard-btn");

// Tabs
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadData();
  setupEventListeners();
  setupPlanningBasket();
});

// Tab navigation handler
function initTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(pane => pane.classList.remove("active"));
      
      btn.classList.add("active");
      const targetPane = document.getElementById(`pane-${btn.dataset.tab}`);
      if (targetPane) targetPane.classList.add("active");

      // Swap sidebars if Competencies tab is active
      if (btn.dataset.tab === "competencies") {
        sidebarExplorerContent.style.display = "none";
        sidebarCompetenciesContent.style.display = "flex";
        renderCompetencies();
      } else {
        sidebarExplorerContent.style.display = "flex";
        sidebarCompetenciesContent.style.display = "none";
      }
    });
  });
}

// Fetch and load optimized JSON files
async function loadData() {
  try {
    const [resCompleta, resComputacao] = await Promise.all([
      fetch("BNCC_Completa_Otimizada.json"),
      fetch("BNCC_Computacao_Otimizada.json")
    ]);
    
    originalCompleta = await resCompleta.json();
    originalComputacao = await resComputacao.json();
    
    // Tag skills with their origin database
    const completaHabs = (originalCompleta.habilidades || []).map(h => ({ ...h, base_origem: "geral" }));
    const computacaoHabs = (originalComputacao.habilidades || []).map(h => ({ ...h, base_origem: "computacao" }));
    
    // Combine datasets
    bnccHabilidades = [...completaHabs, ...computacaoHabs];
    
    // Populate dynamic drop-downs in sidebar
    populateFilterDropdowns();
    
    // Perform initial render
    filterAndRender();
    
  } catch (error) {
    console.error("Erro ao carregar as bases de dados:", error);
    habilidadesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-rose);"></i>
        <h3>Erro ao Carregar Dados</h3>
        <p>Não foi possível carregar os arquivos JSON otimizados. Verifique se o script de otimização rodou com sucesso.</p>
      </div>
    `;
  }
}

// Populate component, grade and axis select dropdowns based on loaded datasets
function populateFilterDropdowns() {
  // 1. Components
  const components = [...new Set(bnccHabilidades.map(h => h.componente).filter(Boolean))].sort();
  selectComponent.innerHTML = '<option value="todos">Todos os Componentes</option>';
  components.forEach(comp => {
    selectComponent.innerHTML += `<option value="${comp}">${comp}</option>`;
  });
  
  // 2. Grades / Years (ano_faixa)
  const gradesSet = new Set();
  bnccHabilidades.forEach(h => {
    (h.ano_faixa || []).forEach(g => gradesSet.add(g));
  });
  const grades = [...gradesSet].sort((a, b) => {
    const getWeight = (val) => {
      if (val === "Educação Infantil") return 0;
      if (val.includes("EM")) return 2;
      return 1;
    };
    const wA = getWeight(a);
    const wB = getWeight(b);
    if (wA !== wB) return wA - wB;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
  
  selectGrade.innerHTML = '<option value="todos">Todos os Anos</option>';
  grades.forEach(g => {
    selectGrade.innerHTML += `<option value="${g}">${g}</option>`;
  });
  
  // 3. Axes (eixo)
  const axes = [...new Set(bnccHabilidades.map(h => h.eixo).filter(Boolean))].sort();
  selectAxis.innerHTML = '<option value="todos">Todos os Eixos</option>';
  axes.forEach(ax => {
    selectAxis.innerHTML += `<option value="${ax}">${ax}</option>`;
  });

  // 4. Competencies disciplines dropdown
  // Unique disciplines in originalCompleta.competencias_especificas + Computação
  const disciplines = ["Computação"];
  (originalCompleta.competencias_especificas || []).forEach(ce => {
    disciplines.push(ce.componente);
  });
  
  selectCompDiscipline.innerHTML = '<option value="todos">Selecione uma disciplina...</option>';
  disciplines.forEach(d => {
    selectCompDiscipline.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

// Event Listeners Setup
function setupEventListeners() {
  // Search bar input
  searchInput.addEventListener("input", (e) => {
    filters.search = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = filters.search ? "block" : "none";
    filterAndRender();
  });
  
  // Clear search button
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    filters.search = "";
    clearSearchBtn.style.display = "none";
    filterAndRender();
  });
  
  // Origin pills
  filterOrigin.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterOrigin.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filters.origin = btn.dataset.value;
      filterAndRender();
    });
  });
  
  // Stage pills
  filterStage.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterStage.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filters.stage = btn.dataset.value;
      filterAndRender();
    });
  });
  
  // Dropdown selects
  selectComponent.addEventListener("change", (e) => {
    filters.component = e.target.value;
    filterAndRender();
  });
  
  selectGrade.addEventListener("change", (e) => {
    filters.grade = e.target.value;
    filterAndRender();
  });
  
  selectAxis.addEventListener("change", (e) => {
    filters.axis = e.target.value;
    filterAndRender();
  });
  
  // Reset all filters
  resetFiltersBtn.addEventListener("click", resetAllFilters);
  
  // Competencies Tab filters
  filterCompType.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterCompType.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      competencyFilters.type = btn.dataset.value;
      
      if (competencyFilters.type === "especificas") {
        sectionCompDisciplinas.style.display = "flex";
      } else {
        sectionCompDisciplinas.style.display = "none";
        competencyFilters.discipline = "todos";
      }
      renderCompetencies();
    });
  });

  selectCompDiscipline.addEventListener("change", (e) => {
    competencyFilters.discipline = e.target.value;
    renderCompetencies();
  });
  
  // Close Modals
  closeModalBtn.addEventListener("click", () => {
    detailModal.close();
  });
  
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.close();
  });

  closePromptModalBtn.addEventListener("click", () => {
    promptModal.close();
  });

  promptModal.addEventListener("click", (e) => {
    if (e.target === promptModal) promptModal.close();
  });
  
  // Crossover Action trigger
  crossActionBtn.addEventListener("click", runCrossoverMapping);
}

// Reset filters function
function resetAllFilters() {
  filters.search = "";
  filters.origin = "todos";
  filters.stage = "todos";
  filters.component = "todos";
  filters.grade = "todos";
  filters.axis = "todos";
  
  searchInput.value = "";
  clearSearchBtn.style.display = "none";
  
  filterOrigin.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
  filterOrigin.querySelector('[data-value="todos"]').classList.add("active");
  
  filterStage.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
  filterStage.querySelector('[data-value="todos"]').classList.add("active");
  
  selectComponent.value = "todos";
  selectGrade.value = "todos";
  selectAxis.value = "todos";
  
  filterAndRender();
}

// Core Filtering Logic
function filterAndRender() {
  const filtered = bnccHabilidades.filter(h => {
    if (filters.search) {
      const c = (h.codigo || "").toLowerCase();
      const d = (h.descricao || "").toLowerCase();
      const comp = (h.componente || "").toLowerCase();
      const stage = (h.etapa || "").toLowerCase();
      const objs = (h.objetos_conhecimento || []).join(" ").toLowerCase();
      
      const match = c.includes(filters.search) || 
                    d.includes(filters.search) || 
                    comp.includes(filters.search) || 
                    stage.includes(filters.search) || 
                    objs.includes(filters.search);
                    
      if (!match) return false;
    }
    
    if (filters.origin !== "todos") {
      if (h.base_origem !== filters.origin) return false;
    }
    
    if (filters.stage !== "todos") {
      const hEtapa = (h.etapa || "").toLowerCase();
      if (filters.stage === "infantil" && !hEtapa.includes("infantil")) return false;
      if (filters.stage === "fundamental" && !hEtapa.includes("fundamental")) return false;
      if (filters.stage === "medio" && !hEtapa.includes("médio")) return false;
    }
    
    if (filters.component !== "todos") {
      if (h.componente !== filters.component) return false;
    }
    
    if (filters.grade !== "todos") {
      if (!(h.ano_faixa || []).includes(filters.grade)) return false;
    }
    
    if (filters.axis !== "todos") {
      if (h.eixo !== filters.axis) return false;
    }
    
    return true;
  });
  
  renderActiveBadges();
  renderHabilidades(filtered);
}

// Render active filter labels
function renderActiveBadges() {
  activeFiltersContainer.innerHTML = "";
  
  const addBadge = (label, key, val) => {
    const badge = document.createElement("span");
    badge.className = "active-badge";
    badge.innerHTML = `${label}: <strong>${val}</strong>`;
    activeFiltersContainer.appendChild(badge);
  };
  
  if (filters.origin !== "todos") {
    addBadge("Origem", "origin", filters.origin === "geral" ? "BNCC Geral" : "Computação");
  }
  if (filters.stage !== "todos") {
    addBadge("Etapa", "stage", filters.stage.charAt(0).toUpperCase() + filters.stage.slice(1));
  }
  if (filters.component !== "todos") {
    addBadge("Comp.", "component", filters.component);
  }
  if (filters.grade !== "todos") {
    addBadge("Ano", "grade", filters.grade);
  }
  if (filters.axis !== "todos") {
    addBadge("Eixo", "axis", filters.axis);
  }
}

// Render skill cards grid
function renderHabilidades(items) {
  resultsCountEl.innerText = `${items.length} ${items.length === 1 ? 'habilidade encontrada' : 'habilidades encontradas'}`;
  
  if (items.length === 0) {
    habilidadesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass-minus"></i>
        <h3>Nenhuma Habilidade Encontrada</h3>
        <p>Tente ajustar os filtros na barra lateral para expandir a sua busca.</p>
      </div>
    `;
    return;
  }
  
  habilidadesContainer.innerHTML = "";
  
  items.forEach(h => {
    const card = document.createElement("div");
    card.className = `skill-card origin-${h.base_origem}`;
    
    const stageBadge = `<span class="card-badge card-badge-stage">${h.etapa}</span>`;
    const compBadge = `<span class="card-badge card-badge-comp">${h.componente}</span>`;
    
    let objectsMarkup = "";
    if (h.objetos_conhecimento && h.objetos_conhecimento.length > 0) {
      objectsMarkup = `
        <div class="card-objects">
          ${h.objetos_conhecimento.map(o => `<span class="object-tag"><i class="fa-solid fa-tag"></i> ${o}</span>`).join("")}
        </div>
      `;
    }
    
    const axisMarkup = h.eixo ? `
      <span class="footer-eixo">
        <i class="fa-solid fa-network-wired"></i> ${h.eixo}
      </span>
    ` : '<span></span>';
    
    const isChecked = selectedSkills.some(x => x.codigo === h.codigo) ? "checked" : "";
    
    card.innerHTML = `
      <div class="card-select-wrapper">
        <input type="checkbox" class="card-checkbox" data-code="${h.codigo}" ${isChecked}>
      </div>
      <div class="card-header">
        <div class="card-meta-left">
          <span class="card-origin-badge">${h.base_origem === "computacao" ? "BNCC Computação" : "BNCC Geral"}</span>
          <span class="card-code">${h.codigo}</span>
        </div>
        <div class="card-meta-right">
          ${stageBadge}
          ${compBadge}
        </div>
      </div>
      <div class="card-body">
        <p class="card-desc">${h.descricao}</p>
      </div>
      ${objectsMarkup}
      <div class="card-footer">
        ${axisMarkup}
        <button class="btn-expand">Ver Detalhes <i class="fa-solid fa-chevron-right"></i></button>
      </div>
    `;
    
    // Checkbox selection event
    const checkbox = card.querySelector(".card-checkbox");
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation(); // Avoid card click handler
      toggleSkillSelection(h);
    });
    
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    
    card.addEventListener("click", () => {
      showSkillDetail(h);
    });
    
    habilidadesContainer.appendChild(card);
  });
}

// Show details modal dialog
function showSkillDetail(h) {
  modalCode.innerText = h.codigo;
  modalTitle.innerText = h.componente;
  
  let content = `
    <div class="modal-section">
      <h4 class="modal-section-title"><i class="fa-solid fa-quote-left"></i> Diretriz (Descrição)</h4>
      <p class="modal-section-content" style="font-size: 1.05rem; font-weight: 500; color: #fff;">${h.descricao}</p>
    </div>
    
    <div class="modal-meta-grid">
      <div class="modal-meta-item">
        <span class="modal-meta-label">Etapa de Ensino</span>
        <span class="modal-meta-val">${h.etapa}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-label">Ano / Faixa</span>
        <span class="modal-meta-val">${(h.ano_faixa || []).join(", ") || "N/A"}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-label">Eixo Temático</span>
        <span class="modal-meta-val">${h.eixo || "N/A"}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-label">Unidade Temática</span>
        <span class="modal-meta-val">${h.unidade_tematica || "N/A"}</span>
      </div>
    </div>
  `;
  
  if (h.objetos_conhecimento && h.objetos_conhecimento.length > 0) {
    content += `
      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fa-solid fa-tags"></i> Objetos de Conhecimento</h4>
        <div class="card-objects" style="margin-top: 6px;">
          ${h.objetos_conhecimento.map(o => `<span class="object-tag"><i class="fa-solid fa-tag"></i> ${o}</span>`).join("")}
        </div>
      </div>
    `;
  }
  
  if (h.competencia_especifica) {
    content += `
      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fa-solid fa-award"></i> Competência Associada</h4>
        <p class="modal-section-content" style="background-color: rgba(99, 102, 241, 0.05); padding: 12px; border-radius: 6px; border-left: 3px solid var(--accent-purple);">${h.competencia_especifica}</p>
      </div>
    `;
  }
  
  if (h.base_origem === "computacao") {
    if (h.explicacao_pedagogica) {
      content += `
        <div class="modal-section">
          <h4 class="modal-section-title"><i class="fa-solid fa-chalkboard-user"></i> Explicação e Prática Pedagógica</h4>
          <p class="modal-section-content" style="background-color: rgba(6, 182, 212, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid var(--accent-cyan);">${h.explicacao_pedagogica}</p>
        </div>
      `;
    }
    if (h.exemplos) {
      content += `
        <div class="modal-section">
          <h4 class="modal-section-title"><i class="fa-solid fa-lightbulb"></i> Exemplos Práticos de Aplicação</h4>
          <p class="modal-section-content" style="background-color: rgba(16, 185, 129, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid var(--accent-emerald);">${h.exemplos}</p>
        </div>
      `;
    }
  }
  
  if (h.base_origem === "geral") {
    if (h.comentario) {
      content += `
        <div class="modal-section">
          <h4 class="modal-section-title"><i class="fa-solid fa-comment-dots"></i> Comentário sobre a Habilidade</h4>
          <p class="modal-section-content" style="background-color: rgba(59, 130, 246, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid var(--accent-blue);">${h.comentario}</p>
        </div>
      `;
    }
    if (h.possibilidades_curriculo) {
      content += `
        <div class="modal-section">
          <h4 class="modal-section-title"><i class="fa-solid fa-compass"></i> Possibilidades de Integração Curricular</h4>
          <p class="modal-section-content" style="background-color: rgba(244, 63, 94, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid var(--accent-rose);">${h.possibilidades_curriculo}</p>
        </div>
      `;
    }
    
    if (h.campos_atuacao) {
      content += `
        <div class="modal-section">
          <h4 class="modal-section-title"><i class="fa-solid fa-users-rectangle"></i> Campo de Atuação</h4>
          <p class="modal-section-content">${h.campos_atuacao}</p>
        </div>
      `;
    }
    if (h.praticas_linguagem) {
      content += `
        <div class="modal-section">
          <h4 class="modal-section-title"><i class="fa-solid fa-comments"></i> Prática de Linguagem</h4>
          <p class="modal-section-content">${h.praticas_linguagem}</p>
        </div>
      `;
    }
  }
  
  modalBody.innerHTML = content;
  detailModal.showModal();
}

// Competencies Tab Rendering Logic
function renderCompetencies() {
  if (!originalCompleta || !originalComputacao) return;

  if (competencyFilters.type === "gerais") {
    competenciesPaneTitle.innerText = "Competências Gerais da Educação Básica";
    competenciesPaneSubtitle.innerText = "As 10 competências essenciais que orientam a educação brasileira do Infantil ao Ensino Médio.";
    
    let html = '<div class="comp-section-block">';
    (originalCompleta.competencias_gerais || []).forEach(cg => {
      html += `
        <div class="comp-card">
          <div class="comp-num">${cg.numero}</div>
          <div class="comp-desc">
            <strong>${cg.id}</strong> — ${cg.descricao}
          </div>
        </div>
      `;
    });
    html += '</div>';
    competenciesContainer.innerHTML = html;
  } else {
    competenciesPaneTitle.innerText = "Competências Específicas por Componente";
    competenciesPaneSubtitle.innerText = "Selecione uma disciplina na barra lateral para ver suas competências específicas.";

    if (competencyFilters.discipline === "todos") {
      competenciesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-book-bookmark"></i>
          <h3>Nenhuma Disciplina Selecionada</h3>
          <p>Por favor, selecione uma disciplina no menu suspenso da barra lateral esquerda.</p>
        </div>
      `;
      return;
    }

    if (competencyFilters.discipline === "Computação") {
      // Computacao specific layout (Infantil premissas, Fundamental, Medio)
      const infantPrem = originalComputacao.premissas_infantil || [];
      const fundComps = originalComputacao.competencias_fundamental || [];
      const medioComps = originalComputacao.competencias_medio || [];
      
      let html = "";
      
      // Ed. Infantil
      html += `
        <div class="comp-section-block">
          <div class="comp-section-block-title">
            <span class="badge glow-emerald">Educação Infantil</span>
            <h4>Premissas de Computação</h4>
          </div>
      `;
      infantPrem.forEach((item, idx) => {
        html += `
          <div class="comp-card">
            <div class="comp-num color-emerald">${idx+1}</div>
            <div class="comp-desc">${item}</div>
          </div>
        `;
      });
      html += `</div>`;
      
      // Fundamental
      html += `
        <div class="comp-section-block" style="margin-top:20px;">
          <div class="comp-section-block-title">
            <span class="badge glow-blue">Ensino Fundamental</span>
            <h4>Competências Específicas</h4>
          </div>
      `;
      fundComps.forEach((item, idx) => {
        html += `
          <div class="comp-card">
            <div class="comp-num color-blue">${idx+1}</div>
            <div class="comp-desc">${item}</div>
          </div>
        `;
      });
      html += `</div>`;

      // Medio
      html += `
        <div class="comp-section-block" style="margin-top:20px;">
          <div class="comp-section-block-title">
            <span class="badge glow-purple">Ensino Médio</span>
            <h4>Competências Específicas</h4>
          </div>
      `;
      medioComps.forEach((item, idx) => {
        html += `
          <div class="comp-card">
            <div class="comp-num">${idx+1}</div>
            <div class="comp-desc">${item}</div>
          </div>
        `;
      });
      html += `</div>`;
      
      competenciesContainer.innerHTML = html;
    } else {
      // General subjects specific competencies
      const match = (originalCompleta.competencias_especificas || []).find(
        ce => ce.componente === competencyFilters.discipline
      );
      
      if (!match) {
        competenciesContainer.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-circle-exclamation"></i>
            <h3>Nenhum registro encontrado</h3>
            <p>Não há competências específicas cadastradas para a disciplina ${competencyFilters.discipline}.</p>
          </div>
        `;
        return;
      }
      
      let html = `<div class="comp-section-block">
        <div class="comp-section-block-title">
          <span class="badge glow-blue">${match.componente}</span>
          <h4>Competências Específicas de Área</h4>
        </div>
      `;
      (match.competencias || []).forEach(c => {
        html += `
          <div class="comp-card">
            <div class="comp-num color-blue">${c.ordem}</div>
            <div class="comp-desc">${c.descricao}</div>
          </div>
        `;
      });
      html += '</div>';
      competenciesContainer.innerHTML = html;
    }
  }
}

// Crossover mapping trigger
function runCrossoverMapping() {
  const selectedGrade = crossSelectGrade.value;
  const selectedComponent = crossSelectComponent.value;
  
  const compSkills = bnccHabilidades.filter(h => 
    h.base_origem === "computacao" && 
    (h.ano_faixa || []).includes(selectedGrade)
  );
  
  const geralSkills = bnccHabilidades.filter(h => 
    h.base_origem === "geral" && 
    (h.ano_faixa || []).includes(selectedGrade) && 
    (selectedComponent === "todos" ? true : h.componente === selectedComponent)
  );
  
  // Render Columns
  if (compSkills.length === 0) {
    crossComputacaoContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-info"></i>
        <p>Nenhuma habilidade de Computação mapeada para <strong>${selectedGrade}</strong>.</p>
      </div>
    `;
  } else {
    crossComputacaoContainer.innerHTML = "";
    compSkills.forEach(h => {
      const card = createCrossoverCard(h);
      crossComputacaoContainer.appendChild(card);
    });
  }
  
  if (geralSkills.length === 0) {
    crossGeralContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-info"></i>
        <p>Nenhuma habilidade de <strong>${selectedComponent}</strong> para <strong>${selectedGrade}</strong>.</p>
      </div>
    `;
  } else {
    crossGeralContainer.innerHTML = "";
    geralSkills.forEach(h => {
      const card = createCrossoverCard(h);
      crossGeralContainer.appendChild(card);
    });
  }
}

function createCrossoverCard(h) {
  const div = document.createElement("div");
  div.className = `skill-card origin-${h.base_origem}`;
  div.style.padding = "16px";
  div.style.gap = "10px";
  
  const stageBadge = `<span class="card-badge card-badge-stage" style="font-size:0.65rem;">${h.etapa}</span>`;
  const compBadge = `<span class="card-badge card-badge-comp" style="font-size:0.65rem;">${h.componente}</span>`;
  
  const isChecked = selectedSkills.some(x => x.codigo === h.codigo) ? "checked" : "";
  
  div.innerHTML = `
    <div class="card-select-wrapper" style="top:14px; right:14px;">
      <input type="checkbox" class="card-checkbox" data-code="${h.codigo}" ${isChecked}>
    </div>
    <div class="card-header" style="border-bottom:none; padding-bottom:0; padding-right:24px;">
      <span class="card-code" style="font-size:1rem;">${h.codigo}</span>
      <div class="card-meta-right" style="gap:4px; padding-right:0;">
        ${stageBadge}
        ${compBadge}
      </div>
    </div>
    <div class="card-body">
      <p class="card-desc" style="-webkit-line-clamp: 3; font-size:0.85rem;">${h.descricao}</p>
    </div>
    <div style="font-size: 0.7rem; color: var(--text-secondary); display: flex; align-items:center; gap: 4px;">
      <i class="fa-solid fa-tag" style="color: var(--accent-purple);"></i>
      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
        ${h.objetos_conhecimento && h.objetos_conhecimento.length > 0 ? h.objetos_conhecimento.join(", ") : "N/A"}
      </span>
    </div>
  `;
  
  const checkbox = div.querySelector(".card-checkbox");
  checkbox.addEventListener("change", (e) => {
    e.stopPropagation();
    toggleSkillSelection(h);
  });
  
  checkbox.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  
  div.addEventListener("click", () => {
    showSkillDetail(h);
  });
  
  return div;
}

// Planning Basket Operations
function setupPlanningBasket() {
  basketToggleBtn.addEventListener("click", () => {
    planningBasket.classList.toggle("collapsed");
  });
  
  exportPdfBtn.addEventListener("click", exportSelectionToPdf);
  exportPromptBtn.addEventListener("click", openPromptModal);
  
  copyClipboardBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(promptTextarea.value).then(() => {
      // Show toast
      toastNotification.classList.add("visible");
      setTimeout(() => {
        toastNotification.classList.remove("visible");
      }, 2500);
      promptModal.close();
    }).catch(err => {
      alert("Falha ao copiar: " + err);
    });
  });
}

function toggleSkillSelection(h) {
  const index = selectedSkills.findIndex(x => x.codigo === h.codigo);
  if (index > -1) {
    selectedSkills.splice(index, 1);
  } else {
    selectedSkills.push(h);
  }
  
  // Sync all checkboxes in active views (General Grid and Crossovers)
  document.querySelectorAll(`.card-checkbox[data-code="${h.codigo}"]`).forEach(cb => {
    cb.checked = (index === -1);
  });
  
  renderPlanningBasket();
}

function removeSkillFromBasket(code) {
  const index = selectedSkills.findIndex(x => x.codigo === code);
  if (index > -1) {
    selectedSkills.splice(index, 1);
    
    // Sync checkboxes
    document.querySelectorAll(`.card-checkbox[data-code="${code}"]`).forEach(cb => {
      cb.checked = false;
    });
    
    renderPlanningBasket();
  }
}

function renderPlanningBasket() {
  basketBadgeCount.innerText = selectedSkills.length;
  
  if (selectedSkills.length === 0) {
    basketEmptyMsg.style.display = "block";
    basketItemsListUl.innerHTML = "";
    return;
  }
  
  basketEmptyMsg.style.display = "none";
  basketItemsListUl.innerHTML = "";
  
  selectedSkills.forEach(h => {
    const li = document.createElement("li");
    li.className = "basket-item";
    li.innerHTML = `
      <span class="basket-item-code">${h.codigo}</span>
      <span class="basket-item-desc" title="${h.descricao}">${h.descricao}</span>
      <button class="basket-item-remove" data-code="${h.codigo}"><i class="fa-solid fa-trash-can"></i></button>
    `;
    
    li.querySelector(".basket-item-remove").addEventListener("click", () => {
      removeSkillFromBasket(h.codigo);
    });
    
    basketItemsListUl.appendChild(li);
  });
}

// PDF Print Export Trigger
function exportSelectionToPdf() {
  if (selectedSkills.length === 0) {
    alert("Selecione pelo menos uma habilidade para exportar.");
    return;
  }
  
  // Build dynamic print div section
  const printDiv = document.createElement("div");
  printDiv.id = "print-section";
  
  let html = `
    <div class="print-page">
      <div class="print-header">
        <h1>Auxiliar BNCC — Planejamento Pedagógico</h1>
        <p>Planejamento estruturado contendo as habilidades curriculares selecionadas pelo docente.</p>
        <p style="font-size: 8.5pt; color: #555; margin-top: 6px; font-family: sans-serif;">
          Documento gerado via: <strong>github.com/zolhos/BNCC-prompter</strong>
        </p>
      </div>
  `;
  
  selectedSkills.forEach(h => {
    const objs = (h.objetos_conhecimento || []).join(", ") || "N/A";
    const commentsSection = h.base_origem === "computacao" 
      ? `<strong>Explicação Pedagógica:</strong><br>${h.explicacao_pedagogica || "N/A"}<br><br><strong>Exemplos:</strong><br>${h.exemplos || "N/A"}`
      : `<strong>Comentário:</strong><br>${h.comentario || "N/A"}<br><br><strong>Possibilidades Curriculares:</strong><br>${h.possibilidades_curriculo || "N/A"}`;
      
    html += `
      <div class="print-habilidade-card">
        <div class="print-habilidade-title">
          <span>Código: ${h.codigo}</span>
          <span>${h.componente} (${h.etapa})</span>
        </div>
        <div class="print-habilidade-desc">
          <strong>Diretriz / Descrição:</strong> ${h.descricao}
        </div>
        <div class="print-habilidade-desc" style="margin-top: 10px;">
          ${commentsSection}
        </div>
        <div class="print-habilidade-meta" style="margin-top: 12px;">
          <strong>Ano/Faixa:</strong> ${(h.ano_faixa || []).join(", ")} | 
          <strong>Objetos de Conhecimento:</strong> ${objs} | 
          <strong>Eixo:</strong> ${h.eixo || "N/A"}
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  printDiv.innerHTML = html;
  
  document.body.appendChild(printDiv);
  document.body.classList.add("printing-mode");
  
  // Call native window print (which saves to PDF on Mac/Chrome)
  window.print();
  
  // Cleanup
  document.body.classList.remove("printing-mode");
  document.body.removeChild(printDiv);
}

// Open Prompt Generation Modal
function openPromptModal() {
  if (selectedSkills.length === 0) {
    alert("Selecione pelo menos uma habilidade para gerar o prompt.");
    return;
  }
  
  let skillsText = "";
  selectedSkills.forEach(h => {
    skillsText += `- Habilidade ${h.codigo} (${h.componente} - ${h.etapa}): "${h.descricao}"\n`;
    if (h.objetos_conhecimento && h.objetos_conhecimento.length > 0) {
      skillsText += `  Objetos de Conhecimento: ${h.objetos_conhecimento.join(", ")}\n`;
    }
    if (h.eixo) {
      skillsText += `  Eixo Temático: ${h.eixo}\n`;
    }
    skillsText += "\n";
  });
  
  const prompt = `Como um especialista em design instrucional e metodologias ativas para a Educação Básica, elabore um plano de atividade/aula interdisciplinar extremamente útil, robusto e de aplicação prática imediata.

Você deve obrigatoriamente integrar e combinar de forma complementar as habilidades da BNCC listadas abaixo em uma única proposta didática coerente, fazendo uso explícito de seus códigos e de suas descrições no decorrer do planejamento:

[HABILIDADES DA BNCC SELECIONADAS]
${skillsText}
Instruções estritas de geração (Siga sem exceções):
1. COMECE DIRETAMENTE COM A RESPOSTA. Não inclua qualquer preâmbulo, introdução conversacional (como "Claro! Aqui está...", "Com certeza!"), saudações ou comentários finais de encerramento. Queremos apenas o conteúdo estruturado.
2. O plano gerado deve ser altamente prático e útil para o professor, contendo a seguinte estrutura:

- **Tema da Atividade Integrada**: Título pedagógico e lúdico.
- **Objetivos de Aprendizagem**: O que os alunos farão e aprenderão de forma concreta.
- **Desenvolvimento da Aula (Passo a Passo)**: Metodologia de aplicação real. Se houver habilidades de computação, diferencie claramente o momento desplugado (sem telas) do momento plugado (com uso de dispositivos).
- **Avaliação e Rubrica**: Critérios para avaliar o aprendizado dos estudantes vinculados aos códigos e objetivos propostos.`;

  promptTextarea.value = prompt;
  promptModal.showModal();
}

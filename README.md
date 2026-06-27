# BNCC Prompter

Este projeto oferece uma interface dinâmica e moderna para consulta, filtragem e cruzamento interdisciplinar de habilidades e competências da **BNCC (Base Nacional Comum Curricular)** e da **BNCC da Computação**.

## 🌐 Demonstração Online

O aplicativo está publicado e pode ser acessado e utilizado diretamente no navegador em:
👉 **[https://zolhos.github.io/BNCC-prompter/](https://zolhos.github.io/BNCC-prompter/)**

---

## Propósito do Projeto

O **BNCC Prompter** foi criado para:
1. **Facilitar a Consulta**: Oferecer uma navegação fluida pelos eixos, anos letivos, etapas de ensino e componentes curriculares das habilidades da BNCC e Computação.
2. **Integração Interdisciplinar**: Permitir o cruzamento prático entre habilidades de Computação e componentes tradicionais (como Matemática e Língua Portuguesa) do mesmo ano letivo, auxiliando professores na elaboração de planos de aula integrados.
3. **Escalonamento para IAs (Prompter)**: Permitir a seleção de um conjunto de habilidades para exportação em PDF ou geração de prompts otimizados e prontos para serem usados em Grandes Modelos de Linguagem (LLMs, como Gemini, ChatGPT, Claude) para a criação automatizada de atividades pedagógicas.

---

## Status do Projeto

O projeto está em **fase de desenvolvimento**.

**Autor / Desenvolvedor**: Diego Gonçalves

---

## Estrutura do Repositório

```
├── .github/workflows/                    # Integração e Deploy Contínuo (GitHub Actions)
│   └── deploy.yml                        # Deploy automático do WebApp para o GitHub Pages
│
├── data/                                 # Arquivos de Desenvolvimento e Dados Brutos
│   ├── raw/                              # Planilhas Excel e JSONs originais (Ignorado localmente)
│   │   ├── BNCC_Completa.json
│   │   ├── BNCC_Computacao_Rica.json
│   │   ├── BNCC_COMPUTAÇÃO_BY_ZOLHOS.xlsx
│   │   └── BNCC_Ensino Fundamental_by_ZLHS.xlsx
│   └── scripts/                          # Scripts de limpeza e unificação
│       └── optimize_jsons.py
│
└── public/                               # Arquivos do WebApp de Produção (Publicado online)
    ├── index.html                        # Interface do usuário (SPA)
    ├── style.css                         # Estilização premium (Glassmorphism / Print styles)
    ├── app.js                            # Lógica interativa, seleção e exportações
    ├── BNCC_Completa_Otimizada.json      # Dados gerais otimizados
    └── BNCC_Computacao_Otimizada.json    # Dados de computação com competências integradas
```

## Como Executar Localmente

Você pode servir a pasta `public/` usando qualquer servidor estático simples. Exemplo com Python:

```bash
cd public
python3 -m http.server 8000
```

Abra o navegador em [http://localhost:8000](http://localhost:8000).

# MinhaCentral

Aplicação web de gestão pessoal e profissional em React, TypeScript e Vite. Reúne sete módulos em uma única interface com tema claro/escuro, persistência local no navegador (`localStorage`) e controles customizados no mesmo padrão visual.

## Módulos

| Módulo | Arquivo | O que faz |
| --- | --- | --- |
| Início | `src/modules/DashboardHome.tsx` | Painel em grade Bento com resumo de finanças, agenda, conteúdo, tarefas, hábitos e segundo cérebro, com reordenação por arraste. |
| Tarefas | `src/modules/TasksModule.tsx` | Visões em Semana, Kanban, Lista e Calendário, filtros por período, prioridade e status, subtarefas e vínculo com projetos. |
| Hábitos e Saúde Mental | `src/modules/HabitsModule.tsx` | Matriz semanal, progresso mensal, mapa de constância e edição de rotinas. Sugere o ícone da biblioteca `iconoir-react` conforme o nome digitado, com catálogo visual de 44 ícones e seletor de cor personalizada. Inclui check-in diário de saúde mental (humor, tags de estado, energia e reflexão) com histórico interativo dos 7 dias. |
| Segundo Cérebro | `src/modules/SecondBrainModule.tsx` | Captura rápida de ideias e URLs, visualização em Grade ou Lista, filtros por categoria, tags e favoritos, fixação, exclusão direta e vínculos com projetos, tarefas e conteúdos. |
| Financeiro | `src/modules/FinanceModule.tsx` | KPIs do mês, gráficos de fluxo e receitas x despesas, lançamentos, orçamento por categoria, assinaturas, metas financeiras e cartões interativos com modelos de bancos brasileiros e opção personalizada. Blocos e colunas são reordenáveis por arraste. |
| Agenda | `src/modules/CalendarModule.tsx` | Calendário unificado (Mês, Semana e Dia) combinando compromissos, tarefas, lançamentos pendentes e publicações agendadas. |
| Conteúdo | `src/modules/ContentModule.tsx` | Pipeline editorial em etapas, calendário de publicações, registro de métricas por plataforma e geração de tarefas a partir de uma pauta. |

## Interface e controles

Todos os ícones vêm de `iconoir-react` (`strokeWidth: 1.6`). O aplicativo não usa pickers nativos do navegador: seleção, data, hora e cor rodam respectivamente em `CustomSelect`, `CustomDatePicker`, `CustomTimePicker` e `CustomColorPicker`, adaptados ao modo claro e escuro.

A reordenação por arraste usa o hook `useDraggableOrder`, que grava a ordem escolhida localmente por módulo.

Atalhos de teclado disponíveis em qualquer tela:

- `Ctrl + K` (ou `Cmd + K`) abre a busca global.
- `1` a `7` alternam entre os módulos na ordem da barra superior.
- `Esc` fecha modais e popovers abertos.

## Stack

- React 19 e TypeScript
- Vite 8 e Tailwind CSS v4 (`@tailwindcss/vite`)
- Recharts para gráficos financeiros, de hábitos e métricas
- Iconoir React (`iconoir-react`)
- Oxlint (`oxlint`)

## Estrutura do projeto

```text
src/
├── components/
│   ├── Button.tsx              # Botões padronizados (primary, secondary, danger)
│   ├── CardFolder.tsx          # Cartões financeiros interativos e modelos de bancos
│   ├── CustomColorPicker.tsx   # Seletor HSV/HEX customizado
│   ├── CustomDatePicker.tsx    # Calendário customizado em pt-BR
│   ├── CustomSelect.tsx        # Dropdown customizado
│   ├── CustomTimePicker.tsx    # Seletor de hora/minuto customizado
│   ├── HeroLandscape.tsx       # Banner do painel inicial
│   └── QuickModals.tsx         # Criação rápida, busca global, alertas e perfil
├── context/
│   └── AppContext.tsx          # Estado global e persistência (minhacentral_state_v2)
├── data/
│   └── seedData.ts             # Estado inicial limpo (sem dados fictícios)
├── hooks/
│   └── useDraggableOrder.tsx   # Drag-and-drop com ordem persistida
├── modules/                    # Os 7 módulos principais da aplicação
├── types/
│   └── index.ts                # Tipagens TypeScript
└── utils/
    ├── format.ts               # Formatação de datas (pt-BR), moeda (BRL) e semanas
    ├── habitIcons.ts           # Catálogo de 44 ícones Iconoir e sugestão automática
    └── url.ts                  # Sanitização de URLs externas (http/https)
```

## Como executar

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev
```

A aplicação sobe por padrão em `http://localhost:5173`.

### Scripts disponíveis

| Comando | Ação |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Executa checagem de tipos (`tsc -b`) e gera o bundle em `dist/` |
| `npm run preview` | Serve localmente o build gerado em `dist/` |
| `npm run lint` | Roda a análise estática com `oxlint` |

## Persistência e segurança

Os dados ficam salvos localmente no navegador sob a chave `minhacentral_state_v2`, e o aplicativo inicia vazio por padrão. Links externos cadastrados em notas e conteúdos passam por `sanitizeHttpUrl` (`src/utils/url.ts`), bloqueando protocolos como `javascript:` e `data:`.

A hidratação do `localStorage` valida estrutura e tipos antes de aplicar o estado, e a opção de limpar todos os dados exige confirmação explícita. O relatório de auditoria de segurança do projeto está em `docs/security-audit/relatorio-auditoria-seguranca.pdf`.

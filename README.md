# Trello — Template de Rotina Superprodutiva (Recreação Oficial)

Este projeto é a recriação completa, interativa e de alta fidelidade do **Trello: Template de Rotina Superprodutiva**, desenvolvido pelo **Laboratório de Interação — Um Cara Caramelo (Luiz)**.

---

## 1. Processo de Análise e Engenharia Reversa (MCP REA)

A reconstituição utilizou o protocolo de evidências e deduções do **MCP REA**:

1. **Identificação do Alvo Canônico**:
   - Localização no sistema do artefato original: `Template Trello.pdf` (localizado em `Downloads`).
   - Leitura das páginas e OCR revelando a URL pública oficial do quadro: `https://trello.com/b/DztdNFK4`.
2. **Extração e Preservação de Dados**:
   - Extração da especificação JSON completa via API pública do Trello.
   - 8 Colunas canônicas: `IMPORTANTE`, `SEGUNDA-FEIRA`, `TERÇA-FEIRA`, `QUARTA-FEIRA`, `QUINTA-FEIRA`, `SEXTA-FEIRA`, `SÁBADO`, `DOMINGO`.
   - 108 cartões detalhados contendo horários exatos (06:00 às 22:00), categorias, etiquetas e capas.
   - Download de todos os assets originais (fundo da galáxia e banners ilustrados de cada dia da semana) para `assets/`, permitindo execução **100% offline**.
3. **Registro de Obrigações de Reconstituição no REA**:
   - Criação de residual unknown (`unk_b96d10ff...`) rastreando as dependências de layout, rotina e fidelidade visual.

---

## 2. Funcionalidades da Aplicação

### 🎨 4 Modos de Visualização Integrados
1. **Quadro (Kanban)**:
   - Visualização tradicional em colunas com banners originais.
   - **Drag & Drop** fluido: reordene cartões na mesma lista ou mova entre dias da semana com indicador visual de destino.
   - Criação inline de novos cartões e listas.
   - Menu contextual de cada lista (renomear, marcar todas como feitas, arquivar).
2. **Agenda Semanal (Linha do Tempo)**:
   - Grade semanal cronológica (06:00 às 22:00).
   - Mapeia automaticamente cada atividade para seu respectivo bloco de horário.
   - Clique direto em qualquer bloco para abrir o modal de detalhes.
3. **Tabela / Planilha**:
   - Visão consolidada de todas as 108 tarefas.
   - Filtro de busca instantâneo e ordenação.
   - Checkbox rápido para marcar tarefas concluídas.
   - Botão para **Exportar em CSV**.
4. **Métricas & Equilíbrio de Rotina**:
   - Painel analítico de distribuição de energia.
   - Contadores de Atividades-Chave (Trabalho Estratégico), Autocuidado, Lazer e Necessidades Básicas.
   - Gráfico de barras de carga horária por dia da semana.

### 🗂️ Modal Completo do Cartão
- Título editável em tempo real.
- Seletor de lista de destino (mover).
- Gerenciador de etiquetas (tags coloridas com suporte a cores oficiais).
- Editor de descrição com persistência.
- Sistema de **Checklists** com barra de progresso percentual dinâmica.
- Registro de comentários e notas de execução.
- Botão "Marcar como Concluído" (com tachado e badge visual verde).
- Ações: Duplicar / Excluir cartão.

### 🔍 Sistema de Filtros Avançados
- Busca global no topo (por palavra-chave).
- Barra de filtros retrátil por etiquetas (Necessidades básicas, Atividade-chave, Autocuidado, Lazer, etc.) e status (Todas, Pendentes, Concluídas).
- Contador badge de filtros ativos.

### 💾 Persistência & Backup
- **LocalStorage**: Todas as alterações feitas são salvas automaticamente no navegador.
- **Exportar JSON**: Permite fazer backup do quadro completo a qualquer momento.
- **Importar JSON**: Permite carregar backups previamente salvos.
- **Restaurar Template Original**: Botão para resetar o quadro de volta à estrutura canônica de Luiz.

---

## 3. Como Executar Localmente

Como o projeto é construído em padrões web modernos puros (HTML5, CSS3, ES6 Vanilla), você pode abri-lo de duas formas:

### Opção 1: Servidor HTTP Local (Recomendado)
O servidor já está ativo na porta `8080`:
```bash
# Abra em seu navegador:
http://localhost:8080
```

Se desejar iniciar manualmente em outra sessão:
```bash
cd "d:\meus documentos\Trello"
python -m http.server 8080
```

### Opção 2: Abertura Direta
Abra o arquivo `index.html` com dois cliques ou arraste-o para o navegador (Chrome, Edge, Firefox, Brave, Safari).

---

## 4. Estrutura de Arquivos

```
d:\meus documentos\Trello\
├── assets\
│   ├── board_background.png         # Fundo galáxia original do quadro
│   ├── banners.json                 # Mapeamento dos banners por lista
│   └── banner_*.png                 # 8 Banners ilustrados das colunas
├── index.html                       # Estrutura HTML5 da aplicação
├── style.css                        # Estilos refinados com tokens Caramelo e Trello
├── app.js                           # Motor reativo de estado, Drag & Drop e views
├── boardData.js                     # Base de dados canônica inicial (108 cartões)
├── trello_board_full.json           # Dump bruto original da API do Trello
├── board_summary.json               # Resumo estruturado das listas e cartões
├── analyze_trello_full.py           # Script analítico REA
├── download_assets.py               # Script de download de assets offline
└── README.md                        # Documentação do projeto
```

---

*Desenvolvido em alinhamento com a filosofia: "Menos ferramenta. Mais sistema."*

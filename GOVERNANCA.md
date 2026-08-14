# Governança do Produto — CX Journey Mapper

> Backlog de épicos e histórias de usuário deste repositório, que hoje contém **dois protótipos**: o CX Journey Mapper (EP1–EP15, pesquisa AS-IS — derivado de `especificacao_projeto_customer_journey.docx`, confrontado com `app.jsx` / `prototype.html` / `DATA_MODEL.md`) e o Portal do Consultor (EP16, visão de produto prescritiva — derivado de `Portal/EPICO_PORTAL_CONSULTOR.md`, confrontado com o código em `Portal/`). Serve como ponto único de verdade antes de evoluir qualquer um dos dois: o que já existe, o que é parcial e o que ainda não foi construído.

## Como usar este documento

- Cada história tem um **status** e, quando implementada, uma referência de código (`arquivo:linha`) para verificação rápida — não confie cegamente no status ao longo do tempo, confira o código antes de planejar em cima dele.
- Épicos estão ordenados aproximadamente pela ordem em que foram construídos, não por prioridade. A seção final (["Priorização sugerida para o próximo ciclo"](#priorização-sugerida-para-o-próximo-ciclo)) indica por onde começar.
- Ao fechar uma história nova, atualize o status aqui — este arquivo só tem valor se for mantido junto com o código.

**Legenda de status:** ✅ Implementado · ⚠️ Parcial · ❌ Não implementado

---

## EP1 — Mapeamento de Jornada (Customer Journey Map)

**US1.1** — Como pesquisador CX, quero criar uma jornada a partir de uma fonte (entrevista, transcrição ou analytics) para registrar o AS-IS do cliente.
✅ Implementado para fonte `interview`. ⚠️ Parcial para `transcript`/`analytics`: opção aparece no modal mas fica desabilitada ("em breve").
→ `app.jsx:658-720` (`NewJourneyModal`), `app.jsx:791-810` (`handleCreateJourney`)

**US1.2** — Como pesquisador, quero visualizar a jornada como mapa por macro-etapas coloridas, com canal, envolvidos, sentimento e oportunidade de MVP por coluna.
✅ Implementado.
→ `app.jsx:91-246` (`JourneyMapTab`, `JourneyMapColumnCells`)

**US1.3** — Como pesquisador, quero que o sentimento de cada etapa seja classificado automaticamente a partir do texto de emoção/citação.
✅ Implementado como heurística de keyword matching em PT-BR (não é NLP real — ver débito técnico).
→ `app.jsx:6-26` (`sentiment`, `sentimentDetail`)

**US1.4** — Como pesquisador, quero abrir um painel lateral com as dores de uma macro-etapa ao clicar nela no mapa.
✅ Implementado.
→ `app.jsx:624-656` (`PainsPanel`)

## EP2 — Dados da Jornada / Evidências (Journey Data)

**US2.1** — Como pesquisador, quero ver todas as etapas e dores em tabelas ordenáveis para auditar os dados brutos.
✅ Implementado.
→ `app.jsx:248-348` (`DataTable`, `JourneyDataTab`)

**US2.2** — Como pesquisador, quero anexar evidências (transcrições, gravações, documentos, imagens) diretamente a uma etapa ou dor.
❌ Não implementado. Requisito funcional explícito da spec ("Upload de Arquivos", seção 3). O schema não tem nem um campo de referência para etapas/dores (só o Benchmark tem `screenshotRef`, e mesmo esse é texto livre, sem upload real).

## EP3 — Service Blueprint

**US3.1** — Como pesquisador, quero ver a camada operacional simples (frontstage/backstage) de cada etapa.
✅ Implementado.
→ `app.jsx:350-387` (`ServiceBlueprintTab`)

**US3.2** — Como pesquisador, quero um blueprint visual estilo NN/g com linhas de interação e de visibilidade entre frontstage/backstage.
✅ Implementado.
→ `app.jsx:463-501` (`BlueprintVisualTab`)

## EP4 — Benchmark de Concorrentes

**US4.1** — Como pesquisador, quero registrar e comparar fluxos de concorrentes (o que funciona bem/mal, o que copiar/evitar), agrupados por concorrente.
✅ Implementado.
→ `app.jsx:503-536` (`BenchmarkTab`)

**US4.2** — Como pesquisador, quero anexar prints de tela como evidência visual de um benchmark.
⚠️ Parcial — campo `screenshotRef` existe no schema (`DATA_MODEL.md:128`), mas não há upload nem preview de imagem na UI; hoje seria só um texto de referência.

## EP5 — Priorização de MVP

**US5.1** — Como pesquisador/PM, quero pontuar jornadas candidatas por valor × esforço-risco e ver uma recomendação (Priorizar/Avaliar/Postergar), ordenadas pelo score final.
✅ Implementado.
→ `app.jsx:538-577` (`PrioritizationTab`)
⚠️ Atenção: a fórmula de `effortRiskScore` está marcada no próprio `DATA_MODEL.md:154` como "ajustar fórmula exata na implementação" — vale validar com quem definiu a planilha original antes de tomar decisões de produto em cima desse ranking.

## EP6 — Síntese Executiva

**US6.1** — Como stakeholder, quero ler um resumo executivo da jornada (tese central, forças, lacunas, recomendação de MVP, citações-chave).
✅ Implementado.
→ `app.jsx:579-622` (`SynthesisTab`)

## EP7 — Busca e Filtros

**US7.1** — Como pesquisador, quero buscar por texto livre e filtrar por macro-etapa, refletindo em todas as abas simultaneamente.
✅ Implementado.
→ `app.jsx:856-873` (busca/filtro no header), `app.jsx:741-756` (lógica de filtro)

## EP8 — Persistência e Portabilidade de Dados

**US8.1** — Como pesquisador, quero exportar a jornada para um arquivo `.json` e importar depois para continuar o trabalho, sem depender de servidor.
✅ Implementado.
→ `app.jsx:764-789` (`handleExport`, `handleImportFile`)

**US8.2** — Como usuário, quero que meu trabalho seja salvo automaticamente, sem precisar lembrar de exportar.
❌ Não implementado — decisão consciente de MVP (`DATA_MODEL.md` §1). Estado vive só em memória do navegador: recarregar a página sem ter exportado antes perde todo o trabalho não salvo.

## EP9 — Versionamento e Histórico de Jornada 🔴 crítico

> Este é o **problema #2 citado na spec original** como motivação central do projeto ("atualizar uma jornada existente é trabalhoso porque não há versionamento nem histórico de mudanças... o time perde o rastro de como e por que a jornada evoluiu"). É o maior gap entre a spec e o que foi construído até agora.

**US9.1** — Como pesquisador, quero ver o histórico de alterações de uma jornada (o quê mudou, quem mudou, quando).
❌ Não implementado.

**US9.2** — Como pesquisador, quero comparar duas versões da mesma jornada lado a lado.
❌ Não implementado.

→ Listado explicitamente como fora de escopo do MVP em `DATA_MODEL.md` §6, com a nota "será necessário assim que sair do protótipo — é uma das dores originais do projeto".

## EP10 — Multiusuário e Permissões

**US10.1** — Como admin, quero convidar membros do time para colaborar na mesma jornada, com papéis de visualização/edição/comentário.
❌ Não implementado — fora de escopo do MVP (`DATA_MODEL.md` §1, §6), depende de backend/autenticação que ainda não existe.

## EP11 — Relatórios e Exportação Visual

**US11.1** — Como stakeholder, quero exportar a jornada como PDF, PNG ou apresentação para compartilhar fora da ferramenta.
❌ Não implementado — hoje o único export é `.json` (dado bruto para reimportar no próprio app, não um artefato visual para compartilhar). Requisito funcional explícito da spec (seção 3, "Relatórios e Exportação").

## EP12 — Geração de Jornada por Transcrição (IA)

**US12.1** — Como pesquisador, quero colar ou subir a transcrição de uma entrevista e ter a jornada (etapas, emoções, dores) gerada automaticamente.
❌ Não implementado — opção existe no modal "Nova jornada" mas fica desabilitada ("em breve"). O schema de `JourneyStage` já foi desenhado para suportar essa origem sem mudanças estruturais.
→ `app.jsx:666-671` (opção desabilitada em `NewJourneyModal`)

## EP13 — Integração com Web Analytics (GA4)

**US13.1** — Como pesquisador, quero conectar uma propriedade GA4 e ter etapas de funil preenchidas automaticamente com métricas quantitativas (usuários, drop-off, tempo de engajamento).
❌ Não implementado, nem como mock. O schema (`AnalyticsJourneyConfig`, `StageAnalytics` em `DATA_MODEL.md` §3) está pronto e a própria spec recomenda começar com fixtures estáticas mockadas — mas nem isso foi feito ainda: não há nenhuma jornada de exemplo com `source: 'analytics'` no `seed-data.json`.
→ Opção também desabilitada em `app.jsx:672-677`. Integração real vai exigir função serverless (proxy OAuth/service account) — GA4 Data API não pode ser chamada direto do browser.

## EP14 — Infraestrutura e Deploy

**US14.1** — Como time, quero o protótipo hospedado no Vercel para compartilhar um link em vez de um arquivo HTML local.
⚠️ Parcial (atualizado 2026-07-22). O repositório já está versionado e publicado no GitHub (`github.com/mrcassadori/smartjourney`, branch `main`) — o que resolve a base pro deploy contínuo. Existe um projeto Vercel vinculado localmente (`.vercel/repo.json` → projeto `smartjourney`) e um `vercel.json` que redireciona a raiz (`/`) para `prototype.html` (Jornada). **Ainda pendente**: confirmar se o deploy automático (Git → Vercel) está de fato ativo e rodando, e decidir como expor o Portal em produção (hoje a raiz aponta só pra Jornada; o Portal viveria em `/Portal/index.html`). Obs.: os dois vídeos de entrevista em `Entrevistas/` (~1.3GB) ficaram fora do git de propósito (limite de tamanho do GitHub); se precisarem ser versionados, o caminho é Git LFS.

## EP15 — Insights de Pesquisa (síntese entre jornadas)

> Diferente dos demais épicos, esta aba não é por jornada — ela sintetiza as duas entrevistas (Nathalia/Åpen Capital e Lucas/Ticker Investimentos) num único painel executivo, independente de qual jornada está selecionada no seletor do header.

**US15.1** — Como stakeholder, quero um cabeçalho executivo com o contexto da pesquisa (nº de entrevistas, perfis, plataformas comparadas, foco da análise) e uma frase-síntese de abertura.
✅ Implementado.
→ `app.jsx:InsightsTab` (bloco de cards de contexto + blockquote de síntese)

**US15.2** — Como stakeholder, quero ver o sentimento geral da pesquisa como uma escala visual (estabilidade, profundidade analítica, autonomia, competitividade, potencial) e as leituras individuais por entrevistado.
✅ Implementado.
→ `SENTIMENT_SCALE`, barras coloridas por semântica (força atual / lacuna atual / tendência / potencial futuro)

**US15.3** — Como stakeholder, quero 5 cards de insight, cada um com "o que apareceu", evidência e implicação para o produto.
✅ Implementado.
→ `INSIGHT_CARDS`

**US15.4** — Como stakeholder, quero um ranking de dores (frequência, impacto, perfil mais afetado, severidade) e uma matriz de priorização de oportunidades (valor, impacto no cliente, esforço, prioridade 1-8).
✅ Implementado, reaproveitando o componente `DataTable` já existente (ganho real: as duas tabelas ficam ordenáveis por coluna, ao contrário da versão original em HTML estático).
→ `PAIN_RANKING`, `PRIORITY_MATRIX`

**US15.5** — Como stakeholder, quero ver a jornada candidata recomendada para o MVP e o fluxo de etapas sugerido.
✅ Implementado.
→ `JOURNEY_FLOW_STEPS`

Histórico: esta aba nasceu como um arquivo HTML standalone (`insights.html`) e foi movida para dentro do `prototype.html`/`app.jsx` como aba nativa, a pedido do usuário, para evitar um terceiro artefato de dados fora do app principal.

---

## EP16 — Portal do Consultor (Workspace de Gestão e Atendimento)

> Segundo protótipo deste repositório, distinto do CX Journey Mapper: enquanto EP1–EP15 documentam a *pesquisa* (jornada AS-IS), o Portal é a materialização *prescritiva* da visão de produto derivada dela — um workspace mockado para o consultor. Vive em `Portal/`, com seu próprio design system (`Portal/design.md`, tokens do Inter) e sua própria fonte de histórias (`Portal/EPICO_PORTAL_CONSULTOR.md`, 17 histórias + 1 enabler). Implementado como app React separado, sem build step, usando Babel standalone multi-arquivo (JSX real em arquivos `.jsx`, transformado no navegador) — abordagem diferente do `React.createElement` manual do `app.jsx` da Jornada, adotada deliberadamente para não repetir a dívida técnica já registrada abaixo.
>
> Os **três releases do épico estão construídos**: Release 1 (fundamentos, US-01 a US-09 + EN-01), Release 2 (recomendação e produtividade, US-10 a US-13) e Release 3 (autonomia e expansão, US-14 a US-17). As 17 histórias + o enabler EN-01 de `Portal/EPICO_PORTAL_CONSULTOR.md` estão implementadas — ver detalhamento por história abaixo, incluindo os recortes conscientes de escopo (⚠️) feitos em histórias P2 estratégicas (US-16/US-17).

**US-01** — Como consultor, quero acessar um ambiente profissional separado da minha conta pessoal, com perfil/escritório/escopo visíveis e um seletor de cenário sem autenticação real.
✅ Implementado, incluindo o cenário "sem vínculo" (critério 5) e o estado de "sem permissão" por item de menu (critério 6, parcial — timeout e autenticação reforçada não têm tela dedicada, só o texto no rodapé).
→ `Portal/components/Shell.jsx` (`ProfileSwitcher`, `Sidebar`), `Portal/data/mock-data.js` (`profiles`)
Nota de UX — **menu achatado (2026-08-10, versão vigente)**: a navegação lateral (`NAV_ITEMS` em `Shell.jsx`) foi **refeita para um menu plano de 8 itens diretos** (Visão geral, Clientes, Produtos, Recomendações, Ordens, Relatórios, Operações, Suporte), sem flyout/acordeão — decisão do usuário ao iniciar o épico do Workspace do Cliente, alinhando o rail à spec de wealth management. Cada item navega direto (`NavRow`); "Recomendações" aponta para o Simulador (`route: 'simulacoes'`, `permKey: 'recommendations'`) e a Cesta/basket (`recommendations`) virou entrada secundária; "Relatórios" segue `comingSoon`. Rodapé (`NAV_FOOTER_ITEMS`: Favoritos/Ajuda/Configurações + `ProfileSwitcher`) mantido. Isso **substitui** o menu anterior de 7 grupos com flyout de duas colunas (rail `w-56` com painel `fixed left-56`, clique-para-abrir, dois tons de laranja) que vigorou de 2026-07-21 a 07-22 — preservado no histórico do git.

**US-02** — Como consultor/gestor, quero uma home com indicadores, pendências e alertas priorizados da base, com filtros e atalhos.
✅ Implementado, com adições de 2026-07-22 inspiradas em ferramentas de mercado (XP/BTG/Avenue, referências do usuário): gráfico de barras "Captação x Retirada por dia" (reage ao filtro de período 7/30d) e widget "Top clientes com saldo disponível" (ranking clicável), ao lado dos cards de indicador que já existiam.
→ `Portal/pages/HomePage.jsx`

> **Gráficos (Chart.js)** — 2026-07-22 foi adicionada a lib **Chart.js** via CDN (mesmo padrão zero-build do resto do Portal) com um wrapper React reutilizável `Portal/components/ChartCanvas.jsx` (cuida do ciclo de vida do gráfico: cria/destrói no mount/unmount e recria quando os dados mudam). Cores dos gráficos reaproveitam os tokens do Inter via `ASSET_CLASS_HEX` em `helpers.js`. Usado hoje no gráfico de fluxo do Home (US-02) e no doughnut de composição da ficha do cliente (US-04).

**US-03** — Como profissional, quero buscar clientes por nome, CPF, e-mail, telefone ou conta, tolerando formatação.
✅ Implementado, incluindo estado vazio com CTA de "solicitar vínculo" (simulado).
→ `Portal/pages/ClientsListPage.jsx`, `Portal/lib/helpers.js` (`onlyDigits`)

**US-04** — Como consultor, quero uma ficha 360º do cliente com abas e linha do tempo auditável.
✅ Implementado: Visão geral (com sócios/representantes para PJ — US-16), Carteira, Movimentações, Ordens, Documentos, Recomendações, Banking (US-14) e Internacional (US-17). Adição de 2026-07-22 (inspirada nas fichas da XP/BTG): o cabeçalho ganhou um grid de identidade (CPF/CNPJ mascarado, telefone, e-mail, **perfil de risco** como pill — novo campo `riskProfile` por cliente — saldo disponível, caixa investível, validade do suitability), e a aba Visão geral abre com um **gráfico doughnut de composição da carteira por classe** (`AssetClassBar` via Chart.js). Deliberadamente mais enxuto que as referências: campos de compliance/back-office (SOW, PL declarado, fee based, limites de política, status de token/app) ficaram de fora por decisão de simplicidade.
→ `Portal/pages/ClientProfilePage.jsx`, `Portal/data/mock-data.js` (`riskProfile`), `Portal/lib/helpers.js` (`RISK_PROFILE_META`)

**US-05** — Como consultor/alocador, quero a carteira agrupada por classe/produto/emissor/vencimento, com destaque de concentração e vencimento próximo.
✅ Implementado, incluindo exportação simulada (`.json` local).
→ `Portal/pages/ClientProfilePage.jsx` (`PortfolioTab`)

**US-06** — Como consultor, quero entender a origem do saldo e uma estimativa de caixa investível, sem tratá-la como autorização automática.
✅ Implementado.
→ `Portal/pages/ClientProfilePage.jsx` (`CashTab`)

**US-07** — Como consultor, quero uma central de alertas priorizados, filtrável, com agrupamento de repetidos e mudança de status.
✅ Implementado.
→ `Portal/pages/AlertsPage.jsx`

**US-08** — Como profissional, quero acompanhar onboarding/ativação/pendências em lista com linha do tempo, reenvio de comunicação e cópia de instruções simulados.
✅ Implementado.
→ `Portal/pages/OnboardingPage.jsx`

**US-09** — Como consultor/alocador, quero uma central de ordens com todos os status pedidos, linha do tempo, erro com motivo/ação e reenvio/cancelamento simulados.
✅ Implementado, incluindo checagem de permissão por perfil (Daily Banker não opera ordens neste cenário).
→ `Portal/pages/OrdersPage.jsx`

**EN-01** — Base sintética consistente cobrindo cenários de sucesso, vazio, erro, bloqueio e pendência.
✅ Implementado: ~14 clientes PF/PJ, posições, movimentações, alertas, onboarding e ordens fictícios cobrindo os estados pedidos. ⚠️ Não implementado o painel genérico de simulação de indisponibilidade/latência configurável — os estados nascem dos próprios dados, não de um toggle de "fault injection" (decisão consciente de escopo, ver débito técnico abaixo).
→ `Portal/data/mock-data.js`

**US-10** — Como consultor, quero navegar por um hub centralizado de produtos com busca, filtros e elegibilidade contextual por cliente.
✅ Implementado: busca por nome/emissor/indexador; filtros de classe, risco e disponibilidade; seletor de cliente para checar elegibilidade em contexto; drawer de detalhe com docs/riscos/custos/público elegível; "adicionar à proposta" a partir do catálogo. ⚠️ Filtros de prazo/liquidez do critério 3 não têm campo dedicado (ficam visíveis no detalhe, não são filtros de busca).
→ `Portal/pages/ProductsPage.jsx`, `Portal/data/mock-data.js` (`products`, 19 itens cobrindo as 10 classes)

**US-11** — Como consultor, quero montar e simular uma carteira proposta para um cliente, com validações.
✅ **Reconstruído como jornada consultiva de 14 telas (2026-08-09/10)** — ver bloco "Jornada do Simulador" abaixo. O `SimulatorPage.jsx` de 2 abas foi aposentado.
→ `Portal/pages/SimulationsListPage.jsx`, `SimulatorJourney.jsx`, `SimulatorBuild.jsx`, `SimulatorDashboard.jsx`, `SimulatorReport.jsx`, `Portal/lib/analytics.js`

**US-12** — Como consultor, quero comparar a carteira atual com a proposta e gerar um relatório white-label.
✅ **Reconstruído** dentro da jornada (aba Comparação do dashboard + telas Relatório/Compartilhar). Ver bloco "Jornada do Simulador" abaixo.
→ `Portal/pages/SimulatorDashboard.jsx` (aba Comparação), `SimulatorReport.jsx`

**US-13** — Como alocador/consultor autorizado, quero criar recomendações em lote (basket) para múltiplos clientes elegíveis.
✅ Implementado: escolha de produto → seleção em massa com filtro por segmento/caixa disponível → validação individual de elegibilidade/limite/aplicação mínima com inelegíveis destacados e bloqueados → prévia consolidada → envio simulado. Restrito a perfis com `canCreateBasket` (Alocador e Administrador neste cenário). Rastreabilidade por cliente/item reaproveita a Central de Ordens: cada envio cria uma ordem por cliente com um `basketId` comum, em vez de uma tela paralela de acompanhamento.
→ `Portal/pages/RecommendationsPage.jsx` (`BasketTab`), `Portal/app.jsx` (`sendBasket`)

**US-14** — Como Daily Banker ou profissional autorizado, quero consultar e executar serviços operacionais permitidos (reset de credencial, bloqueio preventivo, consulta de documentos, serviços bancários), com autenticação reforçada e trilha de auditoria.
✅ Implementado, incluindo o princípio de menor privilégio (critério 3): perfis com `canOperateDirectly` (Daily Banker/Administrador) executam direto com uma etapa extra de confirmação de identidade simulada; os demais perfis abrem uma solicitação para um deles concluir, em vez de executar na hora.
→ `Portal/pages/ClientProfilePage.jsx` (`BankingTab`), `Portal/pages/OperationsPage.jsx`, `Portal/data/mock-data.js` (`serviceRequests`)

**US-15** — Como profissional da consultoria, quero abrir e acompanhar um chamado de suporte a partir do cliente, de uma ordem, de onboarding ou de um serviço operacional, com histórico e avaliação da resolução.
✅ Implementado: botão "Abrir chamado" contextual na ficha do cliente, no detalhe de ordem, no drawer de onboarding e no drawer de serviço operacional, todos abrindo o mesmo modal com o contexto pré-preenchido; thread de mensagens simulada; avaliação por estrelas ao marcar como resolvido.
→ `Portal/components/NewTicketModal.jsx`, `Portal/pages/SupportPage.jsx`, `Portal/data/mock-data.js` (`tickets`)

**US-16** — Como consultor autorizado, quero visualizar e operar contas PJ e holdings vinculadas à consultoria.
⚠️ Parcial, proporcional ao nível de detalhe que a própria spec dá a esta história (P2 estratégico, critérios resumidos, não numerados): implementado vínculo entre pessoas e empresas, papéis/poderes de assinatura e documentos societários simulados, na aba Visão geral da ficha para clientes PJ. Não implementado: workflow completo de aprovação múltipla (fica só um aviso textual de política) e telas de gestão de vínculos/poderes (edição), que a spec também não detalha em critérios de aceite.
→ `Portal/pages/ClientProfilePage.jsx` (`PartnersSection`), `Portal/data/mock-data.js` (`holdingRelations`)

**US-17** — Como consultor autorizado, quero consultar e recomendar produtos internacionais dentro da visão consolidada do cliente.
⚠️ Parcial, mesmo critério de proporcionalidade do US-16: implementada a visão consolidada (posições em classe `Global` com câmbio aplicado e equivalente BRL/USD) numa aba dedicada da ficha. A recomendação/execução em si não duplica um fluxo novo — reaproveita o Simulador e a Central de Ordens já existentes (que já suportam produtos `Global`), conforme a nota explícita da própria aba sobre "separação entre visão consolidada e execução regulada".
→ `Portal/pages/ClientProfilePage.jsx` (`InternationalTab`), `Portal/data/mock-data.js` (`portfolioPositions` com `currency`/`fxRate`)

Itens de menu fora do escopo: "Relatórios" segue "em breve" como hub cross-cliente (`Portal/pages/ComingSoonPage.jsx`) — a geração de relatório por proposta individual já existe dentro do Simulador.

### EP-02 — Jornada de Produtos e Carteira Proposta (2026-08-13)

Novo épico (detalhado em [Portal/EPICO_PORTAL_CONSULTOR.md](Portal/EPICO_PORTAL_CONSULTOR.md#ep-02--jornada-de-produtos-e-carteira-proposta)): a **continuação operacional** do Simulador. O Simulador define a **carteira-alvo** (classes/percentuais); esta jornada seleciona os **ativos reais** que a implementam e gera uma **recomendação executável (#REC)** rastreável em Ordens. Decisão de arquitetura **Opção A**: o Simulador **não** é refatorado (mantém sua seleção de produtos legada) — ganha só uma ponte "Implementar em Produtos"; o cleanup da sobreposição fica para depois. Cliente-vitrine **João Pedro Silva (C17)** com `targetAllocation` semeado (padrão da Mariana no Planejamento). Componentes internos com prefixo `Prod*` (escopo global compartilhado). Entregue em 3 fases:
- **Fase 1** ✅ (validada, 0 erros de console) — cliente-vitrine **João Pedro Silva (C17)** + posições (Pós 42/Inflação 8/Pré 5/Multi 15/RV 20/Intl 10, base R$ 12 mi); simulação `SIM_JP` com `targetAllocation`; catálogo de produtos enriquecido por loop determinístico (`rating`, `fgc`, `availableStock`, banda `rateMin/rateRef/rateMax` + `rateLabel`); motor `strategyNeeds`/`productAdherence` em [analytics.js](Portal/lib/analytics.js); tokens `ADHERENCE_META`/`NEED_STATUS_META`/`strategyClassLabel` em [helpers.js](Portal/lib/helpers.js). Componente [Portal/pages/ProductJourney.jsx](Portal/pages/ProductJourney.jsx) (`window.ProductJourney`, rota `proposta`, sidebar "Produtos" ativo via `activeRoutes`). **Tela 01** (contexto do cliente + tabela Estratégia definida target×atual×necessidade — reproduz os números da spec: Inflação +R$ 54 mil, Prefixado +R$ 22,5 mil, total R$ 76,5 mil — + CTAs por classe). **Tela 02** (barra de contexto persistente, necessidade atual, busca + filtros + tabs por classe + tabela com coluna **Aderência** que considera estratégia/risco/suitability/FGC + multi-select "Adicionar à carteira" com recálculo das necessidades). **Duas pontes de handoff**: inbox "Estratégias prontas para implementar" no catálogo e botão "Implementar em Produtos" no dashboard do Simulador (gated em `targetAllocation`, sem refatorar o Simulador). Cache `20260813c`.
- **Fase 2** ✅ (validada, 0 erros) — **Tela 03 Comparar** (tabela critérios×produtos com destaques Maior taxa/liquidez/aderência/Menor concentração + "Adicionar à carteira" por coluna), **Tela 04 Detalhe** (KPIs + características + **Condições da operação com `ProdRateInput`** — número editável + slider dentro de mín/ref/máx — + custos separados + **Impacto na carteira**). Decisão de modelagem: o impacto lidera pela **meta de aporte da classe** (mesmo modelo da Tela 01: quanto do caixa alocar por classe), com a participação na carteira como nota secundária — porque R$ 450 mil sobre R$ 12 mi não move os % da carteira até o alvo (tensão do próprio spec); assim "Meta atingida" é verdadeiro. Clique na linha do Explorar abre o Detalhe; multi-select "Comparar" abre a Tela 03. Cache `20260813f`.
- **Fase 3** ✅ (validada, 0 erros) — **Tela 05 Carteira proposta** (5 KPIs + bloco **Estratégia × Implementação** por classe + tabela com **edição inline** de valor/taxa + **Validações da recomendação** — suitability/mínimos/estoque/saldo/estratégia por classe/concentração por emissor), **Tela 06 Revisar** (resumo + condições + resumo financeiro + check final com aderência), **Tela 07 Confirmar** (modal + estado de sucesso "Aguardando aprovação"), **Tela 08 Ordens** (nova seção **Recomendações** com KPIs + linhas **#REC** expansíveis por ativo, acima da Central de ordens existente). **Estado de erro bloqueante**: saldo excedido trava o envio (KPI vermelho + faixa de alerta). Envio cria o registro `recommendations` (novo array em [mock-data.js](Portal/data/mock-data.js) + handler `submitRecommendation` em [app.jsx](Portal/app.jsx), #REC a partir de 10452) que passa a ser acompanhado em Ordens. Coerência de modelo: a jornada usa "**preencher lacunas**" (aporta o caixa nas classes deficitárias, R$ 76,5 mil) e não "distribuir 450k por todos os targets", resolvendo a contradição interna entre as telas do spec. Cache `20260813h`.
- **Fase 4** ✅ (validada, 0 erros, 8 fluxos de regressão) — **catálogo de Produtos reconstruído** ([ProductsPage.jsx](Portal/pages/ProductsPage.jsx)) como tabela densa fiel ao mockup de referência: 5 KPIs **reais** (não ilustrativos — 27 produtos disponíveis, R$ saldo de clientes somado, vencimentos próximos por `maturityDate` parseado do `term`, etc.; catálogo ampliado para 28 produtos com LF Banco Delta/CRI Direcional/Fundo Horizon FIM nomeados no mockup), 9 filtros funcionais + tabs por classe (`PROD_CLASS_TABS` movido para `helpers.js`, fonte única com `ProductJourney.jsx`), multi-select com barra contextual, coluna **STATUS** (`productStatus()`/`PRODUCT_STATUS_META`) com destaque de linha (`DataTable` ganhou prop `rowClassName`). **Duas entradas "cliente-âncora" da IA combinada** (ver decisão abaixo): catálogo (`Produto(s) → Cliente → Detalhe/Configuração`, via `ProdClientPickerModal`) e ficha do cliente (`Cliente → Carteira → Produtos`, botão "Explorar produtos" no `PortfolioTab`) — ambas em `enterCatalogFlow` (`app.jsx`), que **anexa automaticamente** a estratégia do cliente quando existe. Motor `productAdherence` ganhou um caso para **ausência total de estratégia** (não confundir "fora da estratégia" com "não há estratégia"). `ProductJourney` ganhou **3 níveis de contexto progressivos** — sem cliente (drawer simples) · cliente sem estratégia (elegibilidade + meta de aporte oculta, sem bloco Estratégia×Implementação) · cliente com estratégia (tudo) — via prop `hasStrategy` e `initialProductIds`/`initialMode` (entrada direta em Detalhe, Comparar ou Carteira conforme a seleção prévia). Aposentado o fluxo legado `onAddToProposal`/`addProductToProposal` (adicionava a um rascunho do Simulador). Cache `20260814c`.

**Decisão de arquitetura (2026-08-14) — as portas de entrada da jornada de Produtos**: Simulador e Planejamento são ferramentas-pares que se ligam a um cliente em qualquer direção (`Ferramenta → Cliente` ou `Cliente → Ferramenta`) — nenhuma é dona de Produtos. Produtos tem duas portas próprias, nenhuma passando pelo Simulador: **produto-primeiro** (`Produto(s) → Cliente → Detalhe`) e **cliente-primeiro** (`Cliente → Carteira → Produtos`). A carteira-alvo do Simulador é só um contexto opcional que enriquece a mesma jornada quando existe. **Lacuna registrada, não bloqueante**: `Planejamento → Cliente` (entrada tool-first, como o Simulador tem via "Nova simulação") não existe — Planejamento só é alcançável de dentro da ficha do cliente.

### Jornada do Simulador de Investimentos (2026-08-09/10) — reconstrução de US-11/US-12

Substituiu o Simulador de 2 abas por uma **jornada consultiva navegável de 14 telas + 3 estados de exceção**, entregue em 2 fases. Fluxo: Minhas Simulações → Selecionar cliente → Contexto/objetivos → Carteira atual → Buscar produtos → Distribuir (R$/%) → Revisão → Dashboard (Resumo · Performance · Risco e Liquidez · Análise técnica · Comparação) → Gerar relatório → Preview/Compartilhar. Wizard com `currentStep` na própria simulação (retomada), barra de contexto persistente e stepper (`SimulatorChrome.jsx`).
- **Motor de métricas mockado e determinístico** (`Portal/lib/analytics.js`): premissas por classe, métricas de carteira (retorno/volatilidade/risco/liquidez/diversificação/concentração), séries históricas via PRNG semeado (atual×proposta×CDI), drawdown, correlação e risco×retorno — números estáveis, sem API.
- **Estados de exceção**: produto acima do perfil (alerta não-bloqueante "Ver alternativas / Adicionar mesmo assim"), alocação > 100% (bordas de alerta + CTA travado), busca sem resultado (limpar filtros).
- Dados de simulação enriquecidos (`objectives`, `simulationValue`, `fundingSource`, `notes`, `rationale`, `reportConfig`, `sharedAt`) e status expandidos (rascunho/em análise/compartilhada/aguardando cliente/concluída) em `helpers.js`/`mock-data.js`. O menu "Recomendações" abre "Minhas Simulações"; a Cesta em lote (US-13) continua em `RecommendationsPage.jsx`.
- **Débito conhecido**: a proposta ainda é modelada como carteira atual + novas alocações (não modela reduções/vendas); Performance × B (Simulação A×B) fica como placeholder.

### Jornada de Planejamento Financeiro (2026-08-10) — nova aba "Planejamento" no cliente

Adicionou uma **9ª aba "Planejamento"** dentro do cliente com a jornada consultiva de planejamento (12 telas + 2 estados), reaproveitando 100% o shell/tabs/header e o padrão de cards. Entregue em 3 fases, com **Mariana Costa (C15)** como único plano seed (`financialPlans`, status "Em construção"); demais clientes veem o **estado vazio**. Arquivo principal [Portal/pages/PlanningTab.jsx](Portal/pages/PlanningTab.jsx); motor `wealthSeries` em [Portal/lib/analytics.js](Portal/lib/analytics.js); handlers `createFinancialPlan`/`generatePlanReport`/`commitPlanDraft` em [Portal/app.jsx](Portal/app.jsx).
- **Fase 1** — Visão geral (5 cards, projeção base/conservador/otimista, Resumo do plano, Requer atenção, Insights), **Resultado do plano** (cards + projeção com milestones + Resumo da leitura), **Relatório/compartilhamento** (preview de páginas + config + toggles + estado de sucesso), **estado vazio** e **ponte com o simulador**.
- **Fase 2** — **Wizard** (Contexto · Objetivos · Renda e despesas · Patrimônio · Premissas) com `PlanStepper`, tabelas editáveis (`PlanEditableTable`), pré-preenchido a partir do seed; "Calcular plano" persiste o rascunho (`commitPlanDraft`) e leva ao Resultado.
- **Fase 3** — **Cenários** (params + 3 cards + gráfico comparativo + observações), **Comparação** (tabela Plano atual × A × B + leitura do consultor + próximas ações), **Recomendações** (plano selecionado + recomendações + atenção + atividade do plano) e **estado de transição** para o simulador.
- **Bug corrigido**: colisão de nome global `StepContexto` entre `PlanningTab.jsx` e `SimulatorJourney.jsx` (escopo global compartilhado; PlanningTab carregava depois e sobrescrevia, quebrando o simulador). Todos os componentes internos do Planejamento passaram a ter prefixo `Plan*`.
- **Cache-busting**: `Portal/index.html` versiona todos os scripts locais com `?v=` (bump por deploy) — o `http.server` não envia `Cache-Control` e o navegador servia `.jsx` de cache. Token atual `20260810j`.

### Workspace 360º do Cliente (2026-08-10) — evolução de US-04/05/06 (+ menu US-01)

Elevou a ficha do cliente a um workspace de wealth management, em 2 fases, com **Mariana Costa** como cliente vitrine (+ Costa Participações Ltda PJ vinculada) e enriquecimento genérico dos demais clientes (`rentability12m`, `investedWealth`, `dateOfBirth`, `linkDate`, `pfPjLinkId`, `security`; `appliedValue` nas posições; `investable` nas movimentações; novos arrays `clientDocuments`/`documentAccessLog`/`bankingProfiles`).
- **Visão geral (cockpit)**: menu "+Nova ação", 5 cards financeiros, área "Requer atenção", copiar e-mail/telefone, próximos eventos, atividade recente.
- **Carteira**: donut com switch (classe/produto/emissor/vencimento), insights, colunas com data de aplicação/rentabilidade/%, e **drawer de detalhe de posição** (Tela 04, `PositionDrawer.jsx`).
- **Movimentações**: classificação investível × uso bancário por evento, gráfico entradas×saídas 30d, CTA "Simular aplicação".
- **Aba Dados** (nova): identificação com copiar, relacionamento, vínculo PF↔PJ visual, segurança + ações controladas (auditoria simulada).
- **Recomendações contextual** + **ponte "Nova recomendação"** (`NewRecommendationBridge.jsx`, Tela 07) que entra no Simulador com objetivos pré-preenchidos.
- **Fase 2**: Documentos rico (categorias/filtros/histórico), Banking rico (conta + cartão Inter Black + serviços + ação sensível), **drawer de Suporte** contextual, **"Toda atividade"** com filtros, e **lista de clientes** com big numbers/filtros operacionais/colunas (próximo evento, ordens, alertas)/badges.
- Abas na ordem da spec: Visão geral · Carteira · Movimentações · Recomendações · Ordens · Documentos · Banking · Dados (a antiga "Internacional" saiu como aba; posições `Global` seguem na Carteira). Reutiliza `Drawer`, `ChartCanvas`, `ConfirmAction`, helpers novos (`copyToClipboard`, `nextMaturity`, `CASH_INVESTABLE_META`).
- **Bug corrigido**: busca de cliente casava com todos quando o termo não tinha dígitos (`onlyDigits("")` → match universal).

**Fechamento das lacunas de spec (Opção 1, 2026-08-10):** as 6 pendências que faltavam para "finalizar" a jornada foram implementadas e validadas (Playwright, 0 erros de console):
1. **Ordens do cliente (Tela 08)** virou tabela filtrável — chips de status clicáveis + filtros tipo/período + colunas (ativo/tipo/valor/origem/enviada/atualização/status) via `DataTable`.
2. **Detalhe da ordem (Tela 09)**: ação **"Reenviar notificação"** para ordens aguardando/enviadas (`resendOrderNotification` em `app.jsx`, só registra na timeline) e enquadramento do erro em três partes — **O que aconteceu · Impacto · Próxima ação** (`errorImpact` novo nas ordens de erro/recusa).
3. **Drawer de Suporte (Tela 13)**: chips de categoria **pré-selecionam o tema** do chamado (`openTicketModal` ganhou 5º arg `suggestedTheme`) e os atendimentos existentes mostram **protocolo, prazo/SLA e linha do tempo** expansível (`SupportTicketCard`).
4. **"Toda atividade" (Tela 14)**: eventos agora são **clicáveis** e saltam para a aba/drawer relacionado (ordens→Ordens, movimentações→Movimentações, etc.).
5. **Lista de clientes (Tela 01)**: **configurar colunas** (persistido em `localStorage` por perfil), **seleção múltipla + ações em massa** (exportar/enviar relatório/abrir atendimento — `DataTable` ganhou props opcionais `selectable`/`selectedKeys`/`onToggleSelect`/`onToggleAll`) e **filtros salvos** persistentes.
6. **"Enviar relatório"** (menu +Nova ação) deixou de ser stub: abre `ReportModal` com prévia da alocação, **gera/baixa** o relatório e o registra na aba **Documentos** como "Enviado ao cliente".

**Re-skin visual ao design de referência `Cliente Novo.png` (2026-08-10):** o Portal foi construído a partir do spec textual; quando a referência visual real (14 frames em `~/Downloads/Cliente Novo.png`) foi disponibilizada, aplicamos um **re-skin completo, tema escuro no Portal inteiro**:
- **Shell** ([Portal/components/Shell.jsx](Portal/components/Shell.jsx)): sidebar **navy (#0f1826)** full-height com logo "Inter / CONSULTOR PORTAL" no topo, item ativo com barra laranja à direita e perfil na base; header (busca + Ajuda + sino + persona "Nome / ESCRITÓRIO" laranja) só sobre o conteúdo. **Removidos os pills "Jornada/Portal"** e o breadcrumb do topo — o link da Jornada virou item discreto na base do rail; o breadcrumb foi para dentro do conteúdo.
- **Ficha do cliente** ([Portal/pages/ClientProfilePage.jsx](Portal/pages/ClientProfilePage.jsx)): cards financeiros com rótulo MAIÚSCULO + valor colorido por semântica (investido azul, caixa verde, investível laranja, rentab. verde); "Requer atenção" em **lista full-width** com ícone circular colorido; **barra de alocação horizontal empilhada** (`AllocationStackBar`) no lugar do donut, na visão geral e na Carteira; atividade recente compacta (`CompactActivity`); ponto de segmento colorido no cabeçalho; "Suporte" foi dobrado no menu "Nova ação".
- **Lista de clientes**: big numbers com rótulo MAIÚSCULO + valor colorido, avatares com iniciais, segmento com ponto colorido.
- **Segmentos** no vocabulário da referência via `segmentLabel`/`segmentDot` (helpers): Standard→Retail, High→High Income, etc. (valores de dado preservados).
- Demais telas herdam o tema escuro pelo Shell (cards brancos sobre fundo claro). Validado no Playwright (0 erros de console) nas telas-chave e nos 6 fluxos da Opção 1.

---

## Débitos técnicos e decisões pendentes (não são épicos, mas afetam qualquer evolução)

- **`app.jsx` e `prototype.html` estão dessincronizados por design.** `prototype.html` é uma cópia pré-compilada (JSX → `React.createElement`) de `app.jsx` mais o seed data embutido. Não há build step automatizado — qualquer história implementada em `app.jsx` precisa ser manualmente re-embutida no `prototype.html`, ou o protótipo em uso vai ficar desatualizado.
- **`seed-data.json` e o seed embutido em `prototype.html` são cópias paralelas dos mesmos dados.** Risco de divergência silenciosa se um for editado e o outro não.
- **Análise de sentimento é keyword matching, não NLP real.** Funciona para o dataset atual (PT-BR, vocabulário conhecido da entrevista), mas não generaliza para novo conteúdo sem expandir as listas `NEGATIVE_KEYWORDS`/`POSITIVE_KEYWORDS` manualmente (`app.jsx:3-4`).
- **Fórmula de priorização (`effortRiskScore`) não validada** contra a planilha original — ver US5.1.
- ~~**Sem repositório git nesta pasta**~~ — **resolvido em 2026-07-22**: a pasta agora é um repositório git com remoto `origin` no GitHub (`mrcassadori/smartjourney`), e o Portal do Consultor já foi commitado e enviado (`git push origin main`). O código do protótipo agora tem histórico de versões.
- **A aba Insights (EP15) tem os dados de síntese hardcoded** (`PAIN_RANKING`, `PRIORITY_MATRIX`, `INSIGHT_CARDS` em `app.jsx`), escritos manualmente a partir da leitura das duas entrevistas — não são derivados de `journey.pains`/`journey.prioritization`. Se uma terceira jornada for adicionada, essa aba precisa ser atualizada manualmente também; ela não recalcula sozinha a partir do seed data.
- **O menu de navegação Jornada ↔ Portal é sincronizado manualmente em 3 lugares**: `app.jsx`, `prototype.html` (compilado à mão, mesma dor já descrita acima) e `Portal/components/Shell.jsx`. Não há um layout compartilhado entre os dois protótipos — são apps React independentes que só se linkam por `<a href>` simples (`Portal/index.html` ↔ `../prototype.html`), sem estado compartilhado.
- **O Portal precisa ser servido por HTTP, não aberto direto via `file://`.** Diferente do `prototype.html` (que roda direto no navegador), o Babel standalone do Portal busca cada `.jsx` via XHR para transformar JSX no navegador, o que o Chrome bloqueia sob `file://` por CORS. Rodar `python3 -m http.server` (ou equivalente) a partir da raiz do repo antes de abrir `Portal/index.html`.
- **O Portal não tem um painel genérico de simulação de indisponibilidade/latência/dado desatualizado configurável** (EN-01, critério 6 parcial) — os estados obrigatórios (§10 do épico) nascem dos próprios dados fictícios (ex: uma ordem já vem com status `erro`, um cliente já vem com `stale: true`) em vez de um toggle de cenário. Suficiente para demonstração, mas não permite forçar qualquer estado em qualquer tela sob demanda.
- **Basket (US-13) não tem tela própria de histórico** — cada envio vira N ordens com um `basketId` comum na Central de Ordens existente (decisão de design deliberada, ver EP16 acima), mas isso significa que hoje não há um jeito de listar "todos os baskets enviados" agrupados; é preciso já saber o `basketId` ou reconhecer as ordens pelo produto/data.
- **O Simulador (US-11) só modela inclusões, não reduções** — não é possível "vender" ou reduzir uma posição já existente na carteira atual dentro de uma simulação; a aba de comparativo (US-12) sinaliza isso explicitamente na UI em vez de fingir suportar o cenário.
- **US-16 não tem tela de gestão de vínculos societários** (criar/editar/remover representante e poderes) — os vínculos em `holdingRelations` são só leitura no protótipo, coerente com o nível de detalhe que a própria spec dá a essa história, mas vale nomear como lacuna caso a aprofundemos depois.
- **A aprovação múltipla do US-16 é só um aviso textual**, não um workflow real — nenhuma ordem de cliente PJ exige de fato uma segunda assinatura antes de avançar de status; fica para uma fase de aprofundamento se PJ/holdings virar prioridade maior que P2.
- **Protocolo de ticket/solicitação é sequencial em memória** (`CH-${9007 + tickets.length}`, `OP-${58260 + serviceRequests.length}`) — reinicia a numeração se a página for recarregada sem exportar/reimportar estado (o Portal, assim como a Jornada, não tem persistência entre sessões — ver EP8/DATA_MODEL.md).

## Priorização sugerida para o próximo ciclo

Com base na spec original, os dois requisitos funcionais citados como "requisito", não "nice to have" (seção 3), e o problema #2 do contexto, ficam como candidatos naturais a próximo épico, nesta ordem sugerida:

1. **EP9 — Versionamento e histórico** (motivação central da spec, ainda zero implementação)
2. **EP2/EP4 — Upload de arquivos** (requisito funcional explícito, zero implementação)
3. **EP11 — Relatórios e exportação visual** (requisito funcional explícito, zero implementação)
4. **EP10 — Multiusuário** (requisito funcional explícito, depende de backend — maior esforço)
5. **EP12/EP13 — Transcrição/Analytics** (schema pronto, mas a própria spec já tratava como "modo de geração assistida" secundário)

Esta ordem é uma sugestão para discussão — não é uma decisão tomada.

Em paralelo, o **Portal do Consultor (EP16)** concluiu as 17 histórias + EN-01 do seu épico (`Portal/EPICO_PORTAL_CONSULTOR.md`) — não há mais um "próximo release" definido no documento de origem. Evoluções futuras do Portal já estão listadas na própria spec: seção 12 ("Regras de negócio a validar" — ex: SLAs reais, regras de alerta, elegibilidade/suitability por produto, política de retenção de logs) e seção 13 ("Fora do escopo inicial" — backend, APIs reais, autenticação real, execução financeira de fato). Qualquer evolução daqui em diante é sair do protótipo mockado rumo a produto real, não mais um release do mesmo épico.

// Portal do Consultor — App raiz.
// Roteamento simples por chave de página (sem react-router, mesmo padrão do
// app.jsx da Jornada) + estado de perfil/escopo + cópias locais mutáveis dos
// dados sintéticos (alertas e ordens mudam de status só nesta sessão).

// Derivado da árvore de navegação (Portal/components/Shell.jsx → NAV_GROUPS)
// para nunca desincronizar: todo item de menu marcado `comingSoon: true`
// navega para si mesmo (`item.route || item.key`) e cai aqui.
const COMING_SOON_KEYS = window.PORTAL_NAV_ITEMS.filter((i) => i.comingSoon).map((i) => i.route || i.key);

const TICKET_SUGGESTED_THEME = {
  order: 'Erro em ordem',
  onboarding: 'Documento',
  service: 'Outro',
  client: 'Dúvida cadastral',
};

function App() {
  const DATA = window.PORTAL_DATA;
  const { clientsInScope, uid } = window.PortalLib;

  const [profileId, setProfileId] = React.useState('consultor');
  const [page, setPage] = React.useState('home');
  const [pageParams, setPageParams] = React.useState({});
  const [selectedClientId, setSelectedClientId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [openOrderId, setOpenOrderId] = React.useState(null);
  const [showLinkRequest, setShowLinkRequest] = React.useState(false);
  const [alerts, setAlerts] = React.useState(DATA.alerts);
  const [orders, setOrders] = React.useState(DATA.orders);
  const [onboarding] = React.useState(DATA.onboarding);
  const [simulations, setSimulations] = React.useState(DATA.simulations);
  const [serviceRequests, setServiceRequests] = React.useState(DATA.serviceRequests);
  const [operations, setOperations] = React.useState(DATA.operations);
  const [tickets, setTickets] = React.useState(DATA.tickets);
  const [financialPlans, setFinancialPlans] = React.useState(DATA.financialPlans);
  const [recommendations, setRecommendations] = React.useState(DATA.recommendations);
  const [openRequestId, setOpenRequestId] = React.useState(null);
  const [openTicketId, setOpenTicketId] = React.useState(null);
  const [newTicketContext, setNewTicketContext] = React.useState(null);
  // EP-02 — jornada de Produtos: contexto de entrada (cliente + estratégia
  // opcional + seleção prévia do catálogo). Default = vitrine João Pedro (SIM_JP,
  // Nível 3 — cliente com estratégia definida no Simulador).
  const [proposalContext, setProposalContext] = React.useState({ clientId: 'C17', simulationId: 'SIM_JP', initialProductIds: null, initialMode: null });
  // EP-02 (Fase D) — carrinho da proposta, com vida própria fora da jornada:
  // sobrevive à ida-e-volta `proposta ⇄ products` para que o catálogo real
  // mostre "carrinho em construção" e permita continuar adicionando produtos
  // sem reabrir o seletor de cliente a cada item (ver GOVERNANCA.md).
  const [cart, setCart] = React.useState(null); // { clientId, simulationId, items: [{productId,value,rate,rateAccepted}] }

  const profile = DATA.profiles.find((p) => p.id === profileId);
  const scopedClients = React.useMemo(() => clientsInScope(profile, DATA.clients), [profile, DATA.clients]);
  const scopedClientIds = React.useMemo(() => new Set(scopedClients.map((c) => c.id)), [scopedClients]);
  const scopedAlerts = React.useMemo(() => alerts.filter((a) => scopedClientIds.has(a.clientId)), [alerts, scopedClientIds]);
  const scopedOrders = React.useMemo(() => orders.filter((o) => scopedClientIds.has(o.clientId)), [orders, scopedClientIds]);
  const scopedSimulations = React.useMemo(() => simulations.filter((s) => scopedClientIds.has(s.clientId)), [simulations, scopedClientIds]);
  const scopedServiceRequests = React.useMemo(() => serviceRequests.filter((r) => scopedClientIds.has(r.clientId)), [serviceRequests, scopedClientIds]);
  const scopedOperations = React.useMemo(() => operations.filter((o) => scopedClientIds.has(o.clientId)), [operations, scopedClientIds]);
  const scopedTickets = React.useMemo(() => tickets.filter((t) => scopedClientIds.has(t.clientId)), [tickets, scopedClientIds]);
  const unresolvedAlertsCount = scopedAlerts.filter((a) => a.status === 'novo' || a.status === 'em_tratamento').length;
  // Planejamento é 1:1 por cliente (commitPlanDraft upserta por clientId) — a
  // entrada tool-first precisa saber quem já tem plano pra não sobrescrever.
  const clientsWithPlanFlag = React.useMemo(() => {
    const withPlan = new Set(financialPlans.map((p) => p.clientId));
    return scopedClients.map((c) => (withPlan.has(c.id) ? Object.assign({}, c, { hasPlan: true }) : c));
  }, [scopedClients, financialPlans]);

  function navigate(key, params) {
    setPage(key);
    setPageParams(params || {});
    if (key !== 'client') setSelectedClientId(null);
  }

  function openClient(id, params) {
    setSelectedClientId(id);
    setPage('client');
    setPageParams(params || {});
  }

  function openOperationDetail(id) {
    navigate('operationDetail', { operationId: id });
  }

  function changeProfile(id) {
    setProfileId(id);
    navigate('home', {});
  }

  function updateAlertStatus(id, status) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function retryOrder(id) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'aguardando_aprovacao',
              errorReason: null,
              errorAction: null,
              retriable: false,
              timeline: [...o.timeline, { date: DATA.now, status: 'aguardando_aprovacao', detail: 'Ordem reenviada e aguardando nova aprovação (ação simulada).' }],
            }
          : o
      )
    );
  }

  function cancelOrder(id) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: 'cancelada', timeline: [...o.timeline, { date: DATA.now, status: 'cancelada', detail: 'Ordem cancelada pelo usuário (ação simulada).' }] }
          : o
      )
    );
  }

  // Reenvia ao cliente a notificação de aprovação — só registra na timeline.
  function resendOrderNotification(id) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, timeline: [...o.timeline, { date: DATA.now, status: o.status, detail: 'Notificação reenviada ao cliente para revisar e aprovar (ação simulada).' }] }
          : o
      )
    );
  }

  // Molde base de uma nova simulação (jornada consultiva, US-11/US-12).
  function blankSimulation(clientId, currentStep, extra) {
    return Object.assign(
      {
        id: uid(),
        clientId: clientId || null,
        name: 'Nova simulação',
        status: 'rascunho',
        createdBy: profile.name,
        createdAt: DATA.now,
        updatedAt: DATA.now,
        objectives: [],
        simulationValue: 0,
        fundingSource: 'novo',
        notes: '',
        rationale: '',
        currentStep: currentStep || 'cliente',
        items: [],
        reportGeneratedAt: null,
        sharedAt: null,
        reportConfig: null,
        version: 1,
      },
      extra || {}
    );
  }

  // "Nova simulação" a partir da lista (sem cliente ainda) → passo Cliente.
  function newBlankSimulation() {
    const sim = blankSimulation(null, 'cliente');
    setSimulations((prev) => [...prev, sim]);
    navigate('simulator', { simulationId: sim.id });
  }

  // "Nova simulação" a partir da ficha do cliente → já no passo Contexto.
  // `objectives` opcional vem da ponte "Nova recomendação" (Tela 07).
  function newSimulation(clientId, objectives) {
    const sim = blankSimulation(clientId, 'contexto', objectives && objectives.length ? { objectives } : {});
    setSimulations((prev) => [...prev, sim]);
    navigate('simulator', { simulationId: sim.id });
  }

  function openSimulation(id) {
    navigate('simulator', { simulationId: id });
  }

  // Garante um carrinho aberto para `clientId`, reaproveitando o que já existe
  // (não reseta itens já escolhidos) — só cria um novo ao trocar de cliente.
  // Anexa a estratégia do cliente (targetAllocation) automaticamente quando existe.
  function ensureCartFor(clientId) {
    const existingStrategy = simulations.find((s) => s.clientId === clientId && s.targetAllocation);
    setCart((prev) => (prev && prev.clientId === clientId ? prev : { clientId, simulationId: existingStrategy ? existingStrategy.id : null, items: [] }));
    return existingStrategy ? existingStrategy.id : null;
  }

  // EP-02 — ponte "Implementar em Produtos": entra na jornada de Produtos com a
  // carteira-alvo da simulação como contexto somente-leitura (Nível 3).
  function startRecommendation(simulationId) {
    const sim = simulations.find((s) => s.id === simulationId);
    const clientId = sim ? sim.clientId : null;
    if (clientId) ensureCartFor(clientId);
    setProposalContext({ clientId, simulationId: simulationId || null, initialProductIds: null, initialMode: null });
    navigate('proposta', {});
  }

  // EP-02 — as duas portas "cliente-âncora" da jornada de Produtos:
  //  (1) catálogo: Produto(s) → Cliente → Detalhe/Configuração (productIds preenchido);
  //  (2) ficha do cliente: Cliente → Carteira → Produtos (productIds vazio).
  // Em ambos os casos, se o cliente já tiver uma estratégia definida no
  // Simulador (targetAllocation), ela é anexada automaticamente (Nível 3);
  // senão a jornada segue sem estratégia (Nível 1→2).
  function enterCatalogFlow(clientId, productIds, mode) {
    const simulationId = ensureCartFor(clientId);
    setProposalContext({ clientId, simulationId, initialProductIds: productIds, initialMode: mode });
    navigate('proposta', {});
  }

  // Fase 8 — anexa o cliente ao carrinho SEM navegar: o slide-over de 1 ativo
  // (ProductsPage) fica na própria página de Produtos e revela taxa/impacto
  // in-place assim que o cliente é escolhido no seletor inline (sem modal).
  function attachCartClient(clientId) {
    ensureCartFor(clientId);
  }

  // Fase D — sincroniza os itens do carrinho de volta pro estado do app (chamado
  // pela jornada a cada mudança de item), e permite encerrar o carrinho a partir
  // do próprio catálogo (botão "Encerrar" da barra de carrinho).
  function updateCart(clientId, items) {
    setCart((prev) => (prev && prev.clientId === clientId ? { ...prev, items } : prev));
  }
  function clearCart() {
    setCart(null);
  }

  // EP-02 — envio da recomendação (Tela 07): cria o registro #REC que passa a ser
  // acompanhado na Central de Ordens. Retorna o id gerado para a tela de sucesso.
  // Fase 9 — não encerra mais o carrinho aqui: a tela "Confirmar Envio" (página
  // cheia) ainda precisa do cliente/chip no topbar enquanto está visível; quem
  // encerra é o clique em "Ver recomendação enviada"/"Ir para central de ordens".
  const recSeedCount = DATA.recommendations.length;
  function submitRecommendation(clientId, items, total) {
    const recId = 'REC-' + (10452 + (recommendations.length - recSeedCount));
    const rec = { id: recId, clientId, consultor: profile.name, createdAt: DATA.now, value: total, status: 'aguardando_cliente', pendencias: 0, items };
    setRecommendations((prev) => [rec, ...prev]);
    return recId;
  }

  function selectSimulationClient(id, clientId) {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, clientId, currentStep: 'contexto', updatedAt: DATA.now } : s)));
  }

  // Patch genérico de campos da simulação (contexto, itens, passo, status…).
  function patchSimulation(id, patch) {
    setSimulations((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = { ...s, ...patch, updatedAt: DATA.now };
        if (patch.status && patch.status !== s.status) next.version = (s.version || 1) + 1;
        return next;
      })
    );
  }

  function duplicateSimulation(id) {
    const src = simulations.find((s) => s.id === id);
    if (!src) return;
    const copy = Object.assign({}, src, {
      id: uid(),
      name: `${src.name} (cópia)`,
      status: 'rascunho',
      createdBy: profile.name,
      createdAt: DATA.now,
      updatedAt: DATA.now,
      reportGeneratedAt: null,
      sharedAt: null,
      version: 1,
      items: src.items.map((it) => ({ ...it })),
    });
    setSimulations((prev) => [...prev, copy]);
    navigate('simulacoes', {});
  }

  function archiveSimulation(id) {
    patchSimulation(id, { status: 'arquivada' });
  }

  function generateSimulationReport(id) {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, reportGeneratedAt: DATA.now, currentStep: 'relatorio' } : s)));
    navigate('simulator', { simulationId: id });
  }

  // ----- Planejamento financeiro -----
  function createFinancialPlan(clientId) {
    // Fase 1: se já existe plano, é no-op (a edição real vem no wizard da Fase 2).
    const existing = financialPlans.find((p) => p.clientId === clientId);
    if (existing) return;
    setFinancialPlans((prev) => [
      ...prev,
      {
        id: uid(), clientId, name: 'Novo planejamento', type: 'aposentadoria', status: 'rascunho', horizonYears: 15, notes: '',
        context: { dependents: [] }, objectives: { primary: 'Aposentadoria', targetAge: 60, desiredIncome: 0, lifeExpectancy: 95, strategy: 'preservar', selected: [] },
        cashflow: { incomes: [], expenses: [] }, wealth: { financialInter: 0, financialExternal: 0, otherAssets: [], investments: [] },
        assumptions: { inflation: 4.5, nominalReturn: 9.5, realReturn: 4.8, cdi: 11.2, expenseGrowth: 4.5, incomeGrowth: 5, validated: {} },
        scenarios: [], selectedScenarioId: null, result: { currentWealth: 0, requiredWealth: 0, requiredContribution: 0, targetIncome: 0, gap: 0, successProbability: 0 },
        activity: [{ date: DATA.now, label: 'Planejamento criado (rascunho)' }], createdAt: DATA.now, updatedAt: DATA.now, reportGeneratedAt: null,
      },
    ]);
  }

  function generatePlanReport(id) {
    setFinancialPlans((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'compartilhado', reportGeneratedAt: DATA.now, updatedAt: DATA.now } : p)));
  }

  // Upsert do plano a partir do rascunho do wizard (Fase 2). Preserva o result
  // já calculado quando existir (cliente vitrine), só atualiza os campos editados.
  function commitPlanDraft(clientId, draft, status) {
    setFinancialPlans((prev) => {
      const idx = prev.findIndex((p) => p.clientId === clientId);
      if (idx === -1) {
        const created = Object.assign(
          { id: uid(), clientId, scenarios: [], selectedScenarioId: null, result: { currentWealth: 0, requiredWealth: 0, requiredContribution: 0, targetIncome: 0, gap: 0, successProbability: 0 }, activity: [], reportGeneratedAt: null, createdAt: DATA.now },
          draft,
          { status: status || 'em_construcao', updatedAt: DATA.now }
        );
        return [...prev, created];
      }
      return prev.map((p, i) => (i === idx ? Object.assign({}, p, draft, { status: status || 'em_construcao', updatedAt: DATA.now }) : p));
    });
  }

  function registerSharedSimulation(id) {
    setSimulations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'compartilhada', sharedAt: DATA.now, updatedAt: DATA.now, version: (s.version || 1) + 1 } : s))
    );
  }

  function sendBasket(product, items) {
    const basketId = uid();
    const newOrders = items.map(({ clientId, value }) => ({
      id: uid(),
      clientId,
      asset: product.name,
      type: 'aplicacao',
      value,
      author: profile.name,
      sentAt: DATA.now,
      status: 'aguardando_aprovacao',
      errorReason: null,
      errorAction: null,
      retriable: false,
      basketId,
      timeline: [{ date: DATA.now, status: 'aguardando_aprovacao', detail: `Ordem criada a partir do basket "${product.name}" (ação simulada).` }],
    }));
    setOrders((prev) => [...prev, ...newOrders]);
  }

  function createServiceRequest(clientId, type, description) {
    const direct = profile.permissions.canOperateDirectly;
    const status = direct ? 'concluida' : 'aberta';
    const detail = direct
      ? 'Ação executada imediatamente após autenticação reforçada (ação simulada).'
      : 'Solicitação registrada, aguardando atendimento de um Daily Banker/Administrador (ação simulada).';
    setServiceRequests((prev) => [
      ...prev,
      {
        id: uid(),
        clientId,
        type,
        description,
        status,
        protocol: `OP-${58260 + prev.length}`,
        requestedBy: profile.name,
        requestedAt: DATA.now,
        dueAt: DATA.now,
        resolvedAt: direct ? DATA.now : null,
        timeline: [{ date: DATA.now, status, detail }],
      },
    ]);
  }

  function advanceServiceRequest(id, status, detail) {
    setServiceRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, resolvedAt: status === 'concluida' ? DATA.now : r.resolvedAt, timeline: [...r.timeline, { date: DATA.now, status, detail }] }
          : r
      )
    );
  }

  // Mutador genérico da jornada de Operações — a lógica de cada ação (o que
  // muda de status, o que entra na timeline) vive em OperationDetailPage,
  // igual ao padrão de patchSimulation/patchPlan já usado no app.
  function patchOperation(id, patch) {
    setOperations((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function openTicketModal(client, contextType, contextId, contextLabel, suggestedTheme) {
    setNewTicketContext({ client, contextType, contextId, contextLabel, suggestedTheme });
  }

  function submitNewTicket({ theme, impact, urgency, message }) {
    const ctx = newTicketContext;
    if (!ctx) return;
    setTickets((prev) => [
      ...prev,
      {
        id: uid(),
        clientId: ctx.client.id,
        contextType: ctx.contextType,
        contextId: ctx.contextId,
        theme,
        impact,
        urgency,
        status: 'aberto',
        protocol: `CH-${9007 + prev.length}`,
        createdBy: profile.name,
        createdAt: DATA.now,
        dueAt: new Date(new Date(DATA.now).getTime() + 48 * 3600 * 1000).toISOString(),
        resolvedAt: null,
        rating: null,
        messages: [{ author: profile.name, date: DATA.now, text: message }],
      },
    ]);
  }

  function addTicketMessage(id, text) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, messages: [...t.messages, { author: profile.name, date: DATA.now, text }] } : t)));
  }

  function resolveTicket(id, rating) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'resolvido', resolvedAt: DATA.now, rating, messages: [...t.messages, { author: profile.name, date: DATA.now, text: 'Chamado marcado como resolvido pelo solicitante.' }] }
          : t
      )
    );
  }

  const selectedClient = selectedClientId ? DATA.clients.find((c) => c.id === selectedClientId) : null;
  const openSimulationObj = pageParams && pageParams.simulationId ? simulations.find((s) => s.id === pageParams.simulationId) : null;
  const selectedOperation = pageParams && pageParams.operationId ? scopedOperations.find((o) => o.id === pageParams.operationId) : null;

  const breadcrumbFor = () => {
    const navLabel = (key) => (window.PORTAL_NAV_ITEMS.find((n) => n.key === key) || {}).label || key;
    if (page === 'home') return [{ label: 'Visão geral' }];
    if (page === 'clients') return [{ label: 'Clientes' }];
    if (page === 'client' && selectedClient) return [{ label: 'Clientes', onClick: () => navigate('clients', {}) }, { label: selectedClient.name }];
    if (page === 'orders') return [{ label: 'Central de ordens' }];
    if (page === 'onboarding') return [{ label: 'Onboarding e pendências' }];
    if (page === 'alerts') return [{ label: 'Central de alertas' }];
    if (page === 'products') return [{ label: 'Produtos' }];
    if (page === 'proposta') return [{ label: 'Produtos', onClick: () => navigate('products', {}) }, { label: 'Carteira proposta' }];
    if (page === 'recommendations') return [{ label: 'Recomendações' }];
    if (page === 'operations') return [{ label: 'Operações' }];
    if (page === 'operationDetail') return [{ label: 'Operações', onClick: () => navigate('operations', {}) }, { label: selectedOperation ? `#${selectedOperation.protocol}` : 'Operação' }];
    if (page === 'support') return [{ label: 'Central de suporte' }];
    if (page === 'simulacoes') return [{ label: 'Investimentos' }, { label: 'Simulador' }];
    if (page === 'planejamento') return [{ label: 'Planejamento' }];
    if (page === 'simulator') {
      return [
        { label: 'Simulador', onClick: () => navigate('simulacoes', {}) },
        { label: openSimulationObj ? openSimulationObj.name : 'Nova simulação' },
      ];
    }
    if (COMING_SOON_KEYS.indexOf(page) !== -1) return [{ label: navLabel(page) }];
    return null;
  };

  let content = null;
  if (page === 'home') {
    content = (
      <HomePage
        profile={profile}
        clients={scopedClients}
        alerts={scopedAlerts}
        orders={scopedOrders}
        onboarding={onboarding}
        portfolioPositions={DATA.portfolioPositions}
        cashEvents={DATA.cashEvents}
        now={DATA.now}
        onNavigate={navigate}
        onOpenClient={openClient}
        onUpdateAlertStatus={updateAlertStatus}
      />
    );
  } else if (page === 'clients') {
    content = (
      <ClientsListPage
        profile={profile}
        clients={scopedClients}
        alerts={scopedAlerts}
        orders={scopedOrders}
        positions={DATA.portfolioPositions}
        search={search}
        initialFilters={pageParams}
        now={DATA.now}
        onOpenClient={openClient}
        onRequestLink={() => setShowLinkRequest(true)}
        onOpenTicket={openTicketModal}
      />
    );
  } else if (page === 'client' && selectedClient) {
    content = (
      <ClientProfilePage
        client={selectedClient}
        profile={profile}
        positions={DATA.portfolioPositions.filter((p) => p.clientId === selectedClient.id)}
        cashEvents={DATA.cashEvents.filter((e) => e.clientId === selectedClient.id)}
        alerts={alerts.filter((a) => a.clientId === selectedClient.id)}
        orders={orders.filter((o) => o.clientId === selectedClient.id)}
        onboardingEntry={onboarding.find((o) => o.clientId === selectedClient.id) || null}
        simulations={simulations.filter((s) => s.clientId === selectedClient.id)}
        serviceRequests={serviceRequests.filter((r) => r.clientId === selectedClient.id)}
        holdingRelations={DATA.holdingRelations.filter((r) => r.pjClientId === selectedClient.id)}
        allClients={DATA.clients}
        documents={DATA.clientDocuments.filter((d) => d.clientId === selectedClient.id)}
        accessLog={DATA.documentAccessLog.filter((a) => a.clientId === selectedClient.id)}
        bankingProfile={DATA.bankingProfiles.find((bp) => bp.clientId === selectedClient.id) || null}
        tickets={tickets.filter((t) => t.clientId === selectedClient.id)}
        plan={financialPlans.find((p) => p.clientId === selectedClient.id) || null}
        now={DATA.now}
        initialTab={pageParams.tab}
        onBack={() => navigate('clients', {})}
        onOpenOrder={(id) => setOpenOrderId(id)}
        onOpenClient={openClient}
        onOpenSimulation={openSimulation}
        onNewSimulation={newSimulation}
        onOpenServiceRequest={(id) => setOpenRequestId(id)}
        onCreateServiceRequest={createServiceRequest}
        onOpenTicket={openTicketModal}
        onCreatePlan={createFinancialPlan}
        onGeneratePlanReport={generatePlanReport}
        onCommitPlan={commitPlanDraft}
        onExploreProducts={(clientId) => enterCatalogFlow(clientId, [], null)}
      />
    );
  } else if (page === 'orders') {
    content = (
      <OrdersPage
        profile={profile}
        clients={scopedClients}
        orders={scopedOrders}
        recommendations={recommendations.filter((r) => scopedClientIds.has(r.clientId))}
        initialFilters={pageParams}
        openOrderId={openOrderId}
        onOpenOrder={setOpenOrderId}
        onCloseOrder={() => setOpenOrderId(null)}
        onRetryOrder={retryOrder}
        onCancelOrder={cancelOrder}
        onResendNotification={resendOrderNotification}
        onOpenTicket={openTicketModal}
      />
    );
  } else if (page === 'onboarding') {
    content = <OnboardingPage profile={profile} clients={scopedClients} onboarding={onboarding} onOpenClient={openClient} onOpenTicket={openTicketModal} />;
  } else if (page === 'alerts') {
    content = (
      <AlertsPage
        profile={profile}
        clients={scopedClients}
        alerts={scopedAlerts}
        initialFilters={pageParams}
        now={DATA.now}
        onOpenClient={openClient}
        onUpdateStatus={updateAlertStatus}
      />
    );
  } else if (page === 'products') {
    content = (
      <ProductsPage
        profile={profile} clients={scopedClients} products={DATA.products} now={DATA.now} initialFilters={pageParams}
        strategies={simulations.filter((s) => s.targetAllocation)} positions={DATA.portfolioPositions}
        cart={cart} onClearCart={clearCart}
        onStartRecommendation={startRecommendation} onEnterCatalogFlow={enterCatalogFlow}
        onAttachCartClient={attachCartClient} onUpdateCart={updateCart}
        onSubmitRecommendation={submitRecommendation} onGoOrders={() => navigate('orders', {})}
      />
    );
  } else if (page === 'proposta') {
    const sim = proposalContext.simulationId ? simulations.find((s) => s.id === proposalContext.simulationId) : null;
    const cli = DATA.clients.find((c) => c.id === proposalContext.clientId) || null;
    const cartItems = cart && cart.clientId === proposalContext.clientId ? cart.items : [];
    content = cli ? (
      <window.ProductJourney
        client={cli}
        simulation={sim}
        initialProductIds={proposalContext.initialProductIds}
        initialMode={proposalContext.initialMode}
        cartItems={cartItems}
        onCartChange={updateCart}
        positions={DATA.portfolioPositions.filter((p) => p.clientId === cli.id)}
        products={DATA.products}
        now={DATA.now}
        onExit={() => navigate('products', {})}
        onOpenClient={openClient}
        onOpenSimulation={openSimulation}
        onSubmitRecommendation={submitRecommendation}
        onClearCart={clearCart}
        onGoOrders={() => navigate('orders', {})}
      />
    ) : <ComingSoonPage pageKey="proposta" />;
  } else if (page === 'recommendations') {
    content = (
      <RecommendationsPage
        profile={profile}
        clients={scopedClients}
        products={DATA.products}
        now={DATA.now}
        onSendBasket={sendBasket}
      />
    );
  } else if (page === 'simulacoes') {
    content = (
      <SimulationsListPage
        profile={profile}
        clients={scopedClients}
        simulations={scopedSimulations}
        now={DATA.now}
        search={search}
        onNewSimulation={newBlankSimulation}
        onOpenSimulation={openSimulation}
        onDuplicateSimulation={duplicateSimulation}
        onArchiveSimulation={archiveSimulation}
      />
    );
  } else if (page === 'simulator' && openSimulationObj) {
    content = (
      <SimulatorJourney
        simulation={openSimulationObj}
        client={openSimulationObj.clientId ? DATA.clients.find((c) => c.id === openSimulationObj.clientId) : null}
        clients={scopedClients}
        products={DATA.products}
        positions={openSimulationObj.clientId ? DATA.portfolioPositions.filter((p) => p.clientId === openSimulationObj.clientId) : []}
        now={DATA.now}
        profile={profile}
        onPatch={(patch) => patchSimulation(openSimulationObj.id, patch)}
        onSelectClient={(clientId) => selectSimulationClient(openSimulationObj.id, clientId)}
        onSaveDraft={() => navigate('simulacoes', {})}
        onExit={() => navigate('simulacoes', {})}
        onGenerateProposal={generateSimulationReport}
        onRegisterShared={registerSharedSimulation}
        onNewSimulation={newBlankSimulation}
        onOpenClient={openClient}
        onImplementProducts={startRecommendation}
      />
    );
  } else if (page === 'planejamento') {
    // Entrada tool-first "Planejamento → Cliente" (GOVERNANCA.md) — mirror do
    // "Nova simulação": sem cliente fixo, sem header/tabs do cliente ao redor
    // (só sidebar + topbar do Shell), igual ao frame Figma
    // "planejamento-novo-sem-cliente". A Etapa 1 do wizard embute o seletor
    // de cliente; ao salvar/calcular, upserta via commitPlanDraft (mesmo
    // handler do fluxo client-first) e aterrissa na aba Planejamento do
    // cliente escolhido.
    content = (
      <window.PlanningWizard
        client={null}
        plan={null}
        clients={clientsWithPlanFlag}
        onCancel={() => navigate('home', {})}
        onSaveDraft={(draft, clientId) => { commitPlanDraft(clientId, draft, 'em_construcao'); openClient(clientId, { tab: 'planning' }); }}
        onCalculate={(draft, clientId) => { commitPlanDraft(clientId, draft, 'em_construcao'); openClient(clientId, { tab: 'planning' }); }}
      />
    );
  } else if (page === 'operations') {
    content = (
      <OperationsPage
        profile={profile}
        clients={scopedClients}
        operations={scopedOperations}
        now={DATA.now}
        onOpenOperation={openOperationDetail}
      />
    );
  } else if (page === 'operationDetail' && selectedOperation) {
    content = (
      <OperationDetailPage
        operation={selectedOperation}
        client={DATA.clients.find((c) => c.id === selectedOperation.clientId)}
        profile={profile}
        now={DATA.now}
        onBack={() => navigate('operations', {})}
        onPatch={patchOperation}
        onOpenTicketFor={openTicketModal}
        onOpenClient={openClient}
      />
    );
  } else if (page === 'support') {
    content = (
      <SupportPage
        profile={profile}
        clients={scopedClients}
        tickets={scopedTickets}
        openTicketId={openTicketId}
        onOpenTicket={setOpenTicketId}
        onCloseTicket={() => setOpenTicketId(null)}
        onAddMessage={addTicketMessage}
        onResolve={resolveTicket}
      />
    );
  } else if (COMING_SOON_KEYS.indexOf(page) !== -1) {
    content = <ComingSoonPage pageKey={page} />;
  }

  const orderForClientDrawer = page === 'client' && openOrderId ? orders.find((o) => o.id === openOrderId) : null;
  const requestForClientDrawer = page === 'client' && openRequestId ? serviceRequests.find((r) => r.id === openRequestId) : null;
  // Fase 9 — chip "Cliente: X" na topbar enquanto há uma recomendação em
  // andamento (carrinho com cliente anexado), como no mockup de referência.
  const activeCartClient = cart && cart.clientId ? DATA.clients.find((c) => c.id === cart.clientId) : null;

  return (
    <Shell
      profile={profile}
      profiles={DATA.profiles}
      onChangeProfile={changeProfile}
      current={page}
      pageParams={pageParams}
      onNavigate={navigate}
      alertsCount={unresolvedAlertsCount}
      search={search}
      onSearchChange={setSearch}
      onSearchSubmit={() => navigate('clients', {})}
      breadcrumb={breadcrumbFor()}
      activeCartClient={activeCartClient}
      onResumeCart={() => enterCatalogFlow(activeCartClient.id, [], null)}
    >
      {content}

      {orderForClientDrawer && (
        <window.OrderDetailDrawer
          order={orderForClientDrawer}
          client={DATA.clients.find((c) => c.id === orderForClientDrawer.clientId)}
          canOperate={profile.permissions.canRetryOrders}
          onClose={() => setOpenOrderId(null)}
          onRetry={retryOrder}
          onCancel={cancelOrder}
          onResendNotification={resendOrderNotification}
          onOpenTicket={openTicketModal}
        />
      )}

      {requestForClientDrawer && (
        <window.ServiceRequestDrawer
          request={requestForClientDrawer}
          client={DATA.clients.find((c) => c.id === requestForClientDrawer.clientId)}
          canOperateDirectly={profile.permissions.canOperateDirectly}
          onClose={() => setOpenRequestId(null)}
          onAdvance={advanceServiceRequest}
          onOpenTicket={() => openTicketModal(DATA.clients.find((c) => c.id === requestForClientDrawer.clientId), 'service', requestForClientDrawer.id, `Solicitação ${requestForClientDrawer.protocol}`)}
        />
      )}

      {newTicketContext && (
        <NewTicketModal
          client={newTicketContext.client}
          contextType={newTicketContext.contextType}
          contextId={newTicketContext.contextId}
          contextLabel={newTicketContext.contextLabel}
          suggestedTheme={newTicketContext.suggestedTheme || TICKET_SUGGESTED_THEME[newTicketContext.contextType]}
          onCreate={submitNewTicket}
          onClose={() => setNewTicketContext(null)}
        />
      )}

      {showLinkRequest && (
        <ConfirmAction
          title="Solicitar vínculo com cliente"
          description="Esta ação simula o início de uma solicitação de vínculo/permissão para um gestor aprovar. Nenhuma solicitação real é criada neste protótipo."
          confirmLabel="Enviar solicitação (simulado)"
          onConfirm={() => {}}
          onClose={() => setShowLinkRequest(false)}
        />
      )}
    </Shell>
  );
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(<App />);

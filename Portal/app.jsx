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
  const [tickets, setTickets] = React.useState(DATA.tickets);
  const [openRequestId, setOpenRequestId] = React.useState(null);
  const [openTicketId, setOpenTicketId] = React.useState(null);
  const [newTicketContext, setNewTicketContext] = React.useState(null);

  const profile = DATA.profiles.find((p) => p.id === profileId);
  const scopedClients = React.useMemo(() => clientsInScope(profile, DATA.clients), [profile, DATA.clients]);
  const scopedClientIds = React.useMemo(() => new Set(scopedClients.map((c) => c.id)), [scopedClients]);
  const scopedAlerts = React.useMemo(() => alerts.filter((a) => scopedClientIds.has(a.clientId)), [alerts, scopedClientIds]);
  const scopedOrders = React.useMemo(() => orders.filter((o) => scopedClientIds.has(o.clientId)), [orders, scopedClientIds]);
  const scopedSimulations = React.useMemo(() => simulations.filter((s) => scopedClientIds.has(s.clientId)), [simulations, scopedClientIds]);
  const scopedServiceRequests = React.useMemo(() => serviceRequests.filter((r) => scopedClientIds.has(r.clientId)), [serviceRequests, scopedClientIds]);
  const scopedTickets = React.useMemo(() => tickets.filter((t) => scopedClientIds.has(t.clientId)), [tickets, scopedClientIds]);
  const unresolvedAlertsCount = scopedAlerts.filter((a) => a.status === 'novo' || a.status === 'em_tratamento').length;

  function navigate(key, params) {
    setPage(key);
    setPageParams(params || {});
    if (key !== 'client') setSelectedClientId(null);
  }

  function openClient(id) {
    setSelectedClientId(id);
    setPage('client');
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

  function newSimulation(clientId) {
    const id = uid();
    setSimulations((prev) => [
      ...prev,
      { id, clientId, name: 'Nova simulação', status: 'rascunho', createdBy: profile.name, createdAt: DATA.now, updatedAt: DATA.now, items: [], reportGeneratedAt: null, version: 1 },
    ]);
    navigate('simulator', { simulationId: id });
  }

  function openSimulation(id) {
    navigate('simulator', { simulationId: id });
  }

  function addProductToProposal(clientId, product) {
    const existingDraft = simulations.find((s) => s.clientId === clientId && s.status === 'rascunho');
    if (existingDraft) {
      const alreadyIn = existingDraft.items.some((it) => it.productId === product.id);
      if (!alreadyIn) {
        setSimulations((prev) =>
          prev.map((s) => (s.id === existingDraft.id ? { ...s, items: [...s.items, { productId: product.id, allocatedValue: product.minApplication }], updatedAt: DATA.now } : s))
        );
      }
      navigate('simulator', { simulationId: existingDraft.id });
      return;
    }
    const id = uid();
    setSimulations((prev) => [
      ...prev,
      {
        id,
        clientId,
        name: 'Nova simulação',
        status: 'rascunho',
        createdBy: profile.name,
        createdAt: DATA.now,
        updatedAt: DATA.now,
        items: [{ productId: product.id, allocatedValue: product.minApplication }],
        reportGeneratedAt: null,
        version: 1,
      },
    ]);
    navigate('simulator', { simulationId: id });
  }

  function updateSimulationName(id, name) {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, name, updatedAt: DATA.now } : s)));
  }

  function updateSimulationItems(id, items) {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, items, updatedAt: DATA.now } : s)));
  }

  function updateSimulationStatus(id, status) {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, status, updatedAt: DATA.now, version: (s.version || 1) + 1 } : s)));
  }

  function generateSimulationReport(id) {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, reportGeneratedAt: DATA.now } : s)));
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

  function openTicketModal(client, contextType, contextId, contextLabel) {
    setNewTicketContext({ client, contextType, contextId, contextLabel });
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

  const breadcrumbFor = () => {
    const navLabel = (key) => (window.PORTAL_NAV_ITEMS.find((n) => n.key === key) || {}).label || key;
    if (page === 'home') return [{ label: 'Visão geral' }];
    if (page === 'clients') return [{ label: 'Clientes' }];
    if (page === 'client' && selectedClient) return [{ label: 'Clientes', onClick: () => navigate('clients', {}) }, { label: selectedClient.name }];
    if (page === 'orders') return [{ label: 'Central de ordens' }];
    if (page === 'onboarding') return [{ label: 'Onboarding e pendências' }];
    if (page === 'alerts') return [{ label: 'Central de alertas' }];
    if (page === 'products') return [{ label: 'Produtos' }];
    if (page === 'recommendations') return [{ label: 'Recomendações' }];
    if (page === 'operations') return [{ label: 'Operações' }];
    if (page === 'support') return [{ label: 'Central de suporte' }];
    if (page === 'simulator') {
      return [
        { label: 'Recomendações', onClick: () => navigate('recommendations', {}) },
        { label: openSimulationObj ? openSimulationObj.name : 'Simulador' },
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
        search={search}
        initialFilters={pageParams}
        onOpenClient={openClient}
        onRequestLink={() => setShowLinkRequest(true)}
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
        now={DATA.now}
        onBack={() => navigate('clients', {})}
        onOpenOrder={(id) => setOpenOrderId(id)}
        onOpenSimulation={openSimulation}
        onNewSimulation={() => newSimulation(selectedClient.id)}
        onOpenServiceRequest={(id) => setOpenRequestId(id)}
        onCreateServiceRequest={createServiceRequest}
        onOpenTicket={openTicketModal}
      />
    );
  } else if (page === 'orders') {
    content = (
      <OrdersPage
        profile={profile}
        clients={scopedClients}
        orders={scopedOrders}
        initialFilters={pageParams}
        openOrderId={openOrderId}
        onOpenOrder={setOpenOrderId}
        onCloseOrder={() => setOpenOrderId(null)}
        onRetryOrder={retryOrder}
        onCancelOrder={cancelOrder}
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
    content = <ProductsPage profile={profile} clients={scopedClients} products={DATA.products} now={DATA.now} initialFilters={pageParams} onAddToProposal={addProductToProposal} />;
  } else if (page === 'recommendations') {
    content = (
      <RecommendationsPage
        profile={profile}
        clients={scopedClients}
        simulations={scopedSimulations}
        products={DATA.products}
        now={DATA.now}
        onOpenSimulation={openSimulation}
        onNewSimulation={newSimulation}
        onSendBasket={sendBasket}
      />
    );
  } else if (page === 'simulator' && openSimulationObj) {
    content = (
      <SimulatorPage
        simulation={openSimulationObj}
        client={DATA.clients.find((c) => c.id === openSimulationObj.clientId)}
        positions={DATA.portfolioPositions.filter((p) => p.clientId === openSimulationObj.clientId)}
        products={DATA.products}
        now={DATA.now}
        profile={profile}
        onUpdateName={updateSimulationName}
        onUpdateItems={updateSimulationItems}
        onUpdateStatus={updateSimulationStatus}
        onGenerateReport={generateSimulationReport}
        onBack={() => navigate('recommendations', {})}
      />
    );
  } else if (page === 'operations') {
    content = (
      <OperationsPage
        profile={profile}
        clients={scopedClients}
        serviceRequests={scopedServiceRequests}
        openRequestId={openRequestId}
        onOpenRequest={setOpenRequestId}
        onCloseRequest={() => setOpenRequestId(null)}
        onAdvanceRequest={advanceServiceRequest}
        onOpenTicketFor={openTicketModal}
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
          suggestedTheme={TICKET_SUGGESTED_THEME[newTicketContext.contextType]}
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

// US-14 — Serviços operacionais: central de acompanhamento cross-cliente.
// A execução em si (resetar credencial, bloquear preventivamente etc.)
// acontece a partir da aba Banking da ficha do cliente — aqui só se
// acompanha o protocolo até a conclusão, como pede o critério 4 do US-14.

function ServiceRequestDrawer({ request, client, canOperateDirectly, onClose, onAdvance, onOpenTicket }) {
  const { SERVICE_TYPE_META, SERVICE_REQUEST_STATUS_META, formatDateTime } = window.PortalLib;
  const [confirmStep, setConfirmStep] = React.useState(null); // 'start' | 'auth' | 'conclude'
  const meta = SERVICE_TYPE_META[request.type];

  return (
    <React.Fragment>
      <Drawer title={meta.label} subtitle={`${client.name} · protocolo ${request.protocol}`} onClose={onClose}>
        <div className="flex items-center gap-2 mb-4">
          <StatusPill label={SERVICE_REQUEST_STATUS_META[request.status].label} className={SERVICE_REQUEST_STATUS_META[request.status].className} />
          <span className="text-xs text-neutral-400">prazo {formatDateTime(request.dueAt)}</span>
        </div>

        <p className="text-sm text-neutral-700 mb-4">{request.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="rounded-large border border-neutral-100 p-3">
            <div className="text-[11px] text-neutral-400">Solicitado por</div>
            <div className="font-medium text-neutral-900">{request.requestedBy}</div>
          </div>
          <div className="rounded-large border border-neutral-100 p-3">
            <div className="text-[11px] text-neutral-400">Aberto em</div>
            <div className="font-medium text-neutral-900">{formatDateTime(request.requestedAt)}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {canOperateDirectly && request.status === 'aberta' && (
            <button onClick={() => setConfirmStep('start')} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
              <Icon name="refresh" size={14} /> Iniciar atendimento
            </button>
          )}
          {canOperateDirectly && request.status === 'em_andamento' && (
            <button onClick={() => setConfirmStep('auth')} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
              <Icon name="shield" size={14} /> Concluir com autenticação reforçada
            </button>
          )}
          {!canOperateDirectly && request.status !== 'concluida' && (
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Icon name="shield" size={13} /> Só Daily Banker/Administrador executam esta ação diretamente neste cenário.
            </span>
          )}
          <button onClick={onOpenTicket} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5">
            <Icon name="lifeBuoy" size={14} /> Abrir chamado
          </button>
        </div>

        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Trilha de auditoria</h3>
        <ol className="relative border-l border-neutral-100 ml-2 space-y-5">
          {request.timeline.map((t, i) => (
            <li key={i} className="ml-4">
              <span className="absolute -ml-[25px] mt-1 w-2.5 h-2.5 rounded-full bg-brand" />
              <div className="text-xs text-neutral-400">{formatDateTime(t.date)}</div>
              <div className="text-sm text-neutral-800">{t.detail}</div>
            </li>
          ))}
        </ol>
      </Drawer>

      {confirmStep === 'start' && (
        <ConfirmAction
          title="Iniciar atendimento"
          description="A solicitação passa para “Em andamento”. Ação simulada, sem efeito em sistema real."
          confirmLabel="Iniciar"
          onConfirm={() => onAdvance(request.id, 'em_andamento', 'Atendimento iniciado.')}
          onClose={() => setConfirmStep(null)}
        />
      )}
      {confirmStep === 'auth' && (
        <ConfirmAction
          title="Confirme sua identidade"
          description="Etapa de autenticação reforçada simulada — em um ambiente real, exigiria segundo fator antes de concluir uma ação sensível."
          confirmLabel="Identidade confirmada"
          onConfirm={() => setTimeout(() => setConfirmStep('conclude'), 0)}
          onClose={() => setConfirmStep(null)}
        />
      )}
      {confirmStep === 'conclude' && (
        <ConfirmAction
          title="Concluir solicitação"
          description="A solicitação passa para “Concluída” e a ação fica registrada na trilha de auditoria. Ação simulada."
          confirmLabel="Concluir"
          onConfirm={() => onAdvance(request.id, 'concluida', 'Ação executada e solicitação concluída (ação simulada, autenticação reforçada confirmada).')}
          onClose={() => setConfirmStep(null)}
        />
      )}
    </React.Fragment>
  );
}

function OperationsPage({ profile, clients, serviceRequests, openRequestId, onOpenRequest, onCloseRequest, onAdvanceRequest, onOpenTicketFor }) {
  const { SERVICE_TYPE_META, SERVICE_REQUEST_STATUS_META, formatDateTime } = window.PortalLib;
  const [type, setType] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [clientQuery, setClientQuery] = React.useState('');
  const loading = window.useSimulatedLoading(`${profile.id}|${type}|${status}|${clientQuery}`, 300);

  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem solicitações para exibir" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));
  const scoped = serviceRequests.filter((r) => clientMap[r.clientId]);
  const filtered = scoped.filter(
    (r) => (!type || r.type === type) && (!status || r.status === status) && (!clientQuery || clientMap[r.clientId].name.toLowerCase().includes(clientQuery.toLowerCase()))
  );

  const openRequest = scoped.find((r) => r.id === openRequestId) || null;

  const columns = [
    { key: 'clientName', label: 'Cliente', render: (r) => clientMap[r.clientId].name },
    { key: 'type', label: 'Tipo', render: (r) => SERVICE_TYPE_META[r.type].label },
    { key: 'description', label: 'Descrição' },
    { key: 'protocol', label: 'Protocolo' },
    { key: 'status', label: 'Status', render: (r) => <StatusPill label={SERVICE_REQUEST_STATUS_META[r.status].label} className={SERVICE_REQUEST_STATUS_META[r.status].className} size="sm" /> },
    { key: 'dueAt', label: 'Prazo', render: (r) => formatDateTime(r.dueAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Operações</h1>
          <p className="text-sm text-neutral-500">{filtered.length} solicitação{filtered.length === 1 ? '' : 'ões'} no seu escopo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Filtrar por cliente…" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 w-56" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os tipos</option>
            {Object.entries(SERVICE_TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            {Object.entries(SERVICE_REQUEST_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(r) => onOpenRequest(r.id)} emptyLabel="Nenhuma solicitação para esses filtros." />
      )}

      {openRequest && (
        <ServiceRequestDrawer
          request={openRequest}
          client={clientMap[openRequest.clientId]}
          canOperateDirectly={profile.permissions.canOperateDirectly}
          onClose={onCloseRequest}
          onAdvance={onAdvanceRequest}
          onOpenTicket={() => onOpenTicketFor(clientMap[openRequest.clientId], 'service', openRequest.id, `Solicitação ${openRequest.protocol}`)}
        />
      )}
    </div>
  );
}

window.OperationsPage = OperationsPage;
window.ServiceRequestDrawer = ServiceRequestDrawer;

// US-09 — Central de ordens: acompanhamento único de envio, aprovação,
// execução, erro e cancelamento (tudo simulado, estado só local).

const CANCELABLE_STATUSES = ['rascunho', 'enviada', 'aguardando_aprovacao', 'aprovada'];

function OrderDetailDrawer({ order, client, canOperate, onClose, onRetry, onCancel, onOpenTicket }) {
  const { ORDER_STATUS_META, formatCurrency, formatDateTime } = window.PortalLib;
  const [confirmKind, setConfirmKind] = React.useState(null); // 'retry' | 'cancel'
  const canRetry = order.retriable && canOperate;
  const canCancel = CANCELABLE_STATUSES.indexOf(order.status) !== -1 && canOperate;

  return (
    <React.Fragment>
      <Drawer title={order.asset} subtitle={`Ordem ${order.id} · ${client ? client.name : order.clientId}`} onClose={onClose}>
        <div className="flex items-center gap-2 mb-4">
          <StatusPill label={ORDER_STATUS_META[order.status].label} className={ORDER_STATUS_META[order.status].className} />
          <span className="text-sm font-medium text-neutral-900">{formatCurrency(order.value)}</span>
          <span className="text-xs text-neutral-400">{order.type}</span>
        </div>

        {order.status === 'erro' && (
          <div className="flex items-start gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2.5 mb-4">
            <Icon name="alertTriangle" size={15} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">{order.errorReason}</div>
              <div className="mt-0.5">Ação recomendada: {order.errorAction}</div>
            </div>
          </div>
        )}
        {order.status === 'recusada' && (
          <div className="flex items-start gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2.5 mb-4">
            <Icon name="alertTriangle" size={15} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">{order.errorReason}</div>
              <div className="mt-0.5">Ação recomendada: {order.errorAction}</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {canRetry && (
            <button onClick={() => setConfirmKind('retry')} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
              <Icon name="refresh" size={14} /> Reenviar ordem
            </button>
          )}
          {canCancel && (
            <button onClick={() => setConfirmKind('cancel')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5">
              <Icon name="x" size={14} /> Cancelar ordem
            </button>
          )}
          {!canOperate && (order.retriable || CANCELABLE_STATUSES.indexOf(order.status) !== -1) && (
            <span className="text-xs text-neutral-400 flex items-center gap-1.5"><Icon name="shield" size={13} /> Seu perfil não tem permissão para operar ordens.</span>
          )}
          {onOpenTicket && (
            <button
              onClick={() => onOpenTicket(client, 'order', order.id, `Ordem ${order.asset}`)}
              className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <Icon name="lifeBuoy" size={14} /> Abrir chamado
            </button>
          )}
        </div>

        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Linha do tempo</h3>
        <ol className="relative border-l border-neutral-100 ml-2 space-y-5">
          {order.timeline.map((t, i) => (
            <li key={i} className="ml-4">
              <span className="absolute -ml-[25px] mt-1 w-2.5 h-2.5 rounded-full bg-brand" />
              <div className="text-xs text-neutral-400">{formatDateTime(t.date)}</div>
              <div className="text-sm text-neutral-800">{t.detail}</div>
            </li>
          ))}
        </ol>
      </Drawer>

      {confirmKind === 'retry' && (
        <ConfirmAction
          title="Reenviar ordem"
          description="A ordem volta para o status &quot;Aguardando aprovação&quot;. Esta é uma simulação — nada é enviado a um sistema real."
          confirmLabel="Reenviar"
          onConfirm={() => onRetry(order.id)}
          onClose={() => setConfirmKind(null)}
        />
      )}
      {confirmKind === 'cancel' && (
        <ConfirmAction
          title="Cancelar ordem"
          description="A ordem passa para o status &quot;Cancelada&quot; apenas neste protótipo."
          confirmLabel="Cancelar ordem"
          tone="alert"
          onConfirm={() => onCancel(order.id)}
          onClose={() => setConfirmKind(null)}
        />
      )}
    </React.Fragment>
  );
}

function OrdersPage({ profile, clients, orders, initialFilters, openOrderId, onOpenOrder, onCloseOrder, onRetryOrder, onCancelOrder, onOpenTicket }) {
  const { ORDER_STATUS_META, formatCurrency, formatDateTime } = window.PortalLib;
  const [status, setStatus] = React.useState((initialFilters && initialFilters.status) || '');
  const [clientQuery, setClientQuery] = React.useState('');
  const loading = window.useSimulatedLoading(`${profile.id}|${status}|${clientQuery}`, 320);

  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem ordens para exibir" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }
  if (profile.permissions.menu.indexOf('orders') === -1) {
    return <window.NoPermissionState title="Sem permissão para a central de ordens" description="Este perfil não tem acesso a ordens. Fale com um gestor para revisar as permissões." />;
  }

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));
  const scoped = orders.filter((o) => clientMap[o.clientId]);
  const filtered = scoped.filter(
    (o) => (!status || o.status === status) && (!clientQuery || clientMap[o.clientId].name.toLowerCase().includes(clientQuery.toLowerCase()))
  );

  const openOrder = filtered.find((o) => o.id === openOrderId) || scoped.find((o) => o.id === openOrderId);

  const columns = [
    { key: 'clientName', label: 'Cliente', render: (o) => clientMap[o.clientId] ? clientMap[o.clientId].name : o.clientId },
    { key: 'asset', label: 'Ativo' },
    { key: 'type', label: 'Tipo' },
    { key: 'value', label: 'Valor', render: (o) => formatCurrency(o.value) },
    { key: 'author', label: 'Autor' },
    { key: 'sentAt', label: 'Enviada em', render: (o) => formatDateTime(o.sentAt) },
    { key: 'status', label: 'Status', render: (o) => <StatusPill label={ORDER_STATUS_META[o.status].label} className={ORDER_STATUS_META[o.status].className} size="sm" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Central de ordens</h1>
          <p className="text-sm text-neutral-500">{filtered.length} ordem{filtered.length === 1 ? '' : 's'} no seu escopo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Filtrar por cliente…" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 w-56" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            {Object.entries(ORDER_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={() => window.PortalLib.download('ordens.json', JSON.stringify(filtered, null, 2))}
            className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
          >
            <Icon name="download" size={14} /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(o) => onOpenOrder(o.id)} emptyLabel="Nenhuma ordem para esses filtros." />
      )}

      {openOrder && (
        <OrderDetailDrawer
          order={openOrder}
          client={clientMap[openOrder.clientId]}
          canOperate={profile.permissions.canRetryOrders}
          onClose={onCloseOrder}
          onRetry={onRetryOrder}
          onCancel={onCancelOrder}
          onOpenTicket={onOpenTicket}
        />
      )}
    </div>
  );
}

window.OrdersPage = OrdersPage;
window.OrderDetailDrawer = OrderDetailDrawer;

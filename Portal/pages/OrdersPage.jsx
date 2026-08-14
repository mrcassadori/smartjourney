// US-09 — Central de ordens: acompanhamento único de envio, aprovação,
// execução, erro e cancelamento (tudo simulado, estado só local).

const CANCELABLE_STATUSES = ['rascunho', 'enviada', 'aguardando_aprovacao', 'aprovada'];

function OrderDetailDrawer({ order, client, canOperate, onClose, onRetry, onCancel, onResendNotification, onOpenTicket }) {
  const { ORDER_STATUS_META, formatCurrency, formatDateTime } = window.PortalLib;
  const [confirmKind, setConfirmKind] = React.useState(null); // 'retry' | 'cancel' | 'notify'
  const [notified, setNotified] = React.useState(false);
  const canRetry = order.retriable && canOperate;
  const canCancel = CANCELABLE_STATUSES.indexOf(order.status) !== -1 && canOperate;
  // Reenviar notificação faz sentido para ordens que aguardam ação do cliente.
  const canNotify = onResendNotification && (order.status === 'aguardando_aprovacao' || order.status === 'enviada');
  const isProblem = order.status === 'erro' || order.status === 'recusada';

  return (
    <React.Fragment>
      <Drawer title={order.asset} subtitle={`Ordem ${order.id} · ${client ? client.name : order.clientId}`} onClose={onClose}>
        <div className="flex items-center gap-2 mb-4">
          <StatusPill label={ORDER_STATUS_META[order.status].label} className={ORDER_STATUS_META[order.status].className} />
          <span className="text-sm font-medium text-neutral-900">{formatCurrency(order.value)}</span>
          <span className="text-xs text-neutral-400">{order.type}</span>
        </div>

        {isProblem && (
          <div className="bg-alert-light text-alert-dark rounded-medium px-3 py-3 mb-4">
            <div className="flex items-center gap-2 font-medium mb-2"><Icon name="alertTriangle" size={15} className="shrink-0" /> {order.status === 'erro' ? 'Ordem com erro' : 'Ordem recusada'}</div>
            <dl className="space-y-1.5 text-sm">
              <div><dt className="text-[11px] uppercase tracking-wide opacity-70">O que aconteceu</dt><dd>{order.errorReason}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wide opacity-70">Impacto</dt><dd>{order.errorImpact || 'A ordem não foi concluída; nenhuma posição foi criada por ela.'}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wide opacity-70">Próxima ação</dt><dd>{order.errorAction}</dd></div>
            </dl>
          </div>
        )}

        {notified && (
          <div className="flex items-center gap-2 text-sm bg-success-light text-success-dark rounded-medium px-3 py-2 mb-4">
            <Icon name="check" size={15} /> Notificação reenviada ao cliente (ação simulada).
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {canRetry && (
            <button onClick={() => setConfirmKind('retry')} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
              <Icon name="refresh" size={14} /> Reenviar ordem
            </button>
          )}
          {canNotify && (
            <button onClick={() => setConfirmKind('notify')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5">
              <Icon name="inbox" size={14} /> Reenviar notificação
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
      {confirmKind === 'notify' && (
        <ConfirmAction
          title="Reenviar notificação"
          description="Reenvia ao cliente o aviso para revisar e aprovar esta recomendação. Registrado na linha do tempo (ação simulada)."
          confirmLabel="Reenviar notificação"
          onConfirm={() => { onResendNotification(order.id); setNotified(true); setConfirmKind(null); }}
          onClose={() => setConfirmKind(null)}
        />
      )}
    </React.Fragment>
  );
}

// EP-02 (Tela 08) — recomendações enviadas: KPIs + linhas #REC expansíveis.
function RecommendationsSection({ recommendations, clientMap }) {
  const { REC_STATUS_META, formatCurrency, formatDateTime, strategyClassLabel } = window.PortalLib;
  const [expanded, setExpanded] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState('');
  if (!recommendations || recommendations.length === 0) return null;

  const kpi = (k) => recommendations.filter((r) => r.status === k).length;
  const kpis = [
    { v: kpi('aguardando_cliente'), l: 'Aguardando cliente' },
    { v: kpi('aprovada'), l: 'Aprovadas' },
    { v: kpi('em_processamento'), l: 'Em processamento' },
    { v: kpi('executada'), l: 'Executadas' },
    { v: recommendations.reduce((s, r) => s + (r.pendencias || 0), 0), l: 'Pendências', accent: 'alert' },
  ];
  const rows = recommendations.filter((r) => !statusFilter || r.status === statusFilter);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.l} className="bg-white border border-neutral-100 rounded-large px-4 py-3">
            <div className={window.PortalLib.classNames('text-2xl font-semibold', k.accent === 'alert' ? 'text-alert' : 'text-neutral-900')}>{k.v}</div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-400 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">Recomendações</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todos os status</option>
          {Object.entries(REC_STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-neutral-50">
            <tr>{['Cliente', 'Recomendação', 'Valor', 'Ativos', 'Data', 'Status', 'Pendências'].map((h) => <th key={h} className="text-left font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cli = clientMap[r.clientId];
              const st = REC_STATUS_META[r.status] || { label: r.status, className: 'bg-neutral-100 text-neutral-600' };
              const open = expanded === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr className="border-b border-neutral-50 last:border-0 cursor-pointer hover:bg-neutral-50" onClick={() => setExpanded(open ? null : r.id)}>
                    <td className="px-4 py-3 font-medium text-neutral-900">{cli ? cli.name : r.clientId}</td>
                    <td className="px-4 py-3 text-neutral-600">#{r.id}</td>
                    <td className="px-4 py-3 text-neutral-700">{formatCurrency(r.value)}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.items.length} ativo{r.items.length === 1 ? '' : 's'}</td>
                    <td className="px-4 py-3 text-neutral-500">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3"><StatusPill label={st.label} className={st.className} size="sm" /></td>
                    <td className="px-4 py-3 text-neutral-500 flex items-center gap-1">{r.pendencias > 0 ? <span className="text-alert-dark font-medium">{r.pendencias}</span> : 'Nenhuma'}<Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} className="text-neutral-300" /></td>
                  </tr>
                  {open && (
                    <tr className="bg-neutral-50/50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="border border-neutral-100 rounded-large bg-white divide-y divide-neutral-50">
                          {r.items.map((it, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                              <span className="font-medium text-neutral-800 flex-1">{it.asset}</span>
                              <span className="text-neutral-400 w-28">{strategyClassLabel(it.class)}</span>
                              <span className="text-neutral-600 w-28 text-right">{formatCurrency(it.value)}</span>
                              <span className="text-neutral-500 w-28 text-right">{it.rate}</span>
                              <StatusPill label={it.status === 'executado' ? 'Executado' : 'Validado'} className={it.status === 'executado' ? 'bg-success-light text-success-dark' : 'bg-info-light text-info-dark'} size="sm" />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersPage({ profile, clients, orders, recommendations, initialFilters, openOrderId, onOpenOrder, onCloseOrder, onRetryOrder, onCancelOrder, onResendNotification, onOpenTicket }) {
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
    <div className="space-y-5">
      <RecommendationsSection recommendations={recommendations} clientMap={clientMap} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Central de ordens</h1>
          <p className="text-sm text-neutral-500">{filtered.length} ordem{filtered.length === 1 ? '' : 's'} no seu escopo · execução individual dos ativos</p>
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
          onResendNotification={onResendNotification}
          onOpenTicket={onOpenTicket}
        />
      )}
    </div>
  );
}

window.OrdersPage = OrdersPage;
window.OrderDetailDrawer = OrderDetailDrawer;

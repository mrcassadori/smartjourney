// US-07 — Central de alertas e oportunidades acionáveis.

function AlertsPage({ profile, clients, alerts, initialFilters, now, onOpenClient, onUpdateStatus }) {
  const { ALERT_TYPE_META, ALERT_PRIORITY_META, ALERT_STATUS_META, formatDate } = window.PortalLib;
  const [type, setType] = React.useState((initialFilters && initialFilters.type) || '');
  const [priority, setPriority] = React.useState('');
  const [status, setStatus] = React.useState('');
  const loading = window.useSimulatedLoading(`${profile.id}|${type}|${priority}|${status}`, 320);

  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem alertas para exibir" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));

  const filtered = alerts.filter((a) => (!type || a.type === type) && (!priority || a.priority === priority) && (!status || a.status === status));

  // Agrupa alertas repetidos do mesmo cliente + tipo, como pedido no critério 5.
  const groupedMap = {};
  filtered.forEach((a) => {
    const key = `${a.clientId}|${a.type}`;
    groupedMap[key] = groupedMap[key] || [];
    groupedMap[key].push(a);
  });
  const groups = Object.values(groupedMap).sort((a, b) => {
    const pa = a[0].priority === 'alta' ? 0 : a[0].priority === 'media' ? 1 : 2;
    const pb = b[0].priority === 'alta' ? 0 : b[0].priority === 'media' ? 1 : 2;
    return pa - pb || new Date(b[0].date) - new Date(a[0].date);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Central de alertas</h1>
          <p className="text-sm text-neutral-500">{filtered.length} alerta{filtered.length === 1 ? '' : 's'} no seu escopo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os tipos</option>
            {Object.entries(ALERT_TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todas as prioridades</option>
            {Object.entries(ALERT_PRIORITY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            {Object.entries(ALERT_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : groups.length === 0 ? (
        <window.EmptyState icon="check" title="Nenhum alerta para esses filtros" description="Ajuste tipo, prioridade ou status para ver outros alertas." />
      ) : (
        <div className="space-y-3">
          {groups.map((group, gi) => {
            const first = group[0];
            const client = clientMap[first.clientId];
            const meta = ALERT_TYPE_META[first.type];
            return (
              <div key={gi} className="bg-white rounded-large border border-neutral-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-50 text-neutral-500 flex items-center justify-center shrink-0">
                    <Icon name={meta.icon} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => client && onOpenClient(client.id)} className="font-medium text-neutral-900 hover:underline">
                        {client ? client.name : first.clientId}
                      </button>
                      <span className="text-sm text-neutral-500">{meta.label}</span>
                      {group.length > 1 && <StatusPill label={`${group.length} ocorrências`} className="bg-neutral-100 text-neutral-600" size="sm" />}
                      <StatusPill label={ALERT_PRIORITY_META[first.priority].label} className={ALERT_PRIORITY_META[first.priority].className} size="sm" />
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">{first.justification}</div>
                    <div className="text-xs text-brand-dark mt-1">Próxima ação: {first.recommendedAction}</div>
                    <div className="text-[11px] text-neutral-400 mt-1">{formatDate(first.date)}</div>
                  </div>
                  <div className="shrink-0">
                    <select
                      value={first.status}
                      onChange={(e) => onUpdateStatus(first.id, e.target.value)}
                      className="text-xs border border-neutral-200 rounded-pill px-2.5 py-1"
                    >
                      {Object.entries(ALERT_STATUS_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.AlertsPage = AlertsPage;

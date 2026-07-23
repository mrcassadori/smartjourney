// US-08 — Onboarding, ativação e pendências acompanhados em massa.

function OnboardingDrawer({ entry, client, onClose, onResend, onOpenTicket }) {
  const { ONBOARDING_STATUS_META, formatDateTime, formatDate } = window.PortalLib;
  const [copied, setCopied] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  return (
    <Drawer title={client.name} subtitle={`Onboarding · conta ${client.account}`} onClose={onClose}>
      <div className="flex items-center gap-2 mb-4">
        <StatusPill label={ONBOARDING_STATUS_META[entry.status].label} className={ONBOARDING_STATUS_META[entry.status].className} />
        <span className="text-xs text-neutral-400">última comunicação em {formatDateTime(entry.lastCommunicationAt)}</span>
      </div>

      {entry.pendingReason && (
        <div className="flex items-start gap-2 text-sm bg-warning-light text-warning-dark rounded-medium px-3 py-2.5 mb-4">
          <Icon name="alertTriangle" size={15} className="mt-0.5 shrink-0" />
          <span>{entry.pendingReason}. Causa e canal de resolução: acompanhamento direto com o cliente, sem necessidade de acionar suporte para este passo.</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => {
            onResend();
            setResent(true);
          }}
          className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5"
        >
          <Icon name="refresh" size={14} /> {resent ? 'Reenviado (simulado)' : 'Reenviar comunicação'}
        </button>
        <button
          onClick={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-50"
        >
          <Icon name="copy" size={14} /> {copied ? 'Instruções copiadas!' : 'Copiar instruções para o cliente'}
        </button>
        <button
          onClick={() => onOpenTicket(client, 'onboarding', entry.id, `Onboarding de ${client.name}`)}
          className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-50"
        >
          <Icon name="lifeBuoy" size={14} /> Abrir chamado
        </button>
      </div>

      <h3 className="text-sm font-semibold text-neutral-800 mb-3">Linha do tempo</h3>
      <ol className="relative border-l border-neutral-100 ml-2 space-y-5">
        {entry.timeline.map((t, i) => (
          <li key={i} className="ml-4">
            <span className="absolute -ml-[25px] mt-1 w-2.5 h-2.5 rounded-full bg-brand" />
            <div className="text-xs text-neutral-400">{formatDate(t.date)}</div>
            <div className="text-sm text-neutral-800">{t.detail}</div>
          </li>
        ))}
      </ol>
    </Drawer>
  );
}

function OnboardingPage({ profile, clients, onboarding, onOpenClient, onOpenTicket }) {
  const { ONBOARDING_STATUS_META, formatDate, OWNER_NAME_MAP } = window.PortalLib;
  const [status, setStatus] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [openEntryId, setOpenEntryId] = React.useState(null);
  const loading = window.useSimulatedLoading(`${profile.id}|${status}|${reason}`, 320);

  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem clientes em onboarding" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));
  const scoped = onboarding.filter((o) => clientMap[o.clientId]);
  const filtered = scoped.filter((o) => (!status || o.status === status) && (!reason || (o.pendingReason || '').toLowerCase().includes(reason.toLowerCase())));

  const openEntry = filtered.find((o) => o.id === openEntryId);

  const columns = [
    { key: 'clientName', label: 'Cliente', render: (o) => clientMap[o.clientId].name },
    { key: 'escritorio', label: 'Escritório', render: (o) => clientMap[o.clientId].escritorio },
    { key: 'responsavel', label: 'Responsável', render: (o) => OWNER_NAME_MAP[clientMap[o.clientId].ownerId] || clientMap[o.clientId].ownerId },
    {
      key: 'status',
      label: 'Status',
      render: (o) => <StatusPill label={ONBOARDING_STATUS_META[o.status].label} className={ONBOARDING_STATUS_META[o.status].className} size="sm" />,
    },
    { key: 'pendingReason', label: 'Motivo da pendência', render: (o) => o.pendingReason || <span className="text-neutral-300">—</span> },
    { key: 'lastCommunicationAt', label: 'Última comunicação', render: (o) => formatDate(o.lastCommunicationAt.slice(0, 10)) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Onboarding e pendências</h1>
          <p className="text-sm text-neutral-500">{filtered.length} cliente{filtered.length === 1 ? '' : 's'} em acompanhamento</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Buscar por motivo de pendência…" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 w-64" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            {Object.entries(ONBOARDING_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <window.SkeletonRows count={5} />
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(o) => setOpenEntryId(o.id)} emptyLabel="Nenhum cliente em onboarding para esses filtros." />
      )}

      {openEntry && (
        <OnboardingDrawer
          entry={openEntry}
          client={clientMap[openEntry.clientId]}
          onClose={() => setOpenEntryId(null)}
          onResend={() => {}}
          onOpenTicket={onOpenTicket}
        />
      )}
    </div>
  );
}

window.OnboardingPage = OnboardingPage;

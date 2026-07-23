// US-03 — Busca global de clientes por nome, CPF, e-mail, telefone ou conta.

function ClientsListPage({ profile, clients, alerts, search, initialFilters, onOpenClient, onRequestLink }) {
  const { onlyDigits, maskDocument, formatCurrency, CLIENT_STATUS_META, OWNER_NAME_MAP } = window.PortalLib;
  const [status, setStatus] = React.useState((initialFilters && initialFilters.statusFilter) || '');
  const [segment, setSegment] = React.useState((initialFilters && initialFilters.segment) || '');
  const [type, setType] = React.useState('');
  const loading = window.useSimulatedLoading(`${profile.id}|${search}|${status}|${segment}|${type}`, 320);

  if (profile.scopeType === 'none') {
    return (
      <window.NoPermissionState
        title="Sem clientes vinculados a este perfil"
        description="Este cenário demonstra o que um profissional sem vínculo ativo vê: nenhuma base para consultar até que o vínculo seja regularizado."
      />
    );
  }

  const query = search.trim().toLowerCase();
  const digitsQuery = onlyDigits(search);

  const matches = (c) => {
    if (!query) return true;
    const textFields = [c.name, c.email, c.account].filter(Boolean).some((f) => f.toLowerCase().includes(query));
    const digitMatch = digitsQuery.length >= 3 && (onlyDigits(c.cpfCnpj).includes(digitsQuery) || onlyDigits(c.phone).includes(digitsQuery) || c.account.includes(digitsQuery));
    return textFields || digitMatch;
  };

  const filtered = clients.filter((c) => matches(c) && (!status || c.status === status) && (!segment || c.segment === segment) && (!type || c.type === type));

  const alertCountByClient = {};
  alerts.forEach((a) => {
    if (a.status === 'concluido') return;
    alertCountByClient[a.clientId] = (alertCountByClient[a.clientId] || 0) + 1;
  });

  const columns = [
    {
      key: 'name',
      label: 'Cliente',
      render: (c) => (
        <div>
          <div className="font-medium text-neutral-900">{c.name}</div>
          <div className="text-xs text-neutral-400">{c.email}</div>
        </div>
      ),
    },
    { key: 'type', label: 'Tipo', render: (c) => <StatusPill label={c.type} className="bg-neutral-100 text-neutral-600" size="sm" /> },
    { key: 'cpfCnpj', label: 'Documento', render: (c) => <span className="font-mono text-xs">{maskDocument(c.cpfCnpj)}</span> },
    { key: 'account', label: 'Conta' },
    {
      key: 'status',
      label: 'Status',
      render: (c) => <StatusPill label={CLIENT_STATUS_META[c.status].label} className={CLIENT_STATUS_META[c.status].className} size="sm" />,
    },
    { key: 'ownerId', label: 'Consultor responsável', render: (c) => OWNER_NAME_MAP[c.ownerId] || c.ownerId },
    { key: 'totalWealth', label: 'Patrimônio', render: (c) => formatCurrency(c.totalWealth) },
    {
      key: 'alerts',
      label: 'Alertas',
      sortable: false,
      render: (c) =>
        alertCountByClient[c.id] ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-alert-dark">
            <Icon name="alertTriangle" size={13} /> {alertCountByClient[c.id]}
          </span>
        ) : (
          <span className="text-xs text-neutral-300">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Clientes</h1>
          <p className="text-sm text-neutral-500">{filtered.length} de {clients.length} clientes no seu escopo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">PF e PJ</option>
            <option value="PF">Pessoa física</option>
            <option value="PJ">Pessoa jurídica</option>
          </select>
          <select value={segment} onChange={(e) => setSegment(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os segmentos</option>
            <option value="Standard">Standard</option>
            <option value="High">High</option>
            <option value="Private">Private</option>
            <option value="Corporate">Corporate</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : filtered.length === 0 ? (
        <window.EmptyState
          icon="search"
          title="Nenhum cliente encontrado"
          description={search ? `Nenhum resultado para "${search}" com os filtros atuais.` : 'Ajuste os filtros para ver clientes do seu escopo.'}
          action={
            <button onClick={onRequestLink} className="text-sm px-4 py-2 rounded-pill bg-brand text-white font-medium">
              Solicitar vínculo com este cliente
            </button>
          }
        />
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(c) => onOpenClient(c.id)} />
      )}
    </div>
  );
}

window.ClientsListPage = ClientsListPage;

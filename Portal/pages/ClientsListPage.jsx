// US-03 — Lista e busca de clientes (workspace): busca global, big numbers,
// filtros operacionais e tabela com próxima ação/ordens/alertas.

function ClientsListPage({ profile, clients, alerts, orders, positions, search, initialFilters, now, onOpenClient, onRequestLink }) {
  const { onlyDigits, formatCurrency, formatDate, CLIENT_STATUS_META, OWNER_NAME_MAP, nextMaturity } = window.PortalLib;
  const [status, setStatus] = React.useState((initialFilters && initialFilters.statusFilter) || '');
  const [segment, setSegment] = React.useState((initialFilters && initialFilters.segment) || '');
  const [type, setType] = React.useState('');
  const [flags, setFlags] = React.useState({ saldo: false, vencimento: false, pendencia: false, ordem: false });
  const [savedMsg, setSavedMsg] = React.useState(false);
  const loading = window.useSimulatedLoading(`${profile.id}|${search}|${status}|${segment}|${type}|${JSON.stringify(flags)}`, 300);

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

  const posByClient = {};
  (positions || []).forEach((p) => (posByClient[p.clientId] = posByClient[p.clientId] || []).push(p));
  const awaitingByClient = {};
  (orders || []).forEach((o) => { if (o.status === 'aguardando_aprovacao') awaitingByClient[o.clientId] = (awaitingByClient[o.clientId] || 0) + 1; });
  const alertCountByClient = {};
  alerts.forEach((a) => { if (a.status !== 'concluido') alertCountByClient[a.clientId] = (alertCountByClient[a.clientId] || 0) + 1; });

  function nmFor(c) { return nextMaturity(posByClient[c.id] || [], now); }
  function hasVencimento(c) { const nm = nmFor(c); return nm && nm.days <= 30; }
  function isPendencia(c) { return c.status === 'pendente' || c.status === 'bloqueado'; }

  const matchesSearch = (c) => {
    if (!query) return true;
    const textFields = [c.name, c.email, c.account].filter(Boolean).some((f) => f.toLowerCase().includes(query));
    const digitMatch = digitsQuery.length >= 3 && (onlyDigits(c.cpfCnpj).includes(digitsQuery) || onlyDigits(c.phone).includes(digitsQuery) || c.account.includes(digitsQuery));
    return textFields || digitMatch;
  };

  const filtered = clients.filter((c) =>
    matchesSearch(c) &&
    (!status || c.status === status) && (!segment || c.segment === segment) && (!type || c.type === type) &&
    (!flags.saldo || c.availableBalance > 0) &&
    (!flags.vencimento || hasVencimento(c)) &&
    (!flags.pendencia || isPendencia(c)) &&
    (!flags.ordem || (awaitingByClient[c.id] || 0) > 0)
  );

  // Big numbers (sobre o escopo do consultor)
  const totalPatrimonio = clients.reduce((s, c) => s + c.totalWealth, 0);
  const comSaldo = clients.filter((c) => c.availableBalance > 0).length;
  const vencimentos = clients.filter(hasVencimento).length;
  const pendencias = clients.filter(isPendencia).length;

  const bigNumbers = [
    { value: clients.length, label: 'clientes', accent: true },
    { value: formatCurrency(totalPatrimonio), label: 'em patrimônio' },
    { value: comSaldo, label: 'com saldo disponível' },
    { value: vencimentos, label: 'vencimentos próximos' },
    { value: pendencias, label: 'pendências' },
  ];

  const flagChip = (key, label) => (
    <button
      onClick={() => setFlags((f) => ({ ...f, [key]: !f[key] }))}
      className={window.PortalLib.classNames('text-xs px-3 py-1.5 rounded-pill border', flags[key] ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}
    >
      {label}
    </button>
  );

  const columns = [
    {
      key: 'name', label: 'Cliente',
      render: (c) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-neutral-900">{c.name}</div>
            <div className="text-xs text-neutral-400">{c.type} · {c.email}</div>
          </div>
          {isPendencia(c) && <StatusPill label="Atenção" className="bg-warning-light text-warning-dark" size="sm" />}
        </div>
      ),
    },
    { key: 'account', label: 'Conta', render: (c) => <span className="text-neutral-600">{c.account}</span> },
    { key: 'segment', label: 'Segmento', render: (c) => <span className="text-neutral-600">{c.segment}</span> },
    { key: 'totalWealth', label: 'Patrimônio', render: (c) => formatCurrency(c.totalWealth) },
    { key: 'availableBalance', label: 'Saldo disponível', render: (c) => <span className={c.availableBalance > 0 ? 'text-neutral-900' : 'text-neutral-300'}>{c.availableBalance > 0 ? formatCurrency(c.availableBalance) : '—'}</span> },
    {
      key: 'nextEvent', label: 'Próximo evento', sortable: false,
      render: (c) => {
        const nm = nmFor(c);
        if (!nm) return <span className="text-xs text-neutral-300">—</span>;
        return <StatusPill label={`Vence em ${nm.days}d`} className={nm.days <= 5 ? 'bg-alert-light text-alert-dark' : nm.days <= 30 ? 'bg-warning-light text-warning-dark' : 'bg-neutral-100 text-neutral-600'} size="sm" />;
      },
    },
    {
      key: 'orders', label: 'Ordens', sortable: false,
      render: (c) => awaitingByClient[c.id] ? <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-dark"><Icon name="inbox" size={13} /> {awaitingByClient[c.id]}</span> : <span className="text-xs text-neutral-300">—</span>,
    },
    {
      key: 'alerts', label: 'Alertas', sortable: false,
      render: (c) => alertCountByClient[c.id] ? <span className="inline-flex items-center gap-1 text-xs font-medium text-alert-dark"><Icon name="alertTriangle" size={13} /> {alertCountByClient[c.id]}</span> : <span className="text-xs text-neutral-300">—</span>,
    },
    { key: 'ownerId', label: 'Consultor', render: (c) => <span className="text-neutral-600">{OWNER_NAME_MAP[c.ownerId] || c.ownerId}</span> },
    { key: 'status', label: 'Status', render: (c) => <StatusPill label={CLIENT_STATUS_META[c.status].label} className={CLIENT_STATUS_META[c.status].className} size="sm" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Clientes</h1>
        <p className="text-sm text-neutral-500">Gerencie sua carteira e identifique rapidamente quem precisa de atenção.</p>
      </div>

      {/* Big numbers */}
      <div className="flex flex-wrap gap-3">
        {bigNumbers.map((b, i) => (
          <div key={i} className="bg-white border border-neutral-100 rounded-large px-4 py-3 flex-1 min-w-[140px]">
            <div className={window.PortalLib.classNames('text-xl font-semibold', b.accent ? 'text-brand-dark' : 'text-neutral-900')}>{b.value}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{b.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
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
        {flagChip('saldo', 'Tem saldo disponível')}
        {flagChip('vencimento', 'Tem vencimento')}
        {flagChip('pendencia', 'Tem pendência')}
        {flagChip('ordem', 'Ordem aguardando')}
        <button onClick={() => { setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1800); }} className="text-sm px-3 py-1.5 rounded-pill border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50 flex items-center gap-1.5">
          <Icon name="star" size={13} /> {savedMsg ? 'Filtro salvo' : 'Salvar filtro'}
        </button>
      </div>

      <p className="text-xs text-neutral-400">{filtered.length} de {clients.length} clientes no seu escopo</p>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : filtered.length === 0 ? (
        <window.EmptyState
          icon="search"
          title="Nenhum cliente encontrado"
          description={search ? `Nenhum resultado para "${search}" com os filtros atuais.` : 'Ajuste os filtros para ver clientes do seu escopo.'}
          action={<button onClick={onRequestLink} className="text-sm px-4 py-2 rounded-pill bg-brand text-white font-medium">Solicitar vínculo com este cliente</button>}
        />
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(c) => onOpenClient(c.id)} />
      )}
    </div>
  );
}

window.ClientsListPage = ClientsListPage;

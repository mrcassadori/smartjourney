// US-03 — Lista e busca de clientes (workspace): busca global, big numbers,
// filtros operacionais, configuração de colunas, seleção múltipla com ações em
// massa e filtros salvos (persistidos por perfil no localStorage).

const CLIENT_OPTIONAL_COLS = [
  { key: 'account', label: 'Conta' },
  { key: 'segment', label: 'Segmento' },
  { key: 'totalWealth', label: 'Patrimônio' },
  { key: 'availableBalance', label: 'Saldo disponível' },
  { key: 'nextEvent', label: 'Próximo evento' },
  { key: 'orders', label: 'Ordens' },
  { key: 'alerts', label: 'Alertas' },
  { key: 'ownerId', label: 'Consultor' },
];
const CLIENT_DEFAULT_COLS = ['account', 'segment', 'totalWealth', 'availableBalance', 'nextEvent', 'orders', 'alerts', 'ownerId'];

function loadJSON(key, fallback) {
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function saveJSON(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

function ClientsListPage({ profile, clients, alerts, orders, positions, search, initialFilters, now, onOpenClient, onRequestLink, onOpenTicket }) {
  const { onlyDigits, formatCurrency, formatDate, CLIENT_STATUS_META, OWNER_NAME_MAP, nextMaturity, download } = window.PortalLib;
  const [status, setStatus] = React.useState((initialFilters && initialFilters.statusFilter) || '');
  const [segment, setSegment] = React.useState((initialFilters && initialFilters.segment) || '');
  const [type, setType] = React.useState('');
  const [flags, setFlags] = React.useState({ saldo: false, vencimento: false, pendencia: false, ordem: false });
  const [selected, setSelected] = React.useState([]);
  const [showColMenu, setShowColMenu] = React.useState(false);
  const [naming, setNaming] = React.useState(false);
  const [filterName, setFilterName] = React.useState('');
  const colsKey = `sj_cols_${profile.id}`;
  const filtersKey = `sj_savedfilters_${profile.id}`;
  const [visibleCols, setVisibleCols] = React.useState(() => loadJSON(colsKey, CLIENT_DEFAULT_COLS));
  const [savedFilters, setSavedFilters] = React.useState(() => loadJSON(filtersKey, []));
  const loading = window.useSimulatedLoading(`${profile.id}|${search}|${status}|${segment}|${type}|${JSON.stringify(flags)}`, 300);

  React.useEffect(() => { saveJSON(colsKey, visibleCols); }, [visibleCols, colsKey]);
  React.useEffect(() => { saveJSON(filtersKey, savedFilters); }, [savedFilters, filtersKey]);

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

  const allColumns = {
    name: {
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
    account: { key: 'account', label: 'Conta', render: (c) => <span className="text-neutral-600">{c.account}</span> },
    segment: { key: 'segment', label: 'Segmento', render: (c) => <span className="text-neutral-600">{c.segment}</span> },
    totalWealth: { key: 'totalWealth', label: 'Patrimônio', render: (c) => formatCurrency(c.totalWealth) },
    availableBalance: { key: 'availableBalance', label: 'Saldo disponível', render: (c) => <span className={c.availableBalance > 0 ? 'text-neutral-900' : 'text-neutral-300'}>{c.availableBalance > 0 ? formatCurrency(c.availableBalance) : '—'}</span> },
    nextEvent: {
      key: 'nextEvent', label: 'Próximo evento', sortable: false,
      render: (c) => {
        const nm = nmFor(c);
        if (!nm) return <span className="text-xs text-neutral-300">—</span>;
        return <StatusPill label={`Vence em ${nm.days}d`} className={nm.days <= 5 ? 'bg-alert-light text-alert-dark' : nm.days <= 30 ? 'bg-warning-light text-warning-dark' : 'bg-neutral-100 text-neutral-600'} size="sm" />;
      },
    },
    orders: {
      key: 'orders', label: 'Ordens', sortable: false,
      render: (c) => awaitingByClient[c.id] ? <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-dark"><Icon name="inbox" size={13} /> {awaitingByClient[c.id]}</span> : <span className="text-xs text-neutral-300">—</span>,
    },
    alerts: {
      key: 'alerts', label: 'Alertas', sortable: false,
      render: (c) => alertCountByClient[c.id] ? <span className="inline-flex items-center gap-1 text-xs font-medium text-alert-dark"><Icon name="alertTriangle" size={13} /> {alertCountByClient[c.id]}</span> : <span className="text-xs text-neutral-300">—</span>,
    },
    ownerId: { key: 'ownerId', label: 'Consultor', render: (c) => <span className="text-neutral-600">{OWNER_NAME_MAP[c.ownerId] || c.ownerId}</span> },
    status: { key: 'status', label: 'Status', render: (c) => <StatusPill label={CLIENT_STATUS_META[c.status].label} className={CLIENT_STATUS_META[c.status].className} size="sm" /> },
  };
  const columns = [allColumns.name, ...visibleCols.filter((k) => allColumns[k]).map((k) => allColumns[k]), allColumns.status];

  // Seleção
  function toggleSelect(id) { setSelected((prev) => (prev.indexOf(id) === -1 ? [...prev, id] : prev.filter((x) => x !== id))); }
  function toggleAll(keys, on) { setSelected(on ? Array.from(new Set(keys)) : []); }
  const selectedClients = clients.filter((c) => selected.indexOf(c.id) !== -1);

  function exportSelected() {
    download('clientes-selecionados.json', JSON.stringify(selectedClients.map((c) => ({ id: c.id, name: c.name, account: c.account, segment: c.segment, totalWealth: c.totalWealth })), null, 2));
  }
  function reportSelected() {
    const lines = ['RELATÓRIO EM LOTE — clientes selecionados', `Gerado em ${window.PortalLib.formatDateTime(now)}`, '', ...selectedClients.map((c) => `${c.name} · conta ${c.account} · ${formatCurrency(c.totalWealth)}`), '', 'Documento simulado — protótipo.'];
    download('clientes-relatorio-lote.txt', lines.join('\n'), 'text/plain');
  }

  // Filtros salvos
  const currentFilter = { type, segment, status, flags };
  function applyFilter(f) { setType(f.type || ''); setSegment(f.segment || ''); setStatus(f.status || ''); setFlags(f.flags || { saldo: false, vencimento: false, pendencia: false, ordem: false }); }
  function saveCurrentFilter() {
    const name = filterName.trim();
    if (!name) return;
    setSavedFilters((prev) => [...prev.filter((f) => f.name !== name), { name, ...currentFilter }]);
    setNaming(false); setFilterName('');
  }
  function removeFilter(name) { setSavedFilters((prev) => prev.filter((f) => f.name !== name)); }

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

        {/* Salvar filtro */}
        {naming ? (
          <span className="flex items-center gap-1.5">
            <input autoFocus value={filterName} onChange={(e) => setFilterName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveCurrentFilter()} placeholder="Nome do filtro" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 w-36" />
            <button onClick={saveCurrentFilter} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white">Salvar</button>
            <button onClick={() => { setNaming(false); setFilterName(''); }} className="text-sm text-neutral-400 hover:text-neutral-700 px-1">Cancelar</button>
          </span>
        ) : (
          <button onClick={() => setNaming(true)} className="text-sm px-3 py-1.5 rounded-pill border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50 flex items-center gap-1.5">
            <Icon name="star" size={13} /> Salvar filtro
          </button>
        )}

        {/* Colunas */}
        <div className="relative ml-auto">
          <button onClick={() => setShowColMenu((o) => !o)} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5">
            <Icon name="layers" size={13} /> Colunas
          </button>
          {showColMenu && (
            <React.Fragment>
              <div className="fixed inset-0 z-20" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-10 z-30 w-56 bg-white border border-neutral-100 rounded-large shadow-xl py-2">
                <div className="px-3 pb-1.5 text-[11px] uppercase tracking-wide text-neutral-400">Colunas visíveis</div>
                {CLIENT_OPTIONAL_COLS.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                    <input type="checkbox" checked={visibleCols.indexOf(col.key) !== -1} onChange={() => setVisibleCols((prev) => (prev.indexOf(col.key) !== -1 ? prev.filter((k) => k !== col.key) : [...prev, col.key]))} className="accent-brand" />
                    {col.label}
                  </label>
                ))}
                <button onClick={() => setVisibleCols(CLIENT_DEFAULT_COLS)} className="mt-1 mx-3 text-xs text-brand-dark hover:underline">Restaurar padrão</button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Filtros salvos */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-400">Filtros salvos:</span>
          {savedFilters.map((f) => (
            <span key={f.name} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-pill bg-neutral-50 border border-neutral-200">
              <button onClick={() => applyFilter(f)} className="text-neutral-700 hover:text-brand-dark">{f.name}</button>
              <button onClick={() => removeFilter(f.name)} aria-label={`Remover filtro ${f.name}`} className="text-neutral-300 hover:text-alert-dark"><Icon name="x" size={11} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Barra de ações em massa */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-brand-lightest/40 border border-brand/20 rounded-large px-4 py-2.5">
          <span className="text-sm font-medium text-brand-dark">{selected.length} selecionado(s)</span>
          <button onClick={exportSelected} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-1.5"><Icon name="download" size={13} /> Exportar</button>
          <button onClick={reportSelected} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-1.5"><Icon name="fileText" size={13} /> Enviar relatório</button>
          {selected.length === 1 && onOpenTicket && (
            <button onClick={() => onOpenTicket(selectedClients[0], 'client', null, null)} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-1.5"><Icon name="lifeBuoy" size={13} /> Abrir atendimento</button>
          )}
          <button onClick={() => setSelected([])} className="text-sm text-neutral-500 hover:text-neutral-800 ml-auto">Limpar seleção</button>
        </div>
      )}

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
        <DataTable
          columns={columns}
          rows={filtered}
          keyField="id"
          onRowClick={(c) => onOpenClient(c.id)}
          selectable
          selectedKeys={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
        />
      )}
    </div>
  );
}

window.ClientsListPage = ClientsListPage;

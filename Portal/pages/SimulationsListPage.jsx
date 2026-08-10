// Tela 01 — Simulações de investimentos (home da funcionalidade).
// Lista existentes, permite retomar o trabalho e iniciar uma nova análise.

function SimIndicator({ value, label, accent }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-4 py-3 flex-1 min-w-[120px]">
      <div className={window.PortalLib.classNames('text-2xl font-semibold', accent ? 'text-brand-dark' : 'text-neutral-900')}>{value}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}

// Menu de ações contextual por linha (Continuar / Visualizar / Duplicar /
// Comparar / Gerar relatório / Arquivar).
function RowActions({ sim, onOpen, onDuplicate, onArchive }) {
  const [open, setOpen] = React.useState(false);
  const stop = (e) => e.stopPropagation();
  const item = (label, icon, fn, danger) => (
    <button
      onClick={(e) => {
        stop(e);
        setOpen(false);
        fn();
      }}
      className={window.PortalLib.classNames(
        'w-full text-left text-sm px-3 py-2 flex items-center gap-2 hover:bg-neutral-50',
        danger ? 'text-alert-dark' : 'text-neutral-700'
      )}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );
  return (
    <div className="relative flex justify-end" onClick={stop}>
      <button onClick={() => setOpen((v) => !v)} className="p-1.5 rounded-medium text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700" aria-label="Ações">
        <Icon name="settings" size={16} />
      </button>
      {open && (
        <React.Fragment>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-neutral-100 rounded-large shadow-xl py-1">
            {item('Continuar', 'arrowLeft', () => onOpen(sim.id))}
            {item('Visualizar', 'search', () => onOpen(sim.id))}
            {item('Duplicar', 'copy', () => onDuplicate(sim.id))}
            {item('Comparar', 'layers', () => onOpen(sim.id))}
            {item('Gerar relatório', 'fileText', () => onOpen(sim.id))}
            <div className="my-1 border-t border-neutral-100" />
            {item('Arquivar', 'x', () => onArchive(sim.id), true)}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function SimulationsListPage({ profile, clients, simulations, now, search, onNewSimulation, onOpenSimulation, onDuplicateSimulation, onArchiveSimulation }) {
  const { formatCurrency, formatDate, formatDateTime, RISK_PROFILE_META, SIMULATION_STATUS_META, OWNER_NAME_MAP, daysUntil } = window.PortalLib;
  const [tab, setTab] = React.useState('todas');
  const [localSearch, setLocalSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [perfilFilter, setPerfilFilter] = React.useState('');
  const [consultorFilter, setConsultorFilter] = React.useState('');
  const [periodoFilter, setPeriodoFilter] = React.useState('');

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));

  const query = (localSearch || search || '').toLowerCase();

  const visible = simulations.filter((s) => s.status !== 'arquivada');

  // Indicadores
  const indTotal = visible.length;
  const indRascunhos = visible.filter((s) => s.status === 'rascunho').length;
  const indCompartilhadas = visible.filter((s) => s.status === 'compartilhada').length;
  const indAguardando = visible.filter((s) => s.status === 'aguardando_cliente').length;

  const consultores = Array.from(new Set(visible.map((s) => s.createdBy))).sort();

  function passesTab(s) {
    if (tab === 'todas') return true;
    if (tab === 'recentes') return daysUntil(s.updatedAt.slice(0, 10), now) >= -30;
    if (tab === 'rascunhos') return s.status === 'rascunho';
    if (tab === 'compartilhadas') return s.status === 'compartilhada' || s.status === 'aguardando_cliente';
    if (tab === 'concluidas') return s.status === 'concluida';
    return true;
  }

  const filtered = visible.filter((s) => {
    const client = clientMap[s.clientId];
    if (!passesTab(s)) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    if (perfilFilter && (!client || client.riskProfile !== perfilFilter)) return false;
    if (consultorFilter && s.createdBy !== consultorFilter) return false;
    if (periodoFilter) {
      const d = daysUntil(s.updatedAt.slice(0, 10), now);
      if (Number(periodoFilter) && d < -Number(periodoFilter)) return false;
    }
    if (query) {
      const hay = `${s.name} ${client ? client.name : ''}`.toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  });

  const rows = filtered
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((s) => {
      const client = clientMap[s.clientId];
      return {
        id: s.id,
        _sim: s,
        _client: client,
        cliente: client ? client.name : '—',
        nome: s.name,
        valor: s.simulationValue || 0,
        perfil: client ? client.riskProfile : '',
        criado: s.createdAt,
        atualizado: s.updatedAt,
        status: s.status,
      };
    });

  const TABS = [
    { key: 'todas', label: 'Todas' },
    { key: 'recentes', label: 'Recentes' },
    { key: 'rascunhos', label: 'Rascunhos' },
    { key: 'compartilhadas', label: 'Compartilhadas' },
    { key: 'concluidas', label: 'Concluídas' },
  ];

  const columns = [
    {
      key: 'cliente',
      label: 'Cliente',
      render: (r) =>
        r._client ? (
          <div>
            <div className="font-medium text-neutral-900">{r._client.name}</div>
            <div className="text-[11px] text-neutral-400">{r._client.type} · conta {r._client.account}</div>
          </div>
        ) : (
          <span className="text-neutral-400">Sem cliente</span>
        ),
    },
    { key: 'nome', label: 'Simulação', render: (r) => <span className="text-neutral-700">{r.nome}</span> },
    { key: 'valor', label: 'Valor', render: (r) => <span className="tabular-nums text-neutral-900">{r.valor ? formatCurrency(r.valor) : '—'}</span> },
    {
      key: 'perfil',
      label: 'Perfil',
      render: (r) => {
        if (!r.perfil) return <span className="text-neutral-300">—</span>;
        const m = RISK_PROFILE_META[r.perfil] || { label: r.perfil, className: 'bg-neutral-100 text-neutral-600' };
        return <StatusPill label={m.label} className={m.className} size="sm" />;
      },
    },
    { key: 'criado', label: 'Criado em', render: (r) => <span className="text-neutral-500 whitespace-nowrap">{formatDate(r.criado)}</span> },
    { key: 'atualizado', label: 'Atualizado', render: (r) => <span className="text-neutral-500 whitespace-nowrap">{formatDateTime(r.atualizado)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const m = SIMULATION_STATUS_META[r.status] || { label: r.status, className: 'bg-neutral-100 text-neutral-600' };
        return <StatusPill label={m.label} className={m.className} size="sm" />;
      },
    },
    {
      key: 'acoes',
      label: '',
      sortable: false,
      render: (r) => <RowActions sim={r._sim} onOpen={onOpenSimulation} onDuplicate={onDuplicateSimulation} onArchive={onArchiveSimulation} />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Simulações de investimentos</h1>
          <p className="text-sm text-neutral-500 mt-1">Crie, acompanhe e compare propostas de investimento para seus clientes.</p>
        </div>
        <button onClick={onNewSimulation} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
          <Icon name="sparkles" size={15} /> Nova simulação
        </button>
      </div>

      {/* Indicadores */}
      <div className="flex flex-wrap gap-3">
        <SimIndicator value={indTotal} label="Simulações" accent />
        <SimIndicator value={indRascunhos} label="Rascunhos" />
        <SimIndicator value={indCompartilhadas} label="Compartilhadas" />
        <SimIndicator value={indAguardando} label="Aguardando retorno" />
      </div>

      {/* Abas */}
      <div className="border-b border-neutral-100 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={window.PortalLib.classNames(
              'text-sm px-3 py-2 border-b-2 whitespace-nowrap',
              tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Busca + filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon name="search" size={15} />
          </span>
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar cliente ou simulação"
            className="w-full text-sm border border-neutral-200 rounded-pill pl-9 pr-3 py-2"
          />
        </div>
        <select value={consultorFilter} onChange={(e) => setConsultorFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-2 text-neutral-600">
          <option value="">Consultor</option>
          {consultores.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-2 text-neutral-600">
          <option value="">Status</option>
          {['rascunho', 'em_analise', 'compartilhada', 'aguardando_cliente', 'concluida'].map((k) => (
            <option key={k} value={k}>{SIMULATION_STATUS_META[k].label}</option>
          ))}
        </select>
        <select value={periodoFilter} onChange={(e) => setPeriodoFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-2 text-neutral-600">
          <option value="">Período</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
        <select value={perfilFilter} onChange={(e) => setPerfilFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-2 text-neutral-600">
          <option value="">Perfil do cliente</option>
          {Object.keys(RISK_PROFILE_META).map((k) => (
            <option key={k} value={k}>{RISK_PROFILE_META[k].label}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        rows={rows}
        keyField="id"
        onRowClick={(r) => onOpenSimulation(r.id)}
        emptyLabel="Nenhuma simulação para os filtros atuais. Use “Nova simulação” para começar."
      />
    </div>
  );
}

window.SimulationsListPage = SimulationsListPage;

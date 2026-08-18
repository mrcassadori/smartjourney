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

// ---------------------------------------------------------------------
// Jornada de Operações (referência Figma "Jornada operações - home e
// abas") — fila priorizada por SLA, histórico de concluídas e dashboard
// gerencial. Modelo de dados próprio (DATA.operations), independente do
// ServiceRequestDrawer acima (ver GOVERNANCA.md).
// ---------------------------------------------------------------------

const OPS_TABS = [
  { key: 'fila', label: 'Minha fila' },
  { key: 'todas', label: 'Todas' },
  { key: 'risco', label: 'Em risco' },
  { key: 'concluidas', label: 'Concluídas' },
  { key: 'dashboard', label: 'Dashboard' },
];

const OPS_TAB_COPY = {
  fila: { title: 'Acompanhe, priorize e resolva solicitações operacionais dos seus clientes.', sub: 'operações no seu escopo de atendimento' },
  todas: { title: 'Acompanhe, priorize e resolva solicitações operacionais dos seus clientes.', sub: 'operações no seu escopo de atendimento' },
  risco: { title: 'Operações com risco de descumprir o prazo combinado.', sub: 'operações com SLA em risco ou vencido' },
  concluidas: { title: 'Consulte as operações resolvidas, tempos de atendimento e resultados registrados.', sub: 'operações concluídas no seu escopo' },
  dashboard: { title: 'Acompanhe a saúde da operação, capacidade das equipes, SLAs e principais gargalos.', sub: 'visão gerencial e analítica das demandas' },
};

function OpsKpiCard({ label, value, tone }) {
  const toneClass = tone === 'alert' ? 'bg-alert-light border-alert/20' : tone === 'warning' ? 'bg-warning-light border-warning/20' : 'bg-white border-neutral-100';
  const valueClass = tone === 'alert' ? 'text-alert-dark' : tone === 'warning' ? 'text-warning-dark' : 'text-neutral-900';
  return (
    <div className={window.PortalLib.classNames('border rounded-large px-4 py-3', toneClass)}>
      <div className={window.PortalLib.classNames('text-2xl font-semibold', valueClass)}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}

function SlaLabel({ op, now }) {
  const { operationSlaState, operationSlaResult } = window.PortalLib;
  if (op.resolvedAt) {
    const r = operationSlaResult(op);
    return <span className={r.state === 'dentro' ? 'text-success-dark' : 'text-alert-dark font-medium'}>{r.label}</span>;
  }
  const s = operationSlaState(op, now);
  const cls = s.state === 'ok' ? 'text-success-dark' : s.state === 'risco' ? 'text-warning-dark font-medium' : 'text-alert-dark font-semibold';
  return <span className={cls}>{s.label}</span>;
}

const OPS_PAGE_SIZE = 8;

function OpsQueueTable({ scope, operations, clientMap, now, onOpenOperation }) {
  const { OPERATION_TYPE_META, OPERATION_PRIORITY_META, OPERATION_STATUS_META, operationSlaState, formatDateTime, durationLabel, classNames } = window.PortalLib;
  const [clientQuery, setClientQuery] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [type, setType] = React.useState('');
  const [responsavel, setResponsavel] = React.useState('');
  const [page, setPage] = React.useState(0);

  const base = scope === 'fila' ? operations.filter((o) => !o.resolvedAt) : scope === 'risco' ? operations.filter((o) => !o.resolvedAt && operationSlaState(o, now).state !== 'ok') : operations;

  const responsaveis = Array.from(new Set(operations.map((o) => o.responsavel))).sort();

  const filtered = base.filter((o) => {
    const cli = clientMap[o.clientId];
    return (
      (!clientQuery || (cli && cli.name.toLowerCase().includes(clientQuery.toLowerCase())) || o.protocol.toLowerCase().includes(clientQuery.toLowerCase())) &&
      (!priority || o.priority === priority) &&
      (!status || o.status === status) &&
      (!type || o.type === type) &&
      (!responsavel || o.responsavel === responsavel)
    );
  });

  const hasFilters = clientQuery || priority || status || type || responsavel;
  function clearFilters() {
    setClientQuery('');
    setPriority('');
    setStatus('');
    setType('');
    setResponsavel('');
    setPage(0);
  }

  React.useEffect(() => { setPage(0); }, [clientQuery, priority, status, type, responsavel, scope]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / OPS_PAGE_SIZE));
  const pageRows = filtered.slice(page * OPS_PAGE_SIZE, page * OPS_PAGE_SIZE + OPS_PAGE_SIZE);

  const columns = [
    { key: 'priority', label: 'Prioridade', render: (o) => <StatusPill label={OPERATION_PRIORITY_META[o.priority].label} className={OPERATION_PRIORITY_META[o.priority].className} size="sm" /> },
    { key: 'clientName', label: 'Cliente', render: (o) => clientMap[o.clientId] ? clientMap[o.clientId].name : o.clientId },
    { key: 'protocol', label: 'Protocolo' },
    { key: 'type', label: 'Operação', render: (o) => OPERATION_TYPE_META[o.type].label },
    { key: 'responsavel', label: 'Responsável' },
    { key: 'aging', label: 'Aging', render: (o) => o.resolvedAt ? '—' : durationLabel(new Date(now) - new Date(o.openedAt)) },
    { key: 'sla', label: 'SLA', render: (o) => <SlaLabel op={o} now={now} /> },
    { key: 'status', label: 'Status', render: (o) => <StatusPill label={OPERATION_STATUS_META[o.status].label} className={OPERATION_STATUS_META[o.status].className} size="sm" /> },
    { key: 'nextAction', label: 'Próxima ação', render: (o) => o.nextAction ? <span className="text-brand-dark font-medium">{o.nextAction}</span> : '—' },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white border border-neutral-100 rounded-large p-3 flex flex-wrap items-center gap-2">
        <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Busque por cliente ou protocolo" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 flex-1 min-w-[220px]" />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Prioridade</option>
          {Object.entries(window.PortalLib.OPERATION_PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Status</option>
          {Object.entries(OPERATION_STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Tipo</option>
          {Object.entries(OPERATION_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Responsável</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {hasFilters && <button onClick={clearFilters} className="text-sm text-brand-dark font-medium">Limpar filtros</button>}
      </div>

      <DataTable columns={columns} rows={pageRows} keyField="id" onRowClick={(o) => onOpenOperation(o.id)} emptyLabel="Nenhuma operação para esses filtros." />

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>Mostrando {page * OPS_PAGE_SIZE + 1}-{Math.min(filtered.length, page * OPS_PAGE_SIZE + OPS_PAGE_SIZE)} de {filtered.length} operações</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={classNames('text-sm px-3 py-1.5 rounded-pill border border-neutral-200', page === 0 ? 'text-neutral-300' : 'hover:bg-neutral-50')}>Anterior</button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={classNames('text-sm px-3 py-1.5 rounded-pill border border-neutral-200', page >= totalPages - 1 ? 'text-neutral-300' : 'hover:bg-neutral-50')}>Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}

function OpsCausesBars({ operations }) {
  const withMotivo = operations.filter((o) => o.motivoPrincipal);
  const total = withMotivo.length;
  if (total === 0) return null;
  const counts = {};
  withMotivo.forEach((o) => { counts[o.motivoPrincipal] = (counts[o.motivoPrincipal] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const colors = ['bg-warning', 'bg-brand', 'bg-info', 'bg-neutral-400'];

  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4">
      <div className="flex items-center gap-2 font-medium text-neutral-800 mb-3"><Icon name="bell" size={15} /> Principais causas de atraso</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {entries.map(([label, count], i) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={label} className="bg-neutral-50 rounded-medium p-3">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-neutral-700 font-medium truncate">{label}</span>
                <span className="text-neutral-500 shrink-0">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-pill bg-neutral-200 overflow-hidden">
                <div className={window.PortalLib.classNames('h-full rounded-pill', colors[i % colors.length])} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpsConcludedTable({ operations, clientMap, onOpenOperation }) {
  const { OPERATION_TYPE_META, OPERATION_RESULT_META, formatDateTime, durationLabel } = window.PortalLib;
  const [clientQuery, setClientQuery] = React.useState('');
  const [result, setResult] = React.useState('');
  const [type, setType] = React.useState('');
  const [responsavel, setResponsavel] = React.useState('');

  const concluded = operations.filter((o) => o.resolvedAt);
  const responsaveis = Array.from(new Set(concluded.map((o) => o.responsavel))).sort();

  const filtered = concluded.filter((o) => {
    const cli = clientMap[o.clientId];
    return (
      (!clientQuery || (cli && cli.name.toLowerCase().includes(clientQuery.toLowerCase()))) &&
      (!result || o.status === result) &&
      (!type || o.type === type) &&
      (!responsavel || o.responsavel === responsavel)
    );
  });

  const withinSla = concluded.filter((o) => new Date(o.resolvedAt) <= new Date(o.dueAt));
  const pctWithin = concluded.length ? Math.round((withinSla.length / concluded.length) * 100) : 0;
  const avgMs = concluded.length ? concluded.reduce((s, o) => s + (new Date(o.resolvedAt) - new Date(o.openedAt)), 0) / concluded.length : 0;

  const hasFilters = clientQuery || result || type || responsavel;

  const columns = [
    { key: 'clientName', label: 'Cliente', render: (o) => clientMap[o.clientId] ? clientMap[o.clientId].name : o.clientId },
    { key: 'type', label: 'Operação', render: (o) => OPERATION_TYPE_META[o.type].label },
    { key: 'result', label: 'Resultado', render: (o) => <span className={OPERATION_RESULT_META[o.status].className + ' font-medium'}>{OPERATION_RESULT_META[o.status].label}</span> },
    { key: 'responsavel', label: 'Responsável' },
    { key: 'openedAt', label: 'Aberta em', render: (o) => formatDateTime(o.openedAt) },
    { key: 'resolvedAt', label: 'Concluída em', render: (o) => formatDateTime(o.resolvedAt) },
    { key: 'tempoTotal', label: 'Tempo total', render: (o) => durationLabel(new Date(o.resolvedAt) - new Date(o.openedAt), true) },
    { key: 'sla', label: 'SLA', render: (o) => <SlaLabel op={o} /> },
    { key: 'motivoPrincipal', label: 'Motivo principal', render: (o) => o.motivoPrincipal || '—' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OpsKpiCard label="Concluídas" value={concluded.length} />
        <OpsKpiCard label="Dentro do SLA" value={`${pctWithin}%`} />
        <OpsKpiCard label="Tempo médio" value={window.PortalLib.durationLabel(avgMs, true)} />
        <OpsKpiCard label="Fora do SLA" value={concluded.length - withinSla.length} tone={concluded.length - withinSla.length > 0 ? 'alert' : undefined} />
      </div>

      <OpsCausesBars operations={concluded} />

      <div className="bg-white border border-neutral-100 rounded-large p-3 flex flex-wrap items-center gap-2">
        <input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Busque por cliente" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 flex-1 min-w-[220px]" />
        <select value={result} onChange={(e) => setResult(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Resultado</option>
          {Object.entries(OPERATION_RESULT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Tipo</option>
          {Object.entries(OPERATION_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Responsável</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {hasFilters && <button onClick={() => { setClientQuery(''); setResult(''); setType(''); setResponsavel(''); }} className="text-sm text-brand-dark font-medium">Limpar filtros</button>}
      </div>

      <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(o) => onOpenOperation(o.id)} emptyLabel="Nenhuma operação concluída para esses filtros." />
      <div className="text-sm text-neutral-500">Mostrando {filtered.length} de {concluded.length} operações concluídas</div>
    </div>
  );
}

const STATUS_BAR_COLOR = {
  novo: '#1E7FE6',
  em_analise: '#0F4A87',
  aguardando_documento: '#FFB800',
  pendencia_interna: '#E5484D',
  aguardando_consultor: '#9E9E9E',
  em_processamento: '#FF7A00',
  aguardando_backoffice: '#B42318',
  executada: '#1E7FE6',
  concluida: '#00A868',
  concluida_parcial: '#8A5A00',
  nao_executada: '#9E9E9E',
  cancelada: '#9E9E9E',
};

function OpsSegmentedBar({ operations }) {
  const { OPERATION_STATUS_META } = window.PortalLib;
  const total = operations.length;
  if (total === 0) return <div className="text-sm text-neutral-400">Nenhuma operação para o filtro atual.</div>;
  const counts = {};
  operations.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="h-6 rounded-pill overflow-hidden flex w-full">
        {entries.map(([status, count]) => (
          <div key={status} style={{ width: `${(count / total) * 100}%`, backgroundColor: STATUS_BAR_COLOR[status] || '#9E9E9E' }} title={`${OPERATION_STATUS_META[status].label}: ${count}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-neutral-600">
        {entries.map(([status, count]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_BAR_COLOR[status] || '#9E9E9E' }} />
            {OPERATION_STATUS_META[status].label}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

function OpsSlaDonut({ concluded }) {
  const within = concluded.filter((o) => new Date(o.resolvedAt) <= new Date(o.dueAt)).length;
  const outside = concluded.length - within;
  const pct = concluded.length ? Math.round((within / concluded.length) * 100) : 0;
  const data = {
    labels: ['Dentro do SLA', 'Fora do SLA'],
    datasets: [{ data: concluded.length ? [within, outside] : [1, 0], backgroundColor: ['#00A868', '#E5484D'], borderWidth: 0 }],
  };
  const options = { cutout: '72%', plugins: { legend: { display: false } } };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-28 shrink-0">
        <window.ChartCanvas type="doughnut" data={data} options={options} height={112} />
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-neutral-900">{pct}%</div>
      </div>
      <ul className="text-xs space-y-1">
        <li className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-success" /> Dentro do SLA: {pct}%</li>
        <li className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#E5484D' }} /> Fora do SLA: {100 - pct}%</li>
      </ul>
    </div>
  );
}

const AGING_BUCKETS = [
  { key: '<4h', label: '< 4h', min: 0, max: 4 },
  { key: '4-8h', label: '4-8h', min: 4, max: 8 },
  { key: '8-24h', label: '8-24h', min: 8, max: 24 },
  { key: '1-3d', label: '1-3 dias', min: 24, max: 72 },
  { key: '>3d', label: '> 3 dias', min: 72, max: Infinity },
];
const AGING_COLOR = ['#1E7FE6', '#1E7FE6', '#FFB800', '#FF7A00', '#E5484D'];

function OpsAgingList({ openOps, now, onOpenOperation }) {
  const buckets = AGING_BUCKETS.map((b) => ({ ...b, ops: [] }));
  openOps.forEach((o) => {
    const hours = (new Date(now) - new Date(o.openedAt)) / 3600000;
    const b = buckets.find((x) => hours >= x.min && hours < x.max) || buckets[buckets.length - 1];
    b.ops.push(o);
  });
  const max = Math.max(1, ...buckets.map((b) => b.ops.length));
  const oldCases = buckets[buckets.length - 1].ops;

  return (
    <div className="space-y-2">
      {buckets.map((b, i) => (
        <div key={b.key} className="flex items-center gap-3 text-sm">
          <span className="w-16 text-neutral-500 shrink-0">{b.label}</span>
          <div className="flex-1 h-3 rounded-pill bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-pill" style={{ width: `${(b.ops.length / max) * 100}%`, backgroundColor: AGING_COLOR[i] }} />
          </div>
          <span className="w-6 text-right text-neutral-700 font-medium shrink-0">{b.ops.length}</span>
        </div>
      ))}
      {oldCases.length > 0 && (
        <div className="bg-alert-light text-alert-dark rounded-medium px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm mt-3">
          <span>{oldCases.length} operaç{oldCases.length === 1 ? 'ão aberta há' : 'ões abertas há'} mais de 3 dias</span>
          <button onClick={() => onOpenOperation(oldCases[0].id)} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white shrink-0">Ver casos</button>
        </div>
      )}
    </div>
  );
}

function OperationsDashboardTab({ operations, clientMap, now, onOpenOperation }) {
  const { OPERATION_TYPE_META, OPERATION_PRIORITY_META, durationLabel, formatDate } = window.PortalLib;
  const [responsavel, setResponsavel] = React.useState('');
  const [type, setType] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [segment, setSegment] = React.useState('');

  const responsaveis = Array.from(new Set(operations.map((o) => o.responsavel))).sort();
  const segments = Array.from(new Set(Object.values(clientMap).map((c) => c.segment))).sort();

  const filtered = operations.filter((o) => {
    const cli = clientMap[o.clientId];
    return (!responsavel || o.responsavel === responsavel) && (!type || o.type === type) && (!priority || o.priority === priority) && (!segment || (cli && cli.segment === segment));
  });

  const openOps = filtered.filter((o) => !o.resolvedAt);
  const concluded = filtered.filter((o) => o.resolvedAt);
  const emRisco = openOps.filter((o) => window.PortalLib.operationSlaState(o, now).state === 'risco');
  const vencido = openOps.filter((o) => window.PortalLib.operationSlaState(o, now).state === 'vencido');
  const withinSla = concluded.filter((o) => new Date(o.resolvedAt) <= new Date(o.dueAt));
  const pctSla = concluded.length ? Math.round((withinSla.length / concluded.length) * 100) : 0;
  const avgMs = concluded.length ? concluded.reduce((s, o) => s + (new Date(o.resolvedAt) - new Date(o.openedAt)), 0) / concluded.length : 0;

  // SLA por tipo de operação — só entre as concluídas (mesmo critério do KPI acima).
  const slaByType = Object.keys(OPERATION_TYPE_META)
    .map((k) => {
      const ops = concluded.filter((o) => o.type === k);
      if (ops.length === 0) return null;
      const within = ops.filter((o) => new Date(o.resolvedAt) <= new Date(o.dueAt)).length;
      return { type: k, label: OPERATION_TYPE_META[k].label, pct: Math.round((within / ops.length) * 100) };
    })
    .filter(Boolean)
    .sort((a, b) => b.pct - a.pct);

  // Principais motivos de espera — entre as operações ainda abertas.
  const openWithMotivo = openOps.filter((o) => o.motivoPrincipal);
  const motivoCounts = {};
  openWithMotivo.forEach((o) => {
    if (!motivoCounts[o.motivoPrincipal]) motivoCounts[o.motivoPrincipal] = { count: 0, totalAging: 0 };
    motivoCounts[o.motivoPrincipal].count += 1;
    motivoCounts[o.motivoPrincipal].totalAging += new Date(now) - new Date(o.openedAt);
  });
  const motivos = Object.entries(motivoCounts)
    .map(([motivo, v]) => ({ motivo, count: v.count, pct: Math.round((v.count / (openOps.length || 1)) * 100), avgAging: v.totalAging / v.count }))
    .sort((a, b) => b.count - a.count);

  // Carga por responsável.
  const carga = responsaveis
    .map((r) => {
      const mine = filtered.filter((o) => o.responsavel === r);
      const mineOpen = mine.filter((o) => !o.resolvedAt);
      const mineConcluded = mine.filter((o) => o.resolvedAt);
      const mineWithin = mineConcluded.filter((o) => new Date(o.resolvedAt) <= new Date(o.dueAt));
      const mineAvgMs = mineConcluded.length ? mineConcluded.reduce((s, o) => s + (new Date(o.resolvedAt) - new Date(o.openedAt)), 0) / mineConcluded.length : 0;
      return {
        responsavel: r,
        emAberto: mineOpen.length,
        emRisco: mineOpen.filter((o) => window.PortalLib.operationSlaState(o, now).state === 'risco').length,
        criticas: mineOpen.filter((o) => o.priority === 'critica').length,
        tempoMedio: mineAvgMs,
        pctSla: mineConcluded.length ? Math.round((mineWithin.length / mineConcluded.length) * 100) : null,
      };
    })
    .filter((r) => r.emAberto > 0 || r.pctSla != null);

  // Precisam de atenção agora — vencidas primeiro, depois em risco, ordenadas pelo prazo mais próximo.
  const urgent = openOps
    .filter((o) => vencido.indexOf(o) !== -1 || emRisco.indexOf(o) !== -1)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 5);

  // Série "abertas x concluídas" — agregada por dia, no intervalo real dos dados (não um período fixo fabricado).
  const allDates = filtered.map((o) => o.openedAt.slice(0, 10)).concat(concluded.map((o) => o.resolvedAt.slice(0, 10)));
  const uniqueDays = Array.from(new Set(allDates)).sort();
  const openedByDay = {};
  const resolvedByDay = {};
  filtered.forEach((o) => { const d = o.openedAt.slice(0, 10); openedByDay[d] = (openedByDay[d] || 0) + 1; });
  concluded.forEach((o) => { const d = o.resolvedAt.slice(0, 10); resolvedByDay[d] = (resolvedByDay[d] || 0) + 1; });
  const seriesData = {
    labels: uniqueDays.map((d) => formatDate(d).slice(0, 5)),
    datasets: [
      { label: 'Abertas', data: uniqueDays.map((d) => openedByDay[d] || 0), borderColor: '#FF7A00', backgroundColor: '#FF7A00', tension: 0.3 },
      { label: 'Concluídas', data: uniqueDays.map((d) => resolvedByDay[d] || 0), borderColor: '#00A868', backgroundColor: '#00A868', tension: 0.3 },
    ],
  };

  const hasFilters = responsavel || type || priority || segment;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-100 rounded-large p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-400">Período: dados desta simulação ({uniqueDays.length ? `${formatDate(uniqueDays[0])} – ${formatDate(uniqueDays[uniqueDays.length - 1])}` : '—'})</span>
        <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 ml-auto">
          <option value="">Responsável</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Tipo de operação</option>
          {Object.entries(OPERATION_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Prioridade</option>
          {Object.entries(OPERATION_PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Segmento</option>
          {segments.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && <button onClick={() => { setResponsavel(''); setType(''); setPriority(''); setSegment(''); }} className="text-sm text-brand-dark font-medium">Limpar filtros</button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <OpsKpiCard label="Operações no período" value={filtered.length} />
        <OpsKpiCard label="Dentro do SLA" value={`${pctSla}%`} />
        <OpsKpiCard label="Tempo médio" value={durationLabel(avgMs, true)} />
        <OpsKpiCard label="Em aberto" value={openOps.length} />
        <OpsKpiCard label="Em risco" value={emRisco.length} tone={emRisco.length > 0 ? 'warning' : undefined} />
        <OpsKpiCard label="SLA vencido" value={vencido.length} tone={vencido.length > 0 ? 'alert' : undefined} />
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="font-medium text-neutral-800 mb-3">Operações por status</div>
        <OpsSegmentedBar operations={filtered} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-neutral-800">Cumprimento de SLA</div>
            <span className="text-xs text-success-dark">entre as operações concluídas</span>
          </div>
          <OpsSlaDonut concluded={concluded} />
          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
            <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">SLA por tipo de operação</div>
            {slaByType.length === 0 && <div className="text-sm text-neutral-400">Sem operações concluídas no filtro atual.</div>}
            {slaByType.map((s) => (
              <div key={s.type} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{s.label}</span>
                <span className={s.pct >= 90 ? 'text-success-dark font-medium' : s.pct >= 80 ? 'text-warning-dark font-medium' : 'text-alert-dark font-medium'}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <div className="font-medium text-neutral-800 mb-3">Aging das operações abertas</div>
          <OpsAgingList openOps={openOps} now={now} onOpenOperation={onOpenOperation} />
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="font-medium text-neutral-800 mb-3">Principais motivos de espera</div>
        {motivos.length === 0 ? (
          <div className="text-sm text-neutral-400">Nenhuma operação aberta com motivo registrado no filtro atual.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="py-2 font-medium">Motivo</th>
                <th className="py-2 font-medium text-right">Casos</th>
                <th className="py-2 font-medium text-right">% das operações</th>
                <th className="py-2 font-medium text-right">Aguardando em média</th>
              </tr>
            </thead>
            <tbody>
              {motivos.map((m) => (
                <tr key={m.motivo} className="border-t border-neutral-50">
                  <td className="py-2.5 text-neutral-800">{m.motivo}</td>
                  <td className="py-2.5 text-right text-neutral-600">{m.count}</td>
                  <td className="py-2.5 text-right text-neutral-600">{m.pct}%</td>
                  <td className="py-2.5 text-right text-warning-dark font-medium">{durationLabel(m.avgAging, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="font-medium text-neutral-800 mb-3">Carga por responsável</div>
        {carga.length === 0 ? (
          <div className="text-sm text-neutral-400">Nenhuma operação no filtro atual.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="py-2 font-medium">Responsável</th>
                <th className="py-2 font-medium text-right">Em aberto</th>
                <th className="py-2 font-medium text-right">Em risco</th>
                <th className="py-2 font-medium text-right">Críticas</th>
                <th className="py-2 font-medium text-right">Tempo médio</th>
                <th className="py-2 font-medium text-right">SLA</th>
              </tr>
            </thead>
            <tbody>
              {carga.map((r) => (
                <tr key={r.responsavel} className="border-t border-neutral-50">
                  <td className="py-2.5 text-neutral-800 font-medium">{r.responsavel}</td>
                  <td className="py-2.5 text-right text-neutral-600">{r.emAberto}</td>
                  <td className="py-2.5 text-right text-neutral-600">{r.emRisco}</td>
                  <td className="py-2.5 text-right text-neutral-600">{r.criticas}</td>
                  <td className="py-2.5 text-right text-neutral-600">{r.tempoMedio ? durationLabel(r.tempoMedio, true) : '—'}</td>
                  <td className={window.PortalLib.classNames('py-2.5 text-right font-medium', r.pctSla == null ? 'text-neutral-400' : r.pctSla >= 90 ? 'text-success-dark' : 'text-alert-dark')}>{r.pctSla == null ? '—' : `${r.pctSla}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-alert/20 bg-alert-light/40 rounded-large p-4">
        <div className="font-medium text-alert-dark mb-3 flex items-center gap-2"><Icon name="alertTriangle" size={15} /> Precisam de atenção agora</div>
        {urgent.length === 0 ? (
          <div className="text-sm text-neutral-500">Nenhuma operação em risco ou vencida no filtro atual.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="py-2 font-medium">Cliente</th>
                <th className="py-2 font-medium">Operação</th>
                <th className="py-2 font-medium">Motivo</th>
                <th className="py-2 font-medium">SLA</th>
                <th className="py-2 font-medium">Responsável</th>
                <th className="py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {urgent.map((o) => (
                <tr key={o.id} className="border-t border-neutral-100 bg-white">
                  <td className="py-2.5 px-2 text-neutral-800 font-medium">{clientMap[o.clientId] ? clientMap[o.clientId].name : o.clientId}</td>
                  <td className="py-2.5 px-2 text-neutral-600">{OPERATION_TYPE_META[o.type].label}</td>
                  <td className="py-2.5 px-2 text-neutral-500">{o.motivoPrincipal || '—'}</td>
                  <td className="py-2.5 px-2"><SlaLabel op={o} now={now} /></td>
                  <td className="py-2.5 px-2 text-neutral-600">{o.responsavel}</td>
                  <td className="py-2.5 px-2 text-right"><button onClick={() => onOpenOperation(o.id)} className="text-sm text-brand-dark font-medium">Abrir caso</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium text-neutral-800">Operações abertas x concluídas</div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-brand" /> Abertas</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-success" /> Concluídas</span>
          </div>
        </div>
        {uniqueDays.length < 2 ? (
          <div className="text-sm text-neutral-400">Dados insuficientes para série temporal no filtro atual.</div>
        ) : (
          <window.ChartCanvas type="line" data={seriesData} options={{ scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} height={220} />
        )}
      </div>
    </div>
  );
}

function OperationsPage({ profile, clients, operations, now, onOpenOperation }) {
  const { operationSlaState } = window.PortalLib;
  const [tab, setTab] = React.useState('fila');
  const loading = window.useSimulatedLoading(`${profile.id}|${tab}`, 280);

  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem operações para exibir" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));
  const scoped = operations.filter((o) => clientMap[o.clientId]);

  const openOps = scoped.filter((o) => !o.resolvedAt);
  const emRisco = openOps.filter((o) => operationSlaState(o, now).state === 'risco');
  const vencido = openOps.filter((o) => operationSlaState(o, now).state === 'vencido');
  const aguardandoTerceiros = openOps.filter((o) => ['aguardando_documento', 'aguardando_consultor', 'aguardando_backoffice'].indexOf(o.status) !== -1);
  const today = (now || '').slice(0, 10);
  const concluidasHoje = scoped.filter((o) => o.resolvedAt && o.resolvedAt.slice(0, 10) === today);

  const copy = OPS_TAB_COPY[tab];
  const headerCount = tab === 'fila' ? openOps.length : tab === 'risco' ? emRisco.length + vencido.length : tab === 'concluidas' ? scoped.length - openOps.length : scoped.length;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-medium text-brand-dark uppercase tracking-wide">Operações</div>
        <h1 className="text-xl font-semibold text-neutral-900 mt-0.5">{copy.title}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {profile.name} · {profile.escritorio} · {tab === 'dashboard' ? copy.sub : `${headerCount} ${copy.sub}`}
        </p>
      </div>

      <div className="border-b border-neutral-100 flex items-center gap-1 overflow-x-auto">
        {OPS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2 whitespace-nowrap', tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === 'fila' || tab === 'todas' || tab === 'risco') && (
        <React.Fragment>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <OpsKpiCard label="Na minha fila" value={openOps.length} />
            <OpsKpiCard label="Aguardando terceiros" value={aguardandoTerceiros.length} />
            <OpsKpiCard label="Em risco de SLA" value={emRisco.length} tone={emRisco.length > 0 ? 'warning' : undefined} />
            <OpsKpiCard label="SLA vencido" value={vencido.length} tone={vencido.length > 0 ? 'alert' : undefined} />
            <OpsKpiCard label="Concluídas hoje" value={concluidasHoje.length} />
          </div>

          {(emRisco.length + vencido.length) > 0 && (
            <div className="bg-warning-light rounded-large px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-warning-dark text-sm font-medium">
                <Icon name="clock" size={16} /> {emRisco.length + vencido.length} operaç{emRisco.length + vencido.length === 1 ? 'ão precisa' : 'ões precisam'} de ação nas próximas horas.
              </div>
              <button onClick={() => setTab('risco')} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white shrink-0">Ver operações críticas</button>
            </div>
          )}
        </React.Fragment>
      )}

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : (
        <React.Fragment>
          {(tab === 'fila' || tab === 'todas' || tab === 'risco') && (
            <OpsQueueTable scope={tab} operations={scoped} clientMap={clientMap} now={now} onOpenOperation={onOpenOperation} />
          )}
          {tab === 'concluidas' && <OpsConcludedTable operations={scoped} clientMap={clientMap} onOpenOperation={onOpenOperation} />}
          {tab === 'dashboard' && <OperationsDashboardTab operations={scoped} clientMap={clientMap} now={now} onOpenOperation={onOpenOperation} />}
        </React.Fragment>
      )}
    </div>
  );
}

window.OperationsPage = OperationsPage;
window.ServiceRequestDrawer = ServiceRequestDrawer;
window.OperationsShared = { SlaLabel, OpsKpiCard };

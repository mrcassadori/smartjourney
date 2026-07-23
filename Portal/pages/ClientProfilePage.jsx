// US-04 — Ficha 360º do cliente, com US-05 (Carteira) e US-06 (Origem do
// saldo / caixa investível) como sub-abas.

function AssetClassBar({ positions }) {
  const { formatCurrency, ASSET_CLASS_ORDER, ASSET_CLASS_COLOR, ASSET_CLASS_HEX } = window.PortalLib;
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  if (total === 0) return null;

  const byClass = {};
  positions.forEach((p) => {
    byClass[p.class] = (byClass[p.class] || 0) + p.currentValue;
  });
  const classes = ASSET_CLASS_ORDER.filter((c) => byClass[c]).map((c) => ({
    name: c,
    value: byClass[c],
    pct: (byClass[c] / total) * 100,
    color: ASSET_CLASS_COLOR[ASSET_CLASS_ORDER.indexOf(c) % ASSET_CLASS_COLOR.length],
    hex: ASSET_CLASS_HEX[ASSET_CLASS_ORDER.indexOf(c) % ASSET_CLASS_HEX.length],
  }));

  const chartData = {
    labels: classes.map((c) => c.name),
    datasets: [{ data: classes.map((c) => c.value), backgroundColor: classes.map((c) => c.hex), borderWidth: 0 }],
  };
  const chartOptions = {
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}` } },
    },
  };

  return (
    <div className="bg-white rounded-large border border-neutral-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">Composição da carteira</h3>
        <span className="text-xs text-neutral-400">{formatCurrency(total)}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0" style={{ width: 160 }}>
          <window.ChartCanvas type="doughnut" data={chartData} options={chartOptions} height={160} />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 w-full">
          {classes.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className={window.PortalLib.classNames('w-2 h-2 rounded-full shrink-0', c.color)} />
              {c.name} <span className="text-neutral-400 ml-auto sm:ml-0">{c.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioTab({ client, positions, now, onExport }) {
  const { formatCurrency, formatDate, daysUntil, ASSET_CLASS_ORDER } = window.PortalLib;
  const [groupBy, setGroupBy] = React.useState('class');
  const total = positions.reduce((s, p) => s + p.currentValue, 0);

  function groupKey(p) {
    if (groupBy === 'class') return p.class;
    if (groupBy === 'issuer') return p.issuer;
    if (groupBy === 'maturity') return p.maturityDate ? 'Com vencimento' : 'Sem vencimento (liquidez/caixa)';
    return 'Todos os produtos';
  }

  const groups = {};
  positions.forEach((p) => {
    const k = groupKey(p);
    groups[k] = groups[k] || [];
    groups[k].push(p);
  });
  let groupKeys = Object.keys(groups);
  if (groupBy === 'class') groupKeys = ASSET_CLASS_ORDER.filter((c) => groups[c]);
  else if (groupBy === 'maturity') groupKeys = groupKeys.sort();
  else groupKeys = groupKeys.sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-500">
            Total da carteira: <span className="font-semibold text-neutral-900">{formatCurrency(total)}</span>
          </div>
          <span className="text-[11px] text-neutral-400">atualizado {formatDate(client.updatedAt.slice(0, 10))}</span>
          {client.stale && <window.StaleDataBadge />}
        </div>
        <div className="flex items-center gap-2">
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="class">Agrupar por classe</option>
            <option value="product">Agrupar por produto</option>
            <option value="issuer">Agrupar por emissor</option>
            <option value="maturity">Agrupar por vencimento</option>
          </select>
          <button onClick={onExport} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-50">
            <Icon name="download" size={14} /> Exportar
          </button>
        </div>
      </div>

      {positions.length === 0 ? (
        <window.EmptyState icon="layers" title="Sem posições registradas para este cliente" />
      ) : (
        groupKeys.map((k) => {
          const items = groups[k];
          const subtotal = items.reduce((s, p) => s + p.currentValue, 0);
          return (
            <div key={k} className="bg-white rounded-large border border-neutral-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-neutral-50 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-800">{k}</span>
                <span className="text-neutral-500">{formatCurrency(subtotal)} · {((subtotal / total) * 100).toFixed(1)}% da carteira</span>
              </div>
              <div className="divide-y divide-neutral-50">
                {items.map((p) => {
                  const concentrated = p.currentValue / total > 0.3;
                  const dLeft = p.maturityDate ? daysUntil(p.maturityDate, now) : null;
                  const maturingSoon = dLeft !== null && dLeft >= 0 && dLeft <= 30;
                  return (
                    <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium text-neutral-900 truncate">{p.asset}</div>
                        <div className="text-xs text-neutral-400">{p.issuer} · {p.subclass} · liquidez {p.liquidity} {p.rate !== '—' ? `· ${p.rate}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {concentrated && <StatusPill label="Concentração" className="bg-warning-light text-warning-dark" size="sm" />}
                        {maturingSoon && <StatusPill label={`Vence em ${dLeft}d`} className="bg-alert-light text-alert-dark" size="sm" />}
                        <span className="font-medium text-neutral-900">{formatCurrency(p.currentValue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function CashTab({ client, events }) {
  const { formatCurrency, formatCurrencySigned, formatDate, CASH_CATEGORY_META } = window.PortalLib;
  const [category, setCategory] = React.useState('');
  const filtered = events.filter((e) => !category || e.category === category);
  const reserved = Math.round(client.availableBalance * 0.04);
  const saldoTotal = client.availableBalance;
  const saldoDisponivel = client.availableBalance - reserved;
  const caixaInvestivel = client.investableCashEstimate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-large border border-neutral-100 bg-white p-4">
          <div className="text-xs text-neutral-500">Saldo total em conta</div>
          <div className="text-xl font-light text-neutral-900 mt-1">{formatCurrency(saldoTotal)}</div>
        </div>
        <div className="rounded-large border border-neutral-100 bg-white p-4">
          <div className="text-xs text-neutral-500">Saldo disponível para movimentação</div>
          <div className="text-xl font-light text-neutral-900 mt-1">{formatCurrency(saldoDisponivel)}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Diferença reservada para garantias/débitos futuros: {formatCurrency(reserved)}</div>
        </div>
        <div className="rounded-large border border-brand/20 bg-brand-lightest/30 p-4">
          <div className="text-xs text-brand-dark">Estimativa de caixa investível</div>
          <div className="text-xl font-light text-brand-dark mt-1">{formatCurrency(caixaInvestivel)}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Estimativa apenas — não representa autorização automática de investimento pelo cliente.</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">Extrato recente</h3>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todas as categorias</option>
          {Object.entries(CASH_CATEGORY_META).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <window.EmptyState icon="wallet" title="Nenhuma movimentação para essa categoria" />
      ) : (
        <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
          {filtered.map((e) => (
            <div key={e.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-neutral-900">{e.description}</div>
                <div className="text-xs text-neutral-400">{formatDate(e.date)}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill
                  label={CASH_CATEGORY_META[e.category]}
                  className={e.category === 'nao_classificado' ? 'bg-warning-light text-warning-dark' : 'bg-neutral-100 text-neutral-600'}
                  size="sm"
                />
                <span className={window.PortalLib.classNames('font-medium', e.value < 0 ? 'text-alert-dark' : 'text-success-dark')}>
                  {formatCurrencySigned(e.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientOrdersTab({ orders, onOpenOrder }) {
  const { ORDER_STATUS_META, formatCurrency, formatDateTime } = window.PortalLib;
  if (!orders.length) return <window.EmptyState icon="inbox" title="Nenhuma ordem registrada para este cliente" />;
  return (
    <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
      {orders.map((o) => (
        <button key={o.id} onClick={() => onOpenOrder(o.id)} className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 text-sm">
          <div>
            <div className="font-medium text-neutral-900">{o.asset}</div>
            <div className="text-xs text-neutral-400">{o.type} · enviada {formatDateTime(o.sentAt)} · {o.author}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-medium text-neutral-900">{formatCurrency(o.value)}</span>
            <StatusPill label={ORDER_STATUS_META[o.status].label} className={ORDER_STATUS_META[o.status].className} size="sm" />
          </div>
        </button>
      ))}
    </div>
  );
}

function DocumentsTab({ client }) {
  const docs = [
    { id: 'D1', name: `Informe de rendimentos ${new Date().getFullYear() - 1}`, type: 'Fiscal', year: new Date().getFullYear() - 1 },
    { id: 'D2', name: 'Extrato consolidado — junho/2026', type: 'Extrato', year: 2026 },
    { id: 'D3', name: 'Termo de abertura de conta', type: 'Cadastral', year: 2025 },
  ];
  return (
    <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
      {docs.map((d) => (
        <div key={d.id} className="px-4 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5">
            <Icon name="file" size={16} className="text-neutral-400" />
            <div>
              <div className="font-medium text-neutral-900">{d.name}</div>
              <div className="text-xs text-neutral-400">{d.type} · {d.year}</div>
            </div>
          </div>
          <button
            onClick={() => window.PortalLib.download(`${client.id}-${d.id}.txt`, `Documento simulado — ${d.name}\nCliente: ${client.name}\nNenhum dado real, apenas demonstração do protótipo.`, 'text/plain')}
            className="text-xs px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
          >
            <Icon name="download" size={13} /> Baixar
          </button>
        </div>
      ))}
    </div>
  );
}

function ClientRecommendationsTab({ profile, client, simulations, onOpenSimulation, onNewSimulation }) {
  const { formatCurrency, formatDateTime, SIMULATION_STATUS_META, canAccess } = window.PortalLib;

  if (!canAccess(profile, 'recommendations')) {
    return <window.NoPermissionState title="Sem permissão para recomendações" description="Este perfil não monta propostas de investimento neste cenário." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={onNewSimulation} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
          <Icon name="target" size={14} /> Nova simulação
        </button>
      </div>
      {simulations.length === 0 ? (
        <window.EmptyState icon="target" title="Nenhuma proposta para este cliente ainda" description="Crie uma simulação de carteira para começar a estruturar uma recomendação." />
      ) : (
        <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
          {simulations.map((s) => (
            <button key={s.id} onClick={() => onOpenSimulation(s.id)} className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 text-sm">
              <div>
                <div className="font-medium text-neutral-900">{s.name}</div>
                <div className="text-xs text-neutral-400">criada por {s.createdBy} · atualizada {formatDateTime(s.updatedAt)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-medium text-neutral-900">{formatCurrency(s.items.reduce((sum, it) => sum + it.allocatedValue, 0))}</span>
                <StatusPill label={SIMULATION_STATUS_META[s.status].label} className={SIMULATION_STATUS_META[s.status].className} size="sm" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnersSection({ client, relations }) {
  const { HOLDING_ROLE_META } = window.PortalLib;
  const docs = [
    { id: 'SOC1', name: 'Contrato social consolidado', year: 2025 },
    { id: 'SOC2', name: 'Última alteração contratual', year: 2026 },
    { id: 'SOC3', name: 'Cartão CNPJ', year: 2026 },
  ];
  return (
    <div className="bg-white rounded-large border border-neutral-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">Sócios e representantes (US-16)</h3>
        <span className="text-[11px] text-neutral-400">Cliente PJ/holding</span>
      </div>
      {relations.length === 0 ? (
        <div className="text-xs text-neutral-400">Nenhum representante cadastrado para este cliente.</div>
      ) : (
        <div className="divide-y divide-neutral-50 mb-4">
          {relations.map((r) => (
            <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="font-medium text-neutral-900">{r.personName}</div>
                <div className="text-xs text-neutral-400">{r.title} · {window.PortalLib.maskDocument(r.document)}</div>
              </div>
              <StatusPill label={HOLDING_ROLE_META[r.role].label} className={HOLDING_ROLE_META[r.role].className} size="sm" />
            </div>
          ))}
        </div>
      )}
      <div className="text-[11px] text-neutral-400 bg-neutral-50 rounded-medium px-3 py-2 mb-3">
        Operações acima do limite de alçada do escritório podem exigir aprovação conjunta de mais de um representante com poder de assinatura — política simulada apenas para este protótipo, sem workflow de dupla aprovação implementado.
      </div>
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Documentos societários</div>
      <div className="space-y-1.5">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-neutral-700"><Icon name="file" size={14} className="text-neutral-400" /> {d.name} ({d.year})</span>
            <button
              onClick={() => window.PortalLib.download(`${client.id}-${d.id}.txt`, `Documento societário simulado — ${d.name}\nCliente: ${client.name}`, 'text/plain')}
              className="text-xs px-2.5 py-1 rounded-pill border border-neutral-200 hover:bg-neutral-50"
            >
              Baixar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InternationalTab({ positions }) {
  const { formatCurrency } = window.PortalLib;
  const intl = positions.filter((p) => p.class === 'Global' && p.currency);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-medium px-3 py-2">
        <Icon name="info" size={14} className="shrink-0" />
        Visão consolidada apenas. Recomendação e execução de produtos internacionais acontecem pelo Simulador e pela Central de Ordens já existentes — esta aba não duplica esse fluxo.
      </div>
      {intl.length === 0 ? (
        <window.EmptyState icon="layers" title="Sem posições internacionais para este cliente" />
      ) : (
        <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
          {intl.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="font-medium text-neutral-900">{p.asset}</div>
                <div className="text-xs text-neutral-400">{p.issuer} · câmbio aplicado {formatCurrency(p.fxRate).replace('R$', 'R$/US$')} · liquidez {p.liquidity}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-neutral-900">US$ {(p.currentValue / p.fxRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-xs text-neutral-400">{formatCurrency(p.currentValue)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BankingTab({ client, profile, serviceRequests, onCreateServiceRequest, onOpenServiceRequest }) {
  const { SERVICE_TYPE_META, SERVICE_REQUEST_STATUS_META, formatCurrency, formatDateTime } = window.PortalLib;
  const [confirmType, setConfirmType] = React.useState(null);
  const cardLimit = Math.max(5000, Math.round((client.totalWealth * 0.03) / 1000) * 1000);
  const invoiceCurrent = Math.round(cardLimit * 0.18);

  const DEFAULT_DESCRIPTIONS = {
    reset_credencial: 'Reset de credencial/token de acesso',
    bloqueio_preventivo: 'Bloqueio preventivo da conta',
    consulta_documento: 'Nova consulta de documento/comprovante',
    servico_bancario: 'Abertura de solicitação bancária',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-large border border-neutral-100 bg-white p-4">
          <div className="text-xs text-neutral-500">Limite de cartão (estimado)</div>
          <div className="text-xl font-light text-neutral-900 mt-1">{formatCurrency(cardLimit)}</div>
        </div>
        <div className="rounded-large border border-neutral-100 bg-white p-4">
          <div className="text-xs text-neutral-500">Fatura atual (estimada)</div>
          <div className="text-xl font-light text-neutral-900 mt-1">{formatCurrency(invoiceCurrent)}</div>
        </div>
      </div>

      <div className="bg-white rounded-large border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Ações operacionais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(SERVICE_TYPE_META).map(([type, meta]) => {
            const openExisting = serviceRequests.find((r) => r.type === type && r.status !== 'concluida');
            return (
              <button
                key={type}
                onClick={() => (openExisting ? onOpenServiceRequest(openExisting.id) : setConfirmType(type))}
                className="text-left rounded-large border border-neutral-100 px-3 py-2.5 hover:border-brand/40 hover:bg-neutral-50 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-50 text-neutral-500 flex items-center justify-center shrink-0">
                  <Icon name={meta.icon} size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral-900">{meta.label}</div>
                  {openExisting ? (
                    <StatusPill label={`Já em andamento — ${SERVICE_REQUEST_STATUS_META[openExisting.status].label}`} className="bg-warning-light text-warning-dark" size="sm" />
                  ) : (
                    <div className="text-[11px] text-neutral-400">{profile.permissions.canOperateDirectly ? 'Executar diretamente' : 'Abrir solicitação'}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-large border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Solicitações deste cliente</h3>
        {serviceRequests.length === 0 ? (
          <div className="text-xs text-neutral-400">Nenhuma solicitação registrada ainda.</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {serviceRequests.map((r) => (
              <button key={r.id} onClick={() => onOpenServiceRequest(r.id)} className="w-full text-left py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-neutral-50">
                <div>
                  <div className="font-medium text-neutral-900">{SERVICE_TYPE_META[r.type].label}</div>
                  <div className="text-xs text-neutral-400">{r.protocol} · {formatDateTime(r.requestedAt)}</div>
                </div>
                <StatusPill label={SERVICE_REQUEST_STATUS_META[r.status].label} className={SERVICE_REQUEST_STATUS_META[r.status].className} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      {confirmType && (
        <ConfirmAction
          title={SERVICE_TYPE_META[confirmType].label}
          description={
            profile.permissions.canOperateDirectly
              ? `Isso executa "${DEFAULT_DESCRIPTIONS[confirmType]}" imediatamente, com registro na trilha de auditoria. Ação simulada.`
              : `Seu perfil não executa esta ação diretamente — isso abre uma solicitação para um Daily Banker/Administrador concluir. Ação simulada.`
          }
          confirmLabel={profile.permissions.canOperateDirectly ? 'Executar' : 'Abrir solicitação'}
          onConfirm={() => onCreateServiceRequest(client.id, confirmType, DEFAULT_DESCRIPTIONS[confirmType])}
          onClose={() => setConfirmType(null)}
        />
      )}
    </div>
  );
}

function InfoField({ label, value, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-neutral-400">{label}</div>
      {children || <div className="text-neutral-800 truncate">{value}</div>}
    </div>
  );
}

function TimelineTab({ events }) {
  if (!events.length) return <window.EmptyState icon="clock" title="Nenhum evento registrado ainda" />;
  return (
    <div className="bg-white rounded-large border border-neutral-100 p-4">
      <ol className="relative border-l border-neutral-100 ml-2 space-y-5">
        {events.map((ev, i) => (
          <li key={i} className="ml-4">
            <span className="absolute -ml-[25px] mt-1 w-2.5 h-2.5 rounded-full bg-brand" />
            <div className="text-xs text-neutral-400">{window.PortalLib.formatDateTime(ev.date)}</div>
            <div className="text-sm text-neutral-800">{ev.label}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ClientProfilePage({
  client,
  profile,
  positions,
  cashEvents,
  alerts,
  orders,
  onboardingEntry,
  simulations,
  serviceRequests,
  holdingRelations,
  now,
  onBack,
  onOpenOrder,
  onOpenSimulation,
  onNewSimulation,
  onOpenServiceRequest,
  onCreateServiceRequest,
  onOpenTicket,
}) {
  const { formatCurrency, formatDate, maskDocument, CLIENT_STATUS_META, OWNER_NAME_MAP, RISK_PROFILE_META } = window.PortalLib;
  const [tab, setTab] = React.useState('overview');
  const loading = window.useSimulatedLoading(`${client.id}|${tab}`, 300);

  const timelineEvents = []
    .concat(orders.flatMap((o) => o.timeline.map((t) => ({ date: t.date, label: `Ordem ${o.asset}: ${t.detail}` }))))
    .concat(cashEvents.map((e) => ({ date: e.date, label: `${e.description} (${window.PortalLib.formatCurrencySigned(e.value)})` })))
    .concat(onboardingEntry ? onboardingEntry.timeline.map((t) => ({ date: t.date, label: t.detail })) : [])
    .concat(alerts.map((a) => ({ date: a.date, label: `Alerta: ${window.PortalLib.ALERT_TYPE_META[a.type].label}` })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  const tabs = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'portfolio', label: 'Carteira' },
    { key: 'cash', label: 'Movimentações' },
    { key: 'orders', label: 'Ordens' },
    { key: 'documents', label: 'Documentos' },
    { key: 'recommendations', label: 'Recomendações' },
    { key: 'banking', label: 'Banking' },
    { key: 'international', label: 'Internacional' },
  ];

  const criticalPending = client.status === 'bloqueado' || (onboardingEntry && onboardingEntry.status === 'pendencia');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5">
          <Icon name="arrowLeft" size={14} /> Voltar para clientes
        </button>
        <button
          onClick={() => onOpenTicket(client, 'client', null, null)}
          className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
        >
          <Icon name="lifeBuoy" size={14} /> Abrir chamado
        </button>
      </div>

      <div className="bg-white rounded-large border border-neutral-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center font-bold shrink-0">
              {client.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-neutral-900">{client.name}</h1>
                <StatusPill label={CLIENT_STATUS_META[client.status].label} className={CLIENT_STATUS_META[client.status].className} size="sm" />
                <StatusPill label={client.type} className="bg-neutral-100 text-neutral-600" size="sm" />
              </div>
              <div className="text-sm text-neutral-500 mt-0.5">
                {client.segment} · conta {client.account} · {OWNER_NAME_MAP[client.ownerId] || client.ownerId} · {client.escritorio}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400">Patrimônio total</div>
            <div className="text-xl font-light text-neutral-900">{formatCurrency(client.totalWealth)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3 mt-5 pt-4 border-t border-neutral-50 text-sm">
          <InfoField label="CPF/CNPJ" value={maskDocument(client.cpfCnpj)} />
          <InfoField label="Telefone" value={client.phone} />
          <InfoField label="E-mail" value={client.email} />
          <InfoField label="Perfil de risco">
            <StatusPill label={RISK_PROFILE_META[client.riskProfile].label} className={RISK_PROFILE_META[client.riskProfile].className} size="sm" />
          </InfoField>
          <InfoField label="Saldo disponível" value={formatCurrency(client.availableBalance)} />
          <InfoField label="Caixa investível" value={formatCurrency(client.investableCashEstimate)} />
          <InfoField label="Validade suitability" value={formatDate(client.suitabilityExpiry)} />
        </div>

        {criticalPending && (
          <div className="mt-4 flex items-center gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2">
            <Icon name="alertTriangle" size={15} />
            {client.status === 'bloqueado' ? 'Conta bloqueada — requer revisão antes de qualquer nova operação.' : `Pendência crítica de onboarding: ${onboardingEntry.pendingReason}`}
          </div>
        )}
        {!client.firstApplicationDone && (
          <div className="mt-3 flex items-center gap-2 text-sm bg-warning-light text-warning-dark rounded-medium px-3 py-2">
            <Icon name="flag" size={15} /> Cliente ainda sem primeira aplicação.
          </div>
        )}

        <nav className="flex gap-1 mt-5 -mb-5 border-b border-neutral-100 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={window.PortalLib.classNames(
                'text-sm px-3 py-2 border-b-2 whitespace-nowrap flex items-center gap-1.5',
                tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-700'
              )}
            >
              {t.label}
              {t.comingSoon && <span className="text-[10px] uppercase tracking-wide text-neutral-300">em breve</span>}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <window.SkeletonRows count={5} />
      ) : (
        <React.Fragment>
          {tab === 'overview' && (
            <React.Fragment>
              <AssetClassBar positions={positions} />
              {client.type === 'PJ' && <PartnersSection client={client} relations={holdingRelations} />}
              <TimelineTab events={timelineEvents} />
            </React.Fragment>
          )}
          {tab === 'portfolio' && (
            <PortfolioTab
              client={client}
              positions={positions}
              now={now}
              onExport={() => window.PortalLib.download(`${client.id}-carteira.json`, JSON.stringify(positions, null, 2))}
            />
          )}
          {tab === 'cash' && <CashTab client={client} events={cashEvents} />}
          {tab === 'orders' && <ClientOrdersTab orders={orders} onOpenOrder={onOpenOrder} />}
          {tab === 'documents' && <DocumentsTab client={client} />}
          {tab === 'recommendations' && (
            <ClientRecommendationsTab
              profile={profile}
              client={client}
              simulations={simulations}
              onOpenSimulation={onOpenSimulation}
              onNewSimulation={onNewSimulation}
            />
          )}
          {tab === 'banking' && (
            <BankingTab
              client={client}
              profile={profile}
              serviceRequests={serviceRequests}
              onCreateServiceRequest={onCreateServiceRequest}
              onOpenServiceRequest={onOpenServiceRequest}
            />
          )}
          {tab === 'international' && <InternationalTab positions={positions} />}
        </React.Fragment>
      )}
    </div>
  );
}

window.ClientProfilePage = ClientProfilePage;

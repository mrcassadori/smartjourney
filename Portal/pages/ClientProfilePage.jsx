// US-04 — Workspace 360º do cliente (jornada consultiva): cockpit de Visão
// geral, Carteira (com drawer de posição), Movimentações (caixa investível),
// Recomendações contextual, Ordens, Documentos, Banking e Dados.

// Botão de copiar com feedback transitório.
function CopyButton({ value, label }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        window.PortalLib.copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title={`Copiar ${label || ''}`}
      className="text-neutral-300 hover:text-brand-dark p-0.5 shrink-0"
    >
      <Icon name={copied ? 'check' : 'copy'} size={13} />
    </button>
  );
}

// Donut genérico (cor cíclica) para agrupamentos da carteira.
function GroupDonut({ groups, size }) {
  const { formatCurrency, ASSET_CLASS_HEX } = window.PortalLib;
  const total = groups.reduce((s, g) => s + g.value, 0);
  if (total === 0) return <div className="text-xs text-neutral-400">Sem posições.</div>;
  const data = {
    labels: groups.map((g) => g.key),
    datasets: [{ data: groups.map((g) => g.value), backgroundColor: groups.map((_, i) => ASSET_CLASS_HEX[i % ASSET_CLASS_HEX.length]), borderWidth: 0 }],
  };
  const options = {
    cutout: '66%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${formatCurrency(c.raw)} (${((c.raw / total) * 100).toFixed(0)}%)` } } },
  };
  return (
    <div className="flex items-center gap-5">
      <div style={{ width: size || 150, flexShrink: 0 }}>
        <window.ChartCanvas type="doughnut" data={data} options={options} height={size || 150} />
      </div>
      <ul className="text-xs space-y-1 flex-1 min-w-0">
        {groups.map((g, i) => (
          <li key={g.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ASSET_CLASS_HEX[i % ASSET_CLASS_HEX.length] }} />
            <span className="text-neutral-600 truncate flex-1">{g.key}</span>
            <span className="text-neutral-900 font-medium tabular-nums">{((g.value / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Barra de alocação horizontal empilhada (ref. "Cliente Novo.png") + legenda.
function AllocationStackBar({ groups, showLegend }) {
  const { ASSET_CLASS_HEX } = window.PortalLib;
  const total = groups.reduce((s, g) => s + g.value, 0);
  if (total === 0) return <div className="text-xs text-neutral-400">Sem posições.</div>;
  return (
    <div>
      <div className="flex h-3 rounded-pill overflow-hidden mb-3">
        {groups.map((g, i) => (
          <div key={g.key} title={`${g.key}: ${((g.value / total) * 100).toFixed(0)}%`} style={{ width: `${(g.value / total) * 100}%`, backgroundColor: ASSET_CLASS_HEX[i % ASSET_CLASS_HEX.length] }} />
        ))}
      </div>
      {showLegend !== false && (
        <ul className="space-y-1.5 text-sm">
          {groups.map((g, i) => (
            <li key={g.key} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ASSET_CLASS_HEX[i % ASSET_CLASS_HEX.length] }} />
              <span className="text-neutral-600 flex-1 truncate">{g.key}</span>
              <span className="text-neutral-900 font-semibold tabular-nums">{((g.value / total) * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssetClassBar({ positions, onSeeAll }) {
  const { ASSET_CLASS_ORDER } = window.PortalLib;
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  if (total === 0) return null;
  const byClass = {};
  positions.forEach((p) => (byClass[p.class] = (byClass[p.class] || 0) + p.currentValue));
  const groups = ASSET_CLASS_ORDER.filter((c) => byClass[c]).map((c) => ({ key: c, value: byClass[c] }));
  return (
    <div className="bg-white rounded-large border border-neutral-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">Alocação atual</h3>
        {onSeeAll && <button onClick={onSeeAll} className="text-xs font-medium text-brand-dark hover:underline">Ver carteira completa</button>}
      </div>
      <AllocationStackBar groups={groups} />
    </div>
  );
}

// ---------- Visão geral (cockpit) ----------
function FinancialCards({ client, positions }) {
  const { formatCurrency } = window.PortalLib;
  const pos = positions || [];
  const investedTotal = pos.length ? pos.reduce((s, p) => s + p.currentValue, 0) : (client.investedWealth != null ? client.investedWealth : client.totalWealth - client.availableBalance);
  const intlPos = pos.filter(isInternational);
  const hasIntl = intlPos.length > 0;
  const intlInvested = intlPos.reduce((s, p) => s + p.currentValue, 0);
  const nacInvested = investedTotal - intlInvested;
  // Rentabilidade acumulada ponderada por escopo (proxy a partir das posições).
  function scopeRentab(list) {
    const applied = list.reduce((s, p) => s + (p.appliedValue || p.currentValue), 0);
    const cur = list.reduce((s, p) => s + p.currentValue, 0);
    return applied ? (cur / applied - 1) * 100 : 0;
  }
  const nacRentab = scopeRentab(pos.filter((p) => !isInternational(p)));
  const intlRentab = scopeRentab(intlPos);
  const pct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

  const cards = [
    { label: 'Patrimônio total', value: formatCurrency(client.totalWealth), color: 'text-neutral-900' },
    { label: 'Investido', value: formatCurrency(investedTotal), color: 'text-info-dark', breakdown: hasIntl ? [['Nacional', formatCurrency(nacInvested)], ['Internacional', formatCurrency(intlInvested)]] : null },
    { label: 'Caixa disponível', value: formatCurrency(client.availableBalance), color: 'text-success-dark' },
    { label: 'Potencialmente investível', value: formatCurrency(client.investableCashEstimate), color: 'text-brand-dark' },
    { label: 'Rentabilidade 12m', value: client.rentability12m != null ? `${client.rentability12m >= 0 ? '+' : ''}${client.rentability12m}%` : '—', color: client.rentability12m >= 0 ? 'text-success-dark' : 'text-alert-dark', breakdown: hasIntl ? [['Nacional', pct(nacRentab)], ['Internacional', pct(intlRentab)]] : null },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-neutral-100 rounded-large px-4 py-3.5 flex flex-col">
          <div className="text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">{c.label}</div>
          <div className={window.PortalLib.classNames('text-xl font-bold mt-1.5', c.color)}>{c.value}</div>
          {c.breakdown && (
            <div className="mt-2 pt-2 border-t border-neutral-50 space-y-0.5">
              {c.breakdown.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[11px]"><span className="text-neutral-400">{k}</span><span className="text-neutral-700 font-medium tabular-nums">{v}</span></div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AttentionArea({ client, positions, ordersAwaiting, now, onGoCash, onGoPortfolio, onGoOrders }) {
  const { formatCurrency, nextMaturity } = window.PortalLib;
  const nm = nextMaturity(positions, now);
  const cards = [];
  if (client.investableCashEstimate > 0) {
    cards.push({ icon: 'wallet', tone: 'brand', title: `${formatCurrency(client.investableCashEstimate)} potencialmente investíveis`, desc: 'Parte do saldo está disponível após vencimentos e entradas.', cta: 'Ver origem', onClick: onGoCash });
  }
  if (nm && nm.days <= 30) {
    cards.push({ icon: 'clock', tone: 'warning', title: `${formatCurrency(nm.position.currentValue)} vencem em ${nm.days} ${nm.days === 1 ? 'dia' : 'dias'}`, desc: nm.position.asset, cta: 'Analisar carteira', onClick: onGoPortfolio });
  }
  if (ordersAwaiting > 0) {
    cards.push({ icon: 'inbox', tone: 'info', title: `${ordersAwaiting} ${ordersAwaiting === 1 ? 'recomendação aguardando' : 'recomendações aguardando'} aprovação`, desc: 'Acompanhe o retorno do cliente.', cta: 'Ver ordens', onClick: onGoOrders });
  }
  if (cards.length === 0) return null;
  const TONE = { brand: 'bg-brand-lightest text-brand-dark', warning: 'bg-warning-light text-warning-dark', info: 'bg-info-light text-info-dark' };
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-800 mb-2">Requer atenção</h3>
      <div className="space-y-2">
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-neutral-100 rounded-large px-4 py-3.5 flex items-center gap-3">
            <span className={window.PortalLib.classNames('w-9 h-9 rounded-full flex items-center justify-center shrink-0', TONE[c.tone])}><Icon name={c.icon} size={16} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-neutral-900">{c.title}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{c.desc}</div>
            </div>
            <button onClick={c.onClick} className="text-sm text-brand-dark font-medium hover:underline shrink-0 flex items-center gap-1">
              {c.cta} <Icon name="chevronRight" size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NextEvents({ client, positions, ordersAwaiting, now }) {
  const { formatCurrency, formatDate, daysUntil, nextMaturity } = window.PortalLib;
  const nm = nextMaturity(positions, now);
  const suitDays = daysUntil(client.suitabilityExpiry, now);
  const events = [];
  if (nm) events.push({ icon: 'clock', label: `${nm.position.asset} vencendo`, meta: `${formatDate(nm.position.maturityDate)} · ${formatCurrency(nm.position.currentValue)}` });
  if (suitDays <= 120) events.push({ icon: 'shield', label: 'Atualização de suitability', meta: `válido até ${formatDate(client.suitabilityExpiry)}` });
  if (ordersAwaiting > 0) events.push({ icon: 'inbox', label: 'Recomendação aguardando aprovação', meta: `${ordersAwaiting} pendente(s)` });
  if (events.length === 0) return null;
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4">
      <h3 className="text-sm font-semibold text-neutral-800 mb-3">Próximos eventos</h3>
      <div className="space-y-2.5">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <span className="w-7 h-7 rounded-full bg-neutral-50 text-neutral-500 flex items-center justify-center shrink-0"><Icon name={e.icon} size={14} /></span>
            <span className="text-neutral-800 flex-1">{e.label}</span>
            <span className="text-xs text-neutral-400">{e.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Evolução da rentabilidade (12m) — linha do portfólio vs benchmarks, com
// switch de escopo, seletor de período e chips de benchmark. Séries geradas
// deterministicamente (mulberry32) a partir do id do cliente.
const BENCHMARK_META = {
  rendeu: { label: 'Rendeu', color: '#00A868' },
  cdi: { label: 'CDI', color: '#1E7FE6', annual: 0.112, vol: 0.004, scale: 0.05 },
  inflacao: { label: 'Inflação', color: '#FF7A00', annual: 0.045, vol: 0.010, scale: 0.1 },
  poupanca: { label: 'Poupança', color: '#7C3AED', annual: 0.070, vol: 0.005, scale: 0.05 },
  dolar: { label: 'Dólar', color: '#E5222D', annual: 0.030, vol: 0.120, scale: 1 },
};
const MONTHS_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function RentabilityEvolution({ client, positions }) {
  const A = window.PortalAnalytics;
  const [scope, setScope] = React.useState('nacional');
  const [period, setPeriod] = React.useState('12m');
  const [active, setActive] = React.useState({ cdi: true, inflacao: false, poupanca: false, dolar: false });
  const hasIntl = positions.some(isInternational);

  const months = period === '6m' ? 6 : 12;
  const rendeuAnnual = scope === 'internacional' ? (client.rentability12m != null ? client.rentability12m / 100 + 0.04 : 0.12) : (client.rentability12m != null ? client.rentability12m / 100 : 0.08);
  const rendeuVol = scope === 'internacional' ? 0.14 : 0.08;

  const chart = React.useMemo(() => {
    const rng = A.mulberry32(A.hashString(`${client.id}|${scope}|rent`));
    const noise = [];
    for (let i = 0; i < months; i++) noise.push(A.gaussian(rng));
    const toPct = (idx) => idx.slice(1).map((v) => (v / 100 - 1) * 100);
    const rendeu = toPct(A.buildIndex(months, rendeuAnnual, rendeuVol, noise));
    const series = { rendeu };
    ['cdi', 'inflacao', 'poupanca', 'dolar'].forEach((k) => {
      const m = BENCHMARK_META[k];
      series[k] = toPct(A.buildIndex(months, m.annual, m.vol, noise.map((n) => n * m.scale)));
    });
    const labels = MONTHS_ABBR.slice(0, months).length === months ? (months === 12 ? MONTHS_ABBR : MONTHS_ABBR.slice(6)) : MONTHS_ABBR;
    return { labels, series };
  }, [client.id, scope, months, rendeuAnnual, rendeuVol]);

  const datasets = [{ key: 'rendeu' }].concat(['cdi', 'inflacao', 'poupanca', 'dolar'].filter((k) => active[k]).map((k) => ({ key: k })))
    .map(({ key }) => ({
      label: BENCHMARK_META[key].label,
      data: chart.series[key],
      borderColor: BENCHMARK_META[key].color,
      backgroundColor: BENCHMARK_META[key].color,
      borderWidth: key === 'rendeu' ? 2.5 : 1.5,
      pointRadius: 0,
      tension: 0.35,
      fill: false,
    }));

  const options = {
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw >= 0 ? '+' : ''}${c.raw.toFixed(1)}%` } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9E9E9E', font: { size: 10 } } },
      y: { grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 10 }, callback: (v) => `${v > 0 ? '+' : ''}${v}%` } },
    },
  };

  const PERIODS = [['custom', 'Personalizar período'], ['jun', 'Jun'], ['jul', 'Jul'], ['2025', '2025'], ['2026', '2026'], ['6m', '6 meses'], ['12m', '12 meses']];

  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">Evolução da rentabilidade ({months} meses)</h3>
        {hasIntl && (
          <div className="inline-flex items-center rounded-pill bg-neutral-100 p-0.5 text-xs font-medium">
            {[['nacional', 'Nacional'], ['internacional', 'Internacional']].map(([v, label]) => (
              <button key={v} onClick={() => setScope(v)} className={window.PortalLib.classNames('px-3 py-1.5 rounded-pill', scope === v ? 'bg-white text-brand-dark shadow-sm' : 'text-neutral-500 hover:text-neutral-800')}>{label}</button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {PERIODS.map(([v, label]) => (
          <button key={v} onClick={() => (v === '6m' || v === '12m') && setPeriod(v)} className={window.PortalLib.classNames('text-xs px-2.5 py-1 rounded-pill border', period === v ? 'border-neutral-800 bg-neutral-800 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300')}>{label}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.keys(BENCHMARK_META).map((k) => {
          const on = k === 'rendeu' || active[k];
          return (
            <button
              key={k}
              onClick={() => k !== 'rendeu' && setActive((a) => ({ ...a, [k]: !a[k] }))}
              disabled={k === 'rendeu'}
              className={window.PortalLib.classNames('text-xs px-2.5 py-1 rounded-pill border flex items-center gap-1.5', on ? 'border-neutral-200 bg-neutral-50 text-neutral-800' : 'border-neutral-200 text-neutral-400')}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? BENCHMARK_META[k].color : '#D4D4D4' }} /> {BENCHMARK_META[k].label}
            </button>
          );
        })}
      </div>

      <window.ChartCanvas type="line" data={{ labels: chart.labels, datasets }} options={options} height={220} />
    </div>
  );
}

// Insights e próximas ações — cartões acionáveis derivados do contexto.
function InsightsActions({ client, positions, now, onSimulate, onGoPortfolio }) {
  const { formatCurrency, nextMaturity } = window.PortalLib;
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  const byClass = {};
  positions.forEach((p) => (byClass[p.class] = (byClass[p.class] || 0) + p.currentValue));
  const acoesPct = total ? ((byClass['Ações'] || 0) / total) * 100 : 0;
  const intlPct = total ? (positions.filter(isInternational).reduce((s, p) => s + p.currentValue, 0) / total) * 100 : 0;
  const nm = nextMaturity(positions, now);

  const cards = [];
  if (intlPct < 12) cards.push({ icon: 'sparkles', title: 'Diversificar renda fixa internacional', desc: 'Aproveitar taxa de juros dos EUA.', onClick: onSimulate });
  if (Math.abs(acoesPct - 15) >= 2) cards.push({ icon: 'target', title: 'Rebalancear alocação em ações', desc: `Meta 15%, atual ${acoesPct.toFixed(0)}%.`, onClick: onGoPortfolio });
  if (nm && nm.days <= 30) cards.push({ icon: 'refresh', title: `${nm.position.subclass || 'Ativo'} vencendo em ${nm.days} dias`, desc: 'Considerar reinvestir em alternativa de liquidez.', onClick: onGoPortfolio });
  if (cards.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-800">Insights e próximas ações</h3>
        <button onClick={onSimulate} className="text-xs font-medium text-brand-dark hover:underline">Ver todas</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-neutral-100 rounded-large p-4 flex flex-col">
            <div className="flex items-start gap-2.5 flex-1">
              <span className="w-9 h-9 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center shrink-0"><Icon name={c.icon} size={16} /></span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900">{c.title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{c.desc}</div>
              </div>
            </div>
            <button onClick={c.onClick} className="mt-3 self-start text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
              Ver detalhes <Icon name="chevronRight" size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Carteira ----------
// Macro-categoria a partir da classe (usada no cabeçalho de grupo "Renda Fixa >
// Pós-fixado" e no switch de conta Nacional/Internacional).
const MACRO_BY_CLASS = {
  'Pós-fixado': 'Renda Fixa', 'Prefixado': 'Renda Fixa', 'Inflação': 'Renda Fixa', 'Caixa': 'Renda Fixa',
  'CDB': 'Renda Fixa', 'LCI': 'Renda Fixa', 'CRI': 'Renda Fixa', 'Tesouro Direto': 'Renda Fixa',
  'Tesouro IPCA+': 'Renda Fixa', 'Tesouro Prefixado': 'Renda Fixa', 'Fundo de crédito privado': 'Renda Fixa',
  'Ações': 'Renda Variável', 'Ações BR': 'Renda Variável', 'FIIs': 'Renda Variável', 'Fundo imobiliário': 'Renda Variável',
  'Multimercado': 'Multimercado', 'Fundo multimercado': 'Multimercado', 'Fundos': 'Multimercado',
  'Global': 'Internacional', 'ETF internacional': 'Internacional', 'Fundo cambial': 'Internacional',
  'Previdência': 'Previdência', 'PGBL': 'Previdência', 'VGBL': 'Previdência',
};
function macroOf(cls) { return MACRO_BY_CLASS[cls] || 'Outros'; }
function isInternational(p) { return macroOf(p.class) === 'Internacional' || /internacional|cambial|global/i.test(`${p.class || ''}${p.subclass || ''}${p.asset || ''}`); }

function PortfolioTab({ client, positions, now, onExport, onOpenPosition, onSimulateRebalance, onExploreProducts }) {
  const { formatCurrency, formatDate, daysUntil, nextMaturity, ASSET_CLASS_ORDER } = window.PortalLib;
  const [groupBy, setGroupBy] = React.useState('class');
  const [scope, setScope] = React.useState('nacional');
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  const hasInternational = positions.some(isInternational);

  function groupKey(p) {
    if (groupBy === 'class') return p.class;
    if (groupBy === 'issuer') return p.issuer;
    if (groupBy === 'maturity') return p.maturityDate ? 'Com vencimento' : 'Sem vencimento (liquidez/caixa)';
    return p.asset;
  }
  const groups = {};
  positions.forEach((p) => {
    const k = groupKey(p);
    (groups[k] = groups[k] || []).push(p);
  });
  let groupKeys = Object.keys(groups);
  if (groupBy === 'class') groupKeys = ASSET_CLASS_ORDER.filter((c) => groups[c]);
  else groupKeys = groupKeys.sort();

  const donutGroups = groupKeys.map((k) => ({ key: k, value: groups[k].reduce((s, p) => s + p.currentValue, 0) }));

  // Insights
  const byClass = {};
  positions.forEach((p) => (byClass[p.class] = (byClass[p.class] || 0) + p.currentValue));
  const topClass = Object.keys(byClass).map((c) => ({ c, v: byClass[c] })).sort((a, b) => b.v - a.v)[0];
  const nm = nextMaturity(positions, now);
  const insights = [];
  if (topClass && total) insights.push(`${((topClass.v / total) * 100).toFixed(0)}% da carteira está concentrada em ${topClass.c}.`);
  if (nm && nm.days <= 30) insights.push(`${formatCurrency(nm.position.currentValue)} vencem nos próximos ${nm.days} dias.`);

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="bg-white border border-neutral-100 rounded-large p-4 flex flex-wrap items-center gap-x-10 gap-y-3 justify-between">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Patrimônio investido</div>
            <div className="text-xl font-bold text-neutral-900">{formatCurrency(total)}</div>
          </div>
          {client.rentability12m != null && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Rentabilidade 12m</div>
              <div className="text-xl font-bold text-success-dark">+{client.rentability12m}%</div>
            </div>
          )}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Posição atualizada</div>
            <div className="text-sm text-neutral-700 mt-1">{window.PortalLib.formatDateTime(client.updatedAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="text-sm px-3 py-2 rounded-pill border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-50">
            <Icon name="download" size={14} /> Exportar
          </button>
          <button onClick={onExploreProducts} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5">
            <Icon name="layers" size={14} /> Explorar produtos
          </button>
          <button onClick={onSimulateRebalance} className="text-sm px-4 py-2 rounded-pill border border-brand text-brand-dark hover:bg-brand-lightest flex items-center gap-1.5">
            <Icon name="refresh" size={14} /> Simular rebalanceamento
          </button>
        </div>
      </div>

      {/* Distribuição de Ativos */}
      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-800">Distribuição de Ativos</h3>
          <div className="inline-flex items-center rounded-pill bg-neutral-100 p-0.5 text-xs font-medium">
            {[['class', 'Classe'], ['product', 'Produto'], ['issuer', 'Emissor'], ['maturity', 'Vencimento']].map(([v, label]) => (
              <button key={v} onClick={() => setGroupBy(v)} className={window.PortalLib.classNames('px-3 py-1.5 rounded-pill', groupBy === v ? 'bg-white text-brand-dark shadow-sm' : 'text-neutral-500 hover:text-neutral-800')}>{label}</button>
            ))}
          </div>
        </div>
        <AllocationStackBar groups={donutGroups} showLegend={false} />
        {insights.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-neutral-400">Insights:</span>
            {insights.map((t, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-pill bg-brand-lightest text-brand-dark">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Switch de conta Nacional/Internacional */}
      <div className="inline-flex items-center rounded-pill bg-neutral-100 p-0.5 text-sm font-medium">
        {[['nacional', 'Nacional'], ['internacional', 'Internacional']].map(([v, label]) => (
          <button key={v} onClick={() => setScope(v)} disabled={v === 'internacional' && !hasInternational} className={window.PortalLib.classNames('px-5 py-1.5 rounded-pill', scope === v ? 'bg-brand text-white shadow-sm' : v === 'internacional' && !hasInternational ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-500 hover:text-neutral-800')}>{label}</button>
        ))}
      </div>

      <PositionsTable
        positions={positions.filter((p) => (scope === 'internacional' ? isInternational(p) : !isInternational(p)))}
        total={total}
        now={now}
        onOpenPosition={onOpenPosition}
      />
    </div>
  );
}

// Tabela de posições com grupos "Macro > Classe" e colunas de % da carteira e
// rentabilidade acumulada (ref. do usuário). Clique na linha abre o drawer.
function PositionsTable({ positions, total, now, onOpenPosition }) {
  const { formatCurrency, formatDate, daysUntil, ASSET_CLASS_ORDER } = window.PortalLib;
  if (positions.length === 0) {
    return <window.EmptyState icon="layers" title="Sem posições nesta conta" description="Nenhuma posição registrada para o escopo selecionado." />;
  }
  const groups = {};
  positions.forEach((p) => (groups[p.class] = groups[p.class] || []).push(p));
  const keys = ASSET_CLASS_ORDER.filter((c) => groups[c]).concat(Object.keys(groups).filter((c) => ASSET_CLASS_ORDER.indexOf(c) === -1));
  const COLS = ['Ativo', 'Classe', 'Emissor', 'Aplicação', 'Qtd', 'Taxa', 'Liquidez', 'Vencimento', 'Valor atual', '% Carteira', 'Rentabilidade'];
  const alignRight = { 'Aplicação': 1, 'Qtd': 1, 'Valor atual': 1, '% Carteira': 1, 'Rentabilidade': 1 };
  return (
    <div className="bg-white rounded-large border border-neutral-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[900px]">
          <thead className="bg-neutral-50">
            <tr>
              {COLS.map((c) => (
                <th key={c} className={window.PortalLib.classNames('px-3 py-2.5 border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-wide text-neutral-500', alignRight[c] ? 'text-right' : 'text-left')}>{c}</th>
              ))}
            </tr>
          </thead>
          {keys.map((k) => {
            const items = groups[k];
            const subtotal = items.reduce((s, p) => s + p.currentValue, 0);
            return (
              <tbody key={k}>
                <tr className="bg-neutral-50/60">
                  <td colSpan={COLS.length} className="px-3 py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                      <Icon name="chevronDown" size={13} className="text-neutral-400" /> {macroOf(k)} <span className="text-neutral-300">&gt;</span> {k}
                      <span className="ml-2 text-xs font-normal text-neutral-400">{formatCurrency(subtotal)} · {((subtotal / total) * 100).toFixed(1)}%</span>
                    </span>
                  </td>
                </tr>
                {items.map((p) => {
                  const applied = p.appliedValue || p.currentValue;
                  const rentab = applied ? (p.currentValue / applied - 1) * 100 : 0;
                  const dLeft = p.maturityDate ? daysUntil(p.maturityDate, now) : null;
                  const maturingSoon = dLeft !== null && dLeft >= 0 && dLeft <= 30;
                  return (
                    <tr key={p.id} onClick={() => onOpenPosition(p)} className="border-b border-neutral-50 last:border-0 cursor-pointer hover:bg-neutral-50">
                      <td className="px-3 py-2.5 font-medium text-neutral-900">{p.asset}</td>
                      <td className="px-3 py-2.5 text-neutral-500">{macroOf(p.class)}</td>
                      <td className="px-3 py-2.5 text-neutral-500">{p.issuer}</td>
                      <td className="px-3 py-2.5 text-right text-neutral-700">{formatCurrency(applied)}</td>
                      <td className="px-3 py-2.5 text-right text-neutral-500">{p.quantity != null ? p.quantity.toLocaleString('pt-BR') : '—'}</td>
                      <td className="px-3 py-2.5 text-neutral-500">{p.rate && p.rate !== '—' ? p.rate : '—'}</td>
                      <td className="px-3 py-2.5 text-neutral-500">{p.liquidity || '—'}</td>
                      <td className="px-3 py-2.5">
                        {maturingSoon ? <StatusPill label="Vencendo" className="bg-warning-light text-warning-dark" size="sm" /> : p.maturityDate ? <span className="text-neutral-500">{formatDate(p.maturityDate)}</span> : <span className="text-neutral-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-neutral-900">{formatCurrency(p.currentValue)}</td>
                      <td className="px-3 py-2.5 text-right text-neutral-500 tabular-nums">{((p.currentValue / total) * 100).toFixed(1)}%</td>
                      <td className={window.PortalLib.classNames('px-3 py-2.5 text-right font-medium tabular-nums', rentab >= 0 ? 'text-success-dark' : 'text-alert-dark')}>{rentab >= 0 ? '+' : ''}{rentab.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}

// ---------- Movimentações ----------
function CashTab({ client, events, now, onSimulateApply }) {
  const { formatCurrency, formatCurrencySigned, formatDate, CASH_CATEGORY_META, CASH_INVESTABLE_META } = window.PortalLib;
  const [invFilter, setInvFilter] = React.useState('');
  const [flow, setFlow] = React.useState('');
  const filtered = events.filter((e) => (!invFilter || e.investable === invFilter) && (!flow || (flow === 'in' ? e.value >= 0 : e.value < 0)));

  const investable = client.investableCashEstimate;
  const banking = Math.max(0, client.availableBalance - investable);

  // Entradas x saídas nos últimos 30 dias (por dia)
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(new Date(now).getTime() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }
  const inByDay = {};
  const outByDay = {};
  events.forEach((e) => {
    if (days.indexOf(e.date) === -1) return;
    if (e.value >= 0) inByDay[e.date] = (inByDay[e.date] || 0) + e.value;
    else outByDay[e.date] = (outByDay[e.date] || 0) + Math.abs(e.value);
  });
  const flowData = {
    labels: days.map((d) => d.slice(8, 10)),
    datasets: [
      { label: 'Entradas', data: days.map((d) => inByDay[d] || 0), backgroundColor: '#00A868' },
      { label: 'Saídas', data: days.map((d) => outByDay[d] || 0), backgroundColor: '#E5222D' },
    ],
  };
  const flowOptions = {
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatCurrency(c.raw)}` } } },
    scales: { x: { grid: { display: false }, stacked: false, ticks: { maxTicksLimit: 10, color: '#9E9E9E', font: { size: 9 } } }, y: { grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 9 } } } },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-large border border-neutral-100 bg-white p-4">
          <div className="text-xs text-neutral-500">Saldo disponível</div>
          <div className="text-xl font-light text-neutral-900 mt-1">{formatCurrency(client.availableBalance)}</div>
        </div>
        <div className="rounded-large border border-brand/20 bg-brand-lightest/30 p-4">
          <div className="text-xs text-brand-dark flex items-center gap-1">
            Potencialmente investível
            <span title="A classificação é uma indicação para apoiar a análise do consultor e deve ser validada quando necessário." className="text-brand-dark/60"><Icon name="info" size={12} /></span>
          </div>
          <div className="text-xl font-light text-brand-dark mt-1">{formatCurrency(investable)}</div>
        </div>
        <div className="rounded-large border border-neutral-100 bg-white p-4">
          <div className="text-xs text-neutral-500">Possível uso bancário</div>
          <div className="text-xl font-light text-neutral-900 mt-1">{formatCurrency(banking)}</div>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Entradas × saídas (últimos 30 dias)</h3>
        <window.ChartCanvas type="bar" data={flowData} options={flowOptions} height={160} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-800">Origem do saldo</h3>
        <div className="flex items-center gap-2">
          <select value={flow} onChange={(e) => setFlow(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Entradas e saídas</option>
            <option value="in">Só entradas</option>
            <option value="out">Só saídas</option>
          </select>
          <select value={invFilter} onChange={(e) => setInvFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Toda classificação</option>
            {Object.keys(CASH_INVESTABLE_META).map((k) => (
              <option key={k} value={k}>{CASH_INVESTABLE_META[k].label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <window.EmptyState icon="wallet" title="Nenhuma movimentação para esse filtro" />
      ) : (
        <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
          {filtered.map((e) => {
            const inv = CASH_INVESTABLE_META[e.investable] || CASH_INVESTABLE_META.nao_classificado;
            return (
              <div key={e.id} className="px-4 py-3 flex items-center justify-between text-sm gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-neutral-900 truncate">{e.description}</div>
                  <div className="text-xs text-neutral-400">{formatDate(e.date)} · {CASH_CATEGORY_META[e.category] || e.category}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill label={inv.label} className={inv.className} size="sm" />
                  <span className={window.PortalLib.classNames('font-medium', e.value < 0 ? 'text-alert-dark' : 'text-success-dark')}>{formatCurrencySigned(e.value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {investable > 0 && (
        <div className="flex justify-end">
          <button onClick={onSimulateApply} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
            <Icon name="target" size={14} /> Simular aplicação de {formatCurrency(investable)}
          </button>
        </div>
      )}
    </div>
  );
}

// Tela 08 — Ordens do cliente: resumo por status (chips filtráveis) + filtros
// (status/tipo/período) e tabela com origem, envio e última atualização.
function ClientOrdersTab({ orders, now, onOpenOrder }) {
  const { ORDER_STATUS_META, formatCurrency, formatDate, formatDateTime, daysUntil } = window.PortalLib;
  const [status, setStatus] = React.useState('');
  const [type, setType] = React.useState('');
  const [period, setPeriod] = React.useState('');

  if (!orders.length) return <window.EmptyState icon="inbox" title="Nenhuma ordem registrada para este cliente" />;

  const summary = {};
  orders.forEach((o) => (summary[o.status] = (summary[o.status] || 0) + 1));

  const lastUpdate = (o) => (o.timeline && o.timeline.length ? o.timeline[o.timeline.length - 1].date : o.sentAt);
  const withinPeriod = (o) => {
    if (!period) return true;
    const d = -daysUntil(o.sentAt.slice(0, 10), now); // dias desde o envio
    return d <= Number(period);
  };
  const filtered = orders.filter((o) => (!status || o.status === status) && (!type || o.type === type) && withinPeriod(o));

  const columns = [
    { key: 'asset', label: 'Ativo', render: (o) => <span className="font-medium text-neutral-900">{o.asset}</span> },
    { key: 'type', label: 'Tipo', render: (o) => <span className="text-neutral-600">{o.type === 'aplicacao' ? 'Aplicação' : o.type === 'resgate' ? 'Resgate' : o.type}</span> },
    { key: 'value', label: 'Valor', render: (o) => formatCurrency(o.value) },
    { key: 'origin', label: 'Origem', render: (o) => <span className="text-neutral-500">{o.origin || '—'}</span> },
    { key: 'sentAt', label: 'Enviada', render: (o) => <span className="text-neutral-500 whitespace-nowrap">{formatDate(o.sentAt.slice(0, 10))}</span> },
    { key: 'updatedAt', label: 'Atualização', sortable: false, render: (o) => <span className="text-neutral-500 whitespace-nowrap">{formatDateTime(lastUpdate(o))}</span> },
    { key: 'status', label: 'Status', render: (o) => <StatusPill label={ORDER_STATUS_META[o.status].label} className={ORDER_STATUS_META[o.status].className} size="sm" /> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatus('')} className={window.PortalLib.classNames('text-xs px-2.5 py-1 rounded-pill border', !status ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-100 bg-neutral-50 text-neutral-600 hover:border-neutral-300')}>
          Todas ({orders.length})
        </button>
        {Object.keys(summary).map((s) => (
          <button key={s} onClick={() => setStatus((cur) => (cur === s ? '' : s))} className={window.PortalLib.classNames('text-xs px-2.5 py-1 rounded-pill border', status === s ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-100 bg-neutral-50 text-neutral-600 hover:border-neutral-300')}>
            {summary[s]} {ORDER_STATUS_META[s].label.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todos os tipos</option>
          <option value="aplicacao">Aplicação</option>
          <option value="resgate">Resgate</option>
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todo o período</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} de {orders.length} ordens</span>
      </div>

      <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(o) => onOpenOrder(o.id)} emptyLabel="Nenhuma ordem para esses filtros." />
    </div>
  );
}

const DOC_CATEGORY_META = {
  informe: 'Informe de rendimentos',
  investimentos: 'Investimentos',
  previdencia: 'Previdência',
  cadastral: 'Documentos cadastrais',
  comprovante: 'Comprovantes',
  relatorio: 'Relatórios enviados',
};

function DocumentsTab({ client, documents, accessLog, onOpenTicket }) {
  const { formatDate, formatDateTime, download } = window.PortalLib;
  const [year, setYear] = React.useState('');
  const [cat, setCat] = React.useState('');

  // Fallback genérico para clientes sem catálogo explícito.
  const docs = (documents && documents.length ? documents : [
    { id: 'G1', clientId: client.id, name: `Informe de rendimentos ${new Date().getFullYear() - 1}`, category: 'informe', year: new Date().getFullYear() - 1, format: 'PDF', status: 'disponivel', generatedAt: `${new Date().getFullYear()}-02-28` },
    { id: 'G2', clientId: client.id, name: 'Termo de abertura de conta', category: 'cadastral', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2025-01-10' },
  ]);

  const years = Array.from(new Set(docs.map((d) => d.year))).sort((a, b) => b - a);
  const filtered = docs.filter((d) => (!year || String(d.year) === year) && (!cat || d.category === cat));

  function doDownload(d) {
    download(`${client.id}-${d.id}.txt`, `Documento simulado — ${d.name}\nCliente: ${client.name}\nGerado em ${formatDate(d.generatedAt)}\nNenhum dado real, apenas demonstração do protótipo.`, 'text/plain');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todas as categorias</option>
            {Object.keys(DOC_CATEGORY_META).map((k) => <option key={k} value={k}>{DOC_CATEGORY_META[k]}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os anos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={() => onOpenTicket(client, 'client', null, 'Solicitação de documento')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5">
          <Icon name="file" size={14} /> Solicitar documento
        </button>
      </div>

      {filtered.length === 0 ? (
        <window.EmptyState icon="file" title="Nenhum documento disponível para este período" description="Ajuste os filtros ou solicite um novo documento." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white border border-neutral-100 rounded-large p-4 flex flex-col">
              <div className="flex items-start gap-2.5 flex-1">
                <span className="w-9 h-9 rounded-large bg-neutral-50 text-neutral-500 flex items-center justify-center shrink-0"><Icon name="file" size={16} /></span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900">{d.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{DOC_CATEGORY_META[d.category]} · {d.format} · gerado {formatDate(d.generatedAt)}</div>
                  <div className="mt-1.5"><StatusPill label={d.status === 'enviado' ? 'Enviado ao cliente' : 'Disponível'} className={d.status === 'enviado' ? 'bg-info-light text-info-dark' : 'bg-success-light text-success-dark'} size="sm" /></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => doDownload(d)} className="text-xs px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"><Icon name="search" size={12} /> Visualizar</button>
                <button onClick={() => doDownload(d)} className="text-xs px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"><Icon name="download" size={12} /> Baixar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {accessLog && accessLog.length > 0 && (
        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Histórico de acesso</h3>
          <div className="divide-y divide-neutral-50">
            {accessLog.map((a) => (
              <div key={a.id} className="py-2 flex items-center justify-between text-sm gap-3">
                <div className="min-w-0"><span className="text-neutral-800">{a.document}</span> <span className="text-neutral-400 text-xs">· {a.who}</span></div>
                <div className="flex items-center gap-2 shrink-0 text-xs"><span className="text-neutral-500">{a.action}</span><span className="text-neutral-400">{formatDateTime(a.date)}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRecommendationsTab({ profile, client, positions, simulations, now, onOpenSimulation, onNewRecommendation }) {
  const { formatCurrency, formatDateTime, formatDate, SIMULATION_STATUS_META, canAccess, nextMaturity } = window.PortalLib;
  if (!canAccess(profile, 'recommendations')) {
    return <window.NoPermissionState title="Sem permissão para recomendações" description="Este perfil não monta propostas de investimento neste cenário." />;
  }
  const active = simulations.filter((s) => s.status === 'rascunho' || s.status === 'em_analise' || s.status === 'aguardando_cliente');
  const history = simulations.filter((s) => active.indexOf(s) === -1);

  // Oportunidades relacionadas
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  const byClass = {};
  positions.forEach((p) => (byClass[p.class] = (byClass[p.class] || 0) + p.currentValue));
  const topClass = Object.keys(byClass).map((c) => ({ c, v: byClass[c] })).sort((a, b) => b.v - a.v)[0];
  const nm = nextMaturity(positions, now);
  const opps = [];
  if (client.investableCashEstimate > 0) opps.push(`${formatCurrency(client.investableCashEstimate)} em caixa investível`);
  if (topClass && total) opps.push(`concentração de ${((topClass.v / total) * 100).toFixed(0)}% em ${topClass.c}`);
  if (nm && nm.days <= 30) opps.push(`${formatCurrency(nm.position.currentValue)} vencendo em ${nm.days} dias`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">Em andamento</h3>
        <button onClick={onNewRecommendation} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
          <Icon name="target" size={14} /> Nova recomendação
        </button>
      </div>

      {active.length === 0 ? (
        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-large px-4 py-3">Nenhuma proposta em andamento.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {active.map((s) => {
            const m = SIMULATION_STATUS_META[s.status] || { label: s.status, className: 'bg-neutral-100 text-neutral-600' };
            const value = s.simulationValue || s.items.reduce((sum, it) => sum + it.allocatedValue, 0);
            return (
              <button key={s.id} onClick={() => onOpenSimulation(s.id)} className="text-left bg-white border border-neutral-100 rounded-large p-4 hover:border-brand/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-neutral-900 truncate">{s.name}</div>
                  <StatusPill label={m.label} className={m.className} size="sm" />
                </div>
                <div className="text-sm text-neutral-500 mt-1">{formatCurrency(value)} · {s.items.length} produto(s)</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">atualizada {formatDateTime(s.updatedAt)}</div>
              </button>
            );
          })}
        </div>
      )}

      {opps.length > 0 && (
        <div className="bg-brand-lightest/40 border border-brand/20 rounded-large p-4">
          <h3 className="text-sm font-semibold text-brand-dark mb-2">Oportunidades relacionadas</h3>
          <ul className="text-sm text-neutral-700 space-y-1 mb-3">
            {opps.map((o, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-brand shrink-0" /> {o}</li>)}
          </ul>
          <button onClick={onNewRecommendation} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
            <Icon name="target" size={14} /> Simular rebalanceamento
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Histórico</h3>
        {history.length === 0 ? (
          <div className="text-xs text-neutral-400 bg-neutral-50 rounded-large px-4 py-3">Nenhuma proposta anterior.</div>
        ) : (
          <div className="bg-white rounded-large border border-neutral-100 divide-y divide-neutral-50">
            {history.map((s) => {
              const m = SIMULATION_STATUS_META[s.status] || { label: s.status, className: 'bg-neutral-100 text-neutral-600' };
              const value = s.simulationValue || s.items.reduce((sum, it) => sum + it.allocatedValue, 0);
              return (
                <button key={s.id} onClick={() => onOpenSimulation(s.id)} className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-900 truncate">{s.name}</div>
                    <div className="text-xs text-neutral-400">{formatDate(s.updatedAt.slice(0, 10))} · {s.createdBy}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-medium text-neutral-900">{formatCurrency(value)}</span>
                    <StatusPill label={m.label} className={m.className} size="sm" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PartnersSection({ client, relations }) {
  const { HOLDING_ROLE_META } = window.PortalLib;
  const docs = [
    { id: 'SOC1', name: 'Contrato social consolidado', year: 2025 },
    { id: 'SOC2', name: 'Última alteração contratual', year: 2026 },
  ];
  return (
    <div className="bg-white rounded-large border border-neutral-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">Sócios e representantes</h3>
        <span className="text-[11px] text-neutral-400">Cliente PJ/holding</span>
      </div>
      {relations.length === 0 ? (
        <div className="text-xs text-neutral-400">Nenhum representante cadastrado.</div>
      ) : (
        <div className="divide-y divide-neutral-50 mb-3">
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
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Documentos societários</div>
      <div className="space-y-1.5">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-neutral-700"><Icon name="file" size={14} className="text-neutral-400" /> {d.name} ({d.year})</span>
            <button onClick={() => window.PortalLib.download(`${client.id}-${d.id}.txt`, `Documento societário simulado — ${d.name}`, 'text/plain')} className="text-xs px-2.5 py-1 rounded-pill border border-neutral-200 hover:bg-neutral-50">Baixar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankingTab({ client, profile, bankingProfile, serviceRequests, onCreateServiceRequest, onOpenServiceRequest }) {
  const { SERVICE_TYPE_META, SERVICE_REQUEST_STATUS_META, formatCurrency, formatDateTime } = window.PortalLib;
  const [confirmType, setConfirmType] = React.useState(null);
  const [sensitive, setSensitive] = React.useState(null); // serviço sensível de cartão

  // Perfil de banking (fallback sintético quando não há explícito).
  const bp = bankingProfile || {
    account: { status: client.status === 'bloqueado' ? 'Bloqueada' : 'Ativa', balance: Math.max(0, client.availableBalance - client.investableCashEstimate), pixLimit: 20000, tedLimit: 50000 },
    card: { name: client.segment === 'Private' || client.segment === 'Corporate' ? 'Inter Black' : 'Inter Gold', status: 'Ativo', limit: Math.max(5000, Math.round((client.totalWealth * 0.03) / 1000) * 1000), used: Math.round(Math.max(5000, client.totalWealth * 0.03) * 0.18), closingDay: '18/08', invoice: Math.round(Math.max(5000, client.totalWealth * 0.03) * 0.14) },
  };
  const usedPct = bp.card.limit ? (bp.card.used / bp.card.limit) * 100 : 0;

  const CARD_SERVICES = [
    { key: 'aumento', label: 'Solicitar aumento de limite', sensitive: false },
    { key: 'segunda_via', label: 'Segunda via', sensitive: false },
    { key: 'adicional', label: 'Solicitar cartão adicional', sensitive: false },
    { key: 'viagem', label: 'Viagem internacional', sensitive: false },
    { key: 'bloquear', label: 'Bloquear cartão', sensitive: true },
  ];

  const DEFAULT_DESCRIPTIONS = {
    reset_credencial: 'Reset de credencial/token de acesso',
    bloqueio_preventivo: 'Bloqueio preventivo da conta',
    consulta_documento: 'Nova consulta de documento/comprovante',
    servico_bancario: 'Abertura de solicitação bancária',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conta */}
        <div className="bg-white rounded-large border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-800">Conta corrente</h3>
            <StatusPill label={bp.account.status} className={bp.account.status === 'Ativa' ? 'bg-success-light text-success-dark' : 'bg-alert-light text-alert-dark'} size="sm" />
          </div>
          <div className="text-xs text-neutral-400">Saldo bancário</div>
          <div className="text-2xl font-light text-neutral-900 mb-3">{formatCurrency(bp.account.balance)}</div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Limites transacionais</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between border-b border-neutral-50 py-1.5"><span className="text-neutral-500">PIX</span><span className="text-neutral-900">{formatCurrency(bp.account.pixLimit)}/dia</span></div>
            <div className="flex justify-between border-b border-neutral-50 py-1.5"><span className="text-neutral-500">TED</span><span className="text-neutral-900">{formatCurrency(bp.account.tedLimit)}/dia</span></div>
          </div>
        </div>

        {/* Cartão */}
        <div className="bg-white rounded-large border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5"><Icon name="creditCard" size={15} className="text-neutral-400" /> {bp.card.name}</h3>
            <StatusPill label={bp.card.status} className="bg-success-light text-success-dark" size="sm" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><div className="text-[11px] text-neutral-400">Limite</div><div className="text-sm font-medium text-neutral-900">{formatCurrency(bp.card.limit)}</div></div>
            <div><div className="text-[11px] text-neutral-400">Utilizado</div><div className="text-sm font-medium text-neutral-900">{formatCurrency(bp.card.used)}</div></div>
            <div><div className="text-[11px] text-neutral-400">Fechamento</div><div className="text-sm font-medium text-neutral-900">{bp.card.closingDay}</div></div>
            <div><div className="text-[11px] text-neutral-400">Fatura</div><div className="text-sm font-medium text-neutral-900">{formatCurrency(bp.card.invoice)}</div></div>
          </div>
          <div className="h-2 rounded-pill bg-neutral-100 overflow-hidden"><div className={window.PortalLib.classNames('h-full', usedPct > 80 ? 'bg-alert' : 'bg-brand')} style={{ width: `${Math.min(usedPct, 100)}%` }} /></div>
          <div className="text-[11px] text-neutral-400 mt-1">{usedPct.toFixed(0)}% do limite utilizado</div>
        </div>
      </div>

      {/* Serviços */}
      <div className="bg-white rounded-large border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Serviços disponíveis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CARD_SERVICES.map((s) => (
            <button key={s.key} onClick={() => (s.sensitive ? setSensitive(s) : onCreateServiceRequest(client.id, 'servico_bancario', s.label))} className="text-left rounded-large border border-neutral-100 px-3 py-2.5 hover:border-brand/40 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-800">
              {s.sensitive && <Icon name="shield" size={14} className="text-alert shrink-0" />}
              {s.label}
            </button>
          ))}
        </div>
        {!profile.permissions.canOperateDirectly && <p className="text-[11px] text-neutral-400 mt-2">Seu perfil abre solicitações — a execução direta depende de um Daily Banker/Administrador.</p>}
      </div>

      {/* Solicitações operacionais */}
      <div className="bg-white rounded-large border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Solicitações deste cliente</h3>
        {serviceRequests.length === 0 ? (
          <div className="text-xs text-neutral-400">Nenhuma solicitação registrada ainda.</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {serviceRequests.map((r) => (
              <button key={r.id} onClick={() => onOpenServiceRequest(r.id)} className="w-full text-left py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-neutral-50">
                <div>
                  <div className="font-medium text-neutral-900">{SERVICE_TYPE_META[r.type] ? SERVICE_TYPE_META[r.type].label : 'Serviço bancário'}</div>
                  <div className="text-xs text-neutral-400">{r.protocol} · {formatDateTime(r.requestedAt)}</div>
                </div>
                <StatusPill label={SERVICE_REQUEST_STATUS_META[r.status].label} className={SERVICE_REQUEST_STATUS_META[r.status].className} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      {sensitive && (
        <ConfirmAction
          title="Esta é uma ação sensível"
          description={`"${sensitive.label}" para ${client.name} bloqueia imediatamente o cartão. A ação fica registrada na trilha de auditoria (simulada) com o motivo informado.`}
          confirmLabel="Confirmar bloqueio"
          onConfirm={() => onCreateServiceRequest(client.id, 'servico_bancario', sensitive.label)}
          onClose={() => setSensitive(null)}
        />
      )}
      {confirmType && (
        <ConfirmAction
          title="Solicitação bancária"
          description="Ação simulada, registrada na trilha de auditoria."
          confirmLabel="Confirmar"
          onConfirm={() => onCreateServiceRequest(client.id, 'servico_bancario', DEFAULT_DESCRIPTIONS.servico_bancario)}
          onClose={() => setConfirmType(null)}
        />
      )}
    </div>
  );
}

// ---------- Dados / vínculos / segurança ----------
function DadosSection({ title, children }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-5">
      <h3 className="text-sm font-semibold text-neutral-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function DataRow({ label, value, copy }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 text-sm gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 font-medium flex items-center gap-1.5 text-right">{value}{copy ? <CopyButton value={copy} label={label} /> : null}</span>
    </div>
  );
}

function DadosTab({ client, linkedClient, holdingRelations, onConfirmAction, onOpenLinked }) {
  const { maskDocument, formatDate, formatDateTime, OWNER_NAME_MAP, RISK_PROFILE_META, CLIENT_STATUS_META } = window.PortalLib;
  const [confirm, setConfirm] = React.useState(null);
  const sec = client.security || {};
  const risk = RISK_PROFILE_META[client.riskProfile] || { label: client.riskProfile, className: 'bg-neutral-100 text-neutral-600' };

  const ACTIONS = {
    reset_senha: { label: 'Enviar redefinição de senha', desc: 'Envia ao cliente um link para redefinir a senha de acesso.' },
    reset_token: { label: 'Redefinir token', desc: 'Reseta o token de autenticação do cliente.' },
    bloquear: { label: 'Bloquear acesso', desc: 'Bloqueia preventivamente o acesso do cliente ao aplicativo.' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DadosSection title="Identificação">
        <DataRow label="Nome completo" value={client.name} />
        <DataRow label="CPF/CNPJ" value={maskDocument(client.cpfCnpj)} copy={client.cpfCnpj} />
        {client.dateOfBirth && <DataRow label="Data de nascimento" value={formatDate(client.dateOfBirth)} />}
        <DataRow label="E-mail" value={<span className="truncate max-w-[180px]">{client.email}</span>} copy={client.email} />
        <DataRow label="Telefone" value={client.phone} copy={client.phone} />
        <DataRow label="Número da conta" value={client.account} copy={client.account} />
      </DadosSection>

      <DadosSection title="Relacionamento">
        <DataRow label="Consultoria" value={client.escritorio} />
        <DataRow label="Consultor" value={OWNER_NAME_MAP[client.ownerId] || client.ownerId} />
        <DataRow label="Segmento" value={window.PortalLib.segmentLabel(client.segment)} />
        <DataRow label="Status do vínculo" value={<StatusPill label={CLIENT_STATUS_META[client.status].label} className={CLIENT_STATUS_META[client.status].className} size="sm" />} />
        <DataRow label="Data do vínculo" value={client.linkDate ? formatDate(client.linkDate) : '—'} />
      </DadosSection>

      <DadosSection title="Perfil e suitability">
        <DataRow label="Perfil" value={<StatusPill label={risk.label} className={risk.className} size="sm" />} />
        <DataRow label="Suitability" value={`válido até ${formatDate(client.suitabilityExpiry)}`} />
      </DadosSection>

      <DadosSection title="Relacionamentos">
        <div className="flex items-center gap-3">
          <div className="flex-1 border border-neutral-200 rounded-large px-3 py-2 text-center">
            <div className="text-xs text-neutral-400">{client.type}</div>
            <div className="text-sm font-medium text-neutral-900 truncate">{client.name}</div>
          </div>
          {linkedClient ? (
            <React.Fragment>
              <Icon name="refresh" size={16} className="text-neutral-300 shrink-0" />
              <button onClick={() => onOpenLinked(linkedClient.id)} className="flex-1 border border-brand/30 bg-brand-lightest/40 rounded-large px-3 py-2 text-center hover:border-brand">
                <div className="text-xs text-brand-dark">{linkedClient.type} · vinculado</div>
                <div className="text-sm font-medium text-neutral-900 truncate">{linkedClient.name}</div>
              </button>
            </React.Fragment>
          ) : (
            <div className="flex-1 text-xs text-neutral-400 text-center">Sem vínculo PF↔PJ registrado.</div>
          )}
        </div>
        {client.type === 'PJ' && holdingRelations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-50 space-y-1.5">
            {holdingRelations.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="text-neutral-700">{r.personName} · {r.title}</span>
                <StatusPill label={window.PortalLib.HOLDING_ROLE_META[r.role].label} className={window.PortalLib.HOLDING_ROLE_META[r.role].className} size="sm" />
              </div>
            ))}
          </div>
        )}
      </DadosSection>

      <DadosSection title="Segurança">
        <DataRow label="Acesso" value={<StatusPill label={sec.accessActive ? 'Ativo' : 'Bloqueado'} className={sec.accessActive ? 'bg-success-light text-success-dark' : 'bg-alert-light text-alert-dark'} size="sm" />} />
        <DataRow label="Token" value={<StatusPill label={sec.tokenActive ? 'Ativo' : 'Inativo'} className={sec.tokenActive ? 'bg-success-light text-success-dark' : 'bg-neutral-100 text-neutral-600'} size="sm" />} />
        <DataRow label="Último login" value={sec.lastLoginAt ? formatDateTime(sec.lastLoginAt) : '—'} />
      </DadosSection>

      <DadosSection title="Ações controladas">
        <div className="space-y-2">
          {Object.keys(ACTIONS).map((k) => (
            <button key={k} onClick={() => setConfirm(k)} className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-large border border-neutral-100 hover:border-brand/40 hover:bg-neutral-50">
              <Icon name="shield" size={14} className="text-neutral-400" /> {ACTIONS[k].label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-neutral-400 mt-3">Todas as ações são registradas na trilha de auditoria. Neste protótipo todas as ações são simuladas.</p>
      </DadosSection>

      {confirm && (
        <ConfirmAction
          title={ACTIONS[confirm].label}
          description={`${ACTIONS[confirm].desc} Ação sensível, registrada na trilha de auditoria (simulada).`}
          confirmLabel="Confirmar"
          onConfirm={() => onConfirmAction && onConfirmAction(confirm)}
          onClose={() => setConfirm(null)}
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

// Atividade recente compacta (ref.): coluna de data curta (Hoje/Ontem/DD mmm) + evento.
function CompactActivity({ events, limit, now }) {
  const { daysUntil } = window.PortalLib;
  const list = (limit ? events.slice(0, limit) : events);
  if (!list.length) return <div className="text-xs text-neutral-400">Nenhum evento recente.</div>;
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function shortLabel(dateStr) {
    const d = daysUntil(dateStr.slice(0, 10), now); // <=0 no passado
    if (d === 0) return 'Hoje';
    if (d === -1) return 'Ontem';
    const dt = new Date(dateStr);
    return `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
  }
  return (
    <ul className="divide-y divide-neutral-50">
      {list.map((ev, i) => (
        <li key={i} className="flex items-start gap-3 py-2 text-sm first:pt-0 last:pb-0">
          <span className="text-[11px] text-neutral-400 w-12 shrink-0 pt-0.5">{shortLabel(ev.date)}</span>
          <span className="text-neutral-700 leading-snug">{ev.label}</span>
        </li>
      ))}
    </ul>
  );
}

function TimelineTab({ events, limit }) {
  const list = limit ? events.slice(0, limit) : events;
  if (!list.length) return <window.EmptyState icon="clock" title="Nenhum evento registrado ainda" />;
  return (
    <div className="bg-white rounded-large border border-neutral-100 p-4">
      <ol className="relative border-l border-neutral-100 ml-2 space-y-5">
        {list.map((ev, i) => (
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

// Menu "+ Nova ação" no header.
function NovaAcaoMenu({ actions }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
        <Icon name="target" size={15} /> Nova ação <Icon name="chevronDown" size={13} />
      </button>
      {open && (
        <React.Fragment>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-30 w-56 bg-white border border-neutral-100 rounded-large shadow-xl py-1">
            {actions.map((a) => (
              <button key={a.label} onClick={() => { setOpen(false); a.onClick(); }} className="w-full text-left text-sm px-3 py-2 flex items-center gap-2 text-neutral-700 hover:bg-neutral-50">
                <Icon name={a.icon} size={14} className="text-neutral-400" /> {a.label}
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// Tela 14 — Toda atividade: linha do tempo unificada com filtros por categoria.
const ACTIVITY_CATEGORIES = [
  { key: 'all', label: 'Todos', icon: 'clock' },
  { key: 'investimentos', label: 'Investimentos', icon: 'trendingUp' },
  { key: 'movimentacoes', label: 'Movimentações', icon: 'wallet' },
  { key: 'recomendacoes', label: 'Recomendações', icon: 'target' },
  { key: 'ordens', label: 'Ordens', icon: 'inbox' },
  { key: 'cadastro', label: 'Cadastro', icon: 'userPlus' },
  { key: 'documentos', label: 'Documentos', icon: 'file' },
  { key: 'atendimento', label: 'Atendimento', icon: 'lifeBuoy' },
];

// Destino de cada categoria de evento ao ser clicado (aba ou drawer).
const ACTIVITY_TARGET_LABEL = {
  ordens: 'Ver ordens', movimentacoes: 'Ver movimentações', recomendacoes: 'Ver recomendações',
  documentos: 'Ver documentos', investimentos: 'Ver carteira', cadastro: 'Ver dados', atendimento: 'Ver suporte',
};

function ActivityView({ events, onBack, onSelectEvent }) {
  const { formatDateTime } = window.PortalLib;
  const [cat, setCat] = React.useState('all');
  const filtered = events.filter((e) => cat === 'all' || e.category === cat);
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5">
        <Icon name="arrowLeft" size={14} /> Voltar para visão geral
      </button>
      <div className="flex flex-wrap gap-1.5">
        {ACTIVITY_CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)} className={window.PortalLib.classNames('text-xs px-3 py-1.5 rounded-pill border flex items-center gap-1.5', cat === c.key ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}>
            <Icon name={c.icon} size={12} /> {c.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <window.EmptyState icon="clock" title="Nenhum evento nesta categoria" />
      ) : (
        <div className="bg-white rounded-large border border-neutral-100 p-5">
          <ol className="relative border-l border-neutral-100 ml-3 space-y-1">
            {filtered.map((ev, i) => {
              const target = ACTIVITY_TARGET_LABEL[ev.category];
              return (
                <li key={i} className="ml-5">
                  <span className="absolute -ml-[30px] mt-2.5 w-6 h-6 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-500"><Icon name={ev.icon} size={12} /></span>
                  <button onClick={() => onSelectEvent(ev)} className="w-full text-left rounded-large px-2 py-2 -mx-2 hover:bg-neutral-50 group flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-neutral-400">{formatDateTime(ev.date)}</div>
                      <div className="text-sm text-neutral-800">{ev.label}</div>
                    </div>
                    {target && <span className="text-[11px] text-brand-dark opacity-0 group-hover:opacity-100 whitespace-nowrap flex items-center gap-0.5 mt-0.5">{target} <Icon name="chevronRight" size={12} /></span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

// Tela 13 — Drawer de suporte contextual (histórico + abrir atendimento).
// Cada categoria pré-seleciona um tema no formulário de novo chamado; os
// atendimentos existentes mostram protocolo, prazo (SLA) e linha do tempo.
const SUPPORT_CATEGORIES = [
  { label: 'Investimentos', theme: 'Outro' },
  { label: 'Ordem', theme: 'Erro em ordem' },
  { label: 'Cadastro', theme: 'Dúvida cadastral' },
  { label: 'Acesso e senha', theme: 'Acesso/credenciais' },
  { label: 'Banking', theme: 'Outro' },
  { label: 'Cartão', theme: 'Outro' },
  { label: 'Documentos', theme: 'Documento' },
  { label: 'Internacional', theme: 'Outro' },
  { label: 'Outro', theme: 'Outro' },
];

function SupportTicketCard({ ticket, now }) {
  const { TICKET_STATUS_META, formatDateTime, daysUntil } = window.PortalLib;
  const [open, setOpen] = React.useState(false);
  const m = TICKET_STATUS_META[ticket.status] || { label: ticket.status, className: 'bg-neutral-100 text-neutral-600' };
  const openTicket = ticket.status !== 'resolvido';
  const slaDays = ticket.dueAt ? daysUntil(ticket.dueAt.slice(0, 10), now) : null;
  const slaLabel = !ticket.dueAt ? null : slaDays < 0 ? `SLA vencido há ${-slaDays}d` : slaDays === 0 ? 'SLA vence hoje' : `SLA em ${slaDays}d`;
  return (
    <div className="border border-neutral-100 rounded-large p-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-neutral-900">{ticket.theme}</span>
          <StatusPill label={m.label} className={m.className} size="sm" />
        </div>
        <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span>{ticket.protocol} · aberto {formatDateTime(ticket.createdAt)}</span>
          {openTicket && slaLabel && <span className={slaDays < 0 ? 'text-alert-dark' : 'text-neutral-500'}>· {slaLabel}</span>}
        </div>
      </button>
      {open && ticket.messages && ticket.messages.length > 0 && (
        <ol className="relative border-l border-neutral-100 ml-1.5 mt-3 space-y-3">
          {ticket.messages.map((msg, i) => (
            <li key={i} className="ml-3">
              <span className="absolute -ml-[19px] mt-1 w-2 h-2 rounded-full bg-brand" />
              <div className="text-[11px] text-neutral-400">{msg.author} · {formatDateTime(msg.date)}</div>
              <div className="text-xs text-neutral-700">{msg.text}</div>
            </li>
          ))}
        </ol>
      )}
      {!open && ticket.messages && ticket.messages.length > 0 && (
        <div className="text-xs text-neutral-500 mt-1.5 line-clamp-1">{ticket.messages[ticket.messages.length - 1].text}</div>
      )}
    </div>
  );
}

function ClientSupportDrawer({ client, tickets, now, onClose, onNewTicket }) {
  return (
    <Drawer title="Suporte" subtitle={`${client.name} · conta ${client.account}`} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <div className="text-sm font-medium text-neutral-800 mb-2">Sobre o que você precisa de ajuda?</div>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORT_CATEGORIES.map((c) => (
              <button key={c.label} onClick={() => onNewTicket(c.theme)} className="text-xs px-3 py-1.5 rounded-pill border border-neutral-200 text-neutral-600 hover:border-brand/40 hover:bg-neutral-50">{c.label}</button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">Escolher uma categoria já preenche o tema do atendimento.</p>
        </div>

        <button onClick={() => onNewTicket(null)} className="w-full text-sm px-4 py-2.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center justify-center gap-1.5">
          <Icon name="lifeBuoy" size={15} /> Abrir atendimento
        </button>

        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Atendimentos deste cliente</div>
          {(!tickets || tickets.length === 0) ? (
            <div className="text-xs text-neutral-400">Nenhum atendimento registrado ainda.</div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => <SupportTicketCard key={t.id} ticket={t} now={now} />)}
            </div>
          )}
        </div>

        <p className="text-[11px] text-neutral-400">O contexto do cliente (conta, ordem, produto) é anexado automaticamente ao abrir um atendimento a partir daqui.</p>
      </div>
    </Drawer>
  );
}

// "Enviar relatório" (menu +Nova ação) — pré-visualiza o relatório consolidado
// e, ao confirmar, baixa o arquivo e registra o documento como enviado.
function ReportModal({ client, positions, now, onClose, onSend }) {
  const { formatCurrency, formatDate, formatDateTime, nextMaturity, ASSET_CLASS_ORDER } = window.PortalLib;
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  const byClass = {};
  positions.forEach((p) => (byClass[p.class] = (byClass[p.class] || 0) + p.currentValue));
  const rows = ASSET_CLASS_ORDER.filter((c) => byClass[c]).map((c) => ({ c, v: byClass[c], pct: total ? (byClass[c] / total) * 100 : 0 }));
  const nm = nextMaturity(positions, now);

  function generate() {
    const lines = [
      `RELATÓRIO CONSOLIDADO — ${client.name}`,
      `Conta ${client.account} · ${client.segment} · gerado em ${formatDateTime(now)}`,
      '',
      `Patrimônio total: ${formatCurrency(client.totalWealth)}`,
      `Investido: ${formatCurrency(total)}`,
      `Caixa disponível: ${formatCurrency(client.availableBalance)}`,
      client.rentability12m != null ? `Rentabilidade 12m: ${client.rentability12m >= 0 ? '+' : ''}${client.rentability12m}%` : '',
      '',
      'ALOCAÇÃO POR CLASSE',
      ...rows.map((r) => `  ${r.c}: ${formatCurrency(r.v)} (${r.pct.toFixed(1)}%)`),
      '',
      nm ? `Próximo vencimento: ${nm.position.asset} em ${formatDate(nm.position.maturityDate)} (${formatCurrency(nm.position.currentValue)})` : 'Sem vencimentos próximos.',
      '',
      'Documento simulado — protótipo do Portal do Consultor. Nenhum dado real.',
    ].filter((l) => l !== '');
    const doc = {
      id: `RPT-${Date.now().toString().slice(-6)}`,
      clientId: client.id,
      name: `Relatório consolidado ${formatDate(now.slice(0, 10))}`,
      category: 'relatorio',
      year: Number(now.slice(0, 4)),
      format: 'PDF',
      status: 'enviado',
      generatedAt: now.slice(0, 10),
    };
    window.PortalLib.download(`${client.id}-relatorio.txt`, lines.join('\n'), 'text/plain');
    onSend(doc);
    onClose();
  }

  return (
    <Modal
      title="Enviar relatório ao cliente"
      onClose={onClose}
      width="max-w-lg"
      footer={
        <React.Fragment>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">Cancelar</button>
          <button onClick={generate} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="fileText" size={14} /> Gerar e enviar</button>
        </React.Fragment>
      }
    >
      <p className="text-neutral-500 mb-3">Prévia do relatório consolidado. Ao enviar, o arquivo é gerado (simulado), fica disponível na aba Documentos como “Enviado ao cliente” e registrado no histórico.</p>
      <div className="rounded-large border border-neutral-100 p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-neutral-500">Patrimônio total</span><span className="font-medium text-neutral-900">{formatCurrency(client.totalWealth)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-neutral-500">Investido</span><span className="font-medium text-neutral-900">{formatCurrency(total)}</span></div>
        {client.rentability12m != null && <div className="flex justify-between text-sm"><span className="text-neutral-500">Rentabilidade 12m</span><span className="font-medium text-success-dark">+{client.rentability12m}%</span></div>}
        <div className="pt-2 border-t border-neutral-50">
          <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1.5">Alocação por classe</div>
          {rows.length === 0 ? <div className="text-xs text-neutral-400">Sem posições.</div> : rows.map((r) => (
            <div key={r.c} className="flex justify-between text-xs py-0.5"><span className="text-neutral-600">{r.c}</span><span className="text-neutral-900 tabular-nums">{r.pct.toFixed(1)}%</span></div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ClientProfilePage({
  client, profile, positions, cashEvents, alerts, orders, onboardingEntry, simulations, serviceRequests, holdingRelations,
  allClients, documents, accessLog, bankingProfile, tickets, plan, now, onBack, onOpenOrder, onOpenSimulation, onNewSimulation, onOpenServiceRequest, onCreateServiceRequest, onOpenTicket, onOpenClient, onCreatePlan, onGeneratePlanReport, onCommitPlan, onExploreProducts,
}) {
  const { formatCurrency, formatDate, maskDocument, CLIENT_STATUS_META, OWNER_NAME_MAP, RISK_PROFILE_META } = window.PortalLib;
  const [tab, setTab] = React.useState('overview');
  const [selectedPosition, setSelectedPosition] = React.useState(null);
  const [showBridge, setShowBridge] = React.useState(false);
  const [showSupport, setShowSupport] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);
  const [sentReports, setSentReports] = React.useState([]);
  const loading = window.useSimulatedLoading(`${client.id}|${tab}`, 260);

  // Relatórios enviados nesta sessão zeram ao trocar de cliente.
  React.useEffect(() => { setSentReports([]); }, [client.id]);
  const allDocuments = sentReports.concat(documents || []);

  const ordersAwaiting = orders.filter((o) => o.status === 'aguardando_aprovacao').length;
  const linkedClient = client.pfPjLinkId && allClients ? allClients.find((c) => c.id === client.pfPjLinkId) : null;

  const timelineEvents = []
    .concat(orders.flatMap((o) => o.timeline.map((t) => ({ date: t.date, label: `Ordem ${o.asset}: ${t.detail}` }))))
    .concat(cashEvents.map((e) => ({ date: e.date, label: `${e.description} (${window.PortalLib.formatCurrencySigned(e.value)})` })))
    .concat(onboardingEntry ? onboardingEntry.timeline.map((t) => ({ date: t.date, label: t.detail })) : [])
    .concat(alerts.map((a) => ({ date: a.date, label: `Alerta: ${window.PortalLib.ALERT_TYPE_META[a.type].label}` })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  // Eventos categorizados para a view "Toda atividade" (Tela 14).
  const categorizedEvents = []
    .concat(orders.flatMap((o) => o.timeline.map((t) => ({ date: t.date, label: `Ordem ${o.asset}: ${t.detail}`, category: 'ordens', icon: 'inbox' }))))
    .concat(cashEvents.map((e) => ({ date: e.date, label: `${e.description} (${window.PortalLib.formatCurrencySigned(e.value)})`, category: 'movimentacoes', icon: 'wallet' })))
    .concat(onboardingEntry ? onboardingEntry.timeline.map((t) => ({ date: t.date, label: t.detail, category: 'cadastro', icon: 'userPlus' })) : [])
    .concat(alerts.map((a) => ({ date: a.date, label: `Alerta: ${window.PortalLib.ALERT_TYPE_META[a.type].label}`, category: 'investimentos', icon: 'trendingUp' })))
    .concat((simulations || []).map((s) => ({ date: s.updatedAt, label: `Recomendação “${s.name}”`, category: 'recomendacoes', icon: 'target' })))
    .concat((accessLog || []).map((a) => ({ date: a.date, label: `${a.action}: ${a.document}`, category: 'documentos', icon: 'file' })))
    .concat((tickets || []).map((t) => ({ date: t.createdAt, label: `Atendimento ${t.protocol}: ${t.theme}`, category: 'atendimento', icon: 'lifeBuoy' })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const tabs = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'portfolio', label: 'Carteira' },
    { key: 'cash', label: 'Movimentações' },
    { key: 'recommendations', label: 'Recomendações' },
    { key: 'orders', label: 'Ordens' },
    { key: 'documents', label: 'Documentos' },
    { key: 'banking', label: 'Banking' },
    { key: 'dados', label: 'Dados' },
    { key: 'planning', label: 'Planejamento' },
  ];

  const criticalPending = client.status === 'bloqueado' || (onboardingEntry && onboardingEntry.status === 'pendencia');

  const novaAcoes = [
    { label: 'Simular carteira', icon: 'target', onClick: () => setShowBridge(true) },
    { label: 'Recomendar investimento', icon: 'sparkles', onClick: () => setShowBridge(true) },
    { label: 'Enviar relatório', icon: 'fileText', onClick: () => setShowReport(true) },
    { label: 'Solicitar documento', icon: 'file', onClick: () => setTab('documents') },
    { label: 'Abrir atendimento', icon: 'lifeBuoy', onClick: () => setShowSupport(true) },
  ];

  function startRecommendation(intent) {
    setShowBridge(false);
    onNewSimulation(client.id, intent ? intent.objectives : null);
  }

  // Clique num evento de "Toda atividade" → abre a aba/drawer correspondente.
  const ACTIVITY_TO_TAB = { ordens: 'orders', movimentacoes: 'cash', recomendacoes: 'recommendations', documentos: 'documents', investimentos: 'portfolio', cadastro: 'dados' };
  function onSelectActivity(ev) {
    if (ev.category === 'atendimento') { setShowSupport(true); return; }
    const dest = ACTIVITY_TO_TAB[ev.category];
    if (dest) setTab(dest);
  }

  return (
    <div className="space-y-4">
      {/* Abas (topo) */}
      <div className="bg-white rounded-large border border-neutral-100 px-3">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={window.PortalLib.classNames('text-sm px-3 py-3 border-b-2 whitespace-nowrap', tab === t.key ? 'border-brand text-brand-dark font-semibold' : 'border-transparent text-neutral-500 hover:text-neutral-700')}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Header do cliente */}
      <div className="bg-white rounded-large border border-neutral-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Identidade */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-14 h-14 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center font-bold text-lg shrink-0">
              {client.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-neutral-900">{client.name}</h1>
                <StatusPill label={CLIENT_STATUS_META[client.status].label} className={CLIENT_STATUS_META[client.status].className} size="sm" />
                <StatusPill label={client.type} className="bg-neutral-100 text-neutral-600" size="sm" />
              </div>
              <div className="text-sm text-neutral-500 mt-0.5">Conta {client.account} · <span className="text-neutral-400">CPF {maskDocument(client.cpfCnpj)}</span></div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-neutral-600 flex-wrap">
                <span className="flex items-center gap-1"><Icon name="file" size={13} className="text-neutral-400" /> {client.email} <CopyButton value={client.email} label="e-mail" /></span>
                <span className="flex items-center gap-1">{client.phone} <CopyButton value={client.phone} label="telefone" /></span>
              </div>
            </div>
          </div>

          {/* Segmento / consultoria / consultor */}
          <div className="text-sm leading-relaxed hidden md:block">
            <div className="flex items-center gap-1.5 font-medium text-neutral-800"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: window.PortalLib.segmentDot(client.segment) }} /> {window.PortalLib.segmentLabel(client.segment)}</div>
            <div className="text-neutral-500">{client.escritorio}</div>
            <div className="text-neutral-400">{OWNER_NAME_MAP[client.ownerId] || client.ownerId}</div>
          </div>

          {/* Perfil + Suitability + ação */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-brand-dark">Perfil {RISK_PROFILE_META[client.riskProfile].label}</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Suitability até {formatDate(client.suitabilityExpiry)}</span>
            </div>
            <NovaAcaoMenu actions={novaAcoes} />
          </div>
        </div>

        {criticalPending && (
          <div className="mt-4 flex items-center gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2">
            <Icon name="alertTriangle" size={15} />
            {client.status === 'bloqueado' ? 'Conta bloqueada — requer revisão antes de qualquer nova operação.' : `Pendência crítica de onboarding: ${onboardingEntry.pendingReason}`}
          </div>
        )}
      </div>

      {loading ? (
        <window.SkeletonRows count={5} />
      ) : (
        <React.Fragment>
          {tab === 'overview' && (
            <div className="space-y-4">
              <FinancialCards client={client} positions={positions} />
              <RentabilityEvolution client={client} positions={positions} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <AttentionArea client={client} positions={positions} ordersAwaiting={ordersAwaiting} now={now} onGoCash={() => setTab('cash')} onGoPortfolio={() => setTab('portfolio')} onGoOrders={() => setTab('orders')} />
                  <NextEvents client={client} positions={positions} ordersAwaiting={ordersAwaiting} now={now} />
                  {client.type === 'PJ' && <PartnersSection client={client} relations={holdingRelations} />}
                </div>
                <div className="space-y-4">
                  <AssetClassBar positions={positions} onSeeAll={() => setTab('portfolio')} />
                  <div className="bg-white rounded-large border border-neutral-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-neutral-800">Atividade recente</h3>
                      <button onClick={() => setTab('activity')} className="text-xs font-medium text-brand-dark hover:underline">Ver toda atividade</button>
                    </div>
                    <CompactActivity events={timelineEvents} limit={5} now={now} />
                  </div>
                </div>
              </div>
              <InsightsActions client={client} positions={positions} now={now} onSimulate={() => setShowBridge(true)} onGoPortfolio={() => setTab('portfolio')} />
            </div>
          )}
          {tab === 'portfolio' && (
            <PortfolioTab
              client={client}
              positions={positions}
              now={now}
              onExport={() => window.PortalLib.download(`${client.id}-carteira.json`, JSON.stringify(positions, null, 2))}
              onOpenPosition={setSelectedPosition}
              onSimulateRebalance={() => setShowBridge(true)}
              onExploreProducts={() => onExploreProducts(client.id)}
            />
          )}
          {tab === 'cash' && <CashTab client={client} events={cashEvents} now={now} onSimulateApply={() => setShowBridge(true)} />}
          {tab === 'recommendations' && (
            <ClientRecommendationsTab profile={profile} client={client} positions={positions} simulations={simulations} now={now} onOpenSimulation={onOpenSimulation} onNewRecommendation={() => setShowBridge(true)} />
          )}
          {tab === 'orders' && <ClientOrdersTab orders={orders} now={now} onOpenOrder={onOpenOrder} />}
          {tab === 'documents' && <DocumentsTab client={client} documents={allDocuments} accessLog={accessLog} onOpenTicket={onOpenTicket} />}
          {tab === 'banking' && <BankingTab client={client} profile={profile} bankingProfile={bankingProfile} serviceRequests={serviceRequests} onCreateServiceRequest={onCreateServiceRequest} onOpenServiceRequest={onOpenServiceRequest} />}
          {tab === 'planning' && (
            <window.PlanningTab
              client={client}
              plan={plan}
              now={now}
              onCreatePlan={() => onCreatePlan && onCreatePlan(client.id)}
              onGenerateReport={(id) => onGeneratePlanReport && onGeneratePlanReport(id)}
              onCommitPlan={(draft, status) => onCommitPlan && onCommitPlan(client.id, draft, status)}
              onSimulate={() => onNewSimulation(client.id, plan ? [plan.objectives.primary === 'Aposentadoria' ? 'aposentadoria' : 'longo_prazo'] : null)}
            />
          )}
          {tab === 'activity' && <ActivityView events={categorizedEvents} onBack={() => setTab('overview')} onSelectEvent={onSelectActivity} />}
          {tab === 'dados' && <DadosTab client={client} linkedClient={linkedClient} holdingRelations={holdingRelations} onOpenLinked={onOpenClient} />}
        </React.Fragment>
      )}

      {selectedPosition && (
        <window.PositionDrawer
          position={selectedPosition}
          client={client}
          now={now}
          onClose={() => setSelectedPosition(null)}
          onSimulateReinvest={() => { setSelectedPosition(null); setShowBridge(true); }}
          onSeeMovements={() => { setSelectedPosition(null); setTab('cash'); }}
          onExport={(p) => window.PortalLib.download(`${client.id}-${p.id}.json`, JSON.stringify(p, null, 2))}
        />
      )}

      {showBridge && <window.NewRecommendationBridge client={client} onContinue={startRecommendation} onClose={() => setShowBridge(false)} />}

      {showReport && (
        <ReportModal
          client={client}
          positions={positions}
          now={now}
          onClose={() => setShowReport(false)}
          onSend={(doc) => { setSentReports((prev) => [doc, ...prev]); setTab('documents'); }}
        />
      )}

      {showSupport && (
        <ClientSupportDrawer
          client={client}
          tickets={tickets}
          now={now}
          onClose={() => setShowSupport(false)}
          onNewTicket={(theme) => { setShowSupport(false); onOpenTicket(client, 'client', null, null, theme); }}
        />
      )}
    </div>
  );
}

window.ClientProfilePage = ClientProfilePage;

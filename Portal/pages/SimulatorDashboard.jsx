// Tela 08–12 — Dashboard da simulação (US-12).
// Abas: Resumo, Performance, Risco e Liquidez, Análise técnica, Comparação.
// Todos os números vêm do motor determinístico window.PortalAnalytics.

const DASH_TABS = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'performance', label: 'Performance' },
  { key: 'risco', label: 'Risco e Liquidez' },
  { key: 'tecnica', label: 'Análise técnica' },
  { key: 'comparacao', label: 'Comparação' },
];

const SERIES_COLORS = { current: '#9E9E9E', proposed: '#FF7A00', cdi: '#1E7FE6' };
const PROFILE_RISK_LEVEL = { Conservador: 1, Moderado: 3, Agressivo: 4, Sofisticado: 5 };

function pctOf(byClass, className) {
  const c = byClass.find((x) => x.class === className);
  return c ? c.pct : 0;
}
function fmtPct(v, digits) {
  return `${v >= 0 ? '' : ''}${v.toFixed(digits == null ? 1 : digits)}%`;
}
function fmtSignedPp(v) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)} pp`;
}

// ---------- Resumo ----------
function ChangeRow({ dir, text }) {
  const map = { up: 'text-success-dark', down: 'text-brand-dark', flat: 'text-neutral-400' };
  const icon = { up: '↑', down: '↓', flat: '=' };
  return (
    <li className="flex items-start gap-2 text-sm text-neutral-700">
      <span className={window.PortalLib.classNames('font-semibold w-4 shrink-0', map[dir])}>{icon[dir]}</span>
      {text}
    </li>
  );
}
function IndicatorCompareRow({ label, atual, proposta, betterWhenHigher, atualNum, propNum }) {
  let trend = 'flat';
  if (atualNum != null && propNum != null && Math.abs(propNum - atualNum) > 0.001) {
    const higher = propNum > atualNum;
    trend = (betterWhenHigher ? higher : !higher) ? 'good' : 'bad';
  }
  const tm = { good: { i: 'trendingUp', c: 'text-success-dark' }, bad: { i: 'trendingDown', c: 'text-alert-dark' }, flat: { i: 'refresh', c: 'text-neutral-300' } };
  const t = tm[trend];
  return (
    <tr className="border-b border-neutral-50 last:border-0">
      <td className="py-2.5 text-sm text-neutral-600">{label}</td>
      <td className="py-2.5 text-sm text-neutral-500 text-right tabular-nums">{atual}</td>
      <td className="py-2.5 text-sm text-neutral-900 font-medium text-right tabular-nums">{proposta}</td>
      <td className="py-2.5 text-right w-10"><span className={t.c}><Icon name={t.i} size={15} /></span></td>
    </tr>
  );
}

function ResumoTab({ ctx, client, simulation, analysis }) {
  const { formatCurrency } = window.PortalLib;
  const { AllocationDonut, SimKpi } = window.SimulatorChrome;
  const A = window.PortalAnalytics;
  const cm = ctx.currentMetrics;
  const pm = ctx.proposedMetrics;
  const value = simulation.simulationValue || 0;

  const changes = [];
  if (pctOf(ctx.proposedAlloc.byClass, 'Pós-fixado') < pctOf(ctx.currentAlloc.byClass, 'Pós-fixado') - 0.5) changes.push({ dir: 'down', text: 'Menor concentração em pós-fixados.' });
  if (pctOf(ctx.proposedAlloc.byClass, 'Inflação') > pctOf(ctx.currentAlloc.byClass, 'Inflação') + 0.5) changes.push({ dir: 'up', text: 'Maior proteção contra inflação.' });
  if (pm.liquidUpTo1 > cm.liquidUpTo1 + 0.5) changes.push({ dir: 'up', text: 'Mais liquidez de curto prazo (D+1).' });
  if (pm.classCount > cm.classCount || pm.diversification === 'Boa') changes.push({ dir: 'up', text: 'Maior diversificação entre classes.' });
  changes.push({ dir: 'flat', text: `Risco permanece ${A.riskLabel(pm.riskScore).toLowerCase()}, compatível com o perfil ${client.riskProfile}.` });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SimKpi label="Valor simulado" value={formatCurrency(value)} accent />
        <SimKpi label="Liquidez até D+1" value={`${pm.liquidUpTo1.toFixed(0)}%`} sub={`atual ${cm.liquidUpTo1.toFixed(0)}%`} />
        <SimKpi label="Nível de risco" value={A.riskLabel(pm.riskScore)} sub={`score ${pm.riskScore.toFixed(1)}`} />
        <SimKpi label="Maior concentração" value={pm.topIssuer ? `${pm.topIssuer.pct.toFixed(0)}%` : '—'} sub={pm.topIssuer ? pm.topIssuer.issuer : ''} />
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Carteira atual × carteira proposta</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-neutral-400 mb-2">Atual · {formatCurrency(ctx.currentAlloc.total)}</div>
            <AllocationDonut byClass={ctx.currentAlloc.byClass} size={150} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-2">Proposta · {formatCurrency(ctx.proposedAlloc.total)}</div>
            <AllocationDonut byClass={ctx.proposedAlloc.byClass} size={150} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">O que muda com esta proposta</h2>
          <ul className="space-y-2">{changes.map((c, i) => <ChangeRow key={i} dir={c.dir} text={c.text} />)}</ul>
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-2">Principais indicadores</h2>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] text-neutral-400 uppercase tracking-wide">
                <th className="text-left font-medium py-1.5">Indicador</th>
                <th className="text-right font-medium py-1.5">Atual</th>
                <th className="text-right font-medium py-1.5">Proposta</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              <IndicatorCompareRow label="Liquidez até D+1" atual={`${cm.liquidUpTo1.toFixed(0)}%`} proposta={`${pm.liquidUpTo1.toFixed(0)}%`} betterWhenHigher atualNum={cm.liquidUpTo1} propNum={pm.liquidUpTo1} />
              <IndicatorCompareRow label="Maior concentração" atual={cm.topIssuer ? `${cm.topIssuer.pct.toFixed(0)}%` : '—'} proposta={pm.topIssuer ? `${pm.topIssuer.pct.toFixed(0)}%` : '—'} betterWhenHigher={false} atualNum={cm.topIssuer ? cm.topIssuer.pct : null} propNum={pm.topIssuer ? pm.topIssuer.pct : null} />
              <IndicatorCompareRow label="Diversificação" atual={cm.diversification} proposta={pm.diversification} betterWhenHigher atualNum={cm.classCount} propNum={pm.classCount} />
              <IndicatorCompareRow label="Volatilidade (a.a.)" atual={`${(cm.volatility * 100).toFixed(1)}%`} proposta={`${(pm.volatility * 100).toFixed(1)}%`} betterWhenHigher={false} atualNum={cm.volatility} propNum={pm.volatility} />
              <IndicatorCompareRow label="Retorno esperado (a.a.)" atual={`${(cm.expectedReturn * 100).toFixed(1)}%`} proposta={`${(pm.expectedReturn * 100).toFixed(1)}%`} betterWhenHigher atualNum={cm.expectedReturn} propNum={pm.expectedReturn} />
            </tbody>
          </table>
          <p className="text-[11px] text-neutral-400 mt-3">Estimativas simuladas a partir de premissas por classe. Não representam garantia de rentabilidade futura.</p>
        </div>
      </div>
    </div>
  );
}

// ---------- Performance ----------
const PERF_WINDOWS = [{ k: 12, label: '12M' }, { k: 24, label: '24M' }, { k: 36, label: '36M' }, { k: 60, label: '5 anos' }];

function PerformanceTab({ analysis }) {
  const { SimKpi } = window.SimulatorChrome;
  const [win, setWin] = React.useState(36);
  const [show, setShow] = React.useState({ current: true, proposed: true, cdi: true });
  const hist = analysis.hist;

  function slice(series) {
    const start = Math.max(0, series.length - 1 - win);
    const base = series[start];
    return series.slice(start).map((v) => (v / base) * 100);
  }
  const cur = slice(hist.current);
  const prop = slice(hist.proposed);
  const cdi = slice(hist.cdi);
  const labels = cur.map((_, i) => `M-${cur.length - 1 - i}`);

  const retCur = cur[cur.length - 1] - 100;
  const retProp = prop[prop.length - 1] - 100;
  const retCdi = cdi[cdi.length - 1] - 100;

  const datasets = [];
  if (show.current) datasets.push({ label: 'Carteira atual', data: cur, borderColor: SERIES_COLORS.current, backgroundColor: SERIES_COLORS.current, tension: 0.3, pointRadius: 0, borderWidth: 2 });
  if (show.proposed) datasets.push({ label: 'Carteira proposta', data: prop, borderColor: SERIES_COLORS.proposed, backgroundColor: SERIES_COLORS.proposed, tension: 0.3, pointRadius: 0, borderWidth: 2.5 });
  if (show.cdi) datasets.push({ label: 'CDI', data: cdi, borderColor: SERIES_COLORS.cdi, backgroundColor: SERIES_COLORS.cdi, tension: 0.3, pointRadius: 0, borderWidth: 2, borderDash: [5, 4] });

  const options = {
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw.toFixed(1)}` } } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6, color: '#9E9E9E', font: { size: 10 } } },
      y: { grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 10 } } },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  const periodTable = hist.periodReturns.filter((p) => p.months <= win || win === 60);

  const toggle = (key, color, label, val) => (
    <button
      onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
      className={window.PortalLib.classNames('flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-pill border', show[key] ? 'border-neutral-200 bg-white' : 'border-neutral-100 bg-neutral-50 opacity-50')}
    >
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label} <span className="tabular-nums text-neutral-500">{val >= 0 ? '+' : ''}{val.toFixed(1)}%</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-neutral-100 rounded-pill p-1">
          {PERF_WINDOWS.map((w) => (
            <button key={w.k} onClick={() => setWin(w.k)} className={window.PortalLib.classNames('text-xs px-3 py-1.5 rounded-pill', win === w.k ? 'bg-white text-neutral-900 font-medium shadow-sm' : 'text-neutral-500')}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SimKpi label="Carteira atual" value={`${retCur >= 0 ? '+' : ''}${retCur.toFixed(1)}%`} />
        <SimKpi label="Carteira proposta" value={`${retProp >= 0 ? '+' : ''}${retProp.toFixed(1)}%`} accent />
        <SimKpi label="CDI" value={`${retCdi >= 0 ? '+' : ''}${retCdi.toFixed(1)}%`} />
        <SimKpi label="Proposta × CDI" value={fmtSignedPp(retProp - retCdi)} sub="diferença na janela" />
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {toggle('current', SERIES_COLORS.current, 'Atual', retCur)}
          {toggle('proposed', SERIES_COLORS.proposed, 'Proposta', retProp)}
          {toggle('cdi', SERIES_COLORS.cdi, 'CDI', retCdi)}
        </div>
        <window.ChartCanvas type="line" data={{ labels, datasets }} options={options} height={280} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Performance por período</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
                <th className="text-left font-medium py-2">Carteira</th>
                {[12, 24, 36, 60].map((k) => <th key={k} className="text-right font-medium py-2">{k === 60 ? '5 anos' : k + 'M'}</th>)}
              </tr>
            </thead>
            <tbody>
              {[{ key: 'current', label: 'Atual' }, { key: 'proposed', label: 'Proposta' }, { key: 'cdi', label: 'CDI' }].map((row) => (
                <tr key={row.key} className="border-b border-neutral-50 last:border-0">
                  <td className="py-2 text-neutral-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[row.key] }} /> {row.label}
                  </td>
                  {hist.periodReturns.map((p) => (
                    <td key={p.months} className="py-2 text-right tabular-nums text-neutral-800">{(p[row.key] * 100).toFixed(1)}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-2">Como interpretar</h2>
          <p className="text-sm text-neutral-600">No período selecionado, a carteira proposta teria apresentado retorno {retProp >= retCdi ? 'superior' : 'inferior'} ao CDI e {retProp >= retCur ? 'acima' : 'abaixo'} da composição atual.</p>
          <div className="mt-3 text-[11px] text-warning-dark bg-warning-light rounded-medium px-3 py-2 flex items-start gap-1.5">
            <Icon name="alertTriangle" size={13} className="mt-0.5 shrink-0" />
            Simulação baseada em dados históricos sintéticos. Rentabilidade passada não representa garantia de resultados futuros.
          </div>
          <button className="text-xs text-brand-dark hover:underline mt-3 flex items-center gap-1"><Icon name="fileText" size={12} /> Ver metodologia</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Risco e Liquidez ----------
function RiskDots({ score }) {
  const filled = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={window.PortalLib.classNames('w-2.5 h-2.5 rounded-full', i <= filled ? 'bg-brand' : 'bg-neutral-200')} />
      ))}
    </span>
  );
}

function RiscoLiquidezTab({ ctx, client, analysis }) {
  const A = window.PortalAnalytics;
  const cm = ctx.currentMetrics;
  const pm = ctx.proposedMetrics;
  const clientLevel = PROFILE_RISK_LEVEL[client.riskProfile] || 3;
  const compatible = pm.riskScore <= clientLevel + 0.5;

  const bucketColor = ['#00A868', '#1E7FE6', '#FFB800', '#FF9B3D', '#9E9E9E']; // d0_1, d2_5, d6_30, gt30, vencimento

  const ladder = (label, buckets) => (
    <div>
      <div className="text-xs text-neutral-500 mb-1.5">{label}</div>
      <div className="flex h-3 rounded-pill overflow-hidden bg-neutral-100">
        {buckets.map((b, i) => (
          <div key={b.key} title={`${b.label}: ${b.pct.toFixed(0)}%`} style={{ width: `${b.pct}%`, backgroundColor: bucketColor[i] }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Liquidez */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Liquidez</h2>
        <div className="space-y-4">
          {ladder('Proposta', pm.liquidityBuckets)}
          {ladder('Atual', cm.liquidityBuckets)}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
          {pm.liquidityBuckets.map((b, i) => (
            <span key={b.key} className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bucketColor[i] }} /> {b.label} <span className="tabular-nums text-neutral-700">{b.pct.toFixed(0)}%</span>
            </span>
          ))}
        </div>
        <div className="mt-4 text-sm bg-info-light text-info-dark rounded-medium px-3 py-2 flex items-start gap-2">
          <Icon name="wallet" size={15} className="mt-0.5 shrink-0" />
          {pm.liquidUpTo5.toFixed(0)}% da carteira pode ser convertida em caixa em até 5 dias úteis.
        </div>
      </div>

      {/* Risco */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Risco</h2>
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2"><span>Baixo</span><span>Alto</span></div>
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-600">Atual <span className="text-neutral-400">({cm.riskScore.toFixed(1)})</span></span><RiskDots score={cm.riskScore} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-600">Proposta <span className="text-neutral-400">({pm.riskScore.toFixed(1)})</span></span><RiskDots score={pm.riskScore} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-600">Perfil do cliente</span><span className="text-sm font-medium text-neutral-900">{client.riskProfile}</span></div>
        </div>
        <div className={window.PortalLib.classNames('mt-4 text-sm rounded-medium px-3 py-2 flex items-center gap-2', compatible ? 'bg-success-light text-success-dark' : 'bg-warning-light text-warning-dark')}>
          <Icon name={compatible ? 'check' : 'alertTriangle'} size={15} />
          {compatible ? 'Proposta compatível com o perfil do investidor.' : 'Proposta acima do perfil — revise antes de recomendar.'}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-neutral-100">
          <div><div className="text-[11px] text-neutral-400">Volatilidade</div><div className="text-sm font-semibold text-neutral-900">{(pm.volatility * 100).toFixed(1)}%</div></div>
          <div><div className="text-[11px] text-neutral-400">Maior drawdown</div><div className="text-sm font-semibold text-neutral-900">{analysis.ddProposed.maxDrawdown.toFixed(1)}%</div></div>
          <div><div className="text-[11px] text-neutral-400">Maior emissor</div><div className="text-sm font-semibold text-neutral-900">{pm.topIssuer ? `${pm.topIssuer.pct.toFixed(0)}%` : '—'}</div></div>
        </div>
      </div>
    </div>
  );
}

// ---------- Análise técnica ----------
function CorrelationModal({ corr, onClose }) {
  function cellColor(v) {
    if (v >= 0.7) return 'bg-alert-light text-alert-dark';
    if (v >= 0.4) return 'bg-warning-light text-warning-dark';
    return 'bg-success-light text-success-dark';
  }
  return (
    <Modal title="Matriz de correlação" onClose={onClose} width="max-w-2xl">
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-1.5" />
              {corr.classes.map((c) => <th key={c} className="p-1.5 text-neutral-500 font-medium whitespace-nowrap text-[10px] rotate-0">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {corr.classes.map((rc, i) => (
              <tr key={rc}>
                <td className="p-1.5 text-neutral-500 font-medium whitespace-nowrap">{rc}</td>
                {corr.classes.map((cc, j) => (
                  <td key={cc} className={window.PortalLib.classNames('p-1.5 text-center tabular-nums rounded', cellColor(corr.matrix[i][j]))}>{corr.matrix[i][j].toFixed(2)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-neutral-400 mt-3">Correlações sintéticas, apenas para leitura consultiva. Verde: baixa; amarelo: média; vermelho: alta.</p>
    </Modal>
  );
}

function AnaliseTecnicaTab({ ctx, analysis }) {
  const A = window.PortalAnalytics;
  const cm = ctx.currentMetrics;
  const pm = ctx.proposedMetrics;
  const [showMatrix, setShowMatrix] = React.useState(false);

  // Scatter risco × retorno
  const classPoints = analysis.scatterPoints.map((p) => ({ x: p.x, y: p.y }));
  const scatterData = {
    datasets: [
      { label: 'Classes', data: classPoints, backgroundColor: '#C9CDD3', pointRadius: 5 },
      { label: 'CDI', data: [{ x: 0.4, y: A.CDI_ANNUAL * 100 }], backgroundColor: SERIES_COLORS.cdi, pointRadius: 7 },
      { label: 'Atual', data: [{ x: cm.volatility * 100, y: cm.expectedReturn * 100 }], backgroundColor: SERIES_COLORS.current, pointRadius: 7 },
      { label: 'Proposta', data: [{ x: pm.volatility * 100, y: pm.expectedReturn * 100 }], backgroundColor: SERIES_COLORS.proposed, pointRadius: 8 },
    ],
  };
  const scatterOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: risco ${c.raw.x.toFixed(1)}% · retorno ${c.raw.y.toFixed(1)}%` } },
    },
    scales: {
      x: { title: { display: true, text: 'Risco (volatilidade % a.a.)', color: '#9E9E9E', font: { size: 10 } }, grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 10 } } },
      y: { title: { display: true, text: 'Retorno esperado (% a.a.)', color: '#9E9E9E', font: { size: 10 } }, grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 10 } } },
    },
  };

  // Drawdown (proposta)
  const dd = analysis.ddProposed;
  const ddData = {
    labels: dd.series.map((_, i) => `M-${dd.series.length - 1 - i}`),
    datasets: [{ label: 'Drawdown', data: dd.series, borderColor: SERIES_COLORS.proposed, backgroundColor: 'rgba(255,122,0,0.12)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 1.5 }],
  };
  const ddOptions = {
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.raw.toFixed(1)}%` } } },
    scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6, color: '#9E9E9E', font: { size: 10 } } }, y: { grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 10 } } } },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risco x Retorno */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Risco × Retorno</h2>
          <window.ChartCanvas type="scatter" data={scatterData} options={scatterOptions} height={260} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {[['Atual', SERIES_COLORS.current], ['Proposta', SERIES_COLORS.proposed], ['CDI', SERIES_COLORS.cdi], ['Classes', '#C9CDD3']].map(([l, c]) => (
              <span key={l} className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} /> {l}</span>
            ))}
          </div>
        </div>

        {/* Drawdown */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Drawdown (proposta)</h2>
          <window.ChartCanvas type="line" data={ddData} options={ddOptions} height={200} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><div className="text-[11px] text-neutral-400">Maior perda</div><div className="text-sm font-semibold text-alert-dark">{dd.maxDrawdown.toFixed(1)}%</div></div>
            <div><div className="text-[11px] text-neutral-400">Recuperação estimada</div><div className="text-sm font-semibold text-neutral-900">{dd.recoveryMonths != null ? `${dd.recoveryMonths} ${dd.recoveryMonths === 1 ? 'mês' : 'meses'}` : '—'}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Correlação */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-2">Correlação</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-neutral-600">Diversificação:</span>
            <StatusPill label={analysis.corr.diversification} className={analysis.corr.diversification === 'Boa' ? 'bg-success-light text-success-dark' : analysis.corr.diversification === 'Média' ? 'bg-warning-light text-warning-dark' : 'bg-alert-light text-alert-dark'} size="sm" />
          </div>
          <p className="text-sm text-neutral-500">{analysis.corr.highPairs === 0 ? 'Nenhum par de classes com alta correlação entre si.' : `${analysis.corr.highPairs} par(es) de classes com alta correlação entre si.`}</p>
          <button onClick={() => setShowMatrix(true)} className="text-xs text-brand-dark hover:underline mt-3 flex items-center gap-1"><Icon name="layers" size={12} /> Ver matriz completa</button>
        </div>

        {/* Volatilidade */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Volatilidade (a.a.)</h2>
          <div className="grid grid-cols-3 gap-3">
            <div><div className="text-[11px] text-neutral-400">Atual</div><div className="text-lg font-semibold text-neutral-900">{(cm.volatility * 100).toFixed(1)}%</div></div>
            <div><div className="text-[11px] text-neutral-400">Proposta</div><div className="text-lg font-semibold text-brand-dark">{(pm.volatility * 100).toFixed(1)}%</div></div>
            <div><div className="text-[11px] text-neutral-400">CDI</div><div className="text-lg font-semibold text-neutral-900">3.1%</div></div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3">Volatilidade estima a oscilação anual esperada. Quanto maior, maior a variação possível do valor da carteira.</p>
        </div>
      </div>

      {showMatrix && <CorrelationModal corr={analysis.corr} onClose={() => setShowMatrix(false)} />}
    </div>
  );
}

// ---------- Comparação (Tela 12) ----------
function CompRow({ label, atual, proposta, delta, tone }) {
  const toneMap = { good: 'text-success-dark', bad: 'text-alert-dark', flat: 'text-neutral-400' };
  return (
    <tr className="border-b border-neutral-50 last:border-0">
      <td className="py-2.5 text-sm text-neutral-600">{label}</td>
      <td className="py-2.5 text-sm text-neutral-500 text-right tabular-nums">{atual}</td>
      <td className="py-2.5 text-sm text-neutral-900 font-medium text-right tabular-nums">{proposta}</td>
      <td className={window.PortalLib.classNames('py-2.5 text-sm text-right tabular-nums', toneMap[tone])}>{delta}</td>
    </tr>
  );
}

function ComparacaoTab({ ctx, client, analysis, onGenerateProposal, simulationId }) {
  const cm = ctx.currentMetrics;
  const pm = ctx.proposedMetrics;
  const cA = ctx.currentAlloc.byClass;
  const pA = ctx.proposedAlloc.byClass;

  function ppDelta(before, after, betterHigher) {
    const d = after - before;
    const tone = Math.abs(d) < 0.5 ? 'flat' : (betterHigher ? d > 0 : d < 0) ? 'good' : 'bad';
    return { text: `${d >= 0 ? '+' : ''}${d.toFixed(0)} pp`, tone };
  }
  function numDelta(before, after, betterHigher, suffix) {
    const d = after - before;
    const tone = Math.abs(d) < 0.05 ? 'flat' : (betterHigher ? d > 0 : d < 0) ? 'good' : 'bad';
    return { text: `${d >= 0 ? '+' : ''}${d.toFixed(1)}${suffix || ''}`, tone };
  }

  const posD = ppDelta(pctOf(cA, 'Pós-fixado'), pctOf(pA, 'Pós-fixado'), false);
  const infD = ppDelta(pctOf(cA, 'Inflação'), pctOf(pA, 'Inflação'), true);
  const rvD = ppDelta(pctOf(cA, 'Ações'), pctOf(pA, 'Ações'), true);
  const liqD = ppDelta(cm.liquidUpTo1, pm.liquidUpTo1, true);
  const concD = ppDelta(cm.topIssuer ? cm.topIssuer.pct : 0, pm.topIssuer ? pm.topIssuer.pct : 0, false);
  const volD = numDelta(cm.volatility * 100, pm.volatility * 100, false, '%');
  const retD = numDelta(cm.expectedReturn * 100, pm.expectedReturn * 100, true, '%');
  const ddD = numDelta(analysis.ddCurrent.maxDrawdown, analysis.ddProposed.maxDrawdown, true, '%');
  const issD = { text: `${(pm.issuerCount || 0) - (cm.issuerCount || 0) >= 0 ? '+' : ''}${(pm.issuerCount || 0) - (cm.issuerCount || 0)}`, tone: 'flat' };
  const prodD = { text: '—', tone: 'flat' };

  const impacts = [
    { icon: 'layers', title: 'Diversificação', text: cm.topIssuer && pm.topIssuer ? `Concentração no maior emissor vai de ${cm.topIssuer.pct.toFixed(0)}% para ${pm.topIssuer.pct.toFixed(0)}%.` : 'Distribuição por classes mais equilibrada.' },
    { icon: 'wallet', title: 'Liquidez', text: `Recursos disponíveis em D+1 vão de ${cm.liquidUpTo1.toFixed(0)}% para ${pm.liquidUpTo1.toFixed(0)}%.` },
    { icon: 'shield', title: 'Proteção', text: `Exposição à inflação ${pctOf(pA, 'Inflação') >= pctOf(cA, 'Inflação') ? 'aumenta' : 'reduz'} em ${Math.abs(pctOf(pA, 'Inflação') - pctOf(cA, 'Inflação')).toFixed(0)} pontos percentuais.` },
    { icon: 'trendingUp', title: 'Risco', text: `Nível geral permanece dentro do perfil ${client.riskProfile}.` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 bg-neutral-100 rounded-pill p-1">
          <button className="text-xs px-3 py-1.5 rounded-pill bg-white text-neutral-900 font-medium shadow-sm">Atual × Proposta</button>
          <button className="text-xs px-3 py-1.5 rounded-pill text-neutral-400" title="Disponível em breve">Simulação A × B</button>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
              <th className="text-left font-medium py-2">Indicador</th>
              <th className="text-right font-medium py-2">Atual</th>
              <th className="text-right font-medium py-2">Proposta</th>
              <th className="text-right font-medium py-2">Mudança</th>
            </tr>
          </thead>
          <tbody>
            <CompRow label="Pós-fixado" atual={`${pctOf(cA, 'Pós-fixado').toFixed(0)}%`} proposta={`${pctOf(pA, 'Pós-fixado').toFixed(0)}%`} delta={posD.text} tone={posD.tone} />
            <CompRow label="Inflação" atual={`${pctOf(cA, 'Inflação').toFixed(0)}%`} proposta={`${pctOf(pA, 'Inflação').toFixed(0)}%`} delta={infD.text} tone={infD.tone} />
            <CompRow label="Renda variável" atual={`${pctOf(cA, 'Ações').toFixed(0)}%`} proposta={`${pctOf(pA, 'Ações').toFixed(0)}%`} delta={rvD.text} tone={rvD.tone} />
            <CompRow label="Liquidez até D+1" atual={`${cm.liquidUpTo1.toFixed(0)}%`} proposta={`${pm.liquidUpTo1.toFixed(0)}%`} delta={liqD.text} tone={liqD.tone} />
            <CompRow label="Maior concentração" atual={cm.topIssuer ? `${cm.topIssuer.pct.toFixed(0)}%` : '—'} proposta={pm.topIssuer ? `${pm.topIssuer.pct.toFixed(0)}%` : '—'} delta={concD.text} tone={concD.tone} />
            <CompRow label="Volatilidade" atual={`${(cm.volatility * 100).toFixed(1)}%`} proposta={`${(pm.volatility * 100).toFixed(1)}%`} delta={volD.text} tone={volD.tone} />
            <CompRow label="Retorno esperado" atual={`${(cm.expectedReturn * 100).toFixed(1)}%`} proposta={`${(pm.expectedReturn * 100).toFixed(1)}%`} delta={retD.text} tone={retD.tone} />
            <CompRow label="Maior drawdown" atual={`${analysis.ddCurrent.maxDrawdown.toFixed(1)}%`} proposta={`${analysis.ddProposed.maxDrawdown.toFixed(1)}%`} delta={ddD.text} tone={ddD.tone} />
            <CompRow label="Número de emissores" atual={cm.issuerCount || '—'} proposta={pm.issuerCount || '—'} delta={issD.text} tone={issD.tone} />
            <CompRow label="Número de produtos" atual={ctx.currentEntries.length} proposta={ctx.currentEntries.length + ctx.itemEntries.length} delta={`+${ctx.itemEntries.length}`} tone="flat" />
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Principais impactos da mudança</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {impacts.map((im) => (
            <div key={im.title} className="flex items-start gap-3 border border-neutral-100 rounded-large px-4 py-3">
              <span className="w-8 h-8 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center shrink-0"><Icon name={im.icon} size={15} /></span>
              <div>
                <div className="text-sm font-medium text-neutral-900">{im.title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{im.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => onGenerateProposal(simulationId)} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
          <Icon name="fileText" size={15} /> Gerar proposta para o cliente
        </button>
      </div>
    </div>
  );
}

// ---------- Shell do dashboard ----------
function SimulatorDashboard({ simulation, client, products, ctx, onBack, onGenerateProposal }) {
  const A = window.PortalAnalytics;
  const [tab, setTab] = React.useState('resumo');

  // Análise calculada uma vez e compartilhada entre as abas.
  const analysis = React.useMemo(() => {
    const cm = ctx.currentMetrics;
    const pm = ctx.proposedMetrics;
    const seed = `${simulation.id}-${ctx.proposedAlloc.byClass.map((c) => c.class).join(',')}-${Math.round(ctx.proposedAlloc.total)}`;
    const hist = A.historicalComparison(cm, pm, seed, 60);
    return {
      hist,
      ddCurrent: A.drawdownSeries(hist.current),
      ddProposed: A.drawdownSeries(hist.proposed),
      corr: A.correlationMatrix(ctx.proposedAlloc.byClass.map((c) => c.class)),
      scatterPoints: A.riskReturnPoints(ctx.proposedAlloc.byClass),
    };
    // eslint-disable-next-line
  }, [simulation.id, JSON.stringify(ctx.proposedAlloc.byClass), ctx.proposedAlloc.total]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Análise da proposta</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Use esta visão durante a reunião com o cliente.</p>
        </div>
        <button onClick={() => onGenerateProposal(simulation.id)} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
          <Icon name="fileText" size={15} /> Gerar proposta
        </button>
      </div>

      <div className="border-b border-neutral-100 flex gap-1 overflow-x-auto">
        {DASH_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2 whitespace-nowrap', tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumo' && <ResumoTab ctx={ctx} client={client} simulation={simulation} analysis={analysis} />}
      {tab === 'performance' && <PerformanceTab analysis={analysis} />}
      {tab === 'risco' && <RiscoLiquidezTab ctx={ctx} client={client} analysis={analysis} />}
      {tab === 'tecnica' && <AnaliseTecnicaTab ctx={ctx} analysis={analysis} />}
      {tab === 'comparacao' && <ComparacaoTab ctx={ctx} client={client} analysis={analysis} onGenerateProposal={onGenerateProposal} simulationId={simulation.id} />}

      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5">
          <Icon name="arrowLeft" size={14} /> Voltar para revisão
        </button>
      </div>
    </div>
  );
}

window.SimulatorDashboard = SimulatorDashboard;

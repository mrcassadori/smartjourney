// Jornada de Planejamento Financeiro — aba "Planejamento" dentro do cliente.
// Fase 1: Visão geral do plano, estado vazio, Resultado e Relatório, além da
// ponte para o simulador. O sub-fluxo vive dentro do shell do cliente (header +
// tabs preservados). Wizard (Fase 2) e Cenários/Comparação/Recomendações
// (Fase 3) entram aqui progressivamente. Tudo mockado.

const PLAN_STATUS_META = {
  rascunho: { label: 'Rascunho', className: 'bg-neutral-100 text-neutral-600' },
  em_construcao: { label: 'Em construção', className: 'bg-warning-light text-warning-dark' },
  concluido: { label: 'Concluído', className: 'bg-success-light text-success-dark' },
  compartilhado: { label: 'Compartilhado', className: 'bg-info-light text-info-dark' },
};

function planCompact(v) {
  if (Math.abs(v) >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')}M`;
  if (Math.abs(v) >= 1e3) return `R$ ${Math.round(v / 1e3)} mil`;
  return `R$ ${v}`;
}

// Cinco cards de destaque (mesmo padrão da Visão geral do cliente).
function PlanHighlightCards({ cards }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-neutral-100 rounded-large px-4 py-3.5 flex flex-col">
          <div className="text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">{c.label}</div>
          {c.badge ? (
            <div className="mt-2"><StatusPill label={c.badge.label} className={c.badge.className} /></div>
          ) : (
            <div className={window.PortalLib.classNames('text-xl font-bold mt-1.5', c.color || 'text-neutral-900')}>{c.value}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function PlanAttention({ items, title }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-800 mb-2">{title || 'Requer atenção'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((it, i) => (
          <div key={i} className="bg-white border border-brand/40 rounded-large p-4">
            <div className="text-sm font-semibold text-neutral-900">{it.title}</div>
            <div className="text-xs text-neutral-500 mt-1">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanInsights({ items }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-800 mb-2">Insights e próximas ações</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((c, i) => (
          <div key={i} className="bg-white border border-neutral-100 rounded-large p-4 flex flex-col">
            <div className="flex items-start gap-2.5 flex-1">
              <span className="w-9 h-9 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center shrink-0"><Icon name={c.icon} size={16} /></span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900">{c.title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{c.desc}</div>
              </div>
            </div>
            <button onClick={c.onClick} className="mt-3 self-start text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">Ver detalhes <Icon name="chevronRight" size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Gráfico de linhas de evolução patrimonial (base/conservador/otimista ou 1 linha).
function PlanWealthChart({ series, lines, height }) {
  const datasets = lines.map((l) => ({
    label: l.label,
    data: series[l.key],
    borderColor: l.color,
    backgroundColor: l.color,
    borderWidth: l.width || 2,
    pointRadius: 0,
    tension: 0.35,
    fill: false,
  }));
  const options = {
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${planCompact(c.raw)}` } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9E9E9E', font: { size: 10 }, maxTicksLimit: 8 } },
      y: { grid: { color: '#F2F2F2' }, ticks: { color: '#9E9E9E', font: { size: 10 }, callback: (v) => planCompact(v) } },
    },
  };
  return <window.ChartCanvas type="line" data={{ labels: series.labels, datasets }} options={options} height={height || 220} />;
}

function PlanChartLegend({ lines }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {lines.map((l) => (
        <span key={l.key} className="flex items-center gap-1.5 text-neutral-600"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} /> {l.label}</span>
      ))}
    </div>
  );
}

// ---------------- Tela 01 — Visão geral do planejamento ----------------
function PlanOverview({ client, plan, onEdit, onOpenResult, onSimulate }) {
  const { formatCurrency } = window.PortalLib;
  const scenarioAtual = plan.scenarios.find((s) => s.id === plan.selectedScenarioId) || plan.scenarios[0] || {};
  const financialTotal = plan.wealth.financialInter + plan.wealth.financialExternal;
  const foraPct = financialTotal ? Math.round((plan.wealth.financialExternal / financialTotal) * 100) : 0;

  const cards = [
    { label: 'Patrimônio total planejado', value: formatCurrency(client.totalWealth), color: 'text-neutral-900' },
    { label: 'Patrimônio financeiro', value: formatCurrency(plan.result.currentWealth), color: 'text-info-dark' },
    { label: 'Aporte mensal atual', value: formatCurrency(scenarioAtual.monthlyContribution), color: 'text-neutral-900' },
    { label: 'Meta de renda futura', value: `${formatCurrency(plan.objectives.desiredIncome)}/mês`, color: 'text-brand-dark' },
    { label: 'Status do plano', badge: PLAN_STATUS_META[plan.status] },
  ];

  const lines = [
    { key: 'base', label: 'Cenário base', color: '#1E7FE6', width: 2.5 },
    { key: 'conservador', label: 'Conservador', color: '#9E9E9E' },
    { key: 'otimista', label: 'Otimista', color: '#00A868' },
  ];
  const series = window.PortalAnalytics.wealthSeries(`${plan.id}|proj`, plan.result.currentWealth, 2024, 31, { base: 0.075, conservador: 0.052, otimista: 0.098 });

  const attention = [
    { title: `Gap de ${planCompact(plan.result.gap)} para a meta`, desc: 'No ritmo atual de aportes, a meta sofrerá descompasso até a data-alvo.' },
    { title: `${foraPct}% do patrimônio fora do Inter`, desc: 'Existem ativos relevantes custodiados em outras instituições financeiras.' },
    { title: 'Premissas não validadas', desc: 'Necessário revisar inflação e retorno real considerados no plano.' },
  ];
  const insights = [
    { icon: 'fileText', title: 'Revisar despesas futuras', desc: 'Ajustar projeções de gastos educacionais com dependentes.', onClick: onOpenResult },
    { icon: 'trendingUp', title: 'Simular aposentadoria aos 63 anos', desc: 'Aumenta a probabilidade de sucesso do plano para 94%.', onClick: onOpenResult },
    { icon: 'target', title: 'Montar carteira aderente ao plano', desc: 'Propor realocação baseada no suitability de longo prazo.', onClick: onSimulate },
  ];

  const resumo = [
    ['Objetivo principal', plan.objectives.primary],
    ['Idade alvo', `${plan.objectives.targetAge} anos`],
    ['Renda desejada', `${formatCurrency(plan.objectives.desiredIncome)}/mês`],
    ['Patrimônio necessário', formatCurrency(plan.result.requiredWealth)],
    ['Probabilidade de sucesso', `${plan.result.successProbability}%`],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-800">{plan.name}</div>
          <div className="text-xs text-neutral-400">Atualizado {window.PortalLib.formatDateTime(plan.updatedAt)}</div>
        </div>
        <button onClick={onEdit} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="fileText" size={14} /> Editar planejamento</button>
      </div>

      <PlanHighlightCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-large p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-800">Evolução projetada do patrimônio</h3>
            <PlanChartLegend lines={lines} />
          </div>
          <PlanWealthChart series={series} lines={lines} height={240} />
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Resumo do plano</h3>
          <div className="divide-y divide-neutral-50">
            {resumo.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-neutral-500">{k}</span>
                <span className={window.PortalLib.classNames('font-semibold text-right', k === 'Probabilidade de sucesso' ? 'text-brand-dark' : 'text-neutral-900')}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PlanAttention items={attention} />
      <PlanInsights items={insights} />
    </div>
  );
}

// ---------------- Estado vazio (sem dados suficientes) ----------------
function PlanEmpty({ onStart, onImport }) {
  const checklist = ['Objetivos', 'Renda e despesas', 'Patrimônio', 'Premissas'];
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-10 flex flex-col items-center text-center">
      <span className="w-16 h-16 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center mb-4"><Icon name="target" size={28} /></span>
      <h2 className="text-lg font-semibold text-neutral-900">Ainda faltam informações para gerar o plano</h2>
      <p className="text-sm text-neutral-500 mt-1.5 max-w-md">Cadastre objetivos, renda, despesas, patrimônio e premissas para visualizar cenários e recomendações.</p>
      <div className="flex items-center gap-2 mt-5">
        <button onClick={onStart} className="text-sm px-5 py-2.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="target" size={15} /> Iniciar planejamento</button>
        <button onClick={onImport} className="text-sm px-5 py-2.5 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"><Icon name="download" size={14} /> Importar informações do cliente</button>
      </div>
      <div className="mt-8 w-full max-w-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">O que falta</div>
        <div className="space-y-1.5">
          {checklist.map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 rounded-large px-3 py-2">
              <span className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" /> {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Tela 08 — Resultado do plano ----------------
function PlanResult({ client, plan, onBack, onSaveDraft, onContinue, onExport }) {
  const { formatCurrency } = window.PortalLib;
  const cards = [
    { label: 'Patrimônio atual', value: formatCurrency(plan.result.currentWealth), color: 'text-neutral-900' },
    { label: 'Patrimônio necessário', value: formatCurrency(plan.result.requiredWealth), color: 'text-info-dark' },
    { label: 'Aporte necessário', value: `${formatCurrency(plan.result.requiredContribution)}/mês`, color: 'text-neutral-900' },
    { label: 'Meta de renda', value: `${formatCurrency(plan.result.targetIncome)}/mês`, color: 'text-brand-dark' },
    { label: 'Status do plano', badge: { label: `Gap de ${planCompact(plan.result.gap)}`, className: 'bg-brand-lightest text-brand-dark' } },
  ];
  const lines = [{ key: 'plan', label: 'Patrimônio projetado', color: '#1E7FE6', width: 2.5 }];
  const series = window.PortalAnalytics.wealthSeries(`${plan.id}|result`, plan.result.currentWealth, 2024, 36, { plan: 0.052 });
  const idxFor = (year) => series.labels.indexOf(year);
  const milestones = [2024, 2030, 2040, plan.objectives.targetAge ? 2050 : 2050].map((y) => ({ year: y, value: series.plan[idxFor(y)] }));

  const leitura = [
    `O plano atual não atinge totalmente a meta estabelecida para os ${plan.objectives.targetAge} anos.`,
    `O gap estimado é de ${planCompact(plan.result.gap)} na data-alvo sob premissas de juros neutros.`,
    'Há margem para ajuste fino via aumento marginal dos aportes, dilação de prazo ou realocação estratégica.',
  ];
  const attention = [
    { title: 'Aporte atual abaixo do necessário', desc: `O cliente aporta ${formatCurrency((plan.scenarios[0] || {}).monthlyContribution)}/mês, ante os ${formatCurrency(plan.result.requiredContribution)} necessários.` },
    { title: 'Dependência de premissas de retorno', desc: `O retorno real precisa se manter em ${plan.assumptions.realReturn}% a.a. para atingir a meta.` },
    { title: 'Concentração fora do Inter', desc: 'Parte relevante dos ativos está fora da instituição, limitando o rebalanceamento automático.' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2"><Icon name="trendingUp" size={18} className="text-brand" /> Resultado do planejamento</h2>
        <button onClick={onExport} className="text-sm px-4 py-2 rounded-pill border border-brand text-brand-dark hover:bg-brand-lightest flex items-center gap-1.5"><Icon name="download" size={14} /> Exportar PDF</button>
      </div>

      <PlanHighlightCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-large p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Evolução projetada do patrimônio</h3>
          <PlanWealthChart series={series} lines={lines} height={240} />
          <div className="flex flex-wrap gap-2 mt-3">
            {milestones.map((m) => (
              <span key={m.year} className="text-xs px-2.5 py-1 rounded-pill bg-neutral-800 text-white">{m.year}{m.year === 2050 ? ' (Alvo)' : ''} · {planCompact(m.value)}</span>
            ))}
          </div>
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Resumo da leitura</h3>
          <ul className="space-y-2.5 text-sm text-neutral-600">
            {leitura.map((t, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" /> {t}</li>)}
          </ul>
        </div>
      </div>

      <PlanAttention items={attention} />

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800">Ajustar cenário</button>
        <div className="flex items-center gap-2">
          <button onClick={onSaveDraft} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">Salvar rascunho</button>
          <button onClick={onContinue} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Continuar</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tela 12 — Relatório e compartilhamento ----------------
const REPORT_PAGES = ['Capa', 'Resumo do objetivo', 'Situação atual', 'Patrimônio e fluxo financeiro', 'Premissas', 'Cenários', 'Recomendação final', 'Próximos passos'];

function PlanReport({ client, plan, onBack, onSend, onSimulate, onNewPlan }) {
  const [cfg, setCfg] = React.useState({ name: `Relatório — ${plan.name}`, version: 'v1', type: 'Completo', recipient: client.email, message: 'Olá, segue o planejamento financeiro consolidado para sua avaliação.' });
  const [toggles, setToggles] = React.useState({ graficos: true, cenarios: true, patrimonio: true, proximos: true });
  const [sent, setSent] = React.useState(false);

  function doSend() { onSend(plan.id); setSent(true); }

  if (sent) {
    return (
      <div className="bg-white border border-neutral-100 rounded-large p-10 flex flex-col items-center text-center">
        <span className="w-16 h-16 rounded-full bg-success-light text-success-dark flex items-center justify-center mb-4"><Icon name="check" size={28} /></span>
        <h2 className="text-lg font-semibold text-neutral-900">Relatório compartilhado com sucesso</h2>
        <p className="text-sm text-neutral-500 mt-1.5 max-w-md">O relatório “{cfg.name}” foi enviado para {cfg.recipient} (ação simulada).</p>
        <div className="flex items-center gap-2 mt-5">
          <button onClick={onBack} className="text-sm px-5 py-2.5 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Voltar ao cliente</button>
          <button onClick={onNewPlan} className="text-sm px-5 py-2.5 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Criar novo planejamento</button>
          <button onClick={onSimulate} className="text-sm px-5 py-2.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="target" size={15} /> Montar carteira no simulador</button>
        </div>
      </div>
    );
  }

  const toggleRow = (key, label) => (
    <button onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))} className="w-full flex items-center justify-between py-2 text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className={window.PortalLib.classNames('w-9 h-5 rounded-full p-0.5 transition-colors', toggles[key] ? 'bg-brand' : 'bg-neutral-200')}>
        <span className={window.PortalLib.classNames('block w-4 h-4 rounded-full bg-white transition-transform', toggles[key] ? 'translate-x-4' : '')} />
      </span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Preview */}
      <div className="lg:col-span-3 bg-white border border-neutral-100 rounded-large p-4">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Preview do relatório</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REPORT_PAGES.map((p, i) => (
            <div key={p} className="border border-neutral-100 rounded-large overflow-hidden">
              <div className="aspect-[3/4] bg-neutral-50 flex items-center justify-center text-neutral-300"><Icon name="file" size={22} /></div>
              <div className="px-2 py-1.5 text-[11px] text-neutral-600 truncate">{i + 1}. {p}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white border border-neutral-100 rounded-large p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">Configuração e compartilhamento</h3>
          {[['name', 'Nome do relatório'], ['recipient', 'Destinatário']].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-neutral-500">{label}</label>
              <input value={cfg[k]} onChange={(e) => setCfg((c) => ({ ...c, [k]: e.target.value }))} className="w-full mt-1 text-sm border border-neutral-200 rounded-medium px-3 py-2" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-500">Versão</label>
              <input value={cfg.version} onChange={(e) => setCfg((c) => ({ ...c, version: e.target.value }))} className="w-full mt-1 text-sm border border-neutral-200 rounded-medium px-3 py-2" />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Tipo</label>
              <select value={cfg.type} onChange={(e) => setCfg((c) => ({ ...c, type: e.target.value }))} className="w-full mt-1 text-sm border border-neutral-200 rounded-medium px-3 py-2">
                <option>Completo</option><option>Executivo</option><option>Resumido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-neutral-500">Mensagem</label>
            <textarea value={cfg.message} onChange={(e) => setCfg((c) => ({ ...c, message: e.target.value }))} rows={3} className="w-full mt-1 text-sm border border-neutral-200 rounded-medium px-3 py-2" />
          </div>
          <div className="pt-2 border-t border-neutral-50">
            {toggleRow('graficos', 'Incluir gráficos')}
            {toggleRow('cenarios', 'Incluir cenários comparados')}
            {toggleRow('patrimonio', 'Incluir detalhes patrimoniais')}
            {toggleRow('proximos', 'Incluir próximos passos')}
          </div>
        </div>

        <div className="bg-white border border-neutral-100 rounded-large p-4 space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => window.PortalLib.copyToClipboard(`https://portal.inter/plan/${plan.id}`)} className="flex-1 text-sm px-3 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center gap-1.5"><Icon name="copy" size={14} /> Copiar link</button>
            <button onClick={() => window.PortalLib.download(`${client.id}-plano.txt`, `Relatório de planejamento simulado — ${cfg.name}`, 'text/plain')} className="flex-1 text-sm px-3 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center gap-1.5"><Icon name="download" size={14} /> Baixar PDF</button>
          </div>
          <button onClick={doSend} className="w-full text-sm px-4 py-2.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center justify-center gap-1.5"><Icon name="file" size={15} /> Enviar relatório</button>
          <button onClick={onBack} className="w-full text-sm px-4 py-2 rounded-pill text-neutral-500 hover:text-neutral-800">Voltar</button>
        </div>
      </div>
    </div>
  );
}

// ================= Wizard de construção (Fase 2) =================
const WIZARD_STEPS = [
  { key: 'contexto', label: 'Contexto' },
  { key: 'perfil', label: 'Perfil familiar' },
  { key: 'objetivos', label: 'Objetivos' },
  { key: 'renda', label: 'Renda e despesas' },
  { key: 'patrimonio', label: 'Patrimônio' },
  { key: 'premissas', label: 'Premissas' },
  { key: 'cenarios', label: 'Cenários' },
];
const TIPO_PLANO = [['aposentadoria', 'Aposentadoria'], ['independencia', 'Independência financeira'], ['preservacao', 'Preservação patrimonial'], ['sucessorio', 'Planejamento sucessório'], ['multi', 'Multiobjetivo']];
const OBJETIVOS = [['aposentadoria', 'Aposentadoria'], ['independencia', 'Independência financeira'], ['educacao', 'Educação dos filhos'], ['imovel', 'Aquisição de imóvel'], ['preservacao', 'Preservação patrimonial'], ['outro', 'Outro']];
const ESTRATEGIAS = [['consumir', 'Consumir patrimônio'], ['preservar', 'Preservar patrimônio'], ['retirar_parcial', 'Retirar parcialmente'], ['renda_recorrente', 'Gerar renda recorrente']];

function blankDraft() {
  return {
    name: '', type: 'aposentadoria', horizonYears: 15, notes: '',
    context: { age: '', maritalStatus: '', profession: '', lifePhase: '', dependents: [], notes: '' },
    objectives: { primary: 'Aposentadoria', targetAge: 60, desiredIncome: 0, lifeExpectancy: 95, strategy: 'preservar', selected: ['aposentadoria'] },
    cashflow: { incomes: [], expenses: [] },
    wealth: { otherAssets: [], investments: [] },
    assumptions: { inflation: 4.5, nominalReturn: 9.5, realReturn: 4.8, cdi: 11.2, expenseGrowth: 4.5, incomeGrowth: 5.0, validated: {} },
  };
}
function draftFromPlan(plan) {
  if (!plan) return blankDraft();
  const b = blankDraft();
  return {
    name: plan.name || b.name, type: plan.type || b.type, horizonYears: plan.horizonYears || b.horizonYears, notes: plan.notes || '',
    context: Object.assign({}, b.context, plan.context, { dependents: (plan.context && plan.context.dependents) || [] }),
    objectives: Object.assign({}, b.objectives, plan.objectives),
    cashflow: { incomes: (plan.cashflow && plan.cashflow.incomes) || [], expenses: (plan.cashflow && plan.cashflow.expenses) || [] },
    wealth: { otherAssets: (plan.wealth && plan.wealth.otherAssets) || [], investments: (plan.wealth && plan.wealth.investments) || [] },
    assumptions: Object.assign({}, b.assumptions, plan.assumptions),
  };
}

function PlanStepper({ current }) {
  return (
    <div className="bg-white rounded-large border border-neutral-100 px-4 py-3 flex items-center gap-1 overflow-x-auto">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.key}>
            {i > 0 && <Icon name="chevronRight" size={14} className="text-neutral-300 shrink-0" />}
            <div className="flex items-center gap-2 shrink-0 px-1">
              <span className={window.PortalLib.classNames('w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold', done ? 'bg-success-light text-success-dark' : active ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-400')}>
                {done ? <Icon name="check" size={13} /> : i + 1}
              </span>
              <span className={window.PortalLib.classNames('text-sm whitespace-nowrap', active ? 'font-semibold text-neutral-900' : done ? 'text-neutral-600' : 'text-neutral-400')}>{s.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Tabela editável genérica (linhas add/remove com inputs). Colunas `type:
// 'currency'` mostram o valor formatado (R$) fora de foco e o número cru
// editável em foco; `type: 'number'` fica cru sempre (ex.: Idade).
const PLAN_TABLE_COL_MIN_WIDTH = { currency: 120, number: 64 };
function PlanEditableTable({ columns, rows, onChange, addLabel }) {
  const { formatCurrency } = window.PortalLib;
  const [focusedCell, setFocusedCell] = React.useState(null);
  function setCell(i, key, value) { onChange(rows.map((r, ri) => (ri === i ? { ...r, [key]: value } : r))); }
  function addRow() { const blank = {}; columns.forEach((c) => (blank[c.key] = (c.type === 'number' || c.type === 'currency') ? 0 : '')); onChange([...rows, blank]); }
  function removeRow(i) { onChange(rows.filter((_, ri) => ri !== i)); }
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((c) => <th key={c.key} style={{ minWidth: PLAN_TABLE_COL_MIN_WIDTH[c.type] || 130 }} className="text-left text-[10px] font-semibold uppercase tracking-wide text-neutral-500 px-3 py-2">{c.label}</th>)}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-3 py-3 text-xs text-neutral-400">Nenhum registro. Use “{addLabel}”.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-neutral-50 last:border-0">
                {columns.map((c) => {
                  const cellKey = i + ':' + c.key;
                  const isCurrency = c.type === 'currency';
                  const isNumeric = isCurrency || c.type === 'number';
                  const showFormatted = isCurrency && focusedCell !== cellKey;
                  return (
                    <td key={c.key} className="px-2 py-1.5">
                      <input
                        value={showFormatted ? formatCurrency(r[c.key]) : r[c.key]}
                        onFocus={() => isCurrency && setFocusedCell(cellKey)}
                        onBlur={() => isCurrency && setFocusedCell((k) => (k === cellKey ? null : k))}
                        onChange={(e) => setCell(i, c.key, isNumeric ? Number(e.target.value) : e.target.value)}
                        type={isNumeric && !showFormatted ? 'number' : 'text'}
                        title={!isNumeric ? String(r[c.key]) : undefined}
                        className="w-full text-sm border border-transparent hover:border-neutral-200 focus:border-brand rounded-medium px-2 py-1 focus:outline-none"
                      />
                    </td>
                  );
                })}
                <td className="px-1"><button onClick={() => removeRow(i)} aria-label="Remover" className="text-neutral-300 hover:text-alert-dark p-1"><Icon name="x" size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="mt-2 text-sm text-brand-dark hover:underline flex items-center gap-1"><span className="text-base leading-none">+</span> {addLabel}</button>
    </div>
  );
}

function PlanMiniStackBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="flex h-2.5 rounded-pill overflow-hidden mb-2">
        {segments.map((s) => <div key={s.label} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />)}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {segments.map((s) => <span key={s.label} className="flex items-center gap-1.5 text-neutral-600"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /> {s.label} ({Math.round((s.value / total) * 100)}%)</span>)}
      </div>
    </div>
  );
}

function PlanSideCard({ title, children }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4">
      <h3 className="text-sm font-semibold text-neutral-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function PlanField({ label, children }) {
  return (
    <div>
      <label className="text-xs text-neutral-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
const inputCls = 'w-full text-sm border border-neutral-200 rounded-medium px-3 py-2 focus:outline-none focus:border-brand';

// Combobox compacto "Associar a um cliente" — só usado na entrada tool-first
// (sem cliente fixo, GOVERNANCA.md "Planejamento → Cliente"). Busca por nome/
// CPF reaproveita o padrão de StepCliente (SimulatorJourney.jsx), num campo
// embutido em vez de tela própria, como o Figma desenha.
function PlanClientPicker({ clients, selectedClientId, onSelectClient }) {
  const { maskDocument, onlyDigits } = window.PortalLib;
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const selected = clients.find((c) => c.id === selectedClientId);
  const query = q.trim().toLowerCase();
  const queryDigits = onlyDigits(query);
  const matches = (query
    ? clients.filter((c) => c.name.toLowerCase().indexOf(query) !== -1 || (queryDigits && onlyDigits(c.cpfCnpj).indexOf(queryDigits) !== -1))
    : clients
  ).slice(0, 6);

  if (selected && !open) {
    return (
      <PlanField label="Associar a um cliente">
        <div className="flex items-center justify-between border border-neutral-200 rounded-medium px-3 py-2">
          <span className="text-sm text-neutral-900">{selected.name}</span>
          <button onClick={() => { setOpen(true); setQ(''); }} className="text-xs text-brand-dark hover:underline">Trocar</button>
        </div>
      </PlanField>
    );
  }
  return (
    <PlanField label="Associar a um cliente">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Buscar cliente por nome ou CPF"
          className={inputCls}
        />
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-medium shadow-lg max-h-56 overflow-y-auto">
            {matches.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-400">Nenhum cliente encontrado.</div>
            ) : matches.map((c) => (
              c.hasPlan ? (
                <div key={c.id} title="Este cliente já tem um planejamento — edite pela ficha dele." className="w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 cursor-not-allowed">
                  <span className="text-neutral-400 truncate">{c.name}</span>
                  <span className="text-xs text-neutral-300 shrink-0">Já possui plano</span>
                </div>
              ) : (
                <button key={c.id} onClick={() => { onSelectClient(c.id); setOpen(false); setQ(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between gap-2">
                  <span className="text-neutral-800 truncate">{c.name}</span>
                  <span className="text-xs text-neutral-400 shrink-0">{maskDocument(c.cpfCnpj)}</span>
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </PlanField>
  );
}

function PlanStepNovo({ draft, set, clients, selectedClientId, onSelectClient }) {
  const built = ['Definição do objetivo financeiro de longo prazo', 'Projeção de fluxo de renda e despesas futuras', 'Geração e testes de múltiplos cenários', 'Mapeamento do patrimônio e distribuição de ativos', 'Configuração de premissas macroeconômicas', 'Construção de recomendação final personalizada'];
  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-100 rounded-large p-5 space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">Iniciar planejamento financeiro</h2>
        {clients && <PlanClientPicker clients={clients} selectedClientId={selectedClientId} onSelectClient={onSelectClient} />}
        <PlanField label="Nome do planejamento"><input value={draft.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} placeholder="Ex.: Planejamento Mariana 2026 — Versão Base" /></PlanField>
        <div>
          <label className="text-xs text-neutral-500">Tipo de plano</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-1.5">
            {TIPO_PLANO.map(([v, label]) => (
              <button key={v} onClick={() => set({ type: v })} className={window.PortalLib.classNames('text-sm px-3 py-2.5 rounded-large border text-center', draft.type === v ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}>{label}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PlanField label="Horizonte principal">
            <select value={draft.horizonYears} onChange={(e) => set({ horizonYears: Number(e.target.value) })} className={inputCls}>
              {[10, 15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} anos (Alvo: {(draft.context.age || 45) + y} anos de idade)</option>)}
            </select>
          </PlanField>
        </div>
        <PlanField label="Observações iniciais"><textarea value={draft.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} className={inputCls} /></PlanField>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">O que será construído neste planejamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
          {built.map((t) => <div key={t} className="flex items-center gap-2 text-sm text-neutral-600"><Icon name="check" size={14} className="text-success-dark shrink-0" /> {t}</div>)}
        </div>
      </div>
    </div>
  );
}

function PlanStepPerfilFamiliar({ draft, set }) {
  const deps = draft.context.dependents;
  const familyImpact = deps.length ? [
    { title: `${deps.length} dependente${deps.length > 1 ? 's' : ''} financeiro${deps.length > 1 ? 's' : ''}`, desc: 'Isso acarreta custos constantes nos próximos anos.' },
    { title: `Maior pressão de caixa pelos próximos ${Math.max(...deps.map((d) => Math.max(0, 24 - (Number(d.age) || 24))))} anos`, desc: 'Necessidade de concentrar aportes relevantes no período corrente.' },
    { title: 'Necessidade de proteger renda futura', desc: 'Recomenda-se prever seguros de vida e previdência privada robustos.' },
  ] : [];
  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-100 rounded-large p-5 space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">Contexto pessoal e familiar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <PlanField label="Idade atual"><input type="number" value={draft.context.age} onChange={(e) => set({ context: { ...draft.context, age: Number(e.target.value) } })} className={inputCls} /></PlanField>
          <PlanField label="Estado civil"><input value={draft.context.maritalStatus} onChange={(e) => set({ context: { ...draft.context, maritalStatus: e.target.value } })} className={inputCls} /></PlanField>
          <PlanField label="Profissão"><input value={draft.context.profession} onChange={(e) => set({ context: { ...draft.context, profession: e.target.value } })} className={inputCls} /></PlanField>
          <PlanField label="Fase de vida"><input value={draft.context.lifePhase} onChange={(e) => set({ context: { ...draft.context, lifePhase: e.target.value } })} className={inputCls} /></PlanField>
        </div>
        <div>
          <div className="text-sm font-medium text-neutral-800 mb-1.5">Dependentes</div>
          <PlanEditableTable
            columns={[{ key: 'name', label: 'Nome' }, { key: 'relation', label: 'Relação' }, { key: 'age', label: 'Idade', type: 'number' }, { key: 'dependency', label: 'Dependência financeira' }]}
            rows={draft.context.dependents}
            onChange={(rows) => set({ context: { ...draft.context, dependents: rows } })}
            addLabel="Adicionar dependente"
          />
        </div>
        <PlanField label="Contexto adicional (observações do consultor)"><textarea value={draft.context.notes} onChange={(e) => set({ context: { ...draft.context, notes: e.target.value } })} rows={2} className={inputCls} /></PlanField>
      </div>

      <PlanAttention items={familyImpact} title="Impacto familiar no plano" />
    </div>
  );
}

function PlanStepObjetivos({ draft, set }) {
  const { formatCurrency } = window.PortalLib;
  const toggle = (v) => set({ objectives: { ...draft.objectives, selected: draft.objectives.selected.indexOf(v) === -1 ? [...draft.objectives.selected, v] : draft.objectives.selected.filter((x) => x !== v) } });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-neutral-100 rounded-large p-5 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Definição de objetivos financeiros</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {OBJETIVOS.map(([v, label]) => (
              <button key={v} onClick={() => toggle(v)} className={window.PortalLib.classNames('text-sm px-3 py-3 rounded-large border text-center', draft.objectives.selected.indexOf(v) !== -1 ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}>{label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PlanField label="Idade desejada para aposentadoria"><input type="number" value={draft.objectives.targetAge} onChange={(e) => set({ objectives: { ...draft.objectives, targetAge: Number(e.target.value) } })} className={inputCls} /></PlanField>
            <PlanField label="Renda mensal desejada"><input type="number" value={draft.objectives.desiredIncome} onChange={(e) => set({ objectives: { ...draft.objectives, desiredIncome: Number(e.target.value) } })} className={inputCls} /></PlanField>
            <PlanField label="Expectativa de vida"><input type="number" value={draft.objectives.lifeExpectancy} onChange={(e) => set({ objectives: { ...draft.objectives, lifeExpectancy: Number(e.target.value) } })} className={inputCls} /></PlanField>
            <PlanField label="Estratégia de uso do patrimônio">
              <select value={draft.objectives.strategy} onChange={(e) => set({ objectives: { ...draft.objectives, strategy: e.target.value } })} className={inputCls}>
                {ESTRATEGIAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </PlanField>
          </div>
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Como o portal usará essas informações</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Calcular o patrimônio necessário', 'Projetar aportes e crescimento', 'Testar cenários alternativos'].map((t, i) => (
              <div key={t} className="flex items-start gap-2 text-sm text-neutral-600"><span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</span> {t}</div>
            ))}
          </div>
        </div>
      </div>
      <PlanSideCard title="Resumo do objetivo">
        <p className="text-sm text-neutral-600">{draft.name ? draft.name.split(' ')[1] || 'O cliente' : 'O cliente'} deseja atingir renda mensal de <b>{formatCurrency(draft.objectives.desiredIncome)}</b> a partir dos <b>{draft.objectives.targetAge} anos</b>, {draft.objectives.strategy === 'preservar' ? 'preservando parte relevante do patrimônio' : 'com uso planejado do patrimônio'}.</p>
      </PlanSideCard>
    </div>
  );
}

function PlanStepRenda({ draft, set }) {
  const { formatCurrency } = window.PortalLib;
  const income = draft.cashflow.incomes.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const expense = draft.cashflow.expenses.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const capacity = income - expense;
  const cols = [{ key: 'desc', label: 'Descrição' }, { key: 'value', label: 'Valor', type: 'currency' }, { key: 'start', label: 'Início' }, { key: 'end', label: 'Término' }, { key: 'recurrence', label: 'Recorrência' }];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Rendas</h3>
          <PlanEditableTable columns={cols} rows={draft.cashflow.incomes} onChange={(rows) => set({ cashflow: { ...draft.cashflow, incomes: rows } })} addLabel="Adicionar renda" />
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Despesas</h3>
          <PlanEditableTable columns={cols} rows={draft.cashflow.expenses} onChange={(rows) => set({ cashflow: { ...draft.cashflow, expenses: rows } })} addLabel="Adicionar despesa" />
        </div>
      </div>
      <PlanHighlightCards cards={[
        { label: 'Receita mensal total', value: formatCurrency(income), color: 'text-success-dark' },
        { label: 'Despesa mensal total', value: formatCurrency(expense), color: 'text-alert-dark' },
        { label: 'Capacidade de aporte atual', value: formatCurrency(Math.max(0, capacity)), color: 'text-brand-dark' },
        { label: 'Capacidade de aporte futura', value: formatCurrency(Math.max(0, capacity + 4200)), color: 'text-neutral-900' },
        { label: 'Comprometimento', value: `${income ? Math.round((expense / income) * 100) : 0}%`, color: 'text-neutral-900' },
      ]} />
      <PlanAttention items={[
        { title: 'Financiamento termina em breve', desc: 'O fim do financiamento aumenta a capacidade de aporte futura.' },
        { title: `${income ? Math.round((capacity / income) * 100) : 0}% da renda não está comprometida`, desc: 'Há espaço para elevar o aporte mensal.' },
        { title: 'Despesas educacionais impactam o plano', desc: 'Gastos com escola pressionam o caixa até 2035.' },
      ]} />
    </div>
  );
}

function PlanStepPatrimonio({ draft, set }) {
  const { formatCurrency } = window.PortalLib;
  const inv = draft.wealth.investments;
  const inter = inv.filter((x) => (x.inst || '').toLowerCase() === 'inter').reduce((s, x) => s + (Number(x.value) || 0), 0);
  const fora = inv.reduce((s, x) => s + (Number(x.value) || 0), 0) - inter;
  const bens = draft.wealth.otherAssets.reduce((s, x) => s + (Number(x.value) || 0), 0);
  const total = inter + fora + bens;
  return (
    <div className="space-y-4">
      <PlanHighlightCards cards={[
        { label: 'Financeiro no Inter', value: formatCurrency(inter), color: 'text-brand-dark' },
        { label: 'Financeiro fora do Inter', value: formatCurrency(fora), color: 'text-info-dark' },
        { label: 'Outros bens', value: formatCurrency(bens), color: 'text-neutral-900' },
        { label: 'Patrimônio total consolidado', value: formatCurrency(total), color: 'text-neutral-900' },
        { label: 'Fora do Inter', value: `${(inter + fora) ? Math.round((fora / (inter + fora)) * 100) : 0}%`, color: 'text-neutral-900' },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-neutral-100 rounded-large p-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Investimentos financeiros</h3>
            <PlanEditableTable columns={[{ key: 'inst', label: 'Instituição' }, { key: 'category', label: 'Categoria' }, { key: 'value', label: 'Valor', type: 'currency' }, { key: 'liquidity', label: 'Liquidez' }, { key: 'notes', label: 'Observações' }]} rows={inv} onChange={(rows) => set({ wealth: { ...draft.wealth, investments: rows } })} addLabel="Adicionar investimento" />
          </div>
          <div className="bg-white border border-neutral-100 rounded-large p-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Outros bens</h3>
            <PlanEditableTable columns={[{ key: 'type', label: 'Tipo' }, { key: 'desc', label: 'Descrição' }, { key: 'value', label: 'Valor estimado', type: 'currency' }]} rows={draft.wealth.otherAssets} onChange={(rows) => set({ wealth: { ...draft.wealth, otherAssets: rows } })} addLabel="Adicionar bem" />
          </div>
        </div>
        <PlanSideCard title="Leitura patrimonial">
          <PlanMiniStackBar segments={[{ label: 'Inter', value: inter, color: '#FF7A00' }, { label: 'Fora', value: fora, color: '#1E7FE6' }, { label: 'Bens', value: bens, color: '#9E9E9E' }]} />
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" /> {(inter + fora) ? Math.round((inter / (inter + fora)) * 100) : 0}% do patrimônio financeiro custodiado no Inter.</li>
            <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" /> Alta relevância de recursos fora da instituição ({formatCurrency(fora)}).</li>
            <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" /> Patrimônio total de {formatCurrency(total)} — boa base para o longo prazo.</li>
          </ul>
        </PlanSideCard>
      </div>
    </div>
  );
}

function PlanStepPremissas({ draft, set }) {
  const A = draft.assumptions;
  const fields = [['inflation', 'Inflação esperada'], ['nominalReturn', 'Retorno nominal esperado'], ['realReturn', 'Retorno real esperado'], ['cdi', 'CDI de referência'], ['expenseGrowth', 'Crescimento das despesas'], ['incomeGrowth', 'Crescimento da renda']];
  const validations = [['taxa', 'Taxa real de juros alinhada ao cenário macroeconômico atual.'], ['inflacao', 'Curva de inflação de longo prazo estimada com base nas projeções Focus.'], ['despesas', 'Crescimento de despesas indexado ao perfil de consumo do cliente.'], ['risco', 'Diferencial de prêmio de risco parametrizado para o perfil.']];
  // Edição com vírgula decimal (padrão BR) — texto cru enquanto em foco,
  // formatado com vírgula fora de foco; commit só ocorre com número válido.
  const [rawEdits, setRawEdits] = React.useState({});
  const commitPct = (k, raw) => {
    const n = Number(raw.replace(',', '.'));
    if (Number.isFinite(n)) set({ assumptions: { ...A, [k]: n } });
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-base font-semibold text-neutral-900 mb-1">Parâmetros e premissas macroeconômicas</h2>
          <p className="text-sm text-neutral-500 mb-4">Configure as taxas de projeção que servem de base para a simulação de rentabilidade e inflação no tempo.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fields.map(([k, label]) => (
              <PlanField key={k} label={label}>
                <div className="flex items-center border border-neutral-200 rounded-medium px-3 focus-within:border-brand">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rawEdits[k] !== undefined ? rawEdits[k] : String(A[k]).replace('.', ',')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9,]/g, '');
                      setRawEdits((r) => ({ ...r, [k]: raw }));
                      commitPct(k, raw);
                    }}
                    onBlur={() => setRawEdits((r) => { const next = { ...r }; delete next[k]; return next; })}
                    className="w-full text-sm py-2 focus:outline-none"
                  />
                  <span className="text-xs text-neutral-400 pl-1">% a.a.</span>
                </div>
              </PlanField>
            ))}
          </div>
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Premissas validadas pelo consultor</h3>
          <div className="space-y-2">
            {validations.map(([k, label]) => (
              <label key={k} className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={!!(A.validated && A.validated[k])} onChange={() => set({ assumptions: { ...A, validated: { ...A.validated, [k]: !(A.validated && A.validated[k]) } } })} className="accent-brand w-4 h-4" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <PlanSideCard title="Como interpretar">
        <div className="space-y-3 text-sm">
          <div><span className="text-[10px] font-semibold uppercase tracking-wide text-info-dark">Dados informados</span><p className="text-neutral-600 mt-0.5">Informações providas pelo cadastro do cliente e dados históricos.</p></div>
          <div><span className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark">Premissas editáveis</span><p className="text-neutral-600 mt-0.5">Variáveis macroeconômicas ajustáveis que definem a curva de juros reais futuros.</p></div>
          <div><span className="text-[10px] font-semibold uppercase tracking-wide text-success-dark">Resultados calculados</span><p className="text-neutral-600 mt-0.5">Valores projetados a partir da intersecção de dados e premissas.</p></div>
        </div>
      </PlanSideCard>
    </div>
  );
}

// `client` fixo (fluxo normal, de dentro da ficha do cliente) ou `null` +
// `clients` (entrada tool-first "Planejamento → Cliente", GOVERNANCA.md) —
// nesse modo, a Etapa 1 embute o seletor de cliente e os botões de commit
// ficam bloqueados até haver um cliente associado.
function PlanningWizard({ client, plan, clients, onCancel, onSaveDraft, onCalculate }) {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState(() => draftFromPlan(plan));
  const [pickedClientId, setPickedClientId] = React.useState(client ? client.id : null);
  const set = (patch) => setDraft((d) => Object.assign({}, d, patch));
  const last = step === 5; // Premissas é a última etapa do wizard (Cenários = pós-cálculo)
  const needsClientPicker = !client;
  const canCommit = !needsClientPicker || !!pickedClientId;

  const commit = (finalize) => {
    if (!canCommit) return;
    const inv = draft.wealth.investments;
    const inter = inv.filter((x) => (x.inst || '').toLowerCase() === 'inter').reduce((s, x) => s + (Number(x.value) || 0), 0);
    const fora = inv.reduce((s, x) => s + (Number(x.value) || 0), 0) - inter;
    const payload = Object.assign({}, draft, { wealth: Object.assign({}, draft.wealth, { financialInter: inter, financialExternal: fora }) });
    if (finalize) onCalculate(payload, pickedClientId); else onSaveDraft(payload, pickedClientId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PlanStepper current={step} />
      </div>

      {step === 0 && <PlanStepNovo draft={draft} set={set} clients={needsClientPicker ? clients : null} selectedClientId={pickedClientId} onSelectClient={setPickedClientId} />}
      {step === 1 && <PlanStepPerfilFamiliar draft={draft} set={set} />}
      {step === 2 && <PlanStepObjetivos draft={draft} set={set} />}
      {step === 3 && <PlanStepRenda draft={draft} set={set} />}
      {step === 4 && <PlanStepPatrimonio draft={draft} set={set} />}
      {step === 5 && <PlanStepPremissas draft={draft} set={set} />}

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <button onClick={() => (step === 0 ? onCancel() : setStep(step - 1))} className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5"><Icon name="arrowLeft" size={14} /> Voltar</button>
        <div className="flex items-center gap-2">
          {needsClientPicker && !pickedClientId && <span className="text-xs text-neutral-400">Associe um cliente na Etapa 1 para salvar</span>}
          <button onClick={() => commit(false)} disabled={!canCommit} className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill border', canCommit ? 'border-neutral-200 hover:bg-neutral-50' : 'border-neutral-200 text-neutral-300 cursor-not-allowed')}>Salvar rascunho</button>
          {last ? (
            <button onClick={() => commit(true)} disabled={!canCommit} className={window.PortalLib.classNames('text-sm px-5 py-2 rounded-pill text-white flex items-center gap-1.5', canCommit ? 'bg-brand hover:bg-brand-dark' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}><Icon name="target" size={14} /> Calcular plano</button>
          ) : (
            <button onClick={() => setStep(step + 1)} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Continuar</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= Fase 3: Cenários, Comparação, Recomendações =================
function scenarioBadge(s) {
  return s.status === 'atinge' ? { label: 'Meta Atingida', className: 'bg-success-light text-success-dark' } : { label: 'Abaixo da Meta', className: 'bg-warning-light text-warning-dark' };
}
function viableIncome(s) { return Math.round(s.desiredIncome * (s.goalPct / 100)); }

// ---------------- Tela 09 — Cenários ----------------
function PlanScenarios({ plan, onBack, onCompare }) {
  const { formatCurrency } = window.PortalLib;
  const atual = plan.scenarios[0] || {};
  const params = [
    { label: 'Idade de aposentadoria', value: `${atual.retireAge} anos` },
    { label: 'Aporte mensal', value: formatCurrency(atual.monthlyContribution) },
    { label: 'Retorno real', value: `${atual.realReturn}% a.a.` },
    { label: 'Renda desejada', value: `${formatCurrency(atual.desiredIncome)}/mês` },
  ];
  const lines = [
    { key: 'atual', label: 'Cenário Atual', color: '#1E7FE6' },
    { key: 'a', label: 'Cenário A', color: '#FF7A00' },
    { key: 'b', label: 'Cenário B', color: '#00A868' },
  ];
  const series = window.PortalAnalytics.wealthSeries(`${plan.id}|scen`, plan.result.currentWealth, 2024, 26, { atual: 0.051, a: 0.063, b: 0.062 });
  const obs = [
    'Postergar a aposentadoria em apenas 3 anos (Cenário A) elimina totalmente o gap patrimonial devido aos juros compostos adicionais.',
    'Aumentar o aporte mensal em R$ 2.500 (Cenário B) viabiliza manter a idade-alvo de 60 anos mantendo o plano no rumo original.',
    'Ajustar apenas a premissa de retorno esperado não é recomendado, pois adiciona risco incompatível ao suitability atual do cliente.',
  ];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Cenários de simulação</h2>
        <p className="text-sm text-neutral-500">Ajuste as variáveis do planejamento para simular diferentes caminhos para a meta.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {params.map((p) => (
          <div key={p.label} className="bg-white border border-neutral-100 rounded-large px-4 py-3.5 flex items-start justify-between">
            <div><div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{p.label}</div><div className="text-base font-bold text-neutral-900 mt-1">{p.value}</div></div>
            <Icon name="fileText" size={14} className="text-brand shrink-0" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {plan.scenarios.map((s) => {
          const badge = scenarioBadge(s);
          const reached = s.goalPct >= 100;
          return (
            <div key={s.id} className="bg-white border border-neutral-100 rounded-large p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-neutral-900">{s.name}</div>
                <StatusPill label={badge.label} className={badge.className} size="sm" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Idade de aposentadoria</span><span className="font-medium text-neutral-900">{s.retireAge} anos</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Aporte mensal</span><span className="font-medium text-neutral-900">{formatCurrency(s.monthlyContribution)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Patrimônio projetado</span><span className="font-medium text-neutral-900">{formatCurrency(s.projectedWealth)}</span></div>
                <div className="flex justify-between items-center"><span className="text-neutral-500">Meta atingida</span><span className={window.PortalLib.classNames('font-bold', reached ? 'text-success-dark' : 'text-brand-dark')}>{s.goalPct}%</span></div>
                <div className="h-2 rounded-pill bg-neutral-100 overflow-hidden"><div className={reached ? 'bg-success h-full' : 'bg-brand h-full'} style={{ width: `${Math.min(s.goalPct, 100)}%` }} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-800">Projeção comparativa de cenários (até 2050)</h3>
          <PlanChartLegend lines={lines} />
        </div>
        <PlanWealthChart series={series} lines={lines} height={240} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Principais observações</h3>
        <div className="space-y-2">
          {obs.map((t, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-large px-4 py-3 flex gap-2 text-sm text-neutral-600"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" /> {t}</div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800">Voltar</button>
        <div className="flex items-center gap-2">
          <button className="text-sm px-4 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">Salvar cenário</button>
          <button onClick={onCompare} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Comparar cenários</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tela 10 — Comparação de cenários ----------------
function PlanComparison({ plan, onBack, onContinue }) {
  const { formatCurrency } = window.PortalLib;
  const [atual = {}, a = {}, b = {}] = plan.scenarios;
  const rows = [
    ['Idade de aposentadoria', `${atual.retireAge} anos`, `${a.retireAge} anos`, `${b.retireAge} anos`],
    ['Aporte mensal', formatCurrency(atual.monthlyContribution), formatCurrency(a.monthlyContribution), formatCurrency(b.monthlyContribution)],
    ['Patrimônio final', formatCurrency(atual.projectedWealth), formatCurrency(a.projectedWealth), formatCurrency(b.projectedWealth)],
    ['Renda mensal viável', formatCurrency(viableIncome(atual)), formatCurrency(viableIncome(a)), formatCurrency(viableIncome(b))],
    ['Meta atingida', `${atual.goalPct}%`, `${a.goalPct}%`, `${b.goalPct}%`],
    ['Status', `Gap de ${planCompact(plan.result.gap)}`, 'Atingida', 'Atingida'],
  ];
  const actions = [
    { icon: 'trendingUp', title: 'Selecionar cenário ideal', desc: 'Confirmar a escolha da alternativa de dilação de prazo com o cliente.' },
    { icon: 'target', title: 'Montar carteira aderente', desc: 'Iniciar a simulação da nova carteira direcionada aos prazos do Cenário A.' },
    { icon: 'fileText', title: 'Gerar relatório para o cliente', desc: 'Exportar o demonstrativo executivo com o comparativo de cenários.' },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Comparação detalhada de cenários</h2>
        <p className="text-sm text-neutral-500">Avalie os indicadores lado a lado para embasar a decisão estratégica do cliente.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-large overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-50"><h3 className="text-sm font-semibold text-neutral-800">Tabela comparativa</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500 px-4 py-2.5">Indicador</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500 px-4 py-2.5">Plano atual</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-brand-dark px-4 py-2.5">Cenário A</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-success-dark px-4 py-2.5">Cenário B</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]} className="border-b border-neutral-50 last:border-0">
                    <td className="px-4 py-3 text-neutral-600">{r[0]}</td>
                    <td className="px-4 py-3 text-right text-neutral-500">{r[1]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">{r[2]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <PlanSideCard title="Leitura do consultor">
          <p className="text-sm text-neutral-600">O <b>Cenário A</b> apresenta melhor equilíbrio entre esforço mensal e atingimento da meta, com aposentadoria aos 63 anos. Esta alternativa otimiza a preservação de caixa imediato do cliente.</p>
        </PlanSideCard>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Próximas ações recomendadas</h3>
        <div className="space-y-2">
          {actions.map((c, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-large px-4 py-3 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center shrink-0"><Icon name={c.icon} size={16} /></span>
              <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-neutral-900">{c.title}</div><div className="text-xs text-neutral-500 mt-0.5">{c.desc}</div></div>
              <button className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 shrink-0">Ver detalhes</button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800">Voltar</button>
        <div className="flex items-center gap-2">
          <button className="text-sm px-4 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">Selecionar cenário</button>
          <button onClick={onContinue} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Continuar</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tela 11 — Recomendações e próximos passos ----------------
function PlanRecommendations({ plan, now, onBack, onReport, onSimulate }) {
  const { formatCurrency, formatDateTime } = window.PortalLib;
  const a = plan.scenarios[1] || plan.scenarios[0] || {};
  const head = [
    ['Objetivo principal', plan.objectives.primary],
    ['Idade alvo', `${a.retireAge} anos`],
    ['Aporte sugerido', `${formatCurrency(a.monthlyContribution)}/mês`],
    ['Patrimônio alvo', formatCurrency(a.projectedWealth)],
  ];
  const recs = [
    { icon: 'trendingUp', title: 'Aumentar aporte mensal', desc: 'Considerar o aumento gradual do aporte nos próximos 18 meses.' },
    { icon: 'target', title: 'Revisar alocação atual', desc: 'Ajustar o mix migrando parte da liquidez diária para ativos indexados ao IPCA.' },
    { icon: 'building', title: 'Consolidar patrimônio externo', desc: `Trazer sob custódia os ${planCompact(plan.wealth.financialExternal)} declarados externamente.` },
    { icon: 'layers', title: 'Iniciar simulação de carteira', desc: 'Rodar simulação de portfólio aderente ao novo prazo.' },
  ];
  const attention = [
    { title: 'Concentração fora do Inter', desc: 'Parte dos ativos declarados está custodiada externamente, dificultando o rebalanceamento ativo.' },
    { title: 'Despesas temporárias pendentes', desc: 'Custos planejados com educação impactarão o caixa até 2035.' },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Recomendações e próximos passos</h2>
        <p className="text-sm text-neutral-500">Consolide a proposta para apresentar caminhos práticos de curto e longo prazo.</p>
      </div>
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Plano recomendado selecionado</div>
            <div className="text-lg font-semibold text-neutral-900 mt-0.5">{a.name} — {plan.objectives.primary} {a.retireAge} anos</div>
          </div>
          <StatusPill label={`Meta Atingida (${a.goalPct}%)`} className="bg-success-light text-success-dark" size="sm" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {head.map(([k, v]) => <div key={k}><div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{k}</div><div className="text-sm font-bold text-neutral-900 mt-1">{v}</div></div>)}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Recomendações</h3>
          <div className="space-y-2">
            {recs.map((c, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-large px-4 py-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center shrink-0"><Icon name={c.icon} size={16} /></span>
                <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-neutral-900">{c.title}</div><div className="text-xs text-neutral-500 mt-0.5">{c.desc}</div></div>
                <button onClick={c.title.indexOf('simulação') !== -1 ? onSimulate : undefined} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50 shrink-0">Ver detalhes</button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Itens que requerem atenção</h3>
            <div className="space-y-2">
              {attention.map((c, i) => (
                <div key={i} className="bg-white border border-brand/40 rounded-large p-3"><div className="text-sm font-semibold text-neutral-900">{c.title}</div><div className="text-xs text-neutral-500 mt-1">{c.desc}</div></div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-neutral-100 rounded-large p-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Atividade recente</h3>
            <ul className="space-y-2.5">
              {(plan.activity || []).slice(0, 4).map((ev, i) => (
                <li key={i} className="flex items-start gap-2 text-sm"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" /><div><div className="text-neutral-800">{ev.label}</div><div className="text-[11px] text-neutral-400">{formatDateTime(ev.date)}</div></div></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800">Voltar</button>
        <div className="flex items-center gap-2">
          <button onClick={onReport} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">Gerar relatório</button>
          <button onClick={onSimulate} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="target" size={14} /> Ir para o simulador</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Estado — Transição para o simulador ----------------
function PlanTransition({ plan, onBack, onSimulate }) {
  const { formatCurrency } = window.PortalLib;
  const a = plan.scenarios[1] || plan.scenarios[0] || {};
  const rows = [
    ['Objetivo financeiro', plan.objectives.primary],
    ['Patrimônio alvo', formatCurrency(a.projectedWealth)],
    ['Aporte mensal', `${formatCurrency(a.monthlyContribution)}/mês`],
    ['Retorno real necessário', `${plan.assumptions.realReturn}% a.a.`],
    ['Cenário selecionado', a.name],
  ];
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-8 max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-success-light text-success-dark flex items-center justify-center text-xs font-semibold"><Icon name="check" size={13} /></span>
          <div className="text-left">
            <div className="text-xs font-semibold text-neutral-800">1. Planejamento</div>
            <div className="text-[11px] text-neutral-400">Definição de Metas &amp; Gap</div>
          </div>
        </div>
        <Icon name="chevronRight" size={14} className="text-neutral-300 shrink-0" />
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">2</span>
          <div className="text-left">
            <div className="text-xs font-semibold text-neutral-800">2. Simulador</div>
            <div className="text-[11px] text-neutral-400">Estruturação da Carteira</div>
          </div>
        </div>
      </div>
      <span className="w-16 h-16 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center mb-4 mx-auto"><Icon name="target" size={28} /></span>
      <h2 className="text-lg font-semibold text-neutral-900">Transforme o plano em estratégia de investimento</h2>
      <p className="text-sm text-neutral-500 mt-1.5">Leve os parâmetros do plano para o simulador e monte a carteira aderente.</p>
      <div className="mt-5 text-left divide-y divide-neutral-50 border border-neutral-100 rounded-large">
        {rows.map(([k, v]) => <div key={k} className="flex items-center justify-between px-4 py-2.5 text-sm"><span className="text-neutral-500">{k}</span><span className="font-semibold text-neutral-900">{v}</span></div>)}
      </div>
      <div className="flex items-center justify-center gap-2 mt-6">
        <button onClick={onBack} className="text-sm px-5 py-2.5 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Voltar ao planejamento</button>
        <button onClick={onSimulate} className="text-sm px-5 py-2.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="target" size={15} /> Montar carteira</button>
      </div>
    </div>
  );
}

// ---------------- Root da aba Planejamento ----------------
function PlanningTab({ client, plan, now, onCreatePlan, onGenerateReport, onSimulate, onCommitPlan }) {
  const [view, setView] = React.useState('overview');

  if (view === 'wizard') {
    return (
      <PlanningWizard
        client={client}
        plan={plan}
        onCancel={() => setView(plan ? 'overview' : 'empty')}
        onSaveDraft={(draft) => { onCommitPlan(draft, 'em_construcao'); setView('overview'); }}
        onCalculate={(draft) => { onCommitPlan(draft, 'em_construcao'); setView('result'); }}
      />
    );
  }

  if (!plan) {
    return <PlanEmpty onStart={() => setView('wizard')} onImport={() => setView('wizard')} />;
  }

  if (view === 'result') {
    return (
      <PlanResult
        client={client}
        plan={plan}
        onBack={() => setView('scenarios')}
        onSaveDraft={() => setView('overview')}
        onContinue={() => setView('scenarios')}
        onExport={() => window.PortalLib.download(`${client.id}-plano-resultado.txt`, `Resultado do planejamento — ${plan.name}`, 'text/plain')}
      />
    );
  }
  if (view === 'scenarios') {
    return <PlanScenarios plan={plan} onBack={() => setView('result')} onCompare={() => setView('comparison')} />;
  }
  if (view === 'comparison') {
    return <PlanComparison plan={plan} onBack={() => setView('scenarios')} onContinue={() => setView('recommendations')} />;
  }
  if (view === 'recommendations') {
    return <PlanRecommendations plan={plan} now={now} onBack={() => setView('comparison')} onReport={() => setView('report')} onSimulate={() => setView('transition')} />;
  }
  if (view === 'transition') {
    return <PlanTransition plan={plan} onBack={() => setView('recommendations')} onSimulate={onSimulate} />;
  }
  if (view === 'report') {
    return (
      <PlanReport
        client={client}
        plan={plan}
        onBack={() => setView('overview')}
        onSend={onGenerateReport}
        onSimulate={onSimulate}
        onNewPlan={onCreatePlan}
      />
    );
  }
  // wizard entra na Fase 2 — por ora reencaminha para a visão geral
  if (view === 'wizard') {
    return (
      <div className="bg-white border border-neutral-100 rounded-large p-8 text-center">
        <div className="text-sm text-neutral-500">Assistente de construção do planejamento — disponível na próxima etapa.</div>
        <button onClick={() => setView('overview')} className="mt-3 text-sm text-brand-dark hover:underline">Voltar à visão geral</button>
      </div>
    );
  }

  return (
    <PlanOverview
      client={client}
      plan={plan}
      onEdit={() => setView('wizard')}
      onOpenResult={() => setView('result')}
      onSimulate={onSimulate}
    />
  );
}

window.PlanningTab = PlanningTab;
window.PlanningWizard = PlanningWizard;
window.PLAN_STATUS_META = PLAN_STATUS_META;

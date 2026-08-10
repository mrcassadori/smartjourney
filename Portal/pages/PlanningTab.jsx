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

function PlanAttention({ items }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-800 mb-2">Requer atenção</h3>
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
function WealthChart({ series, lines, height }) {
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

function ChartLegend({ lines }) {
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
  const scenarioAtual = plan.scenarios.find((s) => s.id === plan.selectedScenarioId) || plan.scenarios[0];
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
            <ChartLegend lines={lines} />
          </div>
          <WealthChart series={series} lines={lines} height={240} />
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
    { title: 'Aporte atual abaixo do necessário', desc: `O cliente aporta ${formatCurrency(plan.scenarios[0].monthlyContribution)}/mês, ante os ${formatCurrency(plan.result.requiredContribution)} necessários.` },
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
          <WealthChart series={series} lines={lines} height={240} />
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

// ---------------- Root da aba Planejamento ----------------
function PlanningTab({ client, plan, now, onCreatePlan, onGenerateReport, onSimulate }) {
  const [view, setView] = React.useState('overview');

  if (!plan) {
    return <PlanEmpty onStart={onCreatePlan} onImport={onCreatePlan} />;
  }

  if (view === 'result') {
    return (
      <PlanResult
        client={client}
        plan={plan}
        onBack={() => setView('overview')}
        onSaveDraft={() => setView('overview')}
        onContinue={() => setView('report')}
        onExport={() => window.PortalLib.download(`${client.id}-plano-resultado.txt`, `Resultado do planejamento — ${plan.name}`, 'text/plain')}
      />
    );
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
window.PLAN_STATUS_META = PLAN_STATUS_META;

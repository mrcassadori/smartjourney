// Componentes compartilhados da jornada do Simulador (US-11/US-12):
// barra de contexto persistente, stepper, donut de alocação por classe,
// barra comparativa atual×proposta e rodapé de navegação do wizard.

// Estágios do stepper (Tela 02+). O passo interno do wizard mapeia para um
// destes 5 estágios visuais.
const SIM_STEPPER_STAGES = [
  { key: 'cliente', label: 'Cliente' },
  { key: 'contexto', label: 'Contexto' },
  { key: 'carteira', label: 'Carteira' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'analise', label: 'Análise' },
];

const SIM_STEP_TO_STAGE = {
  cliente: 0,
  contexto: 1,
  carteira: 2,
  produtos: 3,
  alocacao: 3,
  revisao: 3,
  analise: 4,
  aprovada: 4,
  relatorio: 4,
  compartilhar: 4,
};

function classHex(className) {
  const { ASSET_CLASS_ORDER, ASSET_CLASS_HEX } = window.PortalLib;
  const idx = ASSET_CLASS_ORDER.indexOf(className);
  return ASSET_CLASS_HEX[(idx === -1 ? 0 : idx) % ASSET_CLASS_HEX.length];
}

function SimulatorStepper({ step }) {
  const stage = SIM_STEP_TO_STAGE[step] != null ? SIM_STEP_TO_STAGE[step] : 0;
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
      {SIM_STEPPER_STAGES.map((s, i) => {
        const done = i < stage;
        const active = i === stage;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={window.PortalLib.classNames(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                  active ? 'bg-brand text-white' : done ? 'bg-brand-lightest text-brand-dark' : 'bg-neutral-100 text-neutral-400'
                )}
              >
                {done ? <Icon name="check" size={13} /> : i + 1}
              </div>
              <span className={window.PortalLib.classNames('text-sm whitespace-nowrap', active ? 'font-semibold text-neutral-900' : done ? 'text-neutral-600' : 'text-neutral-400')}>
                {s.label}
              </span>
            </div>
            {i < SIM_STEPPER_STAGES.length - 1 && <div className={window.PortalLib.classNames('w-6 sm:w-10 h-px shrink-0', done ? 'bg-brand/40' : 'bg-neutral-200')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Barra de contexto persistente: cliente · perfil · patrimônio · valor simulado · status.
function SimulationContextBar({ client, simulation }) {
  const { formatCurrency, RISK_PROFILE_META, SIMULATION_STATUS_META } = window.PortalLib;
  if (!client) return null;
  const risk = RISK_PROFILE_META[client.riskProfile] || { label: client.riskProfile, className: 'bg-neutral-100 text-neutral-600' };
  const st = SIMULATION_STATUS_META[simulation.status] || { label: simulation.status, className: 'bg-neutral-100 text-neutral-600' };
  const initials = client.name.split(' ').slice(0, 2).map((n) => n[0]).join('');
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-white border border-neutral-100 rounded-large px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-brand-lightest text-brand-dark text-xs font-semibold flex items-center justify-center shrink-0">{initials}</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-900 truncate">{client.name}</div>
          <div className="text-[11px] text-neutral-400">{client.type} · conta {client.account}</div>
        </div>
      </div>
      <div className="hidden sm:block w-px h-8 bg-neutral-100" />
      <ContextField label="Perfil" value={<StatusPill label={risk.label} className={risk.className} size="sm" />} />
      <ContextField label="Patrimônio" value={formatCurrency(client.totalWealth)} />
      <ContextField label="Valor simulado" value={simulation.simulationValue ? formatCurrency(simulation.simulationValue) : '—'} />
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[11px] text-neutral-400">Status</span>
        <StatusPill label={st.label} className={st.className} size="sm" />
      </div>
    </div>
  );
}

function ContextField({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-neutral-400">{label}</div>
      <div className="text-sm font-medium text-neutral-900 truncate">{value}</div>
    </div>
  );
}

// Donut de alocação por classe (via ChartCanvas) + legenda.
// props:
//   stack     — empilha donut (em cima) + legenda em largura total (embaixo);
//               ideal para colunas estreitas onde a legenda não caberia ao lado.
//   showValue — mostra o valor em R$ além do % em cada linha da legenda.
function AllocationDonut({ title, byClass, size, stack, showValue }) {
  const { formatCurrency } = window.PortalLib;
  if (!byClass || byClass.length === 0) {
    return (
      <div>
        {title && <div className="text-sm font-semibold text-neutral-800 mb-3">{title}</div>}
        <div className="text-xs text-neutral-400">Nenhuma alocação ainda.</div>
      </div>
    );
  }
  const total = byClass.reduce((s, c) => s + c.value, 0);
  const data = {
    labels: byClass.map((c) => c.class),
    datasets: [
      {
        data: byClass.map((c) => c.value),
        backgroundColor: byClass.map((c) => classHex(c.class)),
        borderWidth: 0,
      },
    ],
  };
  const options = {
    cutout: '66%',
    plugins: {
      // Desliga a legenda nativa do Chart.js (renderizamos a nossa própria abaixo/ao lado).
      // Precisa estar aqui porque o Object.assign do ChartCanvas faz merge raso de `plugins`.
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)} (${total ? ((ctx.raw / total) * 100).toFixed(0) : 0}%)`,
        },
      },
    },
  };

  const legend = (
    <ul className={window.PortalLib.classNames('text-xs', stack ? 'grid grid-cols-1 gap-1.5 w-full' : 'space-y-1 flex-1 min-w-0')}>
      {byClass.map((c) => (
        <li key={c.class} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: classHex(c.class) }} />
          <span className="text-neutral-600 truncate flex-1 min-w-0">{c.class}</span>
          {showValue && <span className="text-neutral-500 tabular-nums whitespace-nowrap">{formatCurrency(c.value)}</span>}
          <span className="text-neutral-900 font-medium tabular-nums whitespace-nowrap w-9 text-right">{c.pct.toFixed(0)}%</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {title && <div className="text-sm font-semibold text-neutral-800 mb-3">{title}</div>}
      {stack ? (
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: size || 128 }}>
            <window.ChartCanvas type="doughnut" data={data} options={options} height={size || 128} />
          </div>
          {legend}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div style={{ width: size || 132, flexShrink: 0 }}>
            <window.ChartCanvas type="doughnut" data={data} options={options} height={size || 132} />
          </div>
          {legend}
        </div>
      )}
    </div>
  );
}

// Comparativo de alocação por classe — barras pareadas atual×proposta lado a
// lado, uma por classe (inclui classes com 0% de um dos lados), alinhado ao
// mockup de referência ("Comparativo de Alocação por Classe" da Tela 08).
// Substitui o par de donuts que a mesma tela usava antes: mais fácil de
// comparar classe a classe do que dois gráficos de rosca lado a lado.
function AllocationCompareBars({ currentByClass, proposedByClass }) {
  const order = window.PortalLib.ASSET_CLASS_ORDER;
  const curMap = {};
  (currentByClass || []).forEach((c) => (curMap[c.class] = c.pct));
  const propMap = {};
  (proposedByClass || []).forEach((c) => (propMap[c.class] = c.pct));
  const classes = order.filter((c) => curMap[c] != null || propMap[c] != null);
  if (classes.length === 0) return <div className="text-xs text-neutral-400">Nenhuma alocação ainda.</div>;
  return (
    <div>
      {classes.map((c) => (
        <AllocationCompareBar key={c} label={c} beforePct={curMap[c] || 0} afterPct={propMap[c] || 0} />
      ))}
    </div>
  );
}

// Barra comparativa atual (cinza) × proposta (laranja) de um mesmo indicador de %.
function AllocationCompareBar({ label, beforePct, afterPct }) {
  const delta = afterPct - beforePct;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-neutral-700">{label}</span>
        <span className="text-neutral-500 tabular-nums">
          {beforePct.toFixed(0)}% → {afterPct.toFixed(0)}%
          {Math.abs(delta) >= 0.5 && (
            <span className={window.PortalLib.classNames('ml-1.5 font-medium', delta > 0 ? 'text-success-dark' : 'text-neutral-400')}>
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(0)}pp
            </span>
          )}
        </span>
      </div>
      <div className="h-1.5 rounded-pill bg-neutral-100 overflow-hidden">
        <div className="h-full bg-neutral-300" style={{ width: `${Math.min(beforePct, 100)}%` }} />
      </div>
      <div className="h-1.5 rounded-pill bg-neutral-100 overflow-hidden mt-1">
        <div className="h-full bg-brand" style={{ width: `${Math.min(afterPct, 100)}%` }} />
      </div>
    </div>
  );
}

// Rodapé de navegação do wizard: Voltar · Salvar rascunho · Continuar.
function StepFooter({ onBack, onSaveDraft, onContinue, continueLabel, continueDisabled, backLabel }) {
  return (
    <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-neutral-100 flex items-center justify-between gap-3">
      <button onClick={onBack} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 flex items-center gap-1.5 hover:bg-neutral-50">
        <Icon name="arrowLeft" size={14} /> {backLabel || 'Voltar'}
      </button>
      <div className="flex items-center gap-2">
        {onSaveDraft && (
          <button onClick={onSaveDraft} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">
            Salvar rascunho
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={continueDisabled}
          className={window.PortalLib.classNames(
            'text-sm px-5 py-2 rounded-pill text-white flex items-center gap-1.5',
            continueDisabled ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'
          )}
        >
          {continueLabel || 'Continuar'} <Icon name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}

// KPI compacto reutilizado no dashboard e nas telas de montagem.
function SimKpi({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-4 py-3">
      <div className="text-[11px] text-neutral-400 uppercase tracking-wide">{label}</div>
      <div className={window.PortalLib.classNames('text-lg font-semibold mt-0.5', accent ? 'text-brand-dark' : 'text-neutral-900')}>{value}</div>
      {sub && <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  );
}

window.SimulatorChrome = { SimulatorStepper, SimulationContextBar, AllocationDonut, AllocationCompareBar, AllocationCompareBars, StepFooter, SimKpi, classHex };
window.SimulatorStepper = SimulatorStepper;
window.SimulationContextBar = SimulationContextBar;
window.AllocationDonut = AllocationDonut;
window.AllocationCompareBar = AllocationCompareBar;
window.SimStepFooter = StepFooter;
window.SimKpi = SimKpi;

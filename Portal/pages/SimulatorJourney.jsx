// Shell do wizard do Simulador (US-11) + passos leves:
// Tela 02 (selecionar cliente), Tela 03 (contexto) e Tela 07 (revisão).
// Os passos pesados de montagem vêm de window.SimulatorBuild e o dashboard
// de window.SimulatorDashboard.

const SIM_STEPS = ['cliente', 'contexto', 'carteira', 'produtos', 'alocacao', 'revisao', 'analise', 'relatorio', 'compartilhar'];

// ---------- Tela 02 — Selecionar cliente ----------
function StepCliente({ clients, now, onSelect, onExit }) {
  const { maskDocument, formatCurrency, formatDate, RISK_PROFILE_META } = window.PortalLib;
  const [q, setQ] = React.useState('');
  const query = q.trim().toLowerCase();
  const queryDigits = window.PortalLib.onlyDigits(query);
  const matches = clients.filter((c) => {
    if (!query) return false;
    const nameMatch = c.name.toLowerCase().indexOf(query) !== -1;
    const cpfMatch = queryDigits.length > 0 && window.PortalLib.onlyDigits(c.cpfCnpj).indexOf(queryDigits) !== -1;
    const accountMatch = queryDigits.length > 0 && (c.account || '').indexOf(queryDigits) !== -1;
    return nameMatch || cpfMatch || accountMatch;
  });
  const recentes = clients.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 4);

  const card = (c) => {
    const m = RISK_PROFILE_META[c.riskProfile] || { label: c.riskProfile, className: 'bg-neutral-100 text-neutral-600' };
    return (
      <div key={c.id} className="flex items-center justify-between gap-3 border border-neutral-100 rounded-large px-4 py-3 bg-white hover:border-brand/40">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900 truncate">{c.name}</span>
            <StatusPill label={m.label} className={m.className} size="sm" />
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {c.type} · {maskDocument(c.cpfCnpj)} · patrimônio {formatCurrency(c.totalWealth)} · carteira atualizada {formatDate(c.updatedAt)}
          </div>
        </div>
        <button onClick={() => onSelect(c.id)} className="text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark shrink-0">
          Selecionar
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Nova simulação</h1>
        <p className="text-sm text-neutral-500 mt-1">Comece selecionando para quem deseja criar esta proposta.</p>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
          <Icon name="search" size={18} />
        </span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente por nome, CPF ou conta"
          className="w-full text-base border border-neutral-200 rounded-large pl-11 pr-4 py-3"
        />
      </div>

      {query ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{matches.length} resultado(s)</div>
          {matches.length === 0 ? (
            <EmptyState icon="users" title="Nenhum cliente encontrado" description="Revise o nome, CPF ou conta digitados." />
          ) : (
            matches.map(card)
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Clientes recentes</div>
          {recentes.map(card)}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <button onClick={onExit} className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5">
          <Icon name="arrowLeft" size={14} /> Voltar para simulações
        </button>
        <button className="text-sm text-brand-dark hover:underline flex items-center gap-1.5" title="Disponível em breve">
          <Icon name="userPlus" size={14} /> Criar simulação para prospect
        </button>
      </div>
    </div>
  );
}

// ---------- Tela 03 — Contexto e objetivo ----------
function StepContexto({ simulation, onPatch, onContinue, onBack, onSaveDraft }) {
  const { SIMULATION_OBJECTIVES, SIMULATION_FUNDING_META, formatCurrency } = window.PortalLib;
  const objectives = simulation.objectives || [];
  const funding = simulation.fundingSource || 'novo';
  const value = simulation.simulationValue || 0;

  function toggleObjective(key) {
    const next = objectives.indexOf(key) !== -1 ? objectives.filter((o) => o !== key) : objectives.concat(key);
    onPatch({ objectives: next });
  }

  const canContinue = value > 0 && objectives.length > 0;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800">Qual é o objetivo desta simulação?</h2>
        <p className="text-xs text-neutral-400 mt-0.5 mb-4">Selecione um ou mais — a recomendação será construída a partir do objetivo do cliente.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SIMULATION_OBJECTIVES.map((o) => {
            const active = objectives.indexOf(o.key) !== -1;
            return (
              <button
                key={o.key}
                onClick={() => toggleObjective(o.key)}
                className={window.PortalLib.classNames(
                  'flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-large border transition-colors',
                  active ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                <span className={window.PortalLib.classNames('shrink-0', active ? 'text-brand' : 'text-neutral-400')}>
                  <Icon name={o.icon} size={16} />
                </span>
                {o.label}
                {active && <span className="ml-auto text-brand"><Icon name="check" size={14} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Quanto será considerado?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-neutral-500 block mb-1.5">Valor da simulação</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
              <input
                type="number"
                value={value || ''}
                onChange={(e) => onPatch({ simulationValue: Number(e.target.value) || 0 })}
                placeholder="100000"
                className="w-full text-sm border border-neutral-200 rounded-pill pl-9 pr-3 py-2"
              />
            </div>
            {value > 0 && <div className="text-xs text-neutral-400 mt-1">{formatCurrency(value)}</div>}
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1.5">Origem do recurso</label>
            <div className="space-y-2">
              {Object.keys(SIMULATION_FUNDING_META).map((k) => {
                const m = SIMULATION_FUNDING_META[k];
                const active = funding === k;
                return (
                  <button
                    key={k}
                    onClick={() => onPatch({ fundingSource: k })}
                    className={window.PortalLib.classNames(
                      'w-full flex items-start gap-2.5 text-left px-3 py-2 rounded-large border',
                      active ? 'border-brand bg-brand-lightest' : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <span className={window.PortalLib.classNames('mt-0.5 w-4 h-4 rounded-full border-2 shrink-0', active ? 'border-brand bg-brand' : 'border-neutral-300')} />
                    <span>
                      <span className={window.PortalLib.classNames('text-sm block', active ? 'text-brand-dark font-medium' : 'text-neutral-700')}>{m.label}</span>
                      <span className="text-[11px] text-neutral-400">{m.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-2">Observações</h2>
        <textarea
          value={simulation.notes || ''}
          onChange={(e) => onPatch({ notes: e.target.value })}
          rows={3}
          placeholder="Ex.: cliente deseja reduzir concentração em pós-fixados e manter liquidez para aquisição de imóvel."
          className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2 resize-none"
        />
      </div>

      <window.SimStepFooter onBack={onBack} onSaveDraft={onSaveDraft} onContinue={onContinue} continueDisabled={!canContinue} />
    </div>
  );
}

// ---------- Tela 07 — Revisão da proposta ----------
function StepRevisao({ simulation, client, ctx, onPatch, onContinue, onBack, onSaveDraft }) {
  const { formatCurrency, RISK_PROFILE_META } = window.PortalLib;
  const { AllocationDonut, AllocationCompareBar } = window.SimulatorChrome;
  const A = window.PortalAnalytics;

  const totalAllocated = ctx.totalAllocated;
  const value = simulation.simulationValue || 0;
  const fullyAllocated = value > 0 && Math.abs(totalAllocated - value) < 1;
  const belowMin = ctx.itemEntries.some((e) => e.allocatedValue < e.product.minApplication);
  const compatible = ctx.itemEntries.every((e) => e.product.eligibleSegments.indexOf(client.segment) !== -1);
  const top = ctx.proposedMetrics.topIssuer;
  const concentrated = top && top.pct > 25;

  const checklist = [
    { ok: fullyAllocated, label: fullyAllocated ? '100% do valor alocado' : `Faltam ${formatCurrency(Math.max(0, value - totalAllocated))} para alocar` },
    { ok: compatible, label: compatible ? 'Perfil de risco compatível' : 'Há produto acima do perfil do cliente' },
    { ok: !belowMin, label: !belowMin ? 'Aplicações mínimas atendidas' : 'Há item abaixo da aplicação mínima' },
    { ok: true, label: 'Produtos disponíveis' },
  ];

  // Principais mudanças por classe
  const order = window.PortalLib.ASSET_CLASS_ORDER;
  const beforePctByClass = {};
  ctx.currentAlloc.byClass.forEach((c) => (beforePctByClass[c.class] = c.pct));
  const afterPctByClass = {};
  ctx.proposedAlloc.byClass.forEach((c) => (afterPctByClass[c.class] = c.pct));
  const changedClasses = order
    .filter((c) => beforePctByClass[c] != null || afterPctByClass[c] != null)
    .map((c) => ({ class: c, before: beforePctByClass[c] || 0, after: afterPctByClass[c] || 0 }))
    .filter((c) => Math.abs(c.after - c.before) >= 1)
    .sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before))
    .slice(0, 5);

  const defaultRationale = `A proposta ${changedClasses.length ? 'ajusta a distribuição por classe' : 'mantém a distribuição'}, com foco em ${(simulation.objectives || []).length ? 'objetivos definidos com o cliente' : 'diversificação'}, sem alterar significativamente o nível de risco (${A.riskLabel(ctx.proposedMetrics.riskScore)}).`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Revise sua proposta</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Confira os principais pontos antes de analisar os resultados.</p>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Validação</h2>
        <div className="space-y-2">
          {checklist.map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={window.PortalLib.classNames('w-5 h-5 rounded-full flex items-center justify-center shrink-0', v.ok ? 'bg-success-light text-success-dark' : 'bg-warning-light text-warning-dark')}>
                <Icon name={v.ok ? 'check' : 'alertTriangle'} size={12} />
              </span>
              <span className={v.ok ? 'text-neutral-700' : 'text-warning-dark'}>{v.label}</span>
            </div>
          ))}
          {concentrated && (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-warning-light text-warning-dark">
                <Icon name="alertTriangle" size={12} />
              </span>
              <span className="text-warning-dark">Concentração de {top.pct.toFixed(0)}% no emissor {top.issuer}</span>
            </div>
          )}
        </div>
      </div>

      {/* Atual x Proposta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <AllocationDonut title="Carteira atual" byClass={ctx.currentAlloc.byClass} />
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <AllocationDonut title="Carteira proposta" byClass={ctx.proposedAlloc.byClass} />
        </div>
      </div>

      {/* Principais mudanças */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Principais mudanças</h2>
        {changedClasses.length === 0 ? (
          <div className="text-xs text-neutral-400">Sem mudanças relevantes na distribuição por classe.</div>
        ) : (
          changedClasses.map((c) => <AllocationCompareBar key={c.class} label={c.class} beforePct={c.before} afterPct={c.after} />)
        )}
        {top && ctx.currentMetrics.topIssuer && (
          <div className="text-xs text-neutral-500 mt-2">
            Maior emissor: {ctx.currentMetrics.topIssuer.pct.toFixed(0)}% → {top.pct.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Racional */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-2">Racional da recomendação</h2>
        <textarea
          value={simulation.rationale || defaultRationale}
          onChange={(e) => onPatch({ rationale: e.target.value })}
          rows={3}
          className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2 resize-none"
        />
      </div>

      <window.SimStepFooter onBack={onBack} backLabel="Voltar e editar" onSaveDraft={onSaveDraft} onContinue={onContinue} continueLabel="Analisar proposta" />
    </div>
  );
}

// ---------- Shell ----------
function SimulatorJourney({ simulation, client, clients, products, positions, now, profile, onPatch, onSelectClient, onSaveDraft, onExit, onGenerateProposal, onRegisterShared, onNewSimulation, onOpenClient, onImplementProducts }) {
  const { SimulatorStepper, SimulationContextBar } = window.SimulatorChrome;
  const step = simulation.currentStep || 'cliente';
  const idx = SIM_STEPS.indexOf(step);

  const productMap = {};
  products.forEach((p) => (productMap[p.id] = p));
  const ctx = window.PortalAnalytics.proposalContext(positions, simulation.items, productMap);

  const goTo = (s) => onPatch({ currentStep: s });
  const goNext = () => goTo(SIM_STEPS[Math.min(idx + 1, SIM_STEPS.length - 1)]);
  const goPrev = () => (idx <= 0 ? onExit() : goTo(SIM_STEPS[idx - 1]));

  // Passo cliente: layout próprio (sem barra de contexto ainda).
  if (step === 'cliente') {
    return (
      <div className="space-y-5">
        <SimulatorStepper step={step} />
        <StepCliente clients={clients} now={now} onExit={onExit} onSelect={(id) => onSelectClient(id)} />
      </div>
    );
  }

  let body = null;
  if (step === 'contexto') {
    body = <StepContexto simulation={simulation} onPatch={onPatch} onContinue={goNext} onBack={goPrev} onSaveDraft={onSaveDraft} />;
  } else if (step === 'carteira') {
    body = <window.SimulatorBuild.CarteiraAtual simulation={simulation} client={client} ctx={ctx} positions={positions} onContinue={goNext} onBack={goPrev} onSaveDraft={onSaveDraft} />;
  } else if (step === 'produtos') {
    body = (
      <window.SimulatorBuild.Produtos
        simulation={simulation}
        client={client}
        products={products}
        ctx={ctx}
        now={now}
        onPatch={onPatch}
        onContinue={goNext}
        onBack={goPrev}
        onSaveDraft={onSaveDraft}
      />
    );
  } else if (step === 'alocacao') {
    body = (
      <window.SimulatorBuild.Alocacao
        simulation={simulation}
        client={client}
        products={products}
        ctx={ctx}
        onPatch={onPatch}
        onContinue={goNext}
        onBack={goPrev}
        onSaveDraft={onSaveDraft}
      />
    );
  } else if (step === 'revisao') {
    body = (
      <StepRevisao
        simulation={simulation}
        client={client}
        ctx={ctx}
        onPatch={onPatch}
        onBack={goPrev}
        onSaveDraft={onSaveDraft}
        onContinue={() => {
          if (simulation.status === 'rascunho') onPatch({ status: 'em_analise', currentStep: 'analise' });
          else goTo('analise');
        }}
      />
    );
  } else if (step === 'analise') {
    body = (
      <window.SimulatorDashboard
        simulation={simulation}
        client={client}
        products={products}
        ctx={ctx}
        onBack={() => goTo('revisao')}
        onGenerateProposal={() => onPatch({ reportGeneratedAt: simulation.reportGeneratedAt || new Date().toISOString(), currentStep: 'relatorio' })}
        onImplementProducts={onImplementProducts}
      />
    );
  } else if (step === 'relatorio') {
    body = (
      <window.SimulatorReport.ReportConfig
        simulation={simulation}
        client={client}
        profile={profile}
        onPatch={onPatch}
        onContinue={() => goTo('compartilhar')}
        onBack={() => goTo('analise')}
      />
    );
  } else if (step === 'compartilhar') {
    body = (
      <window.SimulatorReport.SharePreview
        simulation={simulation}
        client={client}
        profile={profile}
        ctx={ctx}
        onBack={() => goTo('relatorio')}
        onRegisterShared={onRegisterShared}
        onExit={onExit}
        onNewSimulation={onNewSimulation}
        onOpenClient={onOpenClient}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SimulatorStepper step={step} />
      <SimulationContextBar client={client} simulation={simulation} />
      {body}
    </div>
  );
}

window.SimulatorJourney = SimulatorJourney;

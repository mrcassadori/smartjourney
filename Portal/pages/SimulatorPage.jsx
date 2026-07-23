// US-11 — Simulador de carteira recomendada (por cliente).
// US-12 — Comparativo atual×proposta e relatório white-label (mesma tela,
// segunda aba, porque a spec já declara US-12 dependente de US-11).

function currentAllocationByClass(positions) {
  const { ASSET_CLASS_ORDER } = window.PortalLib;
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  const byClass = {};
  positions.forEach((p) => {
    byClass[p.class] = (byClass[p.class] || 0) + p.currentValue;
  });
  return { total, byClass: ASSET_CLASS_ORDER.filter((c) => byClass[c]).map((c) => ({ class: c, value: byClass[c] })) };
}

function AllocationCompareBar({ label, beforePct, afterPct }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
        <span className="font-medium text-neutral-700">{label}</span>
        <span>{beforePct.toFixed(1)}% → {afterPct.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-pill bg-neutral-100 overflow-hidden relative">
        <div className="h-full bg-neutral-300" style={{ width: `${Math.min(beforePct, 100)}%` }} />
      </div>
      <div className="h-2 rounded-pill bg-neutral-100 overflow-hidden mt-1">
        <div className="h-full bg-brand" style={{ width: `${Math.min(afterPct, 100)}%` }} />
      </div>
    </div>
  );
}

function SimulatorPage({ simulation, client, positions, products, now, profile, onUpdateName, onUpdateItems, onUpdateStatus, onGenerateReport, onBack }) {
  const { formatCurrency, formatDateTime, formatDate, daysUntil, ASSET_CLASS_ORDER, SIMULATION_STATUS_META, PRODUCT_RISK_LABELS } = window.PortalLib;
  const [tab, setTab] = React.useState('build');
  const [showPicker, setShowPicker] = React.useState(false);
  const [confirmKind, setConfirmKind] = React.useState(null); // 'review' | 'send'
  const [applyBranding, setApplyBranding] = React.useState(false);

  const productMap = {};
  products.forEach((p) => (productMap[p.id] = p));

  const items = simulation.items;
  const totalAllocated = items.reduce((s, it) => s + it.allocatedValue, 0);
  const investableCash = client.investableCashEstimate;
  const overBudget = totalAllocated > investableCash;

  const current = currentAllocationByClass(positions);
  const newTotal = current.total + totalAllocated;

  function updateValue(productId, value) {
    onUpdateItems(simulation.id, items.map((it) => (it.productId === productId ? { ...it, allocatedValue: value } : it)));
  }
  function removeItem(productId) {
    onUpdateItems(simulation.id, items.filter((it) => it.productId !== productId));
  }
  function addItem(product) {
    onUpdateItems(simulation.id, [...items, { productId: product.id, allocatedValue: product.minApplication }]);
    setShowPicker(false);
  }

  // Alocação por classe: atual + proposta somadas (para a visão "depois").
  const afterByClass = {};
  current.byClass.forEach((c) => (afterByClass[c.class] = c.value));
  items.forEach((it) => {
    const p = productMap[it.productId];
    if (!p) return;
    afterByClass[p.class] = (afterByClass[p.class] || 0) + it.allocatedValue;
  });
  const allClasses = ASSET_CLASS_ORDER.filter((c) => (current.byClass.find((x) => x.class === c) || afterByClass[c]));

  const suitabilityExpired = daysUntil(client.suitabilityExpiry, now) < 0;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5">
        <Icon name="arrowLeft" size={14} /> Voltar para propostas
      </button>

      <div className="bg-white rounded-large border border-neutral-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <input
              value={simulation.name}
              onChange={(e) => onUpdateName(simulation.id, e.target.value)}
              className="text-lg font-semibold text-neutral-900 border-none focus:outline-none focus:ring-1 focus:ring-brand/40 rounded px-1 -ml-1"
            />
            <div className="text-sm text-neutral-500 mt-0.5">
              {client.name} · {client.segment} · patrimônio {formatCurrency(client.totalWealth)} · v{simulation.version || 1}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill label={SIMULATION_STATUS_META[simulation.status].label} className={SIMULATION_STATUS_META[simulation.status].className} />
          </div>
        </div>

        {suitabilityExpired && (
          <div className="mt-4 flex items-center gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2">
            <Icon name="alertTriangle" size={15} /> Suitability vencido em {formatDate(client.suitabilityExpiry)} — renove antes de enviar qualquer recomendação.
          </div>
        )}

        <nav className="flex gap-1 mt-5 -mb-5 border-b border-neutral-100">
          <button onClick={() => setTab('build')} className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2', tab === 'build' ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500')}>
            Construir
          </button>
          <button onClick={() => setTab('report')} className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2', tab === 'report' ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500')}>
            Comparativo e relatório
          </button>
        </nav>
      </div>

      {tab === 'build' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-large border border-neutral-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-800">Itens da proposta</h2>
                <button onClick={() => setShowPicker(true)} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
                  <Icon name="target" size={14} /> Adicionar produto
                </button>
              </div>

              {items.length === 0 ? (
                <window.EmptyState icon="target" title="Nenhum produto adicionado ainda" description="Use “Adicionar produto” para montar a proposta deste cliente." />
              ) : (
                <div className="divide-y divide-neutral-50">
                  {items.map((it) => {
                    const p = productMap[it.productId];
                    if (!p) return null;
                    const belowMin = it.allocatedValue < p.minApplication;
                    const concentrated = newTotal > 0 && it.allocatedValue / newTotal > 0.3;
                    return (
                      <div key={it.productId} className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-neutral-900 text-sm truncate">{p.name}</div>
                            <div className="text-xs text-neutral-400">{p.class} · risco {PRODUCT_RISK_LABELS[p.riskLevel]} · mín. {formatCurrency(p.minApplication)}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              value={it.allocatedValue}
                              onChange={(e) => updateValue(it.productId, Number(e.target.value) || 0)}
                              className="w-32 text-sm border border-neutral-200 rounded-pill px-3 py-1.5 text-right"
                            />
                            <button onClick={() => removeItem(it.productId)} className="text-neutral-400 hover:text-alert p-1.5" aria-label="Remover">
                              <Icon name="x" size={15} />
                            </button>
                          </div>
                        </div>
                        {(belowMin || concentrated) && (
                          <div className="flex gap-2 mt-1.5">
                            {belowMin && <StatusPill label="Abaixo da aplicação mínima" className="bg-warning-light text-warning-dark" size="sm" />}
                            {concentrated && <StatusPill label="Concentração acima de 30%" className="bg-warning-light text-warning-dark" size="sm" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-large border border-neutral-100 p-4">
              <h2 className="text-sm font-semibold text-neutral-800 mb-3">Validação</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total alocado</span>
                  <span className="font-medium text-neutral-900">{formatCurrency(totalAllocated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Caixa investível estimado</span>
                  <span className="font-medium text-neutral-900">{formatCurrency(investableCash)}</span>
                </div>
              </div>
              {overBudget && (
                <div className="mt-3 flex items-start gap-2 text-xs bg-alert-light text-alert-dark rounded-medium px-3 py-2">
                  <Icon name="alertTriangle" size={13} className="mt-0.5 shrink-0" /> Total alocado excede o caixa investível estimado do cliente.
                </div>
              )}
            </div>

            <div className="bg-white rounded-large border border-neutral-100 p-4">
              <h2 className="text-sm font-semibold text-neutral-800 mb-3">Carteira atual (referência)</h2>
              {current.byClass.length === 0 ? (
                <div className="text-xs text-neutral-400">Cliente sem posições registradas.</div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {current.byClass.map((c) => (
                    <div key={c.class} className="flex justify-between">
                      <span className="text-neutral-500">{c.class}</span>
                      <span className="text-neutral-800">{formatCurrency(c.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                disabled={items.length === 0 || simulation.status !== 'rascunho'}
                onClick={() => setConfirmKind('review')}
                className={window.PortalLib.classNames(
                  'text-sm px-4 py-2 rounded-pill text-white',
                  items.length === 0 || simulation.status !== 'rascunho' ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-brand'
                )}
              >
                Enviar para revisão
              </button>
              {simulation.status === 'em_revisao' && (
                <button onClick={() => setConfirmKind('send')} className="text-sm px-4 py-2 rounded-pill border border-brand text-brand-dark">
                  Marcar como enviada ao cliente
                </button>
              )}
              <div className="text-[11px] text-neutral-400">Salva automaticamente como rascunho a cada alteração — sem necessidade de um botão “salvar”.</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-large border border-neutral-100 p-4">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">Alocação por classe — atual × proposta</h2>
            {allClasses.length === 0 ? (
              <window.EmptyState icon="layers" title="Nada para comparar ainda" description="Adicione produtos na aba Construir." />
            ) : (
              allClasses.map((c) => {
                const beforeVal = (current.byClass.find((x) => x.class === c) || { value: 0 }).value;
                const afterVal = afterByClass[c] || 0;
                return (
                  <AllocationCompareBar
                    key={c}
                    label={c}
                    beforePct={current.total ? (beforeVal / current.total) * 100 : 0}
                    afterPct={newTotal ? (afterVal / newTotal) * 100 : 0}
                  />
                );
              })
            )}
            <div className="flex items-center gap-4 text-[11px] text-neutral-400 mt-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" /> Atual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" /> Proposta</span>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 text-sm">
              <div className="font-medium text-neutral-800 mb-1.5">Inclusões</div>
              {items.length === 0 ? (
                <div className="text-neutral-400 text-xs">Nenhum produto incluído ainda.</div>
              ) : (
                <ul className="text-xs text-neutral-600 space-y-1">
                  {items.map((it) => {
                    const p = productMap[it.productId];
                    return p ? <li key={it.productId}>• {p.name} — {formatCurrency(it.allocatedValue)}</li> : null;
                  })}
                </ul>
              )}
              <div className="font-medium text-neutral-800 mt-3 mb-1.5">Reduções</div>
              <div className="text-neutral-400 text-xs">Nenhuma redução simulada nesta versão — o simulador deste protótipo só modela novas alocações.</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-large border border-neutral-100 p-4">
              <h2 className="text-sm font-semibold text-neutral-800 mb-2">Relatório white-label</h2>
              <label className="text-xs flex items-center gap-1.5 text-neutral-600 mb-3">
                <input type="checkbox" checked={applyBranding} onChange={(e) => setApplyBranding(e.target.checked)} />
                Aplicar marca do escritório ({client.escritorio}) — simulado
              </label>
              {client.stale && (
                <div className="flex items-center gap-1.5 text-xs bg-warning-light text-warning-dark rounded-medium px-2.5 py-1.5 mb-3">
                  <Icon name="clock" size={13} /> Dados do cliente desatualizados — revise antes de gerar.
                </div>
              )}
              <p className="text-[11px] text-neutral-400 mb-3">
                Prévia inclui data, responsável, cliente, premissas, riscos e avisos regulatórios. Valores brutos, antes de custos e tributos. Rentabilidade passada não garante resultados futuros. Documento apenas para fins de demonstração deste protótipo.
              </p>
              <button
                onClick={() => {
                  const brandLine = applyBranding ? `${client.escritorio} × Inter (marca simulada)` : 'Inter — Portal do Consultor';
                  const lines = [
                    brandLine,
                    'RELATÓRIO DE RECOMENDAÇÃO (PRÉVIA SIMULADA)',
                    `Cliente: ${client.name} (${client.segment})`,
                    `Responsável: ${profile.name}`,
                    `Data: ${formatDateTime(now)}`,
                    '',
                    'Alocação atual x proposta por classe:',
                    ...allClasses.map((c) => {
                      const beforeVal = (current.byClass.find((x) => x.class === c) || { value: 0 }).value;
                      const afterVal = afterByClass[c] || 0;
                      return `- ${c}: ${formatCurrency(beforeVal)} -> ${formatCurrency(afterVal)}`;
                    }),
                    '',
                    'Itens incluídos na proposta:',
                    ...items.map((it) => {
                      const p = productMap[it.productId];
                      return p ? `- ${p.name}: ${formatCurrency(it.allocatedValue)} (risco ${PRODUCT_RISK_LABELS[p.riskLevel]})` : '';
                    }),
                    '',
                    'Premissas e avisos: valores brutos, antes de custos e tributos. Rentabilidade passada não garante',
                    'resultados futuros. Sujeito aos riscos descritos na lâmina de cada produto. Documento gerado',
                    'apenas para fins de demonstração deste protótipo — não é uma recomendação real.',
                  ];
                  window.PortalLib.download(`${client.id}-relatorio-${simulation.id}.txt`, lines.join('\n'), 'text/plain');
                  onGenerateReport(simulation.id);
                }}
                className="w-full text-sm px-4 py-2 rounded-pill bg-brand text-white flex items-center justify-center gap-1.5"
              >
                <Icon name="download" size={14} /> Gerar prévia do relatório
              </button>
              {simulation.reportGeneratedAt && (
                <div className="text-[11px] text-neutral-400 mt-2">Última prévia gerada em {formatDateTime(simulation.reportGeneratedAt)}.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <ProductPicker
          products={products}
          client={client}
          now={now}
          excludeIds={items.map((it) => it.productId)}
          onSelect={addItem}
          onClose={() => setShowPicker(false)}
        />
      )}

      {confirmKind === 'review' && (
        <ConfirmAction
          title="Enviar para revisão"
          description="A proposta muda de status para “Em revisão” e ganha uma nova versão. Nenhuma aprovação real é solicitada — é uma simulação de governança interna."
          confirmLabel="Enviar para revisão"
          onConfirm={() => onUpdateStatus(simulation.id, 'em_revisao')}
          onClose={() => setConfirmKind(null)}
        />
      )}
      {confirmKind === 'send' && (
        <ConfirmAction
          title="Marcar como enviada ao cliente"
          description="A proposta muda de status para “Enviada”. Esta é uma simulação — nenhuma mensagem real é enviada ao cliente."
          confirmLabel="Marcar como enviada"
          onConfirm={() => onUpdateStatus(simulation.id, 'enviada')}
          onClose={() => setConfirmKind(null)}
        />
      )}
    </div>
  );
}

window.SimulatorPage = SimulatorPage;

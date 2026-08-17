// Passos de montagem da proposta (US-11):
// Tela 04 (carteira atual), Tela 05 (buscar/selecionar produtos),
// Tela 06 (distribuir a alocação). Expostos em window.SimulatorBuild.

// Mapeamento dos filtros rápidos da Tela 05 para classes reais do catálogo.
const QUICK_CLASS_FILTERS = [
  { key: '', label: 'Todos', classes: null },
  { key: 'rf', label: 'Renda fixa', classes: ['Pós-fixado', 'Prefixado', 'Inflação', 'Caixa'] },
  { key: 'fundos', label: 'Fundos', classes: ['Fundos', 'Multimercado'] },
  { key: 'acoes', label: 'Ações', classes: ['Ações'] },
  { key: 'fiis', label: 'FIIs', classes: ['FIIs'] },
  { key: 'prev', label: 'Previdência', classes: ['Previdência'] },
  { key: 'intl', label: 'Internacional', classes: ['Global'] },
];

function productTags(product, client, now) {
  const { isEligible, PortalLib } = { isEligible: window.PortalLib.isEligible, PortalLib: window.PortalLib };
  const A = window.PortalAnalytics;
  const tags = [];
  const elig = client ? isEligible(client, product, now) : null;
  if (elig && elig.eligible) tags.push({ label: 'Compatível com perfil', className: 'bg-success-light text-success-dark' });
  if (A.liquidityDays(product.liquidity) <= 1) tags.push({ label: 'Alta liquidez', className: 'bg-info-light text-info-dark' });
  if ((product.costs || '').toLowerCase().indexOf('isento de ir') !== -1) tags.push({ label: 'Isento de IR', className: 'bg-brand-lightest text-brand-dark' });
  if (elig && elig.eligible && product.riskLevel <= 2) tags.push({ label: 'Recomendado', className: 'bg-warning-light text-warning-dark' });
  return tags;
}

// ---------- Tela 04 — Carteira atual ----------
function CarteiraAtual({ simulation, client, ctx, positions, onContinue, onBack, onSaveDraft }) {
  const { formatCurrency, formatDate, PRODUCT_RISK_LABELS } = window.PortalLib;
  const { AllocationDonut, SimKpi } = window.SimulatorChrome;
  const A = window.PortalAnalytics;
  const m = ctx.currentMetrics;

  const points = [];
  if (m.topIssuer && m.topIssuer.pct >= 25) points.push(`${m.topIssuer.pct.toFixed(0)}% concentrados no emissor ${m.topIssuer.issuer}.`);
  const posFixed = ctx.currentAlloc.byClass.find((c) => c.class === 'Pós-fixado');
  if (posFixed && posFixed.pct >= 30) points.push(`${posFixed.pct.toFixed(0)}% expostos a pós-fixado (CDI).`);
  const inflacao = ctx.currentAlloc.byClass.find((c) => c.class === 'Inflação');
  if (!inflacao || inflacao.pct < 10) points.push('Baixa exposição à inflação.');
  const longLiq = m.liquidityBuckets.filter((b) => b.key === 'gt30' || b.key === 'vencimento').reduce((s, b) => s + b.pct, 0);
  if (longLiq >= 15) points.push(`${longLiq.toFixed(0)}% com liquidez superior a 30 dias.`);
  if (points.length === 0) points.push('Carteira equilibrada, sem pontos de atenção relevantes.');

  const columns = [
    { key: 'asset', label: 'Produto', render: (p) => <span className="font-medium text-neutral-900">{p.asset}</span> },
    { key: 'class', label: 'Classe', render: (p) => <span className="text-neutral-600">{p.class}</span> },
    { key: 'issuer', label: 'Emissor', render: (p) => <span className="text-neutral-600">{p.issuer}</span> },
    { key: 'currentValue', label: 'Valor', render: (p) => <span className="tabular-nums text-neutral-900">{formatCurrency(p.currentValue)}</span> },
    { key: 'pct', label: '% carteira', render: (p) => <span className="tabular-nums text-neutral-600">{ctx.currentAlloc.total ? ((p.currentValue / ctx.currentAlloc.total) * 100).toFixed(1) : '0'}%</span> },
    { key: 'liquidity', label: 'Liquidez', render: (p) => <span className="text-neutral-600">{p.liquidity}</span> },
    { key: 'maturityDate', label: 'Vencimento', render: (p) => <span className="text-neutral-500 whitespace-nowrap">{p.maturityDate ? formatDate(p.maturityDate) : '—'}</span> },
  ];
  const rows = positions.map((p) => ({ ...p, id: p.id }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Carteira atual</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Como está a carteira hoje e onde estão as oportunidades?</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <SimKpi label="Patrimônio total" value={formatCurrency(ctx.currentAlloc.total)} accent />
        <SimKpi label="Investimentos" value={positions.length} />
        <SimKpi label="Liquidez até D+1" value={`${m.liquidUpTo1.toFixed(0)}%`} />
        <SimKpi label="Maior concentração" value={m.topClass ? `${m.topClass.pct.toFixed(0)}%` : '—'} sub={m.topClass ? m.topClass.class : ''} />
        <SimKpi label="Risco da carteira" value={A.riskLabel(m.riskScore)} sub={`score ${m.riskScore.toFixed(1)}`} />
      </div>

      {/* Alocação + pontos de atenção */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-large p-5">
          <AllocationDonut title="Alocação por classe" byClass={ctx.currentAlloc.byClass} size={150} />
        </div>
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
            <span className="text-warning-dark"><Icon name="alertTriangle" size={15} /></span> Pontos de atenção
          </h2>
          <ul className="space-y-2 text-sm text-neutral-600">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-neutral-300 mt-1.5 w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabela de produtos */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-800 mb-2">Produtos da carteira</h2>
        {positions.length === 0 ? (
          <EmptyState icon="wallet" title="Cliente sem posições registradas" description="Você ainda pode montar uma proposta do zero." />
        ) : (
          <DataTable columns={columns} rows={rows} keyField="id" />
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-neutral-100 flex items-center justify-between gap-3">
        <button onClick={onBack} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 flex items-center gap-1.5 hover:bg-neutral-50">
          <Icon name="arrowLeft" size={14} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onSaveDraft} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Salvar rascunho</button>
          <button onClick={onContinue} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
            Montar proposta <Icon name="chevronRight" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Painel lateral persistente "Carteira proposta".
function ProposalSidePanel({ ctx, simulation, onRemove }) {
  const { formatCurrency } = window.PortalLib;
  const value = simulation.simulationValue || 0;
  const disponivel = value - ctx.totalAllocated;
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4 sticky top-4">
      <h2 className="text-sm font-semibold text-neutral-800 mb-1">Carteira proposta</h2>
      <div className="text-xs text-neutral-400 mb-3">
        {value ? `${formatCurrency(ctx.totalAllocated)} de ${formatCurrency(value)}` : formatCurrency(ctx.totalAllocated)}
        {value > 0 && <span className={window.PortalLib.classNames('ml-1', disponivel < 0 ? 'text-alert-dark' : 'text-neutral-400')}>· {formatCurrency(Math.abs(disponivel))} {disponivel < 0 ? 'acima' : 'disponível'}</span>}
      </div>
      {ctx.itemEntries.length === 0 ? (
        <div className="text-xs text-neutral-400 py-6 text-center border border-dashed border-neutral-200 rounded-large">Nenhum produto adicionado ainda.</div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {ctx.itemEntries.map((e) => (
            <div key={e.product.id} className="py-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm text-neutral-800 truncate">{e.product.name}</div>
                <div className="text-[11px] text-neutral-400">{e.product.class} · {formatCurrency(e.allocatedValue)}</div>
              </div>
              {onRemove && (
                <button onClick={() => onRemove(e.product.id)} className="text-neutral-400 hover:text-alert p-1 shrink-0" aria-label="Remover">
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Tela 05 — Buscar e selecionar investimentos ----------
function Produtos({ simulation, client, products, ctx, now, onPatch, onContinue, onBack, onSaveDraft }) {
  const { formatCurrency, PRODUCT_RISK_LABELS, isEligible } = window.PortalLib;
  const [query, setQuery] = React.useState('');
  const [quick, setQuick] = React.useState('');
  const [riskFilter, setRiskFilter] = React.useState('');
  const [onlyEligible, setOnlyEligible] = React.useState(false);

  const [alertProduct, setAlertProduct] = React.useState(null); // { product, reasons }
  const value = simulation.simulationValue || 0;
  const addedIds = ctx.itemEntries.map((e) => e.product.id);

  const quickDef = QUICK_CLASS_FILTERS.find((q) => q.key === quick);

  function clearFilters() {
    setQuery('');
    setQuick('');
    setRiskFilter('');
    setOnlyEligible(false);
  }

  const filtered = products.filter((p) => {
    if (quickDef && quickDef.classes && quickDef.classes.indexOf(p.class) === -1) return false;
    if (riskFilter && String(p.riskLevel) !== riskFilter) return false;
    if (onlyEligible && client) {
      const e = isEligible(client, p, now);
      if (!e.eligible) return false;
    }
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().indexOf(q) !== -1 || p.issuer.toLowerCase().indexOf(q) !== -1 || (p.indexer || '').toLowerCase().indexOf(q) !== -1 || (p.subclass || '').toLowerCase().indexOf(q) !== -1;
  });

  function addProduct(p) {
    if (addedIds.indexOf(p.id) !== -1) return;
    onPatch({ items: simulation.items.concat({ productId: p.id, allocatedValue: p.minApplication }) });
  }
  function removeProduct(id) {
    onPatch({ items: simulation.items.filter((it) => it.productId !== id) });
  }
  // Não impede silenciosamente: se o produto é incompatível com o suitability,
  // abre um alerta contextual antes de adicionar (Tela 05 — estado de exceção).
  function onAddClick(p) {
    if (addedIds.indexOf(p.id) !== -1) {
      removeProduct(p.id);
      return;
    }
    const elig = client ? isEligible(client, p, now) : { eligible: true };
    if (!elig.eligible) {
      setAlertProduct({ product: p, reasons: elig.reasons });
      return;
    }
    addProduct(p);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Monte a carteira proposta</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{value ? `${formatCurrency(value)} disponíveis para alocação.` : 'Defina o valor da simulação no passo de contexto.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Busca */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Icon name="search" size={17} /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por produto, emissor, indexador ou categoria"
              className="w-full text-sm border border-neutral-200 rounded-large pl-10 pr-3 py-2.5"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            {QUICK_CLASS_FILTERS.map((q) => (
              <button
                key={q.key}
                onClick={() => setQuick(q.key)}
                className={window.PortalLib.classNames(
                  'text-xs px-3 py-1.5 rounded-pill border',
                  quick === q.key ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                {q.label}
              </button>
            ))}
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="text-xs border border-neutral-200 rounded-pill px-2.5 py-1.5 text-neutral-600 ml-auto">
              <option value="">Risco</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{PRODUCT_RISK_LABELS[r]}</option>
              ))}
            </select>
            <label className="text-xs text-neutral-600 flex items-center gap-1.5">
              <input type="checkbox" checked={onlyEligible} onChange={(e) => setOnlyEligible(e.target.checked)} /> Só compatíveis
            </label>
          </div>

          {/* Resultados */}
          {filtered.length === 0 ? (
            <div className="space-y-5">
              <EmptyState
                icon="search"
                title="Nenhum investimento encontrado"
                description="Revise o nome, ticker, CNPJ ou remova os filtros utilizados para expandir sua busca."
                action={
                  <div className="flex items-center gap-2">
                    <button onClick={clearFilters} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Limpar filtros</button>
                    <button className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700" title="Disponível em breve">Cadastrar ativo manualmente</button>
                  </div>
                }
              />
              {/* Caminho de recuperação proativo: sugere produtos fora dos filtros
                  atuais em vez de deixar o consultor preso a uma busca sem resultado. */}
              {(() => {
                const suggestions = products
                  .filter((p) => addedIds.indexOf(p.id) === -1)
                  .slice()
                  .sort((a, b) => {
                    const eA = client ? (isEligible(client, a, now).eligible ? 0 : 1) : 0;
                    const eB = client ? (isEligible(client, b, now).eligible ? 0 : 1) : 0;
                    return eA - eB || a.riskLevel - b.riskLevel;
                  })
                  .slice(0, 3);
                if (suggestions.length === 0) return null;
                return (
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Ativos populares sugeridos</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {suggestions.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-2 border border-neutral-100 rounded-large px-3 py-2.5 bg-white">
                          <div className="min-w-0 flex items-center gap-2">
                            <Icon name="trendingUp" size={15} className="text-brand shrink-0" />
                            <span className="text-sm text-neutral-800 truncate">{p.name}</span>
                          </div>
                          <button onClick={() => onAddClick(p)} className="text-xs text-brand-dark hover:underline shrink-0">Adicionar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const added = addedIds.indexOf(p.id) !== -1;
                const elig = client ? isEligible(client, p, now) : null;
                const tags = productTags(p, client, now);
                return (
                  <div key={p.id} className="border border-neutral-100 rounded-large px-4 py-3 bg-white flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900">{p.name}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {p.class} · {p.subclass} · {p.indexer !== '—' ? p.indexer : 'sem indexador'} · liquidez {p.liquidity} · risco {PRODUCT_RISK_LABELS[p.riskLevel]} · mín. {formatCurrency(p.minApplication)}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tags.map((t) => (
                            <StatusPill key={t.label} label={t.label} className={t.className} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onAddClick(p)}
                      className={window.PortalLib.classNames(
                        'text-sm px-3.5 py-1.5 rounded-pill shrink-0 flex items-center gap-1.5',
                        added ? 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50' : elig && !elig.eligible ? 'border border-warning text-warning-dark hover:bg-warning-light' : 'bg-brand text-white hover:bg-brand-dark'
                      )}
                    >
                      {added ? <React.Fragment><Icon name="check" size={13} /> Adicionado</React.Fragment> : <React.Fragment><Icon name="target" size={13} /> Adicionar</React.Fragment>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <ProposalSidePanel ctx={ctx} simulation={simulation} onRemove={removeProduct} />
        </div>
      </div>

      {alertProduct && (
        <IncompatibleProductModal
          data={alertProduct}
          client={client}
          onSeeAlternatives={() => {
            setOnlyEligible(true);
            setAlertProduct(null);
          }}
          onAddAnyway={() => {
            addProduct(alertProduct.product);
            setAlertProduct(null);
          }}
          onClose={() => setAlertProduct(null)}
        />
      )}

      <window.SimStepFooter onBack={onBack} onSaveDraft={onSaveDraft} onContinue={onContinue} continueDisabled={ctx.itemEntries.length === 0} continueLabel="Distribuir investimentos" />
    </div>
  );
}

// Alerta bloqueante para produto acima do perfil do cliente — sem atalho de
// bypass (alinhado à referência: só "Cancelar"/"Ver alternativas". A área é
// regulada por suitability; "Adicionar mesmo assim" permitia contornar o
// alerta sem nenhuma fricção adicional, o que o mockup não desenha aqui).
function IncompatibleProductModal({ data, client, onSeeAlternatives, onClose }) {
  const { PRODUCT_RISK_LABELS } = window.PortalLib;
  const p = data.product;
  return (
    <Modal title="Produto acima do perfil do cliente" onClose={onClose} width="max-w-md">
      <div className="flex items-start gap-2.5 text-sm bg-warning-light text-warning-dark rounded-medium px-3 py-2.5 mb-4">
        <Icon name="alertTriangle" size={16} className="mt-0.5 shrink-0" />
        <span>Este produto tem características acima do perfil <strong>{client.riskProfile}</strong> de {client.name.split(' ')[0]}.</span>
      </div>
      <div className="space-y-2 text-sm mb-2">
        <div className="flex justify-between"><span className="text-neutral-500">Produto</span><span className="text-neutral-900 font-medium">{p.name}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Risco do produto</span><span className="text-neutral-900">{PRODUCT_RISK_LABELS[p.riskLevel]}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Perfil do cliente</span><span className="text-neutral-900">{client.riskProfile}</span></div>
      </div>
      <ul className="text-xs text-neutral-500 space-y-1 mb-1">
        {data.reasons.map((r, i) => (
          <li key={i} className="flex gap-1.5"><span className="text-neutral-300 mt-1 w-1 h-1 rounded-full bg-neutral-300 shrink-0" /> {r}</li>
        ))}
      </ul>
      <div className="flex items-center justify-end gap-2 mt-5">
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Cancelar</button>
        <button onClick={onSeeAlternatives} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Ver alternativas</button>
      </div>
    </Modal>
  );
}

// ---------- Tela 06 — Distribuir a alocação ----------
function Alocacao({ simulation, client, products, ctx, onPatch, onContinue, onBack, onSaveDraft }) {
  const { formatCurrency, PRODUCT_RISK_LABELS } = window.PortalLib;
  const { AllocationDonut } = window.SimulatorChrome;
  const A = window.PortalAnalytics;
  const [allowCash, setAllowCash] = React.useState(false);

  const value = simulation.simulationValue || 0;
  const allocated = ctx.totalAllocated;
  const disponivel = value - allocated;
  const pctAllocated = value ? (allocated / value) * 100 : 0;
  const overBudget = value > 0 && allocated > value + 0.5;
  const fullyAllocated = value > 0 && Math.abs(allocated - value) < 1;

  function updateValue(productId, v) {
    onPatch({ items: simulation.items.map((it) => (it.productId === productId ? { ...it, allocatedValue: Math.max(0, v) } : it)) });
  }
  function removeProduct(id) {
    onPatch({ items: simulation.items.filter((it) => it.productId !== id) });
  }

  // Composição da proposta (apenas itens) por classe
  const itemAlloc = A.allocationByClass(ctx.itemEntries.map((e) => ({ class: e.class, value: e.value })));
  const propMetrics = A.portfolioMetrics(ctx.itemEntries.map((e) => ({ class: e.class, value: e.value, issuer: e.issuer, liquidity: e.liquidity })));
  const compatible = ctx.itemEntries.every((e) => e.product.eligibleSegments.indexOf(client.segment) !== -1);

  const canContinue = ctx.itemEntries.length > 0 && !overBudget && (fullyAllocated || allowCash);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Distribuir investimentos</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Defina quanto será destinado para cada produto.</p>
      </div>

      {/* Banner de largura total — promovido do card lateral estreito (onde a
          mensagem de estouro disputava espaço com outros alertas) pra ficar
          tão visível quanto na referência. */}
      {overBudget && (
        <div className="flex items-center gap-2.5 bg-alert-light text-alert-dark rounded-large px-4 py-3 text-sm font-medium">
          <Icon name="alertTriangle" size={18} className="shrink-0" />
          {formatCurrency(Math.abs(disponivel))} acima do valor da simulação ({pctAllocated.toFixed(0)}% total). Ajuste os valores abaixo.
        </div>
      )}

      {/* Barra de valores */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-lg font-semibold text-neutral-900">{formatCurrency(value)}</div>
            <div className="text-[11px] text-neutral-400">Valor da proposta</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-dark">{formatCurrency(allocated)}</div>
            <div className="text-[11px] text-neutral-400">Já alocado</div>
          </div>
          <div>
            <div className={window.PortalLib.classNames('text-lg font-semibold', disponivel < 0 ? 'text-alert-dark' : 'text-neutral-900')}>{formatCurrency(disponivel)}</div>
            <div className="text-[11px] text-neutral-400">{disponivel < 0 ? 'Acima do valor' : 'Disponível'}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">{pctAllocated.toFixed(0)}%</div>
            <div className="text-[11px] text-neutral-400">Percentual alocado</div>
          </div>
        </div>
        <div className="h-2.5 rounded-pill bg-neutral-100 overflow-hidden">
          <div className={window.PortalLib.classNames('h-full', overBudget ? 'bg-alert' : 'bg-brand')} style={{ width: `${Math.min(pctAllocated, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de produtos com R$ e % */}
        <div className="lg:col-span-2 space-y-3">
          {ctx.itemEntries.map((e) => {
            const pct = value ? (e.allocatedValue / value) * 100 : 0;
            const belowMin = e.allocatedValue < e.product.minApplication;
            return (
              <div key={e.product.id} className="bg-white border border-neutral-100 rounded-large px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-900 truncate">{e.product.name}</div>
                    <div className="text-[11px] text-neutral-400">{e.product.class} · risco {PRODUCT_RISK_LABELS[e.product.riskLevel]} · liquidez {e.product.liquidity}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">R$</span>
                      <input
                        type="number"
                        value={e.allocatedValue}
                        onChange={(ev) => updateValue(e.product.id, Number(ev.target.value) || 0)}
                        className={window.PortalLib.classNames('w-28 text-sm border rounded-pill pl-7 pr-2 py-1.5 text-right tabular-nums', overBudget ? 'border-alert text-alert-dark' : 'border-neutral-200')}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={pct ? Number(pct.toFixed(1)) : 0}
                        onChange={(ev) => updateValue(e.product.id, ((Number(ev.target.value) || 0) / 100) * value)}
                        disabled={!value}
                        className={window.PortalLib.classNames('w-24 text-sm border rounded-pill pl-3 pr-6 py-1.5 text-right tabular-nums disabled:bg-neutral-50', overBudget ? 'border-alert text-alert-dark' : 'border-neutral-200')}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">%</span>
                    </div>
                    <button onClick={() => removeProduct(e.product.id)} className="text-neutral-400 hover:text-alert p-1.5" aria-label="Remover">
                      <Icon name="x" size={15} />
                    </button>
                  </div>
                </div>
                {belowMin && <div className="mt-1.5"><StatusPill label={`Abaixo da aplicação mínima (${formatCurrency(e.product.minApplication)})`} className="bg-warning-light text-warning-dark" size="sm" /></div>}
              </div>
            );
          })}
        </div>

        {/* Composição + alertas */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-100 rounded-large p-4">
            <AllocationDonut title="Composição da proposta" byClass={itemAlloc.byClass} size={140} stack showValue />
          </div>
          <div className="bg-white border border-neutral-100 rounded-large p-4 space-y-2.5">
            {disponivel > 0.5 && (
              <Alert icon="wallet" tone="info" text={`Sua carteira ainda possui ${formatCurrency(disponivel)} disponíveis.`} />
            )}
            {propMetrics.topIssuer && propMetrics.topIssuer.pct > 25 && (
              <Alert icon="alertTriangle" tone="warning" text={`${propMetrics.topIssuer.pct.toFixed(0)}% da proposta está concentrada em ${propMetrics.topIssuer.issuer}.`} />
            )}
            <Alert icon={compatible ? 'check' : 'alertTriangle'} tone={compatible ? 'success' : 'warning'} text={compatible ? `Todos os investimentos são compatíveis com o perfil ${client.riskProfile}.` : 'Há produto acima do perfil do cliente.'} />
          </div>
          {!fullyAllocated && !overBudget && (
            <label className="text-xs text-neutral-600 flex items-center gap-2 px-1">
              <input type="checkbox" checked={allowCash} onChange={(e) => setAllowCash(e.target.checked)} /> Manter o saldo restante em caixa
            </label>
          )}
        </div>
      </div>

      <window.SimStepFooter onBack={onBack} backLabel={overBudget ? 'Voltar e buscar ativos' : undefined} onSaveDraft={onSaveDraft} onContinue={onContinue} continueDisabled={!canContinue} continueLabel="Revisar proposta" />
    </div>
  );
}

function Alert({ icon, tone, text }) {
  const toneMap = {
    info: 'bg-info-light text-info-dark',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    alert: 'bg-alert-light text-alert-dark',
  };
  return (
    <div className={window.PortalLib.classNames('flex items-start gap-2 text-xs rounded-medium px-2.5 py-2', toneMap[tone] || toneMap.info)}>
      <span className="mt-0.5 shrink-0"><Icon name={icon} size={13} /></span>
      <span>{text}</span>
    </div>
  );
}

window.SimulatorBuild = { CarteiraAtual, Produtos, Alocacao };

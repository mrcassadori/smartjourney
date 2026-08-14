// EP-02 — Jornada de Produtos e Carteira Proposta.
// Continuação operacional do Simulador: recebe a carteira-alvo (targetAllocation)
// como contexto SOMENTE-LEITURA e ajuda a selecionar os ativos reais que a
// implementam. Todos os componentes internos usam prefixo `Prod*` porque o
// escopo é global compartilhado (mesma lição do Planejamento).
//
// Fase 1: Tela 01 (Necessidades de alocação) e Tela 02 (Explorar investimentos).
// A máquina de `view` já prevê comparar/detalhe/carteira/revisar (Fases 2–3).

// Valor compacto para headlines (R$ 76,5 mil / R$ 12,8 mi).
function prodCompact(v) {
  const n = Math.abs(v);
  if (n >= 1000000) return `R$ ${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1).replace('.', ',')} mi`;
  if (n >= 1000) return `R$ ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace('.', ',')} mil`;
  return window.PortalLib.formatCurrency(v);
}

const PROD_CLASS_TABS = [
  { key: '', label: 'Todos', classes: null },
  { key: 'Pós-fixado', label: 'Pós-fixado', classes: ['Pós-fixado'] },
  { key: 'Inflação', label: 'Inflação', classes: ['Inflação'] },
  { key: 'Prefixado', label: 'Prefixado', classes: ['Prefixado'] },
  { key: 'Fundos', label: 'Fundos', classes: ['Fundos', 'Multimercado'] },
  { key: 'Ações', label: 'Renda variável', classes: ['Ações'] },
  { key: 'FIIs', label: 'FIIs', classes: ['FIIs'] },
  { key: 'Global', label: 'Internacional', classes: ['Global'] },
];

// ---------- Blocos reutilizáveis ----------

function ProdAdherenceBadge({ level }) {
  const m = window.PortalLib.ADHERENCE_META[level] || window.PortalLib.ADHERENCE_META.adequado;
  return <StatusPill label={m.label} className={m.className} size="sm" />;
}

// Card branco horizontal com a identidade e os números do cliente (Tela 01 topo).
function ProdClientContextCard({ client, now, right }) {
  const { formatCurrency, RISK_PROFILE_META, daysUntil } = window.PortalLib;
  const suitOk = daysUntil(client.suitabilityExpiry, now) >= 0;
  const rp = RISK_PROFILE_META[client.riskProfile] || { label: client.riskProfile, className: 'bg-neutral-100 text-neutral-600' };
  const cell = (label, value, extra) => (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="text-sm font-semibold text-neutral-900 mt-0.5">{value}{extra}</div>
    </div>
  );
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-4">
      <div className="min-w-[180px]">
        <div className="font-semibold text-neutral-900">{client.name}</div>
        <div className="text-xs text-neutral-400 mt-0.5">Conta {client.account} · {client.segment}</div>
      </div>
      {cell('Patrimônio', prodCompact(client.totalWealth))}
      {cell('Saldo disponível', formatCurrency(client.availableBalance))}
      {cell('Perfil', <StatusPill label={rp.label} className={rp.className} size="sm" />)}
      {cell('Suitability', <StatusPill label={suitOk ? 'Válido' : 'Vencido'} className={suitOk ? 'bg-success-light text-success-dark' : 'bg-alert-light text-alert-dark'} size="sm" />)}
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

// Barras horizontais compactas da estratégia (contexto de leitura).
function ProdMiniStrategy({ targetAllocation }) {
  const { strategyClassLabel } = window.PortalLib;
  const order = window.PortalLib.ASSET_CLASS_ORDER;
  const classes = Object.keys(targetAllocation).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
      {classes.map((c) => (
        <div key={c} className="flex items-center gap-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand/70" />
          <span className="text-neutral-500">{strategyClassLabel(c)}</span>
          <span className="font-semibold text-neutral-800">{targetAllocation[c]}%</span>
        </div>
      ))}
    </div>
  );
}

// Tabela Estratégia definida: alvo × carteira atual × necessidade (Tela 01).
function ProdStrategyTable({ needs, onPickClass }) {
  const { strategyClassLabel, NEED_STATUS_META } = window.PortalLib;
  return (
    <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            {['Classe', 'Target', 'Carteira atual', 'Necessidade', ''].map((h, i) => (
              <th key={i} className={window.PortalLib.classNames('font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide', i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-left')}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {needs.rows.map((r) => {
            const meta = NEED_STATUS_META[r.status];
            return (
              <tr key={r.class} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-900">{strategyClassLabel(r.class)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.targetPct}%</td>
                <td className="px-4 py-3 text-neutral-500">{r.currentPct.toFixed(0)}%</td>
                <td className="px-4 py-3">
                  <span className={window.PortalLib.classNames('inline-flex items-center gap-1.5 font-medium', meta.className)}>
                    <span className={window.PortalLib.classNames('w-1.5 h-1.5 rounded-full', meta.dot)} />
                    {r.status === 'deficit' ? `+ ${prodCompact(r.needValue)}` : meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === 'deficit' && (
                    <button onClick={() => onPickClass(r.class)} className="text-xs text-brand font-medium hover:underline whitespace-nowrap">
                      Ver produtos de {strategyClassLabel(r.class)}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Barra de contexto persistente da Tela 02.
function ProdContextBar({ client, targetAllocation, available, selectedTotal, needContext, needRow, onClearContext, onEditStrategy }) {
  const { formatCurrency, strategyClassLabel } = window.PortalLib;
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-5 py-3.5 space-y-3">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div>
          <div className="font-semibold text-neutral-900">{client.name}</div>
          <div className="text-xs text-neutral-400">{formatCurrency(available)} disponíveis</div>
        </div>
        <div className="min-w-[220px] flex-1">
          <ProdMiniStrategy targetAllocation={targetAllocation} />
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-neutral-400">Progresso</div>
          <div className="text-sm font-semibold text-neutral-900">{formatCurrency(selectedTotal)} <span className="text-neutral-400 font-normal">de {formatCurrency(available)} selecionados</span></div>
        </div>
        <button onClick={onEditStrategy} className="text-xs text-neutral-400 hover:text-brand whitespace-nowrap">Editar estratégia no Simulador</button>
      </div>
      {needContext && needRow && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-neutral-100 pt-2.5 text-sm">
          <span className="text-neutral-500">Buscando produtos para <span className="font-semibold text-neutral-800">{strategyClassLabel(needContext)}</span></span>
          <span className="text-neutral-500">Meta: <span className="font-medium text-neutral-700">{prodCompact(needRow.needValue)}</span></span>
          <span className="text-neutral-500">Já selecionado: <span className="font-medium text-neutral-700">{prodCompact(needRow.selectedValue)}</span></span>
          <span className="text-brand font-medium">Falta: {prodCompact(needRow.needRemaining)}</span>
          <button onClick={onClearContext} className="ml-auto text-xs text-neutral-400 hover:text-neutral-700">Limpar contexto</button>
        </div>
      )}
    </div>
  );
}

// Barra contextual de seleção múltipla.
function ProdSelectedBar({ count, onCompare, onAdd, onClear }) {
  return (
    <div className="flex items-center gap-3 bg-brand-lightest border border-brand/20 rounded-large px-4 py-2.5">
      <span className="text-sm font-medium text-brand-dark">{count} {count === 1 ? 'investimento selecionado' : 'investimentos selecionados'}</span>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onClear} className="text-xs text-neutral-500 hover:text-neutral-800 px-2">Limpar</button>
        <button onClick={onCompare} disabled={count < 2} className={window.PortalLib.classNames('text-sm px-3 py-1.5 rounded-pill border', count < 2 ? 'border-neutral-200 text-neutral-300 cursor-not-allowed' : 'border-neutral-200 text-neutral-700 hover:bg-white')}>Comparar</button>
        <button onClick={onAdd} className="text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark">Adicionar à carteira</button>
      </div>
    </div>
  );
}

// ---------- Tela 01 — Necessidades de alocação ----------
function ProdNeedsView({ client, targetAllocation, needs, now, onExplore, onPickClass, onEditStrategy, onOpenClient }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Produtos</h1>
        <p className="text-sm text-neutral-500 mt-1">Encontre os investimentos necessários para implementar a estratégia definida para o cliente.</p>
      </div>

      <ProdClientContextCard
        client={client}
        now={now}
        right={<button onClick={() => onOpenClient(client.id)} className="text-sm text-brand font-medium hover:underline">Ver cliente</button>}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Estratégia definida no Simulador</h2>
          <button onClick={onEditStrategy} className="text-xs text-neutral-400 hover:text-brand">Editar estratégia no Simulador</button>
        </div>
        <ProdStrategyTable needs={needs} onPickClass={onPickClass} />
      </div>

      <div className="bg-brand-lightest border border-brand/20 rounded-large px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Icon name="target" size={18} className="text-brand mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-neutral-800">
              <span className="font-semibold">{prodCompact(needs.totalRemaining)}</span> ainda precisam ser alocados para aproximar a carteira da estratégia definida.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {needs.rows.filter((r) => r.status === 'deficit' && r.needRemaining > 0).map((r) => (
                <button key={r.class} onClick={() => onPickClass(r.class)} className="text-xs px-3 py-1.5 rounded-pill bg-white border border-brand/30 text-brand-dark hover:bg-brand hover:text-white">
                  Ver produtos de {window.PortalLib.strategyClassLabel(r.class)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => onExplore(null)} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Explorar investimentos</button>
      </div>
    </div>
  );
}

// ---------- Tela 02 — Explorar investimentos ----------
function ProdExploreView({ client, targetAllocation, positions, products, needs, items, now, needContext, onClearContext, onEditStrategy, onPickClass, onAddProducts, onCompare, onBack }) {
  const { formatCurrency, PRODUCT_RISK_LABELS } = window.PortalLib;
  const A = window.PortalAnalytics;
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState(needContext || '');
  const [indexer, setIndexer] = React.useState('');
  const [issuer, setIssuer] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [fgcOnly, setFgcOnly] = React.useState(false);
  const [liquidity, setLiquidity] = React.useState('');
  const [checked, setChecked] = React.useState([]);

  React.useEffect(() => { setTab(needContext || ''); }, [needContext]);

  const alreadyIn = new Set(items.map((it) => it.productId));
  const tabDef = PROD_CLASS_TABS.find((t) => t.key === tab) || PROD_CLASS_TABS[0];
  const indexers = Array.from(new Set(products.map((p) => p.indexer).filter((x) => x && x !== '—'))).sort();
  const issuers = Array.from(new Set(products.map((p) => p.issuer))).sort();
  const ratings = Array.from(new Set(products.map((p) => p.rating))).sort();
  const liquidities = Array.from(new Set(products.map((p) => p.liquidity))).sort();

  const rows = products.filter((p) => {
    if (p.class === 'Caixa' || p.class === 'Conta corrente') return false;
    if (tabDef.classes && tabDef.classes.indexOf(p.class) === -1) return false;
    if (indexer && p.indexer !== indexer) return false;
    if (issuer && p.issuer !== issuer) return false;
    if (rating && p.rating !== rating) return false;
    if (fgcOnly && !p.fgc) return false;
    if (liquidity && p.liquidity !== liquidity) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!(p.name.toLowerCase().includes(q) || p.issuer.toLowerCase().includes(q) || (p.indexer || '').toLowerCase().includes(q))) return false;
    }
    return true;
  }).map((p) => {
    const ad = A.productAdherence(p, client, targetAllocation, positions, now);
    return { ...p, _adherence: ad };
  });

  // ordena por aderência (alta primeiro), depois por rating.
  const AD_RANK = { alta: 0, adequado: 1, atencao: 2, nao_recomendado: 3 };
  rows.sort((a, b) => AD_RANK[a._adherence.level] - AD_RANK[b._adherence.level]);

  const needRow = needContext ? needs.rows.find((r) => r.class === needContext) : null;
  const selectedTotal = items.reduce((s, it) => s + (it.value || 0), 0);

  const selCol = { key: '_sel', label: '', sortable: false, render: (r) => (
    <input type="checkbox" className="accent-brand" checked={checked.indexOf(r.id) !== -1 || alreadyIn.has(r.id)} disabled={alreadyIn.has(r.id)}
      onChange={() => setChecked((prev) => prev.indexOf(r.id) !== -1 ? prev.filter((x) => x !== r.id) : [...prev, r.id])} />
  ) };

  const columns = [
    selCol,
    { key: 'name', label: 'Produto', render: (r) => (
      <div>
        <div className="font-medium text-neutral-900">{r.name}</div>
        <div className="text-[11px] text-neutral-400">{window.PortalLib.strategyClassLabel(r.class)}{alreadyIn.has(r.id) ? ' · já na carteira' : ''}</div>
      </div>
    ) },
    { key: 'issuer', label: 'Emissor' },
    { key: 'rateLabel', label: 'Taxa', render: (r) => <span className="font-medium text-neutral-800">{r.rateLabel}</span> },
    { key: 'maturity', label: 'Vencimento', sortable: false, render: (r) => <span className="text-neutral-600">{r.term && r.term !== '—' ? r.term.replace('até ', '') : '—'}</span> },
    { key: 'liquidity', label: 'Liquidez' },
    { key: 'rating', label: 'Rating', render: (r) => <span className="text-neutral-700">{r.rating}</span> },
    { key: 'minApplication', label: 'Mínimo', render: (r) => <span className="text-neutral-600">{formatCurrency(r.minApplication)}</span> },
    { key: 'availableStock', label: 'Disponível', render: (r) => (
      <div>
        <div className="text-neutral-700">{prodCompact(r.availableStock)}</div>
        {r.lowStock && <span className="text-[10px] text-warning-dark bg-warning-light rounded px-1 py-0.5">Estoque baixo</span>}
      </div>
    ) },
    { key: 'adherence', label: 'Aderência', sortable: false, render: (r) => (
      <span title={r._adherence.reasons.join(' ')} className="cursor-help">
        <ProdAdherenceBadge level={r._adherence.level} />
      </span>
    ) },
  ];

  function toggleAll(keys, next) { setChecked(next ? keys.filter((k) => !alreadyIn.has(k)) : []); }
  function doAdd(ids) {
    const toAdd = products.filter((p) => ids.indexOf(p.id) !== -1 && !alreadyIn.has(p.id));
    onAddProducts(toAdd);
    setChecked([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Explorar investimentos</h1>
          <p className="text-sm text-neutral-500 mt-1">Encontre produtos para atender às necessidades de alocação da carteira de {client.name.split(' ')[0]} {client.name.split(' ').slice(-1)}.</p>
        </div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1 shrink-0"><Icon name="arrowLeft" size={15} /> Necessidades</button>
      </div>

      <ProdContextBar
        client={client} targetAllocation={targetAllocation} available={client.availableBalance}
        selectedTotal={selectedTotal} needContext={needContext} needRow={needRow}
        onClearContext={onClearContext} onEditStrategy={onEditStrategy}
      />

      {/* Busca + filtros */}
      <div className="bg-white border border-neutral-100 rounded-large px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por ativo, emissor, fundo ou indexador" className="w-full text-sm border border-neutral-200 rounded-pill pl-9 pr-3 py-1.5" />
          </div>
          <select value={indexer} onChange={(e) => setIndexer(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5"><option value="">Indexador</option>{indexers.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <select value={issuer} onChange={(e) => setIssuer(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 max-w-[160px]"><option value="">Emissor</option>{issuers.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5"><option value="">Rating</option>{ratings.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <select value={liquidity} onChange={(e) => setLiquidity(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 max-w-[150px]"><option value="">Liquidez</option>{liquidities.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <label className="text-sm flex items-center gap-1.5 text-neutral-600 px-1"><input type="checkbox" className="accent-brand" checked={fgcOnly} onChange={(e) => setFgcOnly(e.target.checked)} /> FGC</label>
          <button className="ml-auto text-sm text-brand flex items-center gap-1.5 hover:underline"><Icon name="star" size={14} /> Salvar filtro</button>
        </div>
        {/* Tabs por classe */}
        <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-2.5">
          {PROD_CLASS_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={window.PortalLib.classNames('text-sm px-3 py-1 rounded-pill', tab === t.key ? 'bg-brand text-white' : 'text-neutral-500 hover:bg-neutral-100')}>{t.label}</button>
          ))}
        </div>
      </div>

      {checked.length > 0 && (
        <ProdSelectedBar count={checked.length} onCompare={() => onCompare(checked)} onAdd={() => doAdd(checked)} onClear={() => setChecked([])} />
      )}

      <div className="text-xs text-neutral-400">{rows.length} produto{rows.length === 1 ? '' : 's'}</div>
      <DataTable columns={columns} rows={rows} keyField="id" emptyLabel="Nenhum produto para esses filtros." />
    </div>
  );
}

// ---------- Root ----------
function ProductJourney({ client, simulation, positions, products, now, onExit, onOpenClient, onOpenSimulation }) {
  const A = window.PortalAnalytics;
  const targetAllocation = (simulation && simulation.targetAllocation) || {};
  const [view, setView] = React.useState('necessidades'); // necessidades | explorar | (comparar/detalhe/carteira — Fases 2-3)
  const [items, setItems] = React.useState([]); // [{ productId, value, rate }]
  const [needContext, setNeedContext] = React.useState(null);

  const productMap = {};
  products.forEach((p) => (productMap[p.id] = p));

  // Soma selecionada por classe, para o motor de necessidades descontar.
  const selectedByClass = {};
  items.forEach((it) => {
    const p = productMap[it.productId];
    if (p) selectedByClass[p.class] = (selectedByClass[p.class] || 0) + (it.value || 0);
  });
  const needs = A.strategyNeeds(targetAllocation, positions, client.availableBalance, selectedByClass);

  function addProducts(list) {
    setItems((prev) => {
      const have = new Set(prev.map((it) => it.productId));
      const additions = list.filter((p) => !have.has(p.id)).map((p) => {
        // valor inicial: o que falta na classe (se houver contexto), senão o mínimo.
        const row = needs.rows.find((r) => r.class === p.class);
        const seed = row && row.needRemaining > 0 ? Math.max(p.minApplication, row.needRemaining) : p.minApplication;
        return { productId: p.id, value: seed, rate: p.rateValue };
      });
      return [...prev, ...additions];
    });
  }

  function editStrategy() {
    if (simulation && onOpenSimulation) onOpenSimulation(simulation.id);
  }

  if (view === 'explorar') {
    return (
      <ProdExploreView
        client={client} targetAllocation={targetAllocation} positions={positions} products={products}
        needs={needs} items={items} now={now} needContext={needContext}
        onClearContext={() => setNeedContext(null)}
        onEditStrategy={editStrategy}
        onPickClass={(cls) => { setNeedContext(cls); }}
        onAddProducts={addProducts}
        onCompare={() => { /* Fase 2 */ }}
        onBack={() => setView('necessidades')}
      />
    );
  }

  return (
    <ProdNeedsView
      client={client} targetAllocation={targetAllocation} needs={needs} now={now}
      onExplore={() => { setNeedContext(null); setView('explorar'); }}
      onPickClass={(cls) => { setNeedContext(cls); setView('explorar'); }}
      onEditStrategy={editStrategy}
      onOpenClient={onOpenClient}
    />
  );
}

window.ProductJourney = ProductJourney;
window.prodCompact = prodCompact;

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

const PROD_CLASS_TABS = window.PortalLib.PROD_CLASS_TABS;

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
function ProdNeedsView({ client, targetAllocation, needs, now, itemCount, hasStrategy, onExplore, onPickClass, onOpenCarteira, onEditStrategy, onOpenClient }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Produtos</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {hasStrategy ? 'Encontre os investimentos necessários para implementar a estratégia definida para o cliente.' : 'Explore o catálogo para este cliente e construa uma recomendação.'}
        </p>
      </div>

      <ProdClientContextCard
        client={client}
        now={now}
        right={<button onClick={() => onOpenClient(client.id)} className="text-sm text-brand font-medium hover:underline">Ver cliente</button>}
      />

      {hasStrategy ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Estratégia definida no Simulador</h2>
            <button onClick={onEditStrategy} className="text-xs text-neutral-400 hover:text-brand">Editar estratégia no Simulador</button>
          </div>
          <ProdStrategyTable needs={needs} onPickClass={onPickClass} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-large px-5 py-4 flex items-start gap-3">
          <Icon name="mapSignpost" size={18} className="text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-neutral-700">Este cliente ainda não tem uma estratégia (carteira-alvo) definida no Simulador.</p>
            <p className="text-xs text-neutral-400 mt-1">Você pode explorar o catálogo livremente e montar uma recomendação, ou <button onClick={onEditStrategy} className="text-brand hover:underline">definir a estratégia no Simulador</button> primeiro para ver aderência por classe.</p>
          </div>
        </div>
      )}

      {hasStrategy && (
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
      )}

      <div className="flex justify-end gap-2">
        {itemCount > 0 && (
          <button onClick={onOpenCarteira} className="text-sm px-5 py-2 rounded-pill border border-brand/40 text-brand-dark hover:bg-brand-lightest flex items-center gap-1.5"><Icon name="briefcase" size={14} /> Ver carteira proposta ({itemCount})</button>
        )}
        <button onClick={() => onExplore(null)} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Explorar investimentos</button>
      </div>
    </div>
  );
}

// ---------- Tela 02 — Explorar investimentos ----------
function ProdExploreView({ client, targetAllocation, positions, products, needs, items, now, needContext, hasStrategy, onClearContext, onEditStrategy, onPickClass, onAddProducts, onCompare, onOpenDetail, onOpenCarteira, onBack }) {
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
      onClick={(e) => e.stopPropagation()}
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
        <div className="flex items-center gap-2 shrink-0">
          {items.length > 0 && (
            <button onClick={onOpenCarteira} className="text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"><Icon name="briefcase" size={14} /> Ver carteira proposta ({items.length})</button>
          )}
          <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1"><Icon name="arrowLeft" size={15} /> {hasStrategy ? 'Necessidades' : 'Produtos'}</button>
        </div>
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

      <div className="text-xs text-neutral-400">{rows.length} produto{rows.length === 1 ? '' : 's'} · clique numa linha para ver o detalhe</div>
      <DataTable columns={columns} rows={rows} keyField="id" emptyLabel="Nenhum produto para esses filtros." onRowClick={(r) => onOpenDetail(r.id)} />
    </div>
  );
}

// Impacto de uma aplicação na estratégia: participação da classe e do emissor
// antes/depois, sobre a base pós-implantação (carteira atual + caixa disponível).
// Exclui o próprio produto das somas "já selecionadas" para não contar em dobro.
function prodComputeImpact(product, value, client, positions, targetAllocation, items, productMap) {
  const investedTotal = positions.reduce((s, p) => s + p.currentValue, 0);
  const base = investedTotal + client.availableBalance;
  const sum = (arr, pred) => arr.filter(pred).reduce((s, x) => s + (x.currentValue != null ? x.currentValue : x.value), 0);
  const curClass = sum(positions, (p) => p.class === product.class);
  const selClass = sum(items, (it) => it.productId !== product.id && productMap[it.productId] && productMap[it.productId].class === product.class);
  const curIssuer = sum(positions, (p) => p.issuer === product.issuer);
  const selIssuer = sum(items, (it) => it.productId !== product.id && productMap[it.productId] && productMap[it.productId].issuer === product.issuer);
  const pct = (v) => (base ? (v / base) * 100 : 0);
  return {
    base,
    targetPct: targetAllocation[product.class] || 0,
    classAtual: pct(curClass), classAposSel: pct(curClass + selClass), classAposEste: pct(curClass + selClass + value),
    issuerAtual: pct(curIssuer), issuerApos: pct(curIssuer + selIssuer + value),
  };
}

// Input de taxa negociável (mín/ref/máx) — número editável + slider de apoio.
function ProdRateInput({ product, value, onChange }) {
  if (!product.negotiable) {
    return <div className="text-sm text-neutral-500">Taxa de mercado — {product.rateLabel} (não negociável).</div>;
  }
  const prefix = product.rateUnit === 'IPCA+' ? 'IPCA +' : '';
  const suffix = product.rateUnit === 'IPCA+' ? '%' : product.rateUnit;
  const clamp = (v) => Math.max(product.rateMin, Math.min(product.rateMax, v));
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Taxa proposta ao cliente</div>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-neutral-600">{prefix}</span>}
        <input
          type="number" step="0.1" value={value}
          onChange={(e) => onChange(clamp(parseFloat(e.target.value) || product.rateMin))}
          className="w-24 text-sm border border-neutral-200 rounded-medium px-3 py-1.5 text-right font-medium"
        />
        <span className="text-sm text-neutral-600">{suffix}</span>
      </div>
      <input
        type="range" min={product.rateMin} max={product.rateMax} step="0.1" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full mt-3 accent-brand"
      />
      <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
        <span>mín {product.rateMin}{product.rateUnit === 'IPCA+' ? '%' : ''}</span>
        <span>referência {product.rateRef}{product.rateUnit === 'IPCA+' ? '%' : ''} · 14:32</span>
        <span>máx {product.rateMax}{product.rateUnit === 'IPCA+' ? '%' : ''}</span>
      </div>
    </div>
  );
}

// Uma barra de participação (atual → depois) para o bloco de impacto.
function ProdImpactBar({ label, atual, depois, target, badge }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-neutral-700">{label}</span>
        {badge}
      </div>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span>Atual {atual.toFixed(0)}%</span>
        <Icon name="chevronRight" size={12} className="text-neutral-300" />
        <span className="font-semibold text-neutral-800">Após {depois.toFixed(0)}%</span>
        {target != null && <span className="text-neutral-400">· meta {target}%</span>}
      </div>
      <div className="h-2 rounded-pill bg-neutral-100 overflow-hidden mt-1 relative">
        <div className="h-full bg-brand" style={{ width: `${Math.min(depois, 100)}%` }} />
        {target != null && <span className="absolute top-0 bottom-0 w-0.5 bg-neutral-800/60" style={{ left: `${Math.min(target, 100)}%` }} />}
      </div>
    </div>
  );
}

// ---------- Tela 03 — Comparar investimentos ----------
function ProdCompareView({ compareProducts, client, targetAllocation, positions, items, productMap, now, onAdd, onBack }) {
  const { formatCurrency, strategyClassLabel } = window.PortalLib;
  const A = window.PortalAnalytics;
  const enriched = compareProducts.map((p) => {
    const ad = A.productAdherence(p, client, targetAllocation, positions, now);
    const imp = prodComputeImpact(p, p.minApplication, client, positions, targetAllocation, items, productMap);
    return { ...p, _ad: ad, _conc: imp.issuerApos };
  });
  // destaques
  const AD_RANK = { alta: 3, adequado: 2, atencao: 1, nao_recomendado: 0 };
  const maxRate = Math.max(...enriched.filter((p) => p.negotiable).map((p) => p.rateValue || 0));
  const bestLiq = Math.min(...enriched.map((p) => A.liquidityDays(p.liquidity)));
  const minConc = Math.min(...enriched.map((p) => p._conc));
  const bestAd = Math.max(...enriched.map((p) => AD_RANK[p._ad.level]));

  const rows = [
    ['Classe', (p) => strategyClassLabel(p.class)],
    ['Indexador', (p) => p.indexer],
    ['Taxa', (p) => <span className="font-medium text-neutral-900">{p.rateLabel}{p.negotiable && p.rateValue === maxRate ? <ProdTag>Maior taxa</ProdTag> : null}</span>],
    ['Emissor', (p) => p.issuer],
    ['Rating', (p) => p.rating],
    ['FGC', (p) => (p.fgc ? 'Sim' : 'Não')],
    ['Vencimento', (p) => (p.term && p.term !== '—' ? p.term.replace('até ', '') : '—')],
    ['Liquidez', (p) => <span>{p.liquidity}{A.liquidityDays(p.liquidity) === bestLiq ? <ProdTag>Maior liquidez</ProdTag> : null}</span>],
    ['Aplicação mínima', (p) => formatCurrency(p.minApplication)],
    ['Disponibilidade', (p) => prodCompact(p.availableStock)],
    ['Concentração após aplicação', (p) => <span>{p._conc.toFixed(0)}%{p._conc === minConc ? <ProdTag>Menor concentração</ProdTag> : null}</span>],
    ['Aderência à estratégia', (p) => <span className="inline-flex items-center gap-1"><ProdAdherenceBadge level={p._ad.level} />{AD_RANK[p._ad.level] === bestAd ? <ProdTag>Maior aderência</ProdTag> : null}</span>],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Comparar investimentos</h1>
          <p className="text-sm text-neutral-500 mt-1">Compare os produtos antes de decidir quais utilizar na carteira proposta.</p>
        </div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1 shrink-0"><Icon name="arrowLeft" size={15} /> Voltar</button>
      </div>

      <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left font-semibold text-neutral-500 px-4 py-3 border-b border-neutral-100 text-xs uppercase tracking-wide w-56">Critério</th>
              {enriched.map((p) => (
                <th key={p.id} className="text-left font-semibold text-neutral-900 px-4 py-3 border-b border-neutral-100 align-top">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render], i) => (
              <tr key={i} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 text-neutral-500">{label}</td>
                {enriched.map((p) => <td key={p.id} className="px-4 py-3 text-neutral-700 align-top">{render(p)}</td>)}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3" />
              {enriched.map((p) => (
                <td key={p.id} className="px-4 py-3">
                  <button onClick={() => onAdd([p])} className="text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark">Adicionar à carteira</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProdTag({ children }) {
  return <span className="ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded bg-brand-lightest text-brand-dark">{children}</span>;
}

// ---------- Tela 04 — Detalhe do investimento ----------
function ProdDetailView({ product, client, targetAllocation, positions, items, productMap, needs, now, hasStrategy, onAdd, onBack }) {
  const { formatCurrency, strategyClassLabel, PRODUCT_RISK_LABELS } = window.PortalLib;
  const A = window.PortalAnalytics;
  const existing = items.find((it) => it.productId === product.id);
  const needRow = needs.rows.find((r) => r.class === product.class);
  const defaultValue = existing ? existing.value : (needRow && needRow.needRemaining > 0 ? Math.max(product.minApplication, needRow.needRemaining) : product.minApplication);
  const [value, setValue] = React.useState(defaultValue);
  const [rate, setRate] = React.useState(existing && existing.rate != null ? existing.rate : product.rateValue);
  const ad = A.productAdherence(product, client, targetAllocation, positions, now);
  const imp = prodComputeImpact(product, value, client, positions, targetAllocation, items, productMap);
  // Meta de APORTE da classe (mesmo modelo da Tela 01): quanto do caixa alocar
  // nesta classe. Progresso = o que já foi selecionado na classe (fora este) + este.
  const selClassOther = items.filter((it) => it.productId !== product.id && productMap[it.productId] && productMap[it.productId].class === product.class).reduce((s, it) => s + it.value, 0);
  const aporteMeta = needRow ? needRow.needValue : 0;
  const aporteComEste = selClassOther + value;
  const aportePct = aporteMeta > 0 ? Math.min(100, (aporteComEste / aporteMeta) * 100) : 100;
  const metaAtingida = aporteMeta > 0 && aporteComEste >= aporteMeta - 1;

  const kpi = (v, l) => (
    <div className="bg-white border border-neutral-100 rounded-large px-4 py-3">
      <div className="text-lg font-semibold text-neutral-900">{v}</div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400 mt-0.5">{l}</div>
    </div>
  );
  const pair = (l, v) => (
    <div className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
      <span className="text-sm text-neutral-500">{l}</span>
      <span className="text-sm font-medium text-neutral-800">{v}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Produtos / {strategyClassLabel(product.class)} / {product.name}</div>
          <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">{strategyClassLabel(product.class)} · {product.issuer}{product.term && product.term !== '—' ? ` · ${product.term}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ProdAdherenceBadge level={ad.level} />
          <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1"><Icon name="arrowLeft" size={15} /> Voltar</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpi(product.rateLabel, 'Taxa')}
        {kpi(product.term && product.term !== '—' ? product.term.replace('até ', '') : '—', 'Vencimento')}
        {kpi(product.rating, 'Rating')}
        {kpi(formatCurrency(product.minApplication), 'Aplicação mínima')}
        {kpi(prodCompact(product.availableStock), 'Disponibilidade')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Esquerda — características */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-2">Características do investimento</h2>
          {pair('Emissor', product.issuer)}
          {pair('Produto', product.subclass)}
          {pair('Indexador', product.indexer)}
          {pair('Liquidez', product.liquidity)}
          {pair('Garantia', product.fgc ? 'FGC' : (product.rating === 'Soberano' ? 'Risco soberano' : 'Sem FGC'))}
          {pair('Risco', PRODUCT_RISK_LABELS[product.riskLevel])}
        </div>

        {/* Direita — condições da operação */}
        <div className="bg-white border border-neutral-100 rounded-large p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-800">Condições da operação</h2>
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Valor da aplicação</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">R$</span>
              <input type="number" step="1000" value={value} onChange={(e) => setValue(Math.max(0, parseInt(e.target.value, 10) || 0))} className="w-40 text-sm border border-neutral-200 rounded-medium px-3 py-1.5 text-right font-medium" />
            </div>
          </div>
          <ProdRateInput product={product} value={rate} onChange={setRate} />
          <div className="border-t border-neutral-100 pt-3">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Custos da operação</div>
            <div className="text-sm text-neutral-700">Custos estimados para o cliente: <span className="font-semibold">{product.costs && /isent/i.test(product.costs) ? 'R$ 0,00' : 'R$ 0,00'}</span></div>
            <div className="text-[11px] text-neutral-400 mt-0.5">{product.costs}</div>
          </div>
        </div>
      </div>

      {/* Impacto na estratégia */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Impacto na carteira <span className="text-neutral-400 font-normal">· aplicação de {formatCurrency(value)}</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            {!hasStrategy ? (
              <React.Fragment>
                <div className="text-xs font-medium text-neutral-700 mb-1">Participação na carteira — {strategyClassLabel(product.class)}</div>
                <p className="text-xs text-neutral-500">Cliente sem estratégia definida no Simulador — sem meta de aporte para comparar.</p>
                <div className="text-[11px] text-neutral-400 mt-1">Participação da classe na carteira: {imp.classAtual.toFixed(0)}% → {imp.classAposEste.toFixed(1)}%.</div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-neutral-700">Meta de aporte em {strategyClassLabel(product.class)}</span>
                  {aporteMeta > 0
                    ? (metaAtingida ? <StatusPill label="Meta atingida" className="bg-success-light text-success-dark" size="sm" /> : <StatusPill label={`${aportePct.toFixed(0)}% da meta`} className="bg-warning-light text-warning-dark" size="sm" />)
                    : <StatusPill label="Fora da necessidade" className="bg-neutral-100 text-neutral-500" size="sm" />}
                </div>
                {aporteMeta > 0 ? (
                  <React.Fragment>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                      <span>Já selecionado {prodCompact(selClassOther)}</span>
                      <Icon name="chevronRight" size={12} className="text-neutral-300" />
                      <span className="font-semibold text-neutral-800">Com este {prodCompact(aporteComEste)}</span>
                      <span className="text-neutral-400">de {prodCompact(aporteMeta)}</span>
                    </div>
                    <div className="h-2 rounded-pill bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-brand" style={{ width: `${aportePct}%` }} />
                    </div>
                  </React.Fragment>
                ) : (
                  <p className="text-xs text-neutral-500">{strategyClassLabel(product.class)} já está adequada ou acima do alvo — aplicar aqui não reduz a necessidade da estratégia.</p>
                )}
                <div className="text-[11px] text-neutral-400 mt-1">Participação da classe na carteira: {imp.classAtual.toFixed(0)}% → {imp.classAposEste.toFixed(1)}% (meta {imp.targetPct}%).</div>
              </React.Fragment>
            )}
          </div>
          <ProdImpactBar
            label={`Concentração ${product.issuer}`}
            atual={imp.issuerAtual} depois={imp.issuerApos} target={null}
            badge={imp.issuerApos <= 25 ? <StatusPill label="Dentro do limite" className="bg-success-light text-success-dark" size="sm" /> : <StatusPill label="Acima de 25%" className="bg-warning-light text-warning-dark" size="sm" />}
          />
        </div>
        {ad.reasons.length > 0 && <div className="text-xs text-neutral-500 mt-2 border-t border-neutral-50 pt-2">{ad.reasons.join(' ')}</div>}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onBack} className="text-sm px-5 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Voltar</button>
        <button onClick={() => onAdd(product, value, rate)} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">{existing ? 'Atualizar na carteira' : 'Adicionar à carteira'}</button>
      </div>
    </div>
  );
}

// KPI card no padrão da lista de Clientes.
function ProdKpi({ value, label, accent }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-4 py-3">
      <div className={window.PortalLib.classNames('text-2xl font-semibold', accent === 'brand' ? 'text-brand' : accent === 'alert' ? 'text-alert' : 'text-neutral-900')}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400 mt-0.5">{label}</div>
    </div>
  );
}

function ProdValidationRow({ status, label, detail }) {
  const icon = status === 'ok' ? { name: 'check', cls: 'text-success' } : status === 'warn' ? { name: 'alertTriangle', cls: 'text-warning-dark' } : { name: 'alertTriangle', cls: 'text-alert' };
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon name={icon.name} size={15} className={window.PortalLib.classNames('mt-0.5 shrink-0', icon.cls)} />
      <div>
        <span className="text-sm text-neutral-800">{label}</span>
        {detail && <div className="text-xs text-neutral-500">{detail}</div>}
      </div>
    </div>
  );
}

// Estratégia × Implementação (modelo "preencher lacunas": só as classes
// deficitárias recebem aporte; as demais aparecem como adequada/reduzir).
function ProdStrategyImplTable({ needs, items, productMap }) {
  const { strategyClassLabel, formatCurrency } = window.PortalLib;
  const countByClass = {};
  const valueByClass = {};
  items.forEach((it) => {
    const p = productMap[it.productId];
    if (!p) return;
    countByClass[p.class] = (countByClass[p.class] || 0) + 1;
    valueByClass[p.class] = (valueByClass[p.class] || 0) + it.value;
  });
  return (
    <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            {['Classe', 'Target', 'Produtos selecionados', 'Valor', 'Resultado'].map((h) => (
              <th key={h} className="text-left font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {needs.rows.map((r) => {
            const cnt = countByClass[r.class] || 0;
            const val = valueByClass[r.class] || 0;
            let result;
            if (r.status !== 'deficit') result = <span className="text-neutral-400">— sem aporte ({r.status === 'reduce' ? 'reduzir' : 'adequada'})</span>;
            else if (val >= r.needValue - 1) result = <span className="text-success-dark font-medium">✓ meta de {prodCompact(r.needValue)}</span>;
            else result = <span className="text-warning-dark font-medium">⚠ faltam {prodCompact(r.needValue - val)}</span>;
            return (
              <tr key={r.class} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-900">{strategyClassLabel(r.class)}</td>
                <td className="px-4 py-3 text-neutral-600">{r.targetPct}%</td>
                <td className="px-4 py-3 text-neutral-600">{cnt} {cnt === 1 ? 'produto' : 'produtos'}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(val)}</td>
                <td className="px-4 py-3">{result}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Tela 05 — Carteira proposta ----------
function ProdCarteiraView({ client, targetAllocation, positions, needs, items, productMap, now, onUpdateItem, onRemoveItem, onFindMore, onContinue, onBack }) {
  const { formatCurrency, daysUntil } = window.PortalLib;
  const total = items.reduce((s, it) => s + it.value, 0);
  const available = client.availableBalance;
  const naoAlocado = available - total;
  const pctAlocado = available ? (total / available) * 100 : 0;
  const saldoExcedido = total > available;

  // validações
  const minFail = items.filter((it) => { const p = productMap[it.productId]; return p && it.value < p.minApplication; });
  const stockFail = items.filter((it) => { const p = productMap[it.productId]; return p && it.value > p.availableStock; });
  const suitOk = daysUntil(client.suitabilityExpiry, now) >= 0;
  const deficits = needs.rows.filter((r) => r.status === 'deficit');
  const classFilled = (r) => (items.filter((it) => productMap[it.productId] && productMap[it.productId].class === r.class).reduce((s, it) => s + it.value, 0)) >= r.needValue - 1;
  const classPending = deficits.filter((r) => !classFilled(r));
  // concentração por emissor sobre base pós-implantação
  const investedTotal = positions.reduce((s, p) => s + p.currentValue, 0);
  const base = investedTotal + available;
  const issuerAfter = {};
  positions.forEach((p) => { issuerAfter[p.issuer] = (issuerAfter[p.issuer] || 0) + p.currentValue; });
  items.forEach((it) => { const p = productMap[it.productId]; if (p) issuerAfter[p.issuer] = (issuerAfter[p.issuer] || 0) + it.value; });
  const concIssuer = Object.keys(issuerAfter).map((k) => ({ issuer: k, pct: base ? (issuerAfter[k] / base) * 100 : 0 })).filter((x) => x.pct > 25).sort((a, b) => b.pct - a.pct);

  const canContinue = !saldoExcedido && items.length > 0;
  const hasStrategy = Object.keys(targetAllocation || {}).length > 0;

  // Distribuição da carteira — atual × proposta, sempre disponível (não
  // depende de estratégia); a marca de alvo só aparece quando ela existe.
  const distClasses = window.PortalLib.ASSET_CLASS_ORDER.filter((c) => {
    const inPositions = positions.some((p) => p.class === c);
    const inItems = items.some((it) => productMap[it.productId] && productMap[it.productId].class === c);
    return inPositions || inItems;
  });
  const distRows = distClasses.map((cls) => {
    const cur = positions.filter((p) => p.class === cls).reduce((s, p) => s + p.currentValue, 0);
    const sel = items.filter((it) => productMap[it.productId] && productMap[it.productId].class === cls).reduce((s, it) => s + it.value, 0);
    return { cls, atual: base ? (cur / base) * 100 : 0, depois: base ? ((cur + sel) / base) * 100 : 0, target: hasStrategy ? targetAllocation[cls] : null };
  });

  const num = (v, onChange, w) => (
    <input type="number" value={v} onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))} className={window.PortalLib.classNames('text-sm border border-neutral-200 rounded-medium px-2 py-1 text-right', w || 'w-24')} onClick={(e) => e.stopPropagation()} />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Carteira proposta</h1>
          <p className="text-sm text-neutral-500 mt-1">Revise os investimentos escolhidos para implementar a estratégia definida. <span className="text-neutral-400">{client.name} · Conta {client.account}</span></p>
        </div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1 shrink-0"><Icon name="arrowLeft" size={15} /> Continuar buscando</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ProdKpi value={formatCurrency(available)} label="Disponível" />
        <ProdKpi value={formatCurrency(total)} label="Alocado" accent="brand" />
        <ProdKpi value={formatCurrency(naoAlocado)} label="Não alocado" accent={saldoExcedido ? 'alert' : undefined} />
        <ProdKpi value={items.length} label="Investimentos" />
        <ProdKpi value={`${pctAlocado.toFixed(0)}%`} label="Caixa alocado" />
      </div>

      {saldoExcedido && (
        <div className="flex items-center gap-2 bg-alert-light text-alert-dark rounded-large px-4 py-3 text-sm font-medium">
          <Icon name="alertTriangle" size={16} /> A proposta excede o saldo disponível em {formatCurrency(total - available)}. Ajuste os valores antes de enviar.
        </div>
      )}

      {distRows.length > 0 && (
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Distribuição da carteira <span className="text-neutral-400 font-normal">— atual × proposta{hasStrategy ? ' × alvo' : ''}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {distRows.map((r) => (
              <ProdImpactBar key={r.cls} label={window.PortalLib.strategyClassLabel(r.cls)} atual={r.atual} depois={r.depois} target={r.target} />
            ))}
          </div>
        </div>
      )}

      {needs.rows.length > 0 && (
      <div>
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Estratégia <span className="text-neutral-400 font-normal">(definida no Simulador)</span> × Implementação <span className="text-neutral-400 font-normal">(produtos reais)</span></h2>
        <ProdStrategyImplTable needs={needs} items={items} productMap={productMap} />
        {classPending.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {classPending.map((r) => (
              <button key={r.class} onClick={() => onFindMore(r.class)} className="text-xs px-3 py-1.5 rounded-pill bg-white border border-brand/30 text-brand-dark hover:bg-brand hover:text-white">
                Encontrar produtos de {window.PortalLib.strategyClassLabel(r.class)}
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Tabela de investimentos com edição inline */}
      <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-neutral-50">
            <tr>
              {['Produto', 'Classe', 'Valor', '% do caixa', 'Taxa', 'Vencimento', 'Liquidez', ''].map((h) => (
                <th key={h} className="text-left font-semibold text-neutral-500 px-3 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const p = productMap[it.productId];
              if (!p) return null;
              const belowMin = it.value < p.minApplication;
              return (
                <tr key={it.productId} className="border-b border-neutral-50 last:border-0 align-top">
                  <td className="px-3 py-2.5 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{window.PortalLib.strategyClassLabel(p.class)}</td>
                  <td className="px-3 py-2.5">
                    {num(it.value, (v) => onUpdateItem(it.productId, { value: v }), 'w-28')}
                    {belowMin && <div className="text-[10px] text-alert-dark mt-0.5">mín {formatCurrency(p.minApplication)}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{available ? ((it.value / available) * 100).toFixed(0) : 0}%</td>
                  <td className="px-3 py-2.5">
                    {p.negotiable
                      ? <span className="inline-flex items-center gap-1">{p.rateUnit === 'IPCA+' ? 'IPCA+' : ''}{num(it.rate, (v) => onUpdateItem(it.productId, { rate: v }), 'w-16')}<span className="text-xs text-neutral-400">{p.rateUnit === 'IPCA+' ? '%' : p.rateUnit}</span></span>
                      : <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{p.term && p.term !== '—' ? p.term.replace('até ', '') : '—'}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{p.liquidity}</td>
                  <td className="px-3 py-2.5"><button onClick={() => onRemoveItem(it.productId)} className="text-neutral-300 hover:text-alert"><Icon name="x" size={15} /></button></td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-neutral-400">Nenhum investimento selecionado ainda. Volte para Explorar e adicione produtos.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Validações */}
      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <h2 className="text-sm font-semibold text-neutral-800 mb-1">Validações da recomendação</h2>
        <ProdValidationRow status={suitOk ? 'ok' : 'block'} label={suitOk ? 'Suitability adequado' : 'Suitability vencido — renovar antes de recomendar'} />
        <ProdValidationRow status={minFail.length === 0 ? 'ok' : 'warn'} label={minFail.length === 0 ? 'Valores mínimos atendidos' : `${minFail.length} investimento(s) abaixo da aplicação mínima`} />
        <ProdValidationRow status={stockFail.length === 0 ? 'ok' : 'warn'} label={stockFail.length === 0 ? 'Estoque disponível' : `${stockFail.length} investimento(s) acima do estoque disponível`} />
        <ProdValidationRow status={saldoExcedido ? 'block' : 'ok'} label={saldoExcedido ? `Saldo insuficiente — excede em ${formatCurrency(total - available)}` : 'Saldo disponível suficiente'} />
        {deficits.map((r) => {
          const filled = classFilled(r);
          return <ProdValidationRow key={r.class} status={filled ? 'ok' : 'warn'} label={filled ? `Estratégia de ${window.PortalLib.strategyClassLabel(r.class)} atendida` : `${window.PortalLib.strategyClassLabel(r.class)} abaixo do target`} detail={filled ? null : `Faltam ${prodCompact(r.needValue - (items.filter((it) => productMap[it.productId] && productMap[it.productId].class === r.class).reduce((s, it) => s + it.value, 0)))} para atingir a estratégia definida.`} />;
        })}
        {concIssuer.map((c) => (
          <ProdValidationRow key={c.issuer} status="warn" label={`Concentração por emissor: ${c.issuer} representará ${c.pct.toFixed(0)}% da carteira.`} />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onBack} className="text-sm px-5 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Continuar buscando</button>
        <button onClick={onContinue} disabled={!canContinue} className={window.PortalLib.classNames('text-sm px-5 py-2 rounded-pill text-white', canContinue ? 'bg-brand hover:bg-brand-dark' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}>Revisar recomendação</button>
      </div>
    </div>
  );
}

// ---------- Tela 06 — Revisar recomendação ----------
// Resumo financeiro agregado da proposta. A taxa média só é calculada quando
// todos os itens negociáveis compartilham o mesmo indexador — misturar % CDI
// com IPCA+ numa única "taxa média" seria enganoso, não apenas simplificado.
function prodFinancialSummary(items, productMap, now) {
  const priced = items.map((it) => ({ it, p: productMap[it.productId] })).filter((x) => x.p);
  const negotiableItems = priced.filter((x) => x.p.negotiable && x.it.rate != null);
  const units = new Set(negotiableItems.map((x) => x.p.rateUnit));
  let rateLabel = null;
  if (negotiableItems.length > 0 && units.size === 1) {
    const unit = negotiableItems[0].p.rateUnit;
    const wsum = negotiableItems.reduce((s, x) => s + x.it.rate * x.it.value, 0);
    const wtotal = negotiableItems.reduce((s, x) => s + x.it.value, 0);
    const avg = wtotal ? wsum / wtotal : 0;
    rateLabel = unit === 'IPCA+' ? `IPCA + ${avg.toFixed(1).replace('.', ',')}%` : `${avg.toFixed(1).replace('.', ',')}${unit}`;
  }
  const withMaturity = priced.filter((x) => x.p.maturityDate);
  let avgYears = null;
  if (withMaturity.length > 0) {
    const wsum = withMaturity.reduce((s, x) => { const days = (new Date(x.p.maturityDate) - new Date(now)) / 86400000; return s + Math.max(0, days / 365) * x.it.value; }, 0);
    const wtotal = withMaturity.reduce((s, x) => s + x.it.value, 0);
    avgYears = wtotal ? wsum / wtotal : null;
  }
  return { rateLabel, mixedUnits: negotiableItems.length > 0 && units.size > 1, avgYears, hasMaturity: withMaturity.length > 0 };
}

function ProdRevisarView({ client, items, productMap, now, adherencePct, onConfirm, onBack, onAcceptNewRate, onSubstitute }) {
  const { formatCurrency } = window.PortalLib;
  const total = items.reduce((s, it) => s + it.value, 0);
  const remaining = client.availableBalance - total;
  const summary = prodFinancialSummary(items, productMap, now);
  const diverging = items.filter((it) => { const p = productMap[it.productId]; return p && p.rateUpdated && !it.rateAccepted; });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Revisar recomendação</h1>
          <p className="text-sm text-neutral-500 mt-1">Confira produtos, valores, taxas e condições antes de enviar para {client.name}.</p>
        </div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1 shrink-0"><Icon name="arrowLeft" size={15} /> Voltar</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ProdKpi value={client.name.split(' ').slice(0, 2).join(' ')} label="Cliente" />
        <ProdKpi value={formatCurrency(total)} label="Valor" accent="brand" />
        <ProdKpi value={items.length} label="Investimentos" />
        <ProdKpi value={`${adherencePct}%`} label="Aderência à estratégia" />
      </div>

      {diverging.length > 0 && (
        <div className="border border-warning/40 rounded-large overflow-hidden">
          <div className="bg-warning-light px-4 py-2.5 text-sm font-semibold text-warning-dark">Divergências de taxa e oportunidades atuais</div>
          <div className="divide-y divide-neutral-50 bg-white">
            {diverging.map((it) => {
              const p = productMap[it.productId];
              return (
                <div key={it.productId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-[160px]">
                    <div className="font-medium text-neutral-900 text-sm">{p.name}</div>
                    <div className="text-xs text-neutral-500">Antes <span className="line-through">{p.previousRateLabel}</span> · Agora <span className="font-medium text-neutral-800">{p.rateLabel}</span></div>
                  </div>
                  <StatusPill label="Taxa atualizada" className="bg-warning-light text-warning-dark" size="sm" />
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => onAcceptNewRate(it.productId)} className="text-xs px-3 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark">Aceitar nova taxa</button>
                    <button onClick={() => onSubstitute(it.productId, p.class)} className="text-xs px-3 py-1.5 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Substituir ativo</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-neutral-50">
            <tr>{['Produto', 'Valor', 'Taxa selecionada', 'Referência', 'Status'].map((h) => <th key={h} className="text-left font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const p = productMap[it.productId];
              if (!p) return null;
              const rateLabel = p.negotiable ? (p.rateUnit === 'IPCA+' ? `IPCA + ${String(it.rate).replace('.', ',')}%` : `${it.rate}${p.rateUnit}`) : '—';
              const refLabel = p.negotiable ? (p.rateUnit === 'IPCA+' ? `IPCA + ${String(p.rateRef).replace('.', ',')}%` : `${p.rateRef}${p.rateUnit}`) : '—';
              const isDiverging = diverging.indexOf(it) !== -1;
              return (
                <tr key={it.productId} className={window.PortalLib.classNames('border-b border-neutral-50 last:border-0', isDiverging && 'bg-warning-light/40')}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(it.value)}</td>
                  <td className="px-4 py-3 text-neutral-800 font-medium">{rateLabel}</td>
                  <td className="px-4 py-3 text-neutral-500">{refLabel}</td>
                  <td className="px-4 py-3">{isDiverging ? <StatusPill label="Taxa atualizada" className="bg-warning-light text-warning-dark" size="sm" /> : <StatusPill label="Validado" className="bg-success-light text-success-dark" size="sm" />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <h2 className="text-sm font-semibold text-neutral-800 mb-2">Resumo financeiro</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div><div className="text-xs text-neutral-400 uppercase tracking-wide">Investimento total</div><div className="font-semibold text-neutral-900 mt-0.5">{formatCurrency(total)}</div></div>
          <div><div className="text-xs text-neutral-400 uppercase tracking-wide">Caixa remanescente</div><div className="font-semibold text-neutral-900 mt-0.5">{formatCurrency(remaining)}</div></div>
          <div><div className="text-xs text-neutral-400 uppercase tracking-wide">Custos estimados</div><div className="font-semibold text-neutral-900 mt-0.5">R$ 0,00</div></div>
          <div><div className="text-xs text-neutral-400 uppercase tracking-wide">Taxa média ponderada</div><div className="font-semibold text-neutral-900 mt-0.5">{summary.rateLabel || (summary.mixedUnits ? 'Múltiplos indexadores' : '—')}</div></div>
          <div><div className="text-xs text-neutral-400 uppercase tracking-wide">Prazo médio</div><div className="font-semibold text-neutral-900 mt-0.5">{summary.avgYears != null ? `${summary.avgYears.toFixed(1).replace('.', ',')} anos` : '—'}</div></div>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <h2 className="text-sm font-semibold text-neutral-800 mb-1">Check final</h2>
        <ProdValidationRow status="ok" label="Perfil compatível" />
        <ProdValidationRow status="ok" label="Produtos disponíveis" />
        <ProdValidationRow status="ok" label="Aplicações mínimas" />
        <ProdValidationRow status="ok" label="Saldo suficiente" />
        {diverging.length > 0 && <ProdValidationRow status="warn" label={`${diverging.length} taxa(s) atualizada(s) desde a seleção`} detail="Aceite a nova taxa ou substitua o ativo antes de enviar." />}
        {adherencePct < 100 && <ProdValidationRow status="warn" label={`Estratégia ${adherencePct}% implementada`} detail={`A recomendação pode ser enviada com ${formatCurrency(remaining)} ainda não alocados.`} />}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onBack} className="text-sm px-5 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Voltar</button>
        <button onClick={onConfirm} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Enviar recomendação</button>
      </div>
    </div>
  );
}

// ---------- Tela 07 — Confirmar envio (modal) ----------
function ProdConfirmModal({ client, items, sent, recId, onConfirm, onClose, onGoOrders }) {
  const { formatCurrency } = window.PortalLib;
  const total = items.reduce((s, it) => s + it.value, 0);
  return (
    <Modal title={sent ? 'Recomendação enviada' : 'Enviar recomendação?'} onClose={onClose} width="max-w-md">
      {sent ? (
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-success-light text-success-dark flex items-center justify-center mx-auto mb-3"><Icon name="check" size={24} /></div>
          <div className="font-semibold text-neutral-900">Recomendação {recId} enviada</div>
          <div className="text-sm text-neutral-500 mt-1">Aguardando aprovação do cliente. Cada investimento continuará sendo acompanhado individualmente.</div>
          <div className="flex justify-center gap-2 mt-5">
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Fechar</button>
            <button onClick={onGoOrders} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Ir para Ordens</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-1 mb-3 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Cliente</span><span className="font-medium text-neutral-900">{client.name}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Valor</span><span className="font-medium text-neutral-900">{formatCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Investimentos</span><span className="font-medium text-neutral-900">{items.length}</span></div>
          </div>
          <p className="text-sm text-neutral-600">O cliente receberá uma única recomendação para revisar e aprovar todos os investimentos selecionados.</p>
          <p className="text-xs text-neutral-400 mt-1">Cada investimento continuará sendo acompanhado individualmente.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Cancelar</button>
            <button onClick={onConfirm} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Confirmar envio</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------- Root ----------
function ProductJourney({ client, simulation, positions, products, now, initialProductIds, initialMode, onExit, onOpenClient, onOpenSimulation, onSubmitRecommendation, onGoOrders }) {
  const A = window.PortalAnalytics;
  const targetAllocation = (simulation && simulation.targetAllocation) || {};
  const hasStrategy = Object.keys(targetAllocation).length > 0;

  const productMap = {};
  products.forEach((p) => (productMap[p.id] = p));

  // Entrada "produto-primeiro" do catálogo (Produto(s) → Cliente → …): 1 produto
  // abre direto no Detalhe/Configuração; 2+ já entram como itens da carteira;
  // modo "comparar" abre a Tela 03. Sem seleção prévia, começa nas Necessidades
  // (Nível 3, com estratégia) ou é pulado adiante quando não há estratégia.
  function initialViewAndState() {
    const ids = (initialProductIds || []).filter((id) => productMap[id]);
    if (ids.length === 0) return { view: hasStrategy ? 'necessidades' : 'explorar', items: [], compareIds: [], detailId: null };
    if (initialMode === 'comparar') return { view: 'comparar', items: [], compareIds: ids, detailId: null };
    if (ids.length === 1) return { view: 'detalhe', items: [], compareIds: [], detailId: ids[0] };
    return { view: 'carteira', items: ids.map((id) => ({ productId: id, value: productMap[id].minApplication, rate: productMap[id].rateValue })), compareIds: [], detailId: null };
  }
  const initial = React.useMemo(initialViewAndState, []); // eslint-disable-line

  const [view, setView] = React.useState(initial.view); // necessidades | explorar | comparar | detalhe | carteira | revisar
  const [items, setItems] = React.useState(initial.items); // [{ productId, value, rate }]
  const [needContext, setNeedContext] = React.useState(null);
  const [compareIds, setCompareIds] = React.useState(initial.compareIds);
  const [detailId, setDetailId] = React.useState(initial.detailId);
  const [returnView, setReturnView] = React.useState('explorar'); // para onde voltar do detalhe
  const [confirm, setConfirm] = React.useState(null); // null | 'ask' | 'sent'
  const [sentRecId, setSentRecId] = React.useState(null);

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

  // Adiciona/atualiza um item com valor e taxa específicos (vindo do Detalhe).
  function upsertItem(product, value, rate) {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === product.id);
      if (idx === -1) return [...prev, { productId: product.id, value, rate }];
      return prev.map((it, i) => (i === idx ? { ...it, value, rate } : it));
    });
  }

  function updateItem(productId, patch) {
    setItems((prev) => prev.map((it) => (it.productId === productId ? { ...it, ...patch } : it)));
  }
  function removeItem(productId) {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }

  function editStrategy() {
    if (simulation && onOpenSimulation) onOpenSimulation(simulation.id);
  }

  // Aderência da recomendação: fração do total-necessário já coberta pelos aportes
  // nas classes deficitárias (mesmo modelo da Tela 01).
  const adherencePct = (() => {
    const totalNeed = needs.rows.reduce((s, r) => s + (r.status === 'deficit' ? r.needValue : 0), 0);
    if (totalNeed <= 0) return 100;
    const covered = needs.rows.reduce((s, r) => {
      if (r.status !== 'deficit') return s;
      const sel = items.filter((it) => productMap[it.productId] && productMap[it.productId].class === r.class).reduce((a, it) => a + it.value, 0);
      return s + Math.min(sel, r.needValue);
    }, 0);
    return Math.round((covered / totalNeed) * 100);
  })();

  function submitRecommendation() {
    const recItems = items.map((it) => {
      const p = productMap[it.productId];
      const rateLabel = p.negotiable ? (p.rateUnit === 'IPCA+' ? `IPCA + ${String(it.rate).replace('.', ',')}%` : `${it.rate}${p.rateUnit}`) : '—';
      return { productId: it.productId, asset: p.name, class: p.class, value: it.value, rate: rateLabel, status: 'validado' };
    });
    const total = items.reduce((s, it) => s + it.value, 0);
    const recId = onSubmitRecommendation ? onSubmitRecommendation(client.id, recItems, total) : null;
    setSentRecId(recId || 'REC-' + Math.floor(10000 + Math.random() * 900));
    setConfirm('sent');
  }

  if (view === 'comparar') {
    return (
      <ProdCompareView
        compareProducts={compareIds.map((id) => productMap[id]).filter(Boolean)}
        client={client} targetAllocation={targetAllocation} positions={positions}
        items={items} productMap={productMap} now={now}
        onAdd={(list) => { addProducts(list); setView('explorar'); }}
        onBack={() => setView('explorar')}
      />
    );
  }

  if (view === 'detalhe' && productMap[detailId]) {
    return (
      <ProdDetailView
        product={productMap[detailId]} client={client} targetAllocation={targetAllocation}
        positions={positions} items={items} productMap={productMap} needs={needs} now={now} hasStrategy={hasStrategy}
        onAdd={(p, value, rate) => { upsertItem(p, value, rate); setView(returnView); }}
        onBack={() => setView(returnView)}
      />
    );
  }

  if (view === 'carteira' || view === 'revisar') {
    const modal = confirm ? (
      <ProdConfirmModal
        client={client} items={items} sent={confirm === 'sent'} recId={sentRecId}
        onConfirm={submitRecommendation}
        onClose={() => { if (confirm === 'sent') { onGoOrders && onGoOrders(); } setConfirm(null); }}
        onGoOrders={() => { setConfirm(null); onGoOrders && onGoOrders(); }}
      />
    ) : null;
    if (view === 'revisar') {
      return (
        <React.Fragment>
          <ProdRevisarView
            client={client} items={items} productMap={productMap} now={now} adherencePct={adherencePct}
            onConfirm={() => setConfirm('ask')}
            onBack={() => setView('carteira')}
            onAcceptNewRate={(productId) => updateItem(productId, { rateAccepted: true, rate: productMap[productId].rateValue })}
            onSubstitute={(productId, cls) => { removeItem(productId); setNeedContext(cls); setView('explorar'); }}
          />
          {modal}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <ProdCarteiraView
          client={client} targetAllocation={targetAllocation} positions={positions}
          needs={needs} items={items} productMap={productMap} now={now}
          onUpdateItem={updateItem} onRemoveItem={removeItem}
          onFindMore={(cls) => { setNeedContext(cls); setView('explorar'); }}
          onContinue={() => setView('revisar')}
          onBack={() => setView('explorar')}
        />
        {modal}
      </React.Fragment>
    );
  }

  if (view === 'explorar') {
    return (
      <ProdExploreView
        client={client} targetAllocation={targetAllocation} positions={positions} products={products}
        needs={needs} items={items} now={now} needContext={needContext} hasStrategy={hasStrategy}
        onClearContext={() => setNeedContext(null)}
        onEditStrategy={editStrategy}
        onPickClass={(cls) => { setNeedContext(cls); }}
        onAddProducts={addProducts}
        onCompare={(ids) => { setCompareIds(ids); setView('comparar'); }}
        onOpenDetail={(id) => { setDetailId(id); setReturnView('explorar'); setView('detalhe'); }}
        onOpenCarteira={() => setView('carteira')}
        onBack={hasStrategy ? () => setView('necessidades') : onExit}
      />
    );
  }

  return (
    <ProdNeedsView
      client={client} targetAllocation={targetAllocation} needs={needs} now={now} itemCount={items.length} hasStrategy={hasStrategy}
      onExplore={() => { setNeedContext(null); setView('explorar'); }}
      onPickClass={(cls) => { setNeedContext(cls); setView('explorar'); }}
      onOpenCarteira={() => setView('carteira')}
      onEditStrategy={editStrategy}
      onOpenClient={onOpenClient}
    />
  );
}

window.ProductJourney = ProductJourney;
window.prodCompact = prodCompact;

// US-10 — Hub centralizado de produtos: catálogo denso, filtros, comparação e
// entrada "produto-primeiro" para a jornada de Produtos e Carteira Proposta
// (EP-02). Duas portas de entrada complementares (ver GOVERNANCA.md):
//   Produto(s) → Cliente → Detalhe/Configuração → Carteira Proposta → … → Ordens
//   Cliente → Carteira → Produtos (ponte na ficha do cliente)
// Nenhuma passa pelo Simulador — a carteira-alvo (Nível 3) é só um contexto
// opcional que enriquece a mesma jornada quando existe.

function ProdKpiCard({ value, label, accent }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-4 py-3">
      <div className={window.PortalLib.classNames('text-2xl font-semibold', accent === 'brand' ? 'text-brand' : accent === 'alert' ? 'text-alert' : 'text-neutral-900')}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400 mt-0.5">{label}</div>
    </div>
  );
}

function ProdSelect({ value, onChange, label, options, raw, className }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={window.PortalLib.classNames('text-sm border border-neutral-200 rounded-pill px-3 py-1.5', className)}>
      <option value="">{label}</option>
      {options.map((o) => (raw ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
    </select>
  );
}

function ProdFact({ label, value }) {
  return (
    <div className="rounded-large border border-neutral-100 p-3">
      <div className="text-[11px] text-neutral-400">{label}</div>
      <div className="text-sm font-medium text-neutral-900">{value}</div>
    </div>
  );
}

// Seletor de cliente — porta "Produto(s) → Cliente" do catálogo (e do drawer
// de detalhe). Mesmo padrão de busca por nome/CPF-CNPJ do resto do Portal.
function ProdClientPickerModal({ clients, title, onSelect, onClose }) {
  const { maskDocument, onlyDigits } = window.PortalLib;
  const [q, setQ] = React.useState('');
  const query = q.trim().toLowerCase();
  const queryDigits = onlyDigits(query);
  const filtered = clients.filter((c) => {
    if (!query) return true;
    const nameMatch = c.name.toLowerCase().indexOf(query) !== -1;
    const docMatch = queryDigits.length > 0 && onlyDigits(c.cpfCnpj).indexOf(queryDigits) !== -1;
    return nameMatch || docMatch;
  });
  return (
    <Modal title={title || 'Selecionar cliente'} onClose={onClose} width="max-w-lg">
      <input
        value={q} onChange={(e) => setQ(e.target.value)} autoFocus
        placeholder="Buscar por nome ou CPF/CNPJ…"
        className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-1.5 mb-3"
      />
      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50 border border-neutral-100 rounded-large">
        {filtered.length === 0 && <div className="px-4 py-6 text-sm text-neutral-400 text-center">Nenhum cliente encontrado.</div>}
        {filtered.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-neutral-50">
            <div className="min-w-0">
              <div className="text-sm font-medium text-neutral-900 truncate">{c.name}</div>
              <div className="text-xs text-neutral-400">{maskDocument(c.cpfCnpj)} · {c.segment}</div>
            </div>
            <Icon name="chevronRight" size={15} className="text-neutral-300 shrink-0" />
          </button>
        ))}
      </div>
    </Modal>
  );
}

// Drawer de detalhe (Nível 1 — sem cliente): só características do produto.
// Elegibilidade, taxa negociável e impacto na carteira exigem anexar um
// cliente — daí o CTA único que leva ao mesmo seletor do multi-select.
// Fase 8 — seletor de cliente inline (sem modal): campo de busca com lista de
// sugestões dentro do próprio drawer, substituindo o antigo botão que abria o
// ProdClientPickerModal por cima de tudo.
function ProdInlineClientPicker({ clients, value, onSelect }) {
  const { onlyDigits, maskDocument } = window.PortalLib;
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const selected = clients.find((c) => c.id === value) || null;
  const query = q.trim().toLowerCase();
  const queryDigits = onlyDigits(query);
  const filtered = clients.filter((c) => {
    if (!query) return true;
    const nameMatch = c.name.toLowerCase().indexOf(query) !== -1;
    const docMatch = queryDigits.length > 0 && onlyDigits(c.cpfCnpj).indexOf(queryDigits) !== -1;
    return nameMatch || docMatch;
  }).slice(0, 8);

  return (
    <div className="relative">
      <input
        value={open ? q : (selected ? selected.name : '')}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Busque por nome ou CPF/CNPJ…"
        className="w-full text-sm border border-neutral-200 rounded-medium px-3 py-2"
      />
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-neutral-100 rounded-medium shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 && <div className="px-3 py-2.5 text-sm text-neutral-400">Nenhum cliente encontrado.</div>}
          {filtered.map((c) => (
            <button
              key={c.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(c.id); setQ(''); setOpen(false); }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-50"
            >
              <span className="text-sm font-medium text-neutral-900 truncate">{c.name}</span>
              <span className="text-xs text-neutral-400 shrink-0">{maskDocument(c.cpfCnpj)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Fase 8 — Detalhe/Configuração de 1 ativo num único painel, sem modal
// separado: o cliente é escolhido inline (ProdInlineClientPicker) e, assim que
// escolhido, o MESMO drawer revela condições da operação e impacto na
// carteira in-place (ProdDetailBody, reaproveitado de ProductJourney.jsx —
// escopo global compartilhado, mesmo padrão do resto do Portal). Até lá, só
// as características (Nível 1) aparecem e "Adicionar à carteira" fica
// desabilitado — regra de negócio do mockup de referência.
function ProductDetailDrawer({ product, clients, cart, strategies, positions, productMap, now, onClose, onAttachCartClient, onUpdateCart, onSubmitRecommendation, onSent }) {
  const { PRODUCT_RISK_LABELS, formatCurrency, formatDate, PRODUCT_STATUS_META, productStatus, segmentLabel } = window.PortalLib;
  const status = PRODUCT_STATUS_META[productStatus(product)];

  // Carrinho já EM CONSTRUÇÃO (com itens) pré-preenche o cliente; um carrinho
  // vazio não "sequestra" a escolha (mesma regra da Fase D/6).
  const [clientId, setClientId] = React.useState((cart && cart.items.length > 0) ? cart.clientId : '');

  const client = clients.find((c) => c.id === clientId) || null;
  const cartItems = (cart && cart.clientId === clientId) ? cart.items : [];
  const strategy = clientId ? strategies.find((s) => s.clientId === clientId) : null;
  const targetAllocation = (strategy && strategy.targetAllocation) || {};
  const hasStrategy = Object.keys(targetAllocation).length > 0;
  const clientPositions = clientId ? positions.filter((p) => p.clientId === clientId) : [];

  let needs = null;
  if (client) {
    const selectedByClass = {};
    cartItems.forEach((it) => { const p = productMap[it.productId]; if (p) selectedByClass[p.class] = (selectedByClass[p.class] || 0) + (it.value || 0); });
    needs = window.PortalAnalytics.strategyNeeds(targetAllocation, clientPositions, client.availableBalance, selectedByClass);
  }

  function selectClient(id) {
    setClientId(id);
    onAttachCartClient(id);
  }

  // Fase 9 — envia direto (sem "tem certeza?"): a Regra de negócio do mockup só
  // pede cliente + condições preenchidas, não um passo extra de confirmação.
  // Avisa o pai (onSent) pra trocar o conteúdo da página inteira pelo Confirmar
  // Envio — fecha o drawer, já que a página toda muda de propósito.
  function submitItems(nextItems) {
    const recItems = nextItems.map((it) => {
      const p = productMap[it.productId];
      const rateLabel = p.negotiable ? (p.rateUnit === 'IPCA+' ? `IPCA + ${String(it.rate).replace('.', ',')}%` : `${it.rate}${p.rateUnit}`) : '—';
      return { productId: it.productId, asset: p.name, class: p.class, value: it.value, rate: rateLabel, status: 'validado' };
    });
    const total = nextItems.reduce((s, it) => s + it.value, 0);
    const recId = onSubmitRecommendation(clientId, recItems, total);
    onClose();
    onSent({ client, items: nextItems, recId: recId || 'REC-' + Math.floor(10000 + Math.random() * 900), total });
  }

  function handleAdd(p, value, rate) {
    const have = new Set(cartItems.map((it) => it.productId));
    const next = have.has(p.id)
      ? cartItems.map((it) => (it.productId === p.id ? { ...it, value, rate } : it))
      : [...cartItems, { productId: p.id, value, rate }];
    onUpdateCart(clientId, next);
    submitItems(next);
  }

  return (
      <Drawer title={product.name} subtitle={`${product.class} · ${product.subclass}`} onClose={onClose} width="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <StatusPill label={status.label} className={status.className} size="sm" />
          {product.rateUpdated && <span className="text-xs text-neutral-400">antes {product.previousRateLabel}</span>}
        </div>

        {!product.available && (
          <div className="flex items-start gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2.5 mb-4">
            <Icon name="alertTriangle" size={15} className="mt-0.5 shrink-0" />
            {product.unavailableReason || 'Produto indisponível para novas aplicações.'}
          </div>
        )}

        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Para continuar selecione um cliente</div>
          <ProdInlineClientPicker clients={clients} value={clientId} onSelect={selectClient} />
        </div>

        {client && (
          <div className="border border-neutral-100 rounded-large divide-y divide-neutral-50 mb-4">
            <div className="flex items-center justify-between px-4 py-2 text-sm"><span className="text-neutral-500">Conta Inter</span><span className="font-medium text-neutral-900">{client.account}</span></div>
            <div className="flex items-center justify-between px-4 py-2 text-sm"><span className="text-neutral-500">Saldo</span><span className="font-medium text-neutral-900">{formatCurrency(client.availableBalance)}</span></div>
            <div className="flex items-center justify-between px-4 py-2 text-sm"><span className="text-neutral-500">Perfil</span><span className="font-medium text-neutral-900">{client.riskProfile}</span></div>
            <div className="flex items-center justify-between px-4 py-2 text-sm"><span className="text-neutral-500">Relacionamento</span><span className="font-medium text-neutral-900">{segmentLabel(client.segment)}</span></div>
          </div>
        )}

        {!client ? (
          <React.Fragment>
            <p className="text-sm text-neutral-700 mb-4">{product.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ProdFact label="Emissor" value={product.issuer} />
              <ProdFact label="Indexador" value={product.indexer} />
              <ProdFact label="Taxa" value={product.rateLabel} />
              <ProdFact label="Vencimento" value={product.maturityDate ? formatDate(product.maturityDate) : 'Sem vencimento'} />
              <ProdFact label="Liquidez" value={product.liquidity} />
              <ProdFact label="Rating" value={product.rating} />
              <ProdFact label="Aplicação mínima" value={formatCurrency(product.minApplication)} />
              <ProdFact label="Risco" value={PRODUCT_RISK_LABELS[product.riskLevel]} />
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Público elegível</div>
              <div className="flex flex-wrap gap-1.5">
                {product.eligibleSegments.map((s) => (
                  <StatusPill key={s} label={s} className="bg-neutral-100 text-neutral-600" size="sm" />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Riscos</div>
              <p className="text-sm text-neutral-700">{product.risks}</p>
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Custos</div>
              <p className="text-sm text-neutral-700">{product.costs}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="text-sm px-5 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Voltar</button>
              <button disabled title="Selecione um cliente para continuar" className="text-sm px-5 py-2 rounded-pill bg-neutral-200 text-neutral-400 cursor-not-allowed">Adicionar à carteira</button>
            </div>
          </React.Fragment>
        ) : (
          <div className="space-y-4">
            <ProdDetailBody
              product={product} client={client} targetAllocation={targetAllocation} positions={clientPositions}
              items={cartItems} productMap={productMap} needs={needs} now={now} hasStrategy={hasStrategy}
              onAdd={handleAdd} onBack={onClose} backLabel="Fechar" compact
            />
          </div>
        )}
      </Drawer>
  );
}

// Fase 10 — Comparar investimentos com cliente inline (sem modal separado):
// mesmo padrão do ProdInlineClientPicker do drawer de 1 ativo (Fase 8),
// aplicado à porta catálogo→Comparar. Enquanto não há cliente escolhido, só o
// seletor aparece; assim que escolhido, revela a tabela de comparação
// (ProdCompareView, compartilhada com a porta cliente-primeiro) in-place.
function ProdCompareInline({ clients, cart, compareIds, productMap, positions, strategies, now, onAttachCartClient, onUpdateCart, onBack }) {
  const [clientId, setClientId] = React.useState((cart && cart.items.length > 0) ? cart.clientId : '');
  const client = clients.find((c) => c.id === clientId) || null;
  const cartItems = (cart && cart.clientId === clientId) ? cart.items : [];
  const strategy = clientId ? strategies.find((s) => s.clientId === clientId) : null;
  const targetAllocation = (strategy && strategy.targetAllocation) || {};
  const clientPositions = clientId ? positions.filter((p) => p.clientId === clientId) : [];
  const compareProducts = compareIds.map((id) => productMap[id]).filter(Boolean);

  function selectClient(id) {
    setClientId(id);
    onAttachCartClient(id);
  }

  function handleAdd(list) {
    const have = new Set(cartItems.map((it) => it.productId));
    const next = [...cartItems, ...list.filter((p) => !have.has(p.id)).map((p) => ({ productId: p.id, value: p.minApplication, rate: p.rateValue }))];
    onUpdateCart(clientId, next);
    onBack();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Comparar investimentos</h1>
          <p className="text-sm text-neutral-500 mt-1">Compare as principais condições antes de adicionar ativos à recomendação.</p>
        </div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-brand flex items-center gap-1 shrink-0"><Icon name="arrowLeft" size={15} /> Voltar</button>
      </div>

      <div className="max-w-md">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Para continuar selecione um cliente</div>
        <ProdInlineClientPicker clients={clients} value={clientId} onSelect={selectClient} />
      </div>

      <ProdCompareView
        compareProducts={compareProducts} client={client} targetAllocation={targetAllocation} positions={clientPositions}
        items={cartItems} productMap={productMap} now={now}
        onAdd={handleAdd} onBack={onBack} hideHeader
      />
    </div>
  );
}

// Fase D — carrinho em construção: aparece no catálogo real quando já existe um
// cliente anexado com itens, permitindo continuar comprando sem repetir o
// seletor de cliente (mockup "caso de uso de múltiplos ativos").
function ProdCartBar({ cart, client, onOpenCart, onClear }) {
  if (!client) return null;
  const { formatCurrency } = window.PortalLib;
  const count = cart.items.length;
  const total = cart.items.reduce((s, it) => s + (it.value || 0), 0);
  return (
    <div className="flex items-center gap-3 bg-brand-lightest border border-brand/20 rounded-large px-4 py-2.5">
      <Icon name="briefcase" size={16} className="text-brand shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-medium text-brand-dark truncate">Carteira em construção — {client.name}</div>
        <div className="text-xs text-neutral-500">{count} {count === 1 ? 'produto selecionado' : 'produtos selecionados'} · {formatCurrency(total)}</div>
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button onClick={onClear} className="text-xs text-neutral-500 hover:text-neutral-800 px-2">Encerrar carrinho</button>
        <button onClick={onOpenCart} className="text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark">Ver carteira proposta</button>
      </div>
    </div>
  );
}

// EP-02 — inbox de handoff: estratégias definidas no Simulador (com carteira-alvo)
// prontas para serem implementadas na jornada de Produtos (Nível 3).
function ProdStrategyInbox({ strategies, clients, onStartRecommendation }) {
  const { formatCurrency, SIMULATION_STATUS_META } = window.PortalLib;
  if (!strategies || !strategies.length) return null;
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="target" size={16} className="text-brand" />
        <h2 className="text-sm font-semibold text-neutral-800">Estratégias prontas para implementar</h2>
        <span className="text-xs text-neutral-400">definidas no Simulador</span>
      </div>
      <div className="space-y-2">
        {strategies.map((s) => {
          const cli = clients.find((c) => c.id === s.clientId);
          if (!cli) return null;
          const st = SIMULATION_STATUS_META[s.status] || { label: s.status, className: 'bg-neutral-100 text-neutral-600' };
          return (
            <div key={s.id} className="flex flex-wrap items-center gap-3 border border-neutral-100 rounded-large px-4 py-3 hover:border-brand/40">
              <div className="min-w-[200px]">
                <div className="font-medium text-neutral-900">{cli.name}</div>
                <div className="text-xs text-neutral-400">{s.name}</div>
              </div>
              <StatusPill label={st.label} className={st.className} size="sm" />
              <div className="text-xs text-neutral-500">Disponível <span className="font-medium text-neutral-800">{formatCurrency(cli.availableBalance)}</span></div>
              <button onClick={() => onStartRecommendation(s.id)} className="ml-auto text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark whitespace-nowrap">Implementar em Produtos</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductsPage({ profile, clients, products, now, initialFilters, strategies, positions, cart, onClearCart, onStartRecommendation, onEnterCatalogFlow, onAttachCartClient, onUpdateCart, onSubmitRecommendation, onGoOrders }) {
  const { formatCurrency, formatDate, daysUntil, canAccess, classNames, PROD_CLASS_TABS, PRODUCT_STATUS_META, productStatus, strategyClassLabel } = window.PortalLib;
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState((initialFilters && initialFilters.klass) || '');
  const [subclass, setSubclass] = React.useState('');
  const [indexer, setIndexer] = React.useState('');
  const [issuer, setIssuer] = React.useState('');
  const [liquidity, setLiquidity] = React.useState('');
  const [risk, setRisk] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [fgc, setFgc] = React.useState('');
  const [maturityBucket, setMaturityBucket] = React.useState('');
  const [minBucket, setMinBucket] = React.useState('');
  const [openProductId, setOpenProductId] = React.useState(null);
  const [checked, setChecked] = React.useState([]);
  const [picker, setPicker] = React.useState(null); // { productIds, mode: 'add' }
  // Fase 10 — ids em comparação (porta catálogo→Comparar, cliente inline).
  const [compareIds, setCompareIds] = React.useState(null);
  // Fase 9 — Confirmar Envio é página cheia: quando o drawer de 1 ativo envia
  // uma recomendação, a página inteira troca de conteúdo (não é mais modal).
  const [sentRecommendation, setSentRecommendation] = React.useState(null); // { client, items, recId, total }

  const loading = window.useSimulatedLoading(`${profile.id}|${query}|${tab}`, 280);

  const productMap = {};
  products.forEach((p) => (productMap[p.id] = p));

  if (sentRecommendation) {
    const finish = () => {
      setSentRecommendation(null);
      onClearCart();
      onGoOrders();
    };
    return (
      <ProdConfirmPage
        client={sentRecommendation.client} items={sentRecommendation.items} recId={sentRecommendation.recId} total={sentRecommendation.total}
        onViewRecommendation={finish} onGoOrders={finish}
      />
    );
  }

  if (compareIds) {
    return (
      <ProdCompareInline
        clients={clients} cart={cart} compareIds={compareIds} productMap={productMap} positions={positions} strategies={strategies} now={now}
        onAttachCartClient={onAttachCartClient} onUpdateCart={onUpdateCart}
        onBack={() => setCompareIds(null)}
      />
    );
  }

  if (!canAccess(profile, 'products')) {
    return <window.NoPermissionState title="Sem permissão para o hub de produtos" description="Este perfil não tem acesso ao catálogo de produtos neste cenário." />;
  }

  const tabDef = PROD_CLASS_TABS.find((t) => t.key === tab) || PROD_CLASS_TABS[0];
  const subclasses = Array.from(new Set(products.map((p) => p.subclass))).sort();
  const indexers = Array.from(new Set(products.map((p) => p.indexer).filter((x) => x && x !== '—'))).sort();
  const issuers = Array.from(new Set(products.map((p) => p.issuer))).sort();
  const liquidities = Array.from(new Set(products.map((p) => p.liquidity))).sort();
  const ratings = Array.from(new Set(products.map((p) => p.rating))).sort();

  function maturityYear(p) { return p.maturityDate ? parseInt(p.maturityDate.slice(0, 4), 10) : null; }
  function matchesMaturityBucket(p) {
    if (!maturityBucket) return true;
    const y = maturityYear(p);
    if (maturityBucket === 'none') return !y;
    if (maturityBucket === '<=2027') return y != null && y <= 2027;
    if (maturityBucket === '2028-2030') return y != null && y >= 2028 && y <= 2030;
    if (maturityBucket === '2031+') return y != null && y >= 2031;
    return true;
  }
  function matchesMinBucket(p) {
    if (!minBucket) return true;
    if (minBucket === '<=1000') return p.minApplication <= 1000;
    if (minBucket === '1000-10000') return p.minApplication > 1000 && p.minApplication <= 10000;
    if (minBucket === '10000+') return p.minApplication > 10000;
    return true;
  }

  const filtered = products.filter((p) => {
    if (tabDef.classes && tabDef.classes.indexOf(p.class) === -1) return false;
    if (subclass && p.subclass !== subclass) return false;
    if (indexer && p.indexer !== indexer) return false;
    if (issuer && p.issuer !== issuer) return false;
    if (liquidity && p.liquidity !== liquidity) return false;
    if (risk && String(p.riskLevel) !== risk) return false;
    if (rating && p.rating !== rating) return false;
    if (fgc === 'sim' && !p.fgc) return false;
    if (fgc === 'nao' && p.fgc) return false;
    if (!matchesMaturityBucket(p)) return false;
    if (!matchesMinBucket(p)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!(p.name.toLowerCase().includes(q) || p.issuer.toLowerCase().includes(q) || (p.indexer || '').toLowerCase().includes(q) || (p.rateLabel || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // KPIs — números reais derivados do catálogo e da base de clientes no escopo
  // do perfil (não são ilustrativos: um catálogo de ~30 produtos não finge ter
  // centenas — "Taxa" fica coberta pela busca acima, não é filtro à parte).
  const kAvailable = products.filter((p) => p.available).length;
  const kOpportunities = products.filter((p) => p.rateUpdated || p.lowStock).length;
  const kBalance = clients.reduce((s, c) => s + (c.availableBalance || 0), 0);
  const kMaturitySoon = products.filter((p) => { const d = daysUntil(p.maturityDate, now); return d != null && d >= 0 && d <= 548; }).length; // ~18 meses
  const kAlerts = products.filter((p) => p.lowStock || !p.available).length;

  const openProduct = products.find((p) => p.id === openProductId) || null;

  const cartClient = cart ? clients.find((c) => c.id === cart.clientId) : null;

  function toggleCheck(id) { setChecked((prev) => (prev.indexOf(id) !== -1 ? prev.filter((x) => x !== id) : [...prev, id])); }
  function toggleAll(ids, next) { setChecked(next ? ids : []); }
  // Fase D — com um carrinho já EM CONSTRUÇÃO (cliente anexado + pelo menos 1
  // item), seguir adicionando não repete o seletor: vai direto pro mesmo
  // cliente do carrinho. Um cliente anexado mas ainda sem itens (ex.: só abriu
  // o Detalhe e voltou) não deve "sequestrar" a próxima seleção — o seletor
  // continua livre pra escolher qualquer cliente nesse caso.
  function openPicker(productIds) {
    setChecked([]);
    setOpenProductId(null);
    if (cart && cart.clientId && cart.items.length > 0) { onEnterCatalogFlow(cart.clientId, productIds, 'add'); return; }
    setPicker({ productIds });
  }
  function confirmPicker(clientId) {
    const { productIds } = picker;
    setPicker(null);
    setChecked([]);
    setOpenProductId(null);
    onEnterCatalogFlow(clientId, productIds, 'add');
  }
  // Fase 10 — Comparar não abre mais o modal de cliente: entra direto na tela
  // de comparação, que resolve o cliente inline (ProdCompareInline).
  function openCompare(productIds) {
    setChecked([]);
    setOpenProductId(null);
    setCompareIds(productIds);
  }

  const columns = [
    { key: 'name', label: 'Produto', render: (p) => <span className="font-medium text-neutral-900">{p.name}</span> },
    { key: 'class', label: 'Classe', render: (p) => <span className="text-neutral-600">{strategyClassLabel(p.class)}</span> },
    { key: 'issuer', label: 'Emissor' },
    { key: 'rateLabel', label: 'Taxa', render: (p) => <span className="font-medium text-neutral-800">{p.rateLabel}</span> },
    { key: 'maturityDate', label: 'Vencimento', render: (p) => <span className="text-neutral-600">{p.maturityDate ? formatDate(p.maturityDate) : 'Sem venc.'}</span> },
    { key: 'liquidity', label: 'Liquidez' },
    { key: 'rating', label: 'Rating' },
    { key: 'minApplication', label: 'Mínimo', render: (p) => <span className="text-neutral-600">{formatCurrency(p.minApplication)}</span> },
    { key: 'availableStock', label: 'Disponível', render: (p) => <span className="text-neutral-700">{p.unlimitedStock ? 'Ilimitado' : formatCurrency(p.availableStock)}</span> },
    { key: 'status', label: 'Status', sortable: false, render: (p) => { const st = PRODUCT_STATUS_META[productStatus(p)]; return <StatusPill label={st.label} className={st.className} size="sm" />; } },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Produtos</h1>
        <p className="text-sm text-neutral-500 mt-1">Encontre oportunidades e construa recomendações de investimento para seus clientes.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ProdKpiCard value={kAvailable} label="Produtos disponíveis" />
        <ProdKpiCard value={kOpportunities} label="Oportunidades" accent="brand" />
        <ProdKpiCard value={formatCurrency(kBalance)} label="Saldo de clientes" />
        <ProdKpiCard value={kMaturitySoon} label="Vencimentos próximos" accent="brand" />
        <ProdKpiCard value={kAlerts} label="Produtos com alerta" accent="alert" />
      </div>

      {/* Busca + filtros */}
      <div className="bg-white border border-neutral-100 rounded-large px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px]">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por ativo, emissor, fundo, indexador ou taxa" className="w-full text-sm border border-neutral-200 rounded-pill pl-9 pr-3 py-1.5" />
          </div>
          <ProdSelect value={subclass} onChange={setSubclass} label="Produto" options={subclasses} />
          <ProdSelect value={indexer} onChange={setIndexer} label="Indexador" options={indexers} />
          <ProdSelect value={issuer} onChange={setIssuer} label="Emissor" options={issuers} className="max-w-[160px]" />
          <ProdSelect value={maturityBucket} onChange={setMaturityBucket} label="Vencimento" raw options={[['<=2027', 'Até 2027'], ['2028-2030', '2028–2030'], ['2031+', '2031+'], ['none', 'Sem vencimento']]} />
          <ProdSelect value={liquidity} onChange={setLiquidity} label="Liquidez" options={liquidities} className="max-w-[150px]" />
          <ProdSelect value={risk} onChange={setRisk} label="Risco" raw options={[['1', 'Muito baixo'], ['2', 'Baixo'], ['3', 'Moderado'], ['4', 'Alto'], ['5', 'Muito alto']]} />
          <ProdSelect value={rating} onChange={setRating} label="Rating" options={ratings} />
          <ProdSelect value={fgc} onChange={setFgc} label="FGC" raw options={[['sim', 'Sim'], ['nao', 'Não']]} />
          <ProdSelect value={minBucket} onChange={setMinBucket} label="Aplicação mínima" raw options={[['<=1000', 'Até R$ 1 mil'], ['1000-10000', 'R$ 1 mil – 10 mil'], ['10000+', 'Acima de R$ 10 mil']]} />
          <button className="ml-auto text-sm text-brand flex items-center gap-1.5 hover:underline whitespace-nowrap"><Icon name="star" size={14} /> Salvar filtro</button>
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-2.5">
          {PROD_CLASS_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={classNames('text-sm px-3 py-1 rounded-pill', tab === t.key ? 'bg-brand text-white' : 'text-neutral-500 hover:bg-neutral-100')}>{t.label}</button>
          ))}
        </div>
      </div>

      {cart && cart.items.length > 0 && cartClient && (
        <ProdCartBar cart={cart} client={cartClient} onOpenCart={() => onEnterCatalogFlow(cart.clientId, [], null)} onClear={onClearCart} />
      )}

      {checked.length > 0 && (
        <div className="flex items-center gap-3 bg-brand-lightest border border-brand/20 rounded-large px-4 py-2.5">
          <span className="text-sm font-medium text-brand-dark">{checked.length} {checked.length === 1 ? 'produto selecionado' : 'produtos selecionados'}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setChecked([])} className="text-xs text-neutral-500 hover:text-neutral-800 px-2">Limpar</button>
            <button onClick={() => openCompare(checked)} disabled={checked.length < 2} className={classNames('text-sm px-3 py-1.5 rounded-pill border', checked.length < 2 ? 'border-neutral-200 text-neutral-300 cursor-not-allowed' : 'border-neutral-200 text-neutral-700 hover:bg-white')}>Comparar</button>
            <button onClick={() => openPicker(checked)} className="text-sm px-4 py-1.5 rounded-pill bg-brand text-white hover:bg-brand-dark">Adicionar à carteira</button>
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-400">{filtered.length} de {products.length} produtos no catálogo</div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          keyField="id"
          emptyLabel="Nenhum produto para esses filtros."
          selectable
          selectedKeys={checked}
          onToggleSelect={toggleCheck}
          onToggleAll={toggleAll}
          onRowClick={(p) => setOpenProductId(p.id)}
          rowClassName={(p) => PRODUCT_STATUS_META[productStatus(p)].rowClassName}
        />
      )}

      {onStartRecommendation && <ProdStrategyInbox strategies={strategies} clients={clients} onStartRecommendation={onStartRecommendation} />}

      {openProduct && (
        <ProductDetailDrawer
          product={openProduct} clients={clients} cart={cart} strategies={strategies} positions={positions} productMap={productMap} now={now}
          onClose={() => setOpenProductId(null)}
          onAttachCartClient={onAttachCartClient} onUpdateCart={onUpdateCart}
          onSubmitRecommendation={onSubmitRecommendation} onSent={setSentRecommendation}
        />
      )}

      {picker && (
        <ProdClientPickerModal
          clients={clients}
          title="Selecionar cliente"
          onSelect={confirmPicker}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

window.ProductsPage = ProductsPage;

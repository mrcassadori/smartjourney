// US-10 — Hub centralizado de produtos: busca, filtros e elegibilidade
// contextual antes de entrar na conta de um cliente.

function ProductDetailDrawer({ product, client, now, onClose, onAddToProposal }) {
  const { PRODUCT_RISK_LABELS, formatCurrency, isEligible } = window.PortalLib;
  const elig = client ? isEligible(client, product, now) : null;

  return (
    <Drawer title={product.name} subtitle={`${product.class} · ${product.subclass}`} onClose={onClose}>
      {!product.available && (
        <div className="flex items-start gap-2 text-sm bg-alert-light text-alert-dark rounded-medium px-3 py-2.5 mb-4">
          <Icon name="alertTriangle" size={15} className="mt-0.5 shrink-0" />
          {product.unavailableReason || 'Produto indisponível para novas aplicações.'}
        </div>
      )}

      <p className="text-sm text-neutral-700 mb-4">{product.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-[11px] text-neutral-400">Emissor</div>
          <div className="text-sm font-medium text-neutral-900">{product.issuer}</div>
        </div>
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-[11px] text-neutral-400">Indexador</div>
          <div className="text-sm font-medium text-neutral-900">{product.indexer}</div>
        </div>
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-[11px] text-neutral-400">Prazo</div>
          <div className="text-sm font-medium text-neutral-900">{product.term}</div>
        </div>
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-[11px] text-neutral-400">Liquidez</div>
          <div className="text-sm font-medium text-neutral-900">{product.liquidity}</div>
        </div>
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-[11px] text-neutral-400">Aplicação mínima</div>
          <div className="text-sm font-medium text-neutral-900">{formatCurrency(product.minApplication)}</div>
        </div>
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-[11px] text-neutral-400">Risco</div>
          <div className="text-sm font-medium text-neutral-900">{PRODUCT_RISK_LABELS[product.riskLevel]}</div>
        </div>
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

      <div className="mb-4">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Custos</div>
        <p className="text-sm text-neutral-700">{product.costs}</p>
      </div>

      <div className="mb-5">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Documentos</div>
        <ul className="space-y-1">
          {product.docs.map((d) => (
            <li key={d} className="flex items-center gap-2 text-sm text-neutral-700">
              <Icon name="file" size={14} className="text-neutral-400" /> {d}
            </li>
          ))}
        </ul>
      </div>

      {client ? (
        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-neutral-500">Elegibilidade para {client.name}:</span>
            <StatusPill
              label={elig.eligible ? 'Elegível' : 'Não elegível'}
              className={elig.eligible ? 'bg-success-light text-success-dark' : 'bg-alert-light text-alert-dark'}
              size="sm"
            />
          </div>
          {!elig.eligible && (
            <ul className="text-xs text-alert-dark mb-3 space-y-0.5">
              {elig.reasons.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          )}
          <button
            disabled={!elig.eligible}
            onClick={() => onAddToProposal(client.id, product)}
            className={window.PortalLib.classNames(
              'text-sm px-4 py-2 rounded-pill text-white flex items-center gap-1.5',
              elig.eligible ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            )}
          >
            <Icon name="target" size={14} /> Adicionar à proposta de {client.name.split(' ')[0]}
          </button>
        </div>
      ) : (
        <div className="text-xs text-neutral-400 border-t border-neutral-100 pt-4">Selecione um cliente no topo da página para ver elegibilidade e adicionar este produto a uma proposta.</div>
      )}
    </Drawer>
  );
}

// EP-02 — inbox de handoff: estratégias definidas no Simulador (com carteira-alvo)
// prontas para serem implementadas na jornada de Produtos.
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

function ProductsPage({ profile, clients, products, now, initialFilters, strategies, onStartRecommendation, onAddToProposal }) {
  const { ASSET_CLASS_ORDER, PRODUCT_RISK_LABELS, formatCurrency, isEligible, canAccess } = window.PortalLib;
  const [query, setQuery] = React.useState('');
  const [klass, setKlass] = React.useState((initialFilters && initialFilters.klass) || '');
  const [risk, setRisk] = React.useState('');
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);
  const [clientId, setClientId] = React.useState('');
  const [openProductId, setOpenProductId] = React.useState(null);
  const loading = window.useSimulatedLoading(`${profile.id}|${query}|${klass}|${risk}|${onlyAvailable}`, 300);

  if (!canAccess(profile, 'products')) {
    return <window.NoPermissionState title="Sem permissão para o hub de produtos" description="Este perfil não tem acesso ao catálogo de produtos neste cenário." />;
  }

  const client = clients.find((c) => c.id === clientId) || null;

  const filtered = products.filter((p) => {
    if (klass && p.class !== klass) return false;
    if (risk && String(p.riskLevel) !== risk) return false;
    if (onlyAvailable && !p.available) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.issuer.toLowerCase().includes(q) || (p.indexer || '').toLowerCase().includes(q);
  });

  const openProduct = products.find((p) => p.id === openProductId) || null;

  return (
    <div className="space-y-4">
      {onStartRecommendation && <ProdStrategyInbox strategies={strategies} clients={clients} onStartRecommendation={onStartRecommendation} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Produtos</h1>
          <p className="text-sm text-neutral-500">{filtered.length} de {products.length} produtos no catálogo</p>
        </div>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 max-w-xs">
          <option value="">Ver elegibilidade para um cliente…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, emissor ou indexador…" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 w-72" />
        <select value={klass} onChange={(e) => setKlass(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todas as classes</option>
          {ASSET_CLASS_ORDER.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todos os riscos</option>
          {Object.entries(PRODUCT_RISK_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <label className="text-sm flex items-center gap-1.5 text-neutral-600 px-1">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} /> Só disponíveis
        </label>
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : filtered.length === 0 ? (
        <window.EmptyState icon="search" title="Nenhum produto para esses filtros" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const elig = client ? isEligible(client, p, now) : null;
            return (
              <button
                key={p.id}
                onClick={() => setOpenProductId(p.id)}
                className="text-left rounded-large border border-neutral-100 bg-white p-4 hover:border-brand/40 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <StatusPill label={p.class} className="bg-neutral-100 text-neutral-600" size="sm" />
                  {!p.available && <StatusPill label="Indisponível" className="bg-alert-light text-alert-dark" size="sm" />}
                  {client && elig && <StatusPill label={elig.eligible ? 'Elegível' : 'Não elegível'} className={elig.eligible ? 'bg-success-light text-success-dark' : 'bg-alert-light text-alert-dark'} size="sm" />}
                </div>
                <div className="font-medium text-neutral-900">{p.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{p.issuer} · {p.indexer}</div>
                <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
                  <span>Risco: {PRODUCT_RISK_LABELS[p.riskLevel]}</span>
                  <span>mín. {formatCurrency(p.minApplication)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {openProduct && (
        <ProductDetailDrawer
          product={openProduct}
          client={client}
          now={now}
          onClose={() => setOpenProductId(null)}
          onAddToProposal={onAddToProposal}
        />
      )}
    </div>
  );
}

window.ProductsPage = ProductsPage;

// Modal de busca/seleção de produto — reaproveitado pelo Hub de produtos
// (US-10) e pelo Simulador (US-11) para adicionar itens a uma proposta.

function ProductPicker({ products, client, now, excludeIds, onSelect, onClose }) {
  const { ASSET_CLASS_ORDER, PRODUCT_RISK_LABELS, formatCurrency, isEligible } = window.PortalLib;
  const [query, setQuery] = React.useState('');
  const [klass, setKlass] = React.useState('');
  const excluded = excludeIds || [];

  const filtered = products.filter((p) => {
    if (excluded.indexOf(p.id) !== -1) return false;
    if (klass && p.class !== klass) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.issuer.toLowerCase().includes(q) || (p.indexer || '').toLowerCase().includes(q);
  });

  return (
    <Modal title="Adicionar produto à simulação" onClose={onClose} width="max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, emissor ou indexador…"
          className="flex-1 text-sm border border-neutral-200 rounded-pill px-3 py-1.5"
        />
        <select value={klass} onChange={(e) => setKlass(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Todas as classes</option>
          {ASSET_CLASS_ORDER.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="Nenhum produto encontrado" description="Ajuste a busca ou a classe selecionada." />
      ) : (
        <div className="divide-y divide-neutral-50 border border-neutral-100 rounded-large">
          {filtered.map((p) => {
            const elig = client ? isEligible(client, p, now) : null;
            const disabled = elig && !elig.eligible;
            return (
              <button
                key={p.id}
                disabled={disabled}
                onClick={() => onSelect(p)}
                title={disabled ? elig.reasons.join(' ') : undefined}
                className={window.PortalLib.classNames(
                  'w-full text-left px-4 py-3 flex items-center justify-between gap-3',
                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'
                )}
              >
                <div className="min-w-0">
                  <div className="font-medium text-neutral-900 truncate">{p.name}</div>
                  <div className="text-xs text-neutral-400">{p.class} · {p.issuer} · risco {PRODUCT_RISK_LABELS[p.riskLevel]} · aplicação mín. {formatCurrency(p.minApplication)}</div>
                  {elig && !elig.eligible && <div className="text-[11px] text-alert-dark mt-0.5">{elig.reasons[0]}</div>}
                </div>
                {elig && (
                  <StatusPill
                    label={elig.eligible ? 'Elegível' : 'Não elegível'}
                    className={elig.eligible ? 'bg-success-light text-success-dark' : 'bg-alert-light text-alert-dark'}
                    size="sm"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

window.ProductPicker = ProductPicker;

// Hub de Recomendações: aba "Propostas" (lista de simulações, entrada do
// US-11) e aba "Basket" (US-13, recomendação em lote).

function NewSimulationModal({ clients, onCreate, onClose }) {
  const [clientId, setClientId] = React.useState('');
  return (
    <Modal
      title="Nova simulação"
      onClose={onClose}
      footer={
        <React.Fragment>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
          <button
            disabled={!clientId}
            onClick={() => clientId && onCreate(clientId)}
            className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill text-white', clientId ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}
          >
            Criar simulação
          </button>
        </React.Fragment>
      }
    >
      <label className="text-sm text-neutral-600 block mb-2">Para qual cliente é esta proposta?</label>
      <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
        <option value="">Selecione um cliente…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </Modal>
  );
}

function ProposalsTab({ clients, simulations, products, onOpenSimulation, onNewSimulation }) {
  const { formatCurrency, formatDateTime, SIMULATION_STATUS_META } = window.PortalLib;
  const [showNew, setShowNew] = React.useState(false);
  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));

  const columns = [
    { key: 'clientName', label: 'Cliente', render: (s) => (clientMap[s.clientId] ? clientMap[s.clientId].name : s.clientId) },
    { key: 'name', label: 'Proposta' },
    { key: 'status', label: 'Status', render: (s) => <StatusPill label={SIMULATION_STATUS_META[s.status].label} className={SIMULATION_STATUS_META[s.status].className} size="sm" /> },
    { key: 'total', label: 'Valor total', render: (s) => formatCurrency(s.items.reduce((sum, it) => sum + it.allocatedValue, 0)) },
    { key: 'createdBy', label: 'Criada por' },
    { key: 'updatedAt', label: 'Atualizada em', render: (s) => formatDateTime(s.updatedAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{simulations.length} proposta{simulations.length === 1 ? '' : 's'} no seu escopo</p>
        <button onClick={() => setShowNew(true)} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white flex items-center gap-1.5">
          <Icon name="target" size={14} /> Nova simulação
        </button>
      </div>

      {simulations.length === 0 ? (
        <window.EmptyState icon="target" title="Nenhuma proposta ainda" description="Crie uma simulação a partir de um cliente para começar." />
      ) : (
        <DataTable columns={columns} rows={simulations} keyField="id" onRowClick={(s) => onOpenSimulation(s.id)} />
      )}

      {showNew && <NewSimulationModal clients={clients} onCreate={(clientId) => { setShowNew(false); onNewSimulation(clientId); }} onClose={() => setShowNew(false)} />}
    </div>
  );
}

function BasketTab({ profile, clients, products, now, onSendBasket }) {
  const { formatCurrency, isEligible, OWNER_NAME_MAP } = window.PortalLib;
  const [productId, setProductId] = React.useState('');
  const [segment, setSegment] = React.useState('');
  const [onlyWithCash, setOnlyWithCash] = React.useState(true);
  const [selected, setSelected] = React.useState({}); // clientId -> allocatedValue
  const [confirmSend, setConfirmSend] = React.useState(false);
  const [sentSummary, setSentSummary] = React.useState(null);

  const product = products.find((p) => p.id === productId) || null;

  const candidateClients = clients.filter((c) => (!segment || c.segment === segment) && (!onlyWithCash || c.investableCashEstimate > 0));

  function toggle(client, elig) {
    if (!elig.eligible) return;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[client.id] !== undefined) delete next[client.id];
      else next[client.id] = Math.max(product.minApplication, 0);
      return next;
    });
  }

  function setValue(clientId, value) {
    setSelected((prev) => ({ ...prev, [clientId]: value }));
  }

  const selectedEntries = Object.entries(selected);
  const invalidEntries = product ? selectedEntries.filter(([cid, value]) => {
    const c = clients.find((x) => x.id === cid);
    return value < product.minApplication || value > c.investableCashEstimate;
  }) : [];
  const totalValue = selectedEntries.reduce((s, [, v]) => s + v, 0);

  function handleConfirmSend() {
    const items = selectedEntries.map(([clientId, value]) => ({ clientId, value }));
    onSendBasket(product, items);
    setSentSummary({ count: items.length, total: totalValue, productName: product.name });
    setSelected({});
    setProductId('');
  }

  if (!profile.permissions.canCreateBasket) {
    return (
      <window.NoPermissionState
        title="Seu perfil não pode criar recomendações em lote"
        description="Basket é restrito a Alocador e Administrador neste cenário. Fale com um alocador do seu escritório para enviar em lote."
      />
    );
  }

  if (sentSummary) {
    return (
      <window.EmptyState
        icon="check"
        title="Basket enviado (simulado)"
        description={`${sentSummary.count} cliente(s) receberam ordens de aplicação em "${sentSummary.productName}", totalizando ${formatCurrency(sentSummary.total)}. Acompanhe na Central de ordens.`}
        action={<button onClick={() => setSentSummary(null)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200">Montar outro basket</button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-large border border-neutral-100 p-4">
        <label className="text-sm font-medium text-neutral-800 block mb-2">1. Escolha o produto do basket</label>
        <select value={productId} onChange={(e) => { setProductId(e.target.value); setSelected({}); }} className="w-full sm:w-96 text-sm border border-neutral-200 rounded-pill px-3 py-2">
          <option value="">Selecione um produto…</option>
          {products.filter((p) => p.available).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {product && (
        <React.Fragment>
          <div className="bg-white rounded-large border border-neutral-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-800">2. Selecione os clientes elegíveis</label>
              <div className="flex items-center gap-2">
                <select value={segment} onChange={(e) => setSegment(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
                  <option value="">Todos os segmentos</option>
                  <option value="Standard">Standard</option>
                  <option value="High">High</option>
                  <option value="Private">Private</option>
                  <option value="Corporate">Corporate</option>
                </select>
                <label className="text-xs flex items-center gap-1.5 text-neutral-600">
                  <input type="checkbox" checked={onlyWithCash} onChange={(e) => setOnlyWithCash(e.target.checked)} /> Só com caixa disponível
                </label>
              </div>
            </div>

            <div className="divide-y divide-neutral-50 border border-neutral-100 rounded-large">
              {candidateClients.map((c) => {
                const elig = isEligible(c, product, now);
                const checked = selected[c.id] !== undefined;
                const invalid = checked && (selected[c.id] < product.minApplication || selected[c.id] > c.investableCashEstimate);
                return (
                  <div key={c.id} className={window.PortalLib.classNames('flex items-center justify-between gap-3 px-4 py-2.5', !elig.eligible && 'opacity-50')}>
                    <label className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input type="checkbox" disabled={!elig.eligible} checked={checked} onChange={() => toggle(c, elig)} />
                      <span className="min-w-0">
                        <span className="block text-sm text-neutral-900 truncate">{c.name}</span>
                        <span className="block text-[11px] text-neutral-400 truncate">
                          {c.segment} · {OWNER_NAME_MAP[c.ownerId] || c.ownerId} · caixa {formatCurrency(c.investableCashEstimate)}
                          {!elig.eligible && ` · ${elig.reasons[0]}`}
                        </span>
                      </span>
                    </label>
                    {checked && (
                      <input
                        type="number"
                        value={selected[c.id]}
                        onChange={(e) => setValue(c.id, Number(e.target.value) || 0)}
                        className={window.PortalLib.classNames('w-32 text-sm border rounded-pill px-3 py-1.5 text-right shrink-0', invalid ? 'border-alert text-alert-dark' : 'border-neutral-200')}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-large border border-neutral-100 p-4">
            <label className="text-sm font-medium text-neutral-800 block mb-3">3. Prévia consolidada</label>
            <div className="flex items-center gap-6 text-sm mb-3">
              <div><span className="text-neutral-500">Clientes selecionados: </span><span className="font-medium text-neutral-900">{selectedEntries.length}</span></div>
              <div><span className="text-neutral-500">Valor total: </span><span className="font-medium text-neutral-900">{formatCurrency(totalValue)}</span></div>
            </div>
            {invalidEntries.length > 0 && (
              <div className="flex items-center gap-2 text-xs bg-alert-light text-alert-dark rounded-medium px-3 py-2 mb-3">
                <Icon name="alertTriangle" size={13} /> {invalidEntries.length} cliente(s) com valor abaixo da aplicação mínima ou acima do caixa disponível — corrija antes de enviar.
              </div>
            )}
            <button
              disabled={selectedEntries.length === 0 || invalidEntries.length > 0}
              onClick={() => setConfirmSend(true)}
              className={window.PortalLib.classNames(
                'text-sm px-4 py-2 rounded-pill text-white',
                selectedEntries.length === 0 || invalidEntries.length > 0 ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-brand'
              )}
            >
              Enviar basket (simulado)
            </button>
          </div>
        </React.Fragment>
      )}

      {confirmSend && (
        <ConfirmAction
          title="Enviar basket"
          description={`Isso cria uma ordem "aguardando aprovação" para cada um dos ${selectedEntries.length} clientes elegíveis, rastreável na Central de ordens. Nenhuma ordem real é enviada — tudo fica no estado local do protótipo.`}
          confirmLabel="Enviar basket"
          onConfirm={handleConfirmSend}
          onClose={() => setConfirmSend(false)}
        />
      )}
    </div>
  );
}

function RecommendationsPage({ profile, clients, simulations, products, now, onOpenSimulation, onNewSimulation, onSendBasket }) {
  const [tab, setTab] = React.useState('proposals');
  const { canAccess } = window.PortalLib;

  if (!canAccess(profile, 'recommendations')) {
    return <window.NoPermissionState title="Sem permissão para recomendações" description="Este perfil não monta propostas de investimento neste cenário." />;
  }
  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem recomendações para exibir" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Recomendações</h1>
        <p className="text-sm text-neutral-500">Monte propostas individuais ou recomendações em lote — tudo simulado.</p>
      </div>

      <nav className="flex gap-1 border-b border-neutral-100">
        <button onClick={() => setTab('proposals')} className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2', tab === 'proposals' ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500')}>
          Propostas
        </button>
        <button onClick={() => setTab('basket')} className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2', tab === 'basket' ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500')}>
          Basket
        </button>
      </nav>

      {tab === 'proposals' && <ProposalsTab clients={clients} simulations={simulations} products={products} onOpenSimulation={onOpenSimulation} onNewSimulation={onNewSimulation} />}
      {tab === 'basket' && <BasketTab profile={profile} clients={clients} products={products} now={now} onSendBasket={onSendBasket} />}
    </div>
  );
}

window.RecommendationsPage = RecommendationsPage;

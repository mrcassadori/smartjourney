// Tela 07 — Ponte entre o Cliente e o Simulador. Escolhe a intenção da
// recomendação (aplicar novo recurso / rebalancear / substituir) e entra na
// jornada de simulação com o cliente ativo. Não executa nenhuma operação.

const RECOMMENDATION_INTENTS = [
  { key: 'novo', title: 'Aplicar novo recurso', desc: 'Utilize o caixa disponível sem alterar os demais investimentos.', objectives: ['novo_aporte'] },
  { key: 'rebalancear', title: 'Rebalancear carteira', desc: 'Compare a alocação atual com uma nova distribuição.', objectives: ['rebalancear', 'diversificar'] },
  { key: 'substituir', title: 'Substituir investimentos', desc: 'Selecione posições existentes para simular novas alternativas.', objectives: ['rebalancear', 'comparar'] },
];

function NewRecommendationBridge({ client, onContinue, onClose }) {
  const { formatCurrency, RISK_PROFILE_META } = window.PortalLib;
  const [intent, setIntent] = React.useState('rebalancear');
  const risk = RISK_PROFILE_META[client.riskProfile] || { label: client.riskProfile, className: 'bg-neutral-100 text-neutral-600' };

  return (
    <Modal title="Nova recomendação" onClose={onClose} width="max-w-lg">
      <p className="text-sm text-neutral-500 -mt-1 mb-4">Construa uma proposta considerando a carteira atual, o perfil e os recursos disponíveis.</p>

      <div className="flex flex-wrap gap-x-5 gap-y-1 bg-neutral-50 rounded-large px-4 py-3 mb-4 text-sm">
        <div><span className="text-[11px] text-neutral-400 block">Cliente</span>{client.name}</div>
        <div><span className="text-[11px] text-neutral-400 block">Patrimônio</span>{formatCurrency(client.totalWealth)}</div>
        <div><span className="text-[11px] text-neutral-400 block">Perfil</span><StatusPill label={risk.label} className={risk.className} size="sm" /></div>
        <div><span className="text-[11px] text-neutral-400 block">Caixa investível</span>{formatCurrency(client.investableCashEstimate)}</div>
      </div>

      <div className="space-y-2">
        {RECOMMENDATION_INTENTS.map((opt) => {
          const active = intent === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setIntent(opt.key)}
              className={window.PortalLib.classNames('w-full flex items-start gap-3 text-left px-4 py-3 rounded-large border', active ? 'border-brand bg-brand-lightest' : 'border-neutral-200 hover:border-neutral-300')}
            >
              <span className={window.PortalLib.classNames('mt-0.5 w-4 h-4 rounded-full border-2 shrink-0', active ? 'border-brand bg-brand' : 'border-neutral-300')} />
              <span>
                <span className={window.PortalLib.classNames('text-sm block font-medium', active ? 'text-brand-dark' : 'text-neutral-800')}>{opt.title}</span>
                <span className="text-xs text-neutral-500">{opt.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-medium px-3 py-2 mt-4">
        <Icon name="info" size={14} className="mt-0.5 shrink-0" /> Esta simulação não executa nenhuma operação.
      </div>

      <div className="flex items-center justify-end gap-2 mt-5">
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Cancelar</button>
        <button
          onClick={() => onContinue(RECOMMENDATION_INTENTS.find((o) => o.key === intent))}
          className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5"
        >
          Continuar para simulador <Icon name="chevronRight" size={14} />
        </button>
      </div>
    </Modal>
  );
}

window.NewRecommendationBridge = NewRecommendationBridge;

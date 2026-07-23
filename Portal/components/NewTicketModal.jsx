// US-15 — Abertura de chamado de suporte, sempre a partir de um contexto
// (cliente, ordem, onboarding ou serviço operacional), nunca uma tela solta.

const TICKET_THEMES = ['Erro em ordem', 'Dúvida cadastral', 'Documento', 'Acesso/credenciais', 'Outro'];

function NewTicketModal({ client, contextType, contextId, contextLabel, suggestedTheme, onCreate, onClose }) {
  const { TICKET_CONTEXT_META } = window.PortalLib;
  const [theme, setTheme] = React.useState(suggestedTheme || TICKET_THEMES[0]);
  const [impact, setImpact] = React.useState('media');
  const [urgency, setUrgency] = React.useState('media');
  const [message, setMessage] = React.useState('');
  const [done, setDone] = React.useState(false);

  return (
    <Modal
      title="Abrir chamado de suporte"
      onClose={onClose}
      footer={
        done ? (
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill bg-neutral-900 text-white">Fechar</button>
        ) : (
          <React.Fragment>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
            <button
              disabled={!message.trim()}
              onClick={() => {
                onCreate({ theme, impact, urgency, message: message.trim() });
                setDone(true);
              }}
              className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill text-white', message.trim() ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}
            >
              Abrir chamado
            </button>
          </React.Fragment>
        )
      }
    >
      {done ? (
        <div className="flex items-center gap-2 text-success-dark">
          <Icon name="check" size={16} />
          Chamado registrado (simulado) — protocolo e prazo fictícios gerados automaticamente.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-neutral-500 bg-neutral-50 rounded-medium px-3 py-2">
            Contexto: {TICKET_CONTEXT_META[contextType].label}{contextLabel ? ` — ${contextLabel}` : ''} · Cliente: {client.name}
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Tema</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
              {TICKET_THEMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Impacto</label>
              <select value={impact} onChange={(e) => setImpact(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                <option value="alta">Alto</option>
                <option value="media">Médio</option>
                <option value="baixa">Baixo</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Urgência</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Descreva o que aconteceu</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2"
              placeholder="Cliente, conta e evidências relevantes já ficam anexados automaticamente pelo contexto."
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

window.NewTicketModal = NewTicketModal;
window.TICKET_THEMES = TICKET_THEMES;

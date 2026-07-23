// US-15 — Central de suporte: histórico de chamados abertos a partir de
// clientes, ordens, onboarding e serviços operacionais.

function RatingStars({ value, onChange, readOnly }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          className={window.PortalLib.classNames('text-lg leading-none', n <= value ? 'text-brand' : 'text-neutral-200', !readOnly && 'hover:text-brand-light')}
          aria-label={`${n} estrela(s)`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function TicketDrawer({ ticket, client, profile, onClose, onAddMessage, onResolve }) {
  const { TICKET_STATUS_META, TICKET_URGENCY_META, TICKET_IMPACT_META, TICKET_CONTEXT_META, formatDateTime } = window.PortalLib;
  const [reply, setReply] = React.useState('');
  const [ratingStep, setRatingStep] = React.useState(false);
  const [rating, setRating] = React.useState(5);

  return (
    <Drawer title={ticket.theme} subtitle={`${client.name} · protocolo ${ticket.protocol}`} onClose={onClose}>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <StatusPill label={TICKET_STATUS_META[ticket.status].label} className={TICKET_STATUS_META[ticket.status].className} />
        <StatusPill label={`Urgência ${TICKET_URGENCY_META[ticket.urgency].label}`} className={TICKET_URGENCY_META[ticket.urgency].className} size="sm" />
        <StatusPill label={`Impacto ${TICKET_IMPACT_META[ticket.impact].label}`} className="bg-neutral-100 text-neutral-600" size="sm" />
      </div>

      <div className="text-xs text-neutral-500 bg-neutral-50 rounded-medium px-3 py-2 mb-4">
        Contexto: {TICKET_CONTEXT_META[ticket.contextType].label}{ticket.contextId ? ` (${ticket.contextId})` : ''} · aberto em {formatDateTime(ticket.createdAt)} por {ticket.createdBy} · prazo {formatDateTime(ticket.dueAt)}
      </div>

      <h3 className="text-sm font-semibold text-neutral-800 mb-3">Histórico</h3>
      <div className="space-y-3 mb-4">
        {ticket.messages.map((m, i) => (
          <div key={i} className="rounded-large border border-neutral-100 p-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-medium text-neutral-700">{m.author}</span>
              <span>{formatDateTime(m.date)}</span>
            </div>
            <div className="text-sm text-neutral-800">{m.text}</div>
          </div>
        ))}
      </div>

      {ticket.status !== 'resolvido' && (
        <div className="space-y-2 mb-5">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Adicionar uma atualização ao chamado…"
            className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              disabled={!reply.trim()}
              onClick={() => {
                onAddMessage(ticket.id, reply.trim());
                setReply('');
              }}
              className={window.PortalLib.classNames('text-sm px-3 py-1.5 rounded-pill text-white', reply.trim() ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}
            >
              Enviar
            </button>
            <button onClick={() => setRatingStep(true)} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50">
              Marcar como resolvido
            </button>
          </div>
        </div>
      )}

      {ticket.status === 'resolvido' && (
        <div className="rounded-large border border-neutral-100 p-3">
          <div className="text-xs text-neutral-500 mb-1.5">Avaliação da resolução</div>
          <RatingStars value={ticket.rating || 0} readOnly />
        </div>
      )}

      {ratingStep && (
        <Modal
          title="Avaliar resolução"
          onClose={() => setRatingStep(false)}
          footer={
            <React.Fragment>
              <button onClick={() => setRatingStep(false)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
              <button
                onClick={() => {
                  onResolve(ticket.id, rating);
                  setRatingStep(false);
                }}
                className="text-sm px-4 py-2 rounded-pill bg-brand text-white"
              >
                Concluir chamado
              </button>
            </React.Fragment>
          }
        >
          <p className="mb-3">Como você avalia a resolução deste chamado?</p>
          <RatingStars value={rating} onChange={setRating} />
        </Modal>
      )}
    </Drawer>
  );
}

function SupportPage({ profile, clients, tickets, openTicketId, onOpenTicket, onCloseTicket, onAddMessage, onResolve }) {
  const { TICKET_STATUS_META, TICKET_URGENCY_META, formatDateTime } = window.PortalLib;
  const [theme, setTheme] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [urgency, setUrgency] = React.useState('');
  const loading = window.useSimulatedLoading(`${profile.id}|${theme}|${status}|${urgency}`, 300);

  if (profile.scopeType === 'none') {
    return <window.NoPermissionState title="Sem chamados para exibir" description="Este perfil não tem clientes vinculados no cenário atual." />;
  }

  const clientMap = {};
  clients.forEach((c) => (clientMap[c.id] = c));
  const scoped = tickets.filter((t) => clientMap[t.clientId]);
  const filtered = scoped.filter((t) => (!theme || t.theme === theme) && (!status || t.status === status) && (!urgency || t.urgency === urgency));

  const openTicket = scoped.find((t) => t.id === openTicketId) || null;

  const columns = [
    { key: 'clientName', label: 'Cliente', render: (t) => clientMap[t.clientId].name },
    { key: 'theme', label: 'Tema' },
    { key: 'protocol', label: 'Protocolo' },
    { key: 'urgency', label: 'Urgência', render: (t) => <StatusPill label={TICKET_URGENCY_META[t.urgency].label} className={TICKET_URGENCY_META[t.urgency].className} size="sm" /> },
    { key: 'status', label: 'Status', render: (t) => <StatusPill label={TICKET_STATUS_META[t.status].label} className={TICKET_STATUS_META[t.status].className} size="sm" /> },
    { key: 'dueAt', label: 'Prazo', render: (t) => formatDateTime(t.dueAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Central de suporte</h1>
          <p className="text-sm text-neutral-500">{filtered.length} chamado{filtered.length === 1 ? '' : 's'} no seu escopo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os temas</option>
            {(window.TICKET_THEMES || []).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todas as urgências</option>
            {Object.entries(TICKET_URGENCY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            {Object.entries(TICKET_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(t) => onOpenTicket(t.id)} emptyLabel="Nenhum chamado para esses filtros." />
      )}

      {openTicket && (
        <TicketDrawer
          ticket={openTicket}
          client={clientMap[openTicket.clientId]}
          profile={profile}
          onClose={onCloseTicket}
          onAddMessage={onAddMessage}
          onResolve={onResolve}
        />
      )}
    </div>
  );
}

window.SupportPage = SupportPage;

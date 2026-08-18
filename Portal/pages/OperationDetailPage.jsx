// Jornada de Operações — detalhe de uma operação (referência Figma "Jornada
// operações - alteração cadastral", node 280:29597). Página cheia (não
// drawer): cabeçalho com protocolo/SLA/ações, 3 abas (Visão geral/
// Documentos/Histórico), card "Próxima ação necessária" que muda conforme o
// status, e os sub-fluxos (validar documento, conversa, executar, concluir,
// escalar, reatribuir) como modais/drawer sobre a mesma página.
//
// Generalizado para os 9 tipos de operação (o Figma desenha só o exemplo de
// "Alteração cadastral"): as ações por status são as mesmas para qualquer
// tipo, só o rótulo/ícone do tipo muda.

const OPDET_TABS = [
  { key: 'geral', label: 'Visão geral' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'historico', label: 'Histórico' },
];

function OpDetInfoCard({ title, children, right }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-large p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-neutral-800">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function OpDetField({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 font-medium text-right">{value}</span>
    </div>
  );
}

function OpDetStepper({ status }) {
  const { OPERATION_STAGES, operationStageIndex } = window.PortalLib;
  const current = operationStageIndex(status);
  return (
    <div className="flex items-center">
      {OPERATION_STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={window.PortalLib.classNames(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2',
                  done ? 'bg-success text-white border-success' : active ? 'border-brand text-brand-dark bg-brand-lightest' : 'border-neutral-200 text-neutral-300'
                )}
              >
                {done ? <Icon name="check" size={13} /> : i + 1}
              </div>
              <span className={window.PortalLib.classNames('text-[11px] whitespace-nowrap', active ? 'text-brand-dark font-medium' : done ? 'text-neutral-600' : 'text-neutral-300')}>{s.label}</span>
            </div>
            {i < OPERATION_STAGES.length - 1 && <div className={window.PortalLib.classNames('h-0.5 flex-1 mx-1 mb-4', i < current ? 'bg-success' : 'bg-neutral-100')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------- Sub-fluxos (modais/drawer) ----------

function OpDetReassignModal({ operation, now, profile, onPatch, onClose }) {
  const { OPERATION_TEAM_MEMBERS } = window.PortalLib;
  const [pick, setPick] = React.useState(operation.responsavel);
  return (
    <Modal
      title="Reatribuir operação"
      onClose={onClose}
      footer={
        <React.Fragment>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
          <button
            disabled={pick === operation.responsavel}
            onClick={() => {
              onPatch(operation.id, { responsavel: pick, timeline: [...operation.timeline, { date: now, author: profile.name, detail: `Reatribuída de ${operation.responsavel} para ${pick}.` }] });
              onClose();
            }}
            className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill text-white', pick !== operation.responsavel ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}
          >
            Reatribuir
          </button>
        </React.Fragment>
      }
    >
      <label className="text-xs font-medium text-neutral-600 block mb-1">Novo responsável</label>
      <select value={pick} onChange={(e) => setPick(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
        {OPERATION_TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </Modal>
  );
}

const ESCALATE_REASONS = ['SLA em risco', 'Exceção cadastral', 'Compliance', 'Documento divergente', 'Dependência sistêmica'];
const ESCALATE_TARGETS = ['Gerência operacional', 'Compliance', 'Suporte sênior'];

function OpDetEscalateModal({ operation, now, profile, onPatch, onClose }) {
  const [reason, setReason] = React.useState(ESCALATE_REASONS[0]);
  const [notes, setNotes] = React.useState('');
  const [target, setTarget] = React.useState(ESCALATE_TARGETS[0]);
  const [done, setDone] = React.useState(false);

  function confirm() {
    onPatch(operation.id, {
      priority: 'critica',
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: `Operação escalada para ${target}. Motivo: ${reason}.${notes ? ` Observações: ${notes}` : ''}` }],
    });
    setDone(true);
  }

  return (
    <Modal
      title="Escalar operação"
      onClose={onClose}
      footer={
        done ? (
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill bg-neutral-900 text-white">Fechar</button>
        ) : (
          <React.Fragment>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
            <button onClick={confirm} className="text-sm px-4 py-2 rounded-pill bg-alert text-white">Confirmar escalamento</button>
          </React.Fragment>
        )
      }
    >
      {done ? (
        <div className="flex items-center gap-2 text-success-dark"><Icon name="check" size={16} /> Operação escalada (ação simulada) — prioridade ajustada para Crítica.</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">Esta ação encaminha o caso #{operation.protocol} diretamente para a equipe escolhida.</p>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Motivo do escalamento</label>
            <div className="flex flex-wrap gap-1.5">
              {ESCALATE_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={window.PortalLib.classNames('text-xs px-3 py-1.5 rounded-pill border', reason === r ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Observações adicionais</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Descreva brevemente o motivo…" className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Escalar para</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
              {ESCALATE_TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      )}
    </Modal>
  );
}

function OpDetConversationDrawer({ operation, profile, now, onPatch, onClose }) {
  const { formatDateTime } = window.PortalLib;
  const [text, setText] = React.useState('');
  const messages = operation.messages && operation.messages.length ? operation.messages : [{ author: 'Sistema', date: operation.openedAt, text: 'Conversa iniciada para acompanhamento desta operação.' }];

  function send() {
    if (!text.trim()) return;
    onPatch(operation.id, { messages: [...messages, { author: profile.name, date: now, text: text.trim() }] });
    setText('');
  }

  return (
    <Drawer title="Conversa" subtitle={`#${operation.protocol}`} onClose={onClose}>
      <div className="space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className="bg-neutral-50 rounded-large px-3 py-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-medium text-neutral-700">{m.author}</span>
              <span>{formatDateTime(m.date)}</span>
            </div>
            <div className="text-sm text-neutral-800">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Escreva uma mensagem…" className="flex-1 text-sm border border-neutral-200 rounded-pill px-3 py-2" />
        <button onClick={send} disabled={!text.trim()} className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill text-white shrink-0', text.trim() ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}>Enviar</button>
      </div>
    </Drawer>
  );
}

const DOC_CHECKLIST = ['Documento legível', 'Empresa/titular correspondente', 'Documento dentro da validade', 'Assinatura(s) presentes e válidas'];

function OpDetDocumentDrawer({ operation, doc, now, profile, onPatch, onClose, onRequestCorrection }) {
  const { formatDateTime } = window.PortalLib;
  const readOnly = doc.status === 'validado' || doc.status === 'substituido';
  const [invalidReason, setInvalidReason] = React.useState('');
  const [showInvalidForm, setShowInvalidForm] = React.useState(false);

  function markValid() {
    const nextDocs = operation.documents.map((d) => (d.id === doc.id ? { ...d, status: 'validado' } : d));
    onPatch(operation.id, {
      documents: nextDocs,
      status: 'em_processamento',
      nextAction: 'Executar operação',
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: `Documento "${doc.name}" validado com sucesso.` }],
    });
    onClose();
  }

  function markInvalid() {
    const nextDocs = operation.documents.map((d) => (d.id === doc.id ? { ...d, status: 'invalido' } : d));
    onRequestCorrection(nextDocs, invalidReason);
    onClose();
  }

  return (
    <Drawer title={doc.name} subtitle={doc.fileName} onClose={onClose}>
      <div className="bg-neutral-50 rounded-large p-3 mb-4 text-sm space-y-1.5">
        <div className="flex items-center justify-between"><span className="text-neutral-400 text-xs uppercase tracking-wide">Recebido em</span><span className="font-medium text-neutral-900">{formatDateTime(doc.sentAt)}</span></div>
        <div className="flex items-center justify-between"><span className="text-neutral-400 text-xs uppercase tracking-wide">Enviado por</span><span className="font-medium text-neutral-900">{doc.sentBy}</span></div>
        <div className="flex items-center justify-between"><span className="text-neutral-400 text-xs uppercase tracking-wide">Tamanho</span><span className="font-medium text-neutral-900">{doc.sizeKb >= 1024 ? `${(doc.sizeKb / 1024).toFixed(1)} MB` : `${doc.sizeKb} KB`}</span></div>
      </div>

      <div className="bg-neutral-100 rounded-large h-40 flex items-center justify-center mb-4 text-neutral-400 text-sm">
        <Icon name="file" size={22} className="mr-2" /> Pré-visualização não disponível no protótipo
      </div>

      <h3 className="text-sm font-semibold text-neutral-800 mb-3">Validação documental</h3>
      {!showInvalidForm ? (
        <React.Fragment>
          <ul className="space-y-2 mb-4">
            {DOC_CHECKLIST.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-neutral-700">
                <Icon name="check" size={14} className={readOnly || doc.status === 'pendente' ? 'text-success' : 'text-neutral-300'} /> {c}
              </li>
            ))}
          </ul>
          {readOnly ? (
            <div className="bg-success-light text-success-dark rounded-medium px-3 py-2.5 text-sm">
              <div className="font-medium">Documento válido</div>
              <div>Todas as verificações de conformidade foram atendidas.</div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={markValid} className="flex-1 text-sm px-4 py-2 rounded-pill bg-brand text-white">Confirmar validação</button>
              <button onClick={() => setShowInvalidForm(true)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Reportar problema</button>
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Motivo da pendência</label>
            <textarea value={invalidReason} onChange={(e) => setInvalidReason(e.target.value)} rows={2} placeholder="Ex.: assinatura ilegível, documento vencido…" className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={markInvalid} disabled={!invalidReason.trim()} className={window.PortalLib.classNames('flex-1 text-sm px-4 py-2 rounded-pill text-white', invalidReason.trim() ? 'bg-alert' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}>Solicitar nova correção</button>
            <button onClick={() => setShowInvalidForm(false)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function OpDetExecuteModal({ operation, client, now, profile, onPatch, onClose }) {
  const { OPERATION_TYPE_META } = window.PortalLib;
  return (
    <Modal
      title={`Executar ${OPERATION_TYPE_META[operation.type].label.toLowerCase()}?`}
      onClose={onClose}
      footer={
        <React.Fragment>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
          <button
            onClick={() => {
              onPatch(operation.id, {
                status: 'executada',
                nextAction: 'Concluir operação',
                timeline: [...operation.timeline, { date: now, author: profile.name, detail: `${OPERATION_TYPE_META[operation.type].label} executada.` }],
              });
              onClose();
            }}
            className="text-sm px-4 py-2 rounded-pill bg-brand text-white"
          >
            Confirmar execução
          </button>
        </React.Fragment>
      }
    >
      <p className="text-sm text-neutral-600 mb-3">Confirme os detalhes antes de aprovar a gravação.</p>
      <div className="bg-neutral-50 rounded-large p-3 space-y-1.5 text-sm mb-3">
        <div className="flex items-center justify-between"><span className="text-neutral-500">Cliente</span><span className="font-medium text-neutral-900">{client ? client.name : operation.clientId}</span></div>
        <div className="flex items-center justify-between"><span className="text-neutral-500">Operação</span><span className="font-medium text-neutral-900">{OPERATION_TYPE_META[operation.type].label}</span></div>
        <div className="flex items-center justify-between"><span className="text-neutral-500">Documentação</span><span className="font-medium text-success-dark">Validada com conformidade</span></div>
      </div>
      <div className="text-xs text-neutral-400">Esta ação atualiza os dados da operação apenas no protótipo. Nenhuma alteração real será executada em sistema legado.</div>
    </Modal>
  );
}

const CONCLUDE_RESULTS = [
  { key: 'concluida', label: 'Concluída com sucesso' },
  { key: 'concluida_parcial', label: 'Concluída parcialmente' },
  { key: 'nao_executada', label: 'Não executada' },
  { key: 'cancelada', label: 'Cancelada' },
];

function OpDetConcludeModal({ operation, now, profile, onPatch, onClose }) {
  const { OPERATION_TYPE_META, durationLabel } = window.PortalLib;
  const [resultado, setResultado] = React.useState('concluida');
  const [resumo, setResumo] = React.useState('');
  const [motivo, setMotivo] = React.useState(operation.motivoPrincipal || 'Documento incompleto');
  const [causa, setCausa] = React.useState('Assinatura ausente');
  const [notifyConsultor, setNotifyConsultor] = React.useState(true);
  const [notifyCliente, setNotifyCliente] = React.useState(false);

  const totalMs = new Date(now) - new Date(operation.openedAt);
  const withinSla = new Date(now) <= new Date(operation.dueAt);

  function confirm() {
    onPatch(operation.id, {
      status: resultado,
      resolvedAt: now,
      motivoPrincipal: resultado === 'concluida' ? null : motivo,
      resumoResolucao: resumo || `${OPERATION_TYPE_META[operation.type].label} — ${CONCLUDE_RESULTS.find((r) => r.key === resultado).label.toLowerCase()}.`,
      nextAction: null,
      timeline: [
        ...operation.timeline,
        { date: now, author: profile.name, detail: `Operação encerrada — ${CONCLUDE_RESULTS.find((r) => r.key === resultado).label}.${notifyConsultor ? ' Consultor parceiro notificado.' : ''}${notifyCliente ? ' Cliente notificado.' : ''}` },
      ],
    });
    onClose();
  }

  return (
    <Modal
      title="Concluir operação"
      onClose={onClose}
      footer={
        <React.Fragment>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
          <button onClick={confirm} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Concluir operação</button>
        </React.Fragment>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-500">Confirme o resultado para encerrar o caso.</p>
        <div>
          <label className="text-xs font-medium text-neutral-600 block mb-1.5">Resultado</label>
          <div className="grid grid-cols-2 gap-2">
            {CONCLUDE_RESULTS.map((r) => (
              <button
                key={r.key}
                onClick={() => setResultado(r.key)}
                className={window.PortalLib.classNames('text-sm px-3 py-2 rounded-pill border text-left', resultado === r.key ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600')}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600 block mb-1">Resumo da resolução</label>
          <textarea value={resumo} onChange={(e) => setResumo(e.target.value)} rows={2} placeholder="Descreva brevemente o que foi feito…" className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2" />
        </div>
        {resultado !== 'concluida' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Motivo principal</label>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                {['Documento incompleto', 'Aguardando cliente', 'Aprovação interna', 'Dependência externa', 'Dependência sistêmica'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Causa</label>
              <select value={causa} onChange={(e) => setCausa(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                {['Assinatura ausente', 'Documento vencido', 'Dado divergente', 'Cliente sem resposta'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
        <div className="bg-neutral-50 rounded-large p-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between"><span className="text-neutral-500">Tempo total da jornada</span><span className="font-medium text-neutral-900">{durationLabel(totalMs, true)}</span></div>
          <div className={window.PortalLib.classNames('flex items-center gap-1.5 font-medium', withinSla ? 'text-success-dark' : 'text-alert-dark')}>
            <Icon name="check" size={13} /> {withinSla ? 'Dentro do SLA de atendimento' : 'Fora do SLA de atendimento'}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={notifyConsultor} onChange={(e) => setNotifyConsultor(e.target.checked)} className="accent-brand" /> Notificar consultor parceiro sobre a resolução
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={notifyCliente} onChange={(e) => setNotifyCliente(e.target.checked)} className="accent-brand" /> Enviar notificação para o cliente final
        </label>
      </div>
    </Modal>
  );
}

// ---------- Página principal ----------

function OperationDetailPage({ operation, client, profile, now, onBack, onPatch, onOpenTicketFor, onOpenClient }) {
  const { OPERATION_TYPE_META, OPERATION_STATUS_META, OPERATION_PRIORITY_META, OPERATION_TEAM_BY_TYPE, OWNER_NAME_MAP, RISK_PROFILE_META, operationSlaState, formatDateTime, durationLabel, classNames } = window.PortalLib;
  const { SlaLabel } = window.OperationsShared;

  const [tab, setTab] = React.useState('geral');
  const [modal, setModal] = React.useState(null); // 'reassign'|'escalate'|'execute'|'conclude'
  const [conversationOpen, setConversationOpen] = React.useState(false);
  const [openDocId, setOpenDocId] = React.useState(null);
  const [exportOpen, setExportOpen] = React.useState(false);

  const typeMeta = OPERATION_TYPE_META[operation.type];
  const statusMeta = OPERATION_STATUS_META[operation.status];
  const priorityMeta = OPERATION_PRIORITY_META[operation.priority];
  const isClosed = !!operation.resolvedAt;
  const docs = operation.documents || [];
  const openDoc = openDocId ? docs.find((d) => d.id === openDocId) : null;
  const sla = !isClosed ? operationSlaState(operation, now) : null;
  const team = OPERATION_TEAM_BY_TYPE[operation.type] || 'Backoffice';
  const solicitadaPor = (client && OWNER_NAME_MAP[client.ownerId]) || operation.responsavel;

  function patch(id, p) {
    onPatch(id, p);
  }

  function requestCorrection(nextDocs, reason) {
    patch(operation.id, {
      documents: nextDocs,
      status: 'aguardando_documento',
      motivoPrincipal: 'Documento incompleto',
      nextAction: 'Solicitar nova correção do documento',
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: `Correção solicitada. Motivo: ${reason}` }],
    });
  }

  function markReceived() {
    const doc = { id: window.PortalLib.uid(), name: typeMeta.label, fileName: `${operation.type}_${operation.protocol}.pdf`, sentBy: solicitadaPor, sentAt: now, sizeKb: 900 + Math.round(Math.random() * 1600), status: 'pendente' };
    patch(operation.id, {
      documents: [...docs, doc],
      status: 'pendencia_interna',
      nextAction: 'Validar documentação recebida',
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: `Documento "${doc.name}" recebido e anexado à operação.` }],
    });
  }

  function requestToThirdParty(nextStatus) {
    patch(operation.id, {
      status: nextStatus,
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: nextStatus === 'aguardando_consultor' ? 'Solicitação enviada ao consultor responsável.' : 'Solicitação reenviada.' }],
    });
  }

  function startTriage() {
    patch(operation.id, { status: 'em_analise', timeline: [...operation.timeline, { date: now, author: profile.name, detail: 'Triagem iniciada.' }] });
  }

  function finishTriage() {
    patch(operation.id, {
      status: 'aguardando_documento',
      nextAction: operation.nextAction || `Receber documentação para ${typeMeta.label.toLowerCase()}.`,
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: 'Triagem concluída — documentação pendente identificada.' }],
    });
  }

  function confirmBackofficeExecution() {
    patch(operation.id, {
      status: 'executada',
      nextAction: 'Concluir operação',
      timeline: [...operation.timeline, { date: now, author: profile.name, detail: 'Execução confirmada pelo backoffice.' }],
    });
  }

  // ---------- Card "Próxima ação necessária" — dinâmico por status ----------
  function renderActionCard() {
    if (isClosed) return null;
    const st = operation.status;
    let description = operation.nextAction || 'Sem ação pendente registrada.';
    let buttons = null;

    if (st === 'novo') {
      buttons = <button onClick={startTriage} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Iniciar triagem</button>;
      description = description || 'Iniciar triagem desta operação.';
    } else if (st === 'em_analise') {
      buttons = <button onClick={finishTriage} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Concluir triagem</button>;
      description = 'Revisar dados e identificar documentação pendente.';
    } else if (st === 'aguardando_documento' || st === 'aguardando_consultor') {
      buttons = (
        <React.Fragment>
          <button onClick={() => requestToThirdParty(st === 'aguardando_documento' ? 'aguardando_consultor' : 'aguardando_consultor')} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">
            {st === 'aguardando_documento' ? 'Solicitar ao consultor' : 'Reenviar solicitação'}
          </button>
          <button onClick={markReceived} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Marcar como recebido</button>
          {st === 'aguardando_consultor' && <button onClick={() => setConversationOpen(true)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Abrir conversa</button>}
        </React.Fragment>
      );
    } else if (st === 'pendencia_interna') {
      const pendingDoc = [...docs].reverse().find((d) => d.status === 'pendente');
      buttons = pendingDoc ? (
        <button onClick={() => setOpenDocId(pendingDoc.id)} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Validar documento</button>
      ) : (
        <span className="text-sm text-neutral-400">Nenhum documento pendente de validação.</span>
      );
      description = description || 'Documentação recebida, aguardando validação interna.';
    } else if (st === 'em_processamento') {
      buttons = <button onClick={() => setModal('execute')} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Executar operação</button>;
      description = `Executar ${typeMeta.label.toLowerCase()}. Toda a documentação obrigatória foi validada.`;
    } else if (st === 'aguardando_backoffice') {
      buttons = <button onClick={confirmBackofficeExecution} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Confirmar execução do backoffice</button>;
      description = description || 'Aguardando confirmação de execução pelo backoffice.';
    } else if (st === 'executada') {
      buttons = <button onClick={() => setModal('conclude')} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Concluir operação</button>;
      description = 'A operação foi executada e está pronta para encerramento.';
    }

    return (
      <OpDetInfoCard title="">
        <div className="border-l-4 border-brand -ml-4 -mt-4 pl-3.5 pt-3.5 pb-1">
          <div className="font-medium text-neutral-800 mb-2">Próxima ação necessária</div>
          <p className="text-sm text-neutral-700 mb-3">{description}</p>
          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
            <div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wide">Responsável pela ação</div>
              <div className="font-medium text-neutral-900">{operation.responsavel}</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wide">Prazo</div>
              <div className="font-medium text-neutral-900">{formatDateTime(operation.dueAt)}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">{buttons}</div>
        </div>
      </OpDetInfoCard>
    );
  }

  const recentUpdates = [...operation.timeline].reverse().slice(0, 3);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-brand-dark font-medium flex items-center gap-1.5">
        <Icon name="arrowLeft" size={14} /> Voltar para Operações
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-neutral-400">#{operation.protocol}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-xl font-semibold text-neutral-900">{typeMeta.label}</h1>
            <StatusPill label={statusMeta.label} className={statusMeta.className} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isClosed && (
            <div className="text-right">
              <div className="text-[11px] text-neutral-400 uppercase tracking-wide">SLA</div>
              <div className="font-semibold"><SlaLabel op={operation} now={now} /></div>
            </div>
          )}
          <button onClick={() => setModal('reassign')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50">Reatribuir</button>
          <button onClick={() => setModal('escalate')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50">Escalar</button>
          <div className="relative">
            <button onClick={() => setExportOpen((o) => !o)} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50">…</button>
            {exportOpen && (
              <React.Fragment>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white border border-neutral-100 rounded-large shadow-lg z-20 py-1.5">
                  <button
                    onClick={() => { window.PortalLib.download(`operacao-${operation.protocol}.json`, JSON.stringify(operation, null, 2)); setExportOpen(false); }}
                    className="w-full text-left text-sm px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Icon name="download" size={14} /> Exportar dados da operação
                  </button>
                  {client && (
                    <button onClick={() => { onOpenTicketFor(client, 'service', operation.id, `Operação ${operation.protocol}`); setExportOpen(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-neutral-50 flex items-center gap-2">
                      <Icon name="lifeBuoy" size={14} /> Abrir chamado
                    </button>
                  )}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {sla && sla.state === 'vencido' && (
        <div className="bg-alert-light text-alert-dark rounded-large px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">SLA vencido — {sla.label}. A operação continua disponível para execução normal pela equipe responsável.</span>
        </div>
      )}
      {sla && sla.state === 'risco' && (
        <div className="bg-warning-light text-warning-dark rounded-large px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">SLA em risco — {sla.label} para conclusão antes de estourar a meta operacional.</span>
          <button onClick={() => setModal('escalate')} className="text-sm px-3 py-1.5 rounded-pill bg-brand text-white shrink-0">Escalar</button>
        </div>
      )}

      <div className="border-b border-neutral-100 flex items-center gap-1">
        {OPDET_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={classNames('text-sm px-3 py-2 border-b-2 whitespace-nowrap', tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'geral' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {isClosed ? (
              <OpDetInfoCard title="">
                <div className="flex items-center gap-2 text-success-dark font-medium mb-2"><Icon name="check" size={16} /> Resultado da operação</div>
                <p className="text-neutral-800 mb-3">{operation.resumoResolucao || `${typeMeta.label} encerrada.`}</p>
                <OpDetField label="Tempo de atendimento total" value={durationLabel(new Date(operation.resolvedAt) - new Date(operation.openedAt), true)} />
                {operation.motivoPrincipal && <OpDetField label="Causa identificada" value={operation.motivoPrincipal} />}
                <OpDetField label="Resolvido por" value={operation.responsavel} />
                <OpDetField label="SLA final" value={new Date(operation.resolvedAt) <= new Date(operation.dueAt) ? 'Meta cumprida' : 'Fora da meta'} />
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={onBack} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Voltar para Operações</button>
                </div>
              </OpDetInfoCard>
            ) : (
              renderActionCard()
            )}

            {client && (
              <OpDetInfoCard title="Cliente" right={<button onClick={() => onOpenClient(client.id)} className="text-sm text-brand-dark font-medium">Ver cliente</button>}>
                <div className="font-medium text-neutral-900">{client.name}</div>
                <div className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <span>Conta {client.account}</span> · <span>{client.segment}</span> · <StatusPill label={(RISK_PROFILE_META[client.riskProfile] || {}).label || client.riskProfile} className={(RISK_PROFILE_META[client.riskProfile] || {}).className} size="sm" />
                </div>
                <div className="text-xs text-neutral-400 mt-1">Consultor: {solicitadaPor}</div>
              </OpDetInfoCard>
            )}

            <OpDetInfoCard title="Dados da Operação">
              <OpDetField label="Tipo" value={typeMeta.label} />
              <OpDetField label="Solicitada por" value={solicitadaPor} />
              <OpDetField label="Criada em" value={formatDateTime(operation.openedAt)} />
              <OpDetField label="Canal" value="Portal" />
              <OpDetField label="Prioridade" value={<StatusPill label={priorityMeta.label} className={priorityMeta.className} size="sm" />} />
              <OpDetField label="Equipe" value={team} />
              <OpDetField label="Responsável atual" value={operation.responsavel} />
            </OpDetInfoCard>

            {!isClosed && (
              <OpDetInfoCard title="Progresso da solicitação">
                <OpDetStepper status={operation.status} />
              </OpDetInfoCard>
            )}

            {!isClosed && (
              <OpDetInfoCard title="Pendências">
                {operation.nextAction && (operation.status === 'aguardando_documento' || operation.status === 'aguardando_consultor') ? (
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="clock" size={14} className="text-warning-dark mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-800">{typeMeta.label}</div>
                      <div className="text-neutral-500">{operation.nextAction}</div>
                      <div className="text-xs text-neutral-400 mt-1">Responsável: <span className="font-medium">{operation.responsavel}</span> · Prazo: {formatDateTime(operation.dueAt)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-success-dark"><Icon name="check" size={14} /> Nenhuma pendência aberta</div>
                )}
              </OpDetInfoCard>
            )}

            <OpDetInfoCard title="Últimas atualizações" right={<button onClick={() => setTab('historico')} className="text-sm text-brand-dark font-medium">Ver histórico completo</button>}>
              <ul className="divide-y divide-neutral-50">
                {recentUpdates.map((t, i) => (
                  <li key={i} className="py-2 flex items-start gap-3 text-sm">
                    <span className="text-neutral-400 w-12 shrink-0">{formatDateTime(t.date).slice(-5)}</span>
                    <span className="font-medium text-neutral-800 w-28 shrink-0 truncate">{t.author || 'Sistema'}</span>
                    <span className="text-neutral-600">{t.detail}</span>
                  </li>
                ))}
              </ul>
            </OpDetInfoCard>
          </div>

          <div className="space-y-4">
            <OpDetInfoCard title="Detalhes do SLA">
              <OpDetField label="Meta total" value={durationLabel(new Date(operation.dueAt) - new Date(operation.openedAt), true)} />
              <OpDetField label={isClosed ? 'Tempo consumido final' : 'Tempo consumido'} value={durationLabel(new Date(operation.resolvedAt || now) - new Date(operation.openedAt), true)} />
              {!isClosed && <OpDetField label="Tempo restante" value={sla.label.replace(' restantes', '').replace('Vencido há ', '')} />}
              <OpDetField label={isClosed ? 'Status final' : 'Status'} value={isClosed ? (new Date(operation.resolvedAt) <= new Date(operation.dueAt) ? 'Concluído no prazo' : 'Concluído fora do prazo') : sla.state === 'ok' ? 'Dentro do prazo' : sla.state === 'risco' ? 'Em risco' : 'Vencido'} />
            </OpDetInfoCard>

            <OpDetInfoCard title="Atendimento">
              <OpDetField label="Responsável atual" value={operation.responsavel} />
              <OpDetField label="Equipe responsável" value={team} />
              <button onClick={() => setConversationOpen(true)} className="w-full mt-3 text-sm px-4 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">Abrir conversa</button>
            </OpDetInfoCard>
          </div>
        </div>
      )}

      {tab === 'documentos' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OpDetInfoCard title="Lista de documentos do processo">
              {docs.length === 0 ? (
                <window.EmptyState icon="file" title="Nenhum documento anexado ainda" description="Documentos aparecem aqui conforme forem recebidos ao longo da operação." />
              ) : (
                <ul className="divide-y divide-neutral-50">
                  {docs.map((d) => {
                    const docStatusMeta = { validado: { label: 'Validado', className: 'bg-success-light text-success-dark' }, substituido: { label: 'Substituído', className: 'bg-neutral-100 text-neutral-500' }, invalido: { label: 'Inválido', className: 'bg-alert-light text-alert-dark' }, pendente: { label: 'Pendente de validação', className: 'bg-warning-light text-warning-dark' } }[d.status];
                    return (
                      <li key={d.id} className="py-3 flex items-center gap-3">
                        <Icon name="file" size={18} className="text-neutral-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-neutral-900 truncate">{d.name}</div>
                          <div className="text-xs text-neutral-400 truncate">{d.fileName} · Enviado por {d.sentBy} · {formatDateTime(d.sentAt)}</div>
                        </div>
                        <StatusPill label={docStatusMeta.label} className={docStatusMeta.className} size="sm" />
                        <button onClick={() => setOpenDocId(d.id)} className="text-sm text-brand-dark font-medium shrink-0">Ver documento</button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </OpDetInfoCard>
          </div>
          <OpDetInfoCard title="Detalhes do SLA">
            <OpDetField label="Meta total" value={durationLabel(new Date(operation.dueAt) - new Date(operation.openedAt), true)} />
            <OpDetField label={isClosed ? 'Tempo consumido final' : 'Tempo consumido'} value={durationLabel(new Date(operation.resolvedAt || now) - new Date(operation.openedAt), true)} />
          </OpDetInfoCard>
        </div>
      )}

      {tab === 'historico' && (
        <OpDetInfoCard title="Histórico completo">
          <ol className="relative border-l border-neutral-100 ml-2 space-y-5">
            {[...operation.timeline].reverse().map((t, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -ml-[25px] mt-1 w-2.5 h-2.5 rounded-full bg-brand" />
                <div className="flex items-center gap-2 text-xs text-neutral-400"><span>{formatDateTime(t.date)}</span> · <span className="font-medium text-neutral-600">{t.author || 'Sistema'}</span></div>
                <div className="text-sm text-neutral-800">{t.detail}</div>
              </li>
            ))}
          </ol>
        </OpDetInfoCard>
      )}

      {modal === 'reassign' && <OpDetReassignModal operation={operation} now={now} profile={profile} onPatch={patch} onClose={() => setModal(null)} />}
      {modal === 'escalate' && <OpDetEscalateModal operation={operation} now={now} profile={profile} onPatch={patch} onClose={() => setModal(null)} />}
      {modal === 'execute' && <OpDetExecuteModal operation={operation} client={client} now={now} profile={profile} onPatch={patch} onClose={() => setModal(null)} />}
      {modal === 'conclude' && <OpDetConcludeModal operation={operation} now={now} profile={profile} onPatch={patch} onClose={() => setModal(null)} />}
      {conversationOpen && <OpDetConversationDrawer operation={operation} profile={profile} now={now} onPatch={patch} onClose={() => setConversationOpen(false)} />}
      {openDoc && <OpDetDocumentDrawer operation={operation} doc={openDoc} now={now} profile={profile} onPatch={patch} onClose={() => setOpenDocId(null)} onRequestCorrection={requestCorrection} />}
    </div>
  );
}

window.OperationDetailPage = OperationDetailPage;

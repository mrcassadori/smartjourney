// Modal genérico para confirmações de ações simuladas (reenviar, cancelar,
// aprovar). Nada aqui produz efeito fora do estado local do protótipo.

function Modal({ title, children, onClose, footer, tone, width }) {
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={window.PortalLib.classNames('relative bg-white rounded-xLarge shadow-xl w-full overflow-hidden max-h-[85vh] flex flex-col', width || 'max-w-md')}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-neutral-700 rounded-full p-1">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-neutral-700 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmAction({ title, description, confirmLabel, tone, onConfirm, onClose }) {
  const [done, setDone] = React.useState(false);
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        done ? (
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill bg-neutral-900 text-white">Fechar</button>
        ) : (
          <React.Fragment>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
            <button
              onClick={() => {
                onConfirm();
                setDone(true);
              }}
              className={window.PortalLib.classNames(
                'text-sm px-4 py-2 rounded-pill text-white',
                tone === 'alert' ? 'bg-alert' : 'bg-brand'
              )}
            >
              {confirmLabel || 'Confirmar'}
            </button>
          </React.Fragment>
        )
      }
    >
      {done ? (
        <div className="flex items-center gap-2 text-success-dark">
          <Icon name="check" size={16} />
          Ação simulada com sucesso — nada foi enviado a um sistema real.
        </div>
      ) : (
        description
      )}
    </Modal>
  );
}

window.Modal = Modal;
window.ConfirmAction = ConfirmAction;

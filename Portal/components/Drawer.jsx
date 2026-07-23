// Painel lateral para detalhe de alerta/onboarding/ordem sem perder o
// contexto da lista de fundo (princípio "contexto preservado").

function Drawer({ title, subtitle, onClose, children, width }) {
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={window.PortalLib.classNames('relative bg-white h-full shadow-2xl overflow-y-auto', width || 'w-full max-w-lg')}>
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <h2 className="font-semibold text-neutral-900">{title}</h2>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-neutral-700 rounded-full p-1 shrink-0">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

window.Drawer = Drawer;

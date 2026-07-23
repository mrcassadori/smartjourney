// Estados obrigatórios de tela (§10 do épico): vazio, erro recuperável,
// sem permissão e "dado desatualizado". Sempre com uma próxima ação clara.

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-neutral-200 rounded-large bg-neutral-50">
      <div className="w-11 h-11 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-3">
        <Icon name={icon || 'search'} size={20} />
      </div>
      <div className="font-medium text-neutral-900 mb-1">{title}</div>
      {description && <div className="text-sm text-neutral-500 max-w-md">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ErrorState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-alert/20 rounded-large bg-alert-light">
      <div className="w-11 h-11 rounded-full bg-white border border-alert/30 flex items-center justify-center text-alert mb-3">
        <Icon name="alertTriangle" size={20} />
      </div>
      <div className="font-medium text-alert-dark mb-1">{title}</div>
      {description && <div className="text-sm text-alert-dark/80 max-w-md">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function NoPermissionState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-neutral-200 rounded-large bg-neutral-50">
      <div className="w-11 h-11 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-3">
        <Icon name="shield" size={20} />
      </div>
      <div className="font-medium text-neutral-900 mb-1">{title || 'Sem permissão para este conteúdo'}</div>
      {description && <div className="text-sm text-neutral-500 max-w-md">{description}</div>}
    </div>
  );
}

function StaleDataBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning-dark bg-warning-light rounded-full px-2 py-0.5">
      <Icon name="clock" size={12} />
      {label || 'Dado desatualizado'}
    </span>
  );
}

window.EmptyState = EmptyState;
window.ErrorState = ErrorState;
window.NoPermissionState = NoPermissionState;
window.StaleDataBadge = StaleDataBadge;

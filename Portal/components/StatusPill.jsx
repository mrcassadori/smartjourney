function StatusPill({ label, className, size }) {
  const { classNames } = window.PortalLib;
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className || 'bg-neutral-100 text-neutral-600'
      )}
    >
      {label}
    </span>
  );
}

window.StatusPill = StatusPill;

// Estado de carregamento — simula latência de uma chamada real ao trocar de
// aba/página, para validar como a UI se comporta enquanto os dados "chegam".

function SkeletonBlock({ className }) {
  return <div className={window.PortalLib.classNames('animate-pulse bg-neutral-100 rounded-medium', className || 'h-4 w-full')} />;
}

function SkeletonCards({ count }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count || 4 }).map((_, i) => (
        <div key={i} className="rounded-large border border-neutral-100 bg-white p-4">
          <SkeletonBlock className="h-3 w-1/2 mb-3" />
          <SkeletonBlock className="h-7 w-2/3 mb-2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function SkeletonRows({ count }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count || 5 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}

// Hook simples: liga `loading=true` por `ms` sempre que `key` mudar.
function useSimulatedLoading(key, ms) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms || 420);
    return () => clearTimeout(t);
  }, [key]);
  return loading;
}

window.SkeletonBlock = SkeletonBlock;
window.SkeletonCards = SkeletonCards;
window.SkeletonRows = SkeletonRows;
window.useSimulatedLoading = useSimulatedLoading;

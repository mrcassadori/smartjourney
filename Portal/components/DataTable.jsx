// Tabela ordenável genérica — mesmo padrão de app.jsx (DataTable), adaptado
// aos tokens visuais do Inter. Reaproveitada em Clientes, Ordens e Onboarding.

function DataTable({ columns, rows, keyField, onRowClick, emptyLabel }) {
  const [sortCol, setSortCol] = React.useState(null);
  const [sortDir, setSortDir] = React.useState(1);

  const sorted = React.useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }, [rows, sortCol, sortDir]);

  function toggleSort(key) {
    if (sortCol === key) setSortDir(sortDir * -1);
    else {
      setSortCol(key);
      setSortDir(1);
    }
  }

  if (!rows.length) {
    return <EmptyState icon="search" title={emptyLabel || 'Nenhum resultado para os filtros atuais.'} />;
  }

  return (
    <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => c.sortable !== false && toggleSort(c.key)}
                className={window.PortalLib.classNames(
                  'text-left font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 whitespace-nowrap text-xs uppercase tracking-wide',
                  c.sortable !== false && 'cursor-pointer select-none'
                )}
              >
                {c.label}
                {sortCol === c.key ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={window.PortalLib.classNames(
                'border-b border-neutral-50 last:border-0 align-top',
                onRowClick && 'cursor-pointer hover:bg-neutral-50'
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

window.DataTable = DataTable;

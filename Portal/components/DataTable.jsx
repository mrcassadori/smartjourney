// Tabela ordenável genérica — mesmo padrão de app.jsx (DataTable), adaptado
// aos tokens visuais do Inter. Reaproveitada em Clientes, Ordens e Onboarding.

function DataTable({ columns, rows, keyField, onRowClick, emptyLabel, selectable, selectedKeys, onToggleSelect, onToggleAll }) {
  const [sortCol, setSortCol] = React.useState(null);
  const [sortDir, setSortDir] = React.useState(1);
  const selSet = selectable ? new Set(selectedKeys || []) : null;
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selSet.has(r[keyField]));

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
            {selectable && (
              <th className="px-4 py-2.5 border-b border-neutral-100 w-10">
                <input type="checkbox" aria-label="Selecionar todos" checked={allSelected} onChange={() => onToggleAll(rows.map((r) => r[keyField]), !allSelected)} className="accent-brand" />
              </th>
            )}
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
                selectable && selSet.has(row[keyField]) && 'bg-brand-lightest/30',
                onRowClick && 'cursor-pointer hover:bg-neutral-50'
              )}
            >
              {selectable && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" aria-label="Selecionar linha" checked={selSet.has(row[keyField])} onChange={() => onToggleSelect(row[keyField])} className="accent-brand" />
                </td>
              )}
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

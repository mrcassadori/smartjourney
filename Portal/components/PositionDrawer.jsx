// Tela 04 — Detalhe de posição em drawer lateral, sem perder o contexto da
// carteira ao fundo. Reusa <Drawer>.

function PositionDrawer({ position, client, now, onClose, onSimulateReinvest, onSeeMovements, onExport }) {
  const { formatCurrency, formatDate, daysUntil } = window.PortalLib;
  const p = position;
  const applied = p.appliedValue || p.currentValue;
  const rentab = applied ? ((p.currentValue / applied - 1) * 100) : 0;
  const dLeft = p.maturityDate ? daysUntil(p.maturityDate, now) : null;
  const fgcEligible = ['CDB', 'LCI', 'LCA'].indexOf(p.subclass) !== -1 || p.issuer === 'Banco Inter';

  const row = (label, value) => (
    <div className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 font-medium text-right">{value}</span>
    </div>
  );

  return (
    <Drawer title={p.asset} subtitle={`${p.class} · ${p.subclass}`} onClose={onClose}>
      <div className="space-y-5">
        {dLeft !== null && dLeft >= 0 && dLeft <= 30 && (
          <div className="flex items-center gap-2 text-sm bg-warning-light text-warning-dark rounded-medium px-3 py-2">
            <Icon name="clock" size={15} /> Vencimento em {dLeft} {dLeft === 1 ? 'dia' : 'dias'}.
          </div>
        )}

        <div>
          <div className="text-xs text-neutral-400">Valor atual</div>
          <div className="text-2xl font-light text-neutral-900">{formatCurrency(p.currentValue)}</div>
          <div className={window.PortalLib.classNames('text-sm mt-0.5', rentab >= 0 ? 'text-success-dark' : 'text-alert-dark')}>
            {rentab >= 0 ? '+' : ''}{rentab.toFixed(1)}% acumulado
          </div>
        </div>

        <div className="bg-white border border-neutral-100 rounded-large px-4 py-1">
          {row('Valor aplicado', formatCurrency(applied))}
          {row('Data da aplicação', p.applicationDate ? formatDate(p.applicationDate) : '—')}
          {row('Vencimento', p.maturityDate ? formatDate(p.maturityDate) : 'Sem vencimento')}
          {row('Liquidez', p.liquidity)}
          {row('Taxa contratada', p.rate !== '—' ? p.rate : '—')}
          {row('Emissor', p.issuer)}
          {row('FGC', fgcEligible ? 'Elegível' : 'Não aplicável')}
        </div>

        {/* Timeline aplicação → atual → vencimento */}
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Linha do tempo</div>
          <div className="flex items-center">
            {[
              { label: 'Aplicação', date: p.applicationDate ? formatDate(p.applicationDate) : '—', done: true },
              { label: 'Posição atual', date: formatDate(now.slice(0, 10)), done: true },
              { label: 'Vencimento', date: p.maturityDate ? formatDate(p.maturityDate) : '—', done: false },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center" style={{ minWidth: 0 }}>
                  <span className={window.PortalLib.classNames('w-3 h-3 rounded-full', step.done ? 'bg-brand' : 'bg-neutral-200')} />
                  <span className="text-[11px] text-neutral-700 mt-1.5 font-medium">{step.label}</span>
                  <span className="text-[10px] text-neutral-400">{step.date}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 h-px bg-neutral-200 mx-1" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button onClick={() => onSimulateReinvest(p)} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center justify-center gap-1.5">
            <Icon name="target" size={14} /> Simular reinvestimento
          </button>
          <button onClick={() => onSeeMovements(p)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1.5">
            <Icon name="wallet" size={14} /> Ver movimentações relacionadas
          </button>
          <button onClick={() => onExport(p)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1.5">
            <Icon name="download" size={14} /> Exportar dados
          </button>
        </div>
      </div>
    </Drawer>
  );
}

window.PositionDrawer = PositionDrawer;

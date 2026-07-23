// US-02 — Home com indicadores, pendências e oportunidades priorizadas da base.

function IndicatorCard({ icon, label, value, hint, onClick, tone, stale }) {
  const { classNames } = window.PortalLib;
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={classNames(
        'rounded-large border border-neutral-100 bg-white p-4 text-left w-full',
        onClick && 'hover:border-brand/40 hover:shadow-sm transition-shadow'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={classNames('w-8 h-8 rounded-full flex items-center justify-center', tone || 'bg-brand-lightest text-brand-dark')}>
          <Icon name={icon} size={15} />
        </div>
        {stale && <window.StaleDataBadge />}
      </div>
      <div className="text-2xl font-light text-neutral-900 leading-tight">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
      {hint && <div className="text-[11px] text-neutral-400 mt-1">{hint}</div>}
    </Wrapper>
  );
}

function HomePage({ profile, clients, alerts, orders, onboarding, portfolioPositions, cashEvents, now, onNavigate, onOpenClient, onUpdateAlertStatus }) {
  const { formatCurrency, formatDate, daysUntil, ALERT_TYPE_META, ALERT_PRIORITY_META, ALERT_STATUS_META } = window.PortalLib;
  const [segment, setSegment] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [periodDays, setPeriodDays] = React.useState(7);
  const loading = window.useSimulatedLoading(`${profile.id}|${segment}|${statusFilter}|${periodDays}`, 380);

  if (profile.scopeType === 'none') {
    return (
      <window.NoPermissionState
        title="Este usuário não tem vínculo ativo"
        description="Cenário de demonstração: perfis sem vínculo ou permissão veem uma mensagem clara em vez de dados vazios silenciosos, com um caminho fictício de regularização."
      />
    );
  }

  const filteredClients = clients.filter((c) => (!segment || c.segment === segment) && (!statusFilter || c.status === statusFilter));
  const clientIds = new Set(filteredClients.map((c) => c.id));

  const totalWealth = filteredClients.reduce((s, c) => s + c.totalWealth, 0);
  const availableBalance = filteredClients.reduce((s, c) => s + c.availableBalance, 0);
  const investableCash = filteredClients.reduce((s, c) => s + c.investableCashEstimate, 0);

  const periodEvents = cashEvents.filter((e) => clientIds.has(e.clientId) && daysUntil(e.date, now) >= -periodDays);
  const captacao = periodEvents.filter((e) => e.value > 0).reduce((s, e) => s + e.value, 0);
  const retirada = periodEvents.filter((e) => e.value < 0).reduce((s, e) => s + Math.abs(e.value), 0);

  const dayBuckets = Array.from({ length: periodDays }, (_, i) => {
    const d = new Date(`${now.slice(0, 10)}T00:00:00-03:00`);
    d.setDate(d.getDate() - (periodDays - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const flowChartData = {
    labels: dayBuckets.map((d) => d.slice(8, 10) + '/' + d.slice(5, 7)),
    datasets: [
      {
        label: 'Captação',
        data: dayBuckets.map((d) => periodEvents.filter((e) => e.date === d && e.value > 0).reduce((s, e) => s + e.value, 0)),
        backgroundColor: '#00A868',
      },
      {
        label: 'Retirada',
        data: dayBuckets.map((d) => periodEvents.filter((e) => e.date === d && e.value < 0).reduce((s, e) => s + Math.abs(e.value), 0)),
        backgroundColor: '#E5222D',
      },
    ],
  };
  const flowChartOptions = {
    plugins: {
      legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { ticks: { font: { size: 10 }, callback: (v) => (v >= 1000 ? `${v / 1000}k` : v) } },
    },
  };

  const upcomingMaturities = portfolioPositions.filter((p) => clientIds.has(p.clientId) && p.maturityDate && daysUntil(p.maturityDate, now) >= 0 && daysUntil(p.maturityDate, now) <= 30);
  const clientsWithMaturity = new Set(upcomingMaturities.map((p) => p.clientId)).size;

  const pendingClients = filteredClients.filter((c) => c.status === 'pendente' || c.status === 'bloqueado').length;

  const scopedOrders = orders.filter((o) => clientIds.has(o.clientId));
  const awaitingApproval = scopedOrders.filter((o) => o.status === 'aguardando_aprovacao').length;
  const processing = scopedOrders.filter((o) => o.status === 'em_processamento').length;
  const withError = scopedOrders.filter((o) => o.status === 'erro').length;

  const scopedOnboarding = onboarding.filter((o) => clientIds.has(o.clientId));
  const recentlyActivated = scopedOnboarding.filter((o) => o.status === 'ativado' && daysUntil(o.timeline[o.timeline.length - 1].date, now) >= -30).length;
  const onboardingPending = scopedOnboarding.filter((o) => o.status !== 'ativado').length;

  const priorityAlerts = alerts
    .filter((a) => clientIds.has(a.clientId) && a.status !== 'concluido')
    .sort((a, b) => (a.priority === 'alta' ? -1 : 1) - (b.priority === 'alta' ? -1 : 1))
    .slice(0, 6);

  const topAvailableBalance = filteredClients
    .filter((c) => c.availableBalance > 0)
    .sort((a, b) => b.availableBalance - a.availableBalance)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Olá, {profile.name.split(' ')[0]}</h1>
          <p className="text-sm text-neutral-500">
            {profile.role} · {profile.escritorio} · {filteredClients.length} cliente{filteredClients.length === 1 ? '' : 's'} no seu escopo
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
          </select>
          <select value={segment} onChange={(e) => setSegment(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os segmentos</option>
            <option value="Standard">Standard</option>
            <option value="High">High</option>
            <option value="Private">Private</option>
            <option value="Corporate">Corporate</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <window.SkeletonCards count={8} />
      ) : filteredClients.length === 0 ? (
        <window.EmptyState icon="users" title="Nenhum cliente para esses filtros" description="Ajuste o segmento ou status para ver indicadores da base." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <IndicatorCard icon="wallet" label="Patrimônio total da base" value={formatCurrency(totalWealth)} hint={`atualizado ${formatDate(now.slice(0, 10))}`} />
          <IndicatorCard icon="trendingUp" label={`Captação (${periodDays}d)`} value={formatCurrency(captacao)} tone="bg-success-light text-success-dark" onClick={() => onNavigate('clients', { segment, statusFilter })} />
          <IndicatorCard icon="trendingDown" label={`Retirada (${periodDays}d)`} value={formatCurrency(retirada)} tone="bg-alert-light text-alert-dark" onClick={() => onNavigate('clients', { segment, statusFilter })} />
          <IndicatorCard icon="wallet" label="Saldo disponível / caixa investível" value={`${formatCurrency(availableBalance)} / ${formatCurrency(investableCash)}`} />
          <IndicatorCard icon="clock" label="Clientes com vencimento em até 30 dias" value={clientsWithMaturity} tone="bg-warning-light text-warning-dark" onClick={() => onNavigate('alerts', { type: 'vencimento_proximo' })} />
          <IndicatorCard icon="userPlus" label="Clientes com pendências" value={pendingClients} tone="bg-warning-light text-warning-dark" onClick={() => onNavigate('clients', { segment, statusFilter: 'pendente' })} />
          <IndicatorCard
            icon="inbox"
            label="Ordens: aguardando / processando / erro"
            value={`${awaitingApproval} / ${processing} / ${withError}`}
            tone={withError > 0 ? 'bg-alert-light text-alert-dark' : 'bg-info-light text-info-dark'}
            onClick={() => onNavigate('orders', {})}
          />
          <IndicatorCard icon="check" label="Ativados recentes / onboarding em curso" value={`${recentlyActivated} / ${onboardingPending}`} tone="bg-success-light text-success-dark" onClick={() => onNavigate('onboarding', {})} />
        </div>
      )}

      {!loading && filteredClients.length > 0 && (
        <div className="bg-white rounded-large border border-neutral-100 p-4">
          <h2 className="font-semibold text-neutral-900 text-sm mb-3">Captação x Retirada por dia ({periodDays}d)</h2>
          <window.ChartCanvas type="bar" data={flowChartData} options={flowChartOptions} height={220} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-large border border-neutral-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-neutral-900 text-sm">Alertas prioritários</h2>
            <button onClick={() => onNavigate('alerts', {})} className="text-xs text-brand-dark font-medium hover:underline">Ver central de alertas</button>
          </div>
          {loading ? (
            <window.SkeletonRows count={4} />
          ) : priorityAlerts.length === 0 ? (
            <window.EmptyState icon="check" title="Nenhum alerta pendente para esses filtros" description="A base filtrada está em dia — bom momento para revisar oportunidades." />
          ) : (
            <div className="divide-y divide-neutral-50">
              {priorityAlerts.map((a) => {
                const client = clients.find((c) => c.id === a.clientId);
                const meta = ALERT_TYPE_META[a.type];
                return (
                  <div key={a.id} className="py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-50 text-neutral-500 flex items-center justify-center shrink-0">
                      <Icon name={meta.icon} size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => onOpenClient(a.clientId)} className="text-sm font-medium text-neutral-900 hover:underline">
                        {client ? client.name : a.clientId}
                      </button>
                      <span className="text-xs text-neutral-400 ml-2">{meta.label}</span>
                      <div className="text-xs text-neutral-500 mt-0.5">{a.justification}</div>
                      <div className="text-[11px] text-brand-dark mt-1">Próxima ação: {a.recommendedAction}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusPill label={ALERT_PRIORITY_META[a.priority].label} className={ALERT_PRIORITY_META[a.priority].className} size="sm" />
                      <select
                        value={a.status}
                        onChange={(e) => onUpdateAlertStatus(a.id, e.target.value)}
                        className="text-[11px] border border-neutral-200 rounded-pill px-2 py-0.5"
                      >
                        {Object.entries(ALERT_STATUS_META).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-large border border-neutral-100 p-4">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Atalhos</h2>
            <div className="space-y-2">
              <button onClick={() => onNavigate('clients', {})} className="w-full flex items-center gap-2.5 text-sm px-3 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">
                <Icon name="search" size={15} /> Buscar cliente
              </button>
              <button onClick={() => onNavigate('orders', {})} className="w-full flex items-center gap-2.5 text-sm px-3 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">
                <Icon name="inbox" size={15} /> Central de ordens
              </button>
              <button onClick={() => onNavigate('onboarding', {})} className="w-full flex items-center gap-2.5 text-sm px-3 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">
                <Icon name="userPlus" size={15} /> Onboarding e pendências
              </button>
              <button onClick={() => onNavigate('alerts', {})} className="w-full flex items-center gap-2.5 text-sm px-3 py-2 rounded-pill border border-neutral-200 hover:bg-neutral-50">
                <Icon name="bell" size={15} /> Central de alertas
              </button>
            </div>
          </div>

          <div className="bg-white rounded-large border border-neutral-100 p-4">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Top clientes com saldo disponível</h2>
            {topAvailableBalance.length === 0 ? (
              <div className="text-xs text-neutral-400">Nenhum cliente com saldo disponível nos filtros atuais.</div>
            ) : (
              <div className="divide-y divide-neutral-50">
                {topAvailableBalance.map((c) => (
                  <button key={c.id} onClick={() => onOpenClient(c.id)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-neutral-50 -mx-1 px-1 rounded-medium">
                    <span className="text-sm text-neutral-800 truncate">{c.name}</span>
                    <span className="text-sm font-medium text-neutral-900 shrink-0">{formatCurrency(c.availableBalance)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomePage = HomePage;

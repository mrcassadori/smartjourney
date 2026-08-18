// Jornada Admin — páginas de detalhe (usuário / perfil / carteira de um
// consultor) e os 2 modais de transferência de cliente. Carregado depois de
// AdminPage.jsx (reaproveita AdminKpiCard/adminBookStats exportados de lá).

const ROLE_ACCESS_TYPE = {
  Consultor: 'Exclusivo de consultoria',
  Gestor: 'Gestão e aprovação',
  'Daily Banker': 'Operacional',
  Backoffice: 'Operacional',
  Administrador: 'Irrestrito',
};

function PermissionMatrixTable({ matrix }) {
  const { ADMIN_FUNCTIONALITIES } = window.PortalLib;
  const cols = [
    { key: 'ver', label: 'Visualizar' },
    { key: 'criar', label: 'Criar' },
    { key: 'alterar', label: 'Alterar' },
    { key: 'executar', label: 'Executar / Aprovar' },
  ];
  return (
    <div className="overflow-x-auto border border-neutral-100 rounded-large bg-white">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="bg-neutral-50">
          <tr>
            <th className="text-left font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide">Funcionalidade</th>
            {cols.map((c) => <th key={c.key} className="text-center font-semibold text-neutral-500 px-4 py-2.5 border-b border-neutral-100 text-xs uppercase tracking-wide">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {ADMIN_FUNCTIONALITIES.map((f) => (
            <tr key={f} className="border-b border-neutral-50 last:border-0">
              <td className="px-4 py-3 font-medium text-neutral-800">{f}</td>
              {cols.map((c) => (
                <td key={c.key} className="px-4 py-3 text-center">
                  {matrix[f][c.key] ? <Icon name="check" size={15} className="text-success mx-auto" /> : <span className="text-neutral-300">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConsultantBookTable({ ownerId, clients, orders, recommendations, operations, selectable, selectedKeys, onToggleSelect, onToggleAll, onRowClickToClient }) {
  const { formatCurrency, formatDate, daysUntil, segmentLabel } = window.PortalLib;
  const book = clients.filter((c) => c.ownerId === ownerId);
  const now = window.PORTAL_DATA.now;

  const rows = book.map((c) => {
    const opsAbertas = operations.filter((o) => o.clientId === c.id && !o.resolvedAt).length;
    const recsPendentes = recommendations.filter((r) => r.clientId === c.id && r.status === 'aguardando_cliente').length;
    const pendencias = (c.status === 'pendente' || c.status === 'bloqueado' ? 1 : 0) + (opsAbertas > 0 ? 0 : 0);
    const anosNaCarteira = c.linkDate ? Math.max(0, Math.floor(-daysUntil(c.linkDate, now) / 365)) : null;
    const tempoNaCarteira = anosNaCarteira == null ? '—' : anosNaCarteira === 1 ? '1 ano' : `${anosNaCarteira} anos`;
    return { ...c, opsAbertas, recsPendentes, pendencias, tempoNaCarteira };
  });

  const columns = [
    { key: 'name', label: 'Cliente' },
    { key: 'segment', label: 'Segmento', render: (c) => segmentLabel(c.segment) },
    { key: 'totalWealth', label: 'Patrimônio', render: (c) => formatCurrency(c.totalWealth) },
    { key: 'opsAbertas', label: 'Operações', render: (c) => c.opsAbertas > 0 ? `${c.opsAbertas} abertas` : 'Nenhuma' },
    { key: 'recsPendentes', label: 'Recomendações', render: (c) => c.recsPendentes > 0 ? `${c.recsPendentes} pendente${c.recsPendentes === 1 ? '' : 's'}` : 'Nenhuma' },
    { key: 'pendencias', label: 'Pendências', render: (c) => c.pendencias },
    { key: 'tempoNaCarteira', label: 'Tempo na carteira' },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      keyField="id"
      selectable={selectable}
      selectedKeys={selectedKeys}
      onToggleSelect={onToggleSelect}
      onToggleAll={onToggleAll}
      onRowClick={onRowClickToClient}
      emptyLabel="Nenhum cliente nesta carteira ainda."
    />
  );
}

// ---------- Transferir 1 cliente ----------

function AdminTransferClientModal({ client, currentOwnerId, targets, ownerNameOf, clientStats, onTransfer, onClose }) {
  const { formatCurrency } = window.PortalLib;
  const [newOwnerId, setNewOwnerId] = React.useState((targets[0] || {}).ownerId || '');
  const [motivo, setMotivo] = React.useState('Reorganização de carteira');
  const [opsHandling, setOpsHandling] = React.useState('manter');
  const [confirmed, setConfirmed] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function confirm() {
    onTransfer(client.id, newOwnerId, opsHandling);
    setDone(true);
  }

  return (
    <Modal
      title="Transferir cliente"
      onClose={onClose}
      footer={
        done ? (
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill bg-neutral-900 text-white">Fechar</button>
        ) : (
          <React.Fragment>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
            <button
              disabled={!confirmed || !newOwnerId}
              onClick={confirm}
              className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill text-white', confirmed && newOwnerId ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}
            >
              Transferir cliente
            </button>
          </React.Fragment>
        )
      }
    >
      {done ? (
        <div className="flex items-center gap-2 text-success-dark text-sm"><Icon name="check" size={16} /> {client.name} transferido para {ownerNameOf(newOwnerId)} (ação simulada).</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">Reatribua a responsabilidade da conta para outro consultor.</p>
          <div className="bg-neutral-50 rounded-large p-3 text-sm">
            <div className="font-medium text-neutral-900">{client.name}</div>
            <div className="text-neutral-500">{client.segment} · {ownerNameOf(currentOwnerId)} · {formatCurrency(client.totalWealth)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Consultor atual</label>
              <div className="text-sm text-neutral-500 border border-neutral-100 bg-neutral-50 rounded-pill px-3 py-2">{ownerNameOf(currentOwnerId)}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Novo consultor</label>
              <select value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                {targets.map((t) => <option key={t.ownerId} value={t.ownerId}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Motivo da transferência</label>
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
              {['Reorganização de carteira', 'Saída do consultor', 'Solicitação do cliente', 'Balanceamento de equipe'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="bg-neutral-50 rounded-large p-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div><div className="font-semibold text-neutral-900">1</div><div className="text-xs text-neutral-400">Cliente</div></div>
            <div><div className="font-semibold text-neutral-900">{formatCurrency(clientStats.opsAbertas ? client.totalWealth : client.totalWealth)}</div><div className="text-xs text-neutral-400">Patrimônio</div></div>
            <div><div className="font-semibold text-neutral-900">{clientStats.opsAbertas}</div><div className="text-xs text-neutral-400">Operações abertas</div></div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1.5">Como deseja tratar as operações abertas deste cliente?</label>
            <div className="space-y-1.5">
              <label className="flex items-start gap-2 text-sm"><input type="radio" checked={opsHandling === 'manter'} onChange={() => setOpsHandling('manter')} className="accent-brand mt-0.5" /> Manter responsáveis atuais das operações</label>
              <label className="flex items-start gap-2 text-sm"><input type="radio" checked={opsHandling === 'transferir'} onChange={() => setOpsHandling('transferir')} className="accent-brand mt-0.5" /> Transferir responsabilidade operacional para o novo consultor</label>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5">O responsável pela carteira e o responsável por uma operação podem ser pessoas diferentes.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="accent-brand" /> Confirmo que revisei os impactos da transferência.
          </label>
        </div>
      )}
    </Modal>
  );
}

// ---------- Transferir em massa ----------

function AdminTransferBulkModal({ clientsSelected, currentOwnerId, targets, ownerNameOf, users, allClients, orders, recommendations, operations, onTransferBulk, onClose }) {
  const { formatCurrency } = window.PortalLib;
  const [newOwnerId, setNewOwnerId] = React.useState((targets[0] || {}).ownerId || '');
  const [opsHandling, setOpsHandling] = React.useState('manter');
  const [confirmed, setConfirmed] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const patrimonio = clientsSelected.reduce((s, c) => s + (c.totalWealth || 0), 0);
  const clientIds = new Set(clientsSelected.map((c) => c.id));
  const opsAbertas = operations.filter((o) => clientIds.has(o.clientId) && !o.resolvedAt).length;
  const recsPendentes = recommendations.filter((r) => clientIds.has(r.clientId) && r.status === 'aguardando_cliente').length;
  const pendencias = clientsSelected.filter((c) => c.status === 'pendente' || c.status === 'bloqueado').length;

  const originStats = window.adminBookStats(currentOwnerId, allClients, orders, recommendations, operations);
  const destStats = newOwnerId ? window.adminBookStats(newOwnerId, allClients, orders, recommendations, operations) : null;
  const destAfterCount = destStats ? destStats.book.length + clientsSelected.length : 0;
  const overCapacity = destAfterCount > 120;

  function confirm() {
    onTransferBulk(clientsSelected.map((c) => c.id), newOwnerId, opsHandling);
    setDone(true);
  }

  return (
    <Modal
      title={`Transferir ${clientsSelected.length} cliente${clientsSelected.length === 1 ? '' : 's'}`}
      onClose={onClose}
      width="max-w-lg"
      footer={
        done ? (
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill bg-neutral-900 text-white">Fechar</button>
        ) : (
          <React.Fragment>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">Cancelar</button>
            <button
              disabled={!confirmed || !newOwnerId}
              onClick={confirm}
              className={window.PortalLib.classNames('text-sm px-4 py-2 rounded-pill text-white', confirmed && newOwnerId ? 'bg-brand' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')}
            >
              Confirmar transferência
            </button>
          </React.Fragment>
        )
      }
    >
      {done ? (
        <div className="flex items-center gap-2 text-success-dark text-sm"><Icon name="check" size={16} /> {clientsSelected.length} clientes transferidos para {ownerNameOf(newOwnerId)} (ação simulada).</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">Transfira múltiplos clientes em massa de forma rápida e segura.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Origem</label>
              <div className="text-sm text-neutral-500 border border-neutral-100 bg-neutral-50 rounded-pill px-3 py-2">{ownerNameOf(currentOwnerId)}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Destino</label>
              <select value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                {targets.map((t) => <option key={t.ownerId} value={t.ownerId}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Impactos consolidados da transferência</div>
            <div className="bg-neutral-50 rounded-large p-3 grid grid-cols-4 gap-2 text-center text-sm">
              <div><div className="font-semibold text-neutral-900">{clientsSelected.length}</div><div className="text-[11px] text-neutral-400">Clientes</div></div>
              <div><div className="font-semibold text-neutral-900">{formatCurrency(patrimonio)}</div><div className="text-[11px] text-neutral-400">Patrimônio</div></div>
              <div><div className="font-semibold text-neutral-900">{opsAbertas}</div><div className="text-[11px] text-neutral-400">Op. abertas</div></div>
              <div><div className="font-semibold text-neutral-900">{pendencias}</div><div className="text-[11px] text-neutral-400">Com pendências</div></div>
            </div>
          </div>

          {destStats && (
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Simulação pós-transferência</div>
              <div className="space-y-1.5 text-sm">
                <div className="border border-neutral-100 rounded-medium px-3 py-2">
                  <div className="font-medium text-neutral-800">{ownerNameOf(currentOwnerId)}</div>
                  <div className="text-neutral-500">Antes: {originStats.book.length} clientes / {formatCurrency(originStats.patrimonio)} — Depois: {originStats.book.length - clientsSelected.length} clientes / {formatCurrency(originStats.patrimonio - patrimonio)}</div>
                </div>
                <div className="border border-neutral-100 rounded-medium px-3 py-2">
                  <div className="font-medium text-neutral-800">{ownerNameOf(newOwnerId)}</div>
                  <div className="text-neutral-500">Antes: {destStats.book.length} clientes / {formatCurrency(destStats.patrimonio)} — Depois: {destAfterCount} clientes / {formatCurrency(destStats.patrimonio + patrimonio)}</div>
                </div>
              </div>
            </div>
          )}

          {overCapacity && (
            <div className="bg-warning-light text-warning-dark rounded-medium px-3 py-2.5 text-sm">
              Atenção — {ownerNameOf(newOwnerId)} passará a ter {destAfterCount} clientes após esta transferência, excedendo o limite recomendado para atendimento personalizado.
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1.5">Como tratar a responsabilidade das operações vigentes?</label>
            <div className="space-y-1.5">
              <label className="flex items-start gap-2 text-sm"><input type="radio" checked={opsHandling === 'manter'} onChange={() => setOpsHandling('manter')} className="accent-brand mt-0.5" /> Manter responsáveis atuais das operações</label>
              <label className="flex items-start gap-2 text-sm"><input type="radio" checked={opsHandling === 'transferir'} onChange={() => setOpsHandling('transferir')} className="accent-brand mt-0.5" /> Transferir responsabilidade para o novo consultor</label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="accent-brand" /> Confirmo que revisei os impactos da transferência.
          </label>
        </div>
      )}
    </Modal>
  );
}

// ---------- Detalhe do usuário ----------

const ADMIN_USER_TABS = [
  { key: 'geral', label: 'Visão geral' },
  { key: 'permissoes', label: 'Permissões' },
  { key: 'carteira', label: 'Carteira' },
  { key: 'historico', label: 'Histórico' },
];

function AdminUserDetailPage({ user, clients, orders, recommendations, operations, onBack, onSetUserStatus, onOpenBook }) {
  const { USER_STATUS_META, ROLE_DEFINITIONS, formatCurrency, formatDateTime, formatDate, daysUntil, classNames } = window.PortalLib;
  const [tab, setTab] = React.useState('geral');

  const stats = user.ownerId ? window.adminBookStats(user.ownerId, clients, orders, recommendations, operations) : null;
  const upcoming = stats ? stats.book.filter((c) => daysUntil(c.suitabilityExpiry, window.PORTAL_DATA.now) <= 30 && daysUntil(c.suitabilityExpiry, window.PORTAL_DATA.now) >= 0) : [];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-brand-dark font-medium flex items-center gap-1.5"><Icon name="arrowLeft" size={14} /> Voltar para Usuários e acessos</button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900">{user.name}</h1>
            <StatusPill label={USER_STATUS_META[user.status].label} className={USER_STATUS_META[user.status].className} />
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">{user.role} · {user.equipe}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onSetUserStatus(user.id, user.status === 'ativo' ? 'bloqueado' : 'ativo')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50">
            {user.status === 'ativo' ? 'Bloquear acesso' : 'Desbloquear acesso'}
          </button>
          <button onClick={() => setTab('permissoes')} className="text-sm px-3 py-1.5 rounded-pill border border-neutral-200 hover:bg-neutral-50">Editar permissões</button>
        </div>
      </div>

      <div className="border-b border-neutral-100 flex items-center gap-1">
        {ADMIN_USER_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={classNames('text-sm px-3 py-2 border-b-2 whitespace-nowrap', tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'geral' && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-100 rounded-large p-4">
            <div className="font-medium text-neutral-800 mb-3">Dados do usuário</div>
            <div className="grid sm:grid-cols-2 gap-x-6">
              <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Nome</span><span className="font-medium text-neutral-900">{user.name}</span></div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">E-mail</span><span className="font-medium text-neutral-900">{user.email}</span></div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Perfil</span><span className="font-medium text-neutral-900">{user.role}</span></div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Equipe</span><span className="font-medium text-neutral-900">{user.equipe}</span></div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Data de criação</span><span className="font-medium text-neutral-900">{formatDate(user.createdAt)}</span></div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Último acesso</span><span className="font-medium text-neutral-900">{formatDateTime(user.lastAccessAt)}</span></div>
            </div>
          </div>

          {stats && (
            <div className="bg-white border border-neutral-100 rounded-large p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-neutral-800">Visão geral da carteira</div>
                <button onClick={() => onOpenBook(user.ownerId)} className="text-sm text-brand-dark font-medium">Gerenciar carteira</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <window.AdminKpiCard label="Clientes ativos" value={stats.book.length} />
                <window.AdminKpiCard label="Patrimônio" value={formatCurrency(stats.patrimonio)} />
                <window.AdminKpiCard label="Operações abertas" value={stats.opsAbertas} />
                <window.AdminKpiCard label="Recomendações" value={stats.recsPendentes} />
              </div>
            </div>
          )}

          {stats && (
            <div className="bg-white border border-neutral-100 rounded-large p-4">
              <div className="font-medium text-neutral-800 mb-2">Vencimentos e pendências do consultor</div>
              {upcoming.length === 0 ? (
                <p className="text-sm text-success-dark flex items-center gap-1.5"><Icon name="check" size={14} /> Nenhum vencimento de suitability nos próximos 30 dias.</p>
              ) : (
                <p className="text-sm text-neutral-700">{user.name.split(' ')[0]} possui {upcoming.length} cliente{upcoming.length === 1 ? '' : 's'} com suitability vencendo nos próximos 30 dias sem renovação registrada.</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'permissoes' && <PermissionMatrixTable matrix={ROLE_DEFINITIONS[user.role].matrix} />}

      {tab === 'carteira' && (
        stats ? (
          <ConsultantBookTable ownerId={user.ownerId} clients={clients} orders={orders} recommendations={recommendations} operations={operations} />
        ) : (
          <window.EmptyState icon="users" title="Este perfil não tem carteira própria" description={`${user.role} não gerencia clientes diretamente no Portal.`} />
        )
      )}

      {tab === 'historico' && <window.EmptyState icon="clock" title="Histórico consolidado em Administração → Histórico" description="Filtre pelo nome deste usuário na aba Histórico para ver todas as alterações relacionadas a ele." action={<button onClick={onBack} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Voltar</button>} />}
    </div>
  );
}

// ---------- Detalhe do perfil ----------

function AdminRoleDetailPage({ role, users, onBack }) {
  const { ROLE_DEFINITIONS } = window.PortalLib;
  const def = ROLE_DEFINITIONS[role];
  const count = users.filter((u) => u.role === role).length;

  if (!def) return <window.EmptyState icon="shield" title="Perfil não encontrado" action={<button onClick={onBack} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Voltar</button>} />;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-brand-dark font-medium flex items-center gap-1.5"><Icon name="arrowLeft" size={14} /> Voltar para Perfis e permissões</button>
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{role}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{def.description}</p>
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-4">
        <div className="font-medium text-neutral-800 mb-3">Resumo do perfil</div>
        <div className="grid sm:grid-cols-3 gap-x-6">
          <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Status</span><StatusPill label="Ativo" className="bg-success-light text-success-dark" size="sm" /></div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Usuários associados</span><span className="font-medium text-neutral-900">{count} usuário{count === 1 ? '' : 's'}</span></div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-50 text-sm"><span className="text-neutral-500">Tipo de acesso</span><span className="font-medium text-neutral-900">{ROLE_ACCESS_TYPE[role]}</span></div>
        </div>
      </div>

      <div>
        <div className="font-medium text-neutral-800 mb-2">Matriz de permissões</div>
        <p className="text-xs text-neutral-400 mb-3">Nível de acesso acumulativo (esquerda para direita).</p>
        <PermissionMatrixTable matrix={def.matrix} />
      </div>
    </div>
  );
}

// ---------- Carteira de um consultor ----------

function AdminBookDetailPage({ ownerId, clients, orders, recommendations, operations, users, onBack, onTransferClient, onTransferClientsBulk }) {
  const { OWNER_NAME_MAP, formatCurrency } = window.PortalLib;
  const [selected, setSelected] = React.useState([]);
  const [transferTarget, setTransferTarget] = React.useState(null); // { mode: 'single'|'bulk', clientsSelected }

  const ownerUser = users.find((u) => u.ownerId === ownerId);
  const ownerName = OWNER_NAME_MAP[ownerId] || (ownerUser ? ownerUser.name : ownerId);
  const stats = window.adminBookStats(ownerId, clients, orders, recommendations, operations);
  const ownerNameOf = (oid) => OWNER_NAME_MAP[oid] || (users.find((u) => u.ownerId === oid) || {}).name || oid;
  const targets = users.filter((u) => (u.role === 'Consultor' || u.role === 'Daily Banker') && u.ownerId && u.ownerId !== ownerId && u.status === 'ativo').map((u) => ({ ownerId: u.ownerId, name: u.name }));

  const selectedClients = clients.filter((c) => selected.indexOf(c.id) !== -1);
  const selectedPatrimonio = selectedClients.reduce((s, c) => s + (c.totalWealth || 0), 0);

  function toggleSelect(id) {
    setSelected((prev) => (prev.indexOf(id) !== -1 ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleAll(ids, checked) {
    setSelected(checked ? ids : []);
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-brand-dark font-medium flex items-center gap-1.5"><Icon name="arrowLeft" size={14} /> Voltar para Gestão de carteiras</button>
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Carteira de {ownerName}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Visualize todos os clientes e patrimônio distribuídos sob responsabilidade direta de {ownerName.split(' ')[0]}.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <window.AdminKpiCard label="Clientes ativos" value={stats.book.length} />
        <window.AdminKpiCard label="Patrimônio sob gestão" value={formatCurrency(stats.patrimonio)} />
        <window.AdminKpiCard label="Operações abertas" value={stats.opsAbertas} />
        <window.AdminKpiCard label="Recomendações pendentes" value={stats.recsPendentes} />
      </div>

      <div>
        <div className="font-medium text-neutral-800 mb-2">Lista de clientes</div>
        <ConsultantBookTable
          ownerId={ownerId}
          clients={clients}
          orders={orders}
          recommendations={recommendations}
          operations={operations}
          selectable
          selectedKeys={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
        />
      </div>

      {selected.length > 0 && (
        <div className="sticky bottom-4 bg-neutral-900 text-white rounded-large px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <span className="text-sm">{selected.length} cliente{selected.length === 1 ? '' : 's'} selecionado{selected.length === 1 ? '' : 's'} · Patrimônio: {formatCurrency(selectedPatrimonio)}</span>
          <button
            onClick={() => setTransferTarget({ mode: selectedClients.length === 1 ? 'single' : 'bulk', clientsSelected: selectedClients })}
            className="text-sm px-4 py-2 rounded-pill bg-brand text-white shrink-0"
          >
            Transferir clientes
          </button>
        </div>
      )}

      {transferTarget && transferTarget.mode === 'single' && targets.length > 0 && (
        <AdminTransferClientModal
          client={transferTarget.clientsSelected[0]}
          currentOwnerId={ownerId}
          targets={targets}
          ownerNameOf={ownerNameOf}
          clientStats={{ opsAbertas: operations.filter((o) => o.clientId === transferTarget.clientsSelected[0].id && !o.resolvedAt).length }}
          onTransfer={(clientId, newOwnerId, opsHandling) => onTransferClient(clientId, newOwnerId, opsHandling)}
          onClose={() => { setTransferTarget(null); setSelected([]); }}
        />
      )}
      {transferTarget && transferTarget.mode === 'bulk' && targets.length > 0 && (
        <AdminTransferBulkModal
          clientsSelected={transferTarget.clientsSelected}
          currentOwnerId={ownerId}
          targets={targets}
          ownerNameOf={ownerNameOf}
          users={users}
          allClients={clients}
          orders={orders}
          recommendations={recommendations}
          operations={operations}
          onTransferBulk={(clientIds, newOwnerId, opsHandling) => onTransferClientsBulk(clientIds, newOwnerId, opsHandling)}
          onClose={() => { setTransferTarget(null); setSelected([]); }}
        />
      )}
    </div>
  );
}

window.AdminUserDetailPage = AdminUserDetailPage;
window.AdminRoleDetailPage = AdminRoleDetailPage;
window.AdminBookDetailPage = AdminBookDetailPage;

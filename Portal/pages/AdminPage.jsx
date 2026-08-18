// Jornada Admin — referência Figma "Jornada Admin" (node 281:30245), módulo
// "Administração": usuários e acessos, perfis e permissões, gestão de
// carteiras (transferência de clientes) e histórico de alterações. Visível
// só para perfis com `admin` em `permissions.menu` (hoje só o Administrador);
// para os demais, aparece no rail "trancado" (mesmo padrão de "Relatórios").
//
// `Portal/pages/AdminDetailPages.jsx` (carregado depois) tem as 3 páginas de
// detalhe (usuário/perfil/carteira de um consultor) e os modais de
// transferência, reaproveitados também por este arquivo.

const ADMIN_TABS = [
  { key: 'usuarios', label: 'Usuários e acessos' },
  { key: 'perfis', label: 'Perfis e permissões' },
  { key: 'carteiras', label: 'Gestão de carteiras' },
  { key: 'historico', label: 'Histórico' },
];

const ADMIN_TAB_COPY = {
  usuarios: { title: 'Gerencie quem possui acesso ao Portal e quais perfis estão associados a cada usuário.' },
  perfis: { title: 'Gerencie os níveis de acesso utilizados como padrão para cada função.' },
  carteiras: { title: 'Visualize a distribuição dos clientes entre consultores e realize transferências de carteira.' },
  historico: { title: 'Consulte mudanças de acesso, permissões e carteiras realizadas no Portal.' },
};

function AdminKpiCard({ label, value, tone }) {
  const valueClass = tone === 'alert' ? 'text-alert-dark' : 'text-neutral-900';
  return (
    <div className="bg-white border border-neutral-100 rounded-large px-4 py-3">
      <div className={window.PortalLib.classNames('text-2xl font-semibold', valueClass)}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}

function consultantIds(users) {
  return users.filter((u) => u.ownerId).map((u) => u.ownerId);
}

function bookStats(ownerId, clients, orders, recommendations, operations) {
  const book = clients.filter((c) => c.ownerId === ownerId);
  const clientIds = new Set(book.map((c) => c.id));
  const patrimonio = book.reduce((s, c) => s + (c.totalWealth || 0), 0);
  const opsAbertas = operations.filter((o) => clientIds.has(o.clientId) && !o.resolvedAt).length;
  const recsPendentes = recommendations.filter((r) => clientIds.has(r.clientId) && r.status === 'aguardando_cliente').length;
  const pendencias = book.filter((c) => c.status === 'pendente' || c.status === 'bloqueado').length;
  return { book, patrimonio, opsAbertas, recsPendentes, pendencias };
}

// ---------- Usuários e acessos ----------

function AdminUsersTab({ users, clients, onOpenUser, onSetUserStatus, onOpenNewUser }) {
  const { USER_STATUS_META, formatCurrency, formatDateTime, classNames } = window.PortalLib;
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [role, setRole] = React.useState('');
  const [menuOpenId, setMenuOpenId] = React.useState(null);

  const roles = Array.from(new Set(users.map((u) => u.role)));
  const kpis = {
    ativos: users.filter((u) => u.status === 'ativo').length,
    gestores: users.filter((u) => u.role === 'Gestor').length,
    consultores: users.filter((u) => u.role === 'Consultor').length,
    bloqueados: users.filter((u) => u.status === 'bloqueado').length,
  };

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.equipe.toLowerCase().includes(q)) &&
      (!status || u.status === status) &&
      (!role || u.role === role)
    );
  });

  const gestorName = (gid) => (gid ? (users.find((u) => u.id === gid) || {}).name || '—' : '—');
  const carteira = (u) => (u.ownerId ? `${clients.filter((c) => c.ownerId === u.ownerId).length} clientes` : '—');

  const hasFilters = query || status || role;

  const columns = [
    { key: 'user', label: 'Usuário', render: (u) => <div><div className="font-medium text-neutral-900">{u.name}</div><div className="text-xs text-neutral-400">{u.email}</div></div> },
    { key: 'role', label: 'Perfil' },
    { key: 'equipe', label: 'Equipe' },
    { key: 'gestor', label: 'Gestor', render: (u) => gestorName(u.gestorId) },
    { key: 'carteira', label: 'Carteira', render: (u) => carteira(u) },
    { key: 'lastAccessAt', label: 'Último acesso', render: (u) => formatDateTime(u.lastAccessAt) },
    { key: 'status', label: 'Status', render: (u) => <StatusPill label={USER_STATUS_META[u.status].label} className={USER_STATUS_META[u.status].className} size="sm" /> },
    {
      key: 'actions', label: 'Ações', sortable: false,
      render: (u) => (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpenId(menuOpenId === u.id ? null : u.id)} className="text-neutral-400 hover:text-neutral-700 px-2">•••</button>
          {menuOpenId === u.id && (
            <React.Fragment>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-neutral-100 rounded-large shadow-lg z-20 py-1.5">
                <button onClick={() => { onOpenUser(u.id); setMenuOpenId(null); }} className="w-full text-left text-sm px-3 py-2 hover:bg-neutral-50">Ver usuário</button>
                <button
                  onClick={() => { onSetUserStatus(u.id, u.status === 'ativo' ? 'bloqueado' : 'ativo'); setMenuOpenId(null); }}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-neutral-50"
                >
                  {u.status === 'ativo' ? 'Bloquear acesso' : 'Desbloquear acesso'}
                </button>
              </div>
            </React.Fragment>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AdminKpiCard label="Usuários ativos" value={kpis.ativos} />
        <AdminKpiCard label="Gestores" value={kpis.gestores} />
        <AdminKpiCard label="Consultores" value={kpis.consultores} />
        <AdminKpiCard label="Acessos bloqueados" value={kpis.bloqueados} tone={kpis.bloqueados > 0 ? 'alert' : undefined} />
      </div>

      <div className="bg-white border border-neutral-100 rounded-large p-3 flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por nome, e-mail, perfil ou equipe" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 flex-1 min-w-[240px]" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Status</option>
          <option value="ativo">Ativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Perfil</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {hasFilters && <button onClick={() => { setQuery(''); setStatus(''); setRole(''); }} className="text-sm text-brand-dark font-medium">Limpar filtros</button>}
        <button onClick={onOpenNewUser} className="ml-auto text-sm px-4 py-2 rounded-pill bg-brand text-white flex items-center gap-1.5 shrink-0">
          <Icon name="userPlus" size={14} /> Novo usuário
        </button>
      </div>

      <DataTable columns={columns} rows={filtered} keyField="id" onRowClick={(u) => onOpenUser(u.id)} emptyLabel="Nenhum usuário para esses filtros." />
      <div className="text-sm text-neutral-500">Mostrando {filtered.length} de {users.length} usuários</div>
    </div>
  );
}

// ---------- Perfis e permissões ----------

function AdminRolesTab({ users, onOpenRole }) {
  const { ROLE_DEFINITIONS } = window.PortalLib;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => {
        const count = users.filter((u) => u.role === role).length;
        return (
          <div key={role} className="bg-white border border-neutral-100 rounded-large p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-neutral-900">{role}</div>
              <span className="text-xs text-neutral-400">{count} usuário{count === 1 ? '' : 's'}</span>
            </div>
            <p className="text-sm text-neutral-600 mb-3">{def.description}</p>
            <button onClick={() => onOpenRole(role)} className="text-sm text-brand-dark font-medium">Ver permissões</button>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Gestão de carteiras ----------

function AdminBooksTab({ users, clients, orders, recommendations, operations, auditLog, onOpenBook }) {
  const { formatCurrency } = window.PortalLib;
  const [query, setQuery] = React.useState('');
  const consultants = users.filter((u) => u.ownerId);

  const rows = consultants
    .map((u) => {
      const stats = bookStats(u.ownerId, clients, orders, recommendations, operations);
      const segCounts = {};
      stats.book.forEach((c) => { segCounts[c.segment] = (segCounts[c.segment] || 0) + 1; });
      const topSeg = Object.entries(segCounts).sort((a, b) => b[1] - a[1])[0];
      return { id: u.id, user: u, ...stats, topSegment: topSeg ? topSeg[0] : '—' };
    })
    .filter((r) => !query || r.user.name.toLowerCase().includes(query.toLowerCase()) || r.book.some((c) => c.name.toLowerCase().includes(query.toLowerCase())));

  const totalClients = clients.length;
  const totalPatrimonio = clients.reduce((s, c) => s + (c.totalWealth || 0), 0);

  const columns = [
    { key: 'consultor', label: 'Consultor', render: (r) => r.user.name },
    { key: 'clientes', label: 'Clientes', render: (r) => `${r.book.length} clientes` },
    { key: 'patrimonio', label: 'Patrimônio', render: (r) => formatCurrency(r.patrimonio) },
    { key: 'segmento', label: 'Segmento principal', render: (r) => r.topSegment },
    { key: 'operacoes', label: 'Operações abertas', render: (r) => `${r.opsAbertas} ativas` },
    { key: 'pendencias', label: 'Pendências', render: (r) => r.pendencias },
    { key: 'gestor', label: 'Gestor', render: (r) => (users.find((u) => u.id === r.user.gestorId) || {}).name || '—' },
    { key: 'acoes', label: 'Ações', sortable: false, render: (r) => <button onClick={(e) => { e.stopPropagation(); onOpenBook(r.user.ownerId); }} className="text-sm text-brand-dark font-medium">Ver carteira</button> },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AdminKpiCard label="Consultores ativos" value={consultants.filter((u) => u.status === 'ativo').length} />
        <AdminKpiCard label="Clientes mapeados" value={totalClients} />
        <AdminKpiCard label="Patrimônio sob custódia" value={formatCurrency(totalPatrimonio)} />
        <AdminKpiCard label="Transferências recentes" value={auditLog.filter((e) => e.action === 'cliente_transferido').length} />
      </div>
      <div className="bg-white border border-neutral-100 rounded-large p-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por consultor ou cliente" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 w-full max-w-md" />
      </div>
      <DataTable columns={columns} rows={rows} keyField="id" onRowClick={(r) => onOpenBook(r.user.ownerId)} emptyLabel="Nenhum consultor para esse filtro." />
    </div>
  );
}

// ---------- Histórico ----------

function AdminHistoryTab({ auditLog }) {
  const { ADMIN_AUDIT_ACTION_META, formatDateTime } = window.PortalLib;
  const [actionFilter, setActionFilter] = React.useState('');
  const [query, setQuery] = React.useState('');

  const filtered = auditLog.filter((e) => (!actionFilter || e.action === actionFilter) && (!query || e.target.toLowerCase().includes(query.toLowerCase()) || e.actor.toLowerCase().includes(query.toLowerCase())));

  const columns = [
    { key: 'date', label: 'Data', render: (e) => formatDateTime(e.date) },
    { key: 'action', label: 'Ação', render: (e) => ADMIN_AUDIT_ACTION_META[e.action].label },
    { key: 'target', label: 'Alvo', render: (e) => e.target },
    { key: 'detail', label: 'Alteração', render: (e) => e.detail },
    { key: 'actor', label: 'Realizado por', render: (e) => e.actor },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white border border-neutral-100 rounded-large p-3 flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por usuário afetado ou responsável" className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5 flex-1 min-w-[240px]" />
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="text-sm border border-neutral-200 rounded-pill px-3 py-1.5">
          <option value="">Tipo de alteração</option>
          {Object.entries(ADMIN_AUDIT_ACTION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <DataTable columns={columns} rows={filtered} keyField="id" emptyLabel="Nenhum registro para esses filtros." />
      <div className="text-sm text-neutral-500">Mostrando {filtered.length} de {auditLog.length} registros</div>
    </div>
  );
}

// ---------- Novo usuário (wizard, 4 etapas) ----------

const NEW_USER_STEPS = [
  { key: 'dados', label: 'Dados' },
  { key: 'permissoes', label: 'Permissões' },
  { key: 'carteira', label: 'Carteira' },
  { key: 'revisao', label: 'Revisão' },
];

function NewUserWizard({ users, onCreate, onClose }) {
  const { ROLE_DEFINITIONS, NEW_USER_PERMISSION_GROUPS, classNames } = window.PortalLib;
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('Consultor');
  const [equipe, setEquipe] = React.useState('Åpen Capital');
  const [perms, setPerms] = React.useState({});
  const [sensitiveConfirmed, setSensitiveConfirmed] = React.useState(false);
  const [gestorId, setGestorId] = React.useState('');
  const gestores = users.filter((u) => u.role === 'Gestor');

  function togglePerm(key) {
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  }
  const hasSensitiveChecked = NEW_USER_PERMISSION_GROUPS.some((g) => g.items.some((i) => i.sensitive && perms[i.key]));
  const step1Valid = name.trim() && email.trim();
  const step2Valid = !hasSensitiveChecked || sensitiveConfirmed;

  function confirmCreate() {
    onCreate({ name: name.trim(), email: email.trim(), role, equipe, gestorId: gestorId || null });
    setDone(true);
  }

  return (
    <Drawer title="Novo usuário" subtitle="Crie um acesso e defina as permissões iniciais deste usuário." onClose={onClose} width="w-full max-w-xl">
      {done ? (
        <div className="flex items-center gap-2 text-success-dark text-sm">
          <Icon name="check" size={16} /> Usuário criado (ação simulada) — já aparece na lista de "Usuários e acessos".
        </div>
      ) : (
        <React.Fragment>
          <div className="flex items-center gap-1 mb-5">
            {NEW_USER_STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className={classNames('w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0', i < step ? 'bg-success text-white' : i === step ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-400')}>
                  {i < step ? <Icon name="check" size={12} /> : i + 1}
                </div>
                <span className={classNames('text-xs mr-2', i === step ? 'text-brand-dark font-medium' : 'text-neutral-400')}>{s.label}</span>
                {i < NEW_USER_STEPS.length - 1 && <div className="h-px flex-1 bg-neutral-100 mr-2" />}
              </React.Fragment>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">E-mail</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">Perfil</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                    {Object.keys(ROLE_DEFINITIONS).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">Equipe</label>
                  <input value={equipe} onChange={(e) => setEquipe(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-large px-3 py-2.5 text-sm">
                <span className="text-neutral-400">Perfil base: </span>
                <span className="font-medium text-neutral-800">{role}</span>
                <p className="text-neutral-500 mt-1">{ROLE_DEFINITIONS[role].description}</p>
              </div>
              {NEW_USER_PERMISSION_GROUPS.map((g) => (
                <div key={g.key}>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">{g.label}</div>
                  <div className="space-y-1.5">
                    {g.items.map((it) => (
                      <label key={it.key} className="flex items-center gap-2 text-sm text-neutral-700">
                        <input type="checkbox" checked={!!perms[it.key]} onChange={() => togglePerm(it.key)} className="accent-brand" />
                        {it.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {hasSensitiveChecked && (
                <div className="bg-warning-light text-warning-dark rounded-medium px-3 py-2.5 text-sm space-y-2">
                  <div className="font-medium">Esta permissão permite realizar ações financeiras ou cadastrais em nome dos clientes.</div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={sensitiveConfirmed} onChange={(e) => setSensitiveConfirmed(e.target.checked)} className="accent-warning" />
                    Confirmo que este usuário deve possuir essa permissão.
                  </label>
                </div>
              )}
            </div>
          )}

          {step === 2 && (role === 'Consultor' || role === 'Daily Banker') && (
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">Gestor direto</label>
              <select value={gestorId} onChange={(e) => setGestorId(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2">
                <option value="">Sem gestor definido</option>
                {gestores.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <p className="text-xs text-neutral-400 mt-2">Este usuário inicia sem clientes na carteira — atribua clientes depois em "Gestão de carteiras".</p>
            </div>
          )}
          {step === 2 && role !== 'Consultor' && role !== 'Daily Banker' && (
            <p className="text-sm text-neutral-500">Perfis {role} não têm carteira própria de clientes — nenhuma configuração adicional necessária aqui.</p>
          )}

          {step === 3 && (
            <div className="space-y-2 text-sm">
              <div className="bg-neutral-50 rounded-large p-3 space-y-1.5">
                <div className="flex items-center justify-between"><span className="text-neutral-500">Nome</span><span className="font-medium text-neutral-900">{name}</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-500">E-mail</span><span className="font-medium text-neutral-900">{email}</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-500">Perfil</span><span className="font-medium text-neutral-900">{role}</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-500">Equipe</span><span className="font-medium text-neutral-900">{equipe}</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-500">Gestor</span><span className="font-medium text-neutral-900">{(gestores.find((g) => g.id === gestorId) || {}).name || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-500">Permissões marcadas</span><span className="font-medium text-neutral-900">{Object.values(perms).filter(Boolean).length}</span></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
            <button onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700">{step === 0 ? 'Cancelar' : 'Voltar'}</button>
            {step < NEW_USER_STEPS.length - 1 ? (
              <button
                disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)}
                onClick={() => setStep((s) => s + 1)}
                className={classNames('text-sm px-4 py-2 rounded-pill text-white', (step === 0 && !step1Valid) || (step === 1 && !step2Valid) ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-brand')}
              >
                Continuar
              </button>
            ) : (
              <button onClick={confirmCreate} className="text-sm px-4 py-2 rounded-pill bg-brand text-white">Criar usuário</button>
            )}
          </div>
        </React.Fragment>
      )}
    </Drawer>
  );
}

// ---------- Página principal ----------

function AdminPage({ profile, users, clients, orders, recommendations, operations, auditLog, initialTab, onOpenUser, onOpenRole, onOpenBook, onCreateUser, onSetUserStatus }) {
  const [tab, setTab] = React.useState(initialTab || 'usuarios');
  const [newUserOpen, setNewUserOpen] = React.useState(false);
  const loading = window.useSimulatedLoading(`admin|${tab}`, 250);

  if (profile.permissions.menu.indexOf('admin') === -1) {
    return <window.NoPermissionState title="Sem acesso à Administração" description="Este perfil não tem permissão para gerenciar usuários, perfis ou carteiras. Fale com um administrador para revisar o acesso." />;
  }

  const copy = ADMIN_TAB_COPY[tab];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-medium text-brand-dark uppercase tracking-wide">Administração</div>
        <h1 className="text-xl font-semibold text-neutral-900 mt-0.5">{ADMIN_TABS.find((t) => t.key === tab).label}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{copy.title}</p>
      </div>

      <div className="border-b border-neutral-100 flex items-center gap-1 overflow-x-auto">
        {ADMIN_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={window.PortalLib.classNames('text-sm px-3 py-2 border-b-2 whitespace-nowrap', tab === t.key ? 'border-brand text-brand-dark font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <window.SkeletonRows count={6} />
      ) : (
        <React.Fragment>
          {tab === 'usuarios' && <AdminUsersTab users={users} clients={clients} onOpenUser={onOpenUser} onSetUserStatus={onSetUserStatus} onOpenNewUser={() => setNewUserOpen(true)} />}
          {tab === 'perfis' && <AdminRolesTab users={users} onOpenRole={onOpenRole} />}
          {tab === 'carteiras' && <AdminBooksTab users={users} clients={clients} orders={orders} recommendations={recommendations} operations={operations} auditLog={auditLog} onOpenBook={onOpenBook} />}
          {tab === 'historico' && <AdminHistoryTab auditLog={auditLog} />}
        </React.Fragment>
      )}

      {newUserOpen && <NewUserWizard users={users} onCreate={onCreateUser} onClose={() => setNewUserOpen(false)} />}
    </div>
  );
}

window.AdminPage = AdminPage;
window.AdminKpiCard = AdminKpiCard;
window.adminBookStats = bookStats;

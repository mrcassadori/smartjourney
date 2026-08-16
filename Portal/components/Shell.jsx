// Header + navegação lateral (tema escuro, ref. "Cliente Novo.png") + busca
// global (US-03) + sino de alertas (US-07) + troca de perfil/cenário sem auth.

// Rail escuro fixo com logo no topo, 8 itens de menu e o perfil na base. O
// header (busca + Ajuda + sino + persona) fica só sobre a área de conteúdo —
// sem os antigos pills "Jornada/Portal" (o link para a Jornada foi para a base
// do rail, discreto). `route` navega; `comingSoon` abre "em breve"; `permKey`
// (opcional) checa permissão numa chave diferente da rota.
const NAV_ITEMS = [
  { key: 'visao-geral', label: 'Visão geral', icon: 'home', route: 'home' },
  { key: 'clientes', label: 'Clientes', icon: 'users', route: 'clients' },
  { key: 'produtos', label: 'Produtos', icon: 'layers', route: 'products', activeRoutes: ['proposta'] },
  { key: 'recomendacoes', label: 'Recomendações', icon: 'target', route: 'simulacoes', permKey: 'recommendations' },
  { key: 'ordens', label: 'Ordens', icon: 'inbox', route: 'orders' },
  { key: 'relatorios', label: 'Relatórios', icon: 'fileText', comingSoon: true },
  { key: 'operacoes', label: 'Operações', icon: 'lifeBuoy', route: 'operations' },
  { key: 'suporte', label: 'Suporte', icon: 'helpCircle', route: 'support' },
];

// Mantidos só para registrar as chaves "em breve" em app.jsx (COMING_SOON_KEYS)
// — não são mais renderizados no rail; "Ajuda" agora vive no header.
const NAV_FOOTER_ITEMS = [
  { key: 'favoritos-menu', label: 'Favoritos', icon: 'star', comingSoon: true },
  { key: 'ajuda', label: 'Ajuda', icon: 'helpCircle', comingSoon: true },
  { key: 'configuracoes', label: 'Configurações', icon: 'settings', comingSoon: true },
];

const NAV_ITEMS_FLAT = NAV_ITEMS.concat(NAV_FOOTER_ITEMS);

function SidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <span className="w-8 h-8 rounded-medium bg-brand flex items-center justify-center text-white font-black text-lg shrink-0" style={{ fontFamily: 'Georgia, serif' }}>i</span>
      <span className="leading-tight">
        <span className="block text-white font-bold text-[15px]">Inter</span>
        <span className="block text-[9px] tracking-[0.15em] text-[#7c8698] uppercase">Consultor Portal</span>
      </span>
    </div>
  );
}

function ProfileSwitcher({ profiles, currentProfile, onChange }) {
  const [open, setOpen] = React.useState(false);
  const initials = currentProfile.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-large text-left hover:bg-white/5"
      >
        <span className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-bold shrink-0">{initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white truncate">{currentProfile.name}</span>
          <span className="block text-[11px] text-[#7c8698] truncate">{currentProfile.escritorio || currentProfile.role}</span>
        </span>
        <Icon name="chevronDown" size={14} className="text-[#7c8698] shrink-0" />
      </button>
      {open && (
        <React.Fragment>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-full bottom-0 ml-2 w-72 bg-white border border-neutral-100 rounded-large shadow-lg z-20 py-1.5">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Trocar cenário de perfil (sem autenticação real)</div>
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className={window.PortalLib.classNames(
                  'w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50',
                  p.id === currentProfile.id && 'bg-brand-lightest/40'
                )}
              >
                <span className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 truncate">{p.name}</span>
                  <span className="block text-[11px] text-neutral-500 truncate">{p.role} · {p.escritorio}</span>
                </span>
                {p.id === currentProfile.id && <Icon name="check" size={14} className="text-brand ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function GlobalSearch({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className="relative flex-1 max-w-md"
    >
      <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Busque por nome, CPF, e-mail, telefone…"
        className="w-full text-sm border border-neutral-200 rounded-pill pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
      />
    </form>
  );
}

function AlertsBell({ count, onClick }) {
  return (
    <button onClick={onClick} className="relative w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100" aria-label="Central de alertas">
      <Icon name="bell" size={18} />
      {count > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-alert text-white text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

function paramsEqual(a, b) {
  return JSON.stringify(a || {}) === JSON.stringify(b || {});
}

function isItemActive(item, current, pageParams) {
  if (item.comingSoon) return current === item.key;
  if (item.activeRoutes && item.activeRoutes.indexOf(current) !== -1) return true;
  return current === item.route && paramsEqual(item.routeParams, pageParams);
}

function itemTitle(item, allowed) {
  if (item.comingSoon) return 'Fora do escopo deste protótipo (ver descrição na página "em breve")';
  if (!allowed) return 'Sem permissão para este perfil — clique para ver o estado de bloqueio';
  return undefined;
}

// Linha do menu escuro: botão direto com barra laranja à direita quando ativo.
function NavRow({ item, current, pageParams, permissions, onNavigate }) {
  const permKey = item.permKey || item.route;
  const allowed = item.comingSoon || !permKey || !permissions || permissions.menu.indexOf(permKey) !== -1;
  const active = isItemActive(item, current, pageParams);
  const muted = item.comingSoon || !allowed;
  return (
    <button
      title={itemTitle(item, allowed)}
      onClick={() => onNavigate(item.route || item.key, item.routeParams || {})}
      className={window.PortalLib.classNames(
        'relative w-full flex items-center gap-3 pl-5 pr-3 py-2.5 text-left text-sm transition-colors',
        active ? 'text-white bg-white/[0.07] font-semibold' : muted ? 'text-[#5f6a7d] hover:bg-white/[0.03]' : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
      )}
    >
      {active && <span className="absolute right-0 top-1.5 bottom-1.5 w-[3px] rounded-l bg-brand" />}
      <Icon name={item.icon} size={18} className="shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.comingSoon && <span className="text-[9px] uppercase tracking-wide text-[#5f6a7d]">em breve</span>}
      {!item.comingSoon && !allowed && <Icon name="shield" size={13} className="text-[#5f6a7d]" />}
    </button>
  );
}

function Sidebar({ current, pageParams, onNavigate, permissions, profiles, profile, onChangeProfile }) {
  return (
    <nav className="w-60 shrink-0 bg-[#0f1826] hidden lg:flex lg:flex-col sticky top-0 h-screen z-20">
      <SidebarLogo />
      <div className="mt-2 space-y-0.5 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} current={current} pageParams={pageParams} permissions={permissions} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="px-2 py-3 mt-2 border-t border-white/10 shrink-0">
        <a href="../prototype.html" title="Ir para o protótipo de pesquisa da Jornada (CX Journey Mapper)" className="w-full flex items-center gap-2 px-3 py-2 rounded-large text-[11px] text-[#7c8698] hover:text-white hover:bg-white/5">
          <Icon name="mapSignpost" size={14} className="shrink-0" /> Jornada (pesquisa CX)
        </a>
        <ProfileSwitcher profiles={profiles} currentProfile={profile} onChange={onChangeProfile} />
      </div>
    </nav>
  );
}

function Shell({ profile, profiles, onChangeProfile, current, pageParams, onNavigate, alertsCount, search, onSearchChange, onSearchSubmit, breadcrumb, activeCartClient, onResumeCart, children }) {
  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      <Sidebar
        current={current}
        pageParams={pageParams}
        onNavigate={onNavigate}
        permissions={profile.permissions}
        profiles={profiles}
        profile={profile}
        onChangeProfile={onChangeProfile}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-neutral-100 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <GlobalSearch value={search} onChange={onSearchChange} onSubmit={onSearchSubmit} />
          {activeCartClient && (
            <button
              onClick={onResumeCart}
              title="Retomar a recomendação em andamento para este cliente"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-brand border border-brand/30 rounded-pill px-3 py-1.5 hover:bg-brand-lightest whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              Cliente: {activeCartClient.name} ({activeCartClient.account})
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <button onClick={() => onNavigate('ajuda')} className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800">
              <Icon name="helpCircle" size={16} /> Ajuda
            </button>
            <AlertsBell count={alertsCount} onClick={() => onNavigate('alerts')} />
            <div className="pl-3 border-l border-neutral-200 text-right leading-tight">
              <div className="text-sm font-semibold text-neutral-900">{profile.name}</div>
              <div className="text-[10px] font-semibold tracking-wide text-brand uppercase">{profile.escritorio || profile.role}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {breadcrumb && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-neutral-300">/</span>}
                  {b.onClick ? (
                    <button onClick={b.onClick} className="hover:text-neutral-700 hover:underline">{b.label}</button>
                  ) : (
                    <span className={i === breadcrumb.length - 1 ? 'text-brand-dark font-medium' : 'text-neutral-500'}>{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {children}
        </main>
        <footer className="text-center text-[11px] text-neutral-300 py-6 px-6">
          Protótipo 100% mockado — sem conexão com APIs, backend ou dados reais de clientes. Todas as ações são simuladas e vivem só no estado desta sessão do navegador.
        </footer>
      </div>
    </div>
  );
}

window.Shell = Shell;
window.PORTAL_NAV_ITEMS = NAV_ITEMS_FLAT;

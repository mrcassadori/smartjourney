// Header + navegação lateral + busca global (US-03) + sino de alertas (US-07)
// + troca de perfil/cenário sem auth real.

// Menu lateral plano e fixo (workspace de wealth management): 8 itens diretos,
// sem flyout. `route` navega para uma página real; `comingSoon` abre o estado
// "em breve". `permKey` (opcional) permite checar a permissão contra uma chave
// diferente da rota (ex.: Recomendações usa a rota do Simulador mas a permissão
// de `recommendations`). O rodapé (Favoritos/Ajuda/Configurações + Perfil) fica
// separado na base do rail.
const NAV_ITEMS = [
  { key: 'visao-geral', label: 'Visão geral', icon: 'home', route: 'home' },
  { key: 'clientes', label: 'Clientes', icon: 'users', route: 'clients' },
  { key: 'produtos', label: 'Produtos', icon: 'layers', route: 'products' },
  { key: 'recomendacoes', label: 'Recomendações', icon: 'target', route: 'simulacoes', permKey: 'recommendations' },
  { key: 'ordens', label: 'Ordens', icon: 'inbox', route: 'orders' },
  { key: 'relatorios', label: 'Relatórios', icon: 'fileText', comingSoon: true },
  { key: 'operacoes', label: 'Operações', icon: 'lifeBuoy', route: 'operations' },
  { key: 'suporte', label: 'Suporte', icon: 'helpCircle', route: 'support' },
];

const NAV_FOOTER_ITEMS = [
  { key: 'favoritos-menu', label: 'Favoritos', icon: 'star', comingSoon: true },
  { key: 'ajuda', label: 'Ajuda', icon: 'helpCircle', comingSoon: true },
  { key: 'configuracoes', label: 'Configurações', icon: 'settings', comingSoon: true },
];

const NAV_ITEMS_FLAT = NAV_ITEMS.concat(NAV_FOOTER_ITEMS);

function ProductSwitcher() {
  return (
    <div className="inline-flex items-center rounded-pill bg-neutral-100 p-0.5 text-xs font-medium">
      <a
        href="../prototype.html"
        className="px-3 py-1.5 rounded-pill text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5"
        title="Ir para o protótipo de pesquisa da Jornada (CX Journey Mapper)"
      >
        <Icon name="mapSignpost" size={14} />
        Jornada
      </a>
      <span className="px-3 py-1.5 rounded-pill bg-white text-neutral-900 shadow-sm flex items-center gap-1.5">
        <Icon name="briefcase" size={14} />
        Portal do Consultor
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
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-large text-left text-neutral-600 hover:bg-neutral-50"
      >
        <span className="w-8 h-8 rounded-full bg-brand-lightest text-brand-dark flex items-center justify-center text-xs font-bold shrink-0">{initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-neutral-900 truncate">{currentProfile.name}</span>
          <span className="block text-[11px] text-neutral-500 truncate">{currentProfile.role}</span>
        </span>
        <Icon name="chevronDown" size={14} className="text-neutral-400 shrink-0" />
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
        placeholder="Buscar por nome, CPF, e-mail, telefone ou conta…"
        className="w-full text-sm border border-neutral-200 rounded-pill pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
      />
    </form>
  );
}

function AlertsBell({ count, onClick }) {
  return (
    <button onClick={onClick} className="relative w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50" aria-label="Central de alertas">
      <Icon name="bell" size={17} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-alert text-white text-[10px] font-bold flex items-center justify-center">
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
  return current === item.route && paramsEqual(item.routeParams, pageParams);
}

function itemTitle(item, allowed) {
  if (item.comingSoon) return 'Fora do escopo deste protótipo (ver descrição na página "em breve")';
  if (!allowed) return 'Sem permissão para este perfil — clique para ver o estado de bloqueio';
  return undefined;
}

// Linha do menu plano: botão direto (usado tanto no bloco principal quanto no rodapé).
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
        'w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-large text-left text-sm',
        active ? 'bg-brand-lightest text-brand-dark font-medium' : muted ? 'text-neutral-400 hover:bg-neutral-50' : 'text-neutral-600 hover:bg-neutral-50'
      )}
    >
      <Icon name={item.icon} size={18} className="shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.comingSoon && <span className="text-[10px] uppercase tracking-wide text-neutral-300">em breve</span>}
      {!item.comingSoon && !allowed && <Icon name="shield" size={13} className="text-neutral-300" />}
    </button>
  );
}

function Sidebar({ current, pageParams, onNavigate, permissions, profiles, profile, onChangeProfile }) {
  return (
    <nav className="w-56 shrink-0 border-r border-neutral-100 bg-white py-4 hidden lg:flex lg:flex-col relative z-20">
      <div className="px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} current={current} pageParams={pageParams} permissions={permissions} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="px-2 pt-3 mt-3 space-y-0.5 border-t border-neutral-100 shrink-0">
        {NAV_FOOTER_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} current={current} pageParams={pageParams} permissions={null} onNavigate={onNavigate} />
        ))}
        <ProfileSwitcher profiles={profiles} currentProfile={profile} onChange={onChangeProfile} />
      </div>
    </nav>
  );
}

function Shell({ profile, profiles, onChangeProfile, current, pageParams, onNavigate, alertsCount, search, onSearchChange, onSearchSubmit, breadcrumb, children }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="bg-white border-b border-neutral-100 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-black text-lg tracking-tight text-brand">inter</span>
          <span className="hidden md:inline text-sm text-neutral-400">Portal do Consultor</span>
        </div>
        <ProductSwitcher />
        <GlobalSearch value={search} onChange={onSearchChange} onSubmit={onSearchSubmit} />
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <AlertsBell count={alertsCount} onClick={() => onNavigate('alerts')} />
        </div>
      </header>
      <div className="flex">
        <Sidebar
          current={current}
          pageParams={pageParams}
          onNavigate={onNavigate}
          permissions={profile.permissions}
          profiles={profiles}
          profile={profile}
          onChangeProfile={onChangeProfile}
        />
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {breadcrumb && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Icon name="chevronRight" size={12} />}
                  {b.onClick ? (
                    <button onClick={b.onClick} className="hover:text-neutral-700 hover:underline">{b.label}</button>
                  ) : (
                    <span className="text-neutral-600">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {children}
        </main>
      </div>
      <footer className="text-center text-[11px] text-neutral-300 py-6 px-6">
        Protótipo 100% mockado — sem conexão com APIs, backend ou dados reais de clientes. Todas as ações são simuladas e vivem só no estado desta sessão do navegador.
      </footer>
    </div>
  );
}

window.Shell = Shell;
window.PORTAL_NAV_ITEMS = NAV_ITEMS_FLAT;

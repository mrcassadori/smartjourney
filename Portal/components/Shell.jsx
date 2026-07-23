// Header + navegação lateral orientada a tarefas (US-01) + busca global
// (US-03) + sino de alertas (US-07) + troca de perfil/cenário sem auth real.

// Navegação agrupada por tarefa do consultor (não por silo de produto nem
// por estrutura interna da instituição — sem categorias genéricas tipo
// "Ferramentas"/"Gestão"/"Outros"). 7 grupos de topo, cada um com itens de
// nível 2; "Cadastros" (em Clientes) e "Classes de Ativos" (em Investimentos
// e Ordens) são os únicos agrupamentos de nível 3, expandidos dentro do
// próprio flyout. Itens com `route` já navegam para uma página real deste
// protótipo (reaproveitando o roteamento por `page`/`pageParams` existente);
// itens sem `route` (`comingSoon: true`) abrem um estado "em breve" — a
// maioria, porque esta rodada fechou a árvore de navegação completa antes de
// construir todas as telas atrás dela (ver GOVERNANCA.md).
const NAV_GROUPS = [
  {
    key: 'visao-geral',
    label: 'Visão Geral',
    icon: 'home',
    items: [
      { key: 'painel-consultor', label: 'Painel do Consultor', icon: 'home', route: 'home' },
      { key: 'pendencias-geral', label: 'Pendências', icon: 'alertTriangle', comingSoon: true },
      { key: 'oportunidades', label: 'Oportunidades', icon: 'target', comingSoon: true },
      { key: 'atividades-recentes', label: 'Atividades Recentes', icon: 'clock', comingSoon: true },
    ],
  },
  {
    key: 'clientes',
    label: 'Clientes',
    icon: 'users',
    items: [
      { key: 'minha-base', label: 'Minha Base', icon: 'users', route: 'clients' },
      { key: 'buscar-cliente', label: 'Buscar Cliente', icon: 'search', route: 'clients' },
      { key: 'clientes-favoritos', label: 'Clientes Favoritos', icon: 'star', comingSoon: true },
      { key: 'visualizados-recentemente', label: 'Visualizados Recentemente', icon: 'clock', comingSoon: true },
      { key: 'clientes-ativacao', label: 'Clientes em Ativação', icon: 'userPlus', route: 'onboarding' },
      { key: 'clientes-pendencias', label: 'Clientes com Pendências', icon: 'alertTriangle', route: 'clients', routeParams: { statusFilter: 'pendente' } },
      {
        key: 'cadastros',
        label: 'Cadastros',
        icon: 'file',
        children: [
          { key: 'cadastro-pf', label: 'Pessoa Física', icon: 'users', comingSoon: true },
          { key: 'cadastro-pj', label: 'Pessoa Jurídica', icon: 'building', comingSoon: true },
          { key: 'cadastro-internacional', label: 'Conta Internacional', icon: 'externalLink', comingSoon: true },
        ],
      },
    ],
  },
  {
    key: 'carteiras-planejamento',
    label: 'Carteiras e Planejamento',
    icon: 'layers',
    items: [
      { key: 'visao-consolidada', label: 'Visão Consolidada', icon: 'wallet', comingSoon: true },
      { key: 'comparador-carteiras', label: 'Comparador de Carteiras', icon: 'layers', comingSoon: true },
      { key: 'simulador-investimentos', label: 'Simulador de Investimentos', icon: 'target', comingSoon: true },
      { key: 'planejamento-financeiro', label: 'Planejamento Financeiro', icon: 'flag', comingSoon: true },
      { key: 'carteiras-recomendadas', label: 'Carteiras Recomendadas', icon: 'sparkles', comingSoon: true },
      { key: 'propostas-andamento', label: 'Propostas em Andamento', icon: 'fileText', comingSoon: true },
      { key: 'relatorios-carteira', label: 'Relatórios de Carteira', icon: 'fileText', comingSoon: true },
    ],
  },
  {
    key: 'investimentos-ordens',
    label: 'Investimentos e Ordens',
    icon: 'target',
    items: [
      { key: 'explorar-investimentos', label: 'Explorar Investimentos', icon: 'layers', route: 'products' },
      { key: 'cesta-recomendacoes', label: 'Cesta de Recomendações', icon: 'target', route: 'recommendations' },
      { key: 'ordens', label: 'Ordens', icon: 'inbox', route: 'orders' },
      { key: 'ordens-lote', label: 'Ordens em Lote', icon: 'copy', comingSoon: true },
      { key: 'historico-ordens', label: 'Histórico de Ordens', icon: 'clock', route: 'orders', routeParams: { status: 'executada' } },
      {
        key: 'classes-ativos',
        label: 'Classes de Ativos',
        icon: 'layers',
        children: [
          { key: 'classe-renda-fixa', label: 'Renda Fixa', icon: 'wallet', route: 'products' },
          { key: 'classe-fundos', label: 'Fundos', icon: 'layers', route: 'products', routeParams: { klass: 'Fundos' } },
          { key: 'classe-renda-variavel', label: 'Renda Variável', icon: 'trendingUp', route: 'products' },
          { key: 'classe-globais', label: 'Investimentos Globais', icon: 'externalLink', route: 'products', routeParams: { klass: 'Global' } },
          { key: 'classe-previdencia', label: 'Previdência', icon: 'shield', route: 'products', routeParams: { klass: 'Previdência' } },
          { key: 'classe-coe', label: 'COE', icon: 'fileText', comingSoon: true },
          { key: 'classe-estruturados', label: 'Estruturados', icon: 'building', comingSoon: true },
        ],
      },
    ],
  },
  {
    key: 'operacoes-atendimento',
    label: 'Operações e Atendimento',
    icon: 'lifeBuoy',
    items: [
      { key: 'contas-pf', label: 'Contas Pessoa Física', icon: 'users', comingSoon: true },
      { key: 'contas-pj', label: 'Contas Pessoa Jurídica', icon: 'building', comingSoon: true },
      { key: 'conta-internacional-op', label: 'Conta Internacional', icon: 'externalLink', comingSoon: true },
      { key: 'cartoes', label: 'Cartões', icon: 'creditCard', comingSoon: true },
      { key: 'transferencias', label: 'Transferências', icon: 'trendingUp', comingSoon: true },
      { key: 'portabilidade', label: 'Portabilidade', icon: 'refresh', comingSoon: true },
      { key: 'credenciais-acessos', label: 'Credenciais e Acessos', icon: 'shield', route: 'operations' },
      { key: 'documentos', label: 'Documentos', icon: 'file', route: 'operations' },
      { key: 'solicitacoes-atendimento', label: 'Solicitações e Atendimento', icon: 'lifeBuoy', route: 'support' },
    ],
  },
  {
    key: 'gestao-base',
    label: 'Gestão da Base',
    icon: 'briefcase',
    items: [
      { key: 'dashboard-base', label: 'Dashboard da Base', icon: 'briefcase', comingSoon: true },
      { key: 'captacao-retiradas', label: 'Captação e Retiradas', icon: 'trendingUp', comingSoon: true },
      { key: 'saldos-disponiveis', label: 'Saldos Disponíveis', icon: 'wallet', comingSoon: true },
      { key: 'vencimentos', label: 'Vencimentos', icon: 'clock', route: 'alerts', routeParams: { type: 'vencimento_proximo' } },
      { key: 'ativacoes', label: 'Ativações', icon: 'userPlus', route: 'onboarding' },
      { key: 'pendencias-base', label: 'Pendências', icon: 'alertTriangle', route: 'clients', routeParams: { statusFilter: 'pendente' } },
      { key: 'performance-carteiras', label: 'Performance das Carteiras', icon: 'trendingUp', comingSoon: true },
      { key: 'relatorios-gerenciais', label: 'Relatórios Gerenciais', icon: 'fileText', comingSoon: true },
    ],
  },
  {
    key: 'conteudos',
    label: 'Conteúdos',
    icon: 'fileText',
    items: [
      { key: 'noticias-analises', label: 'Notícias e Análises', icon: 'fileText', comingSoon: true },
      { key: 'materiais-apoio', label: 'Materiais de Apoio', icon: 'file', comingSoon: true },
      { key: 'campanhas', label: 'Campanhas', icon: 'sparkles', comingSoon: true },
      { key: 'produtos-destaque', label: 'Produtos em Destaque', icon: 'target', comingSoon: true },
      { key: 'biblioteca-conteudos', label: 'Biblioteca de Conteúdos', icon: 'file', comingSoon: true },
    ],
  },
];

// Rodapé do rail, separado dos 7 grupos: sem flyout de lista, cada botão age
// direto (Favoritos/Ajuda/Configurações abrem "em breve"; Perfil abre o
// seletor de cenário, ver `ProfileSwitcher`).
const NAV_FOOTER_ITEMS = [
  { key: 'favoritos-menu', label: 'Favoritos', icon: 'star', comingSoon: true },
  { key: 'ajuda', label: 'Ajuda', icon: 'helpCircle', comingSoon: true },
  { key: 'configuracoes', label: 'Configurações', icon: 'settings', comingSoon: true },
];

function flattenNavItems(items) {
  return items.reduce((acc, item) => {
    if (item.children) return acc.concat(flattenNavItems(item.children));
    return acc.concat([item]);
  }, []);
}

const NAV_ITEMS_FLAT = NAV_GROUPS.reduce((acc, g) => acc.concat(flattenNavItems(g.items)), []).concat(NAV_FOOTER_ITEMS);

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

function NavFlyoutRow({ item, current, pageParams, permissions, onNavigate, onDone, indent }) {
  const allowed = item.comingSoon || permissions.menu.indexOf(item.route) !== -1;
  const muted = item.comingSoon || !allowed;
  const active = isItemActive(item, current, pageParams);
  return (
    <button
      title={itemTitle(item, allowed)}
      onClick={() => {
        onNavigate(item.route || item.key, item.routeParams || {});
        onDone();
      }}
      className={window.PortalLib.classNames(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-large text-sm text-left',
        indent && 'pl-8',
        active ? 'bg-brand-lightest text-brand-dark font-medium' : muted ? 'text-neutral-400 hover:bg-neutral-50' : 'text-neutral-600 hover:bg-neutral-50'
      )}
    >
      <Icon name={item.icon} size={16} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.comingSoon && <span className="text-[10px] uppercase tracking-wide text-neutral-300">em breve</span>}
      {!item.comingSoon && !allowed && <Icon name="shield" size={13} className="text-neutral-300" />}
    </button>
  );
}

function NavFlyoutItem({ item, current, pageParams, permissions, onNavigate, onDone, expandedChild, onToggleChild }) {
  if (!item.children) {
    return <NavFlyoutRow item={item} current={current} pageParams={pageParams} permissions={permissions} onNavigate={onNavigate} onDone={onDone} />;
  }
  const expanded = expandedChild === item.key;
  const hasActiveChild = item.children.some((c) => isItemActive(c, current, pageParams));
  return (
    <div>
      <button
        onClick={() => onToggleChild(item.key)}
        className={window.PortalLib.classNames(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-large text-sm text-left',
          hasActiveChild ? 'text-brand-dark font-medium' : 'text-neutral-600 hover:bg-neutral-50'
        )}
      >
        <Icon name={item.icon} size={16} />
        <span className="flex-1 truncate">{item.label}</span>
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={13} className="text-neutral-400" />
      </button>
      {expanded && (
        <div className="space-y-0.5 pb-1">
          {item.children.map((child) => (
            <NavFlyoutRow key={child.key} item={child} current={current} pageParams={pageParams} permissions={permissions} onNavigate={onNavigate} onDone={onDone} indent />
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ current, pageParams, onNavigate, permissions, profiles, profile, onChangeProfile }) {
  const [openGroup, setOpenGroup] = React.useState(null);
  const [expandedChild, setExpandedChild] = React.useState(null);

  const closeNow = () => {
    setOpenGroup(null);
    setExpandedChild(null);
  };

  return (
    <nav className="w-56 shrink-0 border-r border-neutral-100 bg-white py-4 hidden lg:flex lg:flex-col relative z-20">
      {openGroup && <div className="fixed inset-0 z-10" onClick={closeNow} />}
      <div className="px-2 space-y-0.5">
        {NAV_GROUPS.map((group) => {
          const isActiveGroup = flattenNavItems(group.items).some((i) => isItemActive(i, current, pageParams));
          const isOpen = openGroup === group.key;
          return (
            <div key={group.key} className="relative">
              <button
                onClick={() => setOpenGroup((g) => (g === group.key ? null : group.key))}
                className={window.PortalLib.classNames(
                  'relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-large text-left text-sm font-medium',
                  isOpen ? 'z-20 bg-brand text-white' : isActiveGroup ? 'bg-brand-lightest text-brand-dark' : 'font-normal text-neutral-600 hover:bg-neutral-50'
                )}
              >
                <Icon name={group.icon} size={18} className="shrink-0" />
                <span className="flex-1 truncate">{group.label}</span>
                {isActiveGroup && !isOpen && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />}
              </button>
              {isOpen && (
                <div className="fixed left-56 top-16 bottom-4 w-72 flex flex-col bg-white border-y border-r border-neutral-100 rounded-r-large shadow-xl py-2 z-20">
                  <div className="flex items-center justify-between px-3 py-1 mb-1 shrink-0">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">{group.label}</span>
                    <button onClick={closeNow} aria-label="Fechar menu" className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                  <div className="px-2 space-y-0.5 overflow-y-auto">
                    {group.items.map((item) => (
                      <NavFlyoutItem
                        key={item.key}
                        item={item}
                        current={current}
                        pageParams={pageParams}
                        permissions={permissions}
                        onNavigate={onNavigate}
                        onDone={closeNow}
                        expandedChild={expandedChild}
                        onToggleChild={(k) => setExpandedChild((c) => (c === k ? null : k))}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-2 pt-3 mt-3 space-y-0.5 border-t border-neutral-100 shrink-0">
        {NAV_FOOTER_ITEMS.map((item) => (
          <button
            key={item.key}
            title={itemTitle(item, true)}
            onClick={() => onNavigate(item.key, {})}
            className={window.PortalLib.classNames(
              'w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-large text-left text-sm',
              current === item.key ? 'bg-brand-lightest text-brand-dark font-medium' : 'text-neutral-500 hover:bg-neutral-50'
            )}
          >
            <Icon name={item.icon} size={18} className="shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.comingSoon && <span className="text-[10px] uppercase tracking-wide text-neutral-300">em breve</span>}
          </button>
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

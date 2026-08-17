// Portal do Consultor — helpers e dicionários compartilhados.
// Tudo aqui é síncrono e local: nenhuma chamada de rede, nenhuma persistência real.

(function () {
  function uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  function classNames(...args) {
    return args.filter(Boolean).join(' ');
  }

  function formatCurrency(value) {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  }

  function formatCurrencySigned(value) {
    const formatted = formatCurrency(Math.abs(value));
    return value < 0 ? `- ${formatted}` : `+ ${formatted}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr.length <= 10 ? `${dateStr}T00:00:00-03:00` : dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  }

  function daysUntil(dateStr, nowStr) {
    const now = new Date(nowStr);
    const target = new Date(`${dateStr}T00:00:00-03:00`);
    return Math.round((target - now) / (1000 * 60 * 60 * 24));
  }

  function onlyDigits(value) {
    return (value || '').replace(/\D/g, '');
  }

  function maskDocument(doc) {
    const digits = onlyDigits(doc);
    if (digits.length === 11) return `${digits.slice(0, 3)}.***.**${digits.slice(9, 11) ? '-' : ''}${digits.slice(9)}`;
    if (digits.length === 14) return `${digits.slice(0, 2)}.***.***/****-${digits.slice(-2)}`;
    return doc;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(String(text)).catch(() => {});
    return Promise.resolve();
  }

  // Próximo vencimento de uma carteira: posição com maturityDate futura mais próxima.
  function nextMaturity(positions, nowStr) {
    const upcoming = (positions || [])
      .filter((p) => p.maturityDate)
      .map((p) => ({ position: p, days: daysUntil(p.maturityDate, nowStr) }))
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days);
    return upcoming[0] || null;
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------------------
  // Escopo por perfil (US-01 / seção 5 do épico)
  // ---------------------------------------------------------------------
  function clientsInScope(profile, clients) {
    if (!profile || profile.scopeType === 'none') return [];
    if (profile.scopeType === 'all') return clients;
    if (profile.scopeType === 'office') return clients.filter((c) => c.escritorio === profile.escritorio);
    if (profile.scopeType === 'own') return clients.filter((c) => c.ownerId === profile.id);
    return [];
  }

  function canAccess(profile, menuKey) {
    return !!profile && profile.permissions.menu.indexOf(menuKey) !== -1;
  }

  // ---------------------------------------------------------------------
  // Elegibilidade de produto para um cliente (US-10 critério 5, US-11
  // critério 4, US-13 critério 4) — centralizada para não divergir entre
  // Hub de produtos, Simulador e Basket.
  // ---------------------------------------------------------------------
  function isEligible(client, product, now) {
    const reasons = [];
    if (!product.available) reasons.push(product.unavailableReason || 'Produto indisponível para novas aplicações.');
    if (product.eligibleSegments.indexOf(client.segment) === -1) {
      reasons.push(`Segmento ${client.segment} fora do público elegível (${product.eligibleSegments.join('/')}).`);
    }
    if (client.status !== 'ativo') reasons.push('Cliente sem conta ativa.');
    if (daysUntil(client.suitabilityExpiry, now) < 0) reasons.push('Suitability vencido — é preciso renovar antes de recomendar.');
    return { eligible: reasons.length === 0, reasons };
  }

  // ---------------------------------------------------------------------
  // Dicionários de status / semântica visual
  // ---------------------------------------------------------------------
  const ALERT_TYPE_META = {
    vencimento_proximo: { label: 'Vencimento próximo', icon: 'clock' },
    novo_aporte: { label: 'Novo aporte', icon: 'trendingUp' },
    saldo_parado: { label: 'Saldo parado', icon: 'wallet' },
    retirada_relevante: { label: 'Retirada relevante', icon: 'trendingDown' },
    suitability_vencendo: { label: 'Suitability vencendo', icon: 'shield' },
    cadastro_pendente: { label: 'Cadastro pendente', icon: 'userPlus' },
    sem_primeira_aplicacao: { label: 'Sem primeira aplicação', icon: 'flag' },
    ordem_aguardando_aprovacao: { label: 'Ordem aguardando aprovação', icon: 'inbox' },
    ordem_com_erro: { label: 'Ordem com erro', icon: 'alertTriangle' },
    documento_disponivel: { label: 'Documento disponível', icon: 'file' },
  };

  const ALERT_PRIORITY_META = {
    alta: { label: 'Alta', className: 'bg-alert-light text-alert-dark border border-alert/30' },
    media: { label: 'Média', className: 'bg-warning-light text-warning-dark border border-warning/30' },
    baixa: { label: 'Baixa', className: 'bg-neutral-100 text-neutral-600 border border-neutral-200' },
  };

  const ALERT_STATUS_META = {
    novo: { label: 'Novo', className: 'bg-info-light text-info-dark' },
    visualizado: { label: 'Visualizado', className: 'bg-neutral-100 text-neutral-600' },
    em_tratamento: { label: 'Em tratamento', className: 'bg-warning-light text-warning-dark' },
    concluido: { label: 'Concluído', className: 'bg-success-light text-success-dark' },
  };

  const ORDER_STATUS_META = {
    rascunho: { label: 'Rascunho', className: 'bg-neutral-100 text-neutral-600' },
    enviada: { label: 'Enviada', className: 'bg-info-light text-info-dark' },
    aguardando_aprovacao: { label: 'Aguardando aprovação', className: 'bg-warning-light text-warning-dark' },
    aprovada: { label: 'Aprovada', className: 'bg-info-light text-info-dark' },
    em_processamento: { label: 'Em processamento', className: 'bg-warning-light text-warning-dark' },
    executada: { label: 'Executada', className: 'bg-success-light text-success-dark' },
    parcialmente_executada: { label: 'Parcialmente executada', className: 'bg-success-light text-success-dark' },
    recusada: { label: 'Recusada', className: 'bg-alert-light text-alert-dark' },
    cancelada: { label: 'Cancelada', className: 'bg-neutral-100 text-neutral-500' },
    erro: { label: 'Erro', className: 'bg-alert-light text-alert-dark' },
  };

  const ONBOARDING_STATUS_META = {
    convite_enviado: { label: 'Convite enviado', className: 'bg-info-light text-info-dark' },
    aceite_pendente: { label: 'Aceite pendente', className: 'bg-warning-light text-warning-dark' },
    em_validacao: { label: 'Em validação', className: 'bg-warning-light text-warning-dark' },
    ativado: { label: 'Ativado', className: 'bg-success-light text-success-dark' },
    pendencia: { label: 'Pendência', className: 'bg-alert-light text-alert-dark' },
  };

  // Classificação de uma movimentação para apoiar a decisão do consultor
  // (investível × uso bancário) — US-06 / jornada 360.
  const CASH_INVESTABLE_META = {
    investivel: { label: 'Potencialmente investível', className: 'bg-success-light text-success-dark' },
    banking: { label: 'Uso bancário', className: 'bg-neutral-100 text-neutral-600' },
    nao_classificado: { label: 'Não classificado', className: 'bg-warning-light text-warning-dark' },
  };

  const CASH_CATEGORY_META = {
    transferencia: 'Transferência',
    salario: 'Salário',
    vencimento: 'Vencimento',
    resgate: 'Resgate',
    rendimento: 'Rendimento',
    dividendo: 'Dividendo',
    cashback: 'Cashback',
    deposito: 'Depósito',
    nao_classificado: 'Não classificado',
  };

  const CLIENT_STATUS_META = {
    ativo: { label: 'Ativo', className: 'bg-success-light text-success-dark' },
    pendente: { label: 'Pendente', className: 'bg-warning-light text-warning-dark' },
    bloqueado: { label: 'Bloqueado', className: 'bg-alert-light text-alert-dark' },
  };

  const RISK_PROFILE_META = {
    Conservador: { label: 'Conservador', className: 'bg-info-light text-info-dark' },
    Moderado: { label: 'Moderado', className: 'bg-success-light text-success-dark' },
    Agressivo: { label: 'Agressivo', className: 'bg-warning-light text-warning-dark' },
    Sofisticado: { label: 'Sofisticado', className: 'bg-brand-lightest text-brand-dark' },
  };

  const ASSET_CLASS_ORDER = ['Pós-fixado', 'Prefixado', 'Inflação', 'Fundos', 'Ações', 'FIIs', 'Multimercado', 'Previdência', 'Global', 'Caixa'];

  // Cores cíclicas para a barra de composição por classe (Portal/pages/ClientProfilePage.jsx
  // → AssetClassBar), reaproveitando só tons já definidos no tailwind.config do Inter.
  const ASSET_CLASS_COLOR = ['bg-brand', 'bg-info', 'bg-success', 'bg-warning', 'bg-neutral-700', 'bg-brand-light', 'bg-info-dark', 'bg-success-dark', 'bg-warning-dark', 'bg-neutral-400'];

  // Mesma paleta em hex (mesma ordem/ciclo de ASSET_CLASS_COLOR) para uso no
  // Chart.js, que precisa de cor real e não de classe Tailwind.
  const ASSET_CLASS_HEX = ['#FF7A00', '#1E7FE6', '#00A868', '#FFB800', '#424242', '#FF9B3D', '#0F4A87', '#00754A', '#8A5A00', '#9E9E9E'];

  const SIMULATION_STATUS_META = {
    rascunho: { label: 'Rascunho', className: 'bg-neutral-100 text-neutral-600' },
    em_analise: { label: 'Em análise', className: 'bg-info-light text-info-dark' },
    aprovada: { label: 'Aprovada', className: 'bg-success-light text-success-dark' },
    compartilhada: { label: 'Compartilhada', className: 'bg-brand-lightest text-brand-dark' },
    aguardando_cliente: { label: 'Aguardando cliente', className: 'bg-warning-light text-warning-dark' },
    concluida: { label: 'Concluída', className: 'bg-success-light text-success-dark' },
    arquivada: { label: 'Arquivada', className: 'bg-neutral-100 text-neutral-500' },
    // Chaves legadas (simulador antigo) mantidas para compatibilidade de exibição.
    em_revisao: { label: 'Em revisão', className: 'bg-warning-light text-warning-dark' },
    enviada: { label: 'Enviada', className: 'bg-success-light text-success-dark' },
  };

  // Objetivos da simulação (Tela 03 — seleção múltipla). Cada objetivo tem um
  // ícone linear já existente no Icon.jsx e um rótulo consultivo.
  const SIMULATION_OBJECTIVES = [
    { key: 'novo_aporte', label: 'Novo aporte', icon: 'trendingUp' },
    { key: 'rebalancear', label: 'Rebalancear carteira', icon: 'refresh' },
    { key: 'rentabilidade', label: 'Melhorar rentabilidade', icon: 'sparkles' },
    { key: 'liquidez', label: 'Aumentar liquidez', icon: 'wallet' },
    { key: 'reduzir_risco', label: 'Reduzir risco', icon: 'shield' },
    { key: 'diversificar', label: 'Diversificar', icon: 'layers' },
    { key: 'comparar', label: 'Comparar alternativas', icon: 'copy' },
  ];

  const SIMULATION_FUNDING_META = {
    novo: { label: 'Novo recurso', desc: 'Aporte de recurso novo, fora da carteira atual.' },
    carteira: { label: 'Recursos da carteira atual', desc: 'Realocação de posições já existentes.' },
    ambos: { label: 'Combinação dos dois', desc: 'Parte novo aporte, parte realocação.' },
  };

  const PRODUCT_RISK_LABELS = { 1: 'Muito baixo', 2: 'Baixo', 3: 'Moderado', 4: 'Alto', 5: 'Muito alto' };

  // Jornada de Produtos e Carteira Proposta (EP-02).
  // Aderência de um produto à estratégia (motor em analytics.js → productAdherence).
  const ADHERENCE_META = {
    alta: { label: 'Alta aderência', className: 'bg-success-light text-success-dark' },
    adequado: { label: 'Adequado', className: 'bg-info-light text-info-dark' },
    atencao: { label: 'Atenção', className: 'bg-warning-light text-warning-dark' },
    nao_recomendado: { label: 'Não recomendado', className: 'bg-alert-light text-alert-dark' },
  };
  // Situação de uma classe na carteira-alvo (motor → strategyNeeds).
  const NEED_STATUS_META = {
    deficit: { label: 'A alocar', className: 'text-brand', dot: 'bg-brand' },
    reduce: { label: 'Reduzir exposição', className: 'text-neutral-500', dot: 'bg-neutral-300' },
    ok: { label: 'Alocação adequada', className: 'text-success-dark', dot: 'bg-success' },
  };
  // Rótulo de exibição das classes da estratégia (a classe canônica do catálogo
  // mantém o nome; só troca a fachada de duas delas para a linguagem da spec).
  const STRATEGY_CLASS_LABEL = { 'Ações': 'Renda variável', 'Global': 'Internacional' };
  function strategyClassLabel(cls) { return STRATEGY_CLASS_LABEL[cls] || cls; }
  // Tabs por classe — compartilhadas entre o catálogo (US-10) e a jornada de
  // Produtos e Carteira Proposta (EP-02), fonte única.
  const PROD_CLASS_TABS = [
    { key: '', label: 'Todos', classes: null },
    { key: 'Pós-fixado', label: 'Pós-fixado', classes: ['Pós-fixado'] },
    { key: 'Inflação', label: 'Inflação', classes: ['Inflação'] },
    { key: 'Prefixado', label: 'Prefixado', classes: ['Prefixado'] },
    { key: 'Fundos', label: 'Fundos', classes: ['Fundos', 'Multimercado'] },
    { key: 'Ações', label: 'Renda variável', classes: ['Ações'] },
    { key: 'FIIs', label: 'FIIs', classes: ['FIIs'] },
    { key: 'Global', label: 'Internacional', classes: ['Global'] },
  ];

  // Status de exibição de um produto no catálogo (US-10 / catálogo denso).
  const PRODUCT_STATUS_META = {
    indisponivel: { label: 'Indisponível', className: 'bg-alert-light text-alert-dark', rowClassName: 'bg-alert-light/30' },
    estoque_baixo: { label: 'Estoque baixo', className: 'bg-alert-light text-alert-dark', rowClassName: 'bg-alert-light/30' },
    taxa_atualizada: { label: 'Taxa atualizada', className: 'bg-warning-light text-warning-dark', rowClassName: 'bg-warning-light/40' },
    disponivel: { label: 'Disponível', className: 'bg-success-light text-success-dark', rowClassName: '' },
  };
  function productStatus(p) {
    if (!p.available) return 'indisponivel';
    if (p.lowStock) return 'estoque_baixo';
    if (p.rateUpdated) return 'taxa_atualizada';
    return 'disponivel';
  }

  // Status de uma recomendação enviada (Tela 08 — Ordens).
  const REC_STATUS_META = {
    aguardando_cliente: { label: 'Aguardando cliente', className: 'bg-warning-light text-warning-dark' },
    aprovada: { label: 'Aprovada', className: 'bg-info-light text-info-dark' },
    em_processamento: { label: 'Em processamento', className: 'bg-brand-lightest text-brand-dark' },
    executada: { label: 'Executada', className: 'bg-success-light text-success-dark' },
    recusada: { label: 'Recusada', className: 'bg-alert-light text-alert-dark' },
  };

  const SERVICE_TYPE_META = {
    reset_credencial: { label: 'Reset de credencial', icon: 'shield' },
    bloqueio_preventivo: { label: 'Bloqueio preventivo', icon: 'alertTriangle' },
    consulta_documento: { label: 'Consulta de documento', icon: 'file' },
    servico_bancario: { label: 'Serviço bancário', icon: 'wallet' },
  };

  const SERVICE_REQUEST_STATUS_META = {
    aberta: { label: 'Aberta', className: 'bg-warning-light text-warning-dark' },
    em_andamento: { label: 'Em andamento', className: 'bg-info-light text-info-dark' },
    concluida: { label: 'Concluída', className: 'bg-success-light text-success-dark' },
  };

  const TICKET_STATUS_META = {
    aberto: { label: 'Aberto', className: 'bg-warning-light text-warning-dark' },
    em_andamento: { label: 'Em andamento', className: 'bg-info-light text-info-dark' },
    resolvido: { label: 'Resolvido', className: 'bg-success-light text-success-dark' },
  };

  const TICKET_URGENCY_META = {
    alta: { label: 'Alta', className: 'bg-alert-light text-alert-dark' },
    media: { label: 'Média', className: 'bg-warning-light text-warning-dark' },
    baixa: { label: 'Baixa', className: 'bg-neutral-100 text-neutral-600' },
  };

  const TICKET_IMPACT_META = {
    alta: { label: 'Alto' },
    media: { label: 'Médio' },
    baixa: { label: 'Baixo' },
  };

  const TICKET_CONTEXT_META = {
    client: { label: 'Cliente' },
    order: { label: 'Ordem' },
    onboarding: { label: 'Onboarding' },
    service: { label: 'Serviço operacional' },
  };

  const HOLDING_ROLE_META = {
    assinatura_individual: { label: 'Assinatura individual', className: 'bg-success-light text-success-dark' },
    assinatura_conjunta: { label: 'Assinatura conjunta', className: 'bg-warning-light text-warning-dark' },
    consulta: { label: 'Só consulta', className: 'bg-neutral-100 text-neutral-600' },
  };

  // Nomes para exibir "consultor responsável" mesmo quando o dono não é um
  // dos 5 perfis selecionáveis no seletor de cenário (colegas fictícios de equipe).
  const OWNER_NAME_MAP = {
    consultor: 'Marina Ferraz',
    consultor_2: 'Bruno Castilho',
    alocador: 'Rafael Nunes',
    daily_banker: 'Camila Duarte',
    daily_banker_2: 'Diego Antunes',
  };

  // Rótulos de segmento no vocabulário da referência visual (Cliente Novo.png).
  const SEGMENT_LABEL = { Standard: 'Retail', High: 'High Income', Private: 'Private', Corporate: 'Corporate', Wealth: 'Wealth' };
  function segmentLabel(seg) { return SEGMENT_LABEL[seg] || seg; }
  // Cor do "ponto" de segmento ao lado do nome do cliente.
  const SEGMENT_DOT = { Private: '#7C3AED', High: '#FF7A00', Wealth: '#0EA5E9', Corporate: '#0F766E', Standard: '#64748B' };
  function segmentDot(seg) { return SEGMENT_DOT[seg] || '#64748B'; }

  window.PortalLib = {
    uid,
    classNames,
    SEGMENT_LABEL,
    segmentLabel,
    segmentDot,
    formatCurrency,
    formatCurrencySigned,
    formatDate,
    formatDateTime,
    daysUntil,
    onlyDigits,
    maskDocument,
    copyToClipboard,
    nextMaturity,
    download,
    clientsInScope,
    canAccess,
    isEligible,
    ALERT_TYPE_META,
    ALERT_PRIORITY_META,
    ALERT_STATUS_META,
    ORDER_STATUS_META,
    ONBOARDING_STATUS_META,
    CASH_CATEGORY_META,
    CASH_INVESTABLE_META,
    CLIENT_STATUS_META,
    RISK_PROFILE_META,
    ASSET_CLASS_ORDER,
    ASSET_CLASS_COLOR,
    ASSET_CLASS_HEX,
    OWNER_NAME_MAP,
    SIMULATION_STATUS_META,
    SIMULATION_OBJECTIVES,
    SIMULATION_FUNDING_META,
    PRODUCT_RISK_LABELS,
    ADHERENCE_META,
    NEED_STATUS_META,
    STRATEGY_CLASS_LABEL,
    strategyClassLabel,
    PROD_CLASS_TABS,
    PRODUCT_STATUS_META,
    productStatus,
    REC_STATUS_META,
    SERVICE_TYPE_META,
    SERVICE_REQUEST_STATUS_META,
    TICKET_STATUS_META,
    TICKET_URGENCY_META,
    TICKET_IMPACT_META,
    TICKET_CONTEXT_META,
    HOLDING_ROLE_META,
  };
})();

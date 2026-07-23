// Placeholder para itens da árvore de navegação que ainda não têm página
// real neste protótipo. A IA (Portal/components/Shell.jsx → NAV_GROUPS) foi
// fechada por completo nesta rodada antes de todas as telas atrás dela
// existirem — cada entrada aqui explica o que a tela faria e, quando existe,
// aponta para a funcionalidade real equivalente já construída.

const COMING_SOON_META = {
  'pendencias-geral': { title: 'Pendências', desc: 'Painel consolidado de pendências do consultor. Já dá para ver clientes com pendência em Clientes → Clientes com Pendências.' },
  oportunidades: { title: 'Oportunidades', desc: 'Lista de oportunidades de negócio priorizadas pela base. Hoje essa priorização já existe em Central de alertas e em Investimentos e Ordens → Cesta de Recomendações.' },
  'atividades-recentes': { title: 'Atividades Recentes', desc: 'Linha do tempo de ações do consultor na base (ordens enviadas, chamados abertos, clientes visitados).' },

  'clientes-favoritos': { title: 'Clientes Favoritos', desc: 'Lista de clientes marcados como favoritos pelo consultor para acesso rápido. Favoritar um cliente ainda não existe neste protótipo.' },
  'visualizados-recentemente': { title: 'Visualizados Recentemente', desc: 'Histórico dos últimos clientes abertos nesta sessão, para retomar o atendimento rapidamente.' },
  'cadastro-pf': { title: 'Cadastro — Pessoa Física', desc: 'Fluxo de abertura de cadastro para um novo cliente pessoa física.' },
  'cadastro-pj': { title: 'Cadastro — Pessoa Jurídica', desc: 'Fluxo de abertura de cadastro para um novo cliente pessoa jurídica, incluindo sócios e representantes.' },
  'cadastro-internacional': { title: 'Cadastro — Conta Internacional', desc: 'Fluxo de abertura de conta internacional para um cliente já cadastrado.' },

  'visao-consolidada': { title: 'Visão Consolidada', desc: 'Visão agregada de todas as carteiras da base do consultor, cruzando classes de ativos e clientes.' },
  'comparador-carteiras': { title: 'Comparador de Carteiras', desc: 'Comparação lado a lado entre a carteira atual de um cliente e uma ou mais carteiras modelo.' },
  'simulador-investimentos': { title: 'Simulador de Investimentos', desc: 'Neste protótipo o simulador é sempre aberto a partir de uma proposta existente — veja Investimentos e Ordens → Cesta de Recomendações e abra ou crie uma simulação por lá.' },
  'planejamento-financeiro': { title: 'Planejamento Financeiro', desc: 'Ferramenta de planejamento de metas financeiras de longo prazo do cliente (aposentadoria, objetivos, etc.).' },
  'carteiras-recomendadas': { title: 'Carteiras Recomendadas', desc: 'Modelos de carteira recomendados pela casa por perfil de risco e objetivo, para aplicar a um ou vários clientes.' },
  'propostas-andamento': { title: 'Propostas em Andamento', desc: 'Painel com todas as propostas em aberto da base, por estágio. Já dá para ver as propostas por cliente em Investimentos e Ordens → Cesta de Recomendações.' },
  'relatorios-carteira': { title: 'Relatórios de Carteira', desc: 'Relatório consolidado de carteira por cliente ou por segmento. A geração de relatório por proposta individual já existe dentro do Simulador (aba "Comparativo e relatório" de cada proposta).' },

  'ordens-lote': { title: 'Ordens em Lote', desc: 'Envio da mesma ordem para múltiplos clientes de uma vez, com validação de elegibilidade por cliente.' },
  'classe-coe': { title: 'COE', desc: 'Catálogo de Certificados de Operações Estruturadas. Esta classe ainda não existe no catálogo de produtos deste protótipo.' },
  'classe-estruturados': { title: 'Estruturados', desc: 'Catálogo de produtos estruturados. Esta classe ainda não existe no catálogo de produtos deste protótipo.' },

  'contas-pf': { title: 'Contas Pessoa Física', desc: 'Gestão de contas digitais de clientes pessoa física (abertura, limites, encerramento).' },
  'contas-pj': { title: 'Contas Pessoa Jurídica', desc: 'Gestão de contas digitais de clientes pessoa jurídica.' },
  'conta-internacional-op': { title: 'Conta Internacional', desc: 'Gestão operacional de contas internacionais já abertas (movimentação, câmbio).' },
  cartoes: { title: 'Cartões', desc: 'Gestão de cartões vinculados às contas dos clientes (emissão, bloqueio, limites).' },
  transferencias: { title: 'Transferências', desc: 'Execução e acompanhamento de transferências entre contas do cliente.' },
  portabilidade: { title: 'Portabilidade', desc: 'Fluxo de portabilidade de investimentos ou previdência de outra instituição.' },

  'dashboard-base': { title: 'Dashboard da Base', desc: 'Painel gerencial com a visão consolidada de toda a base do consultor ou escritório — distinto do Painel do Consultor (pessoal), que já existe em Visão Geral.' },
  'captacao-retiradas': { title: 'Captação e Retiradas', desc: 'Detalhamento de captação líquida e retiradas da base por período. O indicador resumido já aparece no Painel do Consultor.' },
  'saldos-disponiveis': { title: 'Saldos Disponíveis', desc: 'Lista de clientes com saldo disponível relevante para alocação, ordenada por valor.' },
  'performance-carteiras': { title: 'Performance das Carteiras', desc: 'Rentabilidade das carteiras da base comparada a benchmarks, por cliente e por classe de ativo.' },
  'relatorios-gerenciais': { title: 'Relatórios Gerenciais', desc: 'Relatórios consolidados da base para acompanhamento gerencial (captação, ativação, produtividade).' },

  'noticias-analises': { title: 'Notícias e Análises', desc: 'Conteúdo de research e análises de mercado da casa, para embasar recomendações ao cliente.' },
  'materiais-apoio': { title: 'Materiais de Apoio', desc: 'Apresentações, one-pagers e materiais comerciais de apoio à venda.' },
  campanhas: { title: 'Campanhas', desc: 'Campanhas comerciais ativas e elegibilidade de clientes da base a cada uma.' },
  'produtos-destaque': { title: 'Produtos em Destaque', desc: 'Curadoria de produtos priorizados pela casa no período. O catálogo completo já existe em Investimentos e Ordens → Explorar Investimentos.' },
  'biblioteca-conteudos': { title: 'Biblioteca de Conteúdos', desc: 'Repositório central de todo o conteúdo comercial e educacional disponível ao consultor.' },

  'favoritos-menu': { title: 'Favoritos', desc: 'Atalhos fixados pelo consultor para páginas e clientes usados com frequência.' },
  ajuda: { title: 'Ajuda', desc: 'Central de ajuda e documentação do Portal do Consultor.' },
  configuracoes: { title: 'Configurações', desc: 'Preferências pessoais do consultor (notificações, exibição, atalhos).' },
};

function ComingSoonPage({ pageKey }) {
  const meta = COMING_SOON_META[pageKey] || { title: 'Em breve', desc: 'Fora do escopo deste protótipo.' };
  return (
    <window.EmptyState
      icon="sparkles"
      title={`${meta.title} — fora do escopo deste protótipo`}
      description={meta.desc}
    />
  );
}

window.ComingSoonPage = ComingSoonPage;

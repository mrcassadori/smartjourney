// Portal do Consultor — base sintética (EN-01)
// Nenhum dado aqui é real: nomes, CPFs, saldos, ordens e alertas são fictícios,
// criados só para demonstrar os fluxos do protótipo. Nada é buscado de API alguma.

(function () {
  const NOW = '2026-07-20T09:00:00-03:00';

  // ---------------------------------------------------------------------
  // Perfis / cenários de acesso (US-01, seção 5 do épico)
  // scopeType: 'own' (só clientes vinculados ao usuário), 'office' (base do
  // escritório inteiro) ou 'all' (toda a base, uso do Administrador).
  // ---------------------------------------------------------------------
  const profiles = [
    {
      id: 'consultor',
      name: 'Marina Ferraz',
      role: 'Consultor',
      escritorio: 'Åpen Capital',
      scopeType: 'own',
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'planning', 'recommendations', 'operations', 'support'], canRetryOrders: true, canApprove: false, canViewConsolidated: false, canCreateBasket: false, canOperateDirectly: false },
    },
    {
      id: 'alocador',
      name: 'Rafael Nunes',
      role: 'Alocador',
      escritorio: 'Åpen Capital',
      scopeType: 'office',
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'planning', 'recommendations', 'operations', 'support'], canRetryOrders: true, canApprove: true, canViewConsolidated: false, canCreateBasket: true, canOperateDirectly: false },
    },
    {
      id: 'daily_banker',
      name: 'Camila Duarte',
      role: 'Daily Banker',
      escritorio: 'Ticker Investimentos',
      scopeType: 'office',
      permissions: { menu: ['home', 'clients', 'onboarding', 'alerts', 'operations', 'support'], canRetryOrders: false, canApprove: false, canViewConsolidated: false, canCreateBasket: false, canOperateDirectly: true },
    },
    {
      id: 'gestor',
      name: 'Eduardo Prado',
      role: 'Gestor do escritório',
      escritorio: 'Ticker Investimentos',
      scopeType: 'office',
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'planning', 'recommendations', 'operations', 'support'], canRetryOrders: false, canApprove: true, canViewConsolidated: true, canCreateBasket: false, canOperateDirectly: false },
    },
    {
      id: 'admin',
      name: 'Bianca Rocha',
      role: 'Administrador',
      escritorio: 'Inter — Consultorias',
      scopeType: 'all',
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'planning', 'recommendations', 'operations', 'support'], canRetryOrders: true, canApprove: true, canViewConsolidated: true, canCreateBasket: true, canOperateDirectly: true },
    },
    {
      id: 'sem_vinculo',
      name: 'Thiago Alves',
      role: 'Consultor',
      escritorio: '—',
      scopeType: 'none',
      permissions: { menu: [], canRetryOrders: false, canApprove: false, canViewConsolidated: false, canCreateBasket: false, canOperateDirectly: false },
    },
  ];

  // ---------------------------------------------------------------------
  // Clientes (PF/PJ fictícios)
  // ---------------------------------------------------------------------
  const clients = [
    { id: 'C01', name: 'Helena Bittencourt', type: 'PF', cpfCnpj: '123.456.789-01', riskProfile: 'Agressivo', email: 'helena.bittencourt@exemplo.com', phone: '(11) 98888-1001', account: '00219981', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'ativo', segment: 'Private', suitabilityExpiry: '2026-08-05', firstApplicationDone: true, totalWealth: 4820000, availableBalance: 312000, investableCashEstimate: 260000, updatedAt: '2026-07-20T08:40:00-03:00', stale: false },
    { id: 'C02', name: 'Rodrigo Salgado', type: 'PF', cpfCnpj: '234.567.890-12', riskProfile: 'Moderado', email: 'rodrigo.salgado@exemplo.com', phone: '(21) 97777-1002', account: '00219982', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'ativo', segment: 'High', suitabilityExpiry: '2026-07-28', firstApplicationDone: true, totalWealth: 1980000, availableBalance: 145000, investableCashEstimate: 120000, updatedAt: '2026-07-20T08:40:00-03:00', stale: false },
    { id: 'C03', name: 'Paula Meireles', type: 'PF', cpfCnpj: '345.678.901-23', riskProfile: 'Moderado', email: 'paula.meireles@exemplo.com', phone: '(11) 96666-1003', account: '00219983', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'pendente', segment: 'High', suitabilityExpiry: '2027-01-10', firstApplicationDone: false, totalWealth: 0, availableBalance: 5000, investableCashEstimate: 0, updatedAt: '2026-07-19T18:10:00-03:00', stale: false },
    { id: 'C04', name: 'Igor Wachowski', type: 'PF', cpfCnpj: '456.789.012-34', riskProfile: 'Agressivo', email: 'igor.wachowski@exemplo.com', phone: '(11) 95555-1004', account: '00219984', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'bloqueado', segment: 'Private', suitabilityExpiry: '2026-09-15', firstApplicationDone: true, totalWealth: 2650000, availableBalance: 8500, investableCashEstimate: 0, updatedAt: '2026-07-18T11:20:00-03:00', stale: true },
    { id: 'C05', name: 'Fernanda Quirino', type: 'PF', cpfCnpj: '567.890.123-45', riskProfile: 'Moderado', email: 'fernanda.quirino@exemplo.com', phone: '(11) 94444-1005', account: '00219985', escritorio: 'Åpen Capital', ownerId: 'consultor_2', status: 'ativo', segment: 'High', suitabilityExpiry: '2026-12-01', firstApplicationDone: true, totalWealth: 980000, availableBalance: 42000, investableCashEstimate: 30000, updatedAt: '2026-07-20T08:00:00-03:00', stale: false },
    { id: 'C06', name: 'Bento Carvalhaes', type: 'PJ', cpfCnpj: '12.345.678/0001-90', riskProfile: 'Sofisticado', email: 'financeiro@bentoholding.com.br', phone: '(11) 93333-1006', account: '00219986', escritorio: 'Åpen Capital', ownerId: 'consultor_2', status: 'ativo', segment: 'Corporate', suitabilityExpiry: '2026-08-20', firstApplicationDone: true, totalWealth: 12400000, availableBalance: 890000, investableCashEstimate: 700000, updatedAt: '2026-07-20T07:30:00-03:00', stale: false },
    { id: 'C07', name: 'Marcela Andrade', type: 'PF', cpfCnpj: '678.901.234-56', riskProfile: 'Conservador', email: 'marcela.andrade@exemplo.com', phone: '(11) 92222-1007', account: '00219987', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'ativo', segment: 'Standard', suitabilityExpiry: '2027-03-01', firstApplicationDone: true, totalWealth: 210000, availableBalance: 3200, investableCashEstimate: 0, updatedAt: '2026-07-20T08:40:00-03:00', stale: false },
    { id: 'C08', name: 'Otávio Sena', type: 'PF', cpfCnpj: '789.012.345-67', riskProfile: 'Moderado', email: 'otavio.sena@exemplo.com', phone: '(21) 91111-1008', account: '00330011', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker', status: 'ativo', segment: 'High', suitabilityExpiry: '2026-07-25', firstApplicationDone: true, totalWealth: 3150000, availableBalance: 410000, investableCashEstimate: 380000, updatedAt: '2026-07-20T08:50:00-03:00', stale: false },
    { id: 'C09', name: 'Luíza Prestes', type: 'PF', cpfCnpj: '890.123.456-78', riskProfile: 'Agressivo', email: 'luiza.prestes@exemplo.com', phone: '(21) 90000-1009', account: '00330012', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker', status: 'ativo', segment: 'Private', suitabilityExpiry: '2026-10-02', firstApplicationDone: true, totalWealth: 6100000, availableBalance: 55000, investableCashEstimate: 20000, updatedAt: '2026-07-20T08:50:00-03:00', stale: false },
    { id: 'C10', name: 'Caio Mendonça', type: 'PF', cpfCnpj: '901.234.567-89', riskProfile: 'Conservador', email: 'caio.mendonca@exemplo.com', phone: '(21) 98899-1010', account: '00330013', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker', status: 'pendente', segment: 'Standard', suitabilityExpiry: '2027-02-14', firstApplicationDone: false, totalWealth: 0, availableBalance: 1200, investableCashEstimate: 0, updatedAt: '2026-07-19T15:00:00-03:00', stale: false },
    { id: 'C11', name: 'Vitória Nogueira', type: 'PF', cpfCnpj: '012.345.678-90', riskProfile: 'Moderado', email: 'vitoria.nogueira@exemplo.com', phone: '(21) 97788-1011', account: '00330014', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker', status: 'ativo', segment: 'High', suitabilityExpiry: '2026-11-11', firstApplicationDone: true, totalWealth: 1450000, availableBalance: 96000, investableCashEstimate: 80000, updatedAt: '2026-07-20T08:20:00-03:00', stale: false },
    { id: 'C12', name: 'Tarso Bittar', type: 'PJ', cpfCnpj: '23.456.789/0001-01', riskProfile: 'Sofisticado', email: 'contabilidade@bittarholdco.com.br', phone: '(21) 96677-1012', account: '00330015', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker', status: 'ativo', segment: 'Corporate', suitabilityExpiry: '2026-08-30', firstApplicationDone: true, totalWealth: 8900000, availableBalance: 230000, investableCashEstimate: 180000, updatedAt: '2026-07-20T07:00:00-03:00', stale: false },
    { id: 'C13', name: 'Renata Xavier', type: 'PF', cpfCnpj: '134.567.890-12', riskProfile: 'Moderado', email: 'renata.xavier@exemplo.com', phone: '(21) 95566-1013', account: '00330016', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker_2', status: 'ativo', segment: 'High', suitabilityExpiry: '2026-09-05', firstApplicationDone: true, totalWealth: 1720000, availableBalance: 15000, investableCashEstimate: 0, updatedAt: '2026-07-20T08:20:00-03:00', stale: false },
    { id: 'C14', name: 'Gustavo Peçanha', type: 'PF', cpfCnpj: '245.678.901-23', riskProfile: 'Conservador', email: 'gustavo.pecanha@exemplo.com', phone: '(21) 94455-1014', account: '00330017', escritorio: 'Ticker Investimentos', ownerId: 'daily_banker_2', status: 'ativo', segment: 'Standard', suitabilityExpiry: '2026-07-22', firstApplicationDone: true, totalWealth: 340000, availableBalance: 61000, investableCashEstimate: 55000, updatedAt: '2026-07-20T08:20:00-03:00', stale: false },
    // Cliente vitrine da jornada 360 (spec do workspace do cliente).
    { id: 'C15', name: 'Mariana Costa', type: 'PF', cpfCnpj: '321.654.987-00', riskProfile: 'Moderado', email: 'mariana.costa@exemplo.com', phone: '(11) 98877-2020', account: '123456-7', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'ativo', segment: 'High', suitabilityExpiry: '2026-12-15', firstApplicationDone: true, totalWealth: 3450000, availableBalance: 185000, investableCashEstimate: 170000, updatedAt: '2026-07-20T18:42:00-03:00', stale: false, rentability12m: 8.7, investedWealth: 3265000, dateOfBirth: '1985-03-22', linkDate: '2025-03-14', pfPjLinkId: 'C16', security: { accessActive: true, tokenActive: true, lastLoginAt: '2026-07-20T16:31:00-03:00' } },
    { id: 'C16', name: 'Costa Participações Ltda', type: 'PJ', cpfCnpj: '45.678.901/0001-23', riskProfile: 'Moderado', email: 'financeiro@costapart.com.br', phone: '(11) 3344-2020', account: '123457-5', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'ativo', segment: 'Corporate', suitabilityExpiry: '2026-11-30', firstApplicationDone: true, totalWealth: 5200000, availableBalance: 90000, investableCashEstimate: 70000, updatedAt: '2026-07-20T18:42:00-03:00', stale: false, rentability12m: 7.2, investedWealth: 5110000, dateOfBirth: null, linkDate: '2025-03-14', pfPjLinkId: 'C15', security: { accessActive: true, tokenActive: true, lastLoginAt: '2026-07-19T10:05:00-03:00' } },
    // Cliente-vitrine da jornada de Produtos e Carteira Proposta (EP-02).
    { id: 'C17', name: 'João Pedro Silva', type: 'PF', cpfCnpj: '111.222.333-44', riskProfile: 'Moderado', email: 'joao.pedro.silva@exemplo.com', phone: '(11) 97654-0789', account: '789012-3', escritorio: 'Åpen Capital', ownerId: 'consultor', status: 'ativo', segment: 'Private', suitabilityExpiry: '2027-04-30', firstApplicationDone: true, totalWealth: 12800000, availableBalance: 450000, investableCashEstimate: 450000, updatedAt: '2026-08-12T15:10:00-03:00', stale: false, rentability12m: 9.4, investedWealth: 12000000, dateOfBirth: '1979-09-08', linkDate: '2024-02-19', pfPjLinkId: null, security: { accessActive: true, tokenActive: true, lastLoginAt: '2026-08-12T09:22:00-03:00' } },
  ];

  // ---------------------------------------------------------------------
  // Carteira por classe de ativo (US-05)
  // ---------------------------------------------------------------------
  const portfolioPositions = [
    { id: 'P01', clientId: 'C01', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 118% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 1200000, rate: '118% CDI', liquidity: 'Diária', applicationDate: '2025-03-10', maturityDate: '2027-03-10' },
    { id: 'P02', clientId: 'C01', class: 'Inflação', subclass: 'Tesouro IPCA+', asset: 'Tesouro IPCA+ 2035', issuer: 'Tesouro Nacional', quantity: 40, currentValue: 980000, rate: 'IPCA + 6,1%', liquidity: 'D+1', applicationDate: '2024-11-02', maturityDate: '2035-05-15' },
    { id: 'P03', clientId: 'C01', class: 'Ações', subclass: 'Ações BR', asset: 'Carteira ações Ibovespa', issuer: 'B3', quantity: 1, currentValue: 860000, rate: '—', liquidity: 'D+2', applicationDate: '2023-06-20', maturityDate: null },
    { id: 'P04', clientId: 'C01', class: 'FIIs', subclass: 'Fundo imobiliário', asset: 'FII Logística Sudeste', issuer: 'Gestora Independente', quantity: 3200, currentValue: 640000, rate: '—', liquidity: 'D+2', applicationDate: '2024-01-15', maturityDate: null },
    { id: 'P05', clientId: 'C01', class: 'Global', subclass: 'ETF internacional', asset: 'ETF S&P 500 (via Global Account)', issuer: 'Inter Global', quantity: 1, currentValue: 780000, rate: '—', liquidity: 'D+3', applicationDate: '2024-08-01', maturityDate: null, currency: 'USD', fxRate: 5.2 },
    { id: 'P06', clientId: 'C01', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 312000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P07', clientId: 'C02', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 112% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 900000, rate: '112% CDI', liquidity: 'D+1', applicationDate: '2025-02-01', maturityDate: '2026-08-01' },
    { id: 'P08', clientId: 'C02', class: 'Multimercado', subclass: 'Fundo multimercado', asset: 'FIC FIM Macro Plus', issuer: 'Gestora Parceira', quantity: 1, currentValue: 640000, rate: '—', liquidity: 'D+30', applicationDate: '2024-05-12', maturityDate: null },
    { id: 'P09', clientId: 'C02', class: 'Previdência', subclass: 'PGBL', asset: 'PGBL Multimercado', issuer: 'Inter Seguros', quantity: 1, currentValue: 295000, rate: '—', liquidity: 'D+30', applicationDate: '2022-01-10', maturityDate: null },
    { id: 'P10', clientId: 'C02', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 145000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P11', clientId: 'C04', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 110% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 1400000, rate: '110% CDI', liquidity: 'D+1', applicationDate: '2023-09-01', maturityDate: '2026-09-01' },
    { id: 'P12', clientId: 'C04', class: 'Prefixado', subclass: 'LCI', asset: 'LCI Prefixada 11,8% a.a.', issuer: 'Banco Inter', quantity: 1, currentValue: 1250000, rate: '11,8% a.a.', liquidity: 'D+90', applicationDate: '2024-04-18', maturityDate: '2027-04-18' },
    { id: 'P13', clientId: 'C04', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 8500, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P14', clientId: 'C06', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter PJ 116% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 6200000, rate: '116% CDI', liquidity: 'D+1', applicationDate: '2024-02-10', maturityDate: '2026-08-10' },
    { id: 'P15', clientId: 'C06', class: 'Fundos', subclass: 'Fundo de crédito privado', asset: 'FIC FIRF Crédito Corporate', issuer: 'Gestora Parceira', quantity: 1, currentValue: 4500000, rate: '—', liquidity: 'D+5', applicationDate: '2023-11-20', maturityDate: null },
    { id: 'P16', clientId: 'C06', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta PJ', issuer: 'Banco Inter', quantity: 1, currentValue: 890000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P17', clientId: 'C07', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 105% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 180000, rate: '105% CDI', liquidity: 'Diária', applicationDate: '2025-05-01', maturityDate: '2026-11-01' },
    { id: 'P18', clientId: 'C07', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 3200, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P19', clientId: 'C08', class: 'Prefixado', subclass: 'Tesouro Prefixado', asset: 'Tesouro Prefixado 2029', issuer: 'Tesouro Nacional', quantity: 25, currentValue: 1350000, rate: '12,4% a.a.', liquidity: 'D+1', applicationDate: '2024-06-15', maturityDate: '2029-01-01' },
    { id: 'P20', clientId: 'C08', class: 'Ações', subclass: 'Ações BR', asset: 'Carteira ações dividendos', issuer: 'B3', quantity: 1, currentValue: 900000, rate: '—', liquidity: 'D+2', applicationDate: '2023-03-01', maturityDate: null },
    { id: 'P21', clientId: 'C08', class: 'Global', subclass: 'ETF internacional', asset: 'ETF Nasdaq 100 (via Global Account)', issuer: 'Inter Global', quantity: 1, currentValue: 490000, rate: '—', liquidity: 'D+3', applicationDate: '2024-09-10', maturityDate: null, currency: 'USD', fxRate: 5.2 },
    { id: 'P22', clientId: 'C08', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 410000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P23', clientId: 'C09', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 120% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 3100000, rate: '120% CDI', liquidity: 'D+1', applicationDate: '2024-01-05', maturityDate: '2026-07-30' },
    { id: 'P24', clientId: 'C09', class: 'Inflação', subclass: 'Tesouro IPCA+', asset: 'Tesouro IPCA+ 2040', issuer: 'Tesouro Nacional', quantity: 60, currentValue: 2400000, rate: 'IPCA + 6,4%', liquidity: 'D+1', applicationDate: '2023-05-20', maturityDate: '2040-05-15' },
    { id: 'P25', clientId: 'C09', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 55000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P26', clientId: 'C11', class: 'Multimercado', subclass: 'Fundo multimercado', asset: 'FIC FIM Retorno Absoluto', issuer: 'Gestora Parceira', quantity: 1, currentValue: 780000, rate: '—', liquidity: 'D+15', applicationDate: '2024-03-11', maturityDate: null },
    { id: 'P27', clientId: 'C11', class: 'FIIs', subclass: 'Fundo imobiliário', asset: 'FII Shoppings Brasil', issuer: 'Gestora Independente', quantity: 2100, currentValue: 570000, rate: '—', liquidity: 'D+2', applicationDate: '2024-07-01', maturityDate: null },
    { id: 'P28', clientId: 'C11', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 96000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    { id: 'P29', clientId: 'C12', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter PJ 114% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 5100000, rate: '114% CDI', liquidity: 'D+1', applicationDate: '2024-04-01', maturityDate: '2026-10-01' },
    { id: 'P30', clientId: 'C12', class: 'Fundos', subclass: 'Fundo de crédito privado', asset: 'FIC FIRF Crédito Corporate', issuer: 'Gestora Parceira', quantity: 1, currentValue: 3570000, rate: '—', liquidity: 'D+5', applicationDate: '2023-08-20', maturityDate: null },
    { id: 'P31', clientId: 'C12', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta PJ', issuer: 'Banco Inter', quantity: 1, currentValue: 230000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    // Carteira da cliente vitrine Mariana Costa (C15) — alocação da spec.
    { id: 'P32', clientId: 'C15', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 105% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 120000, appliedValue: 108500, rate: '105% CDI', liquidity: 'No vencimento', applicationDate: '2024-08-15', maturityDate: '2026-07-25' },
    { id: 'P33', clientId: 'C15', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter 112% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 1251300, rate: '112% CDI', liquidity: 'D+1', applicationDate: '2024-05-10', maturityDate: '2027-05-10' },
    { id: 'P34', clientId: 'C15', class: 'Inflação', subclass: 'Tesouro IPCA+', asset: 'Tesouro IPCA+ 2035', issuer: 'Tesouro Nacional', quantity: 24, currentValue: 587700, rate: 'IPCA + 6,2%', liquidity: 'D+1', applicationDate: '2023-09-12', maturityDate: '2035-05-15' },
    { id: 'P35', clientId: 'C15', class: 'Prefixado', subclass: 'Tesouro Prefixado', asset: 'Tesouro Prefixado 2031', issuer: 'Tesouro Nacional', quantity: 8, currentValue: 261200, rate: '11,9% a.a.', liquidity: 'D+1', applicationDate: '2024-02-01', maturityDate: '2031-01-01' },
    { id: 'P36', clientId: 'C15', class: 'FIIs', subclass: 'Fundo imobiliário', asset: 'FII Logística Sudeste', issuer: 'Gestora Independente', quantity: 2600, currentValue: 261200, rate: '—', liquidity: 'D+2', applicationDate: '2024-06-18', maturityDate: null },
    { id: 'P37', clientId: 'C15', class: 'Ações', subclass: 'Ações BR', asset: 'Carteira Ações Dividendos', issuer: 'B3', quantity: 1, currentValue: 326500, rate: '—', liquidity: 'D+2', applicationDate: '2023-03-05', maturityDate: null },
    { id: 'P38', clientId: 'C15', class: 'Multimercado', subclass: 'Fundo multimercado', asset: 'FIC FIM Macro Plus', issuer: 'Gestora Parceira', quantity: 1, currentValue: 195900, rate: '—', liquidity: 'D+30', applicationDate: '2024-04-11', maturityDate: null },
    { id: 'P39', clientId: 'C15', class: 'Global', subclass: 'ETF internacional', asset: 'ETF S&P 500 (via Global Account)', issuer: 'Inter Global', quantity: 1, currentValue: 130600, rate: '—', liquidity: 'D+3', applicationDate: '2024-09-10', maturityDate: null, currency: 'USD', fxRate: 5.2 },
    { id: 'P40', clientId: 'C15', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta', issuer: 'Banco Inter', quantity: 1, currentValue: 130600, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    // Carteira de Costa Participações (C16) — holding PJ vinculada a Mariana.
    { id: 'P41', clientId: 'C16', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Inter PJ 116% CDI', issuer: 'Banco Inter', quantity: 1, currentValue: 3000000, rate: '116% CDI', liquidity: 'D+1', applicationDate: '2024-03-01', maturityDate: '2027-03-01' },
    { id: 'P42', clientId: 'C16', class: 'Fundos', subclass: 'Fundo de crédito privado', asset: 'FIC FIRF Crédito Corporate', issuer: 'Gestora Parceira', quantity: 1, currentValue: 1610000, rate: '—', liquidity: 'D+5', applicationDate: '2023-10-20', maturityDate: null },
    { id: 'P43', clientId: 'C16', class: 'Caixa', subclass: 'Conta corrente', asset: 'Saldo em conta PJ', issuer: 'Banco Inter', quantity: 1, currentValue: 500000, rate: '100% CDI', liquidity: 'Imediata', applicationDate: null, maturityDate: null },

    // Carteira atual de João Pedro Silva (C17) — vitrine da jornada de Produtos.
    // Alocação (base R$ 12 mi): Pós 42% · Inflação 8% · Prefixado 5% · Multi 15% · RV 20% · Internacional 10%.
    { id: 'P44', clientId: 'C17', class: 'Pós-fixado', subclass: 'CDB', asset: 'CDB Banco Alpha 112% CDI', issuer: 'Banco Alpha', quantity: 1, currentValue: 3200000, rate: '112% CDI', liquidity: 'D+1', applicationDate: '2024-06-15', maturityDate: '2027-11-15' },
    { id: 'P45', clientId: 'C17', class: 'Pós-fixado', subclass: 'LCI', asset: 'LCI Banco Beta 94% CDI', issuer: 'Banco Beta', quantity: 1, currentValue: 1840000, rate: '94% CDI', liquidity: 'D+90', applicationDate: '2024-08-20', maturityDate: '2027-06-20' },
    { id: 'P46', clientId: 'C17', class: 'Inflação', subclass: 'Tesouro IPCA+', asset: 'Tesouro IPCA+ 2032', issuer: 'Tesouro Nacional', quantity: 32, currentValue: 960000, rate: 'IPCA + 6,0%', liquidity: 'D+1', applicationDate: '2023-11-10', maturityDate: '2032-05-15' },
    { id: 'P47', clientId: 'C17', class: 'Prefixado', subclass: 'Tesouro Prefixado', asset: 'Tesouro Prefixado 2031', issuer: 'Tesouro Nacional', quantity: 18, currentValue: 600000, rate: '11,8% a.a.', liquidity: 'D+1', applicationDate: '2024-01-25', maturityDate: '2031-01-01' },
    { id: 'P48', clientId: 'C17', class: 'Multimercado', subclass: 'Fundo multimercado', asset: 'FIC FIM Estratégia Total', issuer: 'Gestora Parceira', quantity: 1, currentValue: 1800000, rate: '—', liquidity: 'D+30', applicationDate: '2024-03-30', maturityDate: null },
    { id: 'P49', clientId: 'C17', class: 'Ações', subclass: 'Ações BR', asset: 'Carteira Ações Ibovespa', issuer: 'B3', quantity: 1, currentValue: 2400000, rate: '—', liquidity: 'D+2', applicationDate: '2023-05-12', maturityDate: null },
    { id: 'P50', clientId: 'C17', class: 'Global', subclass: 'ETF internacional', asset: 'ETF Global (via Global Account)', issuer: 'Inter Global', quantity: 1, currentValue: 1200000, rate: '—', liquidity: 'D+2', applicationDate: '2024-07-08', maturityDate: null, currency: 'USD', fxRate: 5.2 },
  ];

  // ---------------------------------------------------------------------
  // Origem do saldo / caixa investível (US-06)
  // ---------------------------------------------------------------------
  const cashEvents = [
    { id: 'M01', clientId: 'C01', date: '2026-07-19', description: 'Transferência recebida', value: 180000, category: 'transferencia' },
    { id: 'M02', clientId: 'C01', date: '2026-07-15', description: 'Resgate CDB anterior', value: 95000, category: 'resgate' },
    { id: 'M03', clientId: 'C01', date: '2026-07-10', description: 'Rendimento mensal', value: 12400, category: 'rendimento' },
    { id: 'M04', clientId: 'C01', date: '2026-07-05', description: 'Pix recebido — origem não identificada', value: 24600, category: 'nao_classificado' },
    { id: 'M05', clientId: 'C02', date: '2026-07-18', description: 'Salário', value: 38000, category: 'salario' },
    { id: 'M06', clientId: 'C02', date: '2026-07-12', description: 'Dividendos recebidos', value: 6200, category: 'dividendo' },
    { id: 'M07', clientId: 'C02', date: '2026-07-08', description: 'Cashback cartão', value: 480, category: 'cashback' },
    { id: 'M08', clientId: 'C04', date: '2026-07-18', description: 'Vencimento de CDB', value: 210000, category: 'vencimento' },
    { id: 'M09', clientId: 'C04', date: '2026-07-17', description: 'Saque para conta externa', value: -201500, category: 'transferencia' },
    { id: 'M10', clientId: 'C06', date: '2026-07-19', description: 'Aporte de capital da holding', value: 500000, category: 'deposito' },
    { id: 'M11', clientId: 'C06', date: '2026-07-14', description: 'Recebimento de cliente PJ', value: 210000, category: 'transferencia' },
    { id: 'M12', clientId: 'C07', date: '2026-07-16', description: 'Depósito inicial', value: 3200, category: 'deposito' },
    { id: 'M13', clientId: 'C08', date: '2026-07-19', description: 'Resgate de fundo consolidador externo', value: 380000, category: 'resgate' },
    { id: 'M14', clientId: 'C08', date: '2026-07-11', description: 'Rendimento mensal', value: 18700, category: 'rendimento' },
    { id: 'M15', clientId: 'C09', date: '2026-07-13', description: 'Pix recebido — origem não identificada', value: 40000, category: 'nao_classificado' },
    { id: 'M16', clientId: 'C09', date: '2026-07-09', description: 'Dividendos recebidos', value: 9500, category: 'dividendo' },
    { id: 'M17', clientId: 'C11', date: '2026-07-17', description: 'Salário', value: 22000, category: 'salario' },
    { id: 'M18', clientId: 'C11', date: '2026-07-06', description: 'Cashback cartão', value: 310, category: 'cashback' },
    { id: 'M19', clientId: 'C12', date: '2026-07-18', description: 'Recebimento de cliente PJ', value: 150000, category: 'transferencia' },
    { id: 'M20', clientId: 'C12', date: '2026-07-10', description: 'Rendimento mensal', value: 31200, category: 'rendimento' },
    { id: 'M21', clientId: 'C14', date: '2026-07-19', description: 'Vencimento de LCI', value: 55000, category: 'vencimento' },
    { id: 'M22', clientId: 'C14', date: '2026-07-14', description: 'Salário', value: 9800, category: 'salario' },

    // Movimentações da cliente vitrine Mariana Costa (C15) — origem do saldo
    // (170k potencialmente investível + 15k de uso bancário).
    { id: 'M23', clientId: 'C15', date: '2026-07-20', description: 'Vencimento de CDB', value: 120000, category: 'vencimento', investable: 'investivel' },
    { id: 'M24', clientId: 'C15', date: '2026-07-20', description: 'Transferência recebida', value: 40000, category: 'transferencia', investable: 'investivel' },
    { id: 'M25', clientId: 'C15', date: '2026-07-20', description: 'Dividendos recebidos', value: 10000, category: 'dividendo', investable: 'investivel' },
    { id: 'M26', clientId: 'C15', date: '2026-07-19', description: 'Crédito em conta', value: 15000, category: 'deposito', investable: 'banking' },
    { id: 'M27', clientId: 'C15', date: '2026-07-15', description: 'Pagamento de cartão', value: -8450, category: 'nao_classificado', investable: 'banking' },
    { id: 'M28', clientId: 'C16', date: '2026-07-18', description: 'Recebimento de aluguel PJ', value: 70000, category: 'transferencia', investable: 'investivel' },
    { id: 'M29', clientId: 'C16', date: '2026-07-12', description: 'Rendimento mensal', value: 18500, category: 'rendimento', investable: 'investivel' },
  ];

  // ---------------------------------------------------------------------
  // Alertas e oportunidades (US-07)
  // ---------------------------------------------------------------------
  const alerts = [
    { id: 'A01', clientId: 'C02', type: 'vencimento_proximo', priority: 'alta', date: '2026-07-21', justification: 'CDB de R$ 900 mil vence em 8 dias sem reaplicação definida.', recommendedAction: 'Ligar para o cliente e propor rolagem ou nova alocação.', status: 'novo' },
    { id: 'A02', clientId: 'C14', type: 'vencimento_proximo', priority: 'alta', date: '2026-07-22', justification: 'LCI de R$ 55 mil vence em 2 dias.', recommendedAction: 'Confirmar destino do resgate antes do vencimento.', status: 'novo' },
    { id: 'A03', clientId: 'C01', type: 'novo_aporte', priority: 'media', date: '2026-07-19', justification: 'Entrada de R$ 180 mil por transferência nas últimas 24h.', recommendedAction: 'Avaliar alocação do novo aporte com o cliente.', status: 'visualizado' },
    { id: 'A04', clientId: 'C06', type: 'novo_aporte', priority: 'media', date: '2026-07-19', justification: 'Aporte de capital de R$ 500 mil na conta PJ.', recommendedAction: 'Agendar reunião de alocação com o responsável financeiro.', status: 'novo' },
    { id: 'A05', clientId: 'C09', type: 'saldo_parado', priority: 'alta', date: '2026-07-20', justification: 'R$ 55 mil parados em conta corrente há mais de 10 dias.', recommendedAction: 'Oferecer opções de aplicação de liquidez diária.', status: 'novo' },
    { id: 'A06', clientId: 'C14', type: 'saldo_parado', priority: 'media', date: '2026-07-20', justification: 'R$ 61 mil disponíveis sem alocação recente.', recommendedAction: 'Sugerir produto de liquidez diária.', status: 'em_tratamento' },
    { id: 'A07', clientId: 'C04', type: 'retirada_relevante', priority: 'alta', date: '2026-07-17', justification: 'Saque de R$ 201,5 mil para conta externa em 24h.', recommendedAction: 'Entender motivo da retirada e risco de perda de relacionamento.', status: 'em_tratamento' },
    { id: 'A08', clientId: 'C02', type: 'suitability_vencendo', priority: 'media', date: '2026-07-25', justification: 'Suitability vence em 8 dias.', recommendedAction: 'Agendar renovação do questionário de perfil.', status: 'novo' },
    { id: 'A09', clientId: 'C08', type: 'suitability_vencendo', priority: 'alta', date: '2026-07-25', justification: 'Suitability vence em 5 dias, cliente Private.', recommendedAction: 'Priorizar renovação antes do vencimento.', status: 'novo' },
    { id: 'A10', clientId: 'C03', type: 'cadastro_pendente', priority: 'media', date: '2026-07-19', justification: 'Cadastro aguardando validação de documentos há 3 dias.', recommendedAction: 'Verificar pendência documental com o cliente.', status: 'novo' },
    { id: 'A11', clientId: 'C10', type: 'cadastro_pendente', priority: 'media', date: '2026-07-19', justification: 'Cadastro aguardando validação de documentos há 5 dias.', recommendedAction: 'Verificar pendência documental com o cliente.', status: 'novo' },
    { id: 'A12', clientId: 'C03', type: 'sem_primeira_aplicacao', priority: 'baixa', date: '2026-07-18', justification: 'Conta ativada há 12 dias sem primeira aplicação.', recommendedAction: 'Contatar cliente para orientar primeira aplicação.', status: 'novo' },
    { id: 'A13', clientId: 'C10', type: 'sem_primeira_aplicacao', priority: 'baixa', date: '2026-07-18', justification: 'Conta ainda não ativada, sem primeira aplicação.', recommendedAction: 'Retomar onboarding do cliente.', status: 'novo' },
    { id: 'A14', clientId: 'C02', type: 'ordem_aguardando_aprovacao', priority: 'media', date: '2026-07-20', justification: 'Ordem de aplicação aguardando aprovação há 4h.', recommendedAction: 'Revisar e aprovar a ordem pendente.', status: 'novo' },
    { id: 'A15', clientId: 'C09', type: 'ordem_aguardando_aprovacao', priority: 'media', date: '2026-07-20', justification: 'Ordem de resgate aguardando aprovação há 2h.', recommendedAction: 'Revisar e aprovar a ordem pendente.', status: 'novo' },
    { id: 'A16', clientId: 'C04', type: 'ordem_com_erro', priority: 'alta', date: '2026-07-18', justification: 'Ordem de aplicação retornou erro de saldo insuficiente.', recommendedAction: 'Reenviar ordem após confirmar saldo disponível.', status: 'em_tratamento' },
    { id: 'A17', clientId: 'C11', type: 'ordem_com_erro', priority: 'alta', date: '2026-07-19', justification: 'Ordem de aplicação retornou erro de elegibilidade do produto.', recommendedAction: 'Trocar produto ou revisar elegibilidade antes de reenviar.', status: 'novo' },
    { id: 'A18', clientId: 'C01', type: 'documento_disponivel', priority: 'baixa', date: '2026-07-15', justification: 'Novo informe de rendimentos disponível.', recommendedAction: 'Avisar o cliente sobre o documento disponível.', status: 'concluido' },
    { id: 'A19', clientId: 'C08', type: 'documento_disponivel', priority: 'baixa', date: '2026-07-16', justification: 'Novo extrato consolidado disponível.', recommendedAction: 'Avisar o cliente sobre o documento disponível.', status: 'concluido' },
    { id: 'A20', clientId: 'C02', type: 'vencimento_proximo', priority: 'alta', date: '2026-07-23', justification: 'Segunda parcela de CDB também vence essa semana.', recommendedAction: 'Consolidar as duas rolagens numa única conversa.', status: 'novo' },
    { id: 'A21', clientId: 'C12', type: 'novo_aporte', priority: 'media', date: '2026-07-18', justification: 'Recebimento de R$ 150 mil de cliente PJ.', recommendedAction: 'Avaliar alocação do novo recurso.', status: 'visualizado' },
    { id: 'A22', clientId: 'C06', type: 'suitability_vencendo', priority: 'media', date: '2026-08-20', justification: 'Suitability PJ vence em 30 dias.', recommendedAction: 'Planejar renovação com antecedência.', status: 'novo' },
  ];

  // ---------------------------------------------------------------------
  // Onboarding, ativação e pendências (US-08)
  // ---------------------------------------------------------------------
  const onboarding = [
    {
      id: 'O01', clientId: 'C03', status: 'em_validacao', pendingReason: 'Documento de comprovação de residência ilegível',
      lastCommunicationAt: '2026-07-18T14:00:00-03:00',
      timeline: [
        { date: '2026-07-10', event: 'convite_enviado', detail: 'Convite enviado por e-mail e app.' },
        { date: '2026-07-11', event: 'aceite_recebido', detail: 'Cliente aceitou o convite no app.' },
        { date: '2026-07-14', event: 'documentos_enviados', detail: 'Documentos enviados para validação.' },
        { date: '2026-07-17', event: 'pendencia_identificada', detail: 'Comprovante de residência recusado por qualidade de imagem.' },
      ],
    },
    {
      id: 'O02', clientId: 'C10', status: 'aceite_pendente', pendingReason: 'Cliente ainda não abriu o convite',
      lastCommunicationAt: '2026-07-15T10:00:00-03:00',
      timeline: [
        { date: '2026-07-15', event: 'convite_enviado', detail: 'Convite enviado por e-mail e app.' },
      ],
    },
    {
      id: 'O03', clientId: 'C07', status: 'ativado', pendingReason: null,
      lastCommunicationAt: '2026-07-05T09:00:00-03:00',
      timeline: [
        { date: '2026-07-01', event: 'convite_enviado', detail: 'Convite enviado por e-mail e app.' },
        { date: '2026-07-02', event: 'aceite_recebido', detail: 'Cliente aceitou o convite no app.' },
        { date: '2026-07-03', event: 'documentos_enviados', detail: 'Documentos enviados e validados automaticamente.' },
        { date: '2026-07-05', event: 'ativado', detail: 'Conta ativada e segmentada como Standard.' },
      ],
    },
    {
      id: 'O04', clientId: 'C14', status: 'ativado', pendingReason: null,
      lastCommunicationAt: '2026-06-28T09:00:00-03:00',
      timeline: [
        { date: '2026-06-20', event: 'convite_enviado', detail: 'Convite enviado por e-mail e app.' },
        { date: '2026-06-21', event: 'aceite_recebido', detail: 'Cliente aceitou o convite no app.' },
        { date: '2026-06-25', event: 'documentos_enviados', detail: 'Documentos enviados e validados.' },
        { date: '2026-06-28', event: 'ativado', detail: 'Conta ativada e segmentada como Standard.' },
      ],
    },
    {
      id: 'O05', clientId: 'C04', status: 'pendencia', pendingReason: 'Conta bloqueada por decisão de compliance',
      lastCommunicationAt: '2026-07-18T11:20:00-03:00',
      timeline: [
        { date: '2025-01-10', event: 'ativado', detail: 'Conta ativada originalmente.' },
        { date: '2026-07-18', event: 'bloqueio', detail: 'Conta bloqueada por decisão de compliance — pendente revisão.' },
      ],
    },
    {
      id: 'O06', clientId: 'C05', status: 'em_validacao', pendingReason: 'Aguardando validação de origem de recursos',
      lastCommunicationAt: '2026-07-17T16:40:00-03:00',
      timeline: [
        { date: '2026-07-12', event: 'convite_enviado', detail: 'Convite enviado por e-mail e app.' },
        { date: '2026-07-13', event: 'aceite_recebido', detail: 'Cliente aceitou o convite no app.' },
        { date: '2026-07-17', event: 'pendencia_identificada', detail: 'Origem de recursos em análise pela área de compliance.' },
      ],
    },
  ];

  // ---------------------------------------------------------------------
  // Central de ordens (US-09)
  // ---------------------------------------------------------------------
  const orders = [
    { id: 'ORD01', clientId: 'C02', asset: 'CDB Banco Inter 112% CDI', type: 'aplicacao', value: 300000, author: 'Marina Ferraz', sentAt: '2026-07-20T08:10:00-03:00', status: 'aguardando_aprovacao', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-20T08:10:00-03:00', status: 'enviada', detail: 'Ordem enviada por Marina Ferraz.' }, { date: '2026-07-20T08:12:00-03:00', status: 'aguardando_aprovacao', detail: 'Aguardando aprovação do alocador.' }] },
    { id: 'ORD02', clientId: 'C09', asset: 'Tesouro IPCA+ 2040', type: 'resgate', value: 120000, author: 'Camila Duarte', sentAt: '2026-07-20T07:30:00-03:00', status: 'aguardando_aprovacao', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-20T07:30:00-03:00', status: 'enviada', detail: 'Ordem enviada por Camila Duarte.' }, { date: '2026-07-20T07:31:00-03:00', status: 'aguardando_aprovacao', detail: 'Aguardando aprovação.' }] },
    { id: 'ORD03', clientId: 'C04', asset: 'LCI Prefixada 11,8% a.a.', type: 'aplicacao', value: 200000, author: 'Marina Ferraz', sentAt: '2026-07-18T09:00:00-03:00', status: 'erro', errorReason: 'Saldo insuficiente na conta no momento do processamento.', errorImpact: 'A aplicação não foi concluída; o recurso permanece disponível em conta.', errorAction: 'Confirmar saldo disponível e reenviar a ordem.', retriable: true,
      timeline: [{ date: '2026-07-18T09:00:00-03:00', status: 'enviada', detail: 'Ordem enviada por Marina Ferraz.' }, { date: '2026-07-18T09:05:00-03:00', status: 'aprovada', detail: 'Aprovada pelo alocador.' }, { date: '2026-07-18T09:07:00-03:00', status: 'erro', detail: 'Falha no processamento: saldo insuficiente.' }] },
    { id: 'ORD04', clientId: 'C11', asset: 'FIC FIM Retorno Absoluto', type: 'aplicacao', value: 80000, author: 'Camila Duarte', sentAt: '2026-07-19T10:20:00-03:00', status: 'erro', errorReason: 'Cliente não elegível para este produto no momento.', errorImpact: 'O produto não pôde ser alocado; nenhuma posição foi criada.', errorAction: 'Revisar elegibilidade ou escolher outro produto antes de reenviar.', retriable: true,
      timeline: [{ date: '2026-07-19T10:20:00-03:00', status: 'enviada', detail: 'Ordem enviada por Camila Duarte.' }, { date: '2026-07-19T10:25:00-03:00', status: 'erro', detail: 'Falha de elegibilidade.' }] },
    { id: 'ORD05', clientId: 'C01', asset: 'ETF S&P 500 (via Global Account)', type: 'aplicacao', value: 150000, author: 'Marina Ferraz', sentAt: '2026-07-15T11:00:00-03:00', status: 'executada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-15T11:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-15T11:05:00-03:00', status: 'aprovada', detail: 'Aprovada pelo alocador.' }, { date: '2026-07-15T14:30:00-03:00', status: 'em_processamento', detail: 'Em processamento na custódia.' }, { date: '2026-07-16T09:00:00-03:00', status: 'executada', detail: 'Ordem executada com sucesso.' }] },
    { id: 'ORD06', clientId: 'C08', asset: 'Tesouro Prefixado 2029', type: 'aplicacao', value: 400000, author: 'Rafael Nunes', sentAt: '2026-07-14T09:30:00-03:00', status: 'parcialmente_executada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-14T09:30:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-14T10:00:00-03:00', status: 'aprovada', detail: 'Aprovada.' }, { date: '2026-07-14T15:00:00-03:00', status: 'parcialmente_executada', detail: 'Executados R$ 320 mil de R$ 400 mil por limite de lote no leilão.' }] },
    { id: 'ORD07', clientId: 'C12', asset: 'FIC FIRF Crédito Corporate', type: 'aplicacao', value: 500000, author: 'Camila Duarte', sentAt: '2026-07-17T13:00:00-03:00', status: 'recusada', errorReason: 'Aprovador identificou concentração acima do limite do escritório.', errorImpact: 'A ordem não foi executada para preservar o limite de concentração da carteira.', errorAction: 'Revisar valor da ordem ou diversificar entre produtos.', retriable: true,
      timeline: [{ date: '2026-07-17T13:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-17T15:00:00-03:00', status: 'recusada', detail: 'Recusada por concentração acima do limite.' }] },
    { id: 'ORD08', clientId: 'C06', asset: 'FIC FIRF Crédito Corporate', type: 'aplicacao', value: 700000, author: 'Rafael Nunes', sentAt: '2026-07-20T09:00:00-03:00', status: 'rascunho', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-20T09:00:00-03:00', status: 'rascunho', detail: 'Rascunho criado, ainda não enviado.' }] },
    { id: 'ORD09', clientId: 'C14', asset: 'CDB Banco Inter 105% CDI', type: 'aplicacao', value: 55000, author: 'Camila Duarte', sentAt: '2026-07-20T08:00:00-03:00', status: 'em_processamento', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-20T08:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-20T08:05:00-03:00', status: 'aprovada', detail: 'Aprovada.' }, { date: '2026-07-20T08:10:00-03:00', status: 'em_processamento', detail: 'Em processamento.' }] },
    { id: 'ORD10', clientId: 'C09', asset: 'CDB Banco Inter 120% CDI', type: 'resgate', value: 40000, author: 'Camila Duarte', sentAt: '2026-07-12T10:00:00-03:00', status: 'cancelada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-12T10:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-12T11:00:00-03:00', status: 'cancelada', detail: 'Cancelada a pedido do cliente.' }] },
    { id: 'ORD11', clientId: 'C02', asset: 'PGBL Multimercado', type: 'aplicacao', value: 25000, author: 'Marina Ferraz', sentAt: '2026-07-10T09:00:00-03:00', status: 'executada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-10T09:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-10T09:30:00-03:00', status: 'aprovada', detail: 'Aprovada.' }, { date: '2026-07-11T09:00:00-03:00', status: 'executada', detail: 'Executada com sucesso.' }] },
    { id: 'ORD12', clientId: 'C11', asset: 'FII Shoppings Brasil', type: 'aplicacao', value: 60000, author: 'Camila Duarte', sentAt: '2026-07-08T09:00:00-03:00', status: 'executada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-08T09:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-08T10:00:00-03:00', status: 'aprovada', detail: 'Aprovada.' }, { date: '2026-07-09T09:00:00-03:00', status: 'executada', detail: 'Executada com sucesso.' }] },
    // Ordens da cliente vitrine Mariana Costa (C15) — 2 aguardando aprovação.
    { id: 'ORD13', clientId: 'C15', asset: 'CDB Banco Inter 112% CDI', type: 'aplicacao', value: 50000, author: 'Marina Ferraz', sentAt: '2026-07-20T14:32:00-03:00', status: 'aguardando_aprovacao', errorReason: null, errorAction: null, retriable: false, origin: 'Recomendação agosto',
      timeline: [{ date: '2026-07-20T14:32:00-03:00', status: 'enviada', detail: 'Recomendação criada por Marina Ferraz.' }, { date: '2026-07-20T14:35:00-03:00', status: 'aguardando_aprovacao', detail: 'Enviada ao cliente — aguardando aprovação.' }] },
    { id: 'ORD14', clientId: 'C15', asset: 'FIC FIM Macro Plus', type: 'aplicacao', value: 35000, author: 'Marina Ferraz', sentAt: '2026-07-20T11:10:00-03:00', status: 'aguardando_aprovacao', errorReason: null, errorAction: null, retriable: false, origin: 'Rebalanceamento agosto',
      timeline: [{ date: '2026-07-20T11:10:00-03:00', status: 'enviada', detail: 'Recomendação criada.' }, { date: '2026-07-20T11:12:00-03:00', status: 'aguardando_aprovacao', detail: 'Aguardando aprovação do cliente.' }] },
    { id: 'ORD15', clientId: 'C15', asset: 'Tesouro IPCA+ 2035', type: 'aplicacao', value: 40000, author: 'Marina Ferraz', sentAt: '2026-07-14T10:00:00-03:00', status: 'executada', errorReason: null, errorAction: null, retriable: false, origin: 'Recomendação julho',
      timeline: [{ date: '2026-07-14T10:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-14T10:30:00-03:00', status: 'aprovada', detail: 'Aprovada.' }, { date: '2026-07-15T09:00:00-03:00', status: 'executada', detail: 'Executada com sucesso.' }] },
  ];

  // ---------------------------------------------------------------------
  // Catálogo de produtos (US-10) — usado pelo Hub de produtos, pelo
  // Simulador (US-11) e pelo Basket em lote (US-13).
  // ---------------------------------------------------------------------
  const products = [
    { id: 'PR01', name: 'CDB Banco Inter 115% CDI', class: 'Pós-fixado', subclass: 'CDB', issuer: 'Banco Inter', indexer: 'CDI', term: '24 meses', liquidity: 'D+1', minApplication: 5000, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Certificado de depósito bancário pós-fixado, com liquidez diária após carência de 1 dia útil.', risks: 'Garantido pelo FGC até o limite legal. Risco de crédito do emissor acima do limite coberto.', costs: 'Sem taxa de administração. Imposto de renda regressivo conforme prazo.', docs: ['Lâmina do produto', 'Regulamento FGC'] },
    { id: 'PR02', name: 'LCI Banco Inter Pós-fixada 95% CDI', class: 'Pós-fixado', subclass: 'LCI', issuer: 'Banco Inter', indexer: 'CDI', term: '12 meses (carência 90 dias)', liquidity: 'D+90', minApplication: 10000, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Letra de crédito imobiliário isenta de IR para pessoa física.', risks: 'Garantido pelo FGC até o limite legal.', costs: 'Isento de IR para pessoa física. Sem taxa de administração.', docs: ['Lâmina do produto', 'Regulamento FGC'] },
    { id: 'PR03', name: 'CDB Banco Inter Prefixado 12,5% a.a.', class: 'Prefixado', subclass: 'CDB', issuer: 'Banco Inter', indexer: 'Prefixado', term: '36 meses', liquidity: 'D+1', minApplication: 5000, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Taxa prefixada, indicado para quem busca previsibilidade de retorno nominal.', risks: 'Garantido pelo FGC até o limite legal. Marcação a mercado pode gerar oscilação se resgatado antes do vencimento.', costs: 'Sem taxa de administração. IR regressivo.', docs: ['Lâmina do produto'] },
    { id: 'PR04', name: 'Tesouro Prefixado 2031', class: 'Prefixado', subclass: 'Tesouro Direto', issuer: 'Tesouro Nacional', indexer: 'Prefixado', term: 'até jan/2031', liquidity: 'D+1', minApplication: 100, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Título público federal com rentabilidade prefixada.', risks: 'Risco soberano (baixo). Marcação a mercado no resgate antecipado.', costs: 'Taxa de custódia B3 de 0,20% a.a. IR regressivo.', docs: ['Lâmina do Tesouro Direto'] },
    { id: 'PR05', name: 'Tesouro IPCA+ 2035', class: 'Inflação', subclass: 'Tesouro IPCA+', issuer: 'Tesouro Nacional', indexer: 'IPCA', term: 'até mai/2035', liquidity: 'D+1', minApplication: 100, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Proteção contra inflação com juro real definido na compra.', risks: 'Risco soberano (baixo). Marcação a mercado no resgate antecipado.', costs: 'Taxa de custódia B3 de 0,20% a.a. IR regressivo.', docs: ['Lâmina do Tesouro Direto'] },
    { id: 'PR06', name: 'CRI Inflação Logística 8% + IPCA', class: 'Inflação', subclass: 'CRI', issuer: 'Securitizadora Parceira', indexer: 'IPCA', term: '60 meses', liquidity: 'D+360', minApplication: 25000, riskLevel: 3, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Certificado de recebíveis imobiliários lastreado em contratos de locação logística.', risks: 'Sem garantia do FGC. Risco de crédito do lastro e do securitizador.', costs: 'Isento de IR para pessoa física. Sem taxa de administração.', docs: ['Lâmina do produto', 'Prospecto de emissão'] },
    { id: 'PR07', name: 'FIC FIRF Crédito Corporate', class: 'Fundos', subclass: 'Fundo de crédito privado', issuer: 'Gestora Parceira', indexer: 'CDI+', term: 'aberto', liquidity: 'D+5', minApplication: 50000, riskLevel: 2, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Fundo de renda fixa com foco em crédito privado corporativo de alta qualidade.', risks: 'Sem garantia do FGC. Risco de crédito da carteira e de marcação a mercado.', costs: 'Taxa de administração 0,60% a.a. IR regressivo.', docs: ['Lâmina do fundo', 'Regulamento'] },
    { id: 'PR08', name: 'FIC FIM Macro Plus', class: 'Multimercado', subclass: 'Fundo multimercado', issuer: 'Gestora Parceira', indexer: '—', term: 'aberto', liquidity: 'D+30', minApplication: 20000, riskLevel: 3, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Estratégia macro global com alocação tática entre juros, moedas e bolsa.', risks: 'Sem garantia do FGC. Alta volatilidade possível conforme cenário macro.', costs: 'Taxa de administração 1,8% a.a. + performance. IR regressivo.', docs: ['Lâmina do fundo', 'Regulamento'] },
    { id: 'PR09', name: 'FIC FIM Retorno Absoluto', class: 'Multimercado', subclass: 'Fundo multimercado', issuer: 'Gestora Parceira', indexer: '—', term: 'aberto', liquidity: 'D+15', minApplication: 15000, riskLevel: 3, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Busca retorno absoluto descorrelacionado do CDI em diferentes ciclos de mercado.', risks: 'Sem garantia do FGC. Volatilidade moderada a alta.', costs: 'Taxa de administração 1,5% a.a. + performance. IR regressivo.', docs: ['Lâmina do fundo', 'Regulamento'] },
    { id: 'PR10', name: 'Carteira Ações Dividendos', class: 'Ações', subclass: 'Ações BR', issuer: 'B3', indexer: '—', term: '—', liquidity: 'D+2', minApplication: 3000, riskLevel: 4, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Cesta de ações listadas com histórico consistente de distribuição de dividendos.', risks: 'Sem garantia do FGC. Risco de mercado de renda variável.', costs: 'Corretagem por operação. IR de 15% sobre ganho de capital.', docs: ['Relatório de composição da carteira'] },
    { id: 'PR11', name: 'Carteira Ações Small Caps', class: 'Ações', subclass: 'Ações BR', issuer: 'B3', indexer: '—', term: '—', liquidity: 'D+2', minApplication: 5000, riskLevel: 5, available: false, eligibleSegments: ['Private', 'Corporate'], description: 'Cesta de empresas de menor capitalização com maior potencial de crescimento e maior volatilidade.', risks: 'Sem garantia do FGC. Alta volatilidade e menor liquidez das ações componentes.', costs: 'Corretagem por operação. IR de 15% sobre ganho de capital.', docs: ['Relatório de composição da carteira'], unavailableReason: 'Temporariamente indisponível para novas aplicações — carteira em rebalanceamento.' },
    { id: 'PR12', name: 'FII Logística Sudeste', class: 'FIIs', subclass: 'Fundo imobiliário', issuer: 'Gestora Independente', indexer: '—', term: '—', liquidity: 'D+2', minApplication: 1000, riskLevel: 3, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'FII de galpões logísticos com contratos de locação de longo prazo.', risks: 'Sem garantia do FGC. Risco de vacância e de mercado imobiliário.', costs: 'Taxa de administração 0,9% a.a. Isento de IR sobre dividendos mensais para pessoa física.', docs: ['Lâmina do fundo', 'Relatório gerencial'] },
    { id: 'PR13', name: 'FII Shoppings Brasil', class: 'FIIs', subclass: 'Fundo imobiliário', issuer: 'Gestora Independente', indexer: '—', term: '—', liquidity: 'D+2', minApplication: 1000, riskLevel: 3, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'FII de shoppings centers em praças consolidadas.', risks: 'Sem garantia do FGC. Risco de vacância e de mercado imobiliário.', costs: 'Taxa de administração 1,0% a.a. Isento de IR sobre dividendos mensais para pessoa física.', docs: ['Lâmina do fundo', 'Relatório gerencial'] },
    { id: 'PR14', name: 'PGBL Multimercado', class: 'Previdência', subclass: 'PGBL', issuer: 'Inter Seguros', indexer: '—', term: 'aberto', liquidity: 'D+30', minApplication: 500, riskLevel: 2, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Previdência com benefício fiscal para declaração completa de IR, carteira multimercado.', risks: 'Sem garantia do FGC. Sujeito à performance da carteira subjacente.', costs: 'Taxa de administração 1,2% a.a. Taxa de carregamento zero.', docs: ['Regulamento do plano'] },
    { id: 'PR15', name: 'VGBL Renda Fixa', class: 'Previdência', subclass: 'VGBL', issuer: 'Inter Seguros', indexer: 'CDI', term: 'aberto', liquidity: 'D+30', minApplication: 500, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Previdência indicada para declaração simplificada de IR ou sucessão patrimonial.', risks: 'Sem garantia do FGC.', costs: 'Taxa de administração 0,8% a.a. Taxa de carregamento zero.', docs: ['Regulamento do plano'] },
    { id: 'PR16', name: 'ETF S&P 500 (via Global Account)', class: 'Global', subclass: 'ETF internacional', issuer: 'Inter Global', indexer: 'S&P 500', term: '—', liquidity: 'D+3', minApplication: 1000, riskLevel: 4, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Exposição diversificada às 500 maiores empresas listadas nos EUA, em dólar.', risks: 'Sem garantia do FGC. Risco cambial e de mercado internacional.', costs: 'Corretagem internacional por operação. IR de 15% sobre ganho de capital.', docs: ['Lâmina do ETF', 'Termo de abertura Global Account'] },
    { id: 'PR17', name: 'ETF Nasdaq 100 (via Global Account)', class: 'Global', subclass: 'ETF internacional', issuer: 'Inter Global', indexer: 'Nasdaq 100', term: '—', liquidity: 'D+3', minApplication: 1000, riskLevel: 4, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Exposição concentrada em empresas de tecnologia listadas nos EUA, em dólar.', risks: 'Sem garantia do FGC. Risco cambial, setorial e de mercado internacional.', costs: 'Corretagem internacional por operação. IR de 15% sobre ganho de capital.', docs: ['Lâmina do ETF', 'Termo de abertura Global Account'] },
    { id: 'PR18', name: 'Fundo Cambial Dólar', class: 'Global', subclass: 'Fundo cambial', issuer: 'Gestora Parceira', indexer: 'USD', term: 'aberto', liquidity: 'D+1', minApplication: 500, riskLevel: 2, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Exposição à variação cambial do dólar americano via fundo local.', risks: 'Sem garantia do FGC. Risco cambial.', costs: 'Taxa de administração 1,0% a.a. IR regressivo.', docs: ['Lâmina do fundo'] },
    { id: 'PR19', name: 'Conta Remunerada 100% CDI', class: 'Caixa', subclass: 'Conta corrente', issuer: 'Banco Inter', indexer: 'CDI', term: '—', liquidity: 'Imediata', minApplication: 0, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Saldo em conta corrente com rendimento automático de 100% do CDI.', risks: 'Garantido pelo FGC até o limite legal.', costs: 'Sem taxa. IR regressivo sobre o rendimento.', docs: ['Regulamento da conta remunerada'] },

    // Produtos citados nominalmente na jornada de Produtos (EP-02) — ampliam as
    // classes Inflação e Pós-fixado para a vitrine de João Pedro Silva (C17).
    { id: 'PR20', name: 'Tesouro IPCA+ 2032', class: 'Inflação', subclass: 'Tesouro IPCA+', issuer: 'Tesouro Nacional', indexer: 'IPCA', term: 'até mai/2032', liquidity: 'D+1', minApplication: 100, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Título público indexado à inflação com juro real definido na compra, vencimento 2032.', risks: 'Risco soberano (baixo). Marcação a mercado no resgate antecipado.', costs: 'Taxa de custódia B3 de 0,20% a.a. IR regressivo.', docs: ['Lâmina do Tesouro Direto'] },
    { id: 'PR21', name: 'CDB Banco Alpha IPCA+ 6,5% 2030', class: 'Inflação', subclass: 'CDB', issuer: 'Banco Alpha', indexer: 'IPCA', term: 'até nov/2030', liquidity: 'No vencimento', minApplication: 1000, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'CDB indexado ao IPCA com juro real prefixado, protegido pelo FGC.', risks: 'Garantido pelo FGC até o limite legal. Risco de crédito do emissor acima do limite coberto.', costs: 'Sem taxa de administração. IR regressivo.', docs: ['Lâmina do produto', 'Regulamento FGC'] },
    { id: 'PR22', name: 'Debênture Infra X IPCA+ 7,0% 2031', class: 'Inflação', subclass: 'Debênture', issuer: 'Empresa X', indexer: 'IPCA', term: 'até jan/2031', liquidity: 'D+2', minApplication: 5000, riskLevel: 3, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Debênture incentivada de infraestrutura, isenta de IR, indexada ao IPCA.', risks: 'Sem garantia do FGC. Risco de crédito do emissor e de liquidez de mercado secundário.', costs: 'Isenta de IR para pessoa física. Sem taxa de administração.', docs: ['Lâmina do produto', 'Escritura de emissão'] },
    { id: 'PR23', name: 'CDB Banco Alpha 112% CDI 2028', class: 'Pós-fixado', subclass: 'CDB', issuer: 'Banco Alpha', indexer: 'CDI', term: 'até nov/2028', liquidity: 'No vencimento', minApplication: 1000, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'CDB pós-fixado do Banco Alpha, protegido pelo FGC, vencimento 2028.', risks: 'Garantido pelo FGC até o limite legal. Risco de crédito do emissor acima do limite coberto.', costs: 'Sem taxa de administração. IR regressivo.', docs: ['Lâmina do produto', 'Regulamento FGC'] },
    { id: 'PR24', name: 'LCI Banco Beta 94% CDI 2027', class: 'Pós-fixado', subclass: 'LCI', issuer: 'Banco Beta', indexer: 'CDI', term: 'até jun/2027', liquidity: 'D+1', minApplication: 5000, riskLevel: 1, available: true, eligibleSegments: ['Standard', 'High', 'Private', 'Corporate'], description: 'Letra de crédito imobiliário isenta de IR para pessoa física, com liquidez após carência.', risks: 'Garantido pelo FGC até o limite legal.', costs: 'Isenta de IR para pessoa física. Sem taxa de administração.', docs: ['Lâmina do produto', 'Regulamento FGC'] },
    { id: 'PR25', name: 'CDB Banco Gamma 110% CDI 2029', class: 'Pós-fixado', subclass: 'CDB', issuer: 'Banco Gamma', indexer: 'CDI', term: 'até jan/2029', liquidity: 'No vencimento', minApplication: 10000, riskLevel: 1, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'CDB pós-fixado do Banco Gamma, protegido pelo FGC, vencimento 2029.', risks: 'Garantido pelo FGC até o limite legal. Risco de crédito do emissor acima do limite coberto.', costs: 'Sem taxa de administração. IR regressivo.', docs: ['Lâmina do produto', 'Regulamento FGC'],
      // Taxa atualizada desde que foi cotada — dispara o estado "Taxa atualizada" no catálogo e a Divergência na Revisão.
      rateUpdated: true, previousRateValue: 112, previousRateLabel: '112% CDI' },

    // Produtos nomeados no mockup da página de Produtos (catálogo denso) — já
    // vêm com os campos de enriquecimento definidos manualmente (o loop abaixo
    // não sobrescreve produtos que já chegam com `rating` preenchido).
    { id: 'PR26', name: 'LF Banco Delta', class: 'Prefixado', subclass: 'LF', issuer: 'Banco Delta', indexer: 'Prefixado', term: 'até mai/2030', liquidity: 'Semestral', minApplication: 50000, riskLevel: 3, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Letra financeira prefixada com resgate semestral, indicada para quem busca previsibilidade.', risks: 'Sem garantia do FGC (letra financeira). Risco de crédito do emissor.', costs: 'Sem taxa de administração. IR regressivo.', docs: ['Lâmina do produto'],
      rating: 'AA', fgc: false, negotiable: true, rateUnit: '% a.a.', rateValue: 12.45, rateRef: 12.3, rateMin: 11.8, rateMax: 13.0, rateLabel: '12,45% a.a.',
      availableStock: 150000, lowStock: true, maturityDate: '2030-05-10' },
    { id: 'PR27', name: 'CRI Direcional', class: 'Inflação', subclass: 'CRI', issuer: 'Securitizadora Direcional', indexer: 'IPCA', term: 'até ago/2032', liquidity: 'No vencimento', minApplication: 1000, riskLevel: 4, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Certificado de recebíveis imobiliários lastreado em recebíveis da Direcional, isento de IR.', risks: 'Sem garantia do FGC. Risco de crédito do lastro e do securitizador.', costs: 'Isento de IR para pessoa física. Sem taxa de administração.', docs: ['Lâmina do produto', 'Prospecto de emissão'],
      rating: 'A-', fgc: false, negotiable: true, rateUnit: 'IPCA+', rateValue: 6.8, rateRef: 6.7, rateMin: 6.4, rateMax: 7.0, rateLabel: 'IPCA + 6,80%',
      availableStock: 45000, lowStock: false, maturityDate: '2032-08-15' },
    { id: 'PR28', name: 'Fundo Horizon FIM', class: 'Multimercado', subclass: 'Fundo multimercado', issuer: 'Horizon Asset', indexer: 'CDI+', term: 'aberto', liquidity: 'D+5', minApplication: 5000, riskLevel: 3, available: true, eligibleSegments: ['High', 'Private', 'Corporate'], description: 'Fundo multimercado com meta de rentabilidade de 110% do CDI no médio prazo.', risks: 'Sem garantia do FGC. Volatilidade moderada; meta de rentabilidade não é garantia de retorno.', costs: 'Taxa de administração 1,2% a.a. + performance. IR regressivo.', docs: ['Lâmina do fundo', 'Regulamento'],
      rating: 'AAA', fgc: false, negotiable: false, rateUnit: null, rateValue: null, rateRef: null, rateMin: null, rateMax: null, rateLabel: '110% CDI (Alvo)',
      availableStock: null, unlimitedStock: true, lowStock: false, maturityDate: null },
  ];

  // Enriquecimento determinístico do catálogo para a jornada de Produtos (EP-02):
  // rating, cobertura FGC, estoque disponível e a banda de taxa negociável
  // (mín/ref/máx). Derivado dos campos existentes — sem editar os 25 à mão.
  (function enrichProducts() {
    const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
    const RATING_BY_RISK = { 1: 'AAA', 2: 'AA+', 3: 'AA', 4: 'A', 5: 'BBB' };
    const isFixedIncome = (p) => ['CDI', 'IPCA', 'Prefixado'].indexOf(p.indexer) !== -1 && p.class !== 'Caixa';
    // Extrai o número da taxa embutido no nome, quando houver (ex.: "112% CDI", "IPCA+ 6,5%", "12,5% a.a.").
    const parseRate = (p) => {
      const name = p.name.replace(/,/g, '.');
      // Sempre exige o sinal de % para não confundir com o ano no nome (ex.: "IPCA+ 2035").
      if (p.indexer === 'CDI') { const m = name.match(/(\d{2,3})%\s*(?:do\s*)?CDI/i); return m ? parseFloat(m[1]) : null; }
      if (p.indexer === 'IPCA') { const m = name.match(/IPCA\+?\s*(\d{1,2}(?:\.\d)?)\s*%/i); return m ? parseFloat(m[1]) : null; }
      if (p.indexer === 'Prefixado') { const m = name.match(/(\d{1,2}(?:\.\d)?)%\s*a\.a\./i); return m ? parseFloat(m[1]) : null; }
      return null;
    };
    // "até <mês>/<ano>" → último dia do mês (ISO). "N meses" → NOW + N meses.
    // Sem padrão reconhecível (aberto, aportes sem prazo etc.) → sem vencimento.
    const MESES_PT = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
    function parseMaturity(term) {
      if (!term) return null;
      const abs = term.match(/at[ée]\s+([a-zç]{3})\/(\d{4})/i);
      if (abs) {
        const mi = MESES_PT[abs[1].toLowerCase()];
        if (mi != null) return new Date(Date.UTC(parseInt(abs[2], 10), mi + 1, 0)).toISOString().slice(0, 10);
      }
      const rel = term.match(/(\d+)\s*meses/i);
      if (rel) {
        const d = new Date(NOW);
        d.setUTCMonth(d.getUTCMonth() + parseInt(rel[1], 10));
        return d.toISOString().slice(0, 10);
      }
      return null;
    }
    products.forEach((p) => {
      p.maturityDate = parseMaturity(p.term);
      if (p.rating) return; // já enriquecido manualmente (produtos nomeados do mockup) — não sobrescrever.
      const seed = hash(p.id);
      const soberano = p.issuer === 'Tesouro Nacional';
      p.rating = soberano ? 'Soberano' : (RATING_BY_RISK[p.riskLevel] || 'A');
      p.fgc = /CDB|LCI|LCA/i.test(p.subclass);
      // Estoque disponível: R$ 200 mil a ~R$ 4,8 mi (arredondado a 10 mil); soberano é "ilimitado" (estoque alto).
      p.availableStock = soberano ? 4800000 : Math.round((200000 + seed * 2600000) / 10000) * 10000;
      p.lowStock = !soberano && p.availableStock < 350000;
      p.negotiable = isFixedIncome(p);
      if (p.negotiable) {
        const ref = parseRate(p);
        if (p.indexer === 'CDI') {
          const r = ref != null ? ref : Math.round(96 + seed * 22);
          p.rateUnit = '% CDI'; p.rateRef = r - 1; p.rateMin = r - 4; p.rateMax = r + 2; p.rateValue = r;
          p.rateLabel = `${r}% CDI`;
        } else if (p.indexer === 'IPCA') {
          const r = ref != null ? ref : Math.round((5.5 + seed * 1.7) * 10) / 10;
          p.rateUnit = 'IPCA+'; p.rateRef = Math.round((r - 0.1) * 10) / 10; p.rateMin = Math.round((r - 0.4) * 10) / 10; p.rateMax = Math.round((r + 0.2) * 10) / 10; p.rateValue = r;
          p.rateLabel = `IPCA + ${r.toString().replace('.', ',')}%`;
        } else { // Prefixado
          const r = ref != null ? ref : Math.round((11 + seed * 2.5) * 10) / 10;
          p.rateUnit = '% a.a.'; p.rateRef = Math.round((r - 0.2) * 10) / 10; p.rateMin = Math.round((r - 0.7) * 10) / 10; p.rateMax = Math.round((r + 0.5) * 10) / 10; p.rateValue = r;
          p.rateLabel = `${r.toString().replace('.', ',')}% a.a.`;
        }
      } else {
        p.rateValue = null; p.rateRef = null; p.rateMin = null; p.rateMax = null; p.rateUnit = null;
        p.rateLabel = p.indexer && p.indexer !== '—' ? p.indexer : '—';
      }
    });
  })();

  // ---------------------------------------------------------------------
  // Simulações / propostas (US-11, US-12) — alguns exemplos pré-existentes
  // para a lista de propostas não nascer vazia.
  // ---------------------------------------------------------------------
  // Campos da jornada consultiva (US-11/US-12, Fase 1):
  //   objectives[]    — objetivos do cliente (Tela 03), chaves de SIMULATION_OBJECTIVES
  //   simulationValue — valor sendo simulado (Tela 03)
  //   fundingSource   — 'novo' | 'carteira' | 'ambos'
  //   notes           — observação livre do consultor
  //   rationale       — racional editável da recomendação (Tela 07)
  //   currentStep     — passo do wizard para retomada
  //   sharedAt        — data de compartilhamento (Fase 2)
  //   reportConfig    — config do relatório (Fase 2)
  const simulations = [
    {
      id: 'SIM01', clientId: 'C02', name: 'Rolagem CDB + diversificação em multimercado', status: 'em_analise',
      createdBy: 'Marina Ferraz', createdAt: '2026-07-19T10:00:00-03:00', updatedAt: '2026-07-19T16:30:00-03:00',
      objectives: ['rebalancear', 'diversificar'], simulationValue: 400000, fundingSource: 'carteira',
      notes: 'Cliente quer reduzir concentração em pós-fixados mantendo liquidez.', rationale: '', currentStep: 'analise',
      items: [{ productId: 'PR01', allocatedValue: 300000 }, { productId: 'PR09', allocatedValue: 100000 }],
      reportGeneratedAt: '2026-07-19T16:30:00-03:00', sharedAt: null, reportConfig: null, version: 2,
    },
    {
      id: 'SIM02', clientId: 'C01', name: 'Diversificação do caixa investível em dólar', status: 'rascunho',
      createdBy: 'Marina Ferraz', createdAt: '2026-07-20T09:30:00-03:00', updatedAt: '2026-07-20T09:30:00-03:00',
      objectives: ['diversificar', 'rentabilidade'], simulationValue: 260000, fundingSource: 'novo',
      notes: '', rationale: '', currentStep: 'alocacao',
      items: [{ productId: 'PR16', allocatedValue: 150000 }],
      reportGeneratedAt: null, sharedAt: null, reportConfig: null, version: 1,
    },
    {
      id: 'SIM03', clientId: 'C09', name: 'Realocação de resgate para crédito privado', status: 'compartilhada',
      createdBy: 'Camila Duarte', createdAt: '2026-07-14T11:00:00-03:00', updatedAt: '2026-07-15T09:00:00-03:00',
      objectives: ['rebalancear'], simulationValue: 500000, fundingSource: 'carteira',
      notes: 'Recurso do resgate do Tesouro para crédito privado.', rationale: 'Realoca recurso ocioso para crédito privado com liquidez D+5, elevando a rentabilidade esperada sem sair do perfil.',
      currentStep: 'analise', items: [{ productId: 'PR07', allocatedValue: 500000 }],
      reportGeneratedAt: '2026-07-15T09:00:00-03:00', sharedAt: '2026-07-15T09:10:00-03:00', reportConfig: null, version: 3,
    },
    {
      id: 'SIM04', clientId: 'C01', name: 'Proteção contra inflação — Private', status: 'compartilhada',
      createdBy: 'Marina Ferraz', createdAt: '2026-07-12T14:00:00-03:00', updatedAt: '2026-07-13T10:00:00-03:00',
      objectives: ['reduzir_risco', 'diversificar'], simulationValue: 300000, fundingSource: 'ambos',
      notes: '', rationale: 'Aumenta a fatia indexada à inflação para preservar poder de compra no longo prazo.',
      currentStep: 'analise', items: [{ productId: 'PR05', allocatedValue: 200000 }, { productId: 'PR06', allocatedValue: 100000 }],
      reportGeneratedAt: '2026-07-13T10:00:00-03:00', sharedAt: '2026-07-13T10:05:00-03:00', reportConfig: null, version: 2,
    },
    {
      id: 'SIM05', clientId: 'C04', name: 'Reserva de liquidez pré-imóvel', status: 'aguardando_cliente',
      createdBy: 'Marina Ferraz', createdAt: '2026-07-16T09:00:00-03:00', updatedAt: '2026-07-17T11:00:00-03:00',
      objectives: ['liquidez'], simulationValue: 250000, fundingSource: 'carteira',
      notes: 'Cliente quer manter liquidez para aquisição de imóvel em ~6 meses.', rationale: 'Prioriza liquidez de curtíssimo prazo mantendo rendimento próximo ao CDI.',
      currentStep: 'analise', items: [{ productId: 'PR19', allocatedValue: 150000 }, { productId: 'PR01', allocatedValue: 100000 }],
      reportGeneratedAt: '2026-07-17T11:00:00-03:00', sharedAt: '2026-07-17T11:05:00-03:00', reportConfig: null, version: 2,
    },
    {
      id: 'SIM06', clientId: 'C07', name: 'Primeira carteira — perfil conservador', status: 'concluida',
      createdBy: 'Marina Ferraz', createdAt: '2026-07-05T09:00:00-03:00', updatedAt: '2026-07-08T16:00:00-03:00',
      objectives: ['novo_aporte'], simulationValue: 120000, fundingSource: 'novo',
      notes: '', rationale: 'Carteira conservadora com liquidez e proteção, adequada à primeira alocação do cliente.',
      currentStep: 'analise', items: [{ productId: 'PR01', allocatedValue: 60000 }, { productId: 'PR15', allocatedValue: 60000 }],
      reportGeneratedAt: '2026-07-08T16:00:00-03:00', sharedAt: '2026-07-06T10:00:00-03:00', reportConfig: null, version: 4,
    },
    {
      id: 'SIM07', clientId: 'C02', name: 'Estudo de renda variável — dividendos', status: 'rascunho',
      createdBy: 'Marina Ferraz', createdAt: '2026-07-20T10:10:00-03:00', updatedAt: '2026-07-20T10:20:00-03:00',
      objectives: ['rentabilidade', 'comparar'], simulationValue: 100000, fundingSource: 'novo',
      notes: '', rationale: '', currentStep: 'produtos',
      items: [{ productId: 'PR10', allocatedValue: 30000 }],
      reportGeneratedAt: null, sharedAt: null, reportConfig: null, version: 1,
    },
    {
      id: 'SIM08', clientId: 'C06', name: 'Caixa PJ — crédito corporativo', status: 'em_analise',
      createdBy: 'Bruno Castilho', createdAt: '2026-07-18T08:30:00-03:00', updatedAt: '2026-07-18T15:00:00-03:00',
      objectives: ['rentabilidade', 'rebalancear'], simulationValue: 700000, fundingSource: 'carteira',
      notes: 'Aplicar caixa PJ ocioso em crédito privado de alta qualidade.', rationale: '',
      currentStep: 'analise', items: [{ productId: 'PR07', allocatedValue: 500000 }, { productId: 'PR05', allocatedValue: 200000 }],
      reportGeneratedAt: null, sharedAt: null, reportConfig: null, version: 1,
    },
    // Estratégia definida no Simulador para João Pedro Silva (C17) — carteira-alvo
    // que a jornada de Produtos (EP-02) recebe como contexto somente-leitura.
    {
      id: 'SIM_JP', clientId: 'C17', name: 'Estratégia de rebalanceamento 2026 — João Pedro', status: 'compartilhada',
      createdBy: 'Rafael Almeida', createdAt: '2026-08-11T14:00:00-03:00', updatedAt: '2026-08-12T15:00:00-03:00',
      objectives: ['rebalancear', 'diversificar'], simulationValue: 450000, fundingSource: 'novo',
      notes: 'Reduzir concentração em pós-fixado e renda variável; elevar inflação e prefixado ao alvo.', rationale: 'Aproxima a carteira do perfil Moderado, ampliando a proteção à inflação e reduzindo o risco de renda variável.',
      currentStep: 'analise', items: [],
      targetAllocation: { 'Pós-fixado': 30, 'Inflação': 20, 'Prefixado': 10, 'Multimercado': 15, 'Ações': 15, 'Global': 10 },
      reportGeneratedAt: '2026-08-12T15:00:00-03:00', sharedAt: '2026-08-12T15:05:00-03:00', reportConfig: null, version: 2,
    },
  ];

  // ---------------------------------------------------------------------
  // Serviços operacionais (US-14) — reset de credencial, bloqueio
  // preventivo, consulta de documentos, serviços bancários.
  // ---------------------------------------------------------------------
  const serviceRequests = [
    { id: 'SR01', clientId: 'C01', type: 'consulta_documento', description: 'Consulta de informe de rendimentos 2025', status: 'concluida', protocol: 'OP-58201', requestedBy: 'Marina Ferraz', requestedAt: '2026-07-15T10:00:00-03:00', dueAt: '2026-07-16T18:00:00-03:00', resolvedAt: '2026-07-15T14:00:00-03:00',
      timeline: [{ date: '2026-07-15T10:00:00-03:00', status: 'aberta', detail: 'Solicitação registrada.' }, { date: '2026-07-15T14:00:00-03:00', status: 'concluida', detail: 'Documento localizado e disponibilizado ao cliente (ação simulada).' }] },
    { id: 'SR02', clientId: 'C02', type: 'reset_credencial', description: 'Reset de senha do app após bloqueio por tentativas incorretas', status: 'em_andamento', protocol: 'OP-58215', requestedBy: 'Marina Ferraz', requestedAt: '2026-07-19T09:00:00-03:00', dueAt: '2026-07-20T18:00:00-03:00', resolvedAt: null,
      timeline: [{ date: '2026-07-19T09:00:00-03:00', status: 'aberta', detail: 'Solicitação registrada.' }, { date: '2026-07-19T09:30:00-03:00', status: 'em_andamento', detail: 'Encaminhada para validação de identidade.' }] },
    { id: 'SR03', clientId: 'C04', type: 'bloqueio_preventivo', description: 'Bloqueio preventivo por suspeita de movimentação atípica', status: 'concluida', protocol: 'OP-58190', requestedBy: 'Marina Ferraz', requestedAt: '2026-07-18T11:00:00-03:00', dueAt: '2026-07-18T18:00:00-03:00', resolvedAt: '2026-07-18T11:20:00-03:00',
      timeline: [{ date: '2026-07-18T11:00:00-03:00', status: 'aberta', detail: 'Solicitação registrada com justificativa de compliance.' }, { date: '2026-07-18T11:20:00-03:00', status: 'concluida', detail: 'Conta bloqueada preventivamente (ação simulada).' }] },
    { id: 'SR04', clientId: 'C08', type: 'reset_credencial', description: 'Reset de token de acesso', status: 'concluida', protocol: 'OP-58230', requestedBy: 'Camila Duarte', requestedAt: '2026-07-19T08:00:00-03:00', dueAt: '2026-07-19T18:00:00-03:00', resolvedAt: '2026-07-19T08:15:00-03:00',
      timeline: [{ date: '2026-07-19T08:00:00-03:00', status: 'aberta', detail: 'Solicitação registrada.' }, { date: '2026-07-19T08:15:00-03:00', status: 'concluida', detail: 'Token resetado após confirmação de identidade (ação simulada).' }] },
    { id: 'SR05', clientId: 'C09', type: 'servico_bancario', description: 'Aumento de limite de cartão de crédito', status: 'aberta', protocol: 'OP-58240', requestedBy: 'Camila Duarte', requestedAt: '2026-07-20T08:30:00-03:00', dueAt: '2026-07-22T18:00:00-03:00', resolvedAt: null,
      timeline: [{ date: '2026-07-20T08:30:00-03:00', status: 'aberta', detail: 'Solicitação registrada, aguardando análise de limite.' }] },
    { id: 'SR06', clientId: 'C10', type: 'consulta_documento', description: 'Reenvio de comprovante de residência para concluir onboarding', status: 'aberta', protocol: 'OP-58242', requestedBy: 'Camila Duarte', requestedAt: '2026-07-19T15:30:00-03:00', dueAt: '2026-07-21T18:00:00-03:00', resolvedAt: null,
      timeline: [{ date: '2026-07-19T15:30:00-03:00', status: 'aberta', detail: 'Solicitação registrada junto ao time de cadastro.' }] },
    { id: 'SR07', clientId: 'C11', type: 'bloqueio_preventivo', description: 'Bloqueio preventivo a pedido do cliente (perda de celular)', status: 'em_andamento', protocol: 'OP-58245', requestedBy: 'Camila Duarte', requestedAt: '2026-07-20T07:50:00-03:00', dueAt: '2026-07-20T12:00:00-03:00', resolvedAt: null,
      timeline: [{ date: '2026-07-20T07:50:00-03:00', status: 'aberta', detail: 'Solicitação registrada.' }, { date: '2026-07-20T08:00:00-03:00', status: 'em_andamento', detail: 'Validação de identidade em andamento.' }] },
    { id: 'SR08', clientId: 'C12', type: 'servico_bancario', description: 'Emissão de cartão adicional PJ para novo representante', status: 'aberta', protocol: 'OP-58250', requestedBy: 'Eduardo Prado', requestedAt: '2026-07-20T09:10:00-03:00', dueAt: '2026-07-23T18:00:00-03:00', resolvedAt: null,
      timeline: [{ date: '2026-07-20T09:10:00-03:00', status: 'aberta', detail: 'Solicitação registrada — pendente validação de poderes do representante.' }] },
    { id: 'SR09', clientId: 'C14', type: 'reset_credencial', description: 'Reset de senha do app', status: 'concluida', protocol: 'OP-58180', requestedBy: 'Camila Duarte', requestedAt: '2026-07-17T09:00:00-03:00', dueAt: '2026-07-17T18:00:00-03:00', resolvedAt: '2026-07-17T09:10:00-03:00',
      timeline: [{ date: '2026-07-17T09:00:00-03:00', status: 'aberta', detail: 'Solicitação registrada.' }, { date: '2026-07-17T09:10:00-03:00', status: 'concluida', detail: 'Senha resetada após confirmação de identidade (ação simulada).' }] },
  ];

  // ---------------------------------------------------------------------
  // Jornada de Operações — fila operacional interna (prioridade/SLA/aging),
  // modelo próprio e independente de `serviceRequests` (que segue servindo
  // só a aba Banking da ficha do cliente — ver GOVERNANCA.md).
  // ---------------------------------------------------------------------
  const operations = [
    { id: "OPS01", clientId: "C01", protocol: "OP-29301", type: "bloqueio_preventivo", priority: "alta", status: "concluida", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T09:00:00-03:00", dueAt: "2026-07-20T09:00:00-03:00", resolvedAt: "2026-07-19T11:00:00-03:00", motivoPrincipal: null, timeline: [{ date: "2026-07-19T09:00:00-03:00", detail: "Operação registrada. Bloqueio preventivo de segurança solicitado pelo cliente." }, { date: "2026-07-19T11:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS02", clientId: "C01", protocol: "OP-29302", type: "alteracao_cadastral", priority: "media", status: "aguardando_documento", responsavel: "Bruno Castilho", nextAction: "Solicitar assinatura", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-20T09:42:00-03:00", resolvedAt: null, motivoPrincipal: "Aguardando cliente", timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }] },
    { id: "OPS03", clientId: "C02", protocol: "OP-29303", type: "alteracao_cadastral", priority: "baixa", status: "pendencia_interna", responsavel: "Rafael Nunes", nextAction: "Backoffice deve revisar", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-20T10:15:00-03:00", resolvedAt: null, motivoPrincipal: "Aprovação interna", timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }] },
    { id: "OPS04", clientId: "C02", protocol: "OP-29304", type: "aumento_limite_pix", priority: "media", status: "concluida_parcial", responsavel: "Camila Duarte", nextAction: null, openedAt: "2026-07-16T06:00:00-03:00", dueAt: "2026-07-18T18:00:00-03:00", resolvedAt: "2026-07-16T11:00:00-03:00", motivoPrincipal: null, timeline: [{ date: "2026-07-16T06:00:00-03:00", detail: "Operação registrada. Solicitação de aumento de limite diário do PIX." }, { date: "2026-07-16T11:00:00-03:00", detail: "Operação concluída parcialmente — pendência residual registrada (ação simulada)." }] },
    { id: "OPS05", clientId: "C03", protocol: "OP-29305", type: "aumento_limite_pix", priority: "critica", status: "em_processamento", responsavel: "Diego Antunes", nextAction: "Aguardar emissão", openedAt: "2026-07-20T08:00:00-03:00", dueAt: "2026-07-22T09:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-20T08:00:00-03:00", detail: "Operação registrada. Solicitação de aumento de limite diário do PIX." }] },
    { id: "OPS06", clientId: "C03", protocol: "OP-29306", type: "cartao_adicional", priority: "alta", status: "concluida", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T04:00:00-03:00", dueAt: "2026-07-20T16:00:00-03:00", resolvedAt: "2026-07-19T11:00:00-03:00", motivoPrincipal: "Documento incompleto", timeline: [{ date: "2026-07-19T04:00:00-03:00", detail: "Operação registrada. Emissão de cartão adicional para dependente." }, { date: "2026-07-19T11:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS07", clientId: "C04", protocol: "OP-29307", type: "cartao_adicional", priority: "media", status: "novo", responsavel: "Bruno Castilho", nextAction: "Gerar relatório", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-21T03:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Emissão de cartão adicional para dependente." }] },
    { id: "OPS08", clientId: "C04", protocol: "OP-29308", type: "resgate_investimento", priority: "baixa", status: "em_analise", responsavel: "Rafael Nunes", nextAction: "Validar segurança", openedAt: "2026-07-19T14:00:00-03:00", dueAt: "2026-07-21T13:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T14:00:00-03:00", detail: "Operação registrada. Resgate de posição para uso do cliente." }] },
    { id: "OPS09", clientId: "C05", protocol: "OP-29309", type: "resgate_investimento", priority: "alta", status: "aguardando_documento", responsavel: "Camila Duarte", nextAction: "Solicitar assinatura", openedAt: "2026-07-20T08:00:00-03:00", dueAt: "2026-07-21T23:00:00-03:00", resolvedAt: null, motivoPrincipal: "Dependência externa", timeline: [{ date: "2026-07-20T08:00:00-03:00", detail: "Operação registrada. Resgate de posição para uso do cliente." }] },
    { id: "OPS10", clientId: "C05", protocol: "OP-29310", type: "segunda_via_informe", priority: "media", status: "pendencia_interna", responsavel: "Diego Antunes", nextAction: "Backoffice deve revisar", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-20T07:30:00-03:00", resolvedAt: null, motivoPrincipal: "Dependência sistêmica", timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Emissão de segunda via de informe de rendimentos." }] },
    { id: "OPS11", clientId: "C06", protocol: "OP-29311", type: "atualizacao_representante", priority: "alta", status: "concluida", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T05:00:00-03:00", dueAt: "2026-07-21T05:00:00-03:00", resolvedAt: "2026-07-19T17:00:00-03:00", motivoPrincipal: "Documento incompleto", timeline: [{ date: "2026-07-19T05:00:00-03:00", detail: "Operação registrada. Troca do representante legal autorizado." }, { date: "2026-07-19T17:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS12", clientId: "C06", protocol: "OP-29312", type: "regularizacao_societaria", priority: "media", status: "em_processamento", responsavel: "Bruno Castilho", nextAction: "Aguardar emissão", openedAt: "2026-07-19T14:00:00-03:00", dueAt: "2026-07-20T10:15:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T14:00:00-03:00", detail: "Operação registrada. Regularização de documentação societária." }] },
    { id: "OPS13", clientId: "C07", protocol: "OP-29313", type: "atualizacao_suitability", priority: "baixa", status: "aguardando_backoffice", responsavel: "Rafael Nunes", nextAction: "Checar custódia", openedAt: "2026-07-20T08:00:00-03:00", dueAt: "2026-07-20T11:30:00-03:00", resolvedAt: null, motivoPrincipal: "Aprovação interna", timeline: [{ date: "2026-07-20T08:00:00-03:00", detail: "Operação registrada. Reaplicação do questionário de suitability." }] },
    { id: "OPS14", clientId: "C07", protocol: "OP-29314", type: "bloqueio_preventivo", priority: "media", status: "novo", responsavel: "Camila Duarte", nextAction: "Gerar relatório", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-21T23:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Bloqueio preventivo de segurança solicitado pelo cliente." }] },
    { id: "OPS15", clientId: "C08", protocol: "OP-29315", type: "bloqueio_preventivo", priority: "critica", status: "em_analise", responsavel: "Diego Antunes", nextAction: "Validar segurança", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-22T09:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Bloqueio preventivo de segurança solicitado pelo cliente." }] },
    { id: "OPS16", clientId: "C08", protocol: "OP-29316", type: "alteracao_cadastral", priority: "alta", status: "concluida_parcial", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T06:00:00-03:00", dueAt: "2026-07-21T18:00:00-03:00", resolvedAt: "2026-07-19T23:00:00-03:00", motivoPrincipal: null, timeline: [{ date: "2026-07-19T06:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }, { date: "2026-07-19T23:00:00-03:00", detail: "Operação concluída parcialmente — pendência residual registrada (ação simulada)." }] },
    { id: "OPS17", clientId: "C09", protocol: "OP-29317", type: "alteracao_cadastral", priority: "media", status: "pendencia_interna", responsavel: "Bruno Castilho", nextAction: "Backoffice deve revisar", openedAt: "2026-07-20T08:00:00-03:00", dueAt: "2026-07-21T03:00:00-03:00", resolvedAt: null, motivoPrincipal: "Aguardando cliente", timeline: [{ date: "2026-07-20T08:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }] },
    { id: "OPS18", clientId: "C09", protocol: "OP-29318", type: "aumento_limite_pix", priority: "baixa", status: "concluida", responsavel: "Rafael Nunes", nextAction: null, openedAt: "2026-07-17T04:00:00-03:00", dueAt: "2026-07-18T16:00:00-03:00", resolvedAt: "2026-07-17T23:00:00-03:00", motivoPrincipal: "Aprovação interna", timeline: [{ date: "2026-07-17T04:00:00-03:00", detail: "Operação registrada. Solicitação de aumento de limite diário do PIX." }, { date: "2026-07-17T23:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS19", clientId: "C10", protocol: "OP-29319", type: "aumento_limite_pix", priority: "alta", status: "em_processamento", responsavel: "Camila Duarte", nextAction: "Aguardar emissão", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-20T07:30:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Solicitação de aumento de limite diário do PIX." }] },
    { id: "OPS20", clientId: "C10", protocol: "OP-29320", type: "cartao_adicional", priority: "media", status: "aguardando_backoffice", responsavel: "Diego Antunes", nextAction: "Checar custódia", openedAt: "2026-07-19T14:00:00-03:00", dueAt: "2026-07-20T09:42:00-03:00", resolvedAt: null, motivoPrincipal: "Dependência sistêmica", timeline: [{ date: "2026-07-19T14:00:00-03:00", detail: "Operação registrada. Emissão de cartão adicional para dependente." }] },
    { id: "OPS21", clientId: "C11", protocol: "OP-29321", type: "cartao_adicional", priority: "alta", status: "concluida", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T07:00:00-03:00", dueAt: "2026-07-20T07:00:00-03:00", resolvedAt: "2026-07-20T05:00:00-03:00", motivoPrincipal: "Documento incompleto", timeline: [{ date: "2026-07-19T07:00:00-03:00", detail: "Operação registrada. Emissão de cartão adicional para dependente." }, { date: "2026-07-20T05:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS22", clientId: "C11", protocol: "OP-29322", type: "resgate_investimento", priority: "media", status: "em_analise", responsavel: "Bruno Castilho", nextAction: "Validar segurança", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-20T11:30:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Resgate de posição para uso do cliente." }] },
    { id: "OPS23", clientId: "C12", protocol: "OP-29323", type: "regularizacao_societaria", priority: "baixa", status: "aguardando_documento", responsavel: "Rafael Nunes", nextAction: "Solicitar assinatura", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-21T13:00:00-03:00", resolvedAt: null, motivoPrincipal: "Aprovação interna", timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Regularização de documentação societária." }] },
    { id: "OPS24", clientId: "C12", protocol: "OP-29324", type: "alteracao_cadastral", priority: "media", status: "pendencia_interna", responsavel: "Camila Duarte", nextAction: "Backoffice deve revisar", openedAt: "2026-07-19T14:00:00-03:00", dueAt: "2026-07-21T23:00:00-03:00", resolvedAt: null, motivoPrincipal: "Dependência externa", timeline: [{ date: "2026-07-19T14:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }] },
    { id: "OPS25", clientId: "C13", protocol: "OP-29325", type: "segunda_via_informe", priority: "critica", status: "concluida", responsavel: "Diego Antunes", nextAction: null, openedAt: "2026-07-15T09:00:00-03:00", dueAt: "2026-07-16T09:00:00-03:00", resolvedAt: "2026-07-16T11:00:00-03:00", motivoPrincipal: null, timeline: [{ date: "2026-07-15T09:00:00-03:00", detail: "Operação registrada. Emissão de segunda via de informe de rendimentos." }, { date: "2026-07-16T11:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS26", clientId: "C13", protocol: "OP-29326", type: "atualizacao_suitability", priority: "alta", status: "concluida", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T08:00:00-03:00", dueAt: "2026-07-20T20:00:00-03:00", resolvedAt: "2026-07-20T08:00:00-03:00", motivoPrincipal: "Documento incompleto", timeline: [{ date: "2026-07-19T08:00:00-03:00", detail: "Operação registrada. Reaplicação do questionário de suitability." }, { date: "2026-07-20T08:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS27", clientId: "C14", protocol: "OP-29327", type: "atualizacao_suitability", priority: "media", status: "aguardando_backoffice", responsavel: "Bruno Castilho", nextAction: "Checar custódia", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-21T03:00:00-03:00", resolvedAt: null, motivoPrincipal: "Aguardando cliente", timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Reaplicação do questionário de suitability." }] },
    { id: "OPS28", clientId: "C14", protocol: "OP-29328", type: "bloqueio_preventivo", priority: "baixa", status: "novo", responsavel: "Rafael Nunes", nextAction: "Gerar relatório", openedAt: "2026-07-19T14:00:00-03:00", dueAt: "2026-07-20T07:30:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T14:00:00-03:00", detail: "Operação registrada. Bloqueio preventivo de segurança solicitado pelo cliente." }] },
    { id: "OPS29", clientId: "C15", protocol: "OP-29329", type: "bloqueio_preventivo", priority: "alta", status: "em_analise", responsavel: "Camila Duarte", nextAction: "Validar segurança", openedAt: "2026-07-20T08:00:00-03:00", dueAt: "2026-07-20T09:42:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-20T08:00:00-03:00", detail: "Operação registrada. Bloqueio preventivo de segurança solicitado pelo cliente." }] },
    { id: "OPS30", clientId: "C15", protocol: "OP-29330", type: "alteracao_cadastral", priority: "media", status: "aguardando_documento", responsavel: "Diego Antunes", nextAction: "Solicitar assinatura", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-20T10:15:00-03:00", resolvedAt: null, motivoPrincipal: "Dependência sistêmica", timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }] },
    { id: "OPS31", clientId: "C16", protocol: "OP-29331", type: "atualizacao_representante", priority: "alta", status: "concluida", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T09:00:00-03:00", dueAt: "2026-07-21T09:00:00-03:00", resolvedAt: "2026-07-19T11:00:00-03:00", motivoPrincipal: null, timeline: [{ date: "2026-07-19T09:00:00-03:00", detail: "Operação registrada. Troca do representante legal autorizado." }, { date: "2026-07-19T11:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS32", clientId: "C16", protocol: "OP-29332", type: "regularizacao_societaria", priority: "media", status: "concluida_parcial", responsavel: "Bruno Castilho", nextAction: null, openedAt: "2026-07-18T08:00:00-03:00", dueAt: "2026-07-20T20:00:00-03:00", resolvedAt: "2026-07-18T11:00:00-03:00", motivoPrincipal: "Aguardando cliente", timeline: [{ date: "2026-07-18T08:00:00-03:00", detail: "Operação registrada. Regularização de documentação societária." }, { date: "2026-07-18T11:00:00-03:00", detail: "Operação concluída parcialmente — pendência residual registrada (ação simulada)." }] },
    { id: "OPS33", clientId: "C17", protocol: "OP-29333", type: "aumento_limite_pix", priority: "baixa", status: "em_processamento", responsavel: "Rafael Nunes", nextAction: "Aguardar emissão", openedAt: "2026-07-20T08:00:00-03:00", dueAt: "2026-07-21T13:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-20T08:00:00-03:00", detail: "Operação registrada. Solicitação de aumento de limite diário do PIX." }] },
    { id: "OPS34", clientId: "C17", protocol: "OP-29334", type: "cartao_adicional", priority: "media", status: "aguardando_backoffice", responsavel: "Camila Duarte", nextAction: "Checar custódia", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-21T23:00:00-03:00", resolvedAt: null, motivoPrincipal: "Dependência externa", timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Emissão de cartão adicional para dependente." }] },
    { id: "OPS35", clientId: "C01", protocol: "OP-29335", type: "cartao_adicional", priority: "critica", status: "novo", responsavel: "Diego Antunes", nextAction: "Gerar relatório", openedAt: "2026-07-19T20:00:00-03:00", dueAt: "2026-07-22T09:00:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T20:00:00-03:00", detail: "Operação registrada. Emissão de cartão adicional para dependente." }] },
    { id: "OPS36", clientId: "C15", protocol: "OP-29336", type: "resgate_investimento", priority: "alta", status: "concluida_parcial", responsavel: "Marina Ferraz", nextAction: null, openedAt: "2026-07-19T04:00:00-03:00", dueAt: "2026-07-21T16:00:00-03:00", resolvedAt: "2026-07-19T11:00:00-03:00", motivoPrincipal: "Documento incompleto", timeline: [{ date: "2026-07-19T04:00:00-03:00", detail: "Operação registrada. Resgate de posição para uso do cliente." }, { date: "2026-07-19T11:00:00-03:00", detail: "Operação concluída parcialmente — pendência residual registrada (ação simulada)." }] },
    { id: "OPS37", clientId: "C17", protocol: "OP-29337", type: "segunda_via_informe", priority: "media", status: "aguardando_documento", responsavel: "Bruno Castilho", nextAction: "Solicitar assinatura", openedAt: "2026-07-19T18:00:00-03:00", dueAt: "2026-07-20T07:30:00-03:00", resolvedAt: null, motivoPrincipal: "Aguardando cliente", timeline: [{ date: "2026-07-19T18:00:00-03:00", detail: "Operação registrada. Emissão de segunda via de informe de rendimentos." }] },
    { id: "OPS38", clientId: "C08", protocol: "OP-29338", type: "atualizacao_suitability", priority: "baixa", status: "pendencia_interna", responsavel: "Rafael Nunes", nextAction: "Backoffice deve revisar", openedAt: "2026-07-20T02:00:00-03:00", dueAt: "2026-07-20T09:42:00-03:00", resolvedAt: null, motivoPrincipal: "Aprovação interna", timeline: [{ date: "2026-07-20T02:00:00-03:00", detail: "Operação registrada. Reaplicação do questionário de suitability." }] },
    { id: "OPS39", clientId: "C12", protocol: "OP-29339", type: "alteracao_cadastral", priority: "alta", status: "concluida", responsavel: "Camila Duarte", nextAction: null, openedAt: "2026-07-16T07:00:00-03:00", dueAt: "2026-07-18T07:00:00-03:00", resolvedAt: "2026-07-16T17:00:00-03:00", motivoPrincipal: "Dependência externa", timeline: [{ date: "2026-07-16T07:00:00-03:00", detail: "Operação registrada. Atualização de dados cadastrais (endereço/contato)." }, { date: "2026-07-16T17:00:00-03:00", detail: "Operação concluída com sucesso (ação simulada)." }] },
    { id: "OPS40", clientId: "C06", protocol: "OP-29340", type: "bloqueio_preventivo", priority: "media", status: "em_processamento", responsavel: "Diego Antunes", nextAction: "Aguardar emissão", openedAt: "2026-07-19T14:00:00-03:00", dueAt: "2026-07-20T11:30:00-03:00", resolvedAt: null, motivoPrincipal: null, timeline: [{ date: "2026-07-19T14:00:00-03:00", detail: "Operação registrada. Bloqueio preventivo de segurança solicitado pelo cliente." }] },
  ];

  // ---------------------------------------------------------------------
  // Chamados de suporte (US-15) — abertos a partir do cliente, de uma
  // ordem, de onboarding ou de um serviço operacional.
  // ---------------------------------------------------------------------
  const tickets = [
    { id: 'T01', clientId: 'C04', contextType: 'order', contextId: 'ORD03', theme: 'Erro em ordem', impact: 'alta', urgency: 'alta', status: 'resolvido', protocol: 'CH-9001', createdBy: 'Marina Ferraz', createdAt: '2026-07-18T09:10:00-03:00', dueAt: '2026-07-19T09:10:00-03:00', resolvedAt: '2026-07-18T15:00:00-03:00', rating: 5,
      messages: [
        { author: 'Marina Ferraz', date: '2026-07-18T09:10:00-03:00', text: 'Ordem ORD03 retornou erro de saldo insuficiente — cliente confirma que tinha saldo. Preciso de apoio para entender a causa antes de reenviar.' },
        { author: 'Suporte Inter (simulado)', date: '2026-07-18T11:00:00-03:00', text: 'Identificamos atraso na liquidação de um resgate anterior. Saldo já está disponível, pode reenviar a ordem.' },
        { author: 'Marina Ferraz', date: '2026-07-18T15:00:00-03:00', text: 'Reenviado com sucesso, obrigada!' },
      ] },
    { id: 'T02', clientId: 'C11', contextType: 'order', contextId: 'ORD04', theme: 'Erro em ordem', impact: 'media', urgency: 'alta', status: 'em_andamento', protocol: 'CH-9002', createdBy: 'Camila Duarte', createdAt: '2026-07-19T10:30:00-03:00', dueAt: '2026-07-20T10:30:00-03:00', resolvedAt: null, rating: null,
      messages: [
        { author: 'Camila Duarte', date: '2026-07-19T10:30:00-03:00', text: 'Ordem ORD04 recusada por elegibilidade — cliente é segmento High, produto pede High/Private/Corporate. Preciso confirmar se o segmento cadastrado está correto.' },
        { author: 'Suporte Inter (simulado)', date: '2026-07-19T13:00:00-03:00', text: 'Estamos validando o cadastro de segmentação do cliente com a área responsável.' },
      ] },
    { id: 'T03', clientId: 'C03', contextType: 'onboarding', contextId: 'O01', theme: 'Documento', impact: 'baixa', urgency: 'media', status: 'aberto', protocol: 'CH-9003', createdBy: 'Marina Ferraz', createdAt: '2026-07-19T14:30:00-03:00', dueAt: '2026-07-21T14:30:00-03:00', resolvedAt: null, rating: null,
      messages: [
        { author: 'Marina Ferraz', date: '2026-07-19T14:30:00-03:00', text: 'Comprovante de residência foi recusado por qualidade de imagem. Cliente já reenviou, preciso de apoio para revalidar.' },
      ] },
    { id: 'T04', clientId: 'C02', contextType: 'client', contextId: null, theme: 'Dúvida cadastral', impact: 'baixa', urgency: 'baixa', status: 'resolvido', protocol: 'CH-9004', createdBy: 'Marina Ferraz', createdAt: '2026-07-10T09:00:00-03:00', dueAt: '2026-07-12T09:00:00-03:00', resolvedAt: '2026-07-10T16:00:00-03:00', rating: 4,
      messages: [
        { author: 'Marina Ferraz', date: '2026-07-10T09:00:00-03:00', text: 'Cliente quer atualizar telefone de contato cadastrado.' },
        { author: 'Suporte Inter (simulado)', date: '2026-07-10T16:00:00-03:00', text: 'Atualização realizada, confirmação enviada ao cliente.' },
      ] },
    { id: 'T05', clientId: 'C09', contextType: 'client', contextId: null, theme: 'Acesso/credenciais', impact: 'media', urgency: 'media', status: 'aberto', protocol: 'CH-9005', createdBy: 'Camila Duarte', createdAt: '2026-07-20T08:40:00-03:00', dueAt: '2026-07-21T08:40:00-03:00', resolvedAt: null, rating: null,
      messages: [
        { author: 'Camila Duarte', date: '2026-07-20T08:40:00-03:00', text: 'Cliente relata não receber o código de autenticação por SMS.' },
      ] },
    { id: 'T06', clientId: 'C12', contextType: 'service', contextId: 'SR08', theme: 'Outro', impact: 'baixa', urgency: 'baixa', status: 'em_andamento', protocol: 'CH-9006', createdBy: 'Eduardo Prado', createdAt: '2026-07-20T09:20:00-03:00', dueAt: '2026-07-22T09:20:00-03:00', resolvedAt: null, rating: null,
      messages: [
        { author: 'Eduardo Prado', date: '2026-07-20T09:20:00-03:00', text: 'Preciso confirmar quais documentos societários são exigidos para validar o novo representante antes de emitir o cartão adicional.' },
      ] },
  ];

  // ---------------------------------------------------------------------
  // Vínculos societários (US-16) — representantes de clientes PJ/holding
  // já existentes na base (C06, C12), com papel/poderes de assinatura.
  // ---------------------------------------------------------------------
  const holdingRelations = [
    { id: 'HR01', pjClientId: 'C06', personName: 'Bento Carvalhaes', document: '111.222.333-44', title: 'Sócio-administrador', role: 'assinatura_individual' },
    { id: 'HR02', pjClientId: 'C06', personName: 'Marina Falcão', document: '222.333.444-55', title: 'Diretora financeira', role: 'assinatura_conjunta' },
    { id: 'HR03', pjClientId: 'C12', personName: 'Tarso Bittar', document: '333.444.555-66', title: 'Sócio-fundador', role: 'assinatura_individual' },
    { id: 'HR04', pjClientId: 'C12', personName: 'Heloísa Bittar', document: '444.555.666-77', title: 'Sócia minoritária', role: 'consulta' },
    { id: 'HR05', pjClientId: 'C16', personName: 'Mariana Costa', document: '321.654.987-00', title: 'Sócia-administradora', role: 'assinatura_individual' },
    { id: 'HR06', pjClientId: 'C16', personName: 'Ricardo Costa', document: '987.321.654-00', title: 'Sócio', role: 'assinatura_conjunta' },
  ];

  // ---------------------------------------------------------------------
  // Normalização: campos novos da jornada 360 (workspace do cliente).
  // Aplica defaults sintéticos aos clientes/posições/movimentações antigos,
  // sem precisar reescrever cada objeto acima.
  // ---------------------------------------------------------------------
  const RENT_BY_PROFILE = { Conservador: 6.1, Moderado: 8.2, Agressivo: 11.4, Sofisticado: 9.3 };
  const ACC_RETURN_BY_CLASS = { 'Pós-fixado': 0.09, Prefixado: 0.11, Inflação: 0.12, Fundos: 0.1, Multimercado: 0.13, FIIs: 0.08, Ações: 0.14, Global: 0.15, Previdência: 0.09, Caixa: 0 };
  const INVESTABLE_BY_CATEGORY = {
    transferencia: 'investivel', vencimento: 'investivel', resgate: 'investivel', rendimento: 'investivel',
    dividendo: 'investivel', salario: 'investivel', deposito: 'banking', cashback: 'banking', nao_classificado: 'nao_classificado',
  };

  clients.forEach((c, i) => {
    if (c.rentability12m == null) c.rentability12m = Math.round((RENT_BY_PROFILE[c.riskProfile] || 8) * 10 + ((i % 5) - 2)) / 10;
    if (c.investedWealth == null) c.investedWealth = Math.max(0, c.totalWealth - c.availableBalance);
    if (c.dateOfBirth === undefined) c.dateOfBirth = c.type === 'PF' ? `19${70 + (i % 25)}-0${1 + (i % 9)}-1${i % 9}` : null;
    if (!c.linkDate) c.linkDate = '2025-01-10';
    if (c.pfPjLinkId === undefined) c.pfPjLinkId = null;
    if (!c.security) c.security = { accessActive: c.status !== 'bloqueado', tokenActive: c.status === 'ativo', lastLoginAt: c.updatedAt };
  });

  portfolioPositions.forEach((p) => {
    if (p.appliedValue == null) {
      const acc = ACC_RETURN_BY_CLASS[p.class] != null ? ACC_RETURN_BY_CLASS[p.class] : 0.08;
      p.appliedValue = Math.round(p.currentValue / (1 + acc));
    }
  });

  cashEvents.forEach((e) => {
    if (!e.investable) e.investable = INVESTABLE_BY_CATEGORY[e.category] || 'nao_classificado';
  });

  // ---------------------------------------------------------------------
  // Documentos do cliente (Fase 2 do workspace) — catálogo + trilha de acesso.
  // Explícito para a vitrine (C15); os demais usam um conjunto genérico gerado
  // pela própria aba Documentos.
  // ---------------------------------------------------------------------
  const clientDocuments = [
    { id: 'DOC01', clientId: 'C15', name: 'Informe de rendimentos 2025', category: 'informe', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2026-02-28' },
    { id: 'DOC02', clientId: 'C15', name: 'Informe Previdência 2025', category: 'previdencia', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2026-02-28' },
    { id: 'DOC03', clientId: 'C15', name: 'Relatório consolidado — Julho 2026', category: 'relatorio', year: 2026, format: 'PDF', status: 'enviado', generatedAt: '2026-08-04' },
    { id: 'DOC04', clientId: 'C15', name: 'Extrato de investimentos — Junho 2026', category: 'investimentos', year: 2026, format: 'PDF', status: 'disponivel', generatedAt: '2026-07-02' },
    { id: 'DOC05', clientId: 'C15', name: 'Termo de abertura de conta', category: 'cadastral', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2025-03-14' },
    { id: 'DOC06', clientId: 'C15', name: 'Comprovante de residência', category: 'comprovante', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2025-03-12' },
    { id: 'DOC07', clientId: 'C16', name: 'Informe de rendimentos PJ 2025', category: 'informe', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2026-02-28' },
    { id: 'DOC08', clientId: 'C16', name: 'Contrato social consolidado', category: 'cadastral', year: 2025, format: 'PDF', status: 'disponivel', generatedAt: '2025-06-10' },
  ];

  const documentAccessLog = [
    { id: 'DA01', clientId: 'C15', document: 'Informe de rendimentos 2025', who: 'Marina Ferraz', action: 'Baixou', date: '2026-03-05T10:20:00-03:00' },
    { id: 'DA02', clientId: 'C15', document: 'Relatório consolidado — Julho 2026', who: 'Marina Ferraz', action: 'Enviou ao cliente', date: '2026-08-04T09:10:00-03:00' },
    { id: 'DA03', clientId: 'C15', document: 'Extrato de investimentos — Junho 2026', who: 'Camila Duarte', action: 'Visualizou', date: '2026-07-10T14:40:00-03:00' },
  ];

  // ---------------------------------------------------------------------
  // Perfil de banking (Fase 2) — conta + cartão. Explícito p/ vitrine.
  // ---------------------------------------------------------------------
  const bankingProfiles = [
    { clientId: 'C15', account: { status: 'Ativa', balance: 15000, pixLimit: 20000, tedLimit: 50000 }, card: { name: 'Inter Black', status: 'Ativo', limit: 50000, used: 12300, closingDay: '18/08', invoice: 8450 } },
    { clientId: 'C16', account: { status: 'Ativa', balance: 90000, pixLimit: 100000, tedLimit: 500000 }, card: { name: 'Inter Empresas', status: 'Ativo', limit: 120000, used: 34200, closingDay: '20/08', invoice: 21800 } },
  ];

  // ---------------------------------------------------------------------
  // Planejamento financeiro (US-Planejamento) — plano seed apenas da cliente
  // vitrine Mariana Costa (C15), em construção. Demais clientes: sem plano
  // (estado vazio). Números fictícios coerentes com o mockup.
  // ---------------------------------------------------------------------
  const financialPlans = [
    {
      id: 'PL01',
      clientId: 'C15',
      name: 'Planejamento Mariana 2026 — Versão Base',
      type: 'aposentadoria',
      status: 'em_construcao',
      horizonYears: 15,
      notes: 'Pretende otimizar a carga tributária na fase de desacumulação e estruturar plano para os filhos.',
      context: {
        age: 41,
        maritalStatus: 'Casada',
        profession: 'Empresária',
        lifePhase: 'Acumulação',
        dependents: [
          { name: 'Lucas Costa', relation: 'Filho', age: 14, dependency: 'Total' },
          { name: 'Beatriz Costa', relation: 'Filha', age: 11, dependency: 'Total' },
        ],
        notes: 'Cliente pretende reduzir o ritmo de trabalho aos 60 anos e manter apoio financeiro aos filhos até o fim da faculdade.',
      },
      objectives: {
        primary: 'Aposentadoria',
        targetAge: 60,
        desiredIncome: 20000,
        lifeExpectancy: 95,
        strategy: 'preservar',
        selected: ['aposentadoria', 'educacao'],
      },
      cashflow: {
        incomes: [
          { desc: 'Pró-labore', value: 32000, start: 'Atual', end: '60 anos', recurrence: 'Mensal' },
          { desc: 'Aluguel', value: 4500, start: 'Atual', end: 'Indeterminado', recurrence: 'Mensal' },
        ],
        expenses: [
          { desc: 'Custo de vida', value: 14000, start: 'Atual', end: '—', recurrence: 'Mensal' },
          { desc: 'Escola', value: 3500, start: 'Atual', end: '2035', recurrence: 'Mensal' },
          { desc: 'Financiamento', value: 4200, start: 'Atual', end: 'Fev/2027', recurrence: 'Mensal' },
        ],
      },
      wealth: {
        financialInter: 620000,
        financialExternal: 880000,
        otherAssets: [
          { type: 'Imóvel', desc: 'Apartamento residencial', value: 1200000 },
          { type: 'Participação societária', desc: 'Empresa familiar', value: 800000 },
          { type: 'Veículo', desc: 'SUV', value: 180000 },
        ],
        investments: [
          { inst: 'Inter', category: 'CDB / Fundos', value: 620000, liquidity: 'D+1', notes: '—' },
          { inst: 'XP', category: 'Fundos / Ações', value: 400000, liquidity: 'D+30', notes: '—' },
          { inst: 'Itaú', category: 'Previdência', value: 200000, liquidity: 'D+5', notes: 'PGBL' },
          { inst: 'BTG', category: 'Renda fixa', value: 280000, liquidity: 'No vencimento', notes: '—' },
        ],
      },
      assumptions: {
        inflation: 4.5, nominalReturn: 9.5, realReturn: 4.8, cdi: 11.2, expenseGrowth: 4.5, incomeGrowth: 5.0,
        validated: { taxa: true, inflacao: true, despesas: true, risco: true },
      },
      scenarios: [
        { id: 'SC0', name: 'Cenário atual', retireAge: 60, monthlyContribution: 8000, realReturn: 4.8, desiredIncome: 20000, projectedWealth: 3580000, goalPct: 82, status: 'gap' },
        { id: 'SCA', name: 'Cenário A', retireAge: 63, monthlyContribution: 8000, realReturn: 4.8, desiredIncome: 20000, projectedWealth: 4340000, goalPct: 101, status: 'atinge' },
        { id: 'SCB', name: 'Cenário B', retireAge: 60, monthlyContribution: 8500, realReturn: 4.8, desiredIncome: 20000, projectedWealth: 4300000, goalPct: 100, status: 'atinge' },
      ],
      selectedScenarioId: 'SC0',
      result: { currentWealth: 1500000, requiredWealth: 4300000, requiredContribution: 8450, targetIncome: 20000, gap: 720000, successProbability: 78 },
      activity: [
        { date: '2026-07-20T16:00:00-03:00', label: 'Cenário B salvo' },
        { date: '2026-07-18T11:30:00-03:00', label: 'Premissas atualizadas' },
        { date: '2026-07-16T09:15:00-03:00', label: 'Objetivo validado com o cliente' },
        { date: '2026-07-15T10:00:00-03:00', label: 'Planejamento criado (rascunho)' },
      ],
      createdAt: '2026-07-15T10:00:00-03:00',
      updatedAt: '2026-07-20T16:00:00-03:00',
      reportGeneratedAt: null,
    },
  ];

  // ---------------------------------------------------------------------
  // Recomendações enviadas (EP-02, Tela 08) — uma recomendação agrupa os ativos
  // de uma carteira proposta e é acompanhada na Central de Ordens.
  // ---------------------------------------------------------------------
  const recommendations = [
    {
      id: 'REC-10448', clientId: 'C02', consultor: 'Marina Ferraz', createdAt: '2026-08-11T10:20:00-03:00',
      value: 210000, status: 'aprovada', pendencias: 0,
      items: [
        { productId: 'PR05', asset: 'Tesouro IPCA+ 2035', class: 'Inflação', value: 120000, rate: 'IPCA + 6,1%', status: 'validado' },
        { productId: 'PR03', asset: 'CDB Banco Inter Prefixado 12,5% a.a.', class: 'Prefixado', value: 90000, rate: '12,5% a.a.', status: 'validado' },
      ],
    },
    {
      id: 'REC-10450', clientId: 'C08', consultor: 'Diego Nunes', createdAt: '2026-08-12T09:05:00-03:00',
      value: 380000, status: 'em_processamento', pendencias: 0,
      items: [
        { productId: 'PR07', asset: 'FIC FIRF Crédito Corporate', class: 'Fundos', value: 280000, rate: '—', status: 'validado' },
        { productId: 'PR16', asset: 'ETF S&P 500 (via Global Account)', class: 'Global', value: 100000, rate: '—', status: 'validado' },
      ],
    },
    {
      id: 'REC-10451', clientId: 'C06', consultor: 'Bruno Castilho', createdAt: '2026-08-10T15:40:00-03:00',
      value: 700000, status: 'executada', pendencias: 0,
      items: [
        { productId: 'PR07', asset: 'FIC FIRF Crédito Corporate', class: 'Fundos', value: 500000, rate: '—', status: 'executado' },
        { productId: 'PR05', asset: 'Tesouro IPCA+ 2035', class: 'Inflação', value: 200000, rate: 'IPCA + 6,2%', status: 'executado' },
      ],
    },
  ];

  window.PORTAL_DATA = { now: NOW, profiles, clients, portfolioPositions, cashEvents, alerts, onboarding, orders, products, simulations, serviceRequests, operations, tickets, holdingRelations, clientDocuments, documentAccessLog, bankingProfiles, financialPlans, recommendations };
})();

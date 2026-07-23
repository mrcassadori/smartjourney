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
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'recommendations', 'operations', 'support'], canRetryOrders: true, canApprove: false, canViewConsolidated: false, canCreateBasket: false, canOperateDirectly: false },
    },
    {
      id: 'alocador',
      name: 'Rafael Nunes',
      role: 'Alocador',
      escritorio: 'Åpen Capital',
      scopeType: 'office',
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'recommendations', 'operations', 'support'], canRetryOrders: true, canApprove: true, canViewConsolidated: false, canCreateBasket: true, canOperateDirectly: false },
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
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'recommendations', 'operations', 'support'], canRetryOrders: false, canApprove: true, canViewConsolidated: true, canCreateBasket: false, canOperateDirectly: false },
    },
    {
      id: 'admin',
      name: 'Bianca Rocha',
      role: 'Administrador',
      escritorio: 'Inter — Consultorias',
      scopeType: 'all',
      permissions: { menu: ['home', 'clients', 'orders', 'onboarding', 'alerts', 'products', 'recommendations', 'operations', 'support'], canRetryOrders: true, canApprove: true, canViewConsolidated: true, canCreateBasket: true, canOperateDirectly: true },
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
    { id: 'ORD03', clientId: 'C04', asset: 'LCI Prefixada 11,8% a.a.', type: 'aplicacao', value: 200000, author: 'Marina Ferraz', sentAt: '2026-07-18T09:00:00-03:00', status: 'erro', errorReason: 'Saldo insuficiente na conta no momento do processamento.', errorAction: 'Confirmar saldo disponível e reenviar a ordem.', retriable: true,
      timeline: [{ date: '2026-07-18T09:00:00-03:00', status: 'enviada', detail: 'Ordem enviada por Marina Ferraz.' }, { date: '2026-07-18T09:05:00-03:00', status: 'aprovada', detail: 'Aprovada pelo alocador.' }, { date: '2026-07-18T09:07:00-03:00', status: 'erro', detail: 'Falha no processamento: saldo insuficiente.' }] },
    { id: 'ORD04', clientId: 'C11', asset: 'FIC FIM Retorno Absoluto', type: 'aplicacao', value: 80000, author: 'Camila Duarte', sentAt: '2026-07-19T10:20:00-03:00', status: 'erro', errorReason: 'Cliente não elegível para este produto no momento.', errorAction: 'Revisar elegibilidade ou escolher outro produto antes de reenviar.', retriable: true,
      timeline: [{ date: '2026-07-19T10:20:00-03:00', status: 'enviada', detail: 'Ordem enviada por Camila Duarte.' }, { date: '2026-07-19T10:25:00-03:00', status: 'erro', detail: 'Falha de elegibilidade.' }] },
    { id: 'ORD05', clientId: 'C01', asset: 'ETF S&P 500 (via Global Account)', type: 'aplicacao', value: 150000, author: 'Marina Ferraz', sentAt: '2026-07-15T11:00:00-03:00', status: 'executada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-15T11:00:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-15T11:05:00-03:00', status: 'aprovada', detail: 'Aprovada pelo alocador.' }, { date: '2026-07-15T14:30:00-03:00', status: 'em_processamento', detail: 'Em processamento na custódia.' }, { date: '2026-07-16T09:00:00-03:00', status: 'executada', detail: 'Ordem executada com sucesso.' }] },
    { id: 'ORD06', clientId: 'C08', asset: 'Tesouro Prefixado 2029', type: 'aplicacao', value: 400000, author: 'Rafael Nunes', sentAt: '2026-07-14T09:30:00-03:00', status: 'parcialmente_executada', errorReason: null, errorAction: null, retriable: false,
      timeline: [{ date: '2026-07-14T09:30:00-03:00', status: 'enviada', detail: 'Ordem enviada.' }, { date: '2026-07-14T10:00:00-03:00', status: 'aprovada', detail: 'Aprovada.' }, { date: '2026-07-14T15:00:00-03:00', status: 'parcialmente_executada', detail: 'Executados R$ 320 mil de R$ 400 mil por limite de lote no leilão.' }] },
    { id: 'ORD07', clientId: 'C12', asset: 'FIC FIRF Crédito Corporate', type: 'aplicacao', value: 500000, author: 'Camila Duarte', sentAt: '2026-07-17T13:00:00-03:00', status: 'recusada', errorReason: 'Aprovador identificou concentração acima do limite do escritório.', errorAction: 'Revisar valor da ordem ou diversificar entre produtos.', retriable: true,
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
  ];

  // ---------------------------------------------------------------------
  // Simulações / propostas (US-11, US-12) — alguns exemplos pré-existentes
  // para a lista de propostas não nascer vazia.
  // ---------------------------------------------------------------------
  const simulations = [
    {
      id: 'SIM01',
      clientId: 'C02',
      name: 'Rolagem CDB + diversificação em multimercado',
      status: 'em_revisao',
      createdBy: 'Marina Ferraz',
      createdAt: '2026-07-19T10:00:00-03:00',
      updatedAt: '2026-07-19T16:30:00-03:00',
      items: [
        { productId: 'PR01', allocatedValue: 300000 },
        { productId: 'PR09', allocatedValue: 100000 },
      ],
      reportGeneratedAt: '2026-07-19T16:30:00-03:00',
    },
    {
      id: 'SIM02',
      clientId: 'C01',
      name: 'Diversificação do caixa investível em dólar',
      status: 'rascunho',
      createdBy: 'Marina Ferraz',
      createdAt: '2026-07-20T09:30:00-03:00',
      updatedAt: '2026-07-20T09:30:00-03:00',
      items: [{ productId: 'PR16', allocatedValue: 150000 }],
      reportGeneratedAt: null,
    },
    {
      id: 'SIM03',
      clientId: 'C09',
      name: 'Realocação de resgate para crédito privado',
      status: 'enviada',
      createdBy: 'Eduardo Prado',
      createdAt: '2026-07-14T11:00:00-03:00',
      updatedAt: '2026-07-15T09:00:00-03:00',
      items: [{ productId: 'PR07', allocatedValue: 500000 }],
      reportGeneratedAt: '2026-07-15T09:00:00-03:00',
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
  ];

  window.PORTAL_DATA = { now: NOW, profiles, clients, portfolioPositions, cashEvents, alerts, onboarding, orders, products, simulations, serviceRequests, tickets, holdingRelations };
})();

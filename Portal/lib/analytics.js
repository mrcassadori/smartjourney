// Portal do Consultor — motor de análise da simulação (US-11/US-12).
// Tudo determinístico e mockado: nenhuma chamada de rede, nenhum dado real.
// Fase 1 expõe premissas por classe + métricas agregadas da carteira
// (retorno esperado, volatilidade, risco, liquidez, diversificação,
// concentração). Séries históricas/drawdown/correlação/scatter entram na Fase 2.

(function () {
  // Premissas anuais por classe de ativo (nominais, apenas para simulação).
  // vol = volatilidade anual; risk = nível de risco 1..5 (mesma escala de PRODUCT_RISK_LABELS).
  const ASSET_CLASS_ASSUMPTIONS = {
    'Pós-fixado': { expReturn: 0.108, vol: 0.008, risk: 1 },
    Prefixado: { expReturn: 0.122, vol: 0.05, risk: 2 },
    Inflação: { expReturn: 0.13, vol: 0.07, risk: 2 },
    Fundos: { expReturn: 0.125, vol: 0.045, risk: 2 },
    Multimercado: { expReturn: 0.14, vol: 0.09, risk: 3 },
    FIIs: { expReturn: 0.135, vol: 0.14, risk: 3 },
    Ações: { expReturn: 0.16, vol: 0.22, risk: 4 },
    Global: { expReturn: 0.15, vol: 0.18, risk: 4 },
    Previdência: { expReturn: 0.115, vol: 0.03, risk: 2 },
    Caixa: { expReturn: 0.1, vol: 0.002, risk: 1 },
  };

  const CDI_ANNUAL = 0.112; // referência de CDI usada nas comparações

  // Converte uma string de liquidez ("D+1", "Imediata", "Diária", "D+90"…)
  // no número aproximado de dias corridos até o caixa.
  function liquidityDays(str) {
    if (!str) return 30;
    const s = String(str).toLowerCase();
    if (s.indexOf('imediat') !== -1 || s.indexOf('diár') !== -1 || s.indexOf('diar') !== -1) return 0;
    const m = s.match(/d\s*\+\s*(\d+)/);
    if (m) return Number(m[1]);
    return 30;
  }

  const LIQUIDITY_BUCKETS = [
    { key: 'd0_1', label: 'D+0 ou D+1', max: 1 },
    { key: 'd2_5', label: 'D+2 a D+5', max: 5 },
    { key: 'd6_30', label: 'D+6 a D+30', max: 30 },
    { key: 'gt30', label: 'Acima de 30 dias', max: 180 },
    { key: 'vencimento', label: 'Até o vencimento', max: Infinity },
  ];

  function bucketForDays(days) {
    for (let i = 0; i < LIQUIDITY_BUCKETS.length; i++) {
      if (days <= LIQUIDITY_BUCKETS[i].max) return LIQUIDITY_BUCKETS[i].key;
    }
    return 'vencimento';
  }

  // Recebe entradas normalizadas [{ class, value }] e devolve
  // { total, byClass: [{ class, value, pct }] } na ordem de ASSET_CLASS_ORDER.
  function allocationByClass(entries) {
    const order = window.PortalLib.ASSET_CLASS_ORDER;
    const total = entries.reduce((s, e) => s + (e.value || 0), 0);
    const byClassMap = {};
    entries.forEach((e) => {
      byClassMap[e.class] = (byClassMap[e.class] || 0) + (e.value || 0);
    });
    const byClass = order
      .filter((c) => byClassMap[c])
      .map((c) => ({ class: c, value: byClassMap[c], pct: total ? (byClassMap[c] / total) * 100 : 0 }));
    return { total, byClass };
  }

  // Métricas agregadas. `entries` = [{ class, value, liquidity?, issuer? }].
  function portfolioMetrics(entries) {
    const total = entries.reduce((s, e) => s + (e.value || 0), 0) || 1;

    let expReturn = 0;
    let variance = 0; // aproximação: soma ponderada das variâncias (ignora correlação na Fase 1)
    let riskWeighted = 0;
    entries.forEach((e) => {
      const a = ASSET_CLASS_ASSUMPTIONS[e.class] || ASSET_CLASS_ASSUMPTIONS.Fundos;
      const w = (e.value || 0) / total;
      expReturn += w * a.expReturn;
      variance += w * a.vol * a.vol;
      riskWeighted += w * a.risk;
    });
    const volatility = Math.sqrt(variance);

    // Liquidez em baldes
    const buckets = {};
    LIQUIDITY_BUCKETS.forEach((b) => (buckets[b.key] = 0));
    entries.forEach((e) => {
      buckets[bucketForDays(liquidityDays(e.liquidity))] += (e.value || 0) / total;
    });
    const liquidityBuckets = LIQUIDITY_BUCKETS.map((b) => ({ key: b.key, label: b.label, pct: buckets[b.key] * 100 }));
    const liquidUpTo5 = (buckets.d0_1 + buckets.d2_5) * 100;
    const liquidUpTo1 = buckets.d0_1 * 100;

    // Concentração por emissor (quando houver issuer nas entradas)
    const byIssuer = {};
    let hasIssuer = false;
    entries.forEach((e) => {
      if (!e.issuer) return;
      hasIssuer = true;
      byIssuer[e.issuer] = (byIssuer[e.issuer] || 0) + (e.value || 0);
    });
    let topIssuer = null;
    if (hasIssuer) {
      const sorted = Object.keys(byIssuer)
        .map((k) => ({ issuer: k, value: byIssuer[k], pct: (byIssuer[k] / total) * 100 }))
        .sort((x, y) => y.value - x.value);
      topIssuer = sorted[0] || null;
    }

    // Concentração por classe (maior fatia) — sempre disponível
    const alloc = allocationByClass(entries);
    const topClass = alloc.byClass.slice().sort((a, b) => b.value - a.value)[0] || null;

    // Diversificação via HHI (índice Herfindahl) sobre as classes
    const hhi = alloc.byClass.reduce((s, c) => s + Math.pow(c.pct / 100, 2), 0);
    let diversification = 'Baixa';
    if (hhi < 0.25) diversification = 'Boa';
    else if (hhi < 0.4) diversification = 'Média';

    return {
      total,
      expectedReturn: expReturn,
      volatility,
      riskScore: riskWeighted, // 1..5
      liquidityBuckets,
      liquidUpTo1,
      liquidUpTo5,
      topIssuer,
      topClass,
      diversification,
      issuerCount: hasIssuer ? Object.keys(byIssuer).length : null,
      classCount: alloc.byClass.length,
    };
  }

  // Rótulo textual do nível de risco a partir do score ponderado 1..5.
  function riskLabel(score) {
    const labels = window.PortalLib.PRODUCT_RISK_LABELS;
    return labels[Math.max(1, Math.min(5, Math.round(score)))] || '—';
  }

  // Monta o contexto atual × proposta a partir das posições do cliente e dos
  // itens da simulação. Fase 1 modela a proposta como a carteira atual somada
  // às novas alocações (o valor simulado é o pool distribuído nos itens).
  function proposalContext(positions, items, productMap) {
    const currentEntries = (positions || []).map((p) => ({ class: p.class, value: p.currentValue, liquidity: p.liquidity, issuer: p.issuer }));
    const itemEntries = (items || [])
      .map((it) => {
        const p = productMap[it.productId];
        if (!p) return null;
        return { class: p.class, value: it.allocatedValue, liquidity: p.liquidity, issuer: p.issuer, product: p, allocatedValue: it.allocatedValue };
      })
      .filter(Boolean);
    const proposedEntries = currentEntries.concat(itemEntries);
    return {
      currentEntries,
      itemEntries,
      proposedEntries,
      currentAlloc: allocationByClass(currentEntries),
      proposedAlloc: allocationByClass(proposedEntries),
      currentMetrics: portfolioMetrics(currentEntries),
      proposedMetrics: portfolioMetrics(proposedEntries),
      totalAllocated: itemEntries.reduce((s, e) => s + e.value, 0),
    };
  }

  // ---------------------------------------------------------------------
  // Fase 2 — séries históricas, drawdown, correlação e risco×retorno.
  // Tudo determinístico (PRNG semeado): os mesmos inputs geram sempre os
  // mesmos gráficos. Dados sintéticos, sem qualquer relação com o mercado real.
  // ---------------------------------------------------------------------

  // PRNG mulberry32 (determinístico) a partir de uma semente inteira.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Ruído gaussiano padrão via Box-Muller usando o PRNG dado.
  function gaussian(rng) {
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Gera um índice acumulado mensal (base 100) para `months` meses a partir de
  // um retorno e volatilidade anuais, usando uma sequência de ruído compartilhada
  // (para que carteiras diferentes "andem juntas", como no mercado real).
  function buildIndex(months, annualReturn, annualVol, noise) {
    const monthlyDrift = Math.pow(1 + annualReturn, 1 / 12) - 1;
    const monthlyVol = annualVol / Math.sqrt(12);
    const series = [100];
    for (let i = 0; i < months; i++) {
      const r = monthlyDrift + monthlyVol * noise[i];
      series.push(series[series.length - 1] * (1 + r));
    }
    return series;
  }

  // Comparação histórica atual × proposta × CDI ao longo de `months` meses.
  // Retorna séries (base 100) + retornos por janela (12/24/36/60m).
  function historicalComparison(currentMetrics, proposedMetrics, seedStr, months) {
    const m = months || 60;
    const rng = mulberry32(hashString(seedStr || 'sim'));
    const noise = [];
    for (let i = 0; i < m; i++) noise.push(gaussian(rng));

    const current = buildIndex(m, currentMetrics.expectedReturn, currentMetrics.volatility, noise);
    const proposed = buildIndex(m, proposedMetrics.expectedReturn, proposedMetrics.volatility, noise);
    // CDI: quase sem volatilidade, ruído próprio suave.
    const cdiNoise = noise.map((n) => n * 0.05);
    const cdi = buildIndex(m, CDI_ANNUAL, 0.004, cdiNoise);

    function windowReturn(series, k) {
      if (series.length <= k) return series[series.length - 1] / series[0] - 1;
      return series[series.length - 1] / series[series.length - 1 - k] - 1;
    }
    const windows = [12, 24, 36, 60];
    const periodReturns = windows.map((k) => ({
      months: k,
      current: windowReturn(current, k),
      proposed: windowReturn(proposed, k),
      cdi: windowReturn(cdi, k),
    }));

    return { months: m, current, proposed, cdi, periodReturns };
  }

  // Série de drawdown (%) a partir de um índice acumulado.
  function drawdownSeries(index) {
    let peak = index[0];
    const dd = index.map((v) => {
      if (v > peak) peak = v;
      return (v / peak - 1) * 100;
    });
    const maxDrawdown = Math.min.apply(null, dd);
    // Estimativa simples de meses de recuperação: distância do vale ao retorno ao pico.
    let troughIdx = dd.indexOf(maxDrawdown);
    let recovery = null;
    const peakValAtTrough = index[troughIdx] / (1 + maxDrawdown / 100);
    for (let i = troughIdx; i < index.length; i++) {
      if (index[i] >= peakValAtTrough) {
        recovery = i - troughIdx;
        break;
      }
    }
    return { series: dd, maxDrawdown, recoveryMonths: recovery };
  }

  // Correlação heurística entre classes (0..1). Determinística, só para leitura
  // consultiva — não é estimada de dados reais.
  const CLASS_CORRELATION_GROUP = {
    'Pós-fixado': 'rf_curta',
    Caixa: 'rf_curta',
    Prefixado: 'rf_juros',
    Inflação: 'rf_juros',
    Previdência: 'rf_juros',
    Fundos: 'credito',
    Multimercado: 'multi',
    Ações: 'bolsa',
    FIIs: 'imob',
    Global: 'intl',
  };
  function classCorrelation(a, b) {
    if (a === b) return 1;
    const ga = CLASS_CORRELATION_GROUP[a];
    const gb = CLASS_CORRELATION_GROUP[b];
    if (ga === gb) return 0.85;
    const pair = [ga, gb].sort().join('|');
    const table = {
      'rf_curta|rf_juros': 0.55,
      'credito|rf_curta': 0.5,
      'credito|rf_juros': 0.45,
      'multi|rf_juros': 0.3,
      'bolsa|multi': 0.6,
      'bolsa|imob': 0.55,
      'bolsa|intl': 0.5,
      'imob|intl': 0.35,
      'credito|multi': 0.4,
    };
    if (table[pair] != null) return table[pair];
    return 0.2;
  }

  // Matriz de correlação para as classes presentes + contagem de pares com alta correlação.
  function correlationMatrix(classes) {
    const matrix = classes.map((a) => classes.map((b) => classCorrelation(a, b)));
    let highPairs = 0;
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        if (matrix[i][j] >= 0.7) highPairs++;
      }
    }
    let diversification = 'Boa';
    if (highPairs >= 3) diversification = 'Baixa';
    else if (highPairs >= 1) diversification = 'Média';
    return { classes, matrix, highPairs, diversification };
  }

  // Pontos de risco (vol % a.a.) × retorno esperado (% a.a.) para o scatter.
  function riskReturnPoints(byClass) {
    return byClass.map((c) => {
      const a = ASSET_CLASS_ASSUMPTIONS[c.class] || ASSET_CLASS_ASSUMPTIONS.Fundos;
      return { label: c.class, x: a.vol * 100, y: a.expReturn * 100, pct: c.pct };
    });
  }

  window.PortalAnalytics = {
    ASSET_CLASS_ASSUMPTIONS,
    CDI_ANNUAL,
    liquidityDays,
    LIQUIDITY_BUCKETS,
    allocationByClass,
    portfolioMetrics,
    riskLabel,
    proposalContext,
    historicalComparison,
    drawdownSeries,
    correlationMatrix,
    classCorrelation,
    riskReturnPoints,
  };
})();

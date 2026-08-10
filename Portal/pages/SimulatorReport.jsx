// Telas 13–14 — Configurar relatório e Preview/Compartilhar (US-12).
// Transformam a análise em uma proposta consultiva white-label (simulada).
// Expostos em window.SimulatorReport = { ReportConfig, SharePreview }.

const REPORT_FORMATS = [
  { key: 'executiva', label: 'Executiva', desc: 'Para apresentar ao cliente', pages: '3–4 páginas' },
  { key: 'completa', label: 'Completa', desc: 'Análise consultiva detalhada', pages: '8–10 páginas' },
  { key: 'tecnica', label: 'Técnica', desc: 'Inclui métricas avançadas', pages: '12+ páginas' },
];

const REPORT_SECTIONS = [
  { key: 'resumo', label: 'Resumo da recomendação' },
  { key: 'atualProposta', label: 'Atual × Proposta' },
  { key: 'alocacao', label: 'Alocação' },
  { key: 'produtos', label: 'Produtos recomendados' },
  { key: 'performance', label: 'Performance' },
  { key: 'liquidez', label: 'Liquidez' },
  { key: 'risco', label: 'Risco' },
  { key: 'riscoRetorno', label: 'Risco × Retorno' },
  { key: 'drawdown', label: 'Drawdown' },
  { key: 'correlacao', label: 'Correlação' },
];

// Presets de seções por formato.
const FORMAT_PRESETS = {
  executiva: { resumo: true, atualProposta: true, alocacao: true, produtos: true, performance: true, liquidez: true, risco: true, riscoRetorno: false, drawdown: false, correlacao: false },
  completa: { resumo: true, atualProposta: true, alocacao: true, produtos: true, performance: true, liquidez: true, risco: true, riscoRetorno: true, drawdown: false, correlacao: false },
  tecnica: { resumo: true, atualProposta: true, alocacao: true, produtos: true, performance: true, liquidez: true, risco: true, riscoRetorno: true, drawdown: true, correlacao: true },
};

function defaultReportConfig() {
  return { format: 'executiva', sections: Object.assign({}, FORMAT_PRESETS.executiva), useBranding: false, message: '' };
}
function getConfig(simulation) {
  const c = simulation.reportConfig;
  if (!c) return defaultReportConfig();
  return { format: c.format || 'executiva', sections: Object.assign({}, FORMAT_PRESETS.executiva, c.sections || {}), useBranding: !!c.useBranding, message: c.message || '' };
}

// ---------- Tela 13 — Configurar relatório ----------
function ReportConfig({ simulation, client, profile, onPatch, onContinue, onBack }) {
  const cfg = getConfig(simulation);

  function setFormat(fmt) {
    onPatch({ reportConfig: Object.assign({}, cfg, { format: fmt, sections: Object.assign({}, FORMAT_PRESETS[fmt]) }) });
  }
  function toggleSection(key) {
    const sections = Object.assign({}, cfg.sections, { [key]: !cfg.sections[key] });
    onPatch({ reportConfig: Object.assign({}, cfg, { sections }) });
  }
  function patchCfg(patch) {
    onPatch({ reportConfig: Object.assign({}, cfg, patch) });
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Gerar proposta</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Transforme a análise em um relatório consultivo para o cliente.</p>
      </div>

      {/* Formatos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REPORT_FORMATS.map((f) => {
          const active = cfg.format === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFormat(f.key)}
              className={window.PortalLib.classNames('text-left rounded-large border p-4', active ? 'border-brand bg-brand-lightest' : 'border-neutral-200 hover:border-neutral-300 bg-white')}
            >
              <div className="flex items-center justify-between">
                <span className={window.PortalLib.classNames('text-sm font-semibold', active ? 'text-brand-dark' : 'text-neutral-900')}>{f.label}</span>
                {active && <span className="text-brand"><Icon name="check" size={16} /></span>}
              </div>
              <div className="text-xs text-neutral-500 mt-1">{f.desc}</div>
              <div className="text-[11px] text-neutral-400 mt-2">{f.pages}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conteúdo */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Conteúdo do relatório</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {REPORT_SECTIONS.map((s) => (
              <label key={s.key} className="flex items-center gap-2 text-sm text-neutral-700 py-1 cursor-pointer">
                <input type="checkbox" checked={!!cfg.sections[s.key]} onChange={() => toggleSection(s.key)} />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        {/* Identidade */}
        <div className="bg-white border border-neutral-100 rounded-large p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Identidade</h2>
          <label className="flex items-center gap-2 text-sm text-neutral-700 mb-3 cursor-pointer">
            <input type="checkbox" checked={cfg.useBranding} onChange={(e) => patchCfg({ useBranding: e.target.checked })} />
            Utilizar identidade do escritório ({client.escritorio})
          </label>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-large bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
              <Icon name="briefcase" size={18} />
            </div>
            <div className="text-sm">
              <div className="font-medium text-neutral-900">{cfg.useBranding ? client.escritorio : 'Inter — Portal do Consultor'}</div>
              <div className="text-xs text-neutral-500">{profile.name} · Consultor de investimentos</div>
              <div className="text-[11px] text-neutral-400">{client.escritorio.toLowerCase().replace(/\s+/g, '')}@exemplo.com · (11) 90000-0000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      <div className="bg-white border border-neutral-100 rounded-large p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-2">Mensagem ao cliente <span className="text-neutral-400 font-normal">(opcional)</span></h2>
        <textarea
          value={cfg.message}
          onChange={(e) => patchCfg({ message: e.target.value })}
          rows={2}
          placeholder="Ex.: segue a proposta que conversamos, com foco em liquidez e proteção contra inflação."
          className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2 resize-none"
        />
      </div>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-neutral-100 flex items-center justify-between gap-3">
        <button onClick={onBack} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 flex items-center gap-1.5 hover:bg-neutral-50">
          <Icon name="arrowLeft" size={14} /> Voltar
        </button>
        <button onClick={onContinue} className="text-sm px-5 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center gap-1.5">
          Visualizar proposta <Icon name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------- Tela 14 — Preview e compartilhamento ----------
function ReportPreview({ simulation, client, profile, ctx }) {
  const { formatCurrency, formatDate } = window.PortalLib;
  const { AllocationDonut } = window.SimulatorChrome;
  const cfg = getConfig(simulation);
  const brand = cfg.useBranding ? client.escritorio : 'Inter · Portal do Consultor';
  const sec = cfg.sections;

  return (
    <div className="bg-neutral-100 rounded-large p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Capa */}
      <div className="bg-white rounded-large shadow-sm overflow-hidden">
        <div className="bg-brand text-white px-6 py-8">
          <div className="text-xs opacity-80">{brand}</div>
          <div className="text-xl font-semibold mt-2">Proposta de investimentos</div>
          <div className="text-sm opacity-90 mt-1">{client.name} · {client.riskProfile}</div>
        </div>
        <div className="px-6 py-4 text-xs text-neutral-500 flex flex-wrap gap-x-6 gap-y-1">
          <span>Responsável: {profile.name}</span>
          <span>Valor simulado: {formatCurrency(simulation.simulationValue)}</span>
          <span>Versão: V{simulation.version || 1}</span>
        </div>
      </div>

      {sec.resumo && (
        <div className="bg-white rounded-large shadow-sm px-6 py-5">
          <div className="text-[11px] font-semibold text-brand-dark uppercase tracking-wide mb-2">Resumo da recomendação</div>
          <p className="text-sm text-neutral-700">{simulation.rationale || 'Proposta construída a partir dos objetivos definidos com o cliente, equilibrando risco, liquidez e diversificação.'}</p>
          {cfg.message && <p className="text-sm text-neutral-500 italic mt-3">“{cfg.message}”</p>}
        </div>
      )}

      {sec.atualProposta && (
        <div className="bg-white rounded-large shadow-sm px-6 py-5">
          <div className="text-[11px] font-semibold text-brand-dark uppercase tracking-wide mb-3">Atual × Proposta</div>
          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-neutral-400 mb-2">Atual</div><AllocationDonut byClass={ctx.currentAlloc.byClass} size={110} stack /></div>
            <div><div className="text-xs text-neutral-400 mb-2">Proposta</div><AllocationDonut byClass={ctx.proposedAlloc.byClass} size={110} stack /></div>
          </div>
        </div>
      )}

      {sec.produtos && (
        <div className="bg-white rounded-large shadow-sm px-6 py-5">
          <div className="text-[11px] font-semibold text-brand-dark uppercase tracking-wide mb-2">Produtos recomendados</div>
          <ul className="text-sm text-neutral-700 space-y-1">
            {ctx.itemEntries.map((e) => (
              <li key={e.product.id} className="flex justify-between"><span>{e.product.name}</span><span className="tabular-nums text-neutral-900">{formatCurrency(e.allocatedValue)}</span></li>
            ))}
            {ctx.itemEntries.length === 0 && <li className="text-neutral-400">Nenhum produto na proposta.</li>}
          </ul>
        </div>
      )}

      {(sec.liquidez || sec.risco) && (
        <div className="bg-white rounded-large shadow-sm px-6 py-5">
          <div className="text-[11px] font-semibold text-brand-dark uppercase tracking-wide mb-2">Risco e liquidez</div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {sec.liquidez && <div><span className="text-neutral-400 text-xs block">Liquidez até D+1</span>{ctx.proposedMetrics.liquidUpTo1.toFixed(0)}%</div>}
            {sec.risco && <div><span className="text-neutral-400 text-xs block">Volatilidade (a.a.)</span>{(ctx.proposedMetrics.volatility * 100).toFixed(1)}%</div>}
            {sec.risco && <div><span className="text-neutral-400 text-xs block">Nível de risco</span>{window.PortalAnalytics.riskLabel(ctx.proposedMetrics.riskScore)}</div>}
          </div>
        </div>
      )}

      <div className="text-[11px] text-neutral-400 px-2">
        Documento gerado apenas para demonstração deste protótipo — não é uma recomendação real. Valores brutos, antes de custos e tributos. Rentabilidade passada não garante resultados futuros.
      </div>
    </div>
  );
}

function SharePreview({ simulation, client, profile, ctx, onBack, onRegisterShared, onExit, onNewSimulation, onOpenClient }) {
  const { formatCurrency, download } = window.PortalLib;
  const [method, setMethod] = React.useState('link');
  const [email, setEmail] = React.useState({ to: client.email || '', subject: `Proposta de investimentos — ${client.name}`, body: getConfig(simulation).message || '' });
  const [register, setRegister] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const version = `V${simulation.version || 1}`;

  const secureLink = `https://portal.inter.co/proposta/${simulation.id}`;

  function copyLink() {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(secureLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function downloadPdf() {
    const lines = [
      `Proposta de investimentos — ${client.name}`,
      `Responsável: ${profile.name}`,
      `Valor simulado: ${formatCurrency(simulation.simulationValue)}`,
      `Versão: ${version}`,
      '',
      'Produtos:',
      ...ctx.itemEntries.map((e) => `- ${e.product.name}: ${formatCurrency(e.allocatedValue)}`),
      '',
      'Documento simulado apenas para demonstração do protótipo.',
    ];
    download(`${client.id}-proposta-${simulation.id}.txt`, lines.join('\n'), 'text/plain');
  }
  function handleSend() {
    if (register) onRegisterShared(simulation.id);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <div className="w-14 h-14 rounded-full bg-success-light text-success-dark flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={26} />
        </div>
        <h1 className="text-lg font-semibold text-neutral-900">Proposta compartilhada</h1>
        <p className="text-sm text-neutral-500 mt-1">A versão {version} foi registrada no histórico do cliente {client.name}.</p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => onOpenClient(client.id)} className="text-sm px-4 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50">Voltar para o cliente</button>
          <button onClick={onNewSimulation} className="text-sm px-4 py-2 rounded-pill bg-brand text-white hover:bg-brand-dark">Criar nova simulação</button>
        </div>
      </div>
    );
  }

  const methodBtn = (key, icon, label) => (
    <button
      onClick={() => setMethod(key)}
      className={window.PortalLib.classNames('flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-pill border', method === key ? 'border-brand bg-brand-lightest text-brand-dark font-medium' : 'border-neutral-200 text-neutral-600')}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-neutral-900">Revisar e compartilhar</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Confira a prévia e escolha como enviar ao cliente.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ReportPreview simulation={simulation} client={client} profile={profile} ctx={ctx} />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-neutral-100 rounded-large p-4">
            <h2 className="text-sm font-semibold text-neutral-800 mb-3">Compartilhar proposta</h2>
            <div className="text-sm space-y-1.5 mb-4">
              <div className="flex justify-between"><span className="text-neutral-500">Cliente</span><span className="text-neutral-900 font-medium">{client.name}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Relatório</span><span className="text-neutral-900">{getConfig(simulation).format === 'executiva' ? 'Executiva' : getConfig(simulation).format === 'completa' ? 'Completa' : 'Técnica'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Versão</span><span className="text-neutral-900">{version}</span></div>
            </div>

            <div className="flex gap-2 mb-3">
              {methodBtn('link', 'externalLink', 'Link')}
              {methodBtn('email', 'file', 'E-mail')}
              {methodBtn('pdf', 'download', 'PDF')}
            </div>

            {method === 'link' && (
              <div>
                <div className="flex items-center gap-2 border border-neutral-200 rounded-pill px-3 py-2 text-xs text-neutral-600">
                  <span className="truncate flex-1">{secureLink}</span>
                </div>
                <button onClick={copyLink} className="w-full mt-2 text-sm px-4 py-2 rounded-pill border border-brand text-brand-dark hover:bg-brand-lightest flex items-center justify-center gap-1.5">
                  <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? 'Link copiado' : 'Copiar link seguro'}
                </button>
              </div>
            )}
            {method === 'email' && (
              <div className="space-y-2">
                <input value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} placeholder="Destinatário" className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2" />
                <input value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} placeholder="Assunto" className="w-full text-sm border border-neutral-200 rounded-pill px-3 py-2" />
                <textarea value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} rows={3} placeholder="Mensagem" className="w-full text-sm border border-neutral-200 rounded-large px-3 py-2 resize-none" />
              </div>
            )}
            {method === 'pdf' && (
              <button onClick={downloadPdf} className="w-full text-sm px-4 py-2 rounded-pill border border-brand text-brand-dark hover:bg-brand-lightest flex items-center justify-center gap-1.5">
                <Icon name="download" size={14} /> Baixar PDF (simulado)
              </button>
            )}

            <label className="flex items-center gap-2 text-xs text-neutral-600 mt-4 cursor-pointer">
              <input type="checkbox" checked={register} onChange={(e) => setRegister(e.target.checked)} /> Registrar como proposta enviada
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={handleSend} className="text-sm px-5 py-2.5 rounded-pill bg-brand text-white hover:bg-brand-dark flex items-center justify-center gap-1.5">
              <Icon name="trendingUp" size={15} /> Enviar proposta
            </button>
            <button onClick={downloadPdf} className="text-sm px-5 py-2 rounded-pill border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1.5">
              <Icon name="download" size={14} /> Baixar PDF
            </button>
            <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800 mt-1 flex items-center justify-center gap-1.5">
              <Icon name="arrowLeft" size={13} /> Voltar para configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SimulatorReport = { ReportConfig, SharePreview };

const { useState, useMemo, useRef } = React;

const NEGATIVE_KEYWORDS = ['frustra','insegur','ansied','incert','irrita','urgência','urgencia','vulnerab','depend','limita','perda'];
const POSITIVE_KEYWORDS = ['confiança','confianca','alívio','alivio','satisfaç','satisfac','clareza'];

function sentiment(text) {
  const t = (text || '').toLowerCase();
  if (NEGATIVE_KEYWORDS.some((k) => t.includes(k))) return -1;
  if (POSITIVE_KEYWORDS.some((k) => t.includes(k))) return 1;
  return 0;
}

function sentimentDetail(text) {
  const t = (text || '').toLowerCase();
  const neg = NEGATIVE_KEYWORDS.find((k) => t.includes(k));
  if (neg) return { score: -1, label: 'Negativo', keyword: neg };
  const pos = POSITIVE_KEYWORDS.find((k) => t.includes(k));
  if (pos) return { score: 1, label: 'Positivo', keyword: pos };
  return { score: 0, label: 'Neutro', keyword: null };
}

function sentimentColors(label) {
  if (label === 'Negativo') return { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' };
  if (label === 'Positivo') return { bg: '#dcfce7', text: '#166534', dot: '#16a34a' };
  return { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' };
}

function recommendationClasses(rec) {
  if (rec === 'Priorizar') return 'bg-green-100 text-green-800 border-green-300';
  if (rec === 'Avaliar') return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-gray-100 text-gray-600 border-gray-300';
}

function riskClasses(risk) {
  const r = (risk || '').toLowerCase();
  if (r === 'alto') return 'bg-red-100 text-red-700';
  if (r === 'médio' || r === 'medio') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PHASE_PALETTE = ['#FFA12F', '#F2467D', '#12B886', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#0EA5A4', '#EC4899', '#22C55E'];
const DARK_BAND = '#111827';

function phaseColor(index) {
  return PHASE_PALETTE[index % PHASE_PALETTE.length];
}

function shortText(t, n) {
  if (!t) return '';
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

function splitList(t) {
  return (t || '')
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean);
}

function chevronClip(i, n) {
  const hasLeftNotch = i > 0;
  const hasRightPoint = i < n - 1;
  const nL = hasLeftNotch ? '10px' : '0px';
  const nR = hasRightPoint ? '10px' : '0px';
  if (hasLeftNotch && hasRightPoint) {
    return `polygon(0 0, calc(100% - ${nR}) 0, 100% 50%, calc(100% - ${nR}) 100%, 0 100%, ${nL} 50%)`;
  }
  if (hasRightPoint) {
    return `polygon(0 0, calc(100% - ${nR}) 0, 100% 50%, calc(100% - ${nR}) 100%, 0 100%)`;
  }
  if (hasLeftNotch) {
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${nL} 50%)`;
  }
  return 'none';
}

function JourneyMapColumnCells({ group, index, column, onOpenPains, expanded }) {
  const color = phaseColor(index);
  const channels = Array.from(new Set(group.stages.map((s) => s.channel).filter(Boolean)));
  const involved = Array.from(new Set(group.stages.flatMap((s) => splitList(s.involvedParty))));
  const opportunities = Array.from(new Set(group.stages.map((s) => s.mvpOpportunity).filter(Boolean)));
  const n = group.stages.length;
  const visibleInvolved = expanded ? involved : involved.slice(0, 6);
  const visiblePains = expanded ? group.pains : group.pains.slice(0, 3);
  const visibleOpportunities = expanded ? opportunities : opportunities.slice(0, 2);

  return (
    <React.Fragment>
      <div style={{ gridColumn: column, gridRow: 1, background: color }} className="rounded-t-lg p-4 text-white">
        <div className="text-3xl font-bold leading-none mb-1">{index + 1}</div>
        <div className="text-sm font-semibold leading-snug">{group.macroStage}</div>
        <div className="text-[11px] opacity-90 mt-1">
          {expanded ? group.stages[0].trigger : shortText(group.stages[0].trigger, 70)}
        </div>
      </div>
      <div style={{ gridColumn: column, gridRow: 2, background: DARK_BAND }} className="flex text-white">
        {group.stages.map((s, i) => (
          <div
            key={s.id}
            style={{ clipPath: chevronClip(i, n), marginLeft: i > 0 ? '-10px' : 0, background: i % 2 === 0 ? color : '#1f2937' }}
            className="flex-1 px-3 py-2 min-w-[90px]"
          >
            <div className="text-[10px] font-medium leading-snug">
              {expanded ? s.actionTaken : shortText(s.actionTaken, 46)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ gridColumn: column, gridRow: 3, background: DARK_BAND }} className="p-3 text-white text-xs">
        <div className="text-[10px] uppercase tracking-wide opacity-60 mb-1">Canal</div>
        <ul className="space-y-0.5 leading-snug">
          {channels.map((c, i) => (
            <li key={i}>• {c}</li>
          ))}
        </ul>
      </div>
      <div style={{ gridColumn: column, gridRow: 4, background: color }} className="p-3 text-white text-xs">
        <div className="text-[10px] uppercase tracking-wide opacity-80 mb-1">Envolvidos</div>
        <ul className="space-y-0.5 leading-snug">
          {visibleInvolved.map((p, i) => (
            <li key={i}>• {p}</li>
          ))}
        </ul>
      </div>
      <div style={{ gridColumn: column, gridRow: 5, background: '#fff', border: '1px solid #e5e7eb' }} className="p-2 text-xs flex flex-col gap-1.5">
        {group.stages.map((s) => {
          const d = sentimentDetail(s.emotion);
          const c = sentimentColors(d.label);
          return (
            <div key={s.id} style={{ background: c.bg, color: c.text }} className="rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span style={{ background: c.dot }} className="w-2 h-2 rounded-full inline-block flex-shrink-0" />
                <span className="font-semibold">{d.label}</span>
                <span className="opacity-80">— {s.emotion || 'não informado'}</span>
              </div>
              {d.keyword && (
                <div className="text-[10px] opacity-70 mb-1">
                  Análise automática: expressão contém "{d.keyword}" → classificado como {d.label.toLowerCase()}
                </div>
              )}
              {s.evidenceQuote ? (
                <blockquote className="text-[11px] italic border-l-2 pl-2" style={{ borderColor: c.dot }}>
                  "{s.evidenceQuote}"
                </blockquote>
              ) : (
                <div className="text-[10px] opacity-60">Sem citação registrada para esta etapa.</div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={() => group.pains.length > 0 && onOpenPains(group.macroStage, group.pains)}
        style={{ gridColumn: column, gridRow: 6, background: DARK_BAND, cursor: group.pains.length > 0 ? 'pointer' : 'default' }}
        className="p-3 text-white text-xs text-left hover:brightness-125"
      >
        <div className="text-[10px] uppercase tracking-wide opacity-60 mb-1">
          Dores {group.pains.length > 0 && `(${group.pains.length})`}
        </div>
        <ul className="space-y-0.5 leading-snug">
          {visiblePains.map((p) => (
            <li key={p.id}>• {p.name}</li>
          ))}
          {group.pains.length === 0 && <li className="opacity-50">Nenhuma dor registrada</li>}
        </ul>
      </button>
      <div style={{ gridColumn: column, gridRow: 7, background: color }} className="rounded-b-lg p-3 text-white text-xs">
        <div className="text-[10px] uppercase tracking-wide opacity-80 mb-1">Oportunidade MVP</div>
        <ul className="space-y-0.5 leading-snug">
          {visibleOpportunities.map((o, i) => (
            <li key={i}>• {expanded ? o : shortText(o, 90)}</li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}

const MAP_ROW_LABELS = [
  { row: 3, title: 'Canal', desc: 'Sistema ou canal usado' },
  { row: 4, title: 'Envolvidos', desc: 'Quem participa da etapa' },
  { row: 5, title: 'Sentimento', desc: 'Emoção, análise e citação por etapa' },
  { row: 6, title: 'Dores', desc: 'Fricções da pesquisa' },
  { row: 7, title: 'Oportunidade MVP', desc: 'Hipótese de solução' },
];

function JourneyMapTab({ journey, filteredStages, painsByStage, onOpenPains }) {
  const [expanded, setExpanded] = useState(false);
  const groups = [];
  filteredStages.forEach((s) => {
    const last = groups[groups.length - 1];
    if (last && last.macroStage === s.macroStage) {
      last.stages.push(s);
    } else {
      groups.push({ macroStage: s.macroStage, stages: [s] });
    }
  });
  groups.forEach((g) => {
    g.pains = g.stages.flatMap((s) => painsByStage[s.id] || []);
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `170px repeat(${groups.length}, ${expanded ? 340 : 260}px)`,
    gridAutoRows: 'auto',
    columnGap: '10px',
    rowGap: '4px',
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <h2 className="text-2xl font-bold">{journey.name}</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded whitespace-nowrap hover:bg-gray-50"
        >
          {expanded ? 'Modo resumido' : 'Mostrar conteúdo completo'}
        </button>
      </div>
      <div className="text-sm text-gray-500 mb-4">
        Jornada atual (AS-IS) — a faixa "Sentimento" em cada coluna mostra a emoção, a análise automática e a citação de
        cada etapa. Use "Mostrar conteúdo completo" para ver os textos e as listas sem corte, para fins de análise.
      </div>
      {groups.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div style={gridStyle} className="min-w-max">
            {MAP_ROW_LABELS.map((l) => (
              <div
                key={l.row}
                style={{ gridColumn: 1, gridRow: l.row, position: 'sticky', left: 0, background: '#f9fafb', zIndex: 10 }}
                className="pr-3 py-3"
              >
                <div className="text-xs font-semibold text-gray-700">{l.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{l.desc}</div>
              </div>
            ))}
            {groups.map((g, gi) => (
              <JourneyMapColumnCells
                key={gi}
                group={g}
                index={gi}
                column={gi + 2}
                onOpenPains={onOpenPains}
                expanded={expanded}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-16">Nenhuma etapa encontrada para esse filtro.</div>
      )}
    </div>
  );
}

function DataTable({ columns, rows, keyField }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const sorted = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }, [rows, sortCol, sortDir]);

  function toggleSort(key) {
    if (sortCol === key) setSortDir(sortDir * -1);
    else {
      setSortCol(key);
      setSortDir(1);
    }
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className="text-left font-semibold text-gray-600 px-3 py-2 border-b border-gray-200 cursor-pointer select-none whitespace-nowrap"
              >
                {c.label}
                {sortCol === c.key ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row[keyField]} className="border-b border-gray-100 hover:bg-gray-50 align-top">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 max-w-xs">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && <div className="text-center text-gray-400 py-10">Sem resultados.</div>}
    </div>
  );
}

function JourneyDataTab({ filteredStages, filteredPains }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Etapas ({filteredStages.length})</h3>
        <DataTable
          keyField="id"
          rows={filteredStages}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'macroStage', label: 'Macro etapa' },
            { key: 'trigger', label: 'Gatilho' },
            { key: 'userGoal', label: 'Objetivo' },
            { key: 'channel', label: 'Canal' },
            { key: 'emotion', label: 'Emoção' },
            { key: 'confidenceLevel', label: 'Confiança' },
            { key: 'evidenceQuote', label: 'Evidência' },
            { key: 'mvpOpportunity', label: 'Oportunidade MVP' },
          ]}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Dores e evidências ({filteredPains.length})</h3>
        <DataTable
          keyField="id"
          rows={filteredPains}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'stageId', label: 'Etapa' },
            { key: 'name', label: 'Dor' },
            { key: 'painType', label: 'Tipo' },
            { key: 'frequency', label: 'Frequência' },
            { key: 'severity', label: 'Severidade' },
            {
              key: 'risk',
              label: 'Risco',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${riskClasses(r.risk)}`}>{r.risk}</span>,
            },
            { key: 'suggestedPriority', label: 'Prioridade' },
            { key: 'evidenceQuote', label: 'Evidência' },
          ]}
        />
      </div>
    </div>
  );
}

function ServiceBlueprintTab({ filteredStages }) {
  return (
    <div className="flex flex-col gap-3">
      {filteredStages.map((s) => (
        <div key={s.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-3 py-2 flex gap-3 items-start text-xs">
            <span className="font-semibold text-blue-800 w-10">{s.id}</span>
            <div className="flex-1">
              <div className="font-medium text-blue-900">{s.channel}</div>
              <div className="text-blue-700">{s.actionTaken}</div>
            </div>
            <span className="text-blue-600 text-[11px] uppercase tracking-wide">Frontstage</span>
          </div>
          <div className="border-t border-dashed border-gray-300" />
          <div className="bg-gray-50 px-3 py-2 flex gap-3 items-start text-xs">
            <span className="w-10" />
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div>
                <div className="text-gray-400">Pessoa / área</div>
                <div className="text-gray-700">{s.involvedParty || '—'}</div>
              </div>
              <div>
                <div className="text-gray-400">Decisão</div>
                <div className="text-gray-700">{s.decisionMade || '—'}</div>
              </div>
              <div>
                <div className="text-gray-400">Risco operacional</div>
                <div className="text-gray-700">{s.operationalRisk || '—'}</div>
              </div>
            </div>
            <span className="text-gray-400 text-[11px] uppercase tracking-wide">Backstage</span>
          </div>
        </div>
      ))}
      {filteredStages.length === 0 && <div className="text-center text-gray-400 py-16">Nenhuma etapa encontrada.</div>}
    </div>
  );
}

const BLUEPRINT_ROW_LABELS = [
  { row: 2, text: 'Tempo', color: '#1d4ed8' },
  { row: 3, text: 'Evidência', color: '#1d4ed8' },
  { row: 4, text: 'Ação do consultor', color: '#1d4ed8' },
  { row: 5, text: 'Linha de interação', color: '#111827', divider: true },
  { row: 6, text: 'Canal / sistema', color: '#1d4ed8' },
  { row: 7, text: 'Decisão', color: '#1d4ed8' },
  { row: 8, text: 'Linha de visibilidade', color: '#111827', divider: true },
  { row: 9, text: 'Envolvidos (backstage)', color: '#0d9488' },
  { row: 10, text: 'Linha de interação interna', color: '#111827', divider: true },
  { row: 11, text: 'Risco / suporte externo', color: '#0d9488' },
];

function BlueprintDivider({ dashed, arrow, arrowColor }) {
  return (
    <div className="relative h-4">
      <div
        className="absolute inset-x-0 top-1/2"
        style={{ borderTop: `2px ${dashed ? 'dashed' : 'solid'} #111827` }}
      />
      {arrow && (
        <div className="absolute inset-x-0 top-1/2 flex justify-center" style={{ transform: 'translateY(-50%)' }}>
          <span className="bg-white px-1 text-xs leading-none" style={{ color: arrowColor }}>
            {arrow}
          </span>
        </div>
      )}
    </div>
  );
}

function BlueprintColumn({ stage, column }) {
  const s = stage;
  const boxBlue = 'bg-blue-50 border border-blue-200 text-blue-900 rounded p-2 text-xs leading-snug';
  const boxTeal = 'bg-teal-50 border border-teal-200 text-teal-900 rounded p-2 text-xs leading-snug';
  return (
    <React.Fragment>
      <div style={{ gridColumn: column, gridRow: 1 }} className="text-[10px] text-gray-400 pb-1 leading-snug">
        <span className="font-semibold text-gray-500">{s.id}</span> {shortText(s.userGoal, 34)}
      </div>
      <div style={{ gridColumn: column, gridRow: 2 }} className="text-xs text-gray-700 py-3">
        {s.perceivedEffort || '—'}
      </div>
      <div style={{ gridColumn: column, gridRow: 3 }} className="text-xs text-gray-700 py-3">
        {s.artifact || '—'}
      </div>
      <div style={{ gridColumn: column, gridRow: 4 }} className={boxBlue}>
        {s.actionTaken}
      </div>
      <div style={{ gridColumn: column, gridRow: 5 }}>
        <BlueprintDivider dashed arrow="▼" arrowColor="#2563eb" />
      </div>
      <div style={{ gridColumn: column, gridRow: 6 }} className={boxBlue}>
        {s.channel}
      </div>
      <div style={{ gridColumn: column, gridRow: 7 }} className={boxBlue}>
        {s.decisionMade || '—'}
      </div>
      <div style={{ gridColumn: column, gridRow: 8 }}>
        <BlueprintDivider dashed={false} />
      </div>
      <div style={{ gridColumn: column, gridRow: 9 }} className={boxTeal}>
        {splitList(s.involvedParty).join(', ') || '—'}
      </div>
      <div style={{ gridColumn: column, gridRow: 10 }}>
        <BlueprintDivider dashed arrow="▲" arrowColor="#0d9488" />
      </div>
      <div style={{ gridColumn: column, gridRow: 11 }} className={boxTeal}>
        {s.operationalRisk || '—'}
      </div>
    </React.Fragment>
  );
}

function BlueprintVisualTab({ filteredStages }) {
  const stages = filteredStages;
  if (stages.length === 0) {
    return <div className="text-center text-gray-400 py-16">Nenhuma etapa encontrada para esse filtro.</div>;
  }
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `200px repeat(${stages.length}, 210px)`,
    gridAutoRows: 'auto',
    columnGap: '8px',
    rowGap: '3px',
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">
        Service blueprint <span className="italic font-normal text-gray-500">estilo NN/g</span>
      </h2>
      <div className="text-sm text-gray-500 mb-4">
        Azul = interação direta do consultor com o sistema (frontstage) · Verde = suporte e processos internos (backstage)
      </div>
      <div className="overflow-x-auto pb-4">
        <div style={gridStyle} className="min-w-max">
          {BLUEPRINT_ROW_LABELS.map((l) => (
            <div
              key={l.row}
              style={{ gridColumn: 1, gridRow: l.row, position: 'sticky', left: 0, background: '#fff', zIndex: 10, color: l.color }}
              className={`pr-3 flex items-center text-[11px] font-semibold uppercase tracking-wide ${l.divider ? 'py-0' : 'py-3'}`}
            >
              {l.text}
            </div>
          ))}
          {stages.map((s, i) => (
            <BlueprintColumn key={s.id} stage={s} column={i + 2} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BenchmarkTab({ benchmarks }) {
  const groups = {};
  benchmarks.forEach((b) => {
    groups[b.competitor] = groups[b.competitor] || [];
    groups[b.competitor].push(b);
  });
  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groups).map(([competitor, items]) => (
        <div key={competitor}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{competitor}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((b) => (
              <div key={b.id} className="border border-gray-200 rounded-lg p-3 text-xs flex flex-col gap-1.5 bg-white">
                <div className="font-medium text-sm">{b.flowDemonstrated}</div>
                <div className="text-gray-500">{b.taskObserved}</div>
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="bg-green-50 text-green-700 rounded px-1.5 py-0.5">Facilidade {b.perceivedEase}/5</span>
                  <span className="bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">Confiança {b.dataConfidence}/5</span>
                  <span className="bg-purple-50 text-purple-700 rounded px-1.5 py-0.5">Velocidade {b.speed}/5</span>
                </div>
                <div><span className="text-gray-400">Funciona bem: </span>{b.whatWorksWell}</div>
                <div><span className="text-gray-400">Funciona mal: </span>{b.whatWorksBadly}</div>
                <div><span className="text-gray-400">Copiar: </span>{b.whatToCopy}</div>
                <div><span className="text-gray-400">Evitar: </span>{b.whatToAvoid}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {benchmarks.length === 0 && <div className="text-center text-gray-400 py-16">Nenhum benchmark encontrado.</div>}
    </div>
  );
}

function PrioritizationTab({ items }) {
  const computed = items
    .map((p) => {
      const valueScore = p.frequency + p.userImpact + p.businessImpact + p.effortReduction + p.evidenceConfidence + p.riskIfUnresolved;
      const effortRiskScore = p.implementationEffort + p.technicalDependency;
      const finalScore = effortRiskScore === 0 ? 0 : valueScore / effortRiskScore;
      return { ...p, valueScore, effortRiskScore, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  const maxValue = Math.max(...computed.map((c) => c.valueScore), 1);

  return (
    <div className="flex flex-col gap-2">
      {computed.map((p) => (
        <div key={p.id} className="border border-gray-200 rounded-lg p-3 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-sm">{p.candidateJourneyName}</div>
              <div className="text-xs text-gray-500 mt-0.5">{p.mainPain}</div>
            </div>
            <span className={`text-xs border rounded-full px-2 py-0.5 whitespace-nowrap ${recommendationClasses(p.recommendation)}`}>
              {p.recommendation}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
              <div className="h-full bg-blue-400" style={{ width: `${(p.valueScore / maxValue) * 100}%` }} />
            </div>
            <span className="text-[11px] text-gray-500 w-32 text-right">
              valor {p.valueScore} / esforço-risco {p.effortRiskScore} = {p.finalScore.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{p.strongEvidence}</div>
        </div>
      ))}
      {computed.length === 0 && <div className="text-center text-gray-400 py-16">Nenhuma jornada candidata.</div>}
    </div>
  );
}

function SynthesisTab({ synthesis }) {
  if (!synthesis) {
    return <div className="text-center text-gray-400 py-16">Esta jornada ainda não tem síntese registrada.</div>;
  }
  const fields = [
    ['Data da entrevista', synthesis.interviewDate],
    ['Duração', synthesis.duration],
    ['Perfil da operação', synthesis.operationProfile],
    ['Modelo operacional', synthesis.operationalModel],
    ['Tese central', synthesis.centralThesis],
    ['Jornada mais crítica', synthesis.mostCriticalStage],
    ['Forças atuais', synthesis.currentStrengths],
    ['Principais lacunas', synthesis.mainGaps],
    ['Referências externas', synthesis.externalReferences],
    ['Recomendação de MVP', synthesis.mvpRecommendation],
    ['Próximo passo sugerido', synthesis.nextSteps],
  ];
  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3 text-sm">
        {fields.map(([label, value]) =>
          value ? (
            <div key={label}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
              <div className="text-gray-700">{value}</div>
            </div>
          ) : null
        )}
        {synthesis.keyEvidenceQuotes && synthesis.keyEvidenceQuotes.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Evidências-chave</div>
            <div className="flex flex-col gap-2">
              {synthesis.keyEvidenceQuotes.filter(Boolean).map((q, i) => (
                <blockquote key={i} className="border-l-2 border-blue-300 pl-3 italic text-gray-600">
                  {q}
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SENTIMENT_SCALE = [
  { dim: 'Estabilidade', label: 'Positiva', pct: 88, kind: 'pos' },
  { dim: 'Facilidade para tarefas simples', label: 'Positiva', pct: 88, kind: 'pos' },
  { dim: 'Profundidade analítica', label: 'Baixa', pct: 22, kind: 'gap' },
  { dim: 'Autonomia do consultor', label: 'Média/baixa', pct: 35, kind: 'gap' },
  { dim: 'Competitividade frente à XP/BTG', label: 'Em evolução', pct: 55, kind: 'info' },
  { dim: 'Potencial percebido', label: 'Alto', pct: 92, kind: 'potential' },
];

const INSIGHT_CARDS = [
  {
    title: 'O portal resolve o básico, mas não orienta a ação',
    whatAppeared: 'As tarefas atuais funcionam, mas o portal ainda não ajuda o consultor a saber onde deve agir primeiro.',
    evidence: 'Os entrevistados usam o Inter para ações operacionais, mas recorrem a XP, BTG ou ferramentas externas para análise, simulação e visão consolidada.',
    implication: 'O MVP deve priorizar uma camada de inteligência e ação, não apenas novas telas operacionais.',
  },
  {
    title: 'A maior dor é falta de visão consolidada e acionável',
    whatAppeared: 'Os consultores precisam enxergar saldo parado, vencimentos, entradas, saídas, dados cadastrais, carteira e oportunidades em um único lugar.',
    evidence: 'Nathalia quer saber de onde veio o dinheiro e agir antes do cliente cobrar. Lucas reforça que sem API e visão consolidada o Inter fica atrás das demais plataformas.',
    implication: 'Criar uma home inteligente com alertas, cards e lista de clientes que exigem ação.',
  },
  {
    title: 'XP é o benchmark mental de completude',
    whatAppeared: 'A XP aparece como principal referência de robustez, mesmo com algumas fricções.',
    evidence: 'Lucas usa a XP para simular carteira de cliente Inter. Nathalia também cita recursos da XP como dados, histórico, ordens e informações cadastrais.',
    implication: 'A XP deve ser usada como benchmark funcional, principalmente para simulador, carrinho, acompanhamento de ordens e visão da base.',
  },
  {
    title: 'API deixou de ser detalhe técnico e virou fator de adoção',
    whatAppeared: 'Para consultorias que usam consolidadores, a ausência de API reduz a atratividade da plataforma.',
    evidence: 'Lucas comentou que clientes do Inter podem receber menos atenção caso não estejam integrados ao sistema usado pela consultoria.',
    implication: 'API deve ser tratada como requisito estratégico para retenção e adoção por consultorias.',
  },
  {
    title: 'O consultor precisa de ferramentas de recomendação, não só execução',
    whatAppeared: 'Simulador de carteira, planejamento financeiro, comparação entre carteira atual e proposta, carrinho e envio em lote são vistos como recursos de alto valor.',
    evidence: 'Lucas mostrou o uso da XP para montar proposta de alocação, comparar benchmarks e gerar relatório white label.',
    implication: 'A evolução do portal deve incluir uma jornada de recomendação consultiva.',
  },
];

const PAIN_RANKING = [
  { id: 'R01', dor: 'Falta de visão consolidada e acionável', frequencia: 'Alta', impacto: 'Alto', perfil: 'Ambos', severidade: 'Alta' },
  { id: 'R02', dor: 'Ausência de API/conexão com consolidador', frequencia: 'Média/Alta', impacto: 'Alto', perfil: 'Lucas', severidade: 'Alta' },
  { id: 'R03', dor: 'Falta de simulador de carteira', frequencia: 'Média', impacto: 'Alto', perfil: 'Lucas', severidade: 'Alta' },
  { id: 'R04', dor: 'Dados cadastrais incompletos ou pouco visíveis', frequencia: 'Alta', impacto: 'Médio', perfil: 'Ambos', severidade: 'Média/Alta' },
  { id: 'R05', dor: 'Baixa autonomia operacional', frequencia: 'Média', impacto: 'Médio/Alto', perfil: 'Nathalia', severidade: 'Média/Alta' },
  { id: 'R06', dor: 'Busca e navegação pouco intuitivas', frequencia: 'Média', impacto: 'Médio', perfil: 'Ambos', severidade: 'Média' },
  { id: 'R07', dor: 'Ausência de alertas e oportunidades', frequencia: 'Alta', impacto: 'Alto', perfil: 'Ambos', severidade: 'Alta' },
  { id: 'R08', dor: 'Falta de histórico/acompanhamento de ordens', frequencia: 'Média', impacto: 'Médio/Alto', perfil: 'Lucas', severidade: 'Média/Alta' },
  { id: 'R09', dor: 'Dificuldade com PJ e internacional', frequencia: 'Média', impacto: 'Alto', perfil: 'Nathalia', severidade: 'Média/Alta' },
];

const PRIORITY_MATRIX = [
  { id: 'M01', oportunidade: 'Home inteligente com clientes que exigem ação', valor: 'Alto', impactoCliente: 'Alto', esforco: 'Médio', prioridade: 1 },
  { id: 'M02', oportunidade: 'Dados/API para consolidadores', valor: 'Alto', impactoCliente: 'Alto', esforco: 'Alto', prioridade: 2 },
  { id: 'M03', oportunidade: 'Histórico e acompanhamento de ordens', valor: 'Alto', impactoCliente: 'Médio', esforco: 'Médio', prioridade: 3 },
  { id: 'M04', oportunidade: 'Simulador de carteira', valor: 'Alto', impactoCliente: 'Alto', esforco: 'Alto', prioridade: 4 },
  { id: 'M05', oportunidade: 'Busca avançada e dados cadastrais', valor: 'Alto', impactoCliente: 'Médio', esforco: 'Baixo/Médio', prioridade: 5 },
  { id: 'M06', oportunidade: 'Carrinho/envio em lote', valor: 'Alto', impactoCliente: 'Médio', esforco: 'Médio/Alto', prioridade: 6 },
  { id: 'M07', oportunidade: 'Autonomia operacional', valor: 'Médio/Alto', impactoCliente: 'Médio', esforco: 'Médio', prioridade: 7 },
  { id: 'M08', oportunidade: 'PJ e internacional', valor: 'Médio/Alto', impactoCliente: 'Alto', esforco: 'Alto', prioridade: 8 },
];

const OPPORTUNITY_THEMES = [
  {
    title: 'Dados e visibilidade',
    items: ['Dados cadastrais completos', 'Saldo disponível', 'Origem do recurso', 'Patrimônio total', 'Clientes com saldo parado', 'Vencimentos próximos', 'Evolução da carteira', 'Segregação por classe de ativo'],
  },
  {
    title: 'Proatividade',
    items: ['Alertas de aporte', 'Alertas de vencimento', 'Alertas de cadastro', 'Clientes com recurso não alocado', 'Clientes com oportunidade de migração', 'Clientes com ordens pendentes'],
  },
  {
    title: 'Produtividade',
    items: ['Busca por nome, CPF, conta, e-mail e telefone', 'Histórico de ordens', 'Carrinho de investimentos', 'Envio em lote', 'Acompanhamento de aprovação'],
  },
  {
    title: 'Consultoria',
    items: ['Simulador de carteira', 'Comparação carteira atual vs. proposta', 'Planejamento financeiro', 'Relatório white label', 'Benchmark de rentabilidade', 'Análise risco-retorno'],
  },
  {
    title: 'Autonomia operacional',
    items: ['Informe de rendimento', 'Reset de senha', 'Bloqueio de conta', 'Cartão e limite', 'Suporte contextual', 'Gestão de dados cadastrais'],
  },
];

const JOURNEY_FLOW_STEPS = [
  'Consultor acessa o portal.',
  'Visualiza sua base e indicadores principais.',
  'Identifica clientes com ação necessária.',
  'Entra no detalhe do cliente.',
  'Analisa carteira e saldo.',
  'Simula recomendação.',
  'Envia ordem ou proposta.',
  'Acompanha aprovação.',
  'Registra ou gera relatório para o cliente.',
];

function scaleBarClasses(kind) {
  if (kind === 'pos') return 'bg-green-500';
  if (kind === 'gap') return 'bg-amber-500';
  if (kind === 'info') return 'bg-blue-500';
  return 'bg-purple-500';
}

function scaleLabelClasses(kind) {
  if (kind === 'pos') return 'text-green-700';
  if (kind === 'gap') return 'text-amber-700';
  if (kind === 'info') return 'text-blue-700';
  return 'text-purple-700';
}

function levelTagClasses(v) {
  const s = (v || '').toLowerCase();
  if (s === 'alta' || s === 'alto') return 'bg-green-50 text-green-700';
  if (s.includes('baixo') || s.includes('baixa')) return 'bg-gray-100 text-gray-600';
  return 'bg-blue-50 text-blue-700';
}

function effortTagClasses(v) {
  const s = (v || '').toLowerCase();
  if (s === 'alta' || s === 'alto') return 'bg-amber-50 text-amber-700';
  if (s.includes('baixo')) return 'bg-green-50 text-green-700';
  return 'bg-blue-50 text-blue-700';
}

function severityTagClasses(v) {
  const s = (v || '').toLowerCase();
  if (s === 'alta') return 'bg-red-50 text-red-700';
  if (s.includes('média/alta') || s.includes('media/alta')) return 'bg-red-50 text-red-600';
  return 'bg-amber-50 text-amber-700';
}

function profileBadgeClasses(perfil) {
  if (perfil === 'Nathalia') return 'bg-blue-50 text-blue-700';
  if (perfil === 'Lucas') return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

function InsightsTab() {
  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">Análise de Pesquisa — Portal do Consultor</h2>
        <div className="text-sm text-gray-500 mb-4">
          Entendimento das dores, necessidades e oportunidades a partir das entrevistas com consultores de investimento.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Entrevistas analisadas</div>
            <div className="text-sm font-medium">2</div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Perfis entrevistados</div>
            <div className="text-sm font-medium">Consultoria / Consultor de investimentos</div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Plataformas comparadas</div>
            <div className="text-sm font-medium">Inter, XP, BTG, Avenue, Ágora, Nordwealth/Tickerwealth</div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Foco da análise</div>
            <div className="text-sm font-medium">Jornada atual, dores, benchmark e priorização do MVP</div>
          </div>
        </div>
        <blockquote className="border-l-2 border-blue-400 pl-4 italic text-gray-700">
          "O Portal do Consultor funciona bem para tarefas básicas, mas ainda precisa evoluir de uma plataforma
          operacional para uma central inteligente de decisão e ação."
        </blockquote>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Sentimento geral</h3>
        <p className="text-sm font-medium text-gray-800 mb-1">
          Sentimento predominante: confiança operacional, mas baixa percepção de maturidade estratégica.
        </p>
        <p className="text-sm text-gray-600 mb-4 max-w-3xl">
          Os entrevistados reconhecem que o Inter é funcional para ações simples, como acessar clientes, gerar
          relatórios e enviar algumas recomendações. Porém, quando comparado a XP e BTG, o portal é percebido como
          menos completo para análise, simulação, priorização e gestão ativa da carteira.
        </p>
        <div className="flex flex-col gap-3 mb-4">
          {SENTIMENT_SCALE.map((s) => (
            <div key={s.dim} className="grid grid-cols-[180px_1fr_100px] items-center gap-3 text-xs">
              <div className="text-gray-700">{s.dim}</div>
              <div className="h-1.5 bg-gray-100 rounded overflow-hidden">
                <div className={`h-full rounded ${scaleBarClasses(s.kind)}`} style={{ width: `${s.pct}%` }} />
              </div>
              <div className={`text-right font-medium ${scaleLabelClasses(s.kind)}`}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 mb-5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />
            Força confirmada hoje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
            Lacuna confirmada hoje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
            Tendência em movimento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" />
            Potencial futuro
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-lg bg-white p-3 text-xs">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Nathalia · Åpen Capital</div>
            <div className="text-gray-700">
              Sentimento mais pragmático. O portal funciona, mas ela precisa de mais dados e autonomia.
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-3 text-xs">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Lucas · Ticker Investimentos</div>
            <div className="text-gray-700">Sentimento mais comparativo. O portal é básico diante da robustez da XP.</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Principais insights</h3>
        <div className="flex flex-col gap-3">
          {INSIGHT_CARDS.map((c, i) => (
            <div key={i} className="border border-gray-200 border-l-4 border-l-blue-500 rounded-lg bg-white p-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-xl font-bold text-blue-500">{String(i + 1).padStart(2, '0')}</span>
                <div className="font-semibold">{c.title}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">O que apareceu</div>
                  <div className="text-gray-600">{c.whatAppeared}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Evidência</div>
                  <div className="text-gray-600">{c.evidence}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-blue-500 mb-1">Implicação</div>
                  <div className="text-gray-800">{c.implication}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Ranking das dores</h3>
        <DataTable
          keyField="id"
          rows={PAIN_RANKING}
          columns={[
            { key: 'dor', label: 'Dor' },
            {
              key: 'frequencia',
              label: 'Frequência',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${levelTagClasses(r.frequencia)}`}>{r.frequencia}</span>,
            },
            {
              key: 'impacto',
              label: 'Impacto',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${levelTagClasses(r.impacto)}`}>{r.impacto}</span>,
            },
            {
              key: 'perfil',
              label: 'Perfil mais afetado',
              render: (r) => <span className={`px-1.5 py-0.5 rounded-full font-medium ${profileBadgeClasses(r.perfil)}`}>{r.perfil}</span>,
            },
            {
              key: 'severidade',
              label: 'Severidade',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${severityTagClasses(r.severidade)}`}>{r.severidade}</span>,
            },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Oportunidades por tema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {OPPORTUNITY_THEMES.map((theme) => (
            <div key={theme.title} className="border border-gray-200 rounded-lg bg-white p-3">
              <div className="text-sm font-semibold border-b border-gray-100 pb-2 mb-2">{theme.title}</div>
              <ul className="flex flex-col gap-1.5 text-xs text-gray-600">
                {theme.items.map((item, i) => (
                  <li key={i}>— {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Matriz de priorização</h3>
        <DataTable
          keyField="id"
          rows={PRIORITY_MATRIX}
          columns={[
            { key: 'oportunidade', label: 'Oportunidade' },
            {
              key: 'valor',
              label: 'Valor p/ consultor',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${levelTagClasses(r.valor)}`}>{r.valor}</span>,
            },
            {
              key: 'impactoCliente',
              label: 'Impacto no cliente',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${levelTagClasses(r.impactoCliente)}`}>{r.impactoCliente}</span>,
            },
            {
              key: 'esforco',
              label: 'Esforço estimado',
              render: (r) => <span className={`px-1.5 py-0.5 rounded ${effortTagClasses(r.esforco)}`}>{r.esforco}</span>,
            },
            {
              key: 'prioridade',
              label: 'Prioridade',
              render: (r) => (
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-semibold ${
                    r.prioridade <= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {r.prioridade}
                </span>
              ),
            },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Jornada prioritária recomendada</h3>
        <div className="border border-gray-200 rounded-lg bg-white p-4 mb-4">
          <div className="font-medium mb-2">
            Analisar base → identificar oportunidade → recomendar → acompanhar execução
          </div>
          <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Por que essa jornada</div>
          <div className="text-sm text-gray-600">
            Porque ela concentra as principais dores das duas entrevistas e conecta valor para consultor, cliente e
            negócio.
          </div>
        </div>
        <div className="flex flex-col">
          {JOURNEY_FLOW_STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full border-2 border-blue-500 text-blue-500 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                {i < JOURNEY_FLOW_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="text-sm pb-6 pt-1">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PainsPanel({ title, pains, onClose }) {
  if (!title) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Fechar</button>
        </div>
        <div className="flex flex-col gap-3">
          {pains.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-lg p-3 text-xs">
              <div className="font-medium text-sm mb-1">{p.name}</div>
              <div className="text-gray-600 mb-1">{p.description}</div>
              <div className="flex gap-1 flex-wrap mb-1">
                <span className={`px-1.5 py-0.5 rounded ${riskClasses(p.risk)}`}>Risco {p.risk}</span>
                <span className="bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Freq. {p.frequency}</span>
                <span className="bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Severidade {p.severity}/5</span>
              </div>
              {p.evidenceQuote && <blockquote className="border-l-2 border-gray-200 pl-2 italic text-gray-500">{p.evidenceQuote}</blockquote>}
              {p.opportunityHypothesis && (
                <div className="mt-1"><span className="text-gray-400">Oportunidade: </span>{p.opportunityHypothesis}</div>
              )}
            </div>
          ))}
          {pains.length === 0 && <div className="text-gray-400">Nenhuma dor registrada para essa etapa.</div>}
        </div>
      </div>
    </div>
  );
}

function NewJourneyModal({ onClose, onCreate }) {
  const options = [
    {
      source: 'interview',
      title: 'Entrevista (research)',
      desc: 'Input manual estruturado — pesquisador registra achados diretamente nas etapas.',
      available: true,
    },
    {
      source: 'transcript',
      title: 'Geração por transcrição',
      desc: 'A jornada é gerada automaticamente a partir da transcrição de uma entrevista.',
      available: false,
    },
    {
      source: 'analytics',
      title: 'Web analytics (GA4)',
      desc: 'Etapas populadas a partir de eventos e funis do Google Analytics 4.',
      available: false,
    },
  ];
  const [name, setName] = useState('');
  const [source, setSource] = useState('interview');

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-5 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3">Nova jornada</h3>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {options.map((o) => (
            <button
              key={o.source}
              onClick={() => o.available && setSource(o.source)}
              disabled={!o.available}
              className={`text-left border rounded-lg p-3 text-sm ${
                source === o.source ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              } ${!o.available ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}
            >
              <div className="font-medium">{o.title} {!o.available && <span className="text-[10px] text-gray-400">(em breve)</span>}</div>
              <div className="text-xs text-gray-500">{o.desc}</div>
            </button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da jornada"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-gray-500">Cancelar</button>
          <button
            onClick={() => name.trim() && onCreate(name.trim(), source)}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!name.trim()}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [journeys, setJourneys] = useState(window.SEED_DATA.journeys);
  const [currentId, setCurrentId] = useState(journeys[0] ? journeys[0].id : null);
  const [tab, setTab] = useState('map');
  const [search, setSearch] = useState('');
  const [macroFilter, setMacroFilter] = useState('');
  const [pinnedPains, setPinnedPains] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const fileInputRef = useRef(null);

  const journey = journeys.find((j) => j.id === currentId) || journeys[0];

  const stages = journey && journey.stages ? [...journey.stages].sort((a, b) => a.order - b.order) : [];
  const pains = (journey && journey.pains) || [];
  const benchmarks = (journey && journey.benchmarks) || [];
  const prioritization = (journey && journey.prioritization) || [];

  const macroOptions = useMemo(() => Array.from(new Set(stages.map((s) => s.macroStage))), [stages]);

  const query = search.trim().toLowerCase();
  const stageMatches = (s) =>
    (!macroFilter || s.macroStage === macroFilter) &&
    (!query ||
      [s.userGoal, s.actionTaken, s.trigger, s.channel, s.emotion, s.evidenceQuote]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(query)));

  const filteredStages = stages.filter(stageMatches);
  const filteredStageIds = new Set(filteredStages.map((s) => s.id));
  const filteredPains = pains.filter(
    (p) =>
      filteredStageIds.has(p.stageId) &&
      (!query ||
        [p.name, p.description, p.evidenceQuote].filter(Boolean).some((f) => f.toLowerCase().includes(query)))
  );

  const painsByStage = {};
  pains.forEach((p) => {
    painsByStage[p.stageId] = painsByStage[p.stageId] || [];
    painsByStage[p.stageId].push(p);
  });

  function handleExport() {
    download(`${journey.id}.json`, JSON.stringify({ journeys }, null, 2));
  }

  function handleImportClick() {
    fileInputRef.current && fileInputRef.current.click();
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.journeys) {
          setJourneys(parsed.journeys);
          setCurrentId(parsed.journeys[0].id);
        }
      } catch (err) {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleCreateJourney(name, source) {
    const newJourney = {
      id: uid(),
      name,
      projectId: journey ? journey.projectId : 'meu-projeto-cx-journey-mapper',
      persona: '',
      source,
      status: 'rascunho',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      stages: [],
      pains: [],
      benchmarks: [],
      prioritization: [],
      synthesis: null,
    };
    setJourneys([...journeys, newJourney]);
    setCurrentId(newJourney.id);
    setShowNewModal(false);
  }

  const tabs = [
    { key: 'map', label: 'Mapa da jornada' },
    { key: 'data', label: 'Dados da jornada' },
    { key: 'blueprint', label: 'Service blueprint' },
    { key: 'blueprint2', label: 'Blueprint visual (NN/g)' },
    { key: 'benchmark', label: 'Benchmark' },
    { key: 'priority', label: 'Priorização MVP' },
    { key: 'synthesis', label: 'Síntese' },
    { key: 'insights', label: 'Insights' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-lg">CX Journey Mapper</h1>
            <select
              value={currentId || ''}
              onChange={(e) => setCurrentId(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {journeys.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
            {journey && (
              <span className="text-[11px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                fonte: {journey.source}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNewModal(true)} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded">
              + Nova jornada
            </button>
            <button onClick={handleExport} className="text-sm px-3 py-1.5 border border-gray-300 rounded">
              Exportar JSON
            </button>
            <button onClick={handleImportClick} className="text-sm px-3 py-1.5 border border-gray-300 rounded">
              Importar JSON
            </button>
            <input type="file" accept="application/json" ref={fileInputRef} className="hidden" onChange={handleImportFile} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por texto, canal, emoção, evidência..."
            className="text-sm border border-gray-300 rounded px-3 py-1.5 w-72"
          />
          <select
            value={macroFilter}
            onChange={(e) => setMacroFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1.5"
          >
            <option value="">Todas as macro etapas</option>
            {macroOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <nav className="flex gap-1 mt-3 -mb-4 border-b border-gray-200 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-3 py-2 border-b-2 whitespace-nowrap ${
                tab === t.key ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-6">
        {!journey && <div className="text-center text-gray-400 py-24">Nenhuma jornada selecionada.</div>}
        {journey && tab === 'map' && (
          <JourneyMapTab
            journey={journey}
            filteredStages={filteredStages}
            painsByStage={painsByStage}
            onOpenPains={(title, groupPains) => setPinnedPains({ title, pains: groupPains })}
          />
        )}
        {journey && tab === 'data' && <JourneyDataTab filteredStages={filteredStages} filteredPains={filteredPains} />}
        {journey && tab === 'blueprint' && <ServiceBlueprintTab filteredStages={filteredStages} />}
        {journey && tab === 'blueprint2' && <BlueprintVisualTab filteredStages={filteredStages} />}
        {journey && tab === 'benchmark' && <BenchmarkTab benchmarks={benchmarks} />}
        {journey && tab === 'priority' && <PrioritizationTab items={prioritization} />}
        {journey && tab === 'synthesis' && <SynthesisTab synthesis={journey.synthesis} />}
        {journey && tab === 'insights' && <InsightsTab />}
      </main>

      <PainsPanel
        title={pinnedPains ? pinnedPains.title : null}
        pains={pinnedPains ? pinnedPains.pains : []}
        onClose={() => setPinnedPains(null)}
      />
      {showNewModal && <NewJourneyModal onClose={() => setShowNewModal(false)} onCreate={handleCreateJourney} />}

      <footer className="text-center text-[11px] text-gray-400 py-6">
        Protótipo local — sem banco de dados. Estado guardado só nesta sessão do navegador; use exportar/importar JSON para
        salvar e retomar o trabalho.
      </footer>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootEl).render(<App />);
} else {
  ReactDOM.render(<App />, rootEl);
}

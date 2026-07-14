# Modelo de Dados — Plataforma de Mapeamento de Jornada do Cliente

> Derivado do template `template_sintese_jornada_portal_consultor_preenchida_nathalia_bunzen.xlsx` (estudo de caso Åpen Capital / Portal do Consultor). Escopo: **MVP sem banco de dados** — estado local no front-end, com seed data e export/import em JSON.

## 1. Decisão de arquitetura para o MVP

Sem persistência em banco neste momento. O protótipo roda inteiramente no front-end (React), para permitir testar o modelo de jornada e o fluxo de uso antes de comprometer qualquer estrutura de backend.

| Aspecto | Decisão MVP | Motivo |
|---|---|---|
| Persistência | Nenhuma (estado em memória via React Context/useReducer) | Validar o produto antes de desenhar schema de banco |
| Dados iniciais | Seed JSON (`seed-data.json`, anexo) gerado a partir da planilha da Nathalia | Permite testar com um caso real desde o dia 1 |
| Salvar/retomar trabalho | Export/Import de arquivo `.json` (baixar/subir), como hoje se faz com a planilha | Não depende de conta, servidor ou DB |
| Multi-usuário | Fora do MVP | Requisito futuro (ver seção 6), depende de backend |
| Conexão com Google Analytics | Mockada com fixtures no MVP; chamada real à API fica para depois | GA4 exige OAuth/service account no servidor — não dá para chamar com segurança direto do browser |

Quando o MVP validar o conceito, a evolução natural é: Vercel Functions (API routes) + banco (Postgres/Supabase) para multiusuário, histórico de versões e a integração real com GA4.

## 2. Entidades principais

A planilha mapeia 4 tipos de artefato que viram 4 entidades centrais, mais os dicionários que viram enums/tags.

```
Journey (Jornada)
 └─ JourneyStage[] (Etapas AS-IS)          — aba 02
     └─ Pain[] (Dores/Evidências)          — aba 03
 └─ Benchmark[] (Concorrentes)             — aba 04
 └─ Prioritization[] (Priorização MVP)     — aba 05
 └─ Synthesis (Síntese executiva)          — aba 07
 └─ source: 'interview' | 'analytics' | 'transcript'
```

### 2.1 `Journey`

```ts
type JourneySource = 'interview' | 'analytics' | 'transcript';

interface Journey {
  id: string;
  name: string;                    // ex: "Portal do Consultor — Åpen Capital"
  projectId: string;
  persona: string;                 // ex: "Daily Banker / Consultor CX"
  source: JourneySource;
  status: 'rascunho' | 'em_revisao' | 'validado';
  createdAt: string;                // ISO date
  updatedAt: string;
  stages: JourneyStage[];
  synthesis?: Synthesis;
  analyticsConfig?: AnalyticsJourneyConfig; // presente quando source === 'analytics'
}
```

### 2.2 `JourneyStage` (aba `02_Jornada_Atual_ASIS`)

Uma etapa é o mesmo objeto independente da origem (entrevista, transcrição ou analytics) — o que muda são quais campos vêm preenchidos. Isso permite comparar/combinar jornadas de fontes diferentes no mesmo mapa.

```ts
interface JourneyStage {
  id: string;                  // "E01"
  journeyId: string;
  macroStage: string;          // tag livre — ver observação de qualidade de dados (§5)
  order: number;
  trigger: string;             // "Gatilho / situação"
  userGoal: string;            // "Objetivo da usuária"
  actionTaken: string;         // "Ação realizada"
  channel: string;             // "Canal / plataforma"
  artifact?: string;           // "Artefato usado"
  involvedParty?: string;      // "Pessoa / área envolvida"
  requiredInfo?: string;       // "Informação necessária"
  decisionMade?: string;       // "Decisão tomada"
  friction?: string;           // "Dor / fricção" (texto curto — a dor detalhada vive em Pain)
  emotion: string;             // tag livre, ver dicionário
  confidenceLevel: 1 | 2 | 3 | 4 | 5; // normalizado numérico (ver §5)
  perceivedEffort?: string;    // "Tempo / esforço percebido"
  operationalRisk?: string;
  evidenceQuote?: string;      // frase literal da entrevista/transcrição
  mvpOpportunity?: string;

  // Preenchido só quando a etapa vem de fonte analytics (GA4)
  analytics?: StageAnalytics;
}
```

### 2.3 `Pain` (aba `03_Dores_Evidências`)

```ts
interface Pain {
  id: string;                  // "D01"
  stageId: string;             // FK -> JourneyStage.id
  name: string;                // "Dor / necessidade"
  description: string;
  painType: string;            // tag livre — ver dicionário
  frequency: string;           // tag livre — ver §5 (inconsistência de escala)
  severity: 1 | 2 | 3 | 4 | 5;
  businessImpact?: string;
  customerImpact?: string;
  operationalImpact?: string;
  risk: 'baixo' | 'médio' | 'alto';
  evidenceQuote?: string;
  evidenceOrigin: string;      // ver §5 — recomendo separar em 2 campos (método + detalhe)
  opportunityHypothesis?: string;
  candidateJourney?: string;
  suggestedPriority: 'baixa' | 'média' | 'alta';
  notes?: string;
}
```

### 2.4 `Benchmark` (aba `04_Benchmark_Concorrentes`)

```ts
interface Benchmark {
  id: string;                  // "B01"
  competitor: string;          // "XP", "BTG", "Avenue"...
  flowDemonstrated: string;
  taskObserved: string;
  whatWorksWell?: string;
  whatWorksBadly?: string;
  uxPattern?: string;
  infoWellPresented?: string;
  infoMissingOrConfusing?: string;
  stepCount?: 'baixo' | 'médio' | 'alto';
  perceivedEase: 1 | 2 | 3 | 4 | 5;   // normalizado (dicionário tinha 5 níveis, dado real usava 3)
  dataConfidence: 1 | 2 | 3 | 4 | 5;
  speed: 1 | 2 | 3 | 4 | 5;
  usefulFeatures?: string;
  whatToCopy?: string;
  whatToAvoid?: string;
  screenshotRef?: string;      // upload de arquivo (print) — ver requisito "Upload de Arquivos"
  relatedJourneyId?: string;
  notes?: string;
}
```

### 2.5 `Prioritization` (aba `05_Priorização_MVP`)

Os scores já vêm com fórmula pronta na planilha — reaproveito a mesma lógica de cálculo.

```ts
interface Prioritization {
  id: string;
  candidateJourneyName: string;
  mainPain: string;
  strongEvidence: string;       // ex: "D02, D04, D18, D19"
  frequency: 1 | 2 | 3 | 4 | 5;
  userImpact: 1 | 2 | 3 | 4 | 5;
  businessImpact: 1 | 2 | 3 | 4 | 5;
  effortReduction: 1 | 2 | 3 | 4 | 5;
  evidenceConfidence: 1 | 2 | 3 | 4 | 5;
  riskIfUnresolved: 1 | 2 | 3 | 4 | 5;
  implementationEffort: 1 | 2 | 3 | 4 | 5;
  technicalDependency: 1 | 2 | 3 | 4 | 5;
  // calculados — não editáveis pelo usuário
  valueScore: number;           // soma de frequency+userImpact+businessImpact+effortReduction+evidenceConfidence+riskIfUnresolved
  effortRiskScore: number;      // soma de implementationEffort+technicalDependency+riskIfUnresolved (ajustar fórmula exata na implementação)
  finalScore: number;           // valueScore / effortRiskScore
  recommendation: 'Priorizar' | 'Avaliar' | 'Postergar';
}
```

### 2.6 `Synthesis` (aba `07_Síntese`)

```ts
interface Synthesis {
  journeyId: string;
  interviewDate?: string;
  duration?: string;
  operationProfile?: string;
  operationalModel?: string;
  centralThesis: string;
  mostCriticalStage?: string;
  currentStrengths?: string;
  mainGaps?: string;
  externalReferences?: string;
  mvpRecommendation: string;
  keyEvidenceQuotes: string[];
  nextSteps?: string;
}
```

### 2.7 Dicionário / enums (aba `06_Dicionário_Dropdowns`)

Valores sugeridos como default/autocomplete — **não travados como enum rígido**, porque o próprio dado real da Nathalia já usa valores fora dessas listas (ver §5). Implementar como tag list editável.

| Campo | Valores base do dicionário |
|---|---|
| Macro etapa | Entrada e ativação, Gestão de consultores, Onboarding cliente, Consulta carteira, Recomendação produto, Contratação/execução, Acompanhamento status, Relatórios, Backoffice/cobrança, Gestão operacional em massa |
| Emoção | Frustração, Insegurança, Confusão, Esforço, Neutro, Clareza, Confiança, Alívio, Satisfação |
| Nível (confiança) | Baixo, Médio, Alto, Crítico |
| Tipo de dor | Usabilidade, Informação, Operacional, Processo, Tecnologia, Integração, Governança, Risco, Relacionamento, Suporte |
| Frequência | Diária, Semanal, Mensal, Eventual, Não informado |
| Origem da evidência | Relato, Observação em tela, Frase literal, Documento, Comparativo concorrente, Inferência do pesquisador |
| Facilidade percebida | Muito fácil, Fácil, Média, Difícil, Muito difícil |

## 3. Jornada conectada ao Google Analytics (GA4)

"Novo modelo" = **GA4** (Google Analytics 4, o modelo atual baseado em eventos — sucessor da Universal Analytics, que foi descontinuada). A API relevante é a **GA4 Data API v1** (`properties.runReport`), que expõe ~75 dimensões e ~60 métricas predefinidas sobre um modelo orientado a eventos (`eventName`, `eventCount`, `sessionSource`, `landingPage` etc.).

Uma jornada "analytics" usa o **mesmo schema de `JourneyStage`** das demais fontes — o que muda é que os campos qualitativos (emoção, fricção, citação) ficam vazios/opcionais e os campos quantitativos vêm preenchidos automaticamente:

```ts
interface AnalyticsJourneyConfig {
  gaPropertyId: string;
  dateRange: { start: string; end: string };
  funnelSteps: Array<{
    stepName: string;         // vira JourneyStage.userGoal
    gaEventName: string;      // ex: "page_view", "begin_checkout", "purchase"
    pageOrScreen?: string;
  }>;
  lastRefreshedAt?: string;
}

interface StageAnalytics {
  gaEventName: string;
  users: number;
  eventCount: number;
  dropOffRate: number;        // % em relação à etapa anterior do funil
  avgEngagementTime: number;  // segundos
  deviceBreakdown?: { desktop: number; mobile: number; tablet: number };
  sampleSize: number;
  dataConfidence: 'alta';     // dado quantitativo, por padrão confiança alta
}
```

Importante: como a GA4 Data API exige credenciais de servidor (service account/OAuth), ela **não pode ser chamada direto do browser** com segurança — mesmo mantendo "sem banco de dados" no MVP, essa jornada vai precisar de uma function serverless simples (proxy de autenticação) quando a integração real acontecer. Para o protótipo agora, `analyticsConfig` e `StageAnalytics` devem ser preenchidos com **fixtures estáticas** (JSON mockado simulando uma resposta do GA4), sem chamada de API nenhuma — assim dá para testar a experiência de "jornada gerada por dados" sem montar nenhuma infraestrutura ainda.

## 4. Como as 3 origens preenchem o mesmo `JourneyStage`

| Campo | Entrevista (manual) | Transcrição (auto) | Analytics (GA4) |
|---|---|---|---|
| trigger, userGoal, actionTaken | Preenchido pelo pesquisador | Extraído por IA da transcrição | Inferido do nome do evento/funil |
| emotion, evidenceQuote | Alta riqueza | Média (depende da extração) | Vazio |
| confidenceLevel | Julgamento do pesquisador | Sugerido pela IA, revisável | N/A (usa `dataConfidence`) |
| analytics.* | — | — | Preenchido automaticamente |

Isso é o que permite, no futuro, sobrepor uma jornada qualitativa (entrevista) com uma quantitativa (GA4) no mesmo mapa visual — cada etapa mostra "o que a pessoa disse" ao lado de "o que os dados mostram".

## 5. Observações de qualidade de dados (vindas da planilha real)

O dicionário (aba 06) define escalas padronizadas, mas os dados reais preenchidos pela Nathalia usam variações mais ricas e às vezes inconsistentes. Vale decidir isso no design da UI antes de travar o schema:

- **Frequência**: o dicionário sugere escala temporal (Diária/Semanal/Mensal), mas os dados usam escala qualitativa (Alta/Média/Baixa) e até combinações ("Sazonal alta", "Baixa a média"). Recomendo unificar em uma única escala 1–5 (como já é feito na aba de Priorização) e manter um campo de texto livre à parte para nuance.
- **Origem da evidência**: os dados combinam método + fonte na mesma célula (ex: "Entrevista + benchmark XP/BTG"). Recomendo separar em `evidenceMethod` (enum) + `evidenceSourceDetail` (texto livre).
- **Facilidade percebida / confiança / velocidade** (aba Benchmark): o dicionário sugere 5 níveis verbais, mas o dado real usa só Alta/Média/Baixa. Recomendo os 3 campos como escala numérica 1–5 desde já, para casar com a matriz de priorização.
- **Macro etapa**: a aba 02 usa 15 rótulos distintos e mais descritivos do que os 10 do dicionário — sinal de que a lista do dicionário deveria ser tratada como sugestão inicial, não como conjunto fechado.

## 6. Fora de escopo do MVP (para revisar depois)

- Banco de dados / persistência multiusuário
- Autenticação e permissões por papel
- Conexão real (OAuth) com GA4
- Histórico de versões da jornada (será necessário assim que sair do protótipo — é uma das dores originais do projeto)
- Geração de jornada por transcrição via IA (o schema já comporta, a extração automática fica para uma fase seguinte)

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type ClaimVerdict = 'PROVEN_FACT' | 'INSUFFICIENT_EVIDENCE' | 'PLAUSIBLE_INFERENCE' | 'DISPROVEN';

export interface FactVerification {
  id: string;
  claim: string;
  verdict: ClaimVerdict;
  epistemicCertainty: number; // 0 - 100
  evidenceSource: string; // Exact log line or artifact
  tractatusAxiom: string; // e.g. "§1 The world is everything that is the case"
  reasoning: string;
}

export interface MitreTechnique {
  id: string; // e.g. T1110
  name: string; // e.g. Brute Force
  tactic: string; // e.g. Credential Access
  confidence: number; // 0 - 100
  provenByFactId: string;
  phaseOrder?: number;
  timestamp?: string;
  evidenceSnippet?: string;
}

export interface ExtractedIOC {
  type: 'ip' | 'domain' | 'filepath' | 'user' | 'hash' | 'port' | 'process';
  value: string;
  verifiedInLog: boolean;
  threatContext: string;
}

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  targetComponent: string;
  command: string;
  rollbackCommand: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_APPROVAL' | 'AUTHORIZED' | 'EXECUTED' | 'REJECTED';
  executedAt?: string;
  executionOutput?: string;
}

export interface AuditTrailEntry {
  id: string;
  actionId: string;
  title: string;
  command: string;
  rollbackCommand: string;
  status: 'AUTHORIZED' | 'EXECUTED' | 'REJECTED' | 'ROLLED_BACK';
  timestamp: string;
  operator: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executionOutput?: string;
  incidentContext?: string;
}

export interface TriageAnalysis {
  id: string;
  timestamp: string;
  incidentTitle: string;
  severity: SeverityLevel;
  summary: string;
  epistemicTruthScore: number; // 0 - 100
  hallucinationRisk: 'ZERO' | 'NEGLIGIBLE' | 'ELEVATED';
  facts: FactVerification[];
  mitreTechniques: MitreTechnique[];
  iocs: ExtractedIOC[];
  actions: RemediationAction[];
  modelName: string;
  engineMode: 'cloud-gemini' | 'local-arm-llama';
  latencyMs: number;
  memoryFootprintMB: number;
  fallbackActive?: boolean;
  fallbackReason?: string;
}

export interface LateralHuntQuery {
  id: string;
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  threatHypothesis: string;
  targetArtifact: string;
  queryType: 'OSQUERY' | 'SIGMA_SPLUNK' | 'ELASTIC_KQL' | 'BASH_FORENSIC';
  query: string;
  mitreRef: string;
  riskTier: 'HIGH' | 'MEDIUM' | 'CRITICAL';
  rationale: string;
}

export interface SampleTelemetry {
  id: string;
  title: string;
  category: 'Linux Brute-Force' | 'Privilege Escalation' | 'Web Shell' | 'Network C2 Beacon' | 'Ransomware Staging';
  source: string;
  description: string;
  rawLog: string;
}

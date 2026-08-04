export type AlertSeverity = 'critical' | 'major' | 'moderate' | 'minor' | 'info';

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  patientId: string;
  bloodGroup?: string;
}

export interface LabResult {
  testName: string;
  value: number;
  unit: string;
  normalRange: string;
  status: 'HIGH' | 'LOW' | 'NORMAL' | string;
  category: string;
}

export interface Medication {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  route?: string;
  prescribedFor?: string;
  prescribedBy?: string;
  prescribedDate?: string;
}

export interface ExtractedData {
  documentType: 'lab_report' | 'prescription' | 'discharge_summary' | string;
  date: string;
  provider: string;
  facility: string;
  patient: PatientInfo;
  medications: Medication[];
  labResults: LabResult[];
  allergies: string[];
  diagnoses: string[];
  notes?: string;
  rawSummary?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  documentType: string;
  title: string;
  provider: string;
  facility: string;
  summary: string;
  medications: Medication[];
  labResults: LabResult[];
  allergies: string[];
  diagnoses: string[];
  documentId?: string;
}

export interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  severity: AlertSeverity;
  type: 'interaction' | 'allergy_conflict' | 'duplicate' | string;
  description: string;
  mechanism?: string;
  recommendation: string;
  affectedDocuments: string[];
  confidenceScore: number;
}

export interface Alert {
  id: string;
  type: 'drug_interaction' | 'allergy_warning' | 'duplicate_prescription' | string;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendation: string;
  confidenceScore: number;
  relatedDocuments: string[];
  timestamp: string;
}

export interface DataPoint {
  date: string;
  value: number;
  documentId?: string;
  status?: string;
}

export interface LabTrend {
  testName: string;
  unit: string;
  normalRangeMin: number;
  normalRangeMax: number;
  dataPoints: DataPoint[];
  trendDirection: 'increasing' | 'decreasing' | 'stable' | string;
  explanation: string;
  isWorrying: boolean;
  confidenceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sender?: 'user' | 'bot' | 'system';
  text?: string;
  confidenceScore?: number;
  confidenceLevel?: 'high' | 'medium' | 'low';
  sourceDocuments?: string[];
  shouldConsultDoctor?: boolean;
  isHighRisk?: boolean;
  suggestedFollowUp?: string[];
  isThinking?: boolean;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface SuggestedQuestion {
  text: string;
  category: string;
}

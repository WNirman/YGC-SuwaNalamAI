import type {
  ExtractedData,
  TimelineEvent,
  DrugInteraction,
  Alert,
  LabTrend,
  ChatMessage,
  PatientInfo,
  AlertSeverity,
} from '@/types/medical';
import { randomUUID } from 'crypto';

export const MOCK_PATIENT: PatientInfo = {
  name: 'John Doe',
  age: '62',
  gender: 'Male',
  patientId: 'PT-99201',
  bloodGroup: 'O+',
};

export const MOCK_EXTRACTED_DATA: ExtractedData[] = [
  {
    documentType: 'lab_report',
    date: '2024-10-15',
    provider: 'Dr. Sarah Jenkins',
    facility: 'Metro Diagnostics',
    patient: MOCK_PATIENT,
    medications: [],
    labResults: [
      {
        testName: 'HbA1c',
        value: 6.2,
        unit: '%',
        normalRange: '4.0 - 5.6',
        status: 'HIGH',
        category: 'Blood Sugar',
      },
      {
        testName: 'Serum Creatinine',
        value: 0.9,
        unit: 'mg/dL',
        normalRange: '0.6 - 1.2',
        status: 'NORMAL',
        category: 'Kidney Function',
      },
      {
        testName: 'Serum Potassium',
        value: 4.1,
        unit: 'mEq/L',
        normalRange: '3.5 - 5.0',
        status: 'NORMAL',
        category: 'Electrolytes',
      },
    ],
    allergies: ['Penicillin'],
    diagnoses: ['Pre-diabetes', 'Hypertension'],
    notes: 'Patient exhibits borderline high blood pressure (135/85). Mildly elevated HbA1c indicates pre-diabetes. Penicillin allergy confirmed (patient reports severe hives/rash).',
    rawSummary: 'Initial baseline lab report from Metro Diagnostics. Shows normal kidney function, borderline high blood pressure, pre-diabetes (HbA1c 6.2%), and documented allergy to Penicillin.',
  },
  {
    documentType: 'prescription',
    date: '2024-12-10',
    provider: 'Dr. Sarah Jenkins',
    facility: 'Cardiology Associates',
    patient: MOCK_PATIENT,
    medications: [
      {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '90 days',
        route: 'oral',
        prescribedFor: 'Hypertension',
        prescribedBy: 'Dr. Sarah Jenkins',
        prescribedDate: '2024-12-10',
      },
      {
        name: 'Metformin',
        genericName: 'Metformin',
        dosage: '500mg',
        frequency: 'Once daily with dinner',
        duration: '90 days',
        route: 'oral',
        prescribedFor: 'Pre-diabetes',
        prescribedBy: 'Dr. Sarah Jenkins',
        prescribedDate: '2024-12-10',
      },
    ],
    labResults: [],
    allergies: ['Penicillin'],
    diagnoses: ['Hypertension', 'Pre-diabetes'],
    notes: 'Initiated Lisinopril 10mg daily for blood pressure control. Initiated Metformin 500mg daily to manage pre-diabetes and prevent progression. Recheck labs in 2-3 months.',
    rawSummary: 'Prescription by Dr. Sarah Jenkins initiating Lisinopril 10mg daily for hypertension and Metformin 500mg daily for pre-diabetes.',
  },
  {
    documentType: 'lab_report',
    date: '2025-02-20',
    provider: 'Dr. Sarah Jenkins',
    facility: 'Metro Diagnostics',
    patient: MOCK_PATIENT,
    medications: [],
    labResults: [
      {
        testName: 'HbA1c',
        value: 6.8,
        unit: '%',
        normalRange: '4.0 - 5.6',
        status: 'HIGH',
        category: 'Blood Sugar',
      },
      {
        testName: 'Serum Creatinine',
        value: 1.1,
        unit: 'mg/dL',
        normalRange: '0.6 - 1.2',
        status: 'NORMAL',
        category: 'Kidney Function',
      },
      {
        testName: 'Serum Potassium',
        value: 5.2,
        unit: 'mEq/L',
        normalRange: '3.5 - 5.0',
        status: 'HIGH',
        category: 'Electrolytes',
      },
    ],
    allergies: ['Penicillin'],
    diagnoses: ['Type 2 Diabetes', 'Hypertension'],
    notes: 'HbA1c has progressed to 6.8%, confirming transition to Type 2 Diabetes. Potassium is mildly elevated at 5.2 mEq/L (possibly related to ACE inhibitor Lisinopril). Creatinine is stable but trending up at 1.1.',
    rawSummary: 'Follow-up lab report showing progression of HbA1c to 6.8% (Type 2 Diabetes range) and mildly elevated potassium levels (5.2 mEq/L).',
  },
  {
    documentType: 'prescription',
    date: '2025-03-05',
    provider: 'Dr. Robert Chen',
    facility: 'Family Medicine Clinic',
    patient: MOCK_PATIENT,
    medications: [
      {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '20mg',
        frequency: 'Once daily',
        duration: '90 days',
        route: 'oral',
        prescribedFor: 'Hypertension',
        prescribedBy: 'Dr. Robert Chen',
        prescribedDate: '2025-03-05',
      },
      {
        name: 'Spironolactone',
        genericName: 'Spironolactone',
        dosage: '25mg',
        frequency: 'Once daily',
        duration: '90 days',
        route: 'oral',
        prescribedFor: 'Hypertension / Fluid Retention',
        prescribedBy: 'Dr. Robert Chen',
        prescribedDate: '2025-03-05',
      },
      {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        route: 'oral',
        prescribedFor: 'Acute Sinusitis',
        prescribedBy: 'Dr. Robert Chen',
        prescribedDate: '2025-03-05',
      },
    ],
    labResults: [],
    allergies: [], // Note: Chen's clinic did not record the allergy on this form, triggering the allergy conflict!
    diagnoses: ['Hypertension', 'Sinusitis', 'Type 2 Diabetes'],
    notes: 'Blood pressure remains elevated. Increased Lisinopril to 20mg. Added Spironolactone 25mg for synergy. Prescribed Amoxicillin 500mg TID for 7 days to treat severe sinusitis.',
    rawSummary: 'Prescription by Dr. Robert Chen. Increases Lisinopril to 20mg, adds Spironolactone 25mg, and prescribes Amoxicillin (Penicillin family) for sinusitis. Allergy history was not reviewed.',
  },
  {
    documentType: 'lab_report',
    date: '2025-05-12',
    provider: 'Dr. Robert Chen',
    facility: 'Metro Diagnostics',
    patient: MOCK_PATIENT,
    medications: [],
    labResults: [
      {
        testName: 'HbA1c',
        value: 7.4,
        unit: '%',
        normalRange: '4.0 - 5.6',
        status: 'HIGH',
        category: 'Blood Sugar',
      },
      {
        testName: 'Serum Creatinine',
        value: 1.4,
        unit: 'mg/dL',
        normalRange: '0.6 - 1.2',
        status: 'HIGH',
        category: 'Kidney Function',
      },
      {
        testName: 'Serum Potassium',
        value: 5.6,
        unit: 'mEq/L',
        normalRange: '3.5 - 5.0',
        status: 'HIGH',
        category: 'Electrolytes',
      },
    ],
    allergies: ['Penicillin'],
    diagnoses: ['Type 2 Diabetes', 'Kidney Strain', 'Hyperkalemia'],
    notes: 'Potassium is high at 5.6 mEq/L (moderate hyperkalemia). Creatinine has risen to 1.4 mg/dL (indicating acute kidney strain or mild impairment). HbA1c is poorly controlled at 7.4%. Urgent review of medications needed.',
    rawSummary: 'Recent lab report showing concerning kidney strain (Creatinine 1.4 mg/dL) and high potassium levels (5.6 mEq/L). HbA1c remains high at 7.4%.',
  },
];

export const MOCK_TIMELINE: TimelineEvent[] = MOCK_EXTRACTED_DATA.map((doc, idx) => ({
  id: `mock-event-${idx}`,
  date: doc.date,
  documentType: doc.documentType,
  title: doc.documentType === 'lab_report' 
    ? `Lab Report — ${doc.facility}` 
    : `Prescription — ${doc.provider} (${doc.facility})`,
  provider: doc.provider,
  facility: doc.facility,
  summary: doc.rawSummary,
  medications: doc.medications,
  labResults: doc.labResults,
  allergies: doc.allergies,
  diagnoses: doc.diagnoses,
  documentId: `mock-doc-${idx}`,
})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const MOCK_INTERACTIONS: DrugInteraction[] = [
  {
    id: 'mock-int-1',
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'critical',
    type: 'interaction',
    description: 'Concurrent use of Lisinopril (an ACE inhibitor) and Spironolactone (a potassium-sparing diuretic) significantly increases the risk of severe hyperkalemia (high blood potassium levels). Both drugs decrease potassium excretion in the kidneys.',
    mechanism: 'Lisinopril inhibits angiotensin-converting enzyme, reducing aldosterone secretion, which leads to potassium retention. Spironolactone blocks aldosterone receptors directly in the distal renal tubules, further preventing potassium excretion. Their combined effect is additive.',
    recommendation: 'Urgent consultation with Dr. Robert Chen or Dr. Sarah Jenkins is required. Blood potassium levels must be closely monitored (they have reached 5.6 mEq/L in your latest labs, which is high). An alternative blood pressure medication may be necessary, or the Spironolactone dose may need to be adjusted or discontinued.',
    affectedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    confidenceScore: 98,
  },
  {
    id: 'mock-int-2',
    drug1: 'Amoxicillin',
    drug2: 'Penicillin (Allergy)',
    severity: 'critical',
    type: 'allergy_conflict',
    description: 'Amoxicillin is a beta-lactam antibiotic belonging to the Penicillin class. You have a documented allergy to Penicillin (severe hives/rash reported on 2024-10-15). Taking Amoxicillin carries a high risk of a severe allergic reaction (anaphylaxis or hives).',
    mechanism: 'Cross-reactivity between Penicillin and Amoxicillin is extremely high because they share a similar beta-lactam ring chemical structure. The immune system will recognize Amoxicillin and trigger an allergic reaction.',
    recommendation: 'Do NOT take Amoxicillin if you have not started it yet. If you are already taking it and experience hives, itching, or breathing issues, seek emergency medical care immediately. Contact Dr. Robert Chen immediately to switch to a non-penicillin antibiotic (such as Azithromycin or Doxycycline) for your sinusitis.',
    affectedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    confidenceScore: 99,
  },
  {
    id: 'mock-int-3',
    drug1: 'Lisinopril 10mg',
    drug2: 'Lisinopril 20mg',
    severity: 'major',
    type: 'duplicate',
    description: 'Potential duplicate prescription or conflicting dosage instructions. You were prescribed Lisinopril 10mg daily by Dr. Sarah Jenkins on 2024-12-10, and then Lisinopril 20mg daily by Dr. Robert Chen on 2025-03-05 without clear written instructions to discontinue the 10mg dose.',
    recommendation: 'Confirm with Dr. Robert Chen if the 20mg dose was intended to completely replace the 10mg dose (which is standard practice when increasing the dose). Do NOT take both pills together (totaling 30mg) unless explicitly instructed, as this could cause dangerously low blood pressure and kidney strain.',
    affectedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    confidenceScore: 92,
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'mock-alert-1',
    type: 'drug_interaction',
    severity: 'critical',
    title: 'Lisinopril ↔ Spironolactone Interaction',
    description: 'Combination causes potassium retention, leading to high potassium levels (hyperkalemia). Your potassium levels rose to 5.6 mEq/L, which exceeds the safe threshold.',
    recommendation: 'Consult your doctor immediately to discuss replacing Spironolactone or reducing the dosage. Regularly monitor electrolytes.',
    confidenceScore: 98,
    relatedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    timestamp: '2025-05-13T08:00:00Z',
  },
  {
    id: 'mock-alert-2',
    type: 'allergy_warning',
    severity: 'critical',
    title: 'Allergy Conflict: Amoxicillin Prescribed',
    description: 'Amoxicillin is a penicillin-class antibiotic, which conflicts with your documented allergy to Penicillin.',
    recommendation: 'Stop taking Amoxicillin and contact Dr. Robert Chen immediately for a safe alternative antibiotic.',
    confidenceScore: 99,
    relatedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
  },
  {
    id: 'mock-alert-3',
    type: 'duplicate_prescription',
    severity: 'major',
    title: 'Duplicate Lisinopril Active Prescriptions',
    description: 'Prescribed 10mg by Dr. Jenkins and 20mg by Dr. Chen. Conflicting instructions could lead to accidental double-dosing.',
    recommendation: 'Check with Dr. Chen to confirm if the 20mg dose completely replaces the 10mg dose.',
    confidenceScore: 92,
    relatedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
  },
];

export const MOCK_TRENDS: LabTrend[] = [
  {
    testName: 'HbA1c',
    unit: '%',
    normalRangeMin: 4.0,
    normalRangeMax: 5.6,
    dataPoints: [
      { date: '2024-10-15', value: 6.2, documentId: 'mock-doc-0', status: 'HIGH' },
      { date: '2025-02-20', value: 6.8, documentId: 'mock-doc-2', status: 'HIGH' },
      { date: '2025-05-12', value: 7.4, documentId: 'mock-doc-4', status: 'HIGH' },
    ],
    trendDirection: 'increasing',
    explanation: "Your HbA1c has been rising steadily from 6.2% to 7.4% over the last three visits. An HbA1c above 5.6% is elevated, and values above 6.5% indicate Type 2 Diabetes. This upward trend suggests that your current blood sugar control is not optimal and your diabetes is progressing.",
    isWorrying: true,
    confidenceScore: 96,
  },
  {
    testName: 'Serum Creatinine',
    unit: 'mg/dL',
    normalRangeMin: 0.6,
    normalRangeMax: 1.2,
    dataPoints: [
      { date: '2024-10-15', value: 0.9, documentId: 'mock-doc-0', status: 'NORMAL' },
      { date: '2025-02-20', value: 1.1, documentId: 'mock-doc-2', status: 'NORMAL' },
      { date: '2025-05-12', value: 1.4, documentId: 'mock-doc-4', status: 'HIGH' },
    ],
    trendDirection: 'increasing',
    explanation: "Your Serum Creatinine has risen from 0.9 mg/dL to 1.4 mg/dL. Creatinine is a waste product filtered by the kidneys; a rising value signifies a decrease in kidney filtration function. The recent jump to 1.4 mg/dL is above the normal limit of 1.2 mg/dL, indicating acute kidney strain that warrants urgent medical evaluation.",
    isWorrying: true,
    confidenceScore: 95,
  },
  {
    testName: 'Serum Potassium',
    unit: 'mEq/L',
    normalRangeMin: 3.5,
    normalRangeMax: 5.0,
    dataPoints: [
      { date: '2024-10-15', value: 4.1, documentId: 'mock-doc-0', status: 'NORMAL' },
      { date: '2025-02-20', value: 5.2, documentId: 'mock-doc-2', status: 'HIGH' },
      { date: '2025-05-12', value: 5.6, documentId: 'mock-doc-4', status: 'HIGH' },
    ],
    trendDirection: 'increasing',
    explanation: "Your Serum Potassium level has drifted upwards from a normal 4.1 mEq/L to an elevated 5.6 mEq/L. This is likely a direct result of taking Lisinopril and Spironolactone together. Potassium levels above 5.0 mEq/L are elevated, and 5.6 mEq/L constitutes moderate hyperkalemia, which can affect heart rhythm.",
    isWorrying: true,
    confidenceScore: 97,
  },
];

export const MOCK_TRENDS_SUMMARY = "Analysis of the patient's labs over a 7-month period reveals several clinically significant trends. There is a steady climb in HbA1c (6.2% to 7.4%), showing progression of Type 2 Diabetes. Simultaneously, kidney function is declining, as shown by Serum Creatinine rising to 1.4 mg/dL. Finally, potassium levels have risen to an abnormal 5.6 mEq/L. These trends suggest kidney strain and hyperkalemia, likely aggravated by the combination of Lisinopril and Spironolactone.";

export const MOCK_CROSS_CHECK_SUMMARY = "Two CRITICAL safety concerns were identified. First, a high-risk drug-drug interaction between Lisinopril and Spironolactone is causing elevated potassium levels (hyperkalemia, 5.6 mEq/L). Second, Amoxicillin was prescribed despite a documented Penicillin allergy. A major conflict is also present with duplicate Lisinopril prescriptions (10mg and 20mg).";

// ============================================================
// Conversational Q&A logic for Mock Mode
// ============================================================
export function answerQuestionMock(question: string): {
  answer: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  sourceDocuments: string[];
  shouldConsultDoctor: boolean;
  isHighRisk: boolean;
  suggestedFollowUp: string[];
} {
  const q = question.toLowerCase();

  if (q.includes('allergy') || q.includes('amoxicillin') || q.includes('penicillin')) {
    return {
      answer: "Yes, your new medication, Amoxicillin 500mg, was prescribed by Dr. Robert Chen on March 05, 2025, despite a clear Penicillin allergy noted in your first report from October 15, 2024 (where severe hives/rash were documented). Amoxicillin belongs to the Penicillin class, and taking it could cause a severe allergic reaction.",
      confidenceScore: 99,
      confidenceLevel: 'high',
      sourceDocuments: ['Lab Report (2024-10-15)', 'Prescription (2025-03-05)'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "What should I do if I already started taking Amoxicillin?",
        "What is a safe alternative antibiotic for my sinusitis?",
        "Why did my doctor prescribe this if I have an allergy?",
      ],
    };
  }

  if (q.includes('interaction') || q.includes('lisinopril') || q.includes('spironolactone') || q.includes('potassium')) {
    return {
      answer: "There is a critical drug-drug interaction between Lisinopril and Spironolactone. Both are blood pressure medications that reduce potassium excretion, causing it to build up in your blood. Your potassium has risen from a normal 4.1 mEq/L in Oct 2024 to an elevated 5.6 mEq/L in May 2025 (hyperkalemia). High potassium can cause muscle weakness and heart palpitations.",
      confidenceScore: 98,
      confidenceLevel: 'high',
      sourceDocuments: ['Prescription (2025-03-05)', 'Lab Report (2025-05-12)'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "Is Lisinopril 20mg safe to take with Spironolactone?",
        "What are the symptoms of high potassium (hyperkalemia)?",
        "Who prescribed Spironolactone?",
      ],
    };
  }

  if (q.includes('creatinine') || q.includes('kidney') || q.includes('renal')) {
    return {
      answer: "Your Serum Creatinine level has risen from a baseline of 0.9 mg/dL in Oct 2024, to 1.1 mg/dL in Feb 2025, and now stands at 1.4 mg/dL in May 2025, which exceeds the normal reference limit of 1.2 mg/dL. This upward trend indicates kidney strain or mild impairment, likely worsened by hypertension or the Lisinopril/Spironolactone combination. Please consult your physician urgently to assess your renal function.",
      confidenceScore: 95,
      confidenceLevel: 'high',
      sourceDocuments: ['Lab Report (2024-10-15)', 'Lab Report (2025-02-20)', 'Lab Report (2025-05-12)'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "Does Lisinopril cause kidney strain?",
        "How can I improve my kidney creatinine levels?",
        "What does a creatinine of 1.4 mean?",
      ],
    };
  }

  if (q.includes('hba1c') || q.includes('sugar') || q.includes('diabetes') || q.includes('glucose')) {
    return {
      answer: "Your HbA1c has been steadily rising: it was 6.2% on October 15, 2024 (pre-diabetes range), rose to 6.8% on February 20, 2025 (confirming Type 2 Diabetes), and reached 7.4% on May 12, 2025. This shows that your blood sugar control is worsening despite the Metformin 500mg prescribed on December 10, 2024.",
      confidenceScore: 96,
      confidenceLevel: 'high',
      sourceDocuments: ['Lab Report (2024-10-15)', 'Prescription (2024-12-10)', 'Lab Report (2025-05-12)'],
      shouldConsultDoctor: true,
      isHighRisk: false,
      suggestedFollowUp: [
        "Should my Metformin dosage be increased?",
        "What diet changes help lower HbA1c from 7.4?",
        "Who prescribed my Metformin?",
      ],
    };
  }

  if (q.includes('duplicate') || q.includes('dosage') || q.includes('conflict')) {
    return {
      answer: "We found a conflict with Lisinopril: Dr. Jenkins prescribed Lisinopril 10mg daily on Dec 10, 2024, and Dr. Chen prescribed Lisinopril 20mg daily on March 05, 2025. It is highly likely the 20mg dose was meant to replace the 10mg dose, but this must be confirmed to avoid double-dosing (taking 30mg total), which could cause hypotension.",
      confidenceScore: 93,
      confidenceLevel: 'high',
      sourceDocuments: ['Prescription (2024-12-10)', 'Prescription (2025-03-05)'],
      shouldConsultDoctor: true,
      isHighRisk: false,
      suggestedFollowUp: [
        "What happens if I take both Lisinopril 10mg and 20mg?",
        "How should I organize my medications to prevent duplicate dosing?",
      ],
    };
  }

  // General default answer
  return {
    answer: "Based on the uploaded documents, John Doe (62, Male) has a history of Hypertension and Type 2 Diabetes. Over the past 7 months, there are critical alerts: a drug-drug interaction between Lisinopril and Spironolactone (causing potassium to rise to 5.6 mEq/L and creatinine to 1.4 mg/dL), and a prescription of Amoxicillin despite a documented allergy to Penicillin. Please consult a doctor to address these drug safety alerts.",
    confidenceScore: 85,
    confidenceLevel: 'medium',
    sourceDocuments: ['All uploaded documents'],
    shouldConsultDoctor: true,
    isHighRisk: true,
    suggestedFollowUp: [
      "Explain the Lisinopril and Spironolactone interaction.",
      "Did I get prescribed Amoxicillin despite my Penicillin allergy?",
      "Summarize my lab results over time.",
    ],
  };
}

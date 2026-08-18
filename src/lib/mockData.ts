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
    ? `Lab Report â€” ${doc.facility}` 
    : `Prescription â€” ${doc.provider} (${doc.facility})`,
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
    title: 'Lisinopril â†” Spironolactone Interaction',
    description: 'Combination causes potassium retention, leading to high potassium levels (hyperkalemia). Your potassium levels rose to 5.6 mEq/L, which exceeds the safe threshold.',
    recommendation: 'Consult your doctor immediately to discuss replacing Spironolactone or reducing the dosage. Regularly monitor electrolytes.',
    confidenceScore: 98,
    relatedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Nephrologist',
    urgencyHint: 'this_week' as const,
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
    suggestedSpecialty: 'Allergist / Immunologist',
    urgencyHint: 'immediate' as const,
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
    suggestedSpecialty: 'Cardiologist',
    urgencyHint: 'this_week' as const,
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
// Sinhala Mock Data
// ============================================================
export const MOCK_CROSS_CHECK_SUMMARY_SI = "à¶…à¶­à·’à·à¶º à¶¶à¶»à¶´à¶­à¶½ à·ƒà·žà¶›à·Šâ€à¶º à¶œà·à¶§à¶½à·” à¶¯à·™à¶šà¶šà·Š à·„à¶³à·”à¶±à·à¶œà·™à¶± à¶‡à¶­. à¶´à·…à¶¸à·”à·€, Lisinopril à·ƒà·„ Spironolactone à¶…à¶­à¶» à¶…à¶­à·’à·à¶º à¶…à·€à¶¯à·à¶±à¶¸à·Š à¶–à·‚à¶° à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà·à·€à¶šà·Š à¶±à·’à·ƒà· à¶»à·”à¶°à·’à¶»à¶ºà·š à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸ (Hyperkalemia, 5.6 mEq/L) à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­. à¶¯à·™à·€à¶±à·”à·€, à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š (Penicillin) à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€à¶ºà¶šà·Š à¶­à·’à¶¶à·’à¶ºà¶¯à·“à¶­à·Š Amoxicillin à¶–à·‚à¶°à¶º à¶±à·’à¶»à·Šà¶¯à·šà· à¶šà¶» à¶‡à¶­. à¶­à·€à¶¯ Lisinopril 10mg à·ƒà·„ 20mg à¶¸à·à¶­à·Šâ€à¶»à· à¶¯à·™à¶šà¶¸ à·ƒà¶§à·„à¶±à·Šà·€ à¶­à·’à¶¶à·“à¶¸à·™à¶±à·Š à¶–à·‚à¶° à¶¸à·à¶­à·Šâ€à¶»à·à·€ à¶¯à·™à¶œà·”à¶« à·€à·“à¶¸à·š à¶…à·€à¶¯à·à¶±à¶¸à¶šà·Š à¶´à·€à¶­à·“.";

export const MOCK_TRENDS_SUMMARY_SI = "à¶¸à·à·ƒ 7 à¶š à¶šà·à¶½à¶ºà¶šà·Š à¶­à·”à·… à¶»à·à¶œà·’à¶ºà·à¶œà·š à¶»à·ƒà·à¶ºà¶±à·à¶œà·à¶» à·€à·à¶»à·Šà¶­à· à·€à·’à·à·Šà¶½à·šà·‚à¶«à¶º à¶šà·’à¶»à·“à¶¸à·šà¶¯à·“ à¶´à·Šâ€à¶»à¶°à·à¶± à¶´à·Šâ€à¶»à·€à¶«à¶­à· à¶šà·’à·„à·’à¶´à¶ºà¶šà·Š à¶¯à¶šà·Šà¶±à¶§ à¶½à·à¶¶à·š. HbA1c à¶…à¶œà¶º 6.2% à·ƒà·’à¶§ 7.4% à¶¯à¶šà·Šà·€à· à¶…à¶›à¶«à·Šà¶©à·€ à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­à·’ à¶…à¶­à¶», à·ƒà·“à¶»à¶¸à·Š à¶šà·Šâ€à¶»à·’à¶ºà¶§à·’à¶±à·’à¶±à·Š (Creatinine) à¶…à¶œà¶º 1.4 mg/dL à¶¯à¶šà·Šà·€à· à¶‰à·„à·… à¶œà·œà·ƒà·Š à·€à¶šà·”à¶œà¶©à·” à¶†à¶­à¶­à·’à¶º à¶´à·™à¶±à·Šà¶±à·”à¶¸à·Š à¶šà¶»à¶ºà·’. à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶…à¶œà¶º 5.6 mEq/L à¶¯à¶šà·Šà·€à· à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­.";

export const MOCK_INTERACTIONS_SI: DrugInteraction[] = [
  {
    id: 'mock-int-1',
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'critical',
    type: 'interaction',
    description: 'Lisinopril à·ƒà·„ Spironolactone à¶‘à¶šà·€à¶» à¶·à·à·€à·’à¶­à¶º à¶±à·’à·ƒà· à¶»à·”à¶°à·’à¶»à¶ºà·š à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸ (Hyperkalemia) à¶…à¶­à·’à·à¶º à¶¶à¶»à¶´à¶­à¶½ à¶½à·™à·ƒ à¶‰à·„à·… à¶ºà·à¶¸à·š à¶…à·€à¶¯à·à¶±à¶¸à¶šà·Š à¶‡à¶­. à¶–à·‚à¶° à¶¯à·™à¶šà¶¸ à·€à¶šà·”à¶œà¶©à·” à¶¸à¶œà·’à¶±à·Š à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶´à·’à¶§à·€à·“à¶¸ à·€à·…à¶šà·Šà·€à¶ºà·’.',
    mechanism: 'Lisinopril à¶¸à¶œà·’à¶±à·Š à¶‡à¶±à·Šà¶¢à·’à¶ºà·à¶§à·™à¶±à·Šà·ƒà·’à¶±à·Š à¶‘à¶±à·Šà·ƒà¶ºà·’à¶¸à¶º à·€à·…à¶šà·Šà·€à¶± à¶…à¶­à¶» Spironolactone à¶¸à¶œà·’à¶±à·Š à¶‡à¶½à·Šà¶©à·œà·ƒà·Šà¶§à·™à¶»à·à¶±à·Š à¶´à·Šâ€à¶»à¶­à·’à¶œà·Šâ€à¶»à·à·„à¶š à¶…à·€à·„à·’à¶» à¶šà¶»à¶ºà·’.',
    recommendation: 'à·€à·„à·à¶¸ à¶”à¶¶à¶œà·š à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà· à·„à¶¸à·”à·€à·“ à¶–à·‚à¶° à·ƒà¶¸à·à¶½à·à¶ à¶±à¶º à¶šà¶»à¶œà¶±à·Šà¶±. à¶»à·”à¶°à·’à¶» à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸ (5.6 mEq/L) à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­à·’ à¶¶à·à·€à·’à¶±à·Š à·€à·’à¶šà¶½à·Šà¶´ à¶–à·‚à¶°à¶ºà¶šà·Š à¶·à·à·€à·’à¶­à¶º à·ƒà·”à¶¯à·”à·ƒà·”à¶º.',
    affectedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    confidenceScore: 98,
  },
  {
    id: 'mock-int-2',
    drug1: 'Amoxicillin',
    drug2: 'Penicillin (Allergy)',
    severity: 'critical',
    type: 'allergy_conflict',
    description: 'à¶”à¶¶à¶§ à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š (Penicillin) à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€à¶ºà¶šà·Š à¶‡à¶­à·’ à¶¶à·€ à·ƒà¶§à·„à¶±à·Šà·€ à¶­à·’à¶¶à·’à¶ºà¶¯à·“ Amoxicillin à¶–à·‚à¶°à¶º à¶½à¶¶à·à¶¯à·“ à¶‡à¶­. Amoxicillin à¶ºà¶±à·” à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶šà·à¶«à·Šà¶©à¶ºà·š à¶–à·‚à¶°à¶ºà¶šà·Š à¶¶à·à·€à·’à¶±à·Š à¶¶à¶»à¶´à¶­à¶½ à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à· à¶‡à¶­à·’à·€à·’à¶º à·„à·à¶š.',
    mechanism: 'à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à·ƒà·„ Amoxicillin à¶…à¶­à¶» à¶»à·ƒà·à¶ºà¶±à·’à¶š à·€à·Šâ€à¶ºà·”à·„à¶º à·ƒà¶¸à·à¶± à¶¶à·à·€à·’à¶±à·Š à¶´à·Šâ€à¶»à¶­à·’à·à¶šà·Šà¶­à·’à¶šà¶»à¶« à¶´à¶¯à·Šà¶°à¶­à·’à¶º à¶¸à¶œà·’à¶±à·Š à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶š à¶´à·Šâ€à¶»à¶­à·’à¶šà·Šâ€à¶»à·’à¶ºà·à·€à¶šà·Š à¶‡à¶­à·’ à¶šà¶»à¶ºà·’.',
    recommendation: 'à¶”à¶¶ à¶­à·€à¶¸à¶­à·Š Amoxicillin à¶½à¶¶à· à¶œà·à¶±à·“à¶¸ à¶†à¶»à¶¸à·Šà¶· à¶šà¶» à¶±à·œà¶¸à·à¶­à·’ à¶±à¶¸à·Š à¶‘à¶º à¶±à·œà¶œà¶±à·Šà¶±. à·€à·„à·à¶¸ à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà· à·„à¶¸à·”à·€à·“ à·€à·™à¶±à¶­à·Š à¶šà·à¶«à·Šà¶©à¶ºà¶š à¶´à·Šâ€à¶»à¶­à·’à¶¢à·“à·€à¶š (Antibiotic) à¶–à·‚à¶°à¶ºà¶šà·Š à¶½à¶¶à·à¶œà¶±à·Šà¶±.',
    affectedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    confidenceScore: 99,
  },
  {
    id: 'mock-int-3',
    drug1: 'Lisinopril 10mg',
    drug2: 'Lisinopril 20mg',
    severity: 'major',
    type: 'duplicate',
    description: 'Lisinopril 10mg à·ƒà·„ Lisinopril 20mg à¶ºà¶± à¶–à·‚à¶° à¶¸à·à¶­à·Šâ€à¶»à· à¶¯à·™à¶šà¶¸ à¶½à¶¶à·à¶¯à·“ à¶‡à¶­à·’ à¶¶à·à·€à·’à¶±à·Š à¶–à·‚à¶° à¶¸à·à¶­à·Šâ€à¶»à·à·€ à¶¯à·™à¶œà·”à¶« à·€à·“à¶¸à·š à¶…à·€à¶¯à·à¶±à¶¸à¶šà·Š à¶‡à¶­.',
    recommendation: 'à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·à¶œà·™à¶±à·Š 10mg à¶¸à·à¶­à·Šâ€à¶»à·à·€ à¶±à¶­à¶» à¶šà¶» 20mg à¶¸à·à¶­à·Šâ€à¶»à·à·€ à¶´à¶¸à¶«à¶šà·Š à¶œà¶­ à¶ºà·”à¶­à·”à¶¯ à¶ºà¶±à·Šà¶± à¶­à·„à·€à·”à¶»à·” à¶šà¶»à¶œà¶±à·Šà¶±.',
    affectedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    confidenceScore: 92,
  },
];

export const MOCK_ALERTS_SI: Alert[] = [
  {
    id: 'mock-alert-1',
    type: 'drug_interaction',
    severity: 'critical',
    title: 'Lisinopril â†” Spironolactone à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà·à·€',
    description: 'à¶–à·‚à¶° à¶¯à·™à¶šà¶¸ à¶·à·à·€à·’à¶­à¶º à¶±à·’à·ƒà· à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸ 5.6 mEq/L à¶¯à¶šà·Šà·€à· à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­ (Hyperkalemia).',
    recommendation: 'à·€à·„à·à¶¸ à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà· à·„à¶¸à·”à·€à·“ Spironolactone à¶–à·‚à¶°à¶º à·€à·™à¶±à·ƒà·Š à¶šà·’à¶»à·“à¶¸ à·„à· à¶¸à·à¶­à·Šâ€à¶»à·à·€ à¶…à¶©à·” à¶šà·’à¶»à·“à¶¸ à¶´à·’à·…à·’à¶¶à¶³à·€ à¶‹à¶´à¶¯à·™à·ƒà·Š à¶½à¶¶à·à¶œà¶±à·Šà¶±.',
    confidenceScore: 98,
    relatedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Nephrologist',
    urgencyHint: 'this_week' as const,
  },
  {
    id: 'mock-alert-2',
    type: 'allergy_warning',
    severity: 'critical',
    title: 'à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à· à¶…à·€à¶¯à·à¶±à¶¸: Amoxicillin à¶½à¶¶à·à¶¯à·“ à¶‡à¶­',
    description: 'Amoxicillin à¶ºà¶±à·” à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶šà·à¶«à·Šà¶©à¶ºà·š à¶–à·‚à¶°à¶ºà¶šà·Š à·€à¶± à¶…à¶­à¶» à¶‘à¶º à¶”à¶¶à¶œà·š à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€ à·„à· à¶œà·à¶§à·š.',
    recommendation: 'Amoxicillin à¶·à·à·€à·’à¶­à¶º à¶±à¶­à¶» à¶šà¶» à·€à·„à·à¶¸ à·€à·™à¶±à¶­à·Š à¶´à·Šâ€à¶»à¶­à·’à¶¢à·“à·€à¶šà¶ºà¶šà·Š à·ƒà¶³à·„à· à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà· à¶…à¶¸à¶­à¶±à·Šà¶±.',
    confidenceScore: 99,
    relatedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Allergist / Immunologist',
    urgencyHint: 'immediate' as const,
  },
  {
    id: 'mock-alert-3',
    type: 'duplicate_prescription',
    severity: 'major',
    title: 'à¶¯à·™à¶œà·”à¶« à·€à·– Lisinopril à¶–à·‚à¶° à·ƒà¶§à·„à¶±',
    description: 'Dr. Jenkins à·€à·’à·ƒà·’à¶±à·Š 10mg à·ƒà·„ Dr. Chen à·€à·’à·ƒà·’à¶±à·Š 20mg à¶½à¶¶à·à¶¯à·“ à¶‡à¶­. à¶¯à·™à¶šà¶¸ à¶·à·à·€à·’à¶­à¶ºà·™à¶±à·Š à¶»à·”à¶°à·’à¶» à¶´à·“à¶©à¶±à¶º à¶…à¶°à·’à¶š à¶½à·™à·ƒ à¶…à¶©à·”à·€à·’à¶º à·„à·à¶š.',
    recommendation: 'à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà· à¶…à¶¸à¶­à· 20mg à¶¸à·à¶­à·Šâ€à¶»à·à·€ à¶´à¶¸à¶«à¶šà·Š à¶œà¶­ à¶ºà·”à¶­à·”à¶¯à·à¶ºà·’ à¶­à·„à·€à·”à¶»à·” à¶šà¶»à¶œà¶±à·Šà¶±.',
    confidenceScore: 92,
    relatedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Cardiologist',
    urgencyHint: 'this_week' as const,
  },
];

export const MOCK_TRENDS_SI: LabTrend[] = [
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
    explanation: "à¶”à¶¶à¶œà·š HbA1c à¶…à¶œà¶º à¶…à·€à·ƒà·à¶± à¶´à¶»à·“à¶šà·Šà·‚à¶« 3 à¶­à·”à·… 6.2% à·ƒà·’à¶§ 7.4% à¶¯à¶šà·Šà·€à· à¶…à¶›à¶«à·Šà¶©à·€ à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­. 5.6% à¶§ à·€à·à¶©à·’ HbA1c à¶…à¶œà¶ºà¶šà·Š à¶‰à·„à·… à¶¸à¶§à·Šà¶§à¶¸à¶šà·Š à·€à¶± à¶…à¶­à¶», 6.5% à¶§ à·€à·à¶©à·’ à¶…à¶œà¶ºà¶±à·Š à¶¯à·™à·€à¶± à·€à¶»à·Šà¶œà¶ºà·š à¶¯à·’à¶ºà·€à·à¶©à·’à¶ºà·à·€ à¶´à·™à¶±à·Šà¶±à·”à¶¸à·Š à¶šà¶»à¶ºà·’.",
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
    explanation: "à¶”à¶¶à¶œà·š à·ƒà·“à¶»à¶¸à·Š à¶šà·Šâ€à¶»à·’à¶ºà¶§à·’à¶±à·’à¶±à·Š (Creatinine) à¶…à¶œà¶º 0.9 mg/dL à·ƒà·’à¶§ 1.4 mg/dL à¶¯à¶šà·Šà·€à· à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­. à¶¸à·™à¶ºà·’à¶±à·Š à·€à¶šà·”à¶œà¶©à·” à·€à¶½ à¶´à·™à¶»à·“à¶¸à·š à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à·’à¶­à·Šà·€à¶º à¶…à¶©à·”à·€à·“à¶¸à¶šà·Š (à·€à¶šà·”à¶œà¶©à·” à¶†à¶­à¶­à·’à¶º) à¶´à·™à¶±à·Šà¶±à·”à¶¸à·Š à¶šà¶»à¶ºà·’.",
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
    explanation: "à¶”à¶¶à¶œà·š à¶»à·”à¶°à·’à¶» à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸ à·ƒà·à¶¸à·à¶±à·Šâ€à¶º 4.1 mEq/L à·ƒà·’à¶§ 5.6 mEq/L à¶¯à¶šà·Šà·€à· à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­. à¶¸à·™à¶º Lisinopril à·ƒà·„ Spironolactone à¶–à·‚à¶° à¶‘à¶šà·€à¶» à¶·à·à·€à·’à¶­à¶º à¶±à·’à·ƒà· à·ƒà·’à¶¯à·”à·€à·–à·€à¶šà·’.",
    isWorrying: true,
    confidenceScore: 97,
  },
];

export const MOCK_EXTRACTED_DATA_SI: ExtractedData[] = MOCK_EXTRACTED_DATA.map((doc) => ({
  ...doc,
  rawSummary: doc.documentType === 'lab_report'
    ? `à¶»à·ƒà·à¶ºà¶±à·à¶œà·à¶» à·€à·à¶»à·Šà¶­à·à·€ - ${doc.facility} (${doc.date}). HbA1c à·ƒà·„ à¶šà·Šâ€à¶»à·’à¶ºà¶§à·’à¶±à·’à¶±à·Š à¶…à¶œà¶ºà¶±à·Š à¶‡à¶­à·”à·…à¶­à·Š à·€à·š.`
    : `à¶–à·‚à¶° à¶´à¶­à·Šâ€à¶»à¶º - ${doc.provider} (${doc.date}). à¶–à·‚à¶° à·€à¶§à·Šà¶§à·à¶»à·”à·€ à·ƒà¶§à·„à¶±à·Šà·€ à¶‡à¶­.`,
}));

export const MOCK_TIMELINE_SI: TimelineEvent[] = MOCK_TIMELINE.map((evt, idx) => ({
  ...evt,
  summary: MOCK_EXTRACTED_DATA_SI[idx]?.rawSummary || evt.summary,
}));

// ============================================================
// Tamil Mock Data
// ============================================================
export const MOCK_CROSS_CHECK_SUMMARY_TA = "à®‡à®°à®£à¯à®Ÿà¯ à®®à¯à®•à¯à®•à®¿à®¯à®®à®¾à®© à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà¯ à®•à®µà®²à¯ˆà®•à®³à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®©. à®®à¯à®¤à®²à®¾à®µà®¤à®¾à®•, à®²à®¿à®šà®¿à®©à¯‹à®ªà¯à®°à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¸à¯à®ªà¯ˆà®°à¯‹à®©à¯‹à®²à®¾à®•à¯à®Ÿà¯‹à®©à¯ à®‡à®Ÿà¯ˆà®¯à¯‡à®¯à®¾à®© à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà¯ˆ (5.6 mEq/L) à®‰à®¯à®°à¯à®¤à¯à®¤à¯à®•à®¿à®±à®¤à¯. à®‡à®°à®£à¯à®Ÿà®¾à®µà®¤à®¾à®•, à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®’à®µà¯à®µà®¾à®®à¯ˆ à®‡à®°à¯à®¨à¯à®¤à®ªà¯‹à®¤à®¿à®²à¯à®®à¯ à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯.";

export const MOCK_TRENDS_SUMMARY_TA = "7 à®®à®¾à®¤ à®•à®¾à®²à®¤à¯à®¤à®¿à®²à¯ à®¨à¯‹à®¯à®¾à®³à®¿à®¯à®¿à®©à¯ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à®¿à®©à¯ à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ à®ªà®² à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà®¤à¯à®¤à®•à¯à®• à®ªà¯‹à®•à¯à®•à¯à®•à®³à¯ˆ à®µà¯†à®³à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®•à®¿à®±à®¤à¯. HbA1c (6.2% à®®à¯à®¤à®²à¯ 7.4% à®µà®°à¯ˆ) à®šà¯€à®°à®¾à®• à®‰à®¯à®°à¯à®¨à¯à®¤à¯ à®Ÿà¯ˆà®ªà¯ 2 à®¨à¯€à®°à®¿à®´à®¿à®µà¯ à®¨à¯‹à®¯à¯ˆà®•à¯ à®•à®¾à®Ÿà¯à®Ÿà¯à®•à®¿à®±à®¤à¯. à®šà¯€à®°à®®à¯ à®•à®¿à®°à®¿à®¯à¯‡à®Ÿà¯à®Ÿà®¿à®©à®¿à®©à¯ 1.4 mg/dL à®†à®• à®‰à®¯à®°à¯à®¨à¯à®¤à¯ à®šà®¿à®±à¯à®¨à¯€à®°à®• à®…à®´à¯à®¤à¯à®¤à®¤à¯à®¤à¯ˆà®•à¯ à®•à®¾à®Ÿà¯à®Ÿà¯à®•à®¿à®±à®¤à¯.";

export const MOCK_INTERACTIONS_TA: DrugInteraction[] = [
  {
    id: 'mock-int-1',
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'critical',
    type: 'interaction',
    description: 'à®²à®¿à®šà®¿à®©à¯‹à®ªà¯à®°à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¸à¯à®ªà¯ˆà®°à¯‹à®©à¯‹à®²à®¾à®•à¯à®Ÿà¯‹à®©à¯ à®†à®•à®¿à®¯à®µà®±à¯à®±à®¿à®©à¯ à®’à®°à¯‡ à®¨à¯‡à®° à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯ à®‡à®°à®¤à¯à®¤à®¤à¯à®¤à®¿à®²à¯ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà¯ˆ (Hyperkalemia) à®•à®£à®¿à®šà®®à®¾à®• à®…à®¤à®¿à®•à®°à®¿à®•à¯à®•à¯à®®à¯ à®†à®ªà®¤à¯à®¤à¯ˆà®•à¯ à®•à¯Šà®£à¯à®Ÿà¯à®³à¯à®³à®¤à¯.',
    mechanism: 'à®‡à®°à¯ à®®à®°à¯à®¨à¯à®¤à¯à®•à®³à¯à®®à¯ à®šà®¿à®±à¯à®¨à¯€à®°à®•à®™à¯à®•à®³à¯ à®®à¯‚à®²à®®à¯ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®µà¯†à®³à®¿à®¯à¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®µà®¤à¯ˆà®•à¯ à®•à¯à®±à¯ˆà®•à¯à®•à®¿à®©à¯à®±à®©.',
    recommendation: 'à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®¿ à®®à®°à¯à®¨à¯à®¤à¯à®•à®³à¯ˆ à®®à®±à¯à®ªà®°à®¿à®šà¯€à®²à®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯. à®‡à®°à®¤à¯à®¤ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®• à®µà¯‡à®£à¯à®Ÿà¯à®®à¯.',
    affectedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    confidenceScore: 98,
  },
  {
    id: 'mock-int-2',
    drug1: 'Amoxicillin',
    drug2: 'Penicillin (Allergy)',
    severity: 'critical',
    type: 'allergy_conflict',
    description: 'à®‰à®™à¯à®•à®³à¯à®•à¯à®•à¯ à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®’à®µà¯à®µà®¾à®®à¯ˆ à®‰à®³à¯à®³à®¤à¯. à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®µà®•à¯ˆà®¯à¯ˆà®šà¯ à®šà¯‡à®°à¯à®¨à¯à®¤à®¤à¯ à®Žà®©à¯à®ªà®¤à®¾à®²à¯ à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®© à®’à®µà¯à®µà®¾à®®à¯ˆ à®Žà®¤à®¿à®°à¯à®µà®¿à®©à¯ˆà®¯à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®¤à¯à®¤à®•à¯à®•à¯‚à®Ÿà¯à®®à¯.',
    mechanism: 'à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ à®…à®®à¯ˆà®ªà¯à®ªà¯ à®’à®¤à¯à®¤à®¤à®¾à®• à®‡à®°à¯à®ªà¯à®ªà®¤à®¾à®²à¯ à®’à®µà¯à®µà®¾à®®à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯.',
    recommendation: 'à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®‰à®Ÿà¯à®•à¯Šà®³à¯à®µà®¤à¯ˆ à®¨à®¿à®±à¯à®¤à¯à®¤à®¿à®µà®¿à®Ÿà¯à®Ÿà¯, à®®à®¾à®±à¯à®±à¯ à®¨à¯à®£à¯à®£à¯à®¯à®¿à®°à¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà®¿à®•à¯à®•à¯ à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆà®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®•à¯Šà®³à¯à®³à®µà¯à®®à¯.',
    affectedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    confidenceScore: 99,
  },
  {
    id: 'mock-int-3',
    drug1: 'Lisinopril 10mg',
    drug2: 'Lisinopril 20mg',
    severity: 'major',
    type: 'duplicate',
    description: 'à®²à®¿à®šà®¿à®©à¯‹à®ªà¯à®°à®¿à®²à¯ 10mg à®®à®±à¯à®±à¯à®®à¯ 20mg à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à®³à¯à®•à¯à®•à¯ à®‡à®Ÿà¯ˆà®¯à¯‡ à®®à¯à®°à®£à¯à®ªà®¾à®Ÿà¯ à®‰à®³à¯à®³à®¤à¯.',
    recommendation: '10mg à®…à®³à®µà¯à®•à¯à®•à¯à®ªà¯ à®ªà®¤à®¿à®²à®¾à®• 20mg à®®à¯à®±à¯à®±à®¿à®²à¯à®®à¯ à®®à®¾à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à®¾ à®Žà®©à¯à®ªà®¤à¯ˆ à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à®¿à®Ÿà®®à¯ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.',
    affectedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    confidenceScore: 92,
  },
];

export const MOCK_ALERTS_TA: Alert[] = [
  {
    id: 'mock-alert-1',
    type: 'drug_interaction',
    severity: 'critical',
    title: 'Lisinopril â†” Spironolactone à®¤à¯Šà®Ÿà®°à¯à®ªà¯',
    description: 'à®•à¯‚à®Ÿà¯à®Ÿà¯ à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®¤à¯à®¤à¯ˆ à®¤à®•à¯à®•à®µà¯ˆà®¤à¯à®¤à¯, à®…à®¤à®¿à®• à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà®¿à®±à¯à®•à¯ (Hyperkalemia) à®µà®´à®¿à®µà®•à¯à®•à¯à®•à®¿à®±à®¤à¯ (5.6 mEq/L).',
    recommendation: 'à®®à®°à¯à®¨à¯à®¤à¯ˆ à®®à®¾à®±à¯à®±à¯à®µà®¤à¯ à®…à®²à¯à®²à®¤à¯ à®…à®³à®µà¯ˆà®•à¯ à®•à¯à®±à¯ˆà®ªà¯à®ªà®¤à¯ à®•à¯à®±à®¿à®¤à¯à®¤à¯ à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.',
    confidenceScore: 98,
    relatedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Nephrologist',
    urgencyHint: 'this_week' as const,
  },
  {
    id: 'mock-alert-2',
    type: 'allergy_warning',
    severity: 'critical',
    title: 'à®’à®µà¯à®µà®¾à®®à¯ˆ à®Žà®šà¯à®šà®°à®¿à®•à¯à®•à¯ˆ: à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®µà®´à®™à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯',
    description: 'à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®µà®•à¯à®ªà¯à®ªà¯ˆà®šà¯ à®šà¯‡à®°à¯à®¨à¯à®¤à®¤à¯, à®‡à®¤à¯ à®‰à®™à¯à®•à®³à¯ à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®’à®µà¯à®µà®¾à®®à¯ˆà®¯à¯à®Ÿà®©à¯ à®®à¯à®°à®£à¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯.',
    recommendation: 'à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®Žà®Ÿà¯à®ªà¯à®ªà®¤à¯ˆ à®¨à®¿à®±à¯à®¤à¯à®¤à®¿à®µà®¿à®Ÿà¯à®Ÿà¯ à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.',
    confidenceScore: 99,
    relatedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Allergist / Immunologist',
    urgencyHint: 'immediate' as const,
  },
  {
    id: 'mock-alert-3',
    type: 'duplicate_prescription',
    severity: 'major',
    title: 'à®‡à®°à®Ÿà¯à®Ÿà¯ˆ Lisinopril à®®à®°à¯à®¨à¯à®¤à¯ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆ',
    description: 'à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®œà¯†à®©à¯à®•à®¿à®©à¯à®¸à¯ 10mg à®®à®±à¯à®±à¯à®®à¯ à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®šà¯†à®©à¯ 20mg à®µà®´à®™à¯à®•à®¿à®¯à¯à®³à¯à®³à®©à®°à¯. à®‡à®¤à¯ à®‡à®°à®Ÿà¯à®Ÿà®¿à®ªà¯à®ªà¯ à®…à®³à®µà¯ˆ à®à®±à¯à®ªà®Ÿà¯à®¤à¯à®¤à®•à¯à®•à¯‚à®Ÿà¯à®®à¯.',
    recommendation: '20mg à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®Žà®Ÿà¯à®•à¯à®• à®µà¯‡à®£à¯à®Ÿà¯à®®à®¾ à®Žà®©à¯à®ªà®¤à¯ˆ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à®¿à®Ÿà®®à¯ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.',
    confidenceScore: 92,
    relatedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
    suggestedSpecialty: 'Cardiologist',
    urgencyHint: 'this_week' as const,
  },
];

export const MOCK_TRENDS_TA: LabTrend[] = [
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
    explanation: "à®‰à®™à¯à®•à®³à¯ HbA1c à®•à®Ÿà¯ˆà®šà®¿ 3 à®µà®°à¯à®•à¯ˆà®•à®³à®¿à®²à¯ 6.2% à®‡à®²à®¿à®°à¯à®¨à¯à®¤à¯ 7.4% à®†à®• à®‰à®¯à®°à¯à®¨à¯à®¤à¯à®³à¯à®³à®¤à¯. 5.6% à®•à¯à®•à¯ à®®à¯‡à®²à¯ à®‡à®°à¯à®ªà¯à®ªà®¤à¯ à®…à®¤à®¿à®•à®®à¯, à®®à¯‡à®²à¯à®®à¯ 6.5% à®•à¯à®•à¯ à®®à¯‡à®²à¯ à®Ÿà¯ˆà®ªà¯ 2 à®¨à¯€à®°à®¿à®´à®¿à®µà¯ à®¨à¯‹à®¯à¯ˆà®•à¯ à®•à¯à®±à®¿à®•à¯à®•à®¿à®±à®¤à¯.",
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
    explanation: "à®‰à®™à¯à®•à®³à¯ à®šà¯€à®°à®®à¯ à®•à®¿à®°à®¿à®¯à¯‡à®Ÿà¯à®Ÿà®¿à®©à®¿à®©à¯ 0.9 mg/dL à®‡à®²à®¿à®°à¯à®¨à¯à®¤à¯ 1.4 mg/dL à®†à®• à®‰à®¯à®°à¯à®¨à¯à®¤à¯à®³à¯à®³à®¤à¯. à®‡à®¤à¯ à®šà®¿à®±à¯à®¨à¯€à®°à®• à®µà®Ÿà®¿à®•à®Ÿà¯à®Ÿà¯à®¤à®²à¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯ à®•à¯à®±à¯ˆà®µà®¤à¯ˆà®•à¯ à®•à¯à®±à®¿à®•à¯à®•à®¿à®±à®¤à¯ (à®šà®¿à®±à¯à®¨à¯€à®°à®• à®…à®´à¯à®¤à¯à®¤à®®à¯).",
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
    explanation: "à®‰à®™à¯à®•à®³à¯ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà¯ 4.1 mEq/L à®‡à®²à®¿à®°à¯à®¨à¯à®¤à¯ 5.6 mEq/L à®†à®• à®‰à®¯à®°à¯à®¨à¯à®¤à¯à®³à¯à®³à®¤à¯. à®‡à®¤à¯ à®²à®¿à®šà®¿à®©à¯‹à®ªà¯à®°à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¸à¯à®ªà¯ˆà®°à¯‹à®©à¯‹à®²à®¾à®•à¯à®Ÿà¯‹à®©à¯ à®†à®•à®¿à®¯à®µà®±à¯à®±à¯ˆ à®’à®©à¯à®±à®¾à®• à®Žà®Ÿà¯à®¤à¯à®¤à¯à®•à¯à®•à¯Šà®³à¯à®µà®¤à®©à¯ à®¨à¯‡à®°à®Ÿà®¿ à®µà®¿à®³à¯ˆà®µà®¾à®•à¯à®®à¯.",
    isWorrying: true,
    confidenceScore: 97,
  },
];

export const MOCK_EXTRACTED_DATA_TA: ExtractedData[] = MOCK_EXTRACTED_DATA.map((doc) => ({
  ...doc,
  rawSummary: doc.documentType === 'lab_report'
    ? `à®†à®¯à¯à®µà®• à®…à®±à®¿à®•à¯à®•à¯ˆ - ${doc.facility} (${doc.date}). HbA1c à®®à®±à¯à®±à¯à®®à¯ à®•à®¿à®°à®¿à®¯à¯‡à®Ÿà¯à®Ÿà®¿à®©à®¿à®©à¯ à®†à®•à®¿à®¯à®µà¯ˆ à®…à®Ÿà®™à¯à®•à¯à®®à¯.`
    : `à®®à®°à¯à®¨à¯à®¤à¯ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆ - ${doc.provider} (${doc.date}).`,
}));

export const MOCK_TIMELINE_TA: TimelineEvent[] = MOCK_TIMELINE.map((evt, idx) => ({
  ...evt,
  summary: MOCK_EXTRACTED_DATA_TA[idx]?.rawSummary || evt.summary,
}));

export function getMockData(language: 'en' | 'si' | 'ta' = 'en') {
  if (language === 'si') {
    return {
      extractedData: MOCK_EXTRACTED_DATA_SI,
      timeline: MOCK_TIMELINE_SI,
      patient: MOCK_PATIENT,
      interactions: MOCK_INTERACTIONS_SI,
      alerts: MOCK_ALERTS_SI,
      overallRiskLevel: 'critical' as const,
      crossCheckSummary: MOCK_CROSS_CHECK_SUMMARY_SI,
      trends: MOCK_TRENDS_SI,
      trendsSummary: MOCK_TRENDS_SUMMARY_SI,
      suggestedQuestions: [
        { text: 'à¶¸à¶œà·š à¶–à·‚à¶° à¶…à¶­à¶» à¶šà·’à·ƒà·’à¶ºà¶¸à·Š à¶…à¶­à·”à¶»à·” à¶†à¶¶à·à¶° / à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà· à¶­à·’à¶¶à·šà¶¯?', category: 'medications' as const },
        { text: 'à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€ à¶­à·’à¶¶à·’à¶ºà¶¯à·“à¶­à·Š à¶¸à¶§ Amoxicillin à¶±à·’à¶»à·Šà¶¯à·šà· à¶šà¶» à¶­à·’à¶¶à·šà¶¯?', category: 'allergies' as const },
        { text: 'à¶¸à¶œà·š à·€à¶šà·”à¶œà¶©à·” à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à·’à¶­à·Šà·€à¶º (Creatinine) à¶´à·’à·…à·’à¶¶à¶³ à¶´à·Šâ€à¶»à·€à¶«à¶­à·à·€ à¶šà·”à¶¸à¶šà·Šà¶¯?', category: 'lab_results' as const },
        { text: 'à¶¸à¶œà·š à¶»à·”à¶°à·’à¶» à·ƒà·“à¶±à·’ (HbA1c) à¶´à·Šâ€à¶»à·€à¶«à¶­à·à·€ à¶´à·à·„à·à¶¯à·’à¶½à·’ à¶šà¶»à¶±à·Šà¶±.', category: 'lab_results' as const },
      ],
    };
  }
  if (language === 'ta') {
    return {
      extractedData: MOCK_EXTRACTED_DATA_TA,
      timeline: MOCK_TIMELINE_TA,
      patient: MOCK_PATIENT,
      interactions: MOCK_INTERACTIONS_TA,
      alerts: MOCK_ALERTS_TA,
      overallRiskLevel: 'critical' as const,
      crossCheckSummary: MOCK_CROSS_CHECK_SUMMARY_TA,
      trends: MOCK_TRENDS_TA,
      trendsSummary: MOCK_TRENDS_SUMMARY_TA,
      suggestedQuestions: [
        { text: 'à®Žà®©à®¤à¯ à®®à®°à¯à®¨à¯à®¤à¯à®•à®³à¯à®•à¯à®•à¯ à®‡à®Ÿà¯ˆà®¯à¯‡ à®à®¤à¯‡à®©à¯à®®à¯ à®ªà®•à¯à®• à®µà®¿à®³à¯ˆà®µà¯à®•à®³à¯ / à®¤à¯Šà®Ÿà®°à¯à®ªà¯à®•à®³à¯ à®‰à®³à¯à®³à®¤à®¾?', category: 'medications' as const },
        { text: 'à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®’à®µà¯à®µà®¾à®®à¯ˆ à®‡à®°à¯à®¨à¯à®¤à®ªà¯‹à®¤à®¿à®²à¯à®®à¯ à®Žà®©à®•à¯à®•à¯ à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à®¾?', category: 'allergies' as const },
        { text: 'à®Žà®©à®¤à¯ à®šà®¿à®±à¯à®¨à¯€à®°à®• à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®Ÿà®¿à®©à¯ (à®•à®¿à®°à®¿à®¯à¯‡à®Ÿà¯à®Ÿà®¿à®©à®¿à®©à¯) à®ªà¯‹à®•à¯à®•à¯ à®Žà®©à¯à®©?', category: 'lab_results' as const },
        { text: 'à®Žà®©à®¤à¯ à®‡à®°à®¤à¯à®¤ à®šà®°à¯à®•à¯à®•à®°à¯ˆ (HbA1c) à®ªà¯‹à®•à¯à®•à¯ˆ à®µà®¿à®³à®•à¯à®•à¯à®™à¯à®•à®³à¯.', category: 'lab_results' as const },
      ],
    };
  }
  return {
    extractedData: MOCK_EXTRACTED_DATA,
    timeline: MOCK_TIMELINE,
    patient: MOCK_PATIENT,
    interactions: MOCK_INTERACTIONS,
    alerts: MOCK_ALERTS,
    overallRiskLevel: 'critical' as const,
    crossCheckSummary: MOCK_CROSS_CHECK_SUMMARY,
    trends: MOCK_TRENDS,
    trendsSummary: MOCK_TRENDS_SUMMARY,
    suggestedQuestions: [
      { text: 'Are there any drug interactions in my prescriptions?', category: 'medications' as const },
      { text: 'Did I get prescribed Amoxicillin despite my Penicillin allergy?', category: 'allergies' as const },
      { text: 'What is the trend for my kidney function (creatinine)?', category: 'lab_results' as const },
      { text: 'Explain my diabetes blood sugar trend (HbA1c).', category: 'lab_results' as const },
    ],
  };
}

// ============================================================
// Conversational Q&A logic for Mock Mode
// ============================================================
export function answerQuestionMock(question: string, language: 'en' | 'si' | 'ta' = 'en'): {
  answer: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  sourceDocuments: string[];
  shouldConsultDoctor: boolean;
  isHighRisk: boolean;
  suggestedFollowUp: string[];
} {
  const q = question.toLowerCase();

  if (language === 'si') {
    if (q.includes('allergy') || q.includes('amoxicillin') || q.includes('penicillin') || q.includes('à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶š')) {
      return {
        answer: "à¶”à·€à·Š, 2024 à¶”à¶šà·Šà¶­à·à¶¶à¶»à·Š 15 à·€à¶± à¶¯à·’à¶± à·ƒà¶§à·„à¶±à·Š à·€à·– à¶”à¶¶à¶œà·š à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š (Penicillin) à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€ à¶­à·’à¶¶à·’à¶ºà¶¯à·“à¶­à·Š, Dr. Robert Chen à·€à·’à·ƒà·’à¶±à·Š 2025 à¶¸à·à¶»à·Šà¶­à·” 05 à·€à¶± à¶¯à·’à¶± Amoxicillin 500mg à¶–à·‚à¶°à¶º à¶±à·’à¶»à·Šà¶¯à·šà· à¶šà¶» à¶‡à¶­. Amoxicillin à¶ºà¶±à·” à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶šà·à¶«à·Šà¶©à¶ºà·š à¶–à·‚à¶°à¶ºà¶šà·Š à·€à¶± à¶…à¶­à¶» à¶‘à¶º à¶œà·à¶±à·“à¶¸à·™à¶±à·Š à¶¶à¶»à¶´à¶­à¶½ à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à· à¶‡à¶­à·’à·€à·’à¶º à·„à·à¶š.",
        confidenceScore: 99,
        confidenceLevel: 'high',
        sourceDocuments: ['Lab Report (2024-10-15)', 'Prescription (2025-03-05)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "à¶¸à¶¸ à¶¯à·à¶±à¶§à¶¸à¶­à·Š Amoxicillin à¶œà·à¶±à·“à¶¸ à¶†à¶»à¶¸à·Šà¶· à¶šà¶» à¶‡à¶­à·Šà¶±à¶¸à·Š à¶šà·”à¶¸à¶šà·Š à¶šà·… à¶ºà·”à¶­à·”à¶¯?",
          "à¶¸à¶œà·š à·ƒà¶ºà·’à¶±à·ƒà·Š à¶…à¶¸à·à¶»à·”à·€ à·ƒà¶³à·„à· à¶†à¶»à¶šà·Šà·‚à·’à¶­ à·€à·’à¶šà¶½à·Šà¶´ à¶´à·Šâ€à¶»à¶­à·’à¶¢à·“à·€à¶š à¶–à·‚à¶°à¶º à¶šà·”à¶¸à¶šà·Šà¶¯?",
        ],
      };
    }
    if (q.includes('interaction') || q.includes('lisinopril') || q.includes('spironolactone') || q.includes('potassium') || q.includes('à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà·')) {
      return {
        answer: "Lisinopril à·ƒà·„ Spironolactone à¶…à¶­à¶» à¶…à¶­à·’à·à¶º à¶¶à¶»à¶´à¶­à¶½ à¶–à·‚à¶° à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà·à·€à¶šà·Š à¶´à·€à¶­à·“. à¶–à·‚à¶° à¶¯à·™à¶šà¶¸ à¶»à·”à¶°à·’à¶»à¶ºà·š à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º à¶‰à·„à·… à¶¯à¶¸à¶± à¶…à¶­à¶» à¶”à¶¶à¶œà·š à¶…à¶½à·”à¶­à·Šà¶¸ à¶´à¶»à·“à¶šà·Šà·‚à¶« à¶…à¶±à·”à·€ à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸ 5.6 mEq/L à¶¯à¶šà·Šà·€à· à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­ (Hyperkalemia).",
        confidenceScore: 98,
        confidenceLevel: 'high',
        sourceDocuments: ['Prescription (2025-03-05)', 'Lab Report (2025-05-12)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "Lisinopril 20mg à·ƒà·„ Spironolactone à¶‘à¶šà¶§ à¶œà·à¶±à·“à¶¸ à·ƒà·”à¶¯à·”à·ƒà·”à¶¯?",
          "à¶‰à·„à·… à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š à¶¸à¶§à·Šà¶§à¶¸à¶š (Hyperkalemic) à¶½à¶šà·Šà·‚à¶« à¶¸à·œà¶±à·€à·à¶¯?",
        ],
      };
    }
    return {
      answer: "à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶± à¶½à¶¯ à·€à·à¶»à·Šà¶­à· à¶…à¶±à·”à·€, John Doe (à·€à¶ºà·ƒ 62) à·„à¶§ à¶…à¶°à·’ à¶»à·”à¶°à·’à¶» à¶´à·“à¶©à¶±à¶º à·ƒà·„ à¶¯à·™à·€à¶± à·€à¶»à·Šà¶œà¶ºà·š à¶¯à·’à¶ºà·€à·à¶©à·’à¶ºà·à·€ à¶´à·€à¶­à·“. Lisinopril à·ƒà·„ Spironolactone à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà·à·€ à¶±à·’à·ƒà· à¶´à·œà¶§à·‘à·ƒà·’à¶ºà¶¸à·Š (5.6 mEq/L) à·ƒà·„ à¶šà·Šâ€à¶»à·’à¶ºà¶§à·’à¶±à·’à¶±à·Š (1.4 mg/dL) à¶‰à·„à·… à¶œà·œà·ƒà·Š à¶‡à¶­à·’ à¶…à¶­à¶», à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€ à¶­à·’à¶¶à·’à¶ºà¶¯à·“à¶­à·Š Amoxicillin à¶½à¶¶à·à¶¯à·“ à¶‡à¶­. à¶šà¶»à·”à¶«à·à¶šà¶» à·€à·„à·à¶¸ à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·™à¶šà·” à·„à¶¸à·”à·€à¶±à·Šà¶±.",
      confidenceScore: 85,
      confidenceLevel: 'medium',
      sourceDocuments: ['à·ƒà·’à¶ºà¶½à·”à¶¸ à¶‹à¶©à·”à¶œà¶­ à¶šà·… à·€à·à¶»à·Šà¶­à·'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "Lisinopril à·ƒà·„ Spironolactone à¶…à¶±à·Šà¶­à¶»à·Šà¶šà·Šâ€à¶»à·’à¶ºà·à·€ à¶´à·à·„à·à¶¯à·’à¶½à·’ à¶šà¶»à¶±à·Šà¶±.",
        "à¶´à·™à¶±à·’à·ƒà·’à¶½à·’à¶±à·Š à¶…à·ƒà·à¶­à·Šà¶¸à·’à¶šà¶­à·à·€ à¶­à·’à¶¶à·’à¶ºà¶¯à·“à¶­à·Š Amoxicillin à¶½à¶¶à·à¶¯à·“ à¶­à·’à¶¶à·šà¶¯?",
      ],
    };
  }

  if (language === 'ta') {
    if (q.includes('allergy') || q.includes('amoxicillin') || q.includes('penicillin') || q.includes('à®’à®µà¯à®µà®¾à®®à¯ˆ')) {
      return {
        answer: "à®†à®®à¯, à®…à®•à¯à®Ÿà¯‹à®ªà®°à¯ 15, 2024 à®‡à®²à¯ à®ªà®¤à®¿à®µà®¾à®© à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®’à®µà¯à®µà®¾à®®à¯ˆ à®‡à®°à¯à®¨à¯à®¤à®ªà¯‹à®¤à®¿à®²à¯à®®à¯, à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®°à®¾à®ªà®°à¯à®Ÿà¯ à®šà¯†à®©à¯ à®®à®¾à®°à¯à®šà¯ 05, 2025 à®…à®©à¯à®±à¯ à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ 500mg à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®¤à¯à®¤à¯à®³à¯à®³à®¾à®°à¯. à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®µà®•à¯ˆà®¯à¯ˆà®šà¯ à®šà¯‡à®°à¯à®¨à¯à®¤à®¤à¯ à®Žà®©à¯à®ªà®¤à®¾à®²à¯ à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®© à®’à®µà¯à®µà®¾à®®à¯ˆ à®Žà®¤à®¿à®°à¯à®µà®¿à®©à¯ˆà®¯à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®¤à¯à®¤à®•à¯à®•à¯‚à®Ÿà¯à®®à¯.",
        confidenceScore: 99,
        confidenceLevel: 'high',
        sourceDocuments: ['Lab Report (2024-10-15)', 'Prescription (2025-03-05)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "à®¨à®¾à®©à¯ à®à®±à¯à®•à®©à®µà¯‡ à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®Žà®Ÿà¯à®•à¯à®• à®†à®°à®®à¯à®ªà®¿à®¤à¯à®¤à¯à®µà®¿à®Ÿà¯à®Ÿà®¾à®²à¯ à®Žà®©à¯à®© à®šà¯†à®¯à¯à®µà®¤à¯?",
          "à®Žà®©à®•à¯à®•à¯ à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà®¾à®© à®®à®¾à®±à¯à®±à¯ à®¨à¯à®£à¯à®£à¯à®¯à®¿à®°à¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà®¿ à®Žà®¤à¯?",
        ],
      };
    }
    if (q.includes('interaction') || q.includes('lisinopril') || q.includes('spironolactone') || q.includes('potassium') || q.includes('à®¤à¯Šà®Ÿà®°à¯à®ªà¯')) {
      return {
        answer: "à®²à®¿à®šà®¿à®©à¯‹à®ªà¯à®°à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¸à¯à®ªà¯ˆà®°à¯‹à®©à¯‹à®²à®¾à®•à¯à®Ÿà¯‹à®©à¯ à®‡à®Ÿà¯ˆà®¯à¯‡ à®†à®ªà®¤à¯à®¤à®¾à®© à®®à®°à¯à®¨à¯à®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®‰à®³à¯à®³à®¤à¯. à®‡à®°à®£à¯à®Ÿà¯ à®®à®°à¯à®¨à¯à®¤à¯à®•à®³à¯à®®à¯ à®‡à®°à®¤à¯à®¤à®¤à¯à®¤à®¿à®²à¯ à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà¯ˆ à®‰à®¯à®°à¯à®¤à¯à®¤à¯à®•à®¿à®©à¯à®±à®© (5.6 mEq/L). à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
        confidenceScore: 98,
        confidenceLevel: 'high',
        sourceDocuments: ['Prescription (2025-03-05)', 'Lab Report (2025-05-12)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "à®…à®¤à®¿à®• à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ à®…à®³à®µà®¿à®©à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ à®Žà®©à¯à®©?",
          "à®¸à¯à®ªà¯ˆà®°à¯‹à®©à¯‹à®²à®¾à®•à¯à®Ÿà¯‹à®©à¯ˆ à®¯à®¾à®°à¯ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®¤à¯à®¤à®¾à®°à¯à®•à®³à¯?",
        ],
      };
    }
    return {
      answer: "à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿ à®†à®µà®£à®™à¯à®•à®³à®¿à®©à¯à®ªà®Ÿà®¿, à®œà®¾à®©à¯ à®Ÿà¯‹ (62) à®‰à®¯à®°à¯ à®‡à®°à®¤à¯à®¤ à®…à®´à¯à®¤à¯à®¤à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®Ÿà¯ˆà®ªà¯ 2 à®¨à¯€à®°à®¿à®´à®¿à®µà¯ à®¨à¯‹à®¯à®¾à®²à¯ à®ªà®¾à®¤à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¾à®°à¯. à®²à®¿à®šà®¿à®©à¯‹à®ªà¯à®°à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¸à¯à®ªà¯ˆà®°à¯‹à®©à¯‹à®²à®¾à®•à¯à®Ÿà¯‹à®©à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®•à®¾à®°à®£à®®à®¾à®• à®ªà¯Šà®Ÿà¯à®Ÿà®¾à®šà®¿à®¯à®®à¯ (5.6 mEq/L) à®‰à®¯à®°à¯à®¨à¯à®¤à¯à®³à¯à®³à®¤à¯. à®ªà¯†à®©à®¿à®šà®¿à®²à®¿à®©à¯ à®’à®µà¯à®µà®¾à®®à¯ˆ à®‡à®°à¯à®¨à¯à®¤à®ªà¯‹à®¤à®¿à®²à¯à®®à¯ à®…à®®à¯‹à®•à¯à®šà®¿à®šà®¿à®²à®¿à®©à¯ à®µà®´à®™à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯. à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
      confidenceScore: 85,
      confidenceLevel: 'medium',
      sourceDocuments: ['à®…à®©à¯ˆà®¤à¯à®¤à¯ à®†à®µà®£à®™à¯à®•à®³à¯à®®à¯'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "à®®à®°à¯à®¨à¯à®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯à®•à®³à¯ˆ à®µà®¿à®³à®•à¯à®•à¯à®™à¯à®•à®³à¯.",
        "à®Žà®©à®¤à¯ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯ˆ à®šà¯à®°à¯à®•à¯à®•à®®à®¾à®•à®•à¯ à®•à¯‚à®±à¯à®™à¯à®•à®³à¯.",
      ],
    };
  }

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




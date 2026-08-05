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
// Sinhala Mock Data
// ============================================================
export const MOCK_CROSS_CHECK_SUMMARY_SI = "අතිශය බරපතල සෞඛ්‍ය ගැටලු දෙකක් හඳුනාගෙන ඇත. පළමුව, Lisinopril සහ Spironolactone අතර අතිශය අවදානම් ඖෂධ අන්තර්ක්‍රියාවක් නිසා රුධිරයේ පොටෑසියම් මට්ටම (Hyperkalemia, 5.6 mEq/L) ඉහළ ගොස් ඇත. දෙවනුව, පෙනිසිලින් (Penicillin) අසාත්මිකතාවයක් තිබියදීත් Amoxicillin ඖෂධය නිර්දේශ කර ඇත. තවද Lisinopril 10mg සහ 20mg මාත්‍රා දෙකම සටහන්ව තිබීමෙන් ඖෂධ මාත්‍රාව දෙගුණ වීමේ අවදානමක් පවතී.";

export const MOCK_TRENDS_SUMMARY_SI = "මාස 7 ක කාලයක් තුළ රෝගියාගේ රසායනාගාර වාර්තා විශ්ලේෂණය කිරීමේදී ප්‍රධාන ප්‍රවණතා කිහිපයක් දක්නට ලැබේ. HbA1c අගය 6.2% සිට 7.4% දක්වා අඛණ්ඩව ඉහළ ගොස් ඇති අතර, සීරම් ක්‍රියටිනින් (Creatinine) අගය 1.4 mg/dL දක්වා ඉහළ ගොස් වකුගඩු ආතතිය පෙන්නුම් කරයි. පොටෑසියම් අගය 5.6 mEq/L දක්වා ඉහළ ගොස් ඇත.";

export const MOCK_INTERACTIONS_SI: DrugInteraction[] = [
  {
    id: 'mock-int-1',
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'critical',
    type: 'interaction',
    description: 'Lisinopril සහ Spironolactone එකවර භාවිතය නිසා රුධිරයේ පොටෑසියම් මට්ටම (Hyperkalemia) අතිශය බරපතල ලෙස ඉහළ යාමේ අවදානමක් ඇත. ඖෂධ දෙකම වකුගඩු මගින් පොටෑසියම් පිටවීම වළක්වයි.',
    mechanism: 'Lisinopril මගින් ඇන්ජියෝටෙන්සින් එන්සයිමය වළක්වන අතර Spironolactone මගින් ඇල්ඩොස්ටෙරෝන් ප්‍රතිග්‍රාහක අවහිර කරයි.',
    recommendation: 'වහාම ඔබගේ වෛද්‍යවරයා හමුවී ඖෂධ සමාලෝචනය කරගන්න. රුධිර පොටෑසියම් මට්ටම (5.6 mEq/L) ඉහළ ගොස් ඇති බැවින් විකල්ප ඖෂධයක් භාවිතය සුදුසුය.',
    affectedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    confidenceScore: 98,
  },
  {
    id: 'mock-int-2',
    drug1: 'Amoxicillin',
    drug2: 'Penicillin (Allergy)',
    severity: 'critical',
    type: 'allergy_conflict',
    description: 'ඔබට පෙනිසිලින් (Penicillin) අසාත්මිකතාවයක් ඇති බව සටහන්ව තිබියදී Amoxicillin ඖෂධය ලබාදී ඇත. Amoxicillin යනු පෙනිසිලින් කාණ්ඩයේ ඖෂධයක් බැවින් බරපතල අසාත්මිකතා ඇතිවිය හැක.',
    mechanism: 'පෙනිසිලින් සහ Amoxicillin අතර රසායනික ව්‍යුහය සමාන බැවින් ප්‍රතිශක්තිකරණ පද්ධතිය මගින් අසාත්මික ප්‍රතික්‍රියාවක් ඇති කරයි.',
    recommendation: 'ඔබ තවමත් Amoxicillin ලබා ගැනීම ආරම්භ කර නොමැති නම් එය නොගන්න. වහාම වෛද්‍යවරයා හමුවී වෙනත් කාණ්ඩයක ප්‍රතිජීවක (Antibiotic) ඖෂධයක් ලබාගන්න.',
    affectedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    confidenceScore: 99,
  },
  {
    id: 'mock-int-3',
    drug1: 'Lisinopril 10mg',
    drug2: 'Lisinopril 20mg',
    severity: 'major',
    type: 'duplicate',
    description: 'Lisinopril 10mg සහ Lisinopril 20mg යන ඖෂධ මාත්‍රා දෙකම ලබාදී ඇති බැවින් ඖෂධ මාත්‍රාව දෙගුණ වීමේ අවදානමක් ඇත.',
    recommendation: 'වෛද්‍යවරයාගෙන් 10mg මාත්‍රාව නතර කර 20mg මාත්‍රාව පමණක් ගත යුතුද යන්න තහවුරු කරගන්න.',
    affectedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    confidenceScore: 92,
  },
];

export const MOCK_ALERTS_SI: Alert[] = [
  {
    id: 'mock-alert-1',
    type: 'drug_interaction',
    severity: 'critical',
    title: 'Lisinopril ↔ Spironolactone අන්තර්ක්‍රියාව',
    description: 'ඖෂධ දෙකම භාවිතය නිසා පොටෑසියම් මට්ටම 5.6 mEq/L දක්වා ඉහළ ගොස් ඇත (Hyperkalemia).',
    recommendation: 'වහාම වෛද්‍යවරයා හමුවී Spironolactone ඖෂධය වෙනස් කිරීම හෝ මාත්‍රාව අඩු කිරීම පිළිබඳව උපදෙස් ලබාගන්න.',
    confidenceScore: 98,
    relatedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    timestamp: '2025-05-13T08:00:00Z',
  },
  {
    id: 'mock-alert-2',
    type: 'allergy_warning',
    severity: 'critical',
    title: 'අසාත්මිකතා අවදානම: Amoxicillin ලබාදී ඇත',
    description: 'Amoxicillin යනු පෙනිසිලින් කාණ්ඩයේ ඖෂධයක් වන අතර එය ඔබගේ පෙනිසිලින් අසාත්මිකතාව හා ගැටේ.',
    recommendation: 'Amoxicillin භාවිතය නතර කර වහාම වෙනත් ප්‍රතිජීවකයක් සඳහා වෛද්‍යවරයා අමතන්න.',
    confidenceScore: 99,
    relatedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
  },
  {
    id: 'mock-alert-3',
    type: 'duplicate_prescription',
    severity: 'major',
    title: 'දෙගුණ වූ Lisinopril ඖෂධ සටහන',
    description: 'Dr. Jenkins විසින් 10mg සහ Dr. Chen විසින් 20mg ලබාදී ඇත. දෙකම භාවිතයෙන් රුධිර පීඩනය අධික ලෙස අඩුවිය හැක.',
    recommendation: 'වෛද්‍යවරයා අමතා 20mg මාත්‍රාව පමණක් ගත යුතුදැයි තහවුරු කරගන්න.',
    confidenceScore: 92,
    relatedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
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
    explanation: "ඔබගේ HbA1c අගය අවසාන පරීක්ෂණ 3 තුළ 6.2% සිට 7.4% දක්වා අඛණ්ඩව ඉහළ ගොස් ඇත. 5.6% ට වැඩි HbA1c අගයක් ඉහළ මට්ටමක් වන අතර, 6.5% ට වැඩි අගයන් දෙවන වර්ගයේ දියවැඩියාව පෙන්නුම් කරයි.",
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
    explanation: "ඔබගේ සීරම් ක්‍රියටිනින් (Creatinine) අගය 0.9 mg/dL සිට 1.4 mg/dL දක්වා ඉහළ ගොස් ඇත. මෙයින් වකුගඩු වල පෙරීමේ ක්‍රියාකාරිත්වය අඩුවීමක් (වකුගඩු ආතතිය) පෙන්නුම් කරයි.",
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
    explanation: "ඔබගේ රුධිර පොටෑසියම් මට්ටම සාමාන්‍ය 4.1 mEq/L සිට 5.6 mEq/L දක්වා ඉහළ ගොස් ඇත. මෙය Lisinopril සහ Spironolactone ඖෂධ එකවර භාවිතය නිසා සිදුවූවකි.",
    isWorrying: true,
    confidenceScore: 97,
  },
];

export const MOCK_EXTRACTED_DATA_SI: ExtractedData[] = MOCK_EXTRACTED_DATA.map((doc) => ({
  ...doc,
  rawSummary: doc.documentType === 'lab_report'
    ? `රසායනාගාර වාර්තාව - ${doc.facility} (${doc.date}). HbA1c සහ ක්‍රියටිනින් අගයන් ඇතුළත් වේ.`
    : `ඖෂධ පත්‍රය - ${doc.provider} (${doc.date}). ඖෂධ වට්ටෝරුව සටහන්ව ඇත.`,
}));

export const MOCK_TIMELINE_SI: TimelineEvent[] = MOCK_TIMELINE.map((evt, idx) => ({
  ...evt,
  summary: MOCK_EXTRACTED_DATA_SI[idx]?.rawSummary || evt.summary,
}));

// ============================================================
// Tamil Mock Data
// ============================================================
export const MOCK_CROSS_CHECK_SUMMARY_TA = "இரண்டு முக்கியமான பாதுகாப்பு கவலைகள் கண்டறியப்பட்டுள்ளன. முதலாவதாக, லிசினோப்ரில் மற்றும் ஸ்பைரோனோலாக்டோன் இடையேயான தொடர்பு பொட்டாசியம் அளவை (5.6 mEq/L) உயர்த்துகிறது. இரண்டாவதாக, பெனிசிலின் ஒவ்வாமை இருந்தபோதிலும் அமோக்சிசிலின் பரிந்துரைக்கப்பட்டுள்ளது.";

export const MOCK_TRENDS_SUMMARY_TA = "7 மாத காலத்தில் நோயாளியின் ஆய்வக முடிவுகளின் பகுப்பாய்வு பல குறிப்பிடத்தக்க போக்குகளை வெளிப்படுத்துகிறது. HbA1c (6.2% முதல் 7.4% வரை) சீராக உயர்ந்து டைப் 2 நீரிழிவு நோயைக் காட்டுகிறது. சீரம் கிரியேட்டினின் 1.4 mg/dL ஆக உயர்ந்து சிறுநீரக அழுத்தத்தைக் காட்டுகிறது.";

export const MOCK_INTERACTIONS_TA: DrugInteraction[] = [
  {
    id: 'mock-int-1',
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'critical',
    type: 'interaction',
    description: 'லிசினோப்ரில் மற்றும் ஸ்பைரோனோலாக்டோன் ஆகியவற்றின் ஒரே நேர பயன்பாடு இரத்தத்தில் பொட்டாசியம் அளவை (Hyperkalemia) கணிசமாக அதிகரிக்கும் ஆபத்தைக் கொண்டுள்ளது.',
    mechanism: 'இரு மருந்துகளும் சிறுநீரகங்கள் மூலம் பொட்டாசியம் வெளியேற்றப்படுவதைக் குறைக்கின்றன.',
    recommendation: 'உடனடியாக உங்கள் மருத்துவரை அணுகி மருந்துகளை மறுபரிசீலனை செய்யவும். இரத்த பொட்டாசியம் அளவைக் கண்காணிக்க வேண்டும்.',
    affectedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    confidenceScore: 98,
  },
  {
    id: 'mock-int-2',
    drug1: 'Amoxicillin',
    drug2: 'Penicillin (Allergy)',
    severity: 'critical',
    type: 'allergy_conflict',
    description: 'உங்களுக்கு பெனிசிலின் ஒவ்வாமை உள்ளது. அமோக்சிசிலின் பெனிசிலின் வகையைச் சேர்ந்தது என்பதால் கடுமையான ஒவ்வாமை எதிர்வினையை ஏற்படுத்தக்கூடும்.',
    mechanism: 'பெனிசிலின் மற்றும் அமோக்சிசிலின் வேதியியல் அமைப்பு ஒத்ததாக இருப்பதால் ஒவ்வாமை ஏற்படுகிறது.',
    recommendation: 'அமோக்சிசிலின் உட்கொள்வதை நிறுத்திவிட்டு, மாற்று நுண்ணுயிர் எதிர்ப்பிக்கு உடனடியாக உங்கள் மருத்துவரைத் தொடர்பு கொள்ளவும்.',
    affectedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    confidenceScore: 99,
  },
  {
    id: 'mock-int-3',
    drug1: 'Lisinopril 10mg',
    drug2: 'Lisinopril 20mg',
    severity: 'major',
    type: 'duplicate',
    description: 'லிசினோப்ரில் 10mg மற்றும் 20mg பரிந்துரைகளுக்கு இடையே முரண்பாடு உள்ளது.',
    recommendation: '10mg அளவுக்குப் பதிலாக 20mg முற்றிலும் மாற்றப்பட்டுள்ளதா என்பதை உங்கள் மருத்துவரிடம் உறுதிப்படுத்தவும்.',
    affectedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    confidenceScore: 92,
  },
];

export const MOCK_ALERTS_TA: Alert[] = [
  {
    id: 'mock-alert-1',
    type: 'drug_interaction',
    severity: 'critical',
    title: 'Lisinopril ↔ Spironolactone தொடர்பு',
    description: 'கூட்டு பயன்பாடு பொட்டாசியத்தை தக்கவைத்து, அதிக பொட்டாசியம் அளவிற்கு (Hyperkalemia) வழிவகுக்கிறது (5.6 mEq/L).',
    recommendation: 'மருந்தை மாற்றுவது அல்லது அளவைக் குறைப்பது குறித்து உடனடியாக மருத்துவரை அணுகவும்.',
    confidenceScore: 98,
    relatedDocuments: ['Prescription - 2025-03-05', 'Lab Report - 2025-05-12'],
    timestamp: '2025-05-13T08:00:00Z',
  },
  {
    id: 'mock-alert-2',
    type: 'allergy_warning',
    severity: 'critical',
    title: 'ஒவ்வாமை எச்சரிக்கை: அமோக்சிசிலின் வழங்கப்பட்டது',
    description: 'அமோக்சிசிலின் பெனிசிலின் வகுப்பைச் சேர்ந்தது, இது உங்கள் பெனிசிலின் ஒவ்வாமையுடன் முரண்படுகிறது.',
    recommendation: 'அமோக்சிசிலின் எடுப்பதை நிறுத்திவிட்டு உடனடியாக மருத்துவரை அணுகவும்.',
    confidenceScore: 99,
    relatedDocuments: ['Lab Report - 2024-10-15', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
  },
  {
    id: 'mock-alert-3',
    type: 'duplicate_prescription',
    severity: 'major',
    title: 'இரட்டை Lisinopril மருந்து பரிந்துரை',
    description: 'டாக்டர் ஜென்கின்ஸ் 10mg மற்றும் டாக்டர் சென் 20mg வழங்கியுள்ளனர். இது இரட்டிப்பு அளவை ஏற்படுத்தக்கூடும்.',
    recommendation: '20mg மட்டுமே எடுக்க வேண்டுமா என்பதை மருத்துவரிடம் உறுதிப்படுத்தவும்.',
    confidenceScore: 92,
    relatedDocuments: ['Prescription - 2024-12-10', 'Prescription - 2025-03-05'],
    timestamp: '2025-05-13T08:00:00Z',
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
    explanation: "உங்கள் HbA1c கடைசி 3 வருகைகளில் 6.2% இலிருந்து 7.4% ஆக உயர்ந்துள்ளது. 5.6% க்கு மேல் இருப்பது அதிகம், மேலும் 6.5% க்கு மேல் டைப் 2 நீரிழிவு நோயைக் குறிக்கிறது.",
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
    explanation: "உங்கள் சீரம் கிரியேட்டினின் 0.9 mg/dL இலிருந்து 1.4 mg/dL ஆக உயர்ந்துள்ளது. இது சிறுநீரக வடிகட்டுதல் செயல்பாடு குறைவதைக் குறிக்கிறது (சிறுநீரக அழுத்தம்).",
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
    explanation: "உங்கள் பொட்டாசியம் அளவு 4.1 mEq/L இலிருந்து 5.6 mEq/L ஆக உயர்ந்துள்ளது. இது லிசினோப்ரில் மற்றும் ஸ்பைரோனோலாக்டோன் ஆகியவற்றை ஒன்றாக எடுத்துக்கொள்வதன் நேரடி விளைவாகும்.",
    isWorrying: true,
    confidenceScore: 97,
  },
];

export const MOCK_EXTRACTED_DATA_TA: ExtractedData[] = MOCK_EXTRACTED_DATA.map((doc) => ({
  ...doc,
  rawSummary: doc.documentType === 'lab_report'
    ? `ஆய்வக அறிக்கை - ${doc.facility} (${doc.date}). HbA1c மற்றும் கிரியேட்டினின் ஆகியவை அடங்கும்.`
    : `மருந்து பரிந்துரை - ${doc.provider} (${doc.date}).`,
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
        { text: 'මගේ ඖෂධ අතර කිසියම් අතුරු ආබාධ / අන්තර්ක්‍රියා තිබේද?', category: 'medications' as const },
        { text: 'පෙනිසිලින් අසාත්මිකතාව තිබියදීත් මට Amoxicillin නිර්දේශ කර තිබේද?', category: 'allergies' as const },
        { text: 'මගේ වකුගඩු ක්‍රියාකාරිත්වය (Creatinine) පිළිබඳ ප්‍රවණතාව කුමක්ද?', category: 'lab_results' as const },
        { text: 'මගේ රුධිර සීනි (HbA1c) ප්‍රවණතාව පැහැදිලි කරන්න.', category: 'lab_results' as const },
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
        { text: 'எனது மருந்துகளுக்கு இடையே ஏதேனும் பக்க விளைவுகள் / தொடர்புகள் உள்ளதா?', category: 'medications' as const },
        { text: 'பெனிசிலின் ஒவ்வாமை இருந்தபோதிலும் எனக்கு அமோக்சிசிலின் பரிந்துரைக்கப்பட்டதா?', category: 'allergies' as const },
        { text: 'எனது சிறுநீரக செயல்பாட்டின் (கிரியேட்டினின்) போக்கு என்ன?', category: 'lab_results' as const },
        { text: 'எனது இரத்த சர்க்கரை (HbA1c) போக்கை விளக்குங்கள்.', category: 'lab_results' as const },
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
    if (q.includes('allergy') || q.includes('amoxicillin') || q.includes('penicillin') || q.includes('අසාත්මික')) {
      return {
        answer: "ඔව්, 2024 ඔක්තෝබර් 15 වන දින සටහන් වූ ඔබගේ පෙනිසිලින් (Penicillin) අසාත්මිකතාව තිබියදීත්, Dr. Robert Chen විසින් 2025 මාර්තු 05 වන දින Amoxicillin 500mg ඖෂධය නිර්දේශ කර ඇත. Amoxicillin යනු පෙනිසිලින් කාණ්ඩයේ ඖෂධයක් වන අතර එය ගැනීමෙන් බරපතල අසාත්මිකතා ඇතිවිය හැක.",
        confidenceScore: 99,
        confidenceLevel: 'high',
        sourceDocuments: ['Lab Report (2024-10-15)', 'Prescription (2025-03-05)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "මම දැනටමත් Amoxicillin ගැනීම ආරම්භ කර ඇත්නම් කුමක් කළ යුතුද?",
          "මගේ සයිනස් අමාරුව සඳහා ආරක්ෂිත විකල්ප ප්‍රතිජීවක ඖෂධය කුමක්ද?",
        ],
      };
    }
    if (q.includes('interaction') || q.includes('lisinopril') || q.includes('spironolactone') || q.includes('potassium') || q.includes('අන්තර්ක්‍රියා')) {
      return {
        answer: "Lisinopril සහ Spironolactone අතර අතිශය බරපතල ඖෂධ අන්තර්ක්‍රියාවක් පවතී. ඖෂධ දෙකම රුධිරයේ පොටෑසියම් ප්‍රමාණය ඉහළ දමන අතර ඔබගේ අලුත්ම පරීක්ෂණ අනුව පොටෑසියම් මට්ටම 5.6 mEq/L දක්වා ඉහළ ගොස් ඇත (Hyperkalemia).",
        confidenceScore: 98,
        confidenceLevel: 'high',
        sourceDocuments: ['Prescription (2025-03-05)', 'Lab Report (2025-05-12)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "Lisinopril 20mg සහ Spironolactone එකට ගැනීම සුදුසුද?",
          "ඉහළ පොටෑසියම් මට්ටමක (Hyperkalemic) ලක්ෂණ මොනවාද?",
        ],
      };
    }
    return {
      answer: "උඩුගත කරන ලද වාර්තා අනුව, John Doe (වයස 62) හට අධි රුධිර පීඩනය සහ දෙවන වර්ගයේ දියවැඩියාව පවතී. Lisinopril සහ Spironolactone අන්තර්ක්‍රියාව නිසා පොටෑසියම් (5.6 mEq/L) සහ ක්‍රියටිනින් (1.4 mg/dL) ඉහළ ගොස් ඇති අතර, පෙනිසිලින් අසාත්මිකතාව තිබියදීත් Amoxicillin ලබාදී ඇත. කරුණාකර වහාම වෛද්‍යවරයෙකු හමුවන්න.",
      confidenceScore: 85,
      confidenceLevel: 'medium',
      sourceDocuments: ['සියලුම උඩුගත කළ වාර්තා'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "Lisinopril සහ Spironolactone අන්තර්ක්‍රියාව පැහැදිලි කරන්න.",
        "පෙනිසිලින් අසාත්මිකතාව තිබියදීත් Amoxicillin ලබාදී තිබේද?",
      ],
    };
  }

  if (language === 'ta') {
    if (q.includes('allergy') || q.includes('amoxicillin') || q.includes('penicillin') || q.includes('ஒவ்வாமை')) {
      return {
        answer: "ஆம், அக்டோபர் 15, 2024 இல் பதிவான பெனிசிலின் ஒவ்வாமை இருந்தபோதிலும், டாக்டர் ராபர்ட் சென் மார்ச் 05, 2025 அன்று அமோக்சிசிலின் 500mg பரிந்துரைத்துள்ளார். அமோக்சிசிலின் பெனிசிலின் வகையைச் சேர்ந்தது என்பதால் கடுமையான ஒவ்வாமை எதிர்வினையை ஏற்படுத்தக்கூடும்.",
        confidenceScore: 99,
        confidenceLevel: 'high',
        sourceDocuments: ['Lab Report (2024-10-15)', 'Prescription (2025-03-05)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "நான் ஏற்கனவே அமோக்சிசிலின் எடுக்க ஆரம்பித்துவிட்டால் என்ன செய்வது?",
          "எனக்கு பாதுகாப்பான மாற்று நுண்ணுயிர் எதிர்ப்பி எது?",
        ],
      };
    }
    if (q.includes('interaction') || q.includes('lisinopril') || q.includes('spironolactone') || q.includes('potassium') || q.includes('தொடர்பு')) {
      return {
        answer: "லிசினோப்ரில் மற்றும் ஸ்பைரோனோலாக்டோன் இடையே ஆபத்தான மருந்து தொடர்பு உள்ளது. இரண்டு மருந்துகளும் இரத்தத்தில் பொட்டாசியம் அளவை உயர்த்துகின்றன (5.6 mEq/L). உடனடியாக மருத்துவரை அணுகவும்.",
        confidenceScore: 98,
        confidenceLevel: 'high',
        sourceDocuments: ['Prescription (2025-03-05)', 'Lab Report (2025-05-12)'],
        shouldConsultDoctor: true,
        isHighRisk: true,
        suggestedFollowUp: [
          "அதிக பொட்டாசியம் அளவின் அறிகுறிகள் என்ன?",
          "ஸ்பைரோனோலாக்டோனை யார் பரிந்துரைத்தார்கள்?",
        ],
      };
    }
    return {
      answer: "பதிவேற்றப்பட்ட ஆவணங்களின்படி, ஜான் டோ (62) உயர் இரத்த அழுத்தம் மற்றும் டைப் 2 நீரிழிவு நோயால் பாதிக்கப்பட்டுள்ளார். லிசினோப்ரில் மற்றும் ஸ்பைரோனோலாக்டோன் தொடர்பு காரணமாக பொட்டாசியம் (5.6 mEq/L) உயர்ந்துள்ளது. பெனிசிலின் ஒவ்வாமை இருந்தபோதிலும் அமோக்சிசிலின் வழங்கப்பட்டுள்ளது. மருத்துவரை அணுகவும்.",
      confidenceScore: 85,
      confidenceLevel: 'medium',
      sourceDocuments: ['அனைத்து ஆவணங்களும்'],
      shouldConsultDoctor: true,
      isHighRisk: true,
      suggestedFollowUp: [
        "மருந்து தொடர்புகளை விளக்குங்கள்.",
        "எனது ஆய்வக முடிவுகளை சுருக்கமாகக் கூறுங்கள்.",
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

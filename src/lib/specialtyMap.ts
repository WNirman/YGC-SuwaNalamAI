/**
 * Infer the most relevant specialist from alert type + description text.
 * This is the deterministic fallback used in demo/mock mode.
 * In real mode, the AI (Groq/OpenAI) provides suggestedSpecialty directly.
 */
export function inferSpecialty(alertType: string, description: string): string {
  const t = `${alertType} ${description}`.toLowerCase();

  if (/dengue|ns1|platelet drop|thrombocytopen|petechiae|hemorrhagic/.test(t))
    return 'Infectious Disease Specialist / Consultant Physician';
  if (/malaria|plasmodium|tropical.fever|cyclical.fever/.test(t))
    return 'Infectious Disease Specialist / Tropical Medicine';
  if (/fever|infection|sepsis|typhoid|leptospirosis|rat.fever|viral|bacterial/.test(t))
    return 'Infectious Disease Specialist / Consultant Physician';

  if (/cardiac|heart|cardio|blood pressure|hypertension|ace inhibitor|arrhythmia|lisinopril|amlodipine/.test(t))
    return 'Cardiologist';
  if (/diabet|glucose|hba1c|insulin|metformin|endocrin|thyroid|hormone/.test(t))
    return 'Endocrinologist';
  if (/kidney|renal|creatinine|potassium|nephro|spironolactone|furosemide/.test(t))
    return 'Nephrologist';
  if (/liver|hepat|alt|ast|bilirubin|gastro|digestive/.test(t))
    return 'Gastroenterologist';
  if (/allerg|immunol|penicillin|amoxicillin|cephalosporin|rash|anaphyla|hives/.test(t))
    return 'Allergist / Immunologist';
  if (/pharmacist|duplicate|dosage.conflict|drug.interaction|polypharmacy/.test(t))
    return 'Clinical Pharmacist';
  if (/blood|anaemia|anemia|hemoglobin|haematol|warfarin|anticoagul|platelet/.test(t))
    return 'Hematologist';
  if (/lung|pulmon|asthma|respirat|salbutamol|inhaler|copd/.test(t))
    return 'Pulmonologist';
  if (/neuro|brain|seizure|epilep|migraine|parkinson/.test(t))
    return 'Neurologist';
  if (/bone|joint|arthritis|orthop|rheumat/.test(t))
    return 'Rheumatologist / Orthopedist';

  return 'General Practitioner';
}

/**
 * Convert a specialist name to an Overpass QL-friendly search regex
 * (used only when falling back to OpenStreetMap)
 */
export function specialtyToOsmRegex(specialty: string): string {
  const map: Record<string, string> = {
    'Cardiologist':                   'cardiology|heart|cardiac',
    'Endocrinologist':                'endocrinology|diabetes|diabetic',
    'Nephrologist':                   'nephrology|kidney',
    'Gastroenterologist':             'gastroenterology|digestive|gastro',
    'Allergist / Immunologist':       'allergy|immunology|allergist',
    'Clinical Pharmacist':            'pharmacy|pharmacist|chemist',
    'Hematologist':                   'haematology|hematology|blood',
    'Pulmonologist':                  'pulmonology|respiratory|lung',
    'Neurologist':                    'neurology|neuro|brain',
    'Rheumatologist / Orthopedist':   'rheumatology|orthopaedic|orthopedic',
    'General Practitioner':           'clinic|hospital|general|family.medicine',
  };
  return map[specialty] ?? 'clinic|hospital';
}

/**
 * Convert a specialist name to a Google Maps Places API text-search query
 * (used when GOOGLE_MAPS_API_KEY is set)
 */
export function specialtyToGoogleQuery(specialty: string, location: string): string {
  const specialistTerm = specialty === 'Clinical Pharmacist' ? 'pharmacy' : `${specialty} doctor`;
  return `${specialistTerm} near ${location}`;
}

/**
 * Map medical specialty to Google Places API (New) valid includedType category filter.
 * Google Places API v1 searchText accepts `includedType`.
 * Valid place types: 'hospital', 'doctor', 'pharmacy', 'medical_lab'
 */
export function specialtyToGooglePlaceType(specialty: string): string {
  const clean = specialty.toLowerCase();
  if (clean.includes('pharmacist') || clean.includes('pharmacy') || clean.includes('dispensary') || clean.includes('chemist')) {
    return 'pharmacy';
  }
  if (clean.includes('lab') || clean.includes('blood') || clean.includes('diagnostic') || clean.includes('pathology')) {
    return 'medical_lab';
  }
  if (clean.includes('practitioner') || clean.includes('general') || clean.includes('family') || clean.includes('clinic')) {
    return 'doctor';
  }
  return 'hospital';
}

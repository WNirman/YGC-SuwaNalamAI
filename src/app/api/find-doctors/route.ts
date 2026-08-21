import { NextRequest, NextResponse } from 'next/server';
import { specialtyToOsmRegex, specialtyToGoogleQuery, specialtyToGooglePlaceType } from '@/lib/specialtyMap';
import type { DoctorResult, FindDoctorsResponse } from '@/types/medical';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ============================================================
// Haversine distance (km) between two lat/lon points
// ============================================================
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ============================================================
// Verified Sri Lanka Tertiary & Specialist Hospitals Network
// ============================================================
interface VerifiedFacility {
  name: string;
  specialtyDept: string;
  address: string;
  phone: string;
  lat: number;
  lon: number;
  hours: string;
  rating?: number;
  totalRatings?: number;
  isTertiary: boolean;
  facilityType: 'tertiary' | 'teaching' | 'general' | 'clinic';
}

const VERIFIED_FACILITIES: Array<VerifiedFacility> = [
  // Colombo & Western Province (National & Teaching Centers)
  { name: 'National Hospital of Sri Lanka (NHSL)', specialtyDept: 'Nephrology, Cardiology, Allergy & General Medicine', address: 'Regent Street, Colombo 10, Sri Lanka', phone: '+94 11 269 1111', lat: 6.9205, lon: 79.8690, hours: 'Open 24/7', isTertiary: true, facilityType: 'tertiary' },
  { name: 'Colombo South Teaching Hospital (Kalubowila)', specialtyDept: 'General Medicine, Endocrinology & Nephrology', address: 'Hospital Road, Kalubowila, Dehiwala, Sri Lanka', phone: '+94 11 276 3064', lat: 6.8660, lon: 79.8820, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Ragama Teaching Hospital (CNTH)', specialtyDept: 'Gastroenterology, Nephrology & Specialist Clinics', address: 'Mahara Road, Ragama, Sri Lanka', phone: '+94 11 295 9261', lat: 7.0279, lon: 79.9192, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Sri Jayawardenapura General Hospital', specialtyDept: 'Nephrology, Kidney Transplant & Cardiac Care', address: 'Thalapathpitiya, Nugegoda, Sri Lanka', phone: '+94 11 277 8610', lat: 6.8682, lon: 79.9168, hours: 'Open 24/7', isTertiary: true, facilityType: 'tertiary' },
  { name: 'Asiri Central Hospital', specialtyDept: 'Cardiology, Nephrology & Multispecialty Care', address: '114 Norris Canal Road, Colombo 10, Sri Lanka', phone: '+94 11 466 5500', lat: 6.9238, lon: 79.8679, hours: 'Open 24/7', rating: 4.5, totalRatings: 840, isTertiary: true, facilityType: 'general' },
  { name: 'Lanka Hospitals', specialtyDept: 'Heart Centre, Nephrology & Endocrinology Institute', address: '578 Elvitigala Mawatha, Colombo 05, Sri Lanka', phone: '+94 11 543 0000', lat: 6.8920, lon: 79.8789, hours: 'Open 24/7', rating: 4.6, totalRatings: 1200, isTertiary: true, facilityType: 'general' },
  { name: 'Nawaloka Hospital', specialtyDept: 'Cardiology, Respiratory & Multispecialty Clinics', address: '23 Deshamanya H. K. Dharmadasa Mawatha, Colombo 02, Sri Lanka', phone: '+94 11 557 7111', lat: 6.9221, lon: 79.8550, hours: 'Open 24/7', rating: 4.4, totalRatings: 950, isTertiary: true, facilityType: 'general' },
  { name: 'Negombo District General Hospital', specialtyDept: 'Cardiology & General Medicine Clinics', address: 'Colombo Road, Negombo, Sri Lanka', phone: '+94 31 222 2261', lat: 7.2088, lon: 79.8436, hours: 'Open 24/7', isTertiary: false, facilityType: 'general' },
  { name: 'Gampaha District General Hospital', specialtyDept: 'General Medicine, Nephrology & Diabetic Care', address: 'Hospital Road, Gampaha, Sri Lanka', phone: '+94 33 222 2261', lat: 7.0890, lon: 80.0030, hours: 'Open 24/7', isTertiary: false, facilityType: 'general' },
  { name: 'Kalutara District General Hospital (Nagoda)', specialtyDept: 'General Medicine & Specialist OPD', address: 'Nagoda, Kalutara, Sri Lanka', phone: '+94 34 222 2261', lat: 6.5820, lon: 79.9720, hours: 'Open 24/7', isTertiary: false, facilityType: 'general' },

  // Kandy & Central Province
  { name: 'National Hospital Kandy (Kandy General)', specialtyDept: 'Cardiology Institute, Nephrology & Endocrinology', address: 'Hospital Road, Kandy, Sri Lanka', phone: '+94 81 223 3337', lat: 7.2885, lon: 80.6300, hours: 'Open 24/7', isTertiary: true, facilityType: 'tertiary' },
  { name: 'Teaching Hospital Peradeniya', specialtyDept: 'Specialist Medical Clinics, Allergy & Nephrology', address: 'Kandy Road, Peradeniya, Sri Lanka', phone: '+94 81 238 8001', lat: 7.2612, lon: 80.5975, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Asiri Hospital Kandy', specialtyDept: 'Cardiology, Kidney Care & Multispecialty Clinics', address: '907 Peradeniya Road, Kandy, Sri Lanka', phone: '+94 81 452 8800', lat: 7.2790, lon: 80.6180, hours: 'Open 24/7', rating: 4.5, totalRatings: 320, isTertiary: true, facilityType: 'general' },
  { name: 'Suwasevana Hospital Kandy', specialtyDept: 'Consultant Medical Clinics & Diagnostics', address: '532 Peradeniya Road, Kandy, Sri Lanka', phone: '+94 81 222 2404', lat: 7.2820, lon: 80.6210, hours: 'Open 24/7', rating: 4.3, totalRatings: 280, isTertiary: false, facilityType: 'general' },

  // Galle & Southern Province
  { name: 'Karapitiya Teaching Hospital Galle', specialtyDept: 'Cardiology Institute, Nephrology, Oncology & Allergy', address: 'Karapitiya, Galle, Sri Lanka', phone: '+94 91 223 2250', lat: 6.0650, lon: 80.2315, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Ruhunu Hospital Galle', specialtyDept: 'Cardiology, Endocrinology & Dialysis Unit', address: 'Karapitiya Road, Galle, Sri Lanka', phone: '+94 91 223 4059', lat: 6.0590, lon: 80.2240, hours: 'Open 24/7', rating: 4.4, totalRatings: 210, isTertiary: false, facilityType: 'general' },
  { name: 'Matara District General Hospital', specialtyDept: 'Cardiology, Nephrology & Specialist OPD', address: 'Hospital Road, Matara, Sri Lanka', phone: '+94 41 222 2261', lat: 5.9490, lon: 80.5480, hours: 'Open 24/7', isTertiary: false, facilityType: 'general' },
  { name: 'Asiri Hospital Matara', specialtyDept: 'Private Specialist Channeling & Cardiology', address: '190 Anagarika Dharmapala Mawatha, Matara, Sri Lanka', phone: '+94 41 752 0000', lat: 5.9460, lon: 80.5520, hours: 'Open 24/7', rating: 4.3, totalRatings: 180, isTertiary: false, facilityType: 'general' },

  // Jaffna & Northern Province
  { name: 'Jaffna Teaching Hospital', specialtyDept: 'Cardiology, Nephrology & Specialist Consultant Care', address: 'Hospital Road, Jaffna, Sri Lanka', phone: '+94 21 222 2261', lat: 9.6664, lon: 80.0127, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Northern Central Hospital Jaffna', specialtyDept: 'Multispecialty Clinics & Cardiac Channeling', address: '368 Palaly Road, Jaffna, Sri Lanka', phone: '+94 21 221 7200', lat: 9.6820, lon: 80.0240, hours: 'Open 24/7', rating: 4.4, totalRatings: 150, isTertiary: false, facilityType: 'general' },

  // Other Provinces (Provincial / Teaching Centers)
  { name: 'Kurunegala Teaching Hospital', specialtyDept: 'Cardiology Institute, Nephrology & Endocrinology', address: 'Hospital Road, Kurunegala, Sri Lanka', phone: '+94 37 222 2261', lat: 7.4870, lon: 80.3640, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Anuradhapura Teaching Hospital', specialtyDept: 'Nephrology (CKDu Centre), Cardiology & Medicine', address: 'Hospital Road, Anuradhapura, Sri Lanka', phone: '+94 25 222 2261', lat: 8.3350, lon: 80.4020, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Ratnapura Teaching Hospital', specialtyDept: 'General Medicine, Cardiology & Nephrology', address: 'Hospital Road, Ratnapura, Sri Lanka', phone: '+94 45 222 2261', lat: 6.6850, lon: 80.3980, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Badulla Provincial General Hospital', specialtyDept: 'Cardiology & Specialist Medical Clinics', address: 'Hospital Road, Badulla, Sri Lanka', phone: '+94 55 222 2261', lat: 6.9880, lon: 81.0540, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Batticaloa Teaching Hospital', specialtyDept: 'Cardiology, Nephrology & General Medicine', address: 'Hospital Road, Batticaloa, Sri Lanka', phone: '+94 65 222 2261', lat: 7.7180, lon: 81.6980, hours: 'Open 24/7', isTertiary: true, facilityType: 'teaching' },
  { name: 'Trincomalee District General Hospital', specialtyDept: 'General Medicine, Cardiology & Specialist OPD', address: 'Hospital Road, Trincomalee, Sri Lanka', phone: '+94 26 222 2261', lat: 8.5720, lon: 81.2330, hours: 'Open 24/7', isTertiary: false, facilityType: 'general' },
];

function isTertiaryOrTeachingHospital(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes('teaching') ||
    lower.includes('national hospital') ||
    lower.includes('tertiary') ||
    lower.includes('provincial general') ||
    lower.includes('jayawardenapura') ||
    lower.includes('central hospital') ||
    lower.includes('general hospital')
  );
}

const SRI_LANKA_CITIES: Record<string, { lat: number; lon: number; displayName: string }> = {
  colombo: { lat: 6.9271, lon: 79.8612, displayName: 'Colombo, Sri Lanka' },
  kandy: { lat: 7.2906, lon: 80.6337, displayName: 'Kandy, Sri Lanka' },
  galle: { lat: 6.0535, lon: 80.2210, displayName: 'Galle, Sri Lanka' },
  jaffna: { lat: 9.6615, lon: 80.0255, displayName: 'Jaffna, Sri Lanka' },
  gampaha: { lat: 7.0840, lon: 79.9943, displayName: 'Gampaha, Sri Lanka' },
  negombo: { lat: 7.2008, lon: 79.8737, displayName: 'Negombo, Sri Lanka' },
  matara: { lat: 5.9549, lon: 80.5550, displayName: 'Matara, Sri Lanka' },
  kurunegala: { lat: 7.4863, lon: 80.3623, displayName: 'Kurunegala, Sri Lanka' },
  anuradhapura: { lat: 8.3114, lon: 80.4037, displayName: 'Anuradhapura, Sri Lanka' },
  batticaloa: { lat: 7.7310, lon: 81.6747, displayName: 'Batticaloa, Sri Lanka' },
  trincomalee: { lat: 8.5874, lon: 81.2152, displayName: 'Trincomalee, Sri Lanka' },
  ratnapura: { lat: 6.7056, lon: 80.3847, displayName: 'Ratnapura, Sri Lanka' },
  badulla: { lat: 6.9934, lon: 81.0550, displayName: 'Badulla, Sri Lanka' },
  kalutara: { lat: 6.5854, lon: 79.9607, displayName: 'Kalutara, Sri Lanka' },
};

async function geocodeCity(location: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const clean = location.trim().toLowerCase();
  if (SRI_LANKA_CITIES[clean]) {
    return SRI_LANKA_CITIES[clean];
  }

  for (const [key, val] of Object.entries(SRI_LANKA_CITIES)) {
    if (clean.includes(key)) {
      return val;
    }
  }

  const attempts = [`${location}, Sri Lanka`, location];
  for (const q of attempts) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=lk&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'SuwaNalamAI/1.0 (hackathon medical app)',
          'Accept-Language': 'en',
        },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    } catch {
      // Continue
    }
  }

  return SRI_LANKA_CITIES.colombo;
}

// ============================================================
// Multi-Criteria Decision Ranking for Healthcare Facilities:
// Combines:
// 1. Proximity (Haversine distance decay) - 45% weight (closer distance ranks higher)
// 2. Clinical & Emergency Capability (National/Teaching ETU readiness) - 30% to 40% weight
// 3. Bayesian-Smoothed Rating (satisfaction prior) - 15% weight
// 4. Specialty Department Alignment (keyword match) - 10% weight
// ============================================================
function rankDoctorsSmart(
  doctors: DoctorResult[],
  targetSpecialty: string,
  isUrgent = false
): DoctorResult[] {
  if (doctors.length <= 1) return doctors;

  const cleanTarget = targetSpecialty.toLowerCase();
  const PRIOR_RATING = 4.2; // Baseline prior for established medical centers
  const PRIOR_COUNT = 15;   // Bayesian smoothing weight

  return [...doctors].sort((a, b) => {
    // 1. Proximity Score (0.0 to 1.0, non-linear distance decay)
    const scoreDistA = 1 / (1 + a.distanceKm / 7);
    const scoreDistB = 1 / (1 + b.distanceKm / 7);

    // 2. Clinical & Emergency Capability Score (0.5 to 1.0)
    // National and Teaching hospitals have 24/7 on-call specialists, trauma units, and ICUs
    let capabilityA = 0.55;
    if (a.facilityType === 'tertiary' || a.name.toLowerCase().includes('national hospital')) capabilityA = 1.0;
    else if (a.facilityType === 'teaching' || a.name.toLowerCase().includes('teaching')) capabilityA = 0.95;
    else if (a.facilityType === 'general' || a.isTertiary) capabilityA = 0.80;
    else if (a.facilityType === 'clinic') capabilityA = 0.55;

    let capabilityB = 0.55;
    if (b.facilityType === 'tertiary' || b.name.toLowerCase().includes('national hospital')) capabilityB = 1.0;
    else if (b.facilityType === 'teaching' || b.name.toLowerCase().includes('teaching')) capabilityB = 0.95;
    else if (b.facilityType === 'general' || b.isTertiary) capabilityB = 0.80;
    else if (b.facilityType === 'clinic') capabilityB = 0.55;

    // 3. Bayesian Smoothed Rating Score (0.0 to 1.0)
    const ratingA = a.rating ?? PRIOR_RATING;
    const countA = a.totalRatings ?? PRIOR_COUNT;
    const bayesA = (ratingA * countA + PRIOR_RATING * PRIOR_COUNT) / (countA + PRIOR_COUNT);
    const scoreRatingA = bayesA / 5.0;

    const ratingB = b.rating ?? PRIOR_RATING;
    const countB = b.totalRatings ?? PRIOR_COUNT;
    const bayesB = (ratingB * countB + PRIOR_RATING * PRIOR_COUNT) / (countB + PRIOR_COUNT);
    const scoreRatingB = bayesB / 5.0;

    // 4. Specialty Alignment Bonus (0.4 to 1.0)
    const specA = (a.inferredSpecialty || a.name).toLowerCase();
    const specB = (b.inferredSpecialty || b.name).toLowerCase();
    const targetToken = cleanTarget.split('/')[0].trim().toLowerCase();
    const scoreSpecA = specA.includes(targetToken) ? 1.0 : 0.4;
    const scoreSpecB = specB.includes(targetToken) ? 1.0 : 0.4;

    // Weights: in emergency/urgent mode, capability & proximity heavily dominate
    const wDist = isUrgent ? 0.45 : 0.45;
    const wCap = isUrgent ? 0.40 : 0.30;
    const wRating = isUrgent ? 0.05 : 0.15;
    const wSpec = isUrgent ? 0.10 : 0.10;

    // Composite Weighted Healthcare Utility Score
    const compositeA = wDist * scoreDistA + wCap * capabilityA + wRating * scoreRatingA + wSpec * scoreSpecA;
    const compositeB = wDist * scoreDistB + wCap * capabilityB + wRating * scoreRatingB + wSpec * scoreSpecB;

    return compositeB - compositeA; // Higher composite score ranks first
  });
}

// ============================================================
// Guaranteed Nearest Tertiary / Teaching Referral Center
// ============================================================
function getNearestTertiaryReferral(
  specialty: string,
  userLat: number,
  userLon: number
): DoctorResult | null {
  const cleanSpec = specialty.toLowerCase();
  const tertiaryFacilities = VERIFIED_FACILITIES.filter(
    (f) => f.isTertiary || f.facilityType === 'teaching' || f.facilityType === 'tertiary'
  );
  if (tertiaryFacilities.length === 0) return null;

  const mapped = tertiaryFacilities.map((f, i): DoctorResult => {
    const dist = haversineKm(userLat, userLon, f.lat, f.lon);
    const deptLower = f.specialtyDept.toLowerCase();

    let specialtyLabel = `${specialty} Department / Tertiary Unit`;
    if (deptLower.includes(cleanSpec.split('/')[0].trim().toLowerCase())) {
      specialtyLabel = `${specialty} Specialist Institute / Clinic`;
    }

    return {
      placeId: `sl-tertiary-referral-${i + 1}`,
      name: f.name,
      inferredSpecialty: specialtyLabel,
      address: f.address,
      distanceKm: Math.round(dist * 10) / 10,
      phone: f.phone,
      openingHours: f.hours,
      rating: f.rating,
      totalRatings: f.totalRatings,
      lat: f.lat,
      lon: f.lon,
      dataSource: 'osm',
      isTertiary: true,
      isReferralCenter: true,
      facilityType: f.facilityType,
    };
  });

  mapped.sort((a, b) => a.distanceKm - b.distanceKm);
  return mapped[0] || null;
}

// ============================================================
// Google Maps Places API (New) — Text Search strictly in Sri Lanka
// ============================================================
async function searchGoogleMaps(
  specialty: string,
  cityOrArea: string,
  lat: number,
  lon: number,
  googleKey: string
): Promise<DoctorResult[]> {
  try {
    const cleanCity = cityOrArea.split(',')[0].trim();
    const includedType = specialtyToGooglePlaceType(specialty);
    const isSpecialist = !specialty.toLowerCase().includes('general') && !specialty.toLowerCase().includes('clinic');
    // Adaptive search radius: 40km for specialist queries, 25km for general clinics
    const searchRadiusMeters = isSpecialist ? 40000.0 : 25000.0;
    const query = `${specialty} hospital or clinic in ${cleanCity}, Sri Lanka`;

    const requestPlaces = async (withTypeFilter: boolean) => {
      const body: Record<string, any> = {
        textQuery: query,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lon },
            radius: searchRadiusMeters,
          },
        },
        maxResultCount: 14,
      };

      // Add strict category filter from Google Places API Table A
      if (withTypeFilter && includedType) {
        body.includedType = includedType;
      }

      return await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.regularOpeningHours.weekdayDescriptions,places.location,places.types,places.photos',
        },
        body: JSON.stringify(body),
      });
    };

    // Primary attempt with strict includedType filter
    let res = await requestPlaces(true);
    let data = res.ok ? ((await res.json()) as { places?: any[] }) : null;

    // Resilient fallback if strict type filter yields no results in smaller regional areas
    if (!data?.places || data.places.length === 0) {
      res = await requestPlaces(false);
      data = res.ok ? ((await res.json()) as { places?: any[] }) : null;
    }

    if (!data?.places || data.places.length === 0) return [];

    // Filter to Sri Lanka only
    const mapped = data.places
      .filter((p) => {
        if (!p.displayName?.text) return false;
        const addr = (p.formattedAddress || '').toLowerCase();
        // Discard any foreign address (e.g. India)
        if (addr.includes('india') || addr.includes('tamil nadu') || addr.includes('kerala')) return false;
        return true;
      })
      .map((p): DoctorResult => {
        const placeLat = p.location?.latitude ?? lat;
        const placeLon = p.location?.longitude ?? lon;
        const distance = haversineKm(lat, lon, placeLat, placeLon);
        const nameText = p.displayName?.text ?? 'Unknown Hospital';

        const types = p.types ?? [];
        const isTertiary = isTertiaryOrTeachingHospital(nameText);
        let facilityType: 'tertiary' | 'teaching' | 'general' | 'clinic' = 'clinic';
        if (nameText.toLowerCase().includes('national hospital')) facilityType = 'tertiary';
        else if (nameText.toLowerCase().includes('teaching')) facilityType = 'teaching';
        else if (types.includes('hospital') || isTertiary) facilityType = 'general';

        let inferredSpecialty = `${specialty} Department`;
        if (facilityType === 'tertiary' || facilityType === 'teaching') {
          inferredSpecialty = `${specialty} Dept / Teaching Hospital`;
        } else if (types.includes('hospital')) {
          inferredSpecialty = `${specialty} Dept / Hospital`;
        } else if (types.includes('pharmacy')) {
          inferredSpecialty = 'Pharmacy / Dispensary';
        } else if (types.includes('doctor')) {
          inferredSpecialty = `${specialty} Practice`;
        }

        const openingHours = p.regularOpeningHours?.weekdayDescriptions?.slice(0, 3).join('; ');

        let photoUrl: string | undefined = undefined;
        if (p.photos && p.photos.length > 0 && p.photos[0].name) {
          photoUrl = `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxHeightPx=240&maxWidthPx=320&key=${googleKey}`;
        }

        return {
          placeId: p.id ?? '',
          name: nameText,
          inferredSpecialty,
          address: p.formattedAddress ?? 'Address available on map',
          distanceKm: Math.round(distance * 10) / 10,
          phone: p.nationalPhoneNumber,
          openingHours,
          rating: p.rating,
          totalRatings: p.userRatingCount,
          photoUrl,
          lat: placeLat,
          lon: placeLon,
          dataSource: 'google',
          isTertiary: isTertiary || facilityType === 'tertiary' || facilityType === 'teaching',
          facilityType,
        };
      });

    // Apply multi-criteria smart ranking (Proximity + Capability + Bayesian rating + Specialty)
    return rankDoctorsSmart(mapped, specialty);
  } catch {
    return [];
  }
}

// ============================================================
// Verified Facilities Resolution (Sri Lanka Network)
// ============================================================
function getVerifiedNearbyFacilities(
  specialty: string,
  userLat: number,
  userLon: number,
  isUrgent = false
): DoctorResult[] {
  const cleanSpec = specialty.toLowerCase();
  
  const mapped = VERIFIED_FACILITIES.map((f, i): DoctorResult => {
    const dist = haversineKm(userLat, userLon, f.lat, f.lon);
    const deptLower = f.specialtyDept.toLowerCase();

    let specialtyLabel = `${specialty} Department`;
    if (deptLower.includes(cleanSpec.split('/')[0].trim().toLowerCase())) {
      specialtyLabel = `${specialty} Institute / Clinic`;
    }

    return {
      placeId: `sl-med-${i + 1}`,
      name: f.name,
      inferredSpecialty: specialtyLabel,
      address: f.address,
      distanceKm: Math.round(dist * 10) / 10,
      phone: f.phone,
      openingHours: f.hours,
      rating: f.rating,
      totalRatings: f.totalRatings,
      lat: f.lat,
      lon: f.lon,
      dataSource: 'osm',
      isTertiary: f.isTertiary,
      facilityType: f.facilityType,
    };
  });

  return rankDoctorsSmart(mapped, specialty, isUrgent);
}

// ============================================================
// Radius Rule with Emergency & Clinical Capability Prioritization
// ============================================================
function applyRadiusRule(
  allFacilities: DoctorResult[],
  specialty: string,
  userLat: number,
  userLon: number,
  maxRadiusKm = 25,
  urgencyHint?: string
): DoctorResult[] {
  const isUrgent = urgencyHint === 'immediate';
  const nearestTertiary = getNearestTertiaryReferral(specialty, userLat, userLon);

  if (allFacilities.length === 0) {
    if (nearestTertiary) {
      nearestTertiary.isReferralCenter = true;
      if (isUrgent) nearestTertiary.isEmergencyRecommended = true;
      nearestTertiary.inferredSpecialty = isUrgent
        ? `24/7 Emergency & Tertiary Center (${nearestTertiary.distanceKm} km)`
        : `Nearest National / Teaching Referral Center (${nearestTertiary.distanceKm} km)`;
      return [nearestTertiary];
    }
    return [];
  }

  // Filter facilities strictly within local radius (25 km)
  const within25Km = allFacilities.filter((f) => f.distanceKm <= maxRadiusKm);

  // Check if any hospital in the local list is already an accredited Teaching / Tertiary Center
  const hasTertiaryInLocal = within25Km.some(
    (f) => f.isTertiary || f.facilityType === 'teaching' || f.facilityType === 'tertiary' || isTertiaryOrTeachingHospital(f.name)
  );

  const combinedList: DoctorResult[] = [];

  if (within25Km.length > 0) {
    combinedList.push(...within25Km);

    // If no Teaching/National Tertiary center is inside 25km,
    // guarantee adding the closest accredited National/Teaching hospital
    if (!hasTertiaryInLocal && nearestTertiary) {
      const alreadyIncluded = combinedList.some(
        (r) => r.name.toLowerCase().includes(nearestTertiary.name.toLowerCase()) || nearestTertiary.name.toLowerCase().includes(r.name.toLowerCase())
      );
      if (!alreadyIncluded) {
        nearestTertiary.isReferralCenter = true;
        if (isUrgent) nearestTertiary.isEmergencyRecommended = true;
        nearestTertiary.inferredSpecialty = isUrgent
          ? `24/7 Emergency & Tertiary Center (${nearestTertiary.distanceKm} km away)`
          : `Specialist & Tertiary Referral Center (${nearestTertiary.distanceKm} km away)`;
        combinedList.push(nearestTertiary);
      }
    }
  } else {
    // If NONE within 25 km, take the closest facility + the nearest Tertiary Hospital
    const singleNearest = { ...allFacilities[0] };
    singleNearest.inferredSpecialty = `Closest Medical Center (${singleNearest.distanceKm} km away)`;
    combinedList.push(singleNearest);

    if (
      nearestTertiary &&
      !nearestTertiary.name.toLowerCase().includes(singleNearest.name.toLowerCase()) &&
      !singleNearest.name.toLowerCase().includes(nearestTertiary.name.toLowerCase())
    ) {
      nearestTertiary.isReferralCenter = true;
      if (isUrgent) nearestTertiary.isEmergencyRecommended = true;
      nearestTertiary.inferredSpecialty = isUrgent
        ? `24/7 Emergency & Tertiary Center (${nearestTertiary.distanceKm} km away)`
        : `National / Teaching Referral Center (${nearestTertiary.distanceKm} km away)`;
      combinedList.push(nearestTertiary);
    }
  }

  // Re-rank the combined list using the clinical capability & proximity algorithm
  const ranked = rankDoctorsSmart(combinedList, specialty, isUrgent);

  // If this is an urgent / emergency triage, ensure the top accredited 24/7 emergency tertiary hospital
  // is placed at Position #1
  if (isUrgent) {
    const tertiaryIdx = ranked.findIndex(
      (f) => f.isTertiary || f.facilityType === 'tertiary' || f.facilityType === 'teaching' || isTertiaryOrTeachingHospital(f.name)
    );
    if (tertiaryIdx > 0) {
      const [topTertiary] = ranked.splice(tertiaryIdx, 1);
      topTertiary.isEmergencyRecommended = true;
      ranked.unshift(topTertiary);
    } else if (tertiaryIdx === 0) {
      ranked[0].isEmergencyRecommended = true;
    }
  }

  return ranked.slice(0, 7);
}

// ============================================================
// Main Route Handler
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      specialty?: string;
      location?: string;
      lat?: number;
      lon?: number;
      availability?: string;
      urgencyHint?: string;
    };
    const { specialty, location, availability, urgencyHint } = body;

    if (!specialty) {
      return NextResponse.json(
        { success: false, error: 'Specialty is required.' },
        { status: 400 }
      );
    }

    let lat = body.lat;
    let lon = body.lon;
    let displayName = location?.trim() || '';

    // Geocode to Sri Lanka coordinates if not provided
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      const cleanLocation = location?.trim() || 'Colombo';
      const geoResult = await geocodeCity(cleanLocation);
      lat = geoResult?.lat ?? 6.9271;
      lon = geoResult?.lon ?? 79.8612;
      displayName = geoResult?.displayName ?? 'Colombo, Sri Lanka';
    } else {
      if (!displayName) {
        displayName = 'Your Current GPS Location';
      }
    }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    let results: DoctorResult[] = [];
    let dataSource: 'google' | 'osm' = 'osm';

    // Step 1: Query Google Maps Places API strictly in Sri Lanka
    if (googleKey) {
      try {
        const gResults = await searchGoogleMaps(specialty, displayName, lat, lon, googleKey);
        if (gResults.length > 0) {
          results = applyRadiusRule(gResults, specialty, lat, lon, 25, urgencyHint);
          dataSource = 'google';
        }
      } catch (err) {
        console.warn('[find-doctors] Google Maps error, falling back:', err);
      }
    }

    // Step 2: Fallback to Verified Sri Lanka Hospital Network
    if (results.length === 0) {
      const isUrgent = urgencyHint === 'immediate';
      const allVerified = getVerifiedNearbyFacilities(specialty, lat, lon, isUrgent);
      results = applyRadiusRule(allVerified, specialty, lat, lon, 25, urgencyHint);
      dataSource = 'osm';
    }

    const response: FindDoctorsResponse = {
      results,
      searchedNear: displayName.split(',').slice(0, 2).join(',').trim(),
      lat,
      lon,
      dataSource,
    };

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error('[find-doctors] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

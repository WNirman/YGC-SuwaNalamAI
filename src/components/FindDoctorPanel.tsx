'use client';

import { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  Stethoscope,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Navigation,
  ExternalLink,
  LocateFixed,
  Compass,
} from 'lucide-react';
import type { DoctorResult } from '@/types/medical';
import { useI18n } from '@/lib/i18n';

type UrgencyHint = 'immediate' | 'this_week' | 'routine';
type PanelState = 'idle' | 'form' | 'loading' | 'results';

interface FindDoctorPanelProps {
  specialty: string;
  urgencyHint?: UrgencyHint;
  context?: string;
}

const AVAILABILITY_OPTIONS = [
  { value: 'asap', labelKey: 'findDoctor.availabilityAsap' },
  { value: 'thisWeek', labelKey: 'findDoctor.availabilityThisWeek' },
  { value: 'evenings', labelKey: 'findDoctor.availabilityEvenings' },
  { value: 'weekends', labelKey: 'findDoctor.availabilityWeekends' },
  { value: 'flexible', labelKey: 'findDoctor.availabilityFlexible' },
];

const QUICK_CITIES = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Gampaha'];

export function FindDoctorPanel({ specialty, urgencyHint, context }: FindDoctorPanelProps) {
  const { t } = useI18n();
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [availability, setAvailability] = useState('asap');
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [searchedNear, setSearchedNear] = useState('');
  const [dataSource, setDataSource] = useState<'google' | 'osm'>('osm');
  const [error, setError] = useState('');

  const urgencyColor =
    urgencyHint === 'immediate'
      ? 'var(--color-danger)'
      : urgencyHint === 'this_week'
      ? 'var(--color-warning)'
      : 'var(--color-success)';

  const urgencyText =
    urgencyHint === 'immediate'
      ? t('findDoctor.urgencyImmediate')
      : urgencyHint === 'this_week'
      ? t('findDoctor.urgencyThisWeek')
      : urgencyHint === 'routine'
      ? t('findDoctor.urgencyRoutine')
      : null;

  // ── GPS Geolocation Handler ────────────────────────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t('findDoctor.geoNotSupported') || 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        setCoords({ lat: userLat, lon: userLon });
        setLocation(t('findDoctor.currentLocationDetected') || '📍 Current GPS Location');
        setIsLocating(false);
        // Automatically search with coordinates
        triggerSearch({ lat: userLat, lon: userLon, locText: '' });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        setError(t('findDoctor.geoDenied') || 'Could not access GPS. Please type your city/area name below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualSearch = () => {
    if (!location.trim()) {
      setError(t('findDoctor.errorLocation'));
      return;
    }
    triggerSearch({ locText: location.trim(), lat: coords?.lat, lon: coords?.lon });
  };

  const triggerSearch = async ({
    locText,
    lat,
    lon,
  }: {
    locText?: string;
    lat?: number;
    lon?: number;
  }) => {
    setError('');
    setPanelState('loading');

    try {
      const payload: Record<string, unknown> = {
        specialty,
        availability,
      };

      if (typeof lat === 'number' && typeof lon === 'number') {
        payload.lat = lat;
        payload.lon = lon;
        if (locText) payload.location = locText;
      } else if (locText) {
        payload.location = locText;
      } else if (location.trim()) {
        payload.location = location.trim();
      }

      const res = await fetch('/api/find-doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        success: boolean;
        results?: DoctorResult[];
        searchedNear?: string;
        dataSource?: 'google' | 'osm';
        error?: string;
      };

      if (!data.success) {
        setError(data.error ?? t('findDoctor.errorService'));
        setPanelState('form');
        return;
      }

      setResults(data.results ?? []);
      setSearchedNear(data.searchedNear ?? locText ?? location);
      setDataSource(data.dataSource ?? 'osm');
      setPanelState('results');
    } catch {
      setError(t('findDoctor.errorService'));
      setPanelState('form');
    }
  };

  const handleReset = () => {
    setResults([]);
    setError('');
    setPanelState('form');
  };

  // ── IDLE STATE ─────────────────────────────────────────────
  if (panelState === 'idle') {
    return (
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={() => setPanelState('form')}
          aria-expanded={false}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(37,99,235,0.3)',
            background: 'var(--accent-primary-dim)',
            color: 'var(--accent-primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(37,99,235,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-primary-dim)';
          }}
        >
          <Navigation size={14} />
          {t('findDoctor.triggerBtn').replace('{{specialty}}', specialty)}
          <ChevronDown size={13} style={{ marginLeft: '2px', opacity: 0.7 }} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="find-doctor-panel"
      role="region"
      aria-label={t('findDoctor.title')}
      style={{
        marginTop: '14px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(37,99,235,0.22)',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(20,184,166,0.04))',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(37,99,235,0.12)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'rgba(37,99,235,0.05)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Stethoscope size={18} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {t('findDoctor.title')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {t('findDoctor.subtitle').replace('{{specialty}}', specialty)}
          </div>
          {context && (
            <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginTop: '4px', fontStyle: 'italic' }}>
              {context}
            </div>
          )}
        </div>
      </div>

      {/* Urgency Banner */}
      {urgencyHint && urgencyText && panelState !== 'results' && (
        <div
          style={{
            padding: '8px 18px',
            background: urgencyColor + '14',
            borderBottom: '1px solid ' + urgencyColor + '28',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: urgencyColor,
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={13} />
          {urgencyText}
        </div>
      )}

      <div style={{ padding: '18px' }}>
        {/* ── FORM STATE ─────────────────────────────────── */}
        {(panelState === 'form' || panelState === 'loading') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1-Click GPS Button */}
            <div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={panelState === 'loading' || isLocating}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(20,184,166,0.12))',
                  border: '1px solid var(--border-color-hover)',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {isLocating ? (
                  <>
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>{t('findDoctor.locating') || 'Detecting GPS Location...'}</span>
                  </>
                ) : (
                  <>
                    <LocateFixed size={16} />
                    <span>{t('findDoctor.useLocation') || '📍 Use My Current Location (Near Me)'}</span>
                  </>
                )}
              </button>
            </div>

            {/* OR separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('findDoctor.orEnterPlace') || 'or enter city / area'}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            {/* Quick City Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)' }}>Quick:</span>
              {QUICK_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    setCoords(null);
                    triggerSearch({ locText: city });
                  }}
                  disabled={panelState === 'loading'}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: location === city ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: location === city ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Location Input Field */}
            <div>
              <label
                htmlFor="doctor-location-input"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                <MapPin size={12} style={{ display: 'inline', marginRight: '5px', color: 'var(--accent-primary)' }} />
                {t('findDoctor.locationLabel')}
              </label>
              <input
                id="doctor-location-input"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCoords(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && panelState === 'form' && handleManualSearch()}
                placeholder={t('findDoctor.locationPlaceholder')}
                disabled={panelState === 'loading'}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: error ? '1px solid var(--color-danger)' : '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {error && (
                <p style={{ margin: '5px 0 0', fontSize: '0.73rem', color: 'var(--color-danger)' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Availability Dropdown */}
            <div>
              <label
                htmlFor="doctor-availability-select"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                <Clock size={12} style={{ display: 'inline', marginRight: '5px', color: 'var(--accent-primary)' }} />
                {t('findDoctor.availabilityLabel')}
              </label>
              <select
                id="doctor-availability-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                disabled={panelState === 'loading'}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleManualSearch}
              disabled={panelState === 'loading' || !location.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {panelState === 'loading' ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {t('findDoctor.searching')}
                </>
              ) : (
                <>
                  <Search size={16} />
                  {t('findDoctor.searchBtn')}
                </>
              )}
            </button>

            {/* Loading skeleton */}
            {panelState === 'loading' && (
              <div aria-busy="true" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 80,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      animation: 'pulse 1.4s ease-in-out infinite',
                      animationDelay: (i * 0.15) + 's',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS STATE ──────────────────────────────── */}
        {panelState === 'results' && (
          <div aria-live="polite" aria-atomic="false">
            {/* Results header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {results.length > 0
                    ? t('findDoctor.resultsTitle').replace('{{specialty}}', specialty)
                    : t('findDoctor.noResultsTitle')}
                </div>
                {results.length > 0 && (
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    <MapPin size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    {searchedNear}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={12} />
                {t('findDoctor.searchAgain')}
              </button>
            </div>

            {/* No results */}
            {results.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Compass size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {t('findDoctor.noResults')
                    .replace('{{specialty}}', specialty)
                    .replace('{{location}}', location)}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  {t('findDoctor.noResultsHint')}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                  style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <RefreshCw size={12} style={{ marginRight: '6px' }} />
                  {t('findDoctor.searchAgain')}
                </button>
              </div>
            )}

            {/* Doctor cards */}
            {results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.map((doc, i) => (
                  <DoctorCard key={doc.placeId} doc={doc} index={i} specialty={specialty} />
                ))}
              </div>
            )}

            {/* Data source attribution */}
            <div
              style={{
                marginTop: '14px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ExternalLink size={10} />
              {dataSource === 'google'
                ? t('findDoctor.dataSourceGoogle')
                : t('findDoctor.dataSourceOsm')}
            </div>

            {/* Disclaimer */}
            <p
              style={{
                marginTop: '8px',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}
            >
              {t('findDoctor.disclaimer')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Individual Doctor/Clinic Result Card
// ============================================================
function DoctorCard({ doc, index, specialty }: { doc: DoctorResult; index: number; specialty: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)',
        animation: 'slideInUp 0.3s ease both',
        animationDelay: (index * 0.06) + 's',
        transition: 'var(--transition-normal)',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color-hover)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Hospital Photo / Thumbnail */}
      {doc.photoUrl && !imageError ? (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doc.photoUrl}
            alt={doc.name}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <Stethoscope size={20} style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}

      {/* Hospital Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + distance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '6px',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {doc.name}
          </div>
          <span
            style={{
              flexShrink: 0,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary-dim)',
              color: 'var(--accent-primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {doc.distanceKm} km
          </span>
        </div>

        {/* Specialty tag & Ratings */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-secondary-dim)',
              color: 'var(--accent-secondary)',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            <Stethoscope size={10} />
            {doc.inferredSpecialty || specialty}
          </span>

          {/* Google rating */}
          {doc.rating !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(245,158,11,0.1)',
                color: 'var(--color-warning)',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <Star size={10} />
              {doc.rating.toFixed(1)}
              {doc.totalRatings !== undefined && (
                <span style={{ opacity: 0.7, fontWeight: 400 }}>({doc.totalRatings})</span>
              )}
            </span>
          )}
        </div>

        {/* Address, Phone & Hours */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <MapPin size={12} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--text-muted)' }} />
            <span>{doc.address}</span>
          </div>

          {doc.phone && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Phone size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              <a
                href={'tel:' + doc.phone}
                style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}
              >
                {doc.phone}
              </a>
            </div>
          )}

          {doc.openingHours && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                fontSize: '0.73rem',
                color: 'var(--text-tertiary)',
              }}
            >
              <Clock size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{doc.openingHours}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

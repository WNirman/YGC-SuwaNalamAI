'use client';

import { useI18n, Language } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  onComplete?: () => void;
  allowClose?: boolean;
}

export function LanguageSelector({ onComplete, allowClose = false }: LanguageSelectorProps) {
  const { language, setLanguage, t, setShowLanguageModal } = useI18n();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15,15,15,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease-out',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(34,40,50,0.96), rgba(22,26,33,0.98))',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0',
          padding: '40px 32px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(92,157,255,0.18)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '0',
            background: 'radial-gradient(circle, rgba(92,157,255,0.28) 0%, rgba(92,157,255,0.06) 70%)',
            border: '1px solid rgba(92,157,255,0.38)',
            marginBottom: '24px',
            boxShadow: '0 0 20px rgba(92,157,255,0.25)',
          }}
        >
          <Globe size={40} style={{ color: '#5c9dff' }} />
        </div>

        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            marginBottom: '8px',
            color: '#fafafa',
            letterSpacing: '-0.02em',
          }}
        >
          {t('language.select')}
        </h1>

        <p
          style={{
            color: '#a1a1a1',
            fontSize: '0.98rem',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}
        >
          {t('language.selectLanguagePrompt')}
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* English Option */}
          <button
            onClick={() => handleSelect('en')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '0',
              border: language === 'en' ? '2px solid #5c9dff' : '1px solid rgba(255,255,255,0.1)',
              background:
                language === 'en'
                  ? 'linear-gradient(135deg, rgba(92,157,255,0.26), rgba(61,127,224,0.14))'
                  : 'rgba(255,255,255,0.03)',
              color: language === 'en' ? '#8fbcff' : '#e7e7e7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'en' ? '0 4px 15px rgba(92,157,255,0.24)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.25)', padding: '4px 8px', minWidth: '38px', textAlign: 'center' }}>EN</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>English</div>
                <div style={{ fontSize: '0.8rem', color: '#727272' }}>Default Language</div>
              </div>
            </div>
            {language === 'en' && <Check size={22} style={{ color: '#5c9dff' }} />}
          </button>

          {/* Sinhala Option */}
          <button
            onClick={() => handleSelect('si')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '0',
              border: language === 'si' ? '2px solid #5c9dff' : '1px solid rgba(255,255,255,0.1)',
              background:
                language === 'si'
                  ? 'linear-gradient(135deg, rgba(92,157,255,0.26), rgba(61,127,224,0.14))'
                  : 'rgba(255,255,255,0.03)',
              color: language === 'si' ? '#8fbcff' : '#e7e7e7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'si' ? '0 4px 15px rgba(92,157,255,0.24)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.25)', padding: '4px 8px', minWidth: '38px', textAlign: 'center' }}>SI</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>සිංහල</div>
                <div style={{ fontSize: '0.8rem', color: '#727272' }}>Sinhala</div>
              </div>
            </div>
            {language === 'si' && <Check size={22} style={{ color: '#5c9dff' }} />}
          </button>

          {/* Tamil Option */}
          <button
            onClick={() => handleSelect('ta')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '0',
              border: language === 'ta' ? '2px solid #5c9dff' : '1px solid rgba(255,255,255,0.1)',
              background:
                language === 'ta'
                  ? 'linear-gradient(135deg, rgba(92,157,255,0.26), rgba(61,127,224,0.14))'
                  : 'rgba(255,255,255,0.03)',
              color: language === 'ta' ? '#8fbcff' : '#e7e7e7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'ta' ? '0 4px 15px rgba(92,157,255,0.24)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.25)', padding: '4px 8px', minWidth: '38px', textAlign: 'center' }}>TA</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>தமிழ்</div>
                <div style={{ fontSize: '0.8rem', color: '#727272' }}>Tamil</div>
              </div>
            </div>
            {language === 'ta' && <Check size={22} style={{ color: '#5c9dff' }} />}
          </button>
        </div>

        {allowClose && (
          <button
            onClick={() => setShowLanguageModal(false)}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              color: '#727272',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline',
            }}
          >
            {t('common.close')}
          </button>
        )}
      </div>
    </div>
  );
}

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
        backgroundColor: 'rgba(8,10,15,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease-out',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
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
            borderRadius: '50%',
            background: 'var(--gradient-accent)',
            border: '1px solid var(--border-accent)',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Globe size={40} style={{ color: 'var(--accent-primary)' }} />
        </div>

        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            marginBottom: '8px',
            color: 'var(--accent-secondary)',
            letterSpacing: '-0.02em',
          }}
        >
          {t('language.select')}
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
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
              borderRadius: '16px',
              border: language === 'en' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background:
                language === 'en'
                  ? 'var(--accent-primary-dim)'
                  : 'var(--bg-primary)',
              color: language === 'en' ? 'var(--accent-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'en' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid var(--border-color)', padding: '4px 8px', minWidth: '38px', textAlign: 'center', borderRadius: '8px' }}>EN</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: language === 'en' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>English</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Default Language</div>
              </div>
            </div>
            {language === 'en' && <Check size={22} style={{ color: 'var(--accent-primary)' }} />}
          </button>

          {/* Sinhala Option */}
          <button
            onClick={() => handleSelect('si')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '16px',
              border: language === 'si' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background:
                language === 'si'
                  ? 'var(--accent-primary-dim)'
                  : 'var(--bg-primary)',
              color: language === 'si' ? 'var(--accent-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'si' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid var(--border-color)', padding: '4px 8px', minWidth: '38px', textAlign: 'center', borderRadius: '8px' }}>SI</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: language === 'si' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>සිංහල</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sinhala</div>
              </div>
            </div>
            {language === 'si' && <Check size={22} style={{ color: 'var(--accent-primary)' }} />}
          </button>

          {/* Tamil Option */}
          <button
            onClick={() => handleSelect('ta')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '16px',
              border: language === 'ta' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background:
                language === 'ta'
                  ? 'var(--accent-primary-dim)'
                  : 'var(--bg-primary)',
              color: language === 'ta' ? 'var(--accent-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'ta' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid var(--border-color)', padding: '4px 8px', minWidth: '38px', textAlign: 'center', borderRadius: '8px' }}>TA</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: language === 'ta' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>தமிழ்</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tamil</div>
              </div>
            </div>
            {language === 'ta' && <Check size={22} style={{ color: 'var(--accent-primary)' }} />}
          </button>
        </div>

        {allowClose && (
          <button
            onClick={() => setShowLanguageModal(false)}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
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

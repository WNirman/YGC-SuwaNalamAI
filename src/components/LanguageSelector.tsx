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
        backgroundColor: 'rgba(10, 15, 30, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease-out',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(20, 28, 48, 0.95), rgba(13, 20, 36, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',
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
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.05) 70%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '24px',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
          }}
        >
          <Globe size={40} style={{ color: '#60a5fa' }} />
        </div>

        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            marginBottom: '8px',
            color: '#f8fafc',
            letterSpacing: '-0.02em',
          }}
        >
          {t('language.select')}
        </h1>

        <p
          style={{
            color: '#94a3b8',
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
              border: language === 'en' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
              background:
                language === 'en'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.15))'
                  : 'rgba(255, 255, 255, 0.03)',
              color: language === 'en' ? '#60a5fa' : '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'en' ? '0 4px 15px rgba(59, 130, 246, 0.2)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.4rem' }}>🇬🇧</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>English</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Default Language</div>
              </div>
            </div>
            {language === 'en' && <Check size={22} style={{ color: '#60a5fa' }} />}
          </button>

          {/* Sinhala Option */}
          <button
            onClick={() => handleSelect('si')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '16px',
              border: language === 'si' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
              background:
                language === 'si'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.15))'
                  : 'rgba(255, 255, 255, 0.03)',
              color: language === 'si' ? '#60a5fa' : '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'si' ? '0 4px 15px rgba(59, 130, 246, 0.2)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.4rem' }}>🇱🇰</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>සිංහල</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Sinhala</div>
              </div>
            </div>
            {language === 'si' && <Check size={22} style={{ color: '#60a5fa' }} />}
          </button>

          {/* Tamil Option */}
          <button
            onClick={() => handleSelect('ta')}
            style={{
              padding: '18px 24px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '16px',
              border: language === 'ta' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
              background:
                language === 'ta'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.15))'
                  : 'rgba(255, 255, 255, 0.03)',
              color: language === 'ta' ? '#60a5fa' : '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: language === 'ta' ? '0 4px 15px rgba(59, 130, 246, 0.2)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.4rem' }}>🇱🇰</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>தமிழ்</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tamil</div>
              </div>
            </div>
            {language === 'ta' && <Check size={22} style={{ color: '#60a5fa' }} />}
          </button>
        </div>

        {allowClose && (
          <button
            onClick={() => setShowLanguageModal(false)}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
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

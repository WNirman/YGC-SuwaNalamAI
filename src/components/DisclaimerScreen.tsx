'use client';

import React, { useState } from 'react';
import Lottie from 'lottie-react';
import { useI18n, Language } from '@/lib/i18n';
import { Globe, ArrowRight, ShieldAlert } from 'lucide-react';
import warningAnimation from '@/assets/Warning Status.json';

interface DisclaimerScreenProps {
  onAccept: () => void;
}

export function DisclaimerScreen({ onAccept }: DisclaimerScreenProps) {
  const { t, language, setLanguage } = useI18n();
  const [declined, setDeclined] = useState(false);

  const toggleLanguage = () => {
    const nextLang: Record<Language, Language> = {
      en: 'si',
      si: 'ta',
      ta: 'en',
    };
    setLanguage(nextLang[language] || 'en');
  };

  return (
    <div className="disclaimer-fullscreen-wrapper">
      <div className="disclaimer-card">
        {/* Language switcher top right */}
        <button
          onClick={toggleLanguage}
          className="disclaimer-lang-pill"
          title="Switch Language / භාෂාව මාරු කරන්න / மொழியை மாற்றவும்"
        >
          <Globe size={14} />
          <span>{language === 'en' ? 'English' : language === 'si' ? 'සිංහල' : 'தமிழ்'}</span>
        </button>

        {/* Left Column: Content & Actions */}
        <div className="disclaimer-card-left">
          <div className="disclaimer-tag">
            {t('disclaimer.termsHeader') || 'TERMS OF USAGE'}
          </div>
          <h1 className="disclaimer-title">
            {t('disclaimer.welcome') || 'Welcome'}
          </h1>

          <div className="disclaimer-body-text">
            <p>
              <strong>{t('disclaimer.content')}</strong>
            </p>
            <p>{t('disclaimer.contentDetails')}</p>
            <div className="disclaimer-warning-highlight">
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{t('disclaimer.warning')}</span>
            </div>
          </div>

          <div className="disclaimer-risk-box">
            <div className="risk-header">
              <ShieldAlert size={15} style={{ color: 'var(--color-warning)' }} />
              <span>{t('disclaimer.risks')}</span>
            </div>
            <ul>
              <li>{t('disclaimer.riskPt1')}</li>
              <li>{t('disclaimer.riskPt2')}</li>
              <li>{t('disclaimer.riskPt3')}</li>
              <li>{t('disclaimer.riskPt4')}</li>
            </ul>
          </div>

          {declined ? (
            <div className="decline-notice-box">
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                You have declined the disclaimer. You must accept to proceed.
              </p>
              <button
                className="btn-decline"
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => setDeclined(false)}
              >
                Review Disclaimer Again
              </button>
            </div>
          ) : (
            <div className="disclaimer-actions-row">
              <button
                type="button"
                className="btn-decline"
                onClick={() => setDeclined(true)}
              >
                {t('disclaimer.declineBtn') || t('disclaimer.decline') || 'I DECLINE'}
              </button>

              <button
                type="button"
                className="btn-accept"
                onClick={onAccept}
              >
                <span>{t('disclaimer.acceptBtn') || 'I ACCEPT'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Lottie Animation */}
        <div className="disclaimer-card-right">
          <div className="lottie-container">
            <Lottie
              animationData={warningAnimation}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="lottie-floor-shadow" />
        </div>
      </div>
    </div>
  );
}

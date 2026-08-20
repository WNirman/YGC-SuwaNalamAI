'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  Clock,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  FileText,
  Pill,
  Activity,
  Shield,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Send,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileUp,
  Heart,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Shuffle,
  User,
  Bot,
  Sparkles,
  XCircle,
  Globe,
  Printer,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type {
  UploadedDocument,
  ExtractedData,
  TimelineEvent,
  DrugInteraction,
  Alert,
  LabTrend,
  ChatMessage,
  PatientInfo,
  AlertSeverity,
  SuggestedQuestion,
} from '@/types/medical';
import {
  MOCK_EXTRACTED_DATA,
  MOCK_TIMELINE,
  MOCK_PATIENT,
  MOCK_INTERACTIONS,
  MOCK_ALERTS,
  MOCK_TRENDS,
  MOCK_TRENDS_SUMMARY,
  MOCK_CROSS_CHECK_SUMMARY,
  getMockData,
  answerQuestionMock,
} from '@/lib/mockData';
import { useI18n, Language } from '@/lib/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SweepButton } from '@/components/SweepButton';
import { AssistantOrb } from '@/components/AssistantOrb';
import { DisclaimerScreen } from '@/components/DisclaimerScreen';
import { FindDoctorPanel } from '@/components/FindDoctorPanel';
import { inferSpecialty } from '@/lib/specialtyMap';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TabType = 'upload' | 'timeline' | 'alerts' | 'trends' | 'chat';

// ============================================================
// Main Dashboard Component
// ============================================================
const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  major: 3,
  moderate: 2,
  minor: 1,
  info: 0,
};

export default function Dashboard() {
  const {
    t,
    language,
    setLanguage,
    hasChosenLanguage,
    setHasChosenLanguage,
    showLanguageModal,
    setShowLanguageModal,
  } = useI18n();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trends, setTrends] = useState<LabTrend[]>([]);
  const [trendsSummary, setTrendsSummary] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [overallRiskLevel, setOverallRiskLevel] = useState<AlertSeverity>('info');
  const [crossCheckSummary, setCrossCheckSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [mobileLangDropdownOpen, setMobileLangDropdownOpen] = useState(false);
  const mobileLangDropdownRef = useRef<HTMLDivElement>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(true);
  const [apiKeyError, setApiKeyError] = useState('');

  // Close language dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (mobileLangDropdownRef.current && !mobileLangDropdownRef.current.contains(e.target as Node)) {
        setMobileLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for API key on mount
  useEffect(() => {
    fetch('/api/check-key')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasKey) {
          setApiKeySet(true);
        }
      })
      .catch(() => {
        // API route might not exist yet
      });
  }, []);

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyError(t('apiKey.errorEmpty'));
      return;
    }
    try {
      const res = await fetch('/api/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeySet(true);
        setApiKeyError('');
      } else {
        setApiKeyError(data.error || t('apiKey.errorGeneric'));
      }
    } catch {
      setApiKeyError(t('apiKey.errorConnection'));
    }
  };

  const loadDemoDataset = () => {
    setIsProcessing(true);
    setProcessingStep(t('upload.demoProcessing'));

    setTimeout(() => {
      const demoDocs: UploadedDocument[] = [
        { id: 'mock-doc-0', fileName: 'Metro_Labs_Oct2024.pdf', fileSize: 184022, fileType: 'application/pdf', uploadedAt: new Date().toISOString(), status: 'complete' },
        { id: 'mock-doc-1', fileName: 'Dr_Jenkins_Prescription_Dec2024.pdf', fileSize: 92435, fileType: 'application/pdf', uploadedAt: new Date().toISOString(), status: 'complete' },
        { id: 'mock-doc-2', fileName: 'Metro_Labs_Feb2025.pdf', fileSize: 191832, fileType: 'application/pdf', uploadedAt: new Date().toISOString(), status: 'complete' },
        { id: 'mock-doc-3', fileName: 'Dr_Chen_Prescription_Mar2025.pdf', fileSize: 128450, fileType: 'application/pdf', uploadedAt: new Date().toISOString(), status: 'complete' },
        { id: 'mock-doc-4', fileName: 'Metro_Labs_May2025.pdf', fileSize: 204910, fileType: 'application/pdf', uploadedAt: new Date().toISOString(), status: 'complete' },
      ];

      const mock = getMockData(language);

      setDocuments(demoDocs);
      setExtractedData(mock.extractedData);
      setTimeline(mock.timeline);
      setPatient(mock.patient);
      setInteractions(mock.interactions);
      setAlerts(mock.alerts);
      setOverallRiskLevel(mock.overallRiskLevel);
      setCrossCheckSummary(mock.crossCheckSummary);
      setTrends(mock.trends);
      setTrendsSummary(mock.trendsSummary);
      setSuggestedQuestions(mock.suggestedQuestions);

      setProcessingStep(t('upload.demoSuccess'));
      setTimeout(() => {
        setActiveTab('timeline');
        setIsProcessing(false);
      }, 800);
    }, 1000);
  };

  // Dynamically update demo data if language changes
  useEffect(() => {
    if (documents.length > 0 && documents[0].id.startsWith('mock-doc-')) {
      const mock = getMockData(language);
      setExtractedData(mock.extractedData);
      setTimeline(mock.timeline);
      setInteractions(mock.interactions);
      setAlerts(mock.alerts);
      setCrossCheckSummary(mock.crossCheckSummary);
      setTrends(mock.trends);
      setTrendsSummary(mock.trendsSummary);
      setSuggestedQuestions(mock.suggestedQuestions);
    }
  }, [language, documents]);

  // ============================================================
  // File Upload Handler
  // ============================================================
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs: UploadedDocument[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading' as const,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  }, []);

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // ============================================================
  // Process All Documents
  // ============================================================
  const processDocuments = async () => {
    if (documents.length === 0) return;

    setIsProcessing(true);
    setProcessingStep(t('upload.uploadingFiles'));

    try {
      const inputEl = document.querySelector('input[type="file"]') as HTMLInputElement;
      const formData = new FormData();

      if (inputEl?.files) {
        for (const file of Array.from(inputEl.files)) {
          formData.append('files', file);
        }
      }

      if (formData.getAll('files').length === 0) {
        const storedFiles = (window as unknown as { __mediscan_files?: File[] }).__mediscan_files || [];
        for (const file of storedFiles) {
          formData.append('files', file);
        }
      }

      setProcessingStep(t('upload.uploadingFiles'));
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      setDocuments((prev) =>
        prev.map((d) => ({ ...d, status: 'processing' as const }))
      );

      setProcessingStep(t('upload.analyzingDocuments'));
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploadData.files, language }),
      });
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || 'Analysis failed');
      }

      setExtractedData(analyzeData.documents);
      setTimeline(analyzeData.timeline);
      setPatient(analyzeData.patient);
      setDocuments((prev) =>
        prev.map((d) => ({ ...d, status: 'complete' as const }))
      );

      setProcessingStep(t('upload.crossCheck'));
      const allMedications = analyzeData.documents.flatMap(
        (doc: ExtractedData) => doc.medications || []
      );
      const allAllergies = [
        ...new Set(
          analyzeData.documents.flatMap(
            (doc: ExtractedData) => doc.allergies || []
          )
        ),
      ];
      const allDiagnoses = [
        ...new Set(
          analyzeData.documents.flatMap(
            (doc: ExtractedData) => doc.diagnoses || []
          )
        ),
      ];

      if (allMedications.length > 0) {
        const crossCheckRes = await fetch('/api/cross-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medications: allMedications,
            allergies: allAllergies,
            diagnoses: allDiagnoses,
            patientInfo: JSON.stringify(analyzeData.patient),
            language,
          }),
        });
        const crossCheckData = await crossCheckRes.json();

        if (crossCheckData.success) {
          setInteractions(crossCheckData.interactions || []);
          setAlerts(crossCheckData.alerts || []);
          setOverallRiskLevel(crossCheckData.overallRiskLevel || 'info');
          setCrossCheckSummary(crossCheckData.summary || '');
        }
      }

      setProcessingStep(t('upload.analyzingTrends'));
      const labData = analyzeData.documents
        .filter(
          (doc: ExtractedData) => doc.labResults && doc.labResults.length > 0
        )
        .map((doc: ExtractedData) => ({
          date: doc.date,
          results: doc.labResults,
        }));

      if (labData.length > 0) {
        const trendsRes = await fetch('/api/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labData, language }),
        });
        const trendsData = await trendsRes.json();

        if (trendsData.success) {
          setTrends(trendsData.trends || []);
          setTrendsSummary(trendsData.summary || '');
        }
      }

      setSuggestedQuestions(getMockData(language).suggestedQuestions);

      setProcessingStep(t('upload.complete'));
      setTimeout(() => {
        setActiveTab('timeline');
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Processing error:', errMsg);
      setDocuments((prev) =>
        prev.map((d) => ({
          ...d,
          status: 'error' as const,
          error: errMsg,
        }))
      );
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Store files globally for re-access
  const onDropWithStore = useCallback(
    (acceptedFiles: File[]) => {
      (window as unknown as { __mediscan_files?: File[] }).__mediscan_files = [
        ...((window as unknown as { __mediscan_files?: File[] }).__mediscan_files || []),
        ...acceptedFiles,
      ];
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const dropzone = useDropzone({
    onDrop: onDropWithStore,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    multiple: true,
  });

  // ============================================================
  // Chat Handler
  // ============================================================
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || chatInput.trim();
    if (!text || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const isDemo = documents.length > 0 && documents[0].id.startsWith('mock-doc-');
      if (isDemo) {
        const mockReply = answerQuestionMock(text, language);
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: mockReply.answer,
          timestamp: new Date().toISOString(),
          confidenceScore: mockReply.confidenceScore,
          confidenceLevel: mockReply.confidenceLevel,
          sourceDocuments: mockReply.sourceDocuments,
          shouldConsultDoctor: mockReply.shouldConsultDoctor,
          isHighRisk: mockReply.isHighRisk,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
        if (mockReply.suggestedFollowUp) {
          setSuggestedQuestions(
            mockReply.suggestedFollowUp.map((q) => ({ text: q, category: 'general' as const }))
          );
        }
        setIsChatLoading(false);
        return;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          documents: extractedData,
          chatHistory: chatMessages,
          language,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setChatMessages((prev) => [...prev, data.message]);
        if (data.suggestedQuestions) {
          setSuggestedQuestions(data.suggestedQuestions);
        }
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.error || 'Sorry, I could not process your question.',
            timestamp: new Date().toISOString(),
            confidenceScore: 0,
            confidenceLevel: 'low',
            shouldConsultDoctor: true,
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'An error occurred. Please try again.',
          timestamp: new Date().toISOString(),
          confidenceScore: 0,
          confidenceLevel: 'low',
          shouldConsultDoctor: true,
        },
      ]);
    }

    setIsChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const totalMedications = extractedData.reduce(
    (sum, doc) => sum + (doc.medications?.length || 0),
    0
  );
  const totalLabResults = extractedData.reduce(
    (sum, doc) => sum + (doc.labResults?.length || 0),
    0
  );
  const alertCount = alerts.length;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getConfidenceLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  // ============================================================
  // STEP 1: Full Window Disclaimer Screen
  // ============================================================
  if (!disclaimerAccepted) {
    return <DisclaimerScreen onAccept={() => setDisclaimerAccepted(true)} />;
  }

  // ============================================================
  // STEP 2: Language Selection Page (After Disclaimer)
  // ============================================================
  if (!hasChosenLanguage) {
    return <LanguageSelector onComplete={() => setHasChosenLanguage(true)} />;
  }



  // ============================================================
  // STEP 4: Main Application (Loaded in Selected Language)
  // ============================================================
  // Tab definitions — rendered by both the sidebar nav and the mobile bottom bar
  const tabs: {
    id: typeof activeTab;
    Icon: typeof Upload;
    label: string;
    disabled: boolean;
    badge: number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'upload',
      Icon: Upload,
      label: t('dashboard.uploadTabName'),
      disabled: false,
      badge: null,
    },
    {
      id: 'timeline',
      Icon: Clock,
      label: t('dashboard.timelineTabName'),
      disabled: false,
      badge: timeline.length > 0 ? timeline.length : null,
      badgeColor: 'var(--color-info)',
    },
    {
      id: 'alerts',
      Icon: AlertTriangle,
      label: t('dashboard.alertsTabName'),
      disabled: false,
      badge: alertCount > 0 ? alertCount : null,
    },
    {
      id: 'trends',
      Icon: TrendingUp,
      label: t('dashboard.trendsTabName'),
      disabled: false,
      badge: null,
    },
    {
      id: 'chat',
      Icon: MessageCircle,
      label: t('dashboard.chatTabName'),
      disabled: false,
      badge: null,
    },
  ];

  // Bottom bar ordering: the AI assistant is pulled into the centre slot so it
  // renders as the raised action, with the other tabs split either side.
  const assistantTab = tabs.find((tab) => tab.id === 'chat')!;
  const sideTabs = tabs.filter((tab) => tab.id !== 'chat');
  const bottomTabs = [
    ...sideTabs.slice(0, Math.ceil(sideTabs.length / 2)),
    assistantTab,
    ...sideTabs.slice(Math.ceil(sideTabs.length / 2)),
  ];

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Stethoscope size={22} />
          </div>
          <div>
            <h1>{t('dashboard.logo')}</h1>
            <span>{t('dashboard.logoSubtitle')}</span>
          </div>
        </div>

        {/* Language selector dropdown */}
        <div
          ref={langDropdownRef}
          style={{
            position: 'relative',
            margin: '0 0 16px 0',
          }}
        >
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-btn)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600 }}>
              <Globe size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>{language === 'en' ? 'English (EN)' : language === 'si' ? 'සිංහල (SI)' : 'தமிழ் (TA)'}</span>
            </div>
            <ChevronDown
              size={16}
              style={{
                color: 'var(--text-secondary)',
                transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Smooth Dropdown Menu */}
          {langDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100,
                animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {[
                { code: 'en', label: 'English', sub: 'Default', badge: 'EN' },
                { code: 'si', label: 'සිංහල', sub: 'Sinhala', badge: 'SI' },
                { code: 'ta', label: 'தமிழ்', sub: 'Tamil', badge: 'TA' },
              ].map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    onClick={() => {
                      setLanguage(langItem.code as Language);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent-primary-dim)' : 'transparent',
                      border: 'none',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {langItem.badge}
                      </span>
                      <span>{langItem.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {tabs.map(({ id, Icon, label, disabled, badge, badgeColor }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              disabled={disabled}
            >
              <div className="nav-icon-box">
                <Icon size={18} className="nav-icon" />
              </div>
              <span className="nav-label">{label}</span>
              {badge !== null && (
                <span
                  className="nav-badge"
                  style={badgeColor ? { background: badgeColor } : undefined}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer — theme switch */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <ThemeToggle size={40} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Top App Bar (visible on <= 1024px) */}
        <header className="mobile-app-header">
          <div className="mobile-app-brand">
            <div className="mobile-logo-icon">
              <Stethoscope size={18} />
            </div>
            <div>
              <span className="mobile-logo-title">{t('dashboard.logo')}</span>
            </div>
          </div>

          <div className="mobile-header-actions">
            {/* Mobile Language Dropdown */}
            <div ref={mobileLangDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMobileLangDropdownOpen(!mobileLangDropdownOpen)}
                className="mobile-lang-btn"
                aria-label="Change language"
              >
                <Globe size={15} />
                <span>{language === 'en' ? 'EN' : language === 'si' ? 'SI' : 'TA'}</span>
                <ChevronDown size={13} style={{ transform: mobileLangDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {mobileLangDropdownOpen && (
                <div className="mobile-lang-menu">
                  {[
                    { code: 'en', label: 'English', badge: 'EN' },
                    { code: 'si', label: 'සිංහල', badge: 'SI' },
                    { code: 'ta', label: 'தமிழ்', badge: 'TA' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as Language);
                        setMobileLangDropdownOpen(false);
                      }}
                      className={`mobile-lang-item ${language === item.code ? 'active' : ''}`}
                    >
                      <span>{item.badge} - {item.label}</span>
                      {language === item.code && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle size={36} />
          </div>
        </header>

        {/* Medical Disclaimer Banner */}
        <div className="disclaimer-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={22} className="disclaimer-icon" />
            <p>
              <strong>{t('disclaimer.title')}:</strong> {t('disclaimer.warning')}
            </p>
          </div>
        </div>

        {/* Compact Patient Info for Mobile (since sidebar is hidden) */}
        {patient && patient.name && (
          <div
            className="mobile-patient-info"
            style={{
              display: 'none',
              padding: '12px 16px',
              background: 'var(--bg-glass-strong)',
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: 'var(--space-lg)',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {patient.name}
              </span>
              {patient.age && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  ({patient.age} {patient.gender ? `• ${patient.gender}` : ''})
                </span>
              )}
            </div>
            {patient.bloodGroup && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {t('patient.bloodGroup')}: {patient.bloodGroup}
              </span>
            )}
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="processing-overlay">
              <div className="scanning-container">
                <div className="scanning-card">
                  <div className="scanning-laser" />
                  <svg className="scanning-document" viewBox="0 0 24 24" width="80" height="80">
                    <path
                      fill="currentColor"
                      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                      style={{ color: 'var(--accent-primary)', opacity: 0.85 }}
                    />
                  </svg>
                  <div className="scanning-pulse" />
                </div>
                <h3 className="processing-step-text">{processingStep}</h3>
                <p className="processing-sub-text">{t('common.loading')}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Upload */}
        {activeTab === 'upload' && !isProcessing && (
          <div className="tab-pane">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2>{t('upload.title')}</h2>
                <p>{t('dashboard.subtitle')}</p>
              </div>
              {(extractedData.length > 0 || timeline.length > 0) && (
                <button
                  onClick={() => window.print()}
                  className="btn-print-slip-large"
                  title="Print or Save PDF Doctor Consultation Slip"
                >
                  <Printer size={18} />
                  <span>{language === 'si' ? 'වෛද්‍ය වාර්තාව (PDF)' : language === 'ta' ? 'மருத்துவர் அறிக்கை (PDF)' : 'Export Doctor Slip (PDF)'}</span>
                </button>
              )}
            </div>

            <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div
                {...dropzone.getRootProps()}
                className={`upload-zone ${dropzone.isDragActive ? 'drag-active' : ''}`}
              >
                <input {...dropzone.getInputProps()} />
                <FileUp size={64} className="upload-icon" />
                <h3>{t('upload.dragDropHint')}</h3>
                <p>{t('upload.supportedFormats')}</p>
                <div className="upload-formats">
                  <span className="format-badge">PDF</span>
                  <span className="format-badge">PNG</span>
                  <span className="format-badge">JPG</span>
                  <span className="format-badge">WebP</span>
                </div>
              </div>
            </div>


            {/* Uploaded Files List */}
            {documents.length > 0 && (
              <div className="glass-card">
                <div className="glass-card-header">
                  <h3>
                    <FileText size={20} />
                    {t('stats.documentsUploaded')} ({documents.length})
                  </h3>
                  <SweepButton
                    onClick={processDocuments}
                    disabled={isProcessing || documents.length === 0}
                    icon={<Sparkles size={18} />}
                  >
                    {t('upload.processButton')}
                  </SweepButton>
                </div>

                <div className="file-list">
                  {documents.map((doc) => (
                    <div key={doc.id} className="file-item">
                      <div
                        className={`file-item-icon ${
                          doc.fileType.includes('pdf') ? 'pdf' : 'image'
                        }`}
                      >
                        <FileText size={20} />
                      </div>
                      <div className="file-item-info">
                        <div className="file-item-name">{doc.fileName}</div>
                        <div className="file-item-size">
                          {formatFileSize(doc.fileSize)}
                        </div>
                      </div>
                      <div className={`file-item-status ${doc.status}`}>
                        {doc.status === 'uploading' && (
                          <>
                            <CheckCircle2 size={14} />
                            {t('common.confirm')}
                          </>
                        )}
                        {doc.status === 'processing' && (
                          <>
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            {t('upload.processing')}
                          </>
                        )}
                        {doc.status === 'complete' && (
                          <>
                            <CheckCircle2 size={14} />
                            {t('upload.complete')}
                          </>
                        )}
                        {doc.status === 'error' && (
                          <>
                            <XCircle size={14} />
                            {t('upload.error')}
                          </>
                        )}
                      </div>
                      <button
                        className="file-remove"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {documents.length === 0 && (
              <div className="glass-card">
                <div className="empty-state">
                  <FileText size={80} className="empty-state-icon" />
                  <h3>{t('upload.noFiles')}</h3>
                  <p>{t('upload.dragDropHint')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Timeline */}
        {activeTab === 'timeline' && !isProcessing && (
          <div className="tab-pane">
            <div className="page-header">
              <h2>{t('timeline.title')}</h2>
              <p>{t('dashboard.subtitle')}</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon documents">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="stat-value">{timeline.length}</div>
                  <div className="stat-label">{t('stats.documentsUploaded')}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon medications">
                  <Pill size={24} />
                </div>
                <div>
                  <div className="stat-value">{totalMedications}</div>
                  <div className="stat-label">{t('patient.medications')}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon alerts">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="stat-value">{alertCount}</div>
                  <div className="stat-label">{t('stats.alertsFound')}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon labs">
                  <FlaskConical size={24} />
                </div>
                <div>
                  <div className="stat-value">{totalLabResults}</div>
                  <div className="stat-label">{t('timeline.labResults')}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {timeline.length > 0 ? (
              <div className="timeline">
                {timeline.map((event) => (
                  <TimelineEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="glass-card">
                <div className="empty-state">
                  <Clock size={80} className="empty-state-icon" />
                  <h3>{t('timeline.empty')}</h3>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '8px auto 0' }}>
                    Please upload and analyze a medical document to automatically generate your chronologic healthcare timeline.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="btn btn-primary"
                    style={{ marginTop: '16px' }}
                  >
                    <Upload size={16} />
                    {t('upload.title') || 'Upload Document'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Alerts */}
        {activeTab === 'alerts' && !isProcessing && (
          <div className="tab-pane">
            <div className="page-header">
              <h2>{t('alerts.title')}</h2>
              <p>{t('alerts.checkInteractions')}</p>
            </div>

            {/* Risk Banner */}
            {alerts.length > 0 && (
              <div className={`risk-banner ${overallRiskLevel}`}>
                <div className="risk-banner-icon">
                  {overallRiskLevel === 'critical' || overallRiskLevel === 'major' ? (
                    <AlertTriangle size={24} />
                  ) : overallRiskLevel === 'moderate' ? (
                    <AlertCircle size={24} />
                  ) : (
                    <CheckCircle2 size={24} />
                  )}
                </div>
                <div>
                  <h3>
                    {t('alerts.overallRisk')}:{' '}
                    {t(`alerts.${overallRiskLevel}`)}
                  </h3>
                  <p>{crossCheckSummary}</p>
                </div>
              </div>
            )}

            {/* Alert Cards */}
            <div className="alert-panel">
              {alerts.length > 0 ? (
                [...alerts].sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0)).map((alert, index) => (
                  <div
                    key={alert.id}
                    className={`alert-card ${alert.severity}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="alert-header">
                      <span className={`alert-severity ${alert.severity}`}>
                        {t(`alerts.${alert.severity}`)}
                      </span>
                      <span className="alert-type">
                        {alert.type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`confidence-badge ${getConfidenceLevel(
                          alert.confidenceScore
                        )}`}
                      >
                        <Shield size={10} />
                        {alert.confidenceScore}% confidence
                      </span>
                    </div>
                    <div className="alert-drugs">
                      {alert.title}
                    </div>
                    <p className="alert-description">{alert.description}</p>
                    <div className="alert-recommendation">
                      <Heart
                        size={16}
                        className="alert-recommendation-icon"
                      />
                      <p>
                        <strong>{t('alerts.recommendation')}:</strong> {alert.recommendation}
                      </p>
                    </div>

                    {/* Local Doctor Recommendation Panel */}
                    <FindDoctorPanel
                      specialty={alert.suggestedSpecialty || inferSpecialty(alert.type, `${alert.title} ${alert.description}`)}
                      urgencyHint={alert.urgencyHint || (alert.severity === 'critical' ? 'immediate' : 'this_week')}
                      context={alert.title}
                    />
                  </div>
                ))
              ) : (
                <div className="glass-card">
                  <div className="empty-state">
                    <Shield size={80} className="empty-state-icon" />
                    <h3>{t('alerts.noAlerts')}</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '8px auto 0' }}>
                      {extractedData.length === 0
                        ? 'Upload a prescription or medical report to check for drug interactions, duplicate medicines, and safety warnings.'
                        : t('alerts.consult')}
                    </p>
                    {extractedData.length === 0 && (
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                      >
                        <Upload size={16} />
                        {t('upload.title') || 'Upload Document'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Trends */}
        {activeTab === 'trends' && !isProcessing && (
          <div className="tab-pane">
            <div className="page-header">
              <h2>{t('trends.title')}</h2>
              <p>{t('dashboard.subtitle')}</p>
            </div>

            {trendsSummary && (
              <div className="summary-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                  {t('trends.summary')}
                </h3>
                <p>{trendsSummary}</p>
              </div>
            )}

            {trends.length > 0 ? (
              <div className="trends-grid">
                {trends.map((trend, index) => (
                  <LabTrendChartCard key={trend.testName} trend={trend} index={index} />
                ))}
              </div>
            ) : (
              <div className="glass-card">
                <div className="empty-state">
                  <TrendingUp size={80} className="empty-state-icon" />
                  <h3>{t('trends.noTrends')}</h3>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '8px auto 0' }}>
                    Upload consecutive lab reports or test results to visualize and track your biomarker trends over time.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="btn btn-primary"
                    style={{ marginTop: '16px' }}
                  >
                    <Upload size={16} />
                    {t('upload.title') || 'Upload Document'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Chat */}
        {activeTab === 'chat' && !isProcessing && (
          <div className="tab-pane">
            <div className="page-header">
              <h2>{t('chat.title')}</h2>
              <p>{t('chat.disclaimer')}</p>
            </div>

            <div className="chat-container">
              {/* WhatsApp / Telegram Header Bar */}
              <div className="chat-header-bar">
                <div className="chat-header-avatar">
                  <Bot size={22} />
                  <span className="chat-status-dot" />
                </div>
                <div className="chat-header-info">
                  <div className="chat-header-name">
                    Suwa Nalam AI Assistant
                    <span className="chat-bot-badge">AI BOT</span>
                  </div>
                  <div className="chat-header-status">
                    <span className="chat-online-indicator">Online</span> • Medical AI Assistant
                  </div>
                </div>
                <div className="chat-header-actions">
                  <div className="chat-encrypted-pill" title="End-to-end local clinical context encryption">
                    <Shield size={13} />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
                    <Bot size={64} className="empty-state-icon" />
                    <h3>{extractedData.length === 0 ? 'Upload Documents to Start Chatting' : t('chat.noMessages')}</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '8px auto 0' }}>
                      {extractedData.length === 0
                        ? 'Upload your prescriptions or medical reports first so the AI assistant can analyze your records and answer your health questions.'
                        : t('chat.placeholder')}
                    </p>
                    {extractedData.length === 0 && (
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                      >
                        <Upload size={16} />
                        {t('upload.title') || 'Upload Document'}
                      </button>
                    )}
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.role}`}>
                    <div className={`chat-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                      {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div>
                      <div className="chat-bubble">{msg.content}</div>
                      {msg.role === 'assistant' && (
                        <div className="chat-bubble-meta">
                          {msg.confidenceScore !== undefined && (
                            <span
                              className={`confidence-badge ${getConfidenceLevel(
                                msg.confidenceScore
                              )}`}
                            >
                              <Shield size={10} />
                              {msg.confidenceScore}% confidence
                            </span>
                          )}
                          {msg.sourceDocuments?.map((src, i) => (
                            <span key={i} className="chat-source-tag">
                               {src}
                            </span>
                          ))}
                        </div>
                      )}
                      {msg.shouldConsultDoctor && (
                        <div className="consult-doctor-badge">
                          <Stethoscope size={14} />
                          {t('chat.consultDoctorNotice')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="chat-message assistant">
                    <div className="chat-avatar ai">
                      <Bot size={18} />
                    </div>
                    <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('chat.loading')}</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area">
                {suggestedQuestions.length > 0 && chatMessages.length === 0 && (
                  <div className="chat-suggestions">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        className="chat-suggestion"
                        onClick={() => sendMessage(q.text)}
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                )}

                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    placeholder={t('chat.placeholder')}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isChatLoading || extractedData.length === 0}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={() => sendMessage()}
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Printable Doctor Consultation Slip (Only rendered during print/export) */}
        {(documents.length > 0 || timeline.length > 0) && (
          <div className="print-consultation-slip" aria-hidden="true">
            <div className="print-slip-header">
              <div className="print-slip-brand">
                <h2>YGC — Suwa Nalam AI (සුව நலம் AI)</h2>
                <div className="print-slip-badge">PATIENT SAFETY CONSULTATION HANDOVER SLIP</div>
              </div>
              <p className="print-slip-sub">
                Official Clinical Summary extracted across {documents.length} medical document(s) for physician review.
              </p>
              <div className="print-meta-grid">
                <div><strong>Patient Name:</strong> {patient?.name || 'Patient'}</div>
                <div><strong>Age / Gender:</strong> {patient?.age || 'N/A'} / {patient?.gender || 'N/A'}</div>
                <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Overall Risk Level:</strong> {overallRiskLevel.toUpperCase()}</div>
              </div>
            </div>

            {/* Medications Table */}
            <div className="print-section">
              <h3 className="print-section-title">1. Current Medications Across All Encounters</h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Medication Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Prescribing Provider / Date</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.flatMap((d) => d.medications || []).length > 0 ? (
                    extractedData.flatMap((d) => d.medications || []).map((med, idx) => (
                      <tr key={idx}>
                        <td><strong>{med.name}</strong> {med.genericName ? `(${med.genericName})` : ''}</td>
                        <td>{med.dosage || 'As directed'}</td>
                        <td>{med.frequency || 'Daily'}</td>
                        <td>{med.prescribedBy || 'Document record'} {med.prescribedDate ? `(${med.prescribedDate})` : ''}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No specific medications recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Identified Safety Alerts */}
            {alerts.length > 0 && (
              <div className="print-section">
                <h3 className="print-section-title">2. Detected Drug Interactions & Safety Warnings</h3>
                <div className="print-alerts-list">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className={`print-alert-item ${alert.severity}`}>
                      <div className="print-alert-headline">
                        <span className="print-severity-tag">[{alert.severity.toUpperCase()}]</span>
                        <strong>{alert.title}</strong>
                        <span className="print-confidence">({alert.confidenceScore}% AI Confidence)</span>
                      </div>
                      <p className="print-alert-body">{alert.description}</p>
                      <p className="print-alert-action"><strong>Recommended Action:</strong> {alert.recommendation}</p>
                      {alert.suggestedSpecialty && (
                        <p className="print-alert-action">
                          <strong>Recommended Specialty Consultation:</strong> {alert.suggestedSpecialty} ({alert.urgencyHint === 'immediate' ? 'Immediate / Urgent' : 'Routine / This Week'})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Trends Summary */}
            {(trendsSummary || trends.length > 0) && (
              <div className="print-section">
                <h3 className="print-section-title">3. Laboratory Trends & Biomarker Trajectory</h3>
                {trendsSummary && <p className="print-trends-overview">{trendsSummary}</p>}
                {trends.length > 0 && (
                  <ul className="print-trends-bullets">
                    {trends.map((t, idx) => (
                      <li key={idx}>
                        <strong>{t.testName} ({t.unit}):</strong> {t.trendDirection.toUpperCase()} trend — {t.explanation} (Normal Range: {t.normalRangeMin}–{t.normalRangeMax} {t.unit})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Footer Disclaimer */}
            <div className="print-slip-footer">
              <p>
                <strong>Clinical Notice:</strong> This document is an automated synthesis compiled by Suwa Nalam AI to assist in clinical handover and multi-prescription cross-checking. It is designed to aid healthcare professionals and does not substitute for independent medical examination, diagnosis, or clinical judgment.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom tab bar — the AI assistant sits raised in the middle,
          with the remaining tabs split two either side. */}
      <nav className="bottom-nav">
        {bottomTabs.map(({ id, Icon, label, disabled, badge, badgeColor }) => {
          const isAssistant = id === 'chat';
          return (
            <button
              key={id}
              className={`bottom-nav-item ${isAssistant ? 'is-assistant' : ''} ${
                activeTab === id ? 'active' : ''
              }`}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              disabled={disabled}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <span className="bottom-nav-icon">
                {isAssistant ? <AssistantOrb size={26} /> : <Icon size={20} />}
                {badge !== null && (
                  <span
                    className="bottom-nav-badge"
                    style={badgeColor ? { background: badgeColor } : undefined}
                  >
                    {badge}
                  </span>
                )}
              </span>
              <span className="bottom-nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
      {showLanguageModal && (
        <LanguageSelector allowClose onComplete={() => setShowLanguageModal(false)} />
      )}
    </div>
  );
}

// ============================================================
// Timeline Event Card Sub-Component
// ============================================================
function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="timeline-event">
      <div className={`timeline-dot ${event.documentType}`} />
      <div className="timeline-card" onClick={() => setExpanded(!expanded)}>
        <div className="timeline-date">{event.date}</div>
        <div className="timeline-card-header">
          <span className="timeline-title">{event.title}</span>
          <span className={`timeline-type-badge ${event.documentType}`}>
            {event.documentType.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="timeline-summary">{event.summary}</p>

        <div className="timeline-details">
          {event.medications.length > 0 && (
            <span className="timeline-tag">
              <Pill size={12} />
              {event.medications.length} {t('timeline.medications')}
            </span>
          )}
          {event.labResults.length > 0 && (
            <span className="timeline-tag">
              <FlaskConical size={12} />
              {event.labResults.length} {t('timeline.labResults')}
            </span>
          )}
          {event.diagnoses.length > 0 && (
            <span className="timeline-tag">
              <Activity size={12} />
              {event.diagnoses.length} {t('patient.knownConditions')}
            </span>
          )}
          {event.allergies.length > 0 && (
            <span className="timeline-tag">
              <AlertCircle size={12} />
              {event.allergies.length} {t('patient.allergies')}
            </span>
          )}
          <span className="timeline-tag" style={{ marginLeft: 'auto' }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {expanded ? t('common.close') : t('timeline.viewDetails')}
          </span>
        </div>

        {expanded && (
          <div className="timeline-expanded">
            {event.medications.length > 0 && (
              <div className="timeline-section">
                <h4>{t('timeline.medications')}</h4>
                <div className="timeline-med-list">
                  {event.medications.map((med, i) => (
                    <div key={i} className="timeline-med-item">
                      <span className="timeline-med-name">
                        {med.name}
                        {med.genericName ? ` (${med.genericName})` : ''}
                      </span>
                      <span className="timeline-med-dosage">
                        {med.dosage} — {med.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.labResults.length > 0 && (
              <div className="timeline-section">
                <h4>{t('timeline.labResults')}</h4>
                <div className="timeline-med-list">
                  {event.labResults.map((lab, i) => (
                    <div key={i} className="timeline-lab-item">
                      <span className="timeline-lab-name">{lab.testName}</span>
                      <span
                        className={`timeline-lab-value ${lab.status.toLowerCase()}`}
                      >
                        {lab.value} {lab.unit}{' '}
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          (ref: {lab.normalRange})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.diagnoses.length > 0 && (
              <div className="timeline-section">
                <h4>{t('patient.knownConditions')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {event.diagnoses.map((d, i) => (
                    <span key={i} className="format-badge" style={{ fontSize: '0.8rem' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.allergies.length > 0 && (
              <div className="timeline-section">
                <h4>{t('patient.allergies')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {event.allergies.map((a, i) => (
                    <span
                      key={i}
                      className="format-badge"
                      style={{
                        fontSize: '0.8rem',
                        background: 'var(--color-danger-dim)',
                        color: 'var(--color-danger)',
                        borderColor: 'rgba(104,104,104,0.3)',
                      }}
                    >
                       {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Lab Trend Chart Sub-Component
// ============================================================
function LabTrendChartCard({ trend, index }: { trend: LabTrend; index: number }) {
  const { t } = useI18n();

  const TrendIcon =
    trend.trendDirection === 'increasing'
      ? ArrowUpRight
      : trend.trendDirection === 'decreasing'
      ? ArrowDownRight
      : trend.trendDirection === 'stable'
      ? Minus
      : Shuffle;

  const chartData = {
    labels: trend.dataPoints.map((dp) => dp.date),
    datasets: [
      {
        label: trend.testName,
        data: trend.dataPoints.map((dp) => dp.value),
        borderColor: trend.isWorrying ? 'var(--color-danger)' : 'var(--accent-primary)',
        backgroundColor: trend.isWorrying
          ? 'rgba(104,104,104,0.12)'
          : 'rgba(29,95,208,0.14)',
        borderWidth: 2,
        pointBackgroundColor: trend.dataPoints.map((dp) => {
          const val = dp.value;
          if (val < trend.normalRangeMin || val > trend.normalRangeMax) return 'var(--color-danger)';
          return 'var(--color-success)';
        }),
        pointBorderColor: 'transparent',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--bg-card-hover)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-color-hover)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) =>
            `${context.parsed.y} ${trend.unit} (Normal: ${trend.normalRangeMin}–${trend.normalRangeMax})`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(161,161,161,0.18)' },
        ticks: { color: 'var(--text-tertiary)', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(161,161,161,0.18)' },
        ticks: { color: 'var(--text-tertiary)', font: { size: 11 } },
        suggestedMin: Math.min(trend.normalRangeMin * 0.8, ...trend.dataPoints.map((d) => d.value)),
        suggestedMax: Math.max(trend.normalRangeMax * 1.2, ...trend.dataPoints.map((d) => d.value)),
      },
    },
  };

  return (
    <div className="trend-card" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="trend-card-header">
        <span className="trend-card-title">
          {trend.testName} ({trend.unit})
        </span>
        <span className={`trend-direction ${trend.trendDirection}`}>
          <TrendIcon size={14} />
          {t(`trends.${trend.trendDirection}`)}
        </span>
      </div>

      <div className="trend-chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className={`trend-explanation ${trend.isWorrying ? 'worrying' : ''}`}>
        {trend.isWorrying && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '6px' }}>
            <AlertTriangle size={14} />
            {t('alerts.important')}
          </span>
        )}
        <p style={{ margin: 0 }}>{trend.explanation}</p>
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--color-warning)' }}>
          <Stethoscope size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          {t('alerts.consult')}
        </p>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
        <span
          className={`confidence-badge ${
            trend.confidenceScore >= 80
              ? 'high'
              : trend.confidenceScore >= 50
              ? 'medium'
              : 'low'
          }`}
        >
          <Shield size={10} />
          {trend.confidenceScore}% confidence
        </span>
      </div>
    </div>
  );
}

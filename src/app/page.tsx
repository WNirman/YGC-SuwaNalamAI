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
import { DisclaimerScreen } from '@/components/DisclaimerScreen';

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
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(true);
  const [apiKeyError, setApiKeyError] = useState('');

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

  // Optional manual modal switch
  if (showLanguageModal) {
    return <LanguageSelector allowClose onComplete={() => setShowLanguageModal(false)} />;
  }


  // ============================================================
  // STEP 4: Main Application (Loaded in Selected Language)
  // ============================================================
  return (
    <div className="app-layout">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

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

        {/* Language Switcher Bar in Sidebar */}
        <div
          style={{
            margin: '0 0 16px 0',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Globe size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>{t('language.switchLanguage')}:</span>
          </div>
          <button
            onClick={() => setShowLanguageModal(true)}
            style={{
              background: 'var(--accent-primary-dim)',
              border: '1px solid var(--border-color-hover)',
              color: 'var(--accent-primary)',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {language === 'en' ? '🇬🇧 EN' : language === 'si' ? '🇱🇰 SI' : '🇱🇰 TA'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upload'); setSidebarOpen(false); }}
          >
            <Upload size={20} className="nav-icon" />
            {t('dashboard.uploadTabName')}
          </button>
          <button
            className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => { setActiveTab('timeline'); setSidebarOpen(false); }}
            disabled={timeline.length === 0}
          >
            <Clock size={20} className="nav-icon" />
            {t('dashboard.timelineTabName')}
            {timeline.length > 0 && (
              <span className="nav-badge" style={{ background: 'var(--color-info)' }}>
                {timeline.length}
              </span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('alerts'); setSidebarOpen(false); }}
            disabled={extractedData.length === 0}
          >
            <AlertTriangle size={20} className="nav-icon" />
            {t('dashboard.alertsTabName')}
            {alertCount > 0 && (
              <span className="nav-badge">{alertCount}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => { setActiveTab('trends'); setSidebarOpen(false); }}
            disabled={trends.length === 0}
          >
            <TrendingUp size={20} className="nav-icon" />
            {t('dashboard.trendsTabName')}
          </button>
          <button
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
            disabled={extractedData.length === 0}
          >
            <MessageCircle size={20} className="nav-icon" />
            {t('dashboard.chatTabName')}
          </button>

        </nav>

        {/* Patient Info (if available) */}
        {patient && patient.name && (
          <div
            style={{
              marginTop: 'auto',
              padding: 'var(--space-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <User size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {patient.name}
              </span>
            </div>
            {patient.age && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {t('patient.age')}: {patient.age} {patient.gender ? `• ${patient.gender}` : ''}
              </p>
            )}
            {patient.bloodGroup && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {t('patient.bloodGroup')}: {patient.bloodGroup}
              </p>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Medical Disclaimer Banner */}
        <div className="disclaimer-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={20} className="disclaimer-icon" />
            <p>
              <strong>{t('disclaimer.title')}:</strong> {t('disclaimer.warning')}
            </p>
          </div>

          <button
            onClick={() => setShowLanguageModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Globe size={14} />
            {language === 'en' ? 'English' : language === 'si' ? 'සිංහල' : 'தமிழ்'}
          </button>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="processing-overlay">
              <div className="spinner spinner-lg" />
              <h3>{processingStep}</h3>
              <p>{t('common.loading')}</p>
            </div>
          </div>
        )}

        {/* TAB: Upload */}
        {activeTab === 'upload' && !isProcessing && (
          <>
            <div className="page-header">
              <h2>{t('upload.title')}</h2>
              <p>{t('dashboard.subtitle')}</p>
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
                  <button
                    className="btn btn-primary"
                    onClick={processDocuments}
                    disabled={isProcessing || documents.length === 0}
                  >
                    <Sparkles size={18} />
                    {t('upload.processButton')}
                  </button>
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
          </>
        )}

        {/* TAB: Timeline */}
        {activeTab === 'timeline' && !isProcessing && (
          <>
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
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: Alerts */}
        {activeTab === 'alerts' && !isProcessing && (
          <>
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
                alerts.map((alert, index) => (
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
                  </div>
                ))
              ) : (
                <div className="glass-card">
                  <div className="empty-state">
                    <Shield size={80} className="empty-state-icon" />
                    <h3>{t('alerts.noAlerts')}</h3>
                    <p>{t('alerts.consult')}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: Trends */}
        {activeTab === 'trends' && !isProcessing && (
          <>
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
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: Chat */}
        {activeTab === 'chat' && !isProcessing && (
          <>
            <div className="page-header">
              <h2>{t('chat.title')}</h2>
              <p>{t('chat.disclaimer')}</p>
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
                    <Bot size={64} className="empty-state-icon" />
                    <h3>{t('chat.noMessages')}</h3>
                    <p>{t('chat.placeholder')}</p>
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
                              📄 {src}
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
                      <div className="spinner" />
                      {t('chat.loading')}
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
          </>
        )}
      </main>
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
                        borderColor: 'rgba(239,68,68,0.3)',
                      }}
                    >
                      ⚠️ {a}
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
          ? 'rgba(239, 68, 68, 0.1)'
          : 'rgba(37, 99, 235, 0.1)',
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
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
        ticks: { color: 'var(--text-tertiary)', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
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

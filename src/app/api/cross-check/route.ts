import { NextRequest, NextResponse } from 'next/server';
import { crossCheckPrescriptions } from '@/lib/openai';
import type { Medication, Alert } from '@/types/medical';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      medications,
      allergies,
      diagnoses,
      patientInfo,
    } = body as {
      medications: Medication[];
      allergies: string[];
      diagnoses: string[];
      patientInfo: string;
    };

    if (!medications || medications.length === 0) {
      return NextResponse.json({
        success: true,
        interactions: [],
        alerts: [],
        overallRiskLevel: 'info',
        summary: 'No medications found to cross-check.',
      });
    }

    const result = await crossCheckPrescriptions(
      medications,
      allergies || [],
      diagnoses || [],
      patientInfo || 'Not available'
    );

    // Convert interactions to alerts for the UI
    const alerts: Alert[] = result.interactions.map((interaction) => ({
      id: randomUUID(),
      type:
        interaction.type === 'interaction'
          ? 'drug_interaction'
          : interaction.type === 'duplicate'
          ? 'duplicate_prescription'
          : interaction.type === 'dosage_conflict'
          ? 'dosage_conflict'
          : 'allergy_warning',
      severity: interaction.severity,
      title: `${interaction.drug1} ↔ ${interaction.drug2}`,
      description: interaction.description,
      recommendation: interaction.recommendation,
      confidenceScore: interaction.confidenceScore,
      relatedDocuments: interaction.affectedDocuments || [],
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      interactions: result.interactions,
      alerts,
      overallRiskLevel: result.overallRiskLevel,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Cross-check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cross-check prescriptions' },
      { status: 500 }
    );
  }
}

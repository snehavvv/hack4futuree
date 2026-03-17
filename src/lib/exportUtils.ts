import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types';
import { getScoreBand, getScoreBandLabel } from '../types';

// Export analysis as JSON
export function exportAsJSON(result: AnalysisResult): void {
  const data = JSON.stringify(result, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `squintscale-report-${result.jobId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export analysis as PDF
export async function exportAsPDF(result: AnalysisResult): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFillColor(6, 6, 15);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(0, 240, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SQUINT SCALE', margin, 20);

  doc.setTextColor(160, 160, 192);
  doc.setFontSize(10);
  doc.text('AI-Powered Readability Analysis Report', margin, 28);

  doc.setTextColor(100, 100, 140);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date(result.createdAt).toLocaleDateString()} | Job: ${result.jobId}`, margin, 35);

  y = 55;

  // Score Card
  const band = getScoreBand(result.squintScore);
  const bandLabel = getScoreBandLabel(band);

  doc.setFillColor(18, 18, 42);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');

  doc.setTextColor(240, 240, 255);
  doc.setFontSize(14);
  doc.text('Squint Score', margin + 10, y + 12);

  doc.setFontSize(36);
  doc.setTextColor(...getScorePDFColor(band));
  doc.text(`${result.squintScore}`, margin + 10, y + 30);

  doc.setFontSize(12);
  doc.text(`/ 100  —  ${bandLabel}`, margin + 35, y + 30);

  doc.setFontSize(9);
  doc.setTextColor(160, 160, 192);
  doc.text(`Preset: ${result.preset}`, margin + contentWidth - 40, y + 12);

  y += 42;

  // Dimension Breakdown
  doc.setTextColor(0, 240, 255);
  doc.setFontSize(13);
  doc.text('Dimension Breakdown', margin, y);
  y += 8;

  for (const dim of result.dimensions) {
    doc.setTextColor(240, 240, 255);
    doc.setFontSize(9);
    doc.text(dim.name, margin + 5, y);

    doc.setTextColor(160, 160, 192);
    doc.text(`${dim.score}/100`, margin + contentWidth - 15, y);

    // Progress bar background
    doc.setFillColor(30, 30, 60);
    doc.roundedRect(margin + 5, y + 2, contentWidth - 25, 3, 1, 1, 'F');

    // Progress bar fill
    const barWidth = ((contentWidth - 25) * dim.score) / 100;
    const dimBand = getScoreBand(dim.score);
    doc.setFillColor(...getScorePDFColor(dimBand));
    doc.roundedRect(margin + 5, y + 2, barWidth, 3, 1, 1, 'F');

    y += 10;
  }

  y += 5;

  // Top 5 Suggestions
  doc.setTextColor(0, 240, 255);
  doc.setFontSize(13);
  doc.text('Top Suggestions', margin, y);
  y += 8;

  const topSuggestions = result.suggestions.slice(0, 5);
  for (let i = 0; i < topSuggestions.length; i++) {
    const s = topSuggestions[i];
    if (y > 260) { doc.addPage(); y = margin; }

    doc.setFillColor(18, 18, 42);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');

    const impactColor = s.impact === 'high' ? [239, 68, 68] : s.impact === 'medium' ? [245, 158, 11] : [0, 240, 255];
    doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
    doc.setFontSize(7);
    doc.text(s.impact.toUpperCase(), margin + 3, y + 5);

    doc.setTextColor(240, 240, 255);
    doc.setFontSize(9);
    doc.text(s.title, margin + 18, y + 5);

    doc.setTextColor(160, 160, 192);
    doc.setFontSize(7);
    const descLines = doc.splitTextToSize(s.description, contentWidth - 10);
    doc.text(descLines[0] || '', margin + 3, y + 10);

    y += 15;
  }

  y += 5;

  // WCAG Summary
  if (y > 240) { doc.addPage(); y = margin; }

  doc.setTextColor(0, 240, 255);
  doc.setFontSize(13);
  doc.text('WCAG 2.2 Compliance Summary', margin, y);
  y += 8;

  const passed = result.wcagIssues.filter(i => i.status === 'pass').length;
  const failed = result.wcagIssues.filter(i => i.status === 'fail').length;
  const warnings = result.wcagIssues.filter(i => i.status === 'warning').length;

  doc.setFontSize(9);
  doc.setTextColor(34, 197, 94);
  doc.text(`✓ ${passed} Passed`, margin + 5, y);
  doc.setTextColor(239, 68, 68);
  doc.text(`✗ ${failed} Failed`, margin + 40, y);
  doc.setTextColor(245, 158, 11);
  doc.text(`⚠ ${warnings} Warnings`, margin + 75, y);

  y += 8;

  for (const issue of result.wcagIssues) {
    if (y > 275) { doc.addPage(); y = margin; }
    const statusColor = issue.status === 'pass' ? [34, 197, 94] : issue.status === 'fail' ? [239, 68, 68] : [245, 158, 11];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFontSize(7);
    doc.text(issue.status.toUpperCase(), margin + 5, y);

    doc.setTextColor(160, 160, 192);
    doc.text(`${issue.criterion}`, margin + 20, y);

    doc.setTextColor(240, 240, 255);
    doc.setFontSize(8);
    doc.text(issue.title, margin + 35, y);

    y += 6;
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 10;
  doc.setTextColor(100, 100, 140);
  doc.setFontSize(7);
  doc.text('Squint Scale — AI-Powered Readability Analysis | squintscale.io', margin, y);

  doc.save(`squintscale-report-${result.jobId}.pdf`);
}

function getScorePDFColor(band: string): [number, number, number] {
  switch (band) {
    case 'excellent': return [34, 197, 94];
    case 'good': return [0, 240, 255];
    case 'moderate': return [245, 158, 11];
    case 'poor': return [239, 68, 68];
    case 'critical': return [153, 27, 27];
    default: return [160, 160, 192];
  }
}

// Share link
export function generateShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

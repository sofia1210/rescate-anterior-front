/*
  Global report PDF generator with a clean, formal and modern layout.
  Exports: generateGlobalReportPdf(snapshot)
*/

type Snapshot = {
  fechaGeneracion: string;
  periodo: string;
  totalAnimalesRegistrados: number;
  animalesEnTratamiento: number;
  animalesRescatados: number;
  animalesLiberados: number;
  porcentajeRegistrados: number;
  porcentajeTratamiento: number;
  porcentajeRescatados: number;
  porcentajeLiberados: number;
  seriesMensual: { labels: string[]; valores: number[] };
  animalesSaludOk: number;
  animalesSaludNoOk: number;
  tipoDomestico: number;
  tipoSilvestre: number;
  rescuerCount: number;
  veterinarianCount: number;
};

const loadJsPDF = () => new Promise<any>((resolve, reject) => {
  const existing: any = (window as any).jspdf?.jsPDF;
  if (existing) return resolve(existing);
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.async = true;
  s.onload = () => resolve((window as any).jspdf.jsPDF);
  s.onerror = reject;
  document.head.appendChild(s);
});

const drawHeader = (doc: any, title: string, subtitle: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const bannerHeight = 28;
  // Gradient-like band using two rectangles
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, bannerHeight, 'F');
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, bannerHeight - 6, pageWidth, 6, 'F');
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, 14, 24);
};

const drawSectionTitle = (doc: any, text: string, y: number) => {
  doc.setTextColor(31, 41, 55); // gray-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(text, 14, y);
};

const drawKpiCard = (
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  value: string,
  accent: [number, number, number]
) => {
  // Card
  doc.setDrawColor(229, 231, 235); // gray-200 border
  doc.setFillColor(255, 255, 255);
  if (typeof (doc as any).roundedRect === 'function') (doc as any).roundedRect(x, y, w, h, 3, 3, 'FD');
  else doc.rect(x, y, w, h, 'FD');

  // Accent line
  doc.setFillColor(...accent);
  doc.rect(x, y, 4, h, 'F');

  // Text
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title, x + 8, y + 9);

  doc.setTextColor(17, 24, 39); // gray-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(value, x + 8, y + 22);
};

const drawBarChart = (
  doc: any,
  x: number,
  y: number,
  w: number,
  h: number,
  labels: string[],
  values: number[],
  color: [number, number, number]
) => {
  const max = Math.max(1, ...values);
  const barGap = 8;
  const barWidth = (w - barGap * (values.length + 1)) / (values.length || 1);

  // Axes
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(x, y, x, y + h);
  doc.line(x, y + h, x + w, y + h);

  // Bars
  values.forEach((v, i) => {
    const bx = x + barGap + i * (barWidth + barGap);
    const bh = max ? (v / max) * (h - 10) : 0;
    const by = y + h - bh;
    doc.setFillColor(...color);
    if (bh > 0) doc.rect(bx, by, barWidth, bh, 'F');
    // Label
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const lab = String(labels[i] ?? '');
    const tw = doc.getTextWidth(lab);
    doc.text(lab, bx + Math.max(0, barWidth / 2 - tw / 2), y + h + 6);
  });
};

export const generateGlobalReportPdf = async (snapshot: Snapshot) => {
  const jsPDF: any = await loadJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  drawHeader(doc, 'Reporte Global - Sistema de Rescate Animal', `Generado: ${snapshot.fechaGeneracion}  •  Periodo: ${snapshot.periodo}`);

  let y = 36;
  drawSectionTitle(doc, 'Resumen General', y);
  y += 6;

  // KPI grid (2 columns x 4 rows)
  const cols = 2;
  const cardW = (pageWidth - 28 - 8) / cols; // margins 14/14, gap 8
  const cardH = 26;
  const gap = 8;
  const cards: Array<{ t: string; v: string; c: [number, number, number] }> = [
    { t: 'Total de animales', v: String(snapshot.totalAnimalesRegistrados), c: [59, 130, 246] }, // blue-500
    { t: 'Con evaluaciones', v: String(snapshot.animalesEnTratamiento), c: [99, 102, 241] }, // indigo-500
    { t: 'Salud OK', v: String(snapshot.animalesSaludOk), c: [16, 185, 129] }, // emerald-500
    { t: 'Salud NO OK', v: String(snapshot.animalesSaludNoOk), c: [239, 68, 68] }, // red-500
    { t: 'Domésticos', v: String(snapshot.tipoDomestico), c: [234, 179, 8] }, // yellow-500
    { t: 'Silvestres', v: String(snapshot.tipoSilvestre), c: [249, 115, 22] }, // orange-500
    { t: 'Rescatistas', v: String(snapshot.rescuerCount), c: [20, 184, 166] }, // teal-500
    { t: 'Veterinarios', v: String(snapshot.veterinarianCount), c: [168, 85, 247] }, // purple-500
  ];

  let cx = 14;
  let cy = y;
  cards.forEach((kpi, i) => {
    drawKpiCard(doc, cx, cy, cardW, cardH, kpi.t, kpi.v, kpi.c);
    if ((i % cols) === cols - 1) { cy += cardH + gap; cx = 14; }
    else { cx += cardW + gap; }
  });
  y = cy + 2;

  // Monthly series
  y += 6;
  drawSectionTitle(doc, 'Serie de rescates - últimos 6 meses', y);
  y += 4;
  drawBarChart(doc, 14, y, pageWidth - 28, 48, snapshot.seriesMensual.labels, snapshot.seriesMensual.valores, [59, 130, 246]);
  y += 56;

  // Footer note
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Generado automáticamente por el sistema', 14, 290);

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`reporte-global-${dateStr}.pdf`);
};

export default generateGlobalReportPdf;






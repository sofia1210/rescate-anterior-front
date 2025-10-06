/*
  Excel (XLS via HTML table) export utility for dashboard snapshot
  Usage: downloadXlsFromSnapshot(snapshot)
  Additionally exposes buildTableHtml(snapshot) to render a plain table in the UI if desired.
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

export const buildTableHtml = (snapshot: Snapshot): string => {
  const kpiRows = [
    ["Total de animales", snapshot.totalAnimalesRegistrados],
    ["Con evaluaciones", snapshot.animalesEnTratamiento],
    ["Buena salud", snapshot.animalesSaludOk],
    ["Mala salud", snapshot.animalesSaludNoOk],
    ["Domésticos", snapshot.tipoDomestico],
    ["Silvestres", snapshot.tipoSilvestre],
    ["Rescatistas", snapshot.rescuerCount],
    ["Veterinarios", snapshot.veterinarianCount],
    ["Animales rescatados", snapshot.animalesRescatados],
    ["Animales liberados", snapshot.animalesLiberados],
    ["% Tratamiento", snapshot.porcentajeTratamiento],
    ["% Liberados", snapshot.porcentajeLiberados],
  ];

  const seriesRows = (snapshot.seriesMensual.labels || []).map((lab, i) => [lab, String(snapshot.seriesMensual.valores[i] ?? 0)]);

  const escapeHtml = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const table1 = `
    <table border="1" cellspacing="0" cellpadding="4">
      <thead>
        <tr>
          <th colspan="3">Reporte global</th>
        </tr>
        <tr>
          <th>Sección</th><th>Indicador</th><th>Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>General</td><td>Fecha de generación</td><td>${escapeHtml(snapshot.fechaGeneracion)}</td></tr>
        <tr><td>General</td><td>Periodo</td><td>${escapeHtml(snapshot.periodo)}</td></tr>
        ${kpiRows.map(([k, v]) => `<tr><td>KPIs</td><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  const table2 = `
    <table border="1" cellspacing="0" cellpadding="4">
      <thead>
        <tr><th colspan="2">Serie mensual</th></tr>
        <tr><th>Mes</th><th>Conteo</th></tr>
      </thead>
      <tbody>
        ${seriesRows.map(([m, c]) => `<tr><td>${escapeHtml(m)}</td><td>${escapeHtml(c)}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${table1}<br/>${table2}</body></html>`;
};

export const downloadXlsFromSnapshot = (snapshot: Snapshot) => {
  const html = buildTableHtml(snapshot);
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `reporte-global-${dateStr}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default downloadXlsFromSnapshot;



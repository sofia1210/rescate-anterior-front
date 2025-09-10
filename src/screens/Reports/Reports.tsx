import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Navbar } from "../../components/Navbar";
import { useThemeClasses } from "../../hooks/useThemeClasses";

export const Reports = (): JSX.Element => {
  const { getThemeClasses } = useThemeClasses();
  const [isSaving, setIsSaving] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [savedReportData, setSavedReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [rescuers, setRescuers] = useState<any[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const apiBase = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "") : "";
        const endpoints = [
          `${apiBase}/animales`,
          `${apiBase}/rescatistas`,
          `${apiBase}/veterinarios`,
          `${apiBase}/evaluations`,
        ];
        const [aRes, rRes, vRes, eRes] = await Promise.all(
          endpoints.map((url) => fetch(url).then((r) => r.json()).catch(() => ({ postgres: [] })))
        );
        const aData: any = aRes;
        const rData: any = rRes;
        const vData: any = vRes;
        const eData: any = eRes;
        if (!alive) return;
        const toPg = (d: any) => (Array.isArray(d) ? d : (d?.postgres ?? []));
        setAnimals(toPg(aData));
        setRescuers(toPg(rData));
        setVeterinarians(toPg(vData));
        setEvaluations(toPg(eData));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudieron cargar datos");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const metrics = useMemo(() => {
    const totalAnimales = animals.length;
    const saludOkSet = new Set(["muy bueno", "bueno", "sano", "excelente"]);
    const normaliza = (s: string | null | undefined) => (s || "").toLowerCase().trim();
    const animalesSaludOk = animals.filter((a: any) => saludOkSet.has(normaliza(a.estadoSalud))).length;
    const animalesSaludNoOk = totalAnimales - animalesSaludOk;
    const tipoDomestico = animals.filter((a: any) => normaliza(a.tipo).includes("domestico")).length;
    const tipoSilvestre = animals.filter((a: any) => normaliza(a.tipo).includes("silvestre")).length;
    const animalesConEvaluaciones = new Set((Array.isArray(evaluations) ? evaluations : []).map((ev: any) => ev.nombreAnimal || ev.animalId)).size;
    const especieMap = new Map<string, number>();
    animals.forEach((a: any) => {
      const key = (a.especie || "").toString().trim() || "(Sin especie)";
      especieMap.set(key, (especieMap.get(key) || 0) + 1);
    });
    const especiesTop = Array.from(especieMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const fechas = animals
      .map((a: any) => a.fechaRescate)
      .filter(Boolean)
      .map((d: string) => new Date(d))
      .filter((d: Date) => !isNaN(d.getTime()))
      .sort((a: any, b: any) => a.getTime() - b.getTime());
    const periodo = fechas.length ? `${fechas[0].toLocaleDateString('es-ES')} - ${fechas[fechas.length-1].toLocaleDateString('es-ES')}` : "Sin rango";

    // Serie temporal por mes (YYYY-MM)
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthToCount = new Map<string, number>();
    (animals || []).forEach((a: any) => {
      if (!a?.fechaRescate) return;
      const d = new Date(a.fechaRescate);
      if (isNaN(d.getTime())) return;
      const key = monthKey(d);
      monthToCount.set(key, (monthToCount.get(key) || 0) + 1);
    });
    const orderedMonths = Array.from(monthToCount.keys()).sort();
    const lastMonths = orderedMonths.slice(-6); // últimos 6 meses
    const byMonthLabels = lastMonths.map((k) => {
      const [y, m] = k.split('-');
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleDateString('es-ES', { month: 'short' });
    });
    const byMonthCounts = lastMonths.map((k) => monthToCount.get(k) || 0);
    const byMonthMax = Math.max(1, ...byMonthCounts);

    return { totalAnimales, animalesSaludOk, animalesSaludNoOk, tipoDomestico, tipoSilvestre, rescuerCount: rescuers.length, veterinarianCount: veterinarians.length, animalesConEvaluaciones, especiesTop, periodo, byMonthLabels, byMonthCounts, byMonthMax };
  }, [animals, rescuers, veterinarians, evaluations]);

  const handleSaveReport = async () => {
    setIsSaving(true);
    
    // Simular guardado con delay
    setTimeout(() => {
      const snapshot = {
        fechaGeneracion: new Date().toLocaleDateString('es-ES'),
        periodo: metrics.periodo,
        totalAnimalesRegistrados: metrics.totalAnimales,
        animalesEnTratamiento: metrics.animalesConEvaluaciones,
        animalesRescatados: metrics.totalAnimales,
        animalesLiberados: metrics.tipoSilvestre,
        porcentajeRegistrados: 100,
        porcentajeTratamiento: metrics.totalAnimales ? Math.round((metrics.animalesConEvaluaciones / metrics.totalAnimales) * 100) : 0,
        porcentajeRescatados: 100,
        porcentajeLiberados: metrics.totalAnimales ? Math.round((metrics.tipoSilvestre / metrics.totalAnimales) * 100) : 0,
        seriesMensual: {
          labels: metrics.byMonthLabels,
          valores: metrics.byMonthCounts,
        },
        animalesSaludOk: metrics.animalesSaludOk,
        animalesSaludNoOk: metrics.animalesSaludNoOk,
        tipoDomestico: metrics.tipoDomestico,
        tipoSilvestre: metrics.tipoSilvestre,
        rescuerCount: metrics.rescuerCount,
        veterinarianCount: metrics.veterinarianCount,
      } as const;

      // Descargar PDF (jsPDF desde CDN)
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
      (async () => {
        try {
          const jsPDF: any = await loadJsPDF();
          const doc = new jsPDF();
          const dateStr = new Date().toISOString().slice(0,10);

          doc.setFontSize(16);
          doc.text('Reporte Automático', 14, 16);
          doc.setFontSize(11);
          doc.text(`Fecha: ${snapshot.fechaGeneracion}`, 14, 24);
          doc.text(`Periodo: ${snapshot.periodo}`, 14, 30);

          let y = 40;
          const lines: Array<[string, string]> = [
            ['Total animales', String(snapshot.totalAnimalesRegistrados)],
            ['Con evaluaciones', String(snapshot.animalesEnTratamiento)],
            ['Salud OK', String(snapshot.animalesSaludOk)],
            ['Salud NO OK', String(snapshot.animalesSaludNoOk)],
            ['Doméstico', String(snapshot.tipoDomestico)],
            ['Silvestre', String(snapshot.tipoSilvestre)],
            ['Rescatistas', String(snapshot.rescuerCount)],
            ['Veterinarios', String(snapshot.veterinarianCount)],
          ];
          lines.forEach(([k, v]) => { doc.text(`${k}: ${v}`, 14, y); y += 6; });

          if (snapshot.seriesMensual.labels.length) {
            y += 4;
            doc.text('Serie mensual (últimos 6 meses):', 14, y);
            y += 6;
            snapshot.seriesMensual.labels.forEach((lab, i) => {
              doc.text(`${lab}: ${snapshot.seriesMensual.valores[i]}`, 16, y);
              y += 6;
            });
          }

          doc.save(`reporte-${dateStr}.pdf`);
        } catch {}
      })();

      setSavedReportData(snapshot);
      setReportSaved(true);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Reportes Automáticos" 
       
      />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className=" text-xl font-semibold">Reportes Automáticos</h2>
        </div>

        <div className={getThemeClasses(
          "bg-white rounded-lg p-6 shadow-lg",
          "bg-white rounded-lg p-6 shadow-lg shadow-green-200/50 border border-green-100"
        )}>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-600">
              <svg className="animate-spin h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Cargando datos...
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">Resumen de animales</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-sm text-gray-600">Últimos 6 meses</div>
                      <div className="text-2xl font-bold">{metrics.byMonthCounts.reduce((a, b) => a + b, 0)}</div>
                    </div>
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-sm text-gray-600">Mes con más rescates</div>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const idx = metrics.byMonthCounts.indexOf(Math.max(...metrics.byMonthCounts));
                          return idx >= 0 ? (metrics.byMonthLabels[idx] || '-') : '-';
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">Periodo: {metrics.periodo}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Total de animales registrados</h4>
                    <div className="text-3xl font-bold mb-2">{metrics.totalAnimales}</div>
                    <div className="h-8 bg-blue-100 rounded">
                      <div className="h-full bg-blue-500 rounded" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Animales con evaluaciones médicas</h4>
                    <div className="text-3xl font-bold mb-2">{metrics.animalesConEvaluaciones}</div>
                    <div className="h-8 bg-blue-100 rounded">
                      <div className="h-full bg-blue-500 rounded" style={{ width: `${metrics.totalAnimales ? Math.round((metrics.animalesConEvaluaciones / metrics.totalAnimales) * 100) : 0}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Animales con salud OK</h4>
                    <div className="text-3xl font-bold mb-2">{metrics.animalesSaludOk}</div>
                    <div className="h-8 bg-blue-100 rounded">
                      <div className="h-full bg-green-500 rounded" style={{ width: `${metrics.totalAnimales ? Math.round((metrics.animalesSaludOk / metrics.totalAnimales) * 100) : 0}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Animales salud NO OK</h4>
                    <div className="text-3xl font-bold mb-2">{metrics.animalesSaludNoOk}</div>
                    <div className="h-8 bg-blue-100 rounded">
                      <div className="h-full bg-red-500 rounded" style={{ width: `${metrics.totalAnimales ? Math.round((metrics.animalesSaludNoOk / metrics.totalAnimales) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={handleSaveReport}
              disabled={isSaving}
              className="bg-green-500 text-white hover:bg-green-600 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  GUARDANDO...
                </div>
              ) : (
                "GUARDAR REPORTES"
              )}
            </Button>
          </div>

          {/* Mensaje de confirmación */}
          {reportSaved && (
            <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">¡Reporte guardado exitosamente!</span>
              </div>
              <p className="mt-1 text-sm">El reporte se ha guardado con fecha: {savedReportData?.fechaGeneracion}</p>
            </div>
          )}

          {/* Mostrar datos guardados */}
          {savedReportData && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos del Reporte Guardado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Fecha de Generación</p>
                  <p className="font-semibold text-blue-800">{savedReportData.fechaGeneracion}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="font-semibold text-green-800">{savedReportData.periodo}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Animales</p>
                  <p className="font-semibold text-purple-800">{savedReportData.totalAnimalesRegistrados}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">En Tratamiento</p>
                  <p className="font-semibold text-orange-800">{savedReportData.animalesEnTratamiento}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Animales Rescatados</p>
                  <p className="font-semibold text-red-800">{savedReportData.animalesRescatados}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Animales Liberados</p>
                  <p className="font-semibold text-yellow-800">{savedReportData.animalesLiberados}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => {
                    setReportSaved(false);
                    setSavedReportData(null);
                  }}
                  className="bg-gray-500 text-white hover:bg-gray-600 px-4"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    
  );
};
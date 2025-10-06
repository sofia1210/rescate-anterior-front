import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Navbar } from "../../components/Navbar";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import generateGlobalReportPdf from "./PdfReport";

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
    const saludOkSet = new Set(["muy bueno", "bueno", "excelente", "estable"]);
    const normaliza = (s: string | null | undefined) => (s || "").toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    const getTipo = (a: any) => normaliza(a?.tipo ?? a?.tipoAnimal ?? a?.type ?? "");
    const animalesSaludOk = animals.filter((a: any) => saludOkSet.has(normaliza(a.estadoSalud))).length;
    const animalesSaludNoOk = totalAnimales - animalesSaludOk;
    const tipoDomestico = animals.filter((a: any) => getTipo(a).includes("domestico")).length;
    const tipoSilvestre = animals.filter((a: any) => getTipo(a).includes("silvestre")).length;
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

      // Descargar PDF estilizado y CSV en segundo plano si el usuario lo solicita luego
      (async () => {
        try { await generateGlobalReportPdf(snapshot); } catch {}
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

      <div className="container mx-auto p-3 lg:p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Tablero de reportes</h2>
            <p className="text-sm text-gray-600">Periodo: {metrics.periodo}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSaveReport}
              disabled={isSaving || loading}
              className="bg-green-600 text-white hover:bg-green-700 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Generando PDF..." : "Exportar PDF"}
            </Button>
            
          </div>
        </div>

        <div className={getThemeClasses(
          "bg-white rounded-lg p-4 shadow",
          "bg-white rounded-lg p-4 shadow-lg shadow-green-200/50 border border-green-100"
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
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Animales en Total</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.totalAnimales}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Con evaluaciones</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.animalesConEvaluaciones}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Buena salud</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.animalesSaludOk}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Mala salud</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.animalesSaludNoOk}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Domésticos</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.tipoDomestico}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Silvestres</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.tipoSilvestre}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Rescatistas</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.rescuerCount}</div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-xs text-gray-600 mb-1">Veterinarios</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.veterinarianCount}</div>
                </div>
              </div>

              {/* Main sections: 2 columns in one row on desktop */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <section className="lg:col-span-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Rescates últimos 6 meses</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div
                      className="grid items-end gap-2 h-24"
                      style={{ gridTemplateColumns: `repeat(${Math.max(1, metrics.byMonthLabels.length)}, minmax(0, 1fr))` }}
                    >
                      {metrics.byMonthLabels.map((lab, i) => {
                        const val = metrics.byMonthCounts[i] || 0;
                        const height = metrics.byMonthMax ? Math.max(4, Math.round((val / metrics.byMonthMax) * 90)) : 4;
                        return (
                          <div key={i} className="flex flex-col items-center justify-end text-xs text-gray-600">
                            <div
                              className="bg-green-500/80 rounded-t"
                              style={{ height, width: '40%' }}
                              aria-label={`${lab}: ${val}`}
                            ></div>
                            <span className="mt-1">{lab}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-xs text-gray-600">Total: {metrics.byMonthCounts.reduce((a, b) => a + b, 0)} animales rescatados</div>
                  </div>
                </section>

                <section className="lg:col-span-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Especies más registradas</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <ul className="space-y-2">
                      {metrics.especiesTop.map(([name, count]) => {
                        const pct = metrics.totalAnimales ? Math.round((count / metrics.totalAnimales) * 100) : 0;
                        return (
                          <li key={name} className="text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-700 truncate mr-2" title={name}>{name}</span>
                              <span className="text-gray-500">{count}</span>
                            </div>
                            <div className="h-2 bg-white rounded">
                              <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }}></div>
                            </div>
                          </li>
                        );
                      })}
                      {metrics.especiesTop.length === 0 && (
                        <li className="text-gray-500 text-sm">Sin datos</li>
                      )}
                    </ul>
                  </div>
                </section>
              </div>

              {/* Health section full width below */}
              <section className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Estado de salud</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="h-3 bg-white rounded overflow-hidden flex">
                    {(() => {
                      const total = Math.max(1, metrics.totalAnimales);
                      const okPct = Math.round((metrics.animalesSaludOk / total) * 100);
                      const nokPct = Math.max(0, 100 - okPct);
                      return (
                        <>
                          <div className="bg-emerald-500" style={{ width: `${okPct}%` }} title={`Buena salud ${okPct}%`}></div>
                          <div className="bg-red-500" style={{ width: `${nokPct}%` }} title={`Mala salud ${nokPct}%`}></div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <span>Buena salud: {metrics.animalesSaludOk}</span>
                    <span>Mala salud: {metrics.animalesSaludNoOk}</span>
                  </div>
                </div>
              </section>
            </>
          )}
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
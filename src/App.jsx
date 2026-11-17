import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, FlaskConical, History, RotateCcw } from "lucide-react";
import ImageUploader from "./components/ImageUploader";
import SVDVisualizer from "./components/SVDVisualizer";
import CompressionRoundTrip from "./components/CompressionRoundTrip";
import SVDPackageUploader from "./components/SVDPackageUploader";
import EducationalPanel from "./components/EducationalPanel";
import HistoryPanel from "./components/HistoryPanel";
import useSVD from "./hooks/useSVD";

const HISTORY_KEY = "svd-lab-history-v1";

export default function App() {
  const [mode, setMode] = useState(null);
  const [image, setImage] = useState(null);
  const [svdPackage, setSvdPackage] = useState(null);
  const [packageName, setPackageName] = useState("");
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState(0);
  const [k, setK] = useState(1);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const result = useSVD(image, k, svdPackage);
  const savedKey = useRef("");

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (error) { console.warn("No se pudo persistir el historial.", error); }
  }, [history]);

  useEffect(() => {
    if (mode !== "lab" || result.status !== "ready" || !result.result || !result.result.source) return;
    const data = result.result;
    const key = `${data.source}-${data.k}`;
    if (savedKey.current === key) return;
    savedKey.current = key;
    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = data.columns;
    previewCanvas.height = data.rows;
    previewCanvas.getContext("2d").putImageData(new ImageData(data.pixels, data.columns, data.rows), 0, 0);
    const entry = {
      id: `${Date.now()}-${data.k}`,
      name: fileName || "Ejercicio sin nombre",
      source: data.source,
      preview: previewCanvas.toDataURL("image/jpeg", 0.72),
      createdAt: new Date().toISOString(),
      k: data.k,
      rows: data.rows,
      columns: data.columns,
      compression: data.compression,
      mse: data.mse
    };
    setHistory((previous) => [entry, ...previous.filter((item) => `${item.source}-${item.k}` !== key)].slice(0, 12));
  }, [result, fileName]);

  function handleImage(nextImage, nextName) {
    setImage(nextImage);
    setSvdPackage(null);
    setPackageName("");
    setFileName(nextName);
    setK(1);
    setStep(0);
    savedKey.current = "";
  }

  function handlePackage(nextPackage, nextName) {
    setImage(null);
    setSvdPackage(nextPackage);
    setPackageName(nextName);
    setK(Number.isInteger(nextPackage.k) ? nextPackage.k : 1);
  }

  function selectHistory(item) {
    setImage(item.source);
    setFileName(item.name);
    setK(item.k);
    setStep(2);
    savedKey.current = `${item.source}-${item.k}`;
  }

  if (!mode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-6 text-slate-100">
        <section className="w-full max-w-4xl text-center">
          <div className="mx-auto mb-6 flex w-fit rounded-2xl bg-cyan-400/15 p-4 text-cyan-300"><FlaskConical size={42} /></div>
          <p className="eyebrow">Álgebra Lineal · Laboratorio interactivo</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Laboratorio SVD</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">Explora la compresión de imágenes con matrices y comprueba qué sucede al reconstruirlas.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <button className="choice-card" onClick={() => setMode("lab")}>
              <BookOpen className="mx-auto text-cyan-300" size={32} />
              <strong>Comprimir imagen</strong>
              <span>Ajusta k, observa la SVD, el MSE y el compromiso entre calidad y almacenamiento.</span>
            </button>
            <button className="choice-card" onClick={() => setMode("round-trip")}>
              <RotateCcw className="mx-auto text-emerald-300" size={32} />
              <strong>Descomprimir imagen</strong>
              <span>Reconstruye la imagen desde la transformación SVD y comprueba si la reversión es exacta o aproximada.</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <header className="topbar">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-400/15 p-2 text-cyan-300"><FlaskConical /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Álgebra Lineal · UTS</p>
            <h1 className="text-2xl font-bold">Laboratorio SVD</h1>
          </div>
          </div>
          <button className="button-secondary" onClick={() => { setMode(null); setImage(null); setSvdPackage(null); }}><ArrowLeft size={16} /> Inicio</button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="hero-strip"><div><p className="eyebrow">Cuaderno de experimentación</p><h2>Comprende qué información conserva una imagen</h2><p>Ajusta el rango de la SVD y observa cómo cambia la reconstrucción.</p></div><div className="hero-stat"><History size={22} /><span>{history.length}<small>ejercicios guardados</small></span></div></section>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          {mode === "lab"
            ? <ImageUploader onImageLoaded={handleImage} hasImage={Boolean(image)} />
            : <SVDPackageUploader onPackageLoaded={handlePackage} hasPackage={Boolean(svdPackage)} />}
          {mode === "lab"
            ? <SVDVisualizer image={image} result={result} k={k} onKChange={setK} />
            : <CompressionRoundTrip packageName={packageName} result={result} onBack={() => setMode(null)} />}
        </section>
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-2 text-cyan-300">
            <BookOpen size={20} />
            <h2 className="font-semibold">Motor didáctico</h2>
          </div>
          <EducationalPanel step={step} onStepChange={setStep} image={image} result={result} />
        </aside>
        </div>
        <HistoryPanel items={history} onSelect={selectHistory} onClear={() => setHistory([])} />
      </div>
    </main>
  );
}

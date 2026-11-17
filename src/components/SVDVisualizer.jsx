import { useEffect, useRef } from "react";
import { AlertTriangle, Download, LoaderCircle, RotateCcw } from "lucide-react";

export default function SVDVisualizer({ image, result, k, onKChange }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!result.result || result.status !== "ready") return;
    const canvas = canvasRef.current;
    canvas.width = result.result.columns;
    canvas.height = result.result.rows;
    canvas.getContext("2d").putImageData(
      new ImageData(result.result.pixels, result.result.columns, result.result.rows),
      0,
      0
    );
  }, [result]);
  if (!image) return <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">La imagen reconstruida aparecerá aquí.</div>;
  if (result.status !== "ready" || !result.result) return <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 text-cyan-300"><LoaderCircle className="animate-spin" /><strong>Calculando SVD en segundo plano...</strong><span className="text-sm text-slate-400">La interfaz sigue disponible mientras se procesa la imagen.</span></div>;
  if (result.status === "error") return <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-400/30 bg-slate-900 text-red-200"><AlertTriangle /><strong>{result.error}</strong><button className="button-secondary" onClick={() => onKChange(1)}><RotateCcw size={16} /> Reintentar</button></div>;
  const data = result.result;
  const maxK = Math.min(data?.rows ?? 1, data?.columns ?? 1);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <figure><figcaption className="mb-2 text-sm text-slate-400">Imagen original</figcaption><img className="mx-auto max-h-72 rounded-xl object-contain" src={image} alt="Original" /></figure>
        <figure><figcaption className="mb-2 text-sm text-slate-400">Reconstrucción con rango k</figcaption><canvas className="mx-auto max-h-72 max-w-full rounded-xl object-contain" ref={canvasRef} /></figure>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm"><label htmlFor="k">Valores singulares conservados (k)</label><strong className="text-cyan-300">{data?.k ?? k}</strong></div>
        <input id="k" className="w-full accent-cyan-400" type="range" min="1" max={maxK} value={data?.k ?? k} onChange={(event) => onKChange(Number(event.target.value))} />
      </div>
      {data && <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <Metric label="Matriz" value={`${data.rows} × ${data.columns}`} />
        <Metric label="Reducción" value={`${data.compression.toFixed(2)}%`} />
        <Metric label="MSE" value={data.mse.toFixed(2)} />
        <Metric label="SVD" value={`${data.compressedSize.toLocaleString()} elem.`} />
      </div>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="button-primary" onClick={() => canvasRef.current?.toBlob((blob) => { if (blob) { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "imagen_svd.png"; link.click(); URL.revokeObjectURL(link.href); } })}><Download size={18} /> Descargar reconstrucción</button>
        <button className="button-secondary" onClick={() => downloadSVDPackage(data.svdPackage)}><Download size={18} /> Descargar matriz SVD</button>
      </div>
    </div>
  );
}

function downloadSVDPackage(svdPackage) {
  const blob = new Blob([JSON.stringify(svdPackage)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "imagen_comprimida.svd.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function Metric({ label, value }) {
  return <div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold text-cyan-200">{value}</p></div>;
}

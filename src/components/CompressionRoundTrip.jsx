import { useEffect, useRef } from "react";
import { AlertTriangle, ArrowLeft, Download, LoaderCircle } from "lucide-react";

export default function CompressionRoundTrip({ packageName, result, onBack }) {
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

  if (!result.result && result.status === "idle") {
    return (
      <div className="lab-card flex min-h-[420px] items-center justify-center text-slate-400">
        Carga un archivo SVD para iniciar la descompresión.
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="lab-card flex min-h-[420px] flex-col items-center justify-center gap-3 text-red-200">
        <AlertTriangle />
        <strong>{result.error}</strong>
        <button className="button-secondary" onClick={onBack}><ArrowLeft size={16} /> Volver al inicio</button>
      </div>
    );
  }

  if (result.status !== "ready" || !result.result) {
    return (
      <div className="lab-card flex min-h-[420px] flex-col items-center justify-center gap-3 text-cyan-300">
        <LoaderCircle className="animate-spin" />
        <strong>Descomprimiendo la matriz SVD...</strong>
        <span className="text-sm text-slate-400">Se están multiplicando U, Σ y Vᵀ para reconstruir los píxeles.</span>
      </div>
    );
  }

  const data = result.result;
  return (
    <div className="lab-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reversión de la transformación</p>
          <h2>Descompresión de la imagen</h2>
        </div>
        <button className="button-secondary" onClick={onBack}><ArrowLeft size={16} /> Cambiar modo</button>
      </div>
      <p className="helper-text mb-5">
        Archivo procesado: <strong>{packageName || "matriz SVD"}</strong>. La imagen se reconstruye usando exclusivamente la representación guardada.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <figure>
          <figcaption className="mb-2 text-sm text-slate-400">Imagen descomprimida</figcaption>
          <canvas className="mx-auto max-h-72 max-w-full rounded-xl object-contain" ref={canvasRef} />
        </figure>
      </div>
      <div className="mt-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
        La imagen corresponde a la reconstrucción de los componentes guardados. Si el archivo usa rango truncado, los detalles descartados no pueden recuperarse.
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <Metric label="Matriz" value={`${data.rows} × ${data.columns}`} />
        <Metric label="MSE" value="No disponible sin original" />
        <Metric label="Almacenamiento SVD" value={`${data.compressedSize.toLocaleString()} elem.`} />
        <Metric label="Reducción" value={`${data.compression.toFixed(2)}%`} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="button-primary" onClick={() => canvasRef.current?.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "imagen_svd_descomprimida.png";
          link.click();
          URL.revokeObjectURL(link.href);
        })}>
          <Download size={18} /> Descargar descomprimida
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold text-cyan-200">{value}</p></div>;
}

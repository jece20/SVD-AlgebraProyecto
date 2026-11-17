import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlockMath } from "react-katex";

const steps = [
  { title: "Decodificación vectorial", text: "Una imagen a color es un tensor formado por tres matrices: una para rojo, otra para verde y otra para azul.", formula: "A \\in \\mathbb{R}^{m \\times n}", question: "¿Qué dimensiones tiene la matriz de cada canal?" },
  { title: "Teorema SVD", text: "La matriz de cada canal se factoriza en componentes ortogonales. Los valores singulares ordenan la información de mayor a menor importancia.", formula: "A = U\\Sigma V^T", question: "¿Qué representan los valores de la diagonal de Σ?" },
  { title: "Truncamiento", text: "Conservamos los primeros k valores singulares y descartamos los menores. El slider permite observar el compromiso entre detalle y almacenamiento.", formula: "A_k = U_k\\Sigma_k V_k^T", question: "¿Qué ocurre con la calidad cuando k disminuye?" },
  { title: "Reconstrucción y compresión", text: "Multiplicamos las matrices truncadas para reconstruir una aproximación de la imagen original.", formula: "C\\% = \\left(1 - \\frac{S_{comp}}{S_{orig}}\\right) \\times 100", question: "¿Cómo equilibrarías calidad y compresión?" }
];

export default function EducationalPanel({ step, onStepChange, image, result }) {
  const current = steps[step];
  const dimensions = result.result ? `${result.result.rows} × ${result.result.columns}` : "Carga una imagen";
  return <div>
    <div className="mb-6 flex gap-2">{steps.map((item, index) => <button key={item.title} onClick={() => onStepChange(index)} className={`h-2 flex-1 rounded-full ${index === step ? "bg-cyan-400" : "bg-slate-700"}`} aria-label={`Ir al paso ${index + 1}`} />)}</div>
    <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">Paso {step + 1} de {steps.length}</p>
    <h3 className="mt-2 text-2xl font-bold">{current.title}</h3>
    <p className="mt-4 leading-7 text-slate-300">{current.text}</p>
    <div className="my-6 rounded-xl bg-slate-950 p-4 text-center text-cyan-200"><BlockMath math={current.formula} /></div>
    {step === 0 && <p className="rounded-xl bg-slate-800 p-4 text-sm">Dimensiones cargadas: <strong>{image ? dimensions : "—"}</strong></p>}
    {step === 2 && result.result && <p className="rounded-xl bg-slate-800 p-4 text-sm">Sorig = {result.result.originalSize.toLocaleString()} · Scomp = {result.result.compressedSize.toLocaleString()}</p>}
    <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><p className="text-sm font-semibold text-cyan-200">Pregunta de reflexión</p><p className="mt-2 text-sm text-slate-300">{current.question}</p></div>
    <div className="mt-8 flex justify-between"><button className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40" disabled={step === 0} onClick={() => onStepChange(step - 1)}><ChevronLeft size={18} /> Anterior</button><button className="inline-flex items-center gap-1 rounded-lg bg-cyan-400 px-3 py-2 font-semibold text-slate-950 disabled:opacity-40" disabled={step === steps.length - 1} onClick={() => onStepChange(step + 1)}>Siguiente <ChevronRight size={18} /></button></div>
  </div>;
}

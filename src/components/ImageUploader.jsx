import { ImagePlus } from "lucide-react";

export default function ImageUploader({ onImageLoaded, hasImage }) {
  function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type) || !/\.(png|jpe?g)$/i.test(file.name)) {
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onImageLoaded(String(reader.result), file.name);
    reader.onerror = () => console.error("No se pudo leer la imagen.");
    reader.readAsDataURL(file);
  }

  return <section className="lab-card upload-card">
    <div><p className="eyebrow">Nueva práctica</p><h2>{hasImage ? "Cambiar imagen de estudio" : "Comienza un ejercicio"}</h2><p className="helper-text">Selecciona una fotografía para convertirla en matrices RGB.</p></div>
    <label className="button-primary cursor-pointer"><ImagePlus size={18} /> Subir imagen<input className="hidden" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={handleChange} /></label>
  </section>;
}

import { FileArchive } from "lucide-react";

export default function SVDPackageUploader({ onPackageLoaded, hasPackage }) {
  function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const packageData = JSON.parse(String(reader.result));
        onPackageLoaded(packageData, file.name);
      } catch {
        console.error("El archivo SVD no contiene JSON válido.");
      }
    };
    reader.onerror = () => console.error("No se pudo leer el archivo SVD.");
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <section className="lab-card upload-card">
      <div>
        <p className="eyebrow">Matriz comprimida</p>
        <h2>{hasPackage ? "Cambiar matriz SVD" : "Carga una matriz SVD"}</h2>
        <p className="helper-text">Selecciona el archivo `.svd.json` generado por el laboratorio.</p>
      </div>
      <label className="button-primary cursor-pointer">
        <FileArchive size={18} /> Subir matriz SVD
        <input className="hidden" type="file" accept=".json,.svd.json,application/json" onChange={handleChange} />
      </label>
    </section>
  );
}

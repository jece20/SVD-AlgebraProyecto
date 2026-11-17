import { Clock3, Trash2 } from "lucide-react";

export default function HistoryPanel({ items, onSelect, onClear }) {
  return (
    <section className="lab-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Bitácora del laboratorio</p>
          <h2>Historial de ejercicios</h2>
        </div>
        {items.length > 0 && <button className="icon-button" title="Borrar historial" onClick={onClear}><Trash2 size={17} /></button>}
      </div>
      {items.length === 0 ? (
        <div className="empty-history"><Clock3 size={20} /><p>Aquí aparecerán tus ejercicios completados.</p><span>Cambia la imagen o el valor de k para registrar una nueva práctica.</span></div>
      ) : (
        <div className="history-list">
          {items.map((item) => (
            <button className="history-item" key={item.id} onClick={() => onSelect(item)}>
              <img src={item.preview} alt="" />
              <span className="min-w-0 flex-1 text-left"><strong>{item.name}</strong><small>k = {item.k} · {item.rows} × {item.columns}</small><small>{new Date(item.createdAt).toLocaleString("es-CO")}</small></span>
              <span className="history-score">{item.compression.toFixed(1)}%<small>reducción</small></span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

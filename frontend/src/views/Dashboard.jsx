import DashboardCards from "../components/DashboardCards";
import PrestamosRecientesTabla from "../components/PrestamosRecientesTabla";
import DevolucionModal from "../components/DevolucionModal";
import React from "react";

export default function Dashboard({ counts = {}, prestamos = [], onNavigate = () => {}, onUpdate = () => {}, showMessage = () => {} }) {
  const activos = (prestamos || []).filter((p) => String(p.estado || '').toUpperCase() === 'ACTIVO');
  const recientes = [...activos]
    .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))
    .slice(0, 5);

  const [selected, setSelected] = React.useState(null);

  return (
    <div className="px-24 py-12">
      <h1 className="text-4xl font-semibold mb-2">Biblioteca</h1>
      <p className="text-lg text-gray-600 mb-8">
        Gestión de socios, libros, préstamos y multas
      </p>

      <DashboardCards counts={counts} onNavigate={onNavigate} />

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-3">Préstamos activos recientes</h2>
        <PrestamosRecientesTabla
          prestamos={recientes}
          onRegistrar={(p) => setSelected(p)}
          onVerTodo={() => onNavigate('prestamos')}
        />
      </section>

      {selected && (
        <DevolucionModal
          prestamo={selected}
          onClose={() => setSelected(null)}
          onSuccess={onUpdate}
          showMessage={showMessage}
        />
      )}
    </div>
  );
}

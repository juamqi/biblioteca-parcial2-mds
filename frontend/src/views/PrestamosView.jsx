import { useState } from "react";

const API_URL = "http://localhost:3001/api";

export default function PrestamosView({
  prestamos = [],
  socios = [],
  libros = [],
  onUpdate = () => {},
  showMessage = () => {},
}) {
  const [showForm, setShowForm] = useState(false);
  const [showDevolucion, setShowDevolucion] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [formData, setFormData] = useState({ nroSocio: "", ISBN: "", diasPrestamo: 14 });
  const [devolucionData, setDevolucionData] = useState({ libroDaniado: false, montoMulta: 0, motivoMulta: "" });
  const [status, setStatus] = useState("ACTIVOS");
  const [query, setQuery] = useState("");

  const normPrestamoEstado = (raw) => String(raw || '').toUpperCase();
  const prestamosNorm = prestamos.map((p) => ({ ...p, _estado: normPrestamoEstado(p.estado) }));
  const activos = prestamosNorm.filter((p) => p._estado === "ACTIVO");
  const devueltos = prestamosNorm.filter((p) => p._estado !== "ACTIVO");
  const normEstadoLibro = (raw) => {
    if (raw == null) return "DESCONOCIDO";
    if (typeof raw === 'number') return raw === 1 ? 'DISPONIBLE' : 'PRESTADO';
    const t = String(raw).trim().toUpperCase();
    if (t === '1') return 'DISPONIBLE';
    if (t === '0' || t === '2') return 'PRESTADO';
    if (t.includes('DISPON')) return 'DISPONIBLE';
    if (t.includes('PREST')) return 'PRESTADO';
    return t;
  };
  const librosDisponibles = libros.filter((l) => normEstadoLibro(l.estado) === "DISPONIBLE");

  const list = (status === "ACTIVOS" ? activos : devueltos).filter((p) => {
    const text = `${p.titulo ?? ""} ${p.nombreSocio ?? ""} ${p.idPrestamo ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/prestamos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nroSocio: parseInt(formData.nroSocio),
          ISBN: formData.ISBN,
          diasPrestamo: parseInt(formData.diasPrestamo),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Préstamo registrado correctamente");
        setShowForm(false);
        setFormData({ nroSocio: "", ISBN: "", diasPrestamo: 14 });
        onUpdate();
      } else showMessage(data.mensaje || "Error al registrar préstamo", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const handleDevolucion = async (e) => {
    e.preventDefault();
    try {
      const body = {
        libroDaniado: devolucionData.libroDaniado,
        montoMulta: devolucionData.libroDaniado ? parseFloat(devolucionData.montoMulta) : 0,
        motivoMulta: devolucionData.libroDaniado ? devolucionData.motivoMulta : "",
      };
      const response = await fetch(`${API_URL}/prestamos/${selectedPrestamo.idPrestamo}/devolver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Devolución registrada correctamente");
        setShowDevolucion(false);
        setSelectedPrestamo(null);
        setDevolucionData({ libroDaniado: false, montoMulta: 0, motivoMulta: "" });
        onUpdate();
      } else showMessage(data.mensaje || "Error al registrar devolución", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const extendPrestamo = async (p) => {
    const dias = prompt("Extender: nuevos días totales desde inicio", `${p.diasPrestamo || 14}`);
    if (!dias) return;
    try {
      const response = await fetch(`${API_URL}/prestamos/${p.idPrestamo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diasPrestamo: parseInt(dias, 10) }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Préstamo actualizado");
        onUpdate();
      } else showMessage(data.mensaje || "No se pudo actualizar", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const cancelPrestamo = async (p) => {
    if (!confirm("¿Cancelar/eliminar préstamo?")) return;
    try {
      const response = await fetch(`${API_URL}/prestamos/${p.idPrestamo}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Préstamo eliminado");
        onUpdate();
      } else showMessage(data.mensaje || "No se pudo eliminar", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  return (
    <div className="px-24 py-12 font-sans text-gray-800">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Préstamos</h1>
          <p className="text-lg text-gray-600">Administra los préstamos de libros</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1A202C] text-white px-5 py-2 rounded-md hover:bg-[#2D3748] transition"
          disabled={socios.length === 0 || librosDisponibles.length === 0}
        >
          {showForm ? "Cancelar" : "Nuevo Préstamo"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por libro, socio o ID..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="flex border rounded-md overflow-hidden text-sm">
          {[
            { k: "ACTIVOS", label: `Activos (${activos.length})` },
            { k: "DEVUELTOS", label: `Devueltos (${devueltos.length})` },
          ].map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setStatus(k)}
              className={`px-4 py-2 ${
                status === k
                  ? "bg-[#4A5568] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border p-8 rounded-lg mb-10 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Registrar nuevo préstamo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Socio *</label>
              <select
                value={formData.nroSocio}
                onChange={(e) => setFormData({ ...formData, nroSocio: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Seleccionar socio</option>
                {socios.map((s) => (
                  <option key={s.nroSocio} value={s.nroSocio}>
                    {s.nombre} (#{s.nroSocio})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Libro *</label>
              <select
                value={formData.ISBN}
                onChange={(e) => setFormData({ ...formData, ISBN: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Seleccionar libro</option>
                {librosDisponibles.map((l) => (
                  <option key={l.ISBN} value={l.ISBN}>
                    {l.titulo} - {l.autor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Días de préstamo</label>
              <input
                type="number"
                value={formData.diasPrestamo}
                onChange={(e) => setFormData({ ...formData, diasPrestamo: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                min={1}
                max={30}
              />
            </div>
          </div>
          <button type="submit" className="mt-6 bg-[#4A5568] text-white px-6 py-2 rounded-md hover:bg-[#2D3748] transition">
            Guardar
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border">
          <p className="text-gray-600 font-medium">
            No hay préstamos que coincidan con la búsqueda
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Prueba cambiar los filtros o registrar uno nuevo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => {
            const vencido = p._estado === "ACTIVO" && new Date(p.fechaDevolucionEsperada) < new Date();
            return (
              <div key={p.idPrestamo} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg leading-snug max-w-[80%]">{p.titulo}</h4>
                  {vencido && (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-600 text-white">Vencido</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{p.nombreSocio}</p>
                <p className="text-sm text-gray-500">Inicio: {new Date(p.fechaInicio).toLocaleDateString("es-AR")}</p>
                <p className="text-sm text-gray-500">Vence: {new Date(p.fechaDevolucionEsperada).toLocaleDateString("es-AR")}</p>
                {p.fechaDevolucionReal && (
                  <p className="text-sm text-gray-500">Devuelto: {new Date(p.fechaDevolucionReal).toLocaleDateString("es-AR")}</p>
                )}
                <p className="text-sm text-gray-500">ID: {p.idPrestamo}</p>

                {p._estado === "ACTIVO" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedPrestamo(p);
                        setShowDevolucion(true);
                      }}
                      className="bg-[#1A202C] text-white flex-1 border rounded-md px-3 py-2 text-sm hover:bg-[#2D3748]"
                    >
                      Marcar como devuelto
                    </button>
                    <button
                      onClick={() => extendPrestamo(p)}
                      className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Extender
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showDevolucion && selectedPrestamo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Registrar devolución</h3>
            <p className="mb-4 text-gray-700">
              <strong>Libro:</strong> {selectedPrestamo.titulo}
              <br />
              <strong>Socio:</strong> {selectedPrestamo.nombreSocio}
            </p>
            <form onSubmit={handleDevolucion}>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={devolucionData.libroDaniado}
                  onChange={(e) => setDevolucionData({ ...devolucionData, libroDaniado: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">¿Libro dañado / Fuera de término?</span>
              </label>

              {devolucionData.libroDaniado && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Monto de multa ($) *</label>
                    <input
                      type="number"
                      value={devolucionData.montoMulta}
                      onChange={(e) => setDevolucionData({ ...devolucionData, montoMulta: e.target.value })}
                      className="w-full p-2 border rounded-lg text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Motivo *</label>
                    <textarea
                      value={devolucionData.motivoMulta}
                      onChange={(e) => setDevolucionData({ ...devolucionData, motivoMulta: e.target.value })}
                      className="w-full p-2 border rounded-lg text-sm"
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDevolucion(false);
                    setSelectedPrestamo(null);
                    setDevolucionData({ libroDaniado: false, montoMulta: 0, motivoMulta: "" });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

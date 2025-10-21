import { useState } from "react";

const API_URL = "http://localhost:3001/api";

export default function LibrosView({ libros = [], onUpdate = () => {}, showMessage = () => {} }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ISBN: "", titulo: "", autor: "" });
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ titulo: "", autor: "" });
  const [status, setStatus] = useState("TODOS");
  const [query, setQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/libros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Libro agregado correctamente");
        setShowForm(false);
        setFormData({ ISBN: "", titulo: "", autor: "" });
        onUpdate();
      } else showMessage(data.mensaje || "Error al agregar libro", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const startEdit = (l) => {
    setEditing(l.ISBN);
    setEditData({ titulo: l.titulo, autor: l.autor });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData({ titulo: "", autor: "" });
  };

  const submitUpdate = async (ISBN) => {
    try {
      const response = await fetch(`${API_URL}/libros/${ISBN}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Libro actualizado");
        cancelEdit();
        onUpdate();
      } else showMessage(data.mensaje || "Error al actualizar libro", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const handleDelete = async (ISBN) => {
    if (!confirm("¿Eliminar libro?")) return;
    try {
      const response = await fetch(`${API_URL}/libros/${ISBN}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Libro eliminado");
        onUpdate();
      } else showMessage(data.mensaje || "No se pudo eliminar", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const normEstado = (raw) => {
    if (raw == null) return "DESCONOCIDO";
    if (typeof raw === 'number') return raw === 1 ? 'DISPONIBLE' : 'PRESTADO';
    const t = String(raw).trim().toUpperCase();
    if (t === '1') return 'DISPONIBLE';
    if (t === '0' || t === '2') return 'PRESTADO';
    if (t.includes('DISPON')) return 'DISPONIBLE';
    if (t.includes('PREST')) return 'PRESTADO';
    return t;
  };

  const librosNorm = libros.map((l) => ({ ...l, _estado: normEstado(l.estado) }));

  const disponibles = librosNorm.filter((l) => l._estado === "DISPONIBLE").length;
  const prestados = librosNorm.filter((l) => l._estado === "PRESTADO").length;

  const filteredLibros = librosNorm.filter((l) => {
    const matchesStatus = status === "TODOS" ? true : l._estado === status;
    const text = `${l.titulo ?? ""} ${l.autor ?? ""} ${l.ISBN ?? ""}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  });

  return (
    <div className="px-24 py-12 font-sans text-gray-800">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Libros</h1>
          <p className="text-lg text-gray-600">
            Administra el catálogo de la biblioteca
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1A202C] text-white px-5 py-2 rounded-md hover:bg-[#2D3748] transition"
        >
          {showForm ? "Cancelar" : "Agregar Libro"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor o ISBN..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="flex border rounded-md overflow-hidden text-sm">
          {[
            { k: "TODOS", label: `Todos (${libros.length})` },
            { k: "DISPONIBLE", label: `Disponibles (${disponibles})` },
            { k: "PRESTADO", label: `Prestados (${prestados})` },
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
        <form
          onSubmit={handleSubmit}
          className="bg-white border p-8 rounded-lg mb-10 shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-6">Agregar nuevo libro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                ISBN *
              </label>
              <input
                type="text"
                value={formData.ISBN}
                onChange={(e) =>
                  setFormData({ ...formData, ISBN: e.target.value })
                }
                required
                placeholder="978-3-16-148410-0"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                required
                placeholder="El Quijote"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Autor *
              </label>
              <input
                type="text"
                value={formData.autor}
                onChange={(e) =>
                  setFormData({ ...formData, autor: e.target.value })
                }
                required
                placeholder="Miguel de Cervantes"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 bg-[#4A5568] text-white px-6 py-2 rounded-md hover:bg-[#2D3748] transition"
          >
            Agregar Libro
          </button>
        </form>
      )}

      {filteredLibros.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border">
          <p className="text-gray-600 font-medium">
            No hay libros que coincidan con la búsqueda
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Prueba cambiar los filtros o agregar uno nuevo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibros.map((l) => (
            <div
              key={l.ISBN}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              {editing === l.ISBN ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">
                      Título
                    </label>
                    <input
                      value={editData.titulo}
                      onChange={(e) =>
                        setEditData({ ...editData, titulo: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">
                      Autor
                    </label>
                    <input
                      value={editData.autor}
                      onChange={(e) =>
                        setEditData({ ...editData, autor: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => submitUpdate(l.ISBN)}
                      className="px-4 py-1.5 bg-[#4A5568] text-white rounded-md text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-1.5 border rounded-md text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-snug max-w-[80%]">
                      {l.titulo}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        l._estado === "DISPONIBLE"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {l._estado === "DISPONIBLE" ? "Disponible" : "Prestado"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{l.autor}</p>
                  <p className="text-sm text-gray-500">ISBN: {l.ISBN}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => startEdit(l)}
                      className="flex-1 border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(l.ISBN)}
                      className="border rounded-md p-2 hover:bg-gray-50 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

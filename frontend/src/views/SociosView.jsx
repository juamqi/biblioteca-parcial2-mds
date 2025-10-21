import { useState } from "react";

const API_URL = "http://localhost:3001/api";

export default function SociosView({ socios = [], onUpdate = () => {}, showMessage = () => {} }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ dni: "", nombre: "" });
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ dni: "", nombre: "" });
  const [query, setQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/socios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Socio registrado correctamente");
        setShowForm(false);
        setFormData({ dni: "", nombre: "" });
        onUpdate();
      } else showMessage(data.mensaje || "Error al registrar socio", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const startEdit = (s) => {
    setEditing(s.nroSocio);
    setEditData({ dni: s.dni, nombre: s.nombre });
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditData({ dni: "", nombre: "" });
  };
  const submitUpdate = async (nroSocio) => {
    try {
      const response = await fetch(`${API_URL}/socios/${nroSocio}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Socio actualizado");
        cancelEdit();
        onUpdate();
      } else showMessage(data.mensaje || "Error al actualizar socio", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };
  const handleDelete = async (nroSocio) => {
    if (!confirm("¿Eliminar socio?")) return;
    try {
      const response = await fetch(`${API_URL}/socios/${nroSocio}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Socio eliminado");
        onUpdate();
      } else showMessage(data.mensaje || "No se pudo eliminar", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const filteredSocios = (socios || []).filter((s) => {
    const text = `${s.nombre ?? ""} ${s.dni ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="px-24 py-12 font-sans text-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Socios</h1>
          <p className="text-lg text-gray-600">
            Administra los socios registrados en el sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4A5568] text-white px-5 py-2 rounded-md hover:bg-[#2D3748] transition"
        >
          {showForm ? "Cancelar" : "Nuevo Socio"}
        </button>
      </div>

      {/* Buscador */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por DNI o nombre..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border p-8 rounded-lg mb-10 shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-6">Registrar nuevo socio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                DNI *
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
                placeholder="12345678"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Juan Pérez"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 bg-[#4A5568] text-white px-6 py-2 rounded-md hover:bg-[#2D3748] transition"
          >
            Registrar Socio
          </button>
        </form>
      )}

      {/* Lista */}
      {socios.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border">
          <p className="text-gray-600 font-medium">
            No hay socios registrados
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Haz clic en "Nuevo Socio" para agregar el primero
          </p>
        </div>
      ) : filteredSocios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <p className="text-gray-600">No hay socios que coincidan con la búsqueda</p>
          <p className="text-sm text-gray-500 mt-1">Prueba con otro DNI o nombre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSocios.map((s) => (
            <div
              key={s.nroSocio}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              {editing === s.nroSocio ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">DNI</label>
                    <input
                      value={editData.dni}
                      onChange={(e) => setEditData({ ...editData, dni: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Nombre</label>
                    <input
                      value={editData.nombre}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => submitUpdate(s.nroSocio)}
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
                <>
                  <h3 className="font-semibold text-lg mb-1">{s.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-1">DNI: {s.dni}</p>
                  <p className="text-sm text-gray-500 mb-3">Socio #{s.nroSocio}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="flex-1 border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.nroSocio)}
                      className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

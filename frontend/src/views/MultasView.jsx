import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/api";

export default function MultasView({ multas = [], onUpdate = () => {}, showMessage = () => {} }) {
  const [allMultas, setAllMultas] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/multas`);
        if (res.ok) {
          const data = await res.json();
          setAllMultas(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handlePagar = async (idMulta) => {
    try {
      const response = await fetch(`${API_URL}/multas/${idMulta}/pagar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.mensaje || "Multa pagada correctamente");
        onUpdate();
        const refresh = await fetch(`${API_URL}/multas`);
        if (refresh.ok) setAllMultas(await refresh.json());
      } else showMessage(data.mensaje || "Error al registrar pago", "error");
    } catch {
      showMessage("Error al conectar con el servidor", "error");
    }
  };

  const totalMultas = Array.isArray(multas)
    ? multas.reduce((sum, m) => sum + parseFloat(m.monto || 0), 0)
    : 0;
  const pagadas = allMultas.filter((m) => m.pagada);

  return (
    <div className="px-24 py-12 font-sans text-gray-800">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Multas</h1>
          <p className="text-lg text-gray-600">Visualiza y gestiona las multas pendientes y pagadas</p>
        </div>
        <div className="bg-red-100 px-6 py-3 rounded-lg border border-red-200">
          <p className="text-sm text-gray-700">Total pendiente</p>
          <p className="text-2xl font-semibold text-red-700">${totalMultas.toFixed(2)}</p>
        </div>
      </div>

      {multas.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border">
          <p className="text-green-700 font-medium text-lg">¡No hay multas pendientes!</p>
          <p className="text-sm text-gray-500 mt-1">Todos los socios están al día</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {multas.map((m) => (
            <div
              key={m.idMulta}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-1">{m.nombreSocio}</h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Libro:</strong> {m.libroTitulo}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Motivo:</strong> {m.motivo}</p>
              <p className="text-sm text-gray-500 mb-1"><strong>Fecha:</strong> {new Date(m.fecha).toLocaleDateString("es-AR")}</p>
              <p className="text-2xl font-semibold text-red-700 mt-3">${parseFloat(m.monto).toFixed(2)}</p>
              <button
                onClick={() => handlePagar(m.idMulta)}
                className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm"
              >
                Marcar como pagada
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Historial de multas pagadas</h2>
        {pagadas.length === 0 ? (
          <p className="text-gray-600 text-sm">No hay multas pagadas registradas</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Socio</th>
                  <th className="p-3 text-left font-medium">Libro</th>
                  <th className="p-3 text-left font-medium">Fecha</th>
                  <th className="p-3 text-left font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {pagadas.map((m) => (
                  <tr key={m.idMulta} className="border-t">
                    <td className="p-3">{m.idMulta}</td>
                    <td className="p-3">{m.nombreSocio}</td>
                    <td className="p-3">{m.libroTitulo}</td>
                    <td className="p-3">{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
                    <td className="p-3 text-gray-800 font-medium">${parseFloat(m.monto).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

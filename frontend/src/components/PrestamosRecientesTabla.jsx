export default function PrestamosRecientesTabla({ prestamos = [], onRegistrar = () => {}, onVerTodo = () => {} }) {
  if (!prestamos.length) {
    return (
      <div className="bg-white rounded-md shadow-sm border p-6 text-sm text-gray-600">
        No hay préstamos activos recientes.
      </div>
    );
  }

  return (
    <>
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className="py-3 px-5 font-medium">Socio</th>
            <th className="py-3 px-5 font-medium">Libro</th>
            <th className="py-3 px-5 font-medium">Fecha de inicio</th>
            <th className="py-3 px-5 text-right font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {prestamos.map((p) => (
            <tr key={p.idPrestamo} className="border-b hover:bg-gray-50 transition">
              <td className="py-3 px-5">{p.nombreSocio}</td>
              <td className="py-3 px-5">{p.titulo}</td>
              <td className="py-3 px-5">{new Date(p.fechaInicio).toLocaleDateString("es-AR")}</td>
              <td className="py-3 px-5 text-right">
                <button
                  onClick={() => onRegistrar(p)}
                  className="text-[#4A5568] font-medium hover:text-[#2D3748] hover:underline transition"
                >
                  Registrar entrega
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
        <button
          onClick={onVerTodo}
          className="bg-[#4A5568] text-white px-5 py-2 rounded-md text-sm hover:bg-[#2D3748] transition"
        >
          Ver todo
        </button>
      </div>
    </>
  );
}

import React, { useState } from 'react';

const API_URL = 'http://localhost:3001/api';

export default function DevolucionModal({ prestamo, onClose = () => {}, onSuccess = () => {}, showMessage = () => {} }) {
  if (!prestamo) return null;

  const [damaged, setDamaged] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = {
      libroDaniado: damaged,
      montoMulta: damaged ? parseFloat(data.get('montoMulta') || 0) : 0,
      motivoMulta: damaged ? String(data.get('motivoMulta') || '') : '',
    };
    try {
      const res = await fetch(`${API_URL}/prestamos/${prestamo.idPrestamo}/devolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        showMessage(json.mensaje || 'Devolución registrada correctamente');
        onClose();
        onSuccess();
      } else {
        showMessage(json.mensaje || 'Error al registrar devolución', 'error');
      }
    } catch {
      showMessage('Error al conectar con el servidor', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Registrar Devolución</h3>
        <p className="mb-4 text-gray-700">
          <strong>Libro:</strong> {prestamo.titulo}<br />
          <strong>Socio:</strong> {prestamo.nombreSocio}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={damaged}
              onChange={(e) => setDamaged(e.target.checked)}
            />
            <span className="text-sm font-medium">¿Libro dañado / Fuera de término?</span>
          </label>

          {damaged && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Monto de multa ($)</label>
                <input type="number" name="montoMulta" min="0" step="0.01" required className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Motivo</label>
                <textarea name="motivoMulta" rows={3} required className="w-full p-2 border rounded-lg" />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Confirmar
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


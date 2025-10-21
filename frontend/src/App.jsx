import React, { useEffect, useState } from 'react';
import './index.css';
import railImg from './assets/foto.jpg';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './views/Dashboard';
import PrestamosView from './views/PrestamosView';
import SociosView from './views/SociosView';
import LibrosView from './views/LibrosView';
import MultasView from './views/MultasView';

const API_URL = 'http://localhost:3001/api';

export default function App() {
  const RAIL_WIDTH = 256;
  const SIDEBAR_WIDTH = 256;
  const [activeSection, setActiveSection] = useState('inicio');
  const [socios, setSocios] = useState([]);
  const [libros, setLibros] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setLoading(true);
    try {
      try { const r = await fetch(`${API_URL}/socios`); setSocios(r.ok ? await r.json() : []); } catch { }
      try { const r = await fetch(`${API_URL}/libros`); setLibros(r.ok ? await r.json() : []); } catch { }
      try { const r = await fetch(`${API_URL}/prestamos`); setPrestamos(r.ok ? await r.json() : []); } catch { }
      try { const r = await fetch(`${API_URL}/multas/pendientes`); setMultas(r.ok ? await r.json() : []); } catch { }
    } catch (error) {
      console.error('Error general:', error);
      showMessage('Error al conectar con el servidor. Verifica que el backend esté corriendo en el puerto 3001', 'error');
    }
    setLoading(false);
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'prestamos':
        return <PrestamosView prestamos={prestamos} socios={socios} libros={libros} onUpdate={fetchData} showMessage={showMessage} />;
      case 'socios':
        return <SociosView socios={socios} onUpdate={fetchData} showMessage={showMessage} />;
      case 'libros':
        return <LibrosView libros={libros} onUpdate={fetchData} showMessage={showMessage} />;
      case 'multas':
        return <MultasView multas={multas} onUpdate={fetchData} showMessage={showMessage} />;
      default: {
        const counts = {
          socios: socios.length || 0,
          libros: libros.length || 0,
          prestamos: prestamos.filter(p => String(p.estado || '').toUpperCase() === 'ACTIVO').length || 0,
          multas: multas.length || 0,
        };
        return (
          <Dashboard
            counts={counts}
            prestamos={prestamos}
            onNavigate={setActiveSection}
            onUpdate={fetchData}
            showMessage={showMessage}
          />
        );
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 text-gray-800" style={{ ['--panel-w']: `${RAIL_WIDTH + SIDEBAR_WIDTH}px` }}>
      <div
        className="hidden md:block fixed inset-y-0 left-0 z-10 bg-cover bg-center"
        style={{ width: RAIL_WIDTH, backgroundImage: `url(${railImg})` }}
        aria-hidden
      />
      <div
        className="hidden md:block fixed inset-y-0 z-20"
        style={{ left: RAIL_WIDTH, width: SIDEBAR_WIDTH }}
      >
        <Sidebar active={activeSection} onSelect={setActiveSection} />
      </div>
      <main
        className="flex-1 overflow-y-auto p-8 pb-20 relative"
        style={{ marginLeft: RAIL_WIDTH + SIDEBAR_WIDTH }}
      >
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}
          >
            {message.text}
          </div>
        )}
        {renderSection()}
        <Footer />
      </main>
    </div>
  );
}

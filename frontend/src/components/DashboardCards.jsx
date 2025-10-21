import { BookOpen, Users, FileText, AlertCircle } from 'lucide-react';

export default function DashboardCards({ counts = {}, onNavigate = () => { } }) {
  const cards = [
    { key: 'prestamos', title: "Préstamos Activos", value: counts.prestamos ?? 27, Icon: FileText },
    { key: 'socios', title: "Socios", value: counts.socios ?? 27, Icon: Users },
    { key: 'libros', title: "Libros", value: counts.libros ?? 27, Icon: BookOpen },
    { key: 'multas', title: "Multas Pendientes", value: counts.multas ?? 27, Icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.Icon;
        return (
          <div
            key={card.title}
            className="bg-[#4A5568] text-white rounded-md p-4 shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-2xl font-bold my-2">{card.value}</p>
              <button
                onClick={() => onNavigate(card.key)}
                className="text-sm underline w-fit"
              >
                Ver todo
              </button>
            </div>

            <Icon className="w-12 h-12 text-white/70" />
          </div>
        );
      })}
    </div>
  );
}
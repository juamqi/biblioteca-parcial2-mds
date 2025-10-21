export default function Sidebar({ active = "inicio", onSelect = () => {} }) {
  const items = [
    { key: "inicio", label: "Inicio" },
    { key: "prestamos", label: "Préstamos" },
    { key: "socios", label: "Socios" },
    { key: "libros", label: "Libros" },
    { key: "multas", label: "Multas" },
  ];

  return (
    <aside
      className="
        w-64 h-full bg-[#B62211] text-[#F7F9FC]
        flex flex-col justify-center
        py-10 px-6
      "
    >
      <nav className="flex flex-col gap-6 w-full items-start m-6">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={`
              text-[20px]
              transition-opacity
              ${active === it.key ? "font-semibold opacity-100" : "font-normal opacity-80 hover:opacity-100"}
            `}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
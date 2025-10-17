import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ListaSocios() {
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    api.get("/socios").then((res) => setSocios(res.data));
  }, []);

  return (
    <div>
      <h2>Socios Registrados</h2>
      <ul>
        {socios.map((socio) => (
          <li key={socio.nroSocio}>
            {socio.nombre} — DNI: {socio.dni}
          </li>
        ))}
      </ul>
    </div>
  );
}

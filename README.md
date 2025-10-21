# Biblioteca - Parcial 2 (Metodología de Sistemas II)

Aplicación web desarrollada para la **gestión de una biblioteca**, como parte del **Segundo Parcial** de *Metodología de Sistemas II*.  
Permite registrar **libros, socios, préstamos y multas**, automatizando el flujo de préstamos y devoluciones.  
Basada en una arquitectura **MVC**, con un enfoque moderno, modular y escalable.

---

## Funcionalidades principales

- **Gestión de libros** (alta, edición, estado disponible/prestado)  
- **Gestión de socios** (registro, listado, validación por DNI)  
- **Préstamos y devoluciones** (registro automático, control de estado)  
- **Multas automáticas** por libros dañados  
- **Dashboard** con vista general del sistema  

---

## Arquitectura y Patrones

### Patrón de Arquitectura
**MVC (Modelo - Vista - Controlador):** separación clara entre lógica, interfaz y control de datos.

### Patrones de Diseño utilizados
| Tipo | Patrón | Uso en el proyecto |
|------|--------|--------------------|
| **Creacional** | Factory Method | Creación de modelos y conexiones sin acoplar clases. |
| **Estructural** | Facade | Simplifica el acceso a funciones del backend o base de datos. |
| **Comportamiento** | Strategy | Permite distintas estrategias de filtrado o búsqueda. |

---

## Tecnologías utilizadas

**Frontend:** React.js + Vite + Tailwind CSS + Axios  
**Backend:** Node.js + Express + MySQL  
**Maquetación:** Figma  
**Gestión y control:** GitHub

---

## Buenas prácticas aplicadas

- Código limpio, nombres descriptivos y comentarios claros.  
- Refactorización continua para reducir deuda técnica.  
- Aplicación de principios **SOLID** y **DRY**.  
- Desarrollo guiado por pruebas (**TDD**).  
- Documentación y actualización periódica de dependencias.

---

## Autor

**KASS, Juan Pablo Miguel**  

Fecha: *21/10/2025* 
# TechMarket

Tienda en línea de tecnología (electrónica, gaming, accesorios) desarrollada con **React 19 + Vite**, conectada a un backend real en **MockAPI.io**.

## Alcance del proyecto

- **Tienda pública**: catálogo de productos con filtros (precio, marca, categoría), buscador, banners promocionales, favoritos, carrito de compras y checkout con validación de stock en tiempo real.
- **Cuenta de cliente**: registro/login, perfil con datos de envío, historial de pedidos con opción de "volver a comprar", lista de favoritos.
- **Panel de administración**: gestión de productos (con precios y descuentos), categorías, pedidos y sus estados, cupones de descuento, banners del carrusel, usuarios administradores con permisos, clientes, e información general de la tienda.
- Diseño **responsive** en todas las vistas.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (se instala junto con Node)

## Instalación y ejecución

1. Cloná el repositorio y entrá a la carpeta del proyecto:
   ```bash
   git clone https://github.com/Melissa14F/TechMarket.git
   cd TechMarket
   ```

2. Instalá las dependencias:
   ```bash
   npm install
   ```

3. Creá un archivo `.env` en la raíz del proyecto (junto a `package.json`) con el siguiente contenido:
   ```
   VITE_API_URL=https://6aa6bc85d7765db985079180.mockapi.io
   ```
   Esta es la URL real del backend en MockAPI.io usada durante el desarrollo — sin esta variable, la app no tiene con qué conectarse y no va a mostrar productos, pedidos ni ningún dato.

4. Iniciá el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrí la URL que muestra la terminal (por defecto [http://localhost:5173](http://localhost:5173)).

## Credenciales de prueba

Para entrar al panel de administración:

- **Email:** admin@techmarket.com
- **Contraseña:** admin123

También podés registrar una cuenta de cliente nueva desde "Registrarse" en la pantalla de inicio de sesión.

## Stack técnico

- React 19 + Vite (JavaScript, sin TypeScript en el código de la app)
- MockAPI.io como backend REST
- CSS plano, sin frameworks de estilos ni librerías de UI adicionales

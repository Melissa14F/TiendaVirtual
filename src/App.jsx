import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from './components/layout/StorefrontLayout';
import AdminShell from './components/admin/AdminShell';
import CatalogoPage from './pages/CatalogoPage';
import ProductoPage from './pages/ProductoPage';
import CuentaPage from './pages/CuentaPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProductosPage from './pages/ProductosPage';
import CategoriasPage from './pages/CategoriasPage';
import PedidosPage from './pages/PedidosPage';
import EstadosOrdenPage from './pages/EstadosOrdenPage';
import ClientesPage from './pages/ClientesPage';
import DescuentosPage from './pages/DescuentosPage';
import AnunciosPage from './pages/AnunciosPage';
import InformacionPage from './pages/InformacionPage';
import UsuariosPage from './pages/UsuariosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/global.css';

/**
 * Raíz de rutas de la app. Tres ramas independientes:
 *  - "/", "/catalogo", "/producto/:id", "/cuenta" → comparten el chrome
 *    de la tienda (StorefrontLayout: Header, Menu, Footer, carrito).
 *  - "/login" → pantalla de autenticación a pantalla completa, sin ese chrome.
 *  - "/admin/*" → panel de administración, con su propio layout
 *    (AdminShell: sidebar + topbar) y sus propias sub-rutas anidadas.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<CatalogoPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/producto/:id" element={<ProductoPage />} />
        <Route path="/cuenta" element={<CuentaPage />} />
      </Route>

      <Route path="/login" element={<AuthPage />} />

      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="estados-pedido" element={<EstadosOrdenPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="descuentos" element={<DescuentosPage />} />
        <Route path="anuncios" element={<AnunciosPage />} />
        <Route path="informacion" element={<InformacionPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

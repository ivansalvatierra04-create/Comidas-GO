import { Navigate, Route, Routes } from 'react-router-dom'
import OwnerGate from './components/OwnerGate.jsx'
import Admin from './pages/Admin.jsx'
import Caja from './pages/Caja.jsx'
import Carrito from './pages/Carrito.jsx'
import CategoriaMenu from './pages/CategoriaMenu.jsx'
import Categorias from './pages/Categorias.jsx'
import ComidaDetalle from './pages/ComidaDetalle.jsx'
import Home from './pages/Home.jsx'
import ManualAdmin from './pages/ManualAdmin.jsx'
import ManualCliente from './pages/ManualCliente.jsx'
import Pedidos from './pages/Pedidos.jsx'
import Principal from './pages/Principal.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import SuperAdminGate from './components/SuperAdminGate.jsx'
import StorePublic from './pages/StorePublic.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inicio" element={<Principal />} />
      <Route path="/categorias" element={<Categorias />} />
      <Route path="/categoria/:categoryId" element={<CategoriaMenu />} />
      <Route path="/categoria/:categoryId/comida/:itemId" element={<ComidaDetalle />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/pedidos" element={<Pedidos />} />
      <Route path="/ayuda" element={<ManualCliente />} />
      <Route path="/c/:slug" element={<StorePublic />} />
      <Route path="/caja" element={<OwnerGate><Caja /></OwnerGate>} />
      <Route path="/admin" element={<OwnerGate><Admin /></OwnerGate>} />
      <Route path="/admin/manual" element={<OwnerGate><ManualAdmin /></OwnerGate>} />
      <Route path="/superadmin" element={<SuperAdminGate><SuperAdmin /></SuperAdminGate>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

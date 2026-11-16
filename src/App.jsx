import { Navigate, Route, Routes } from 'react-router-dom'
import Admin from './pages/Admin.jsx'
import Carrito from './pages/Carrito.jsx'
import CategoriaMenu from './pages/CategoriaMenu.jsx'
import Categorias from './pages/Categorias.jsx'
import ComidaDetalle from './pages/ComidaDetalle.jsx'
import Home from './pages/Home.jsx'
import Pedidos from './pages/Pedidos.jsx'
import Principal from './pages/Principal.jsx'
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
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

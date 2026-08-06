import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TercerosPage } from './pages/TercerosPage'
import { TerceroDetallePage } from './pages/TerceroDetallePage'
import { ProyectosPage } from './pages/ProyectosPage'
import { ProyectoDetallePage } from './pages/ProyectoDetallePage'
import { ProductosPage } from './pages/ProductosPage'
import { PresupuestosPage } from './pages/PresupuestosPage'
import { PresupuestoDetallePage } from './pages/PresupuestoDetallePage'
import { OrdenesTrabajoPage } from './pages/OrdenesTrabajoPage'
import { OTDetallePage } from './pages/OTDetallePage'
import { AgendaPage } from './pages/AgendaPage'
import { ComprasPage } from './pages/ComprasPage'
import { CompraDetallePage } from './pages/CompraDetallePage'
import { VentasPage } from './pages/VentasPage'
import { VentaDetallePage } from './pages/VentaDetallePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/terceros"
            element={
              <ProtectedRoute>
                <Layout>
                  <TercerosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/terceros/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TerceroDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProyectosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProyectoDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/presupuestos"
            element={
              <ProtectedRoute>
                <Layout>
                  <PresupuestosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/presupuestos/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PresupuestoDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordenes-trabajo"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdenesTrabajoPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordenes-trabajo/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <OTDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Layout>
                  <AgendaPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compras"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComprasPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compras/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompraDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <Layout>
                  <VentasPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <VentaDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

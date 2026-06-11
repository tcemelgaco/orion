import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DemandasPage } from './pages/DemandasPage'
import { NovaDemandaPage } from './pages/NovaDemandaPage'
import { DetalheDemandaPage } from './pages/DetalheDemandaPage'
import { EntrevistaPage } from './pages/EntrevistaPage'
import { CanvasPage } from './pages/CanvasPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/demandas" replace />} />
        <Route path="/demandas" element={<DemandasPage />} />
        <Route path="/demandas/nova" element={<NovaDemandaPage />} />
        <Route path="/demandas/:id" element={<DetalheDemandaPage />} />
        <Route path="/demandas/:demandaId/canvas" element={<CanvasPage />} />
        <Route path="/entrevistas/:id" element={<EntrevistaPage />} />
      </Routes>
    </BrowserRouter>
  )
}

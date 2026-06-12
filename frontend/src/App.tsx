import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DemandasPage } from './pages/DemandasPage'
import { NovaDemandaPage } from './pages/NovaDemandaPage'
import { DetalheDemandaPage } from './pages/DetalheDemandaPage'
import { EntrevistaPage } from './pages/EntrevistaPage'
import { CanvasPage } from './pages/CanvasPage'
import { RequisitosPage } from './pages/RequisitosPage'
import { BacklogPage } from './pages/BacklogPage'
import { ArtefatosPage } from './pages/ArtefatosPage'
import { CasosDeUsoPage } from './pages/CasosDeUsoPage'
import { ModelagemPage } from './pages/ModelagemPage'
import { ArquiteturaPage } from './pages/ArquiteturaPage'
import { EstimativasPage } from './pages/EstimativasPage'
import { GovernancaPage } from './pages/GovernancaPage'
import { ConformidadePage } from './pages/ConformidadePage'
import { PrototipoPage } from './pages/PrototipoPage'
import { ConhecimentoPage } from './pages/ConhecimentoPage'
import { AgentesPage } from './pages/AgentesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/demandas" replace />} />
        <Route path="/demandas" element={<DemandasPage />} />
        <Route path="/demandas/nova" element={<NovaDemandaPage />} />
        <Route path="/demandas/:id" element={<DetalheDemandaPage />} />
        <Route path="/demandas/:demandaId/canvas" element={<CanvasPage />} />
        <Route path="/demandas/:demandaId/requisitos" element={<RequisitosPage />} />
        <Route path="/demandas/:demandaId/backlog" element={<BacklogPage />} />
        <Route path="/demandas/:demandaId/artefatos" element={<ArtefatosPage />} />
        <Route path="/demandas/:demandaId/casos-de-uso" element={<CasosDeUsoPage />} />
        <Route path="/demandas/:demandaId/modelagem" element={<ModelagemPage />} />
        <Route path="/demandas/:demandaId/arquitetura" element={<ArquiteturaPage />} />
        <Route path="/demandas/:demandaId/estimativas" element={<EstimativasPage />} />
        <Route path="/demandas/:demandaId/governanca" element={<GovernancaPage />} />
        <Route path="/demandas/:demandaId/conformidade" element={<ConformidadePage />} />
        <Route path="/demandas/:demandaId/prototipo" element={<PrototipoPage />} />
        <Route path="/entrevistas/:id" element={<EntrevistaPage />} />
        <Route path="/conhecimento" element={<ConhecimentoPage />} />
        <Route path="/demandas/:demandaId/agentes" element={<AgentesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

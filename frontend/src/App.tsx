import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { EntrevistaPage } from './pages/EntrevistaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/entrevistas/:id" element={<EntrevistaPage />} />
      </Routes>
    </BrowserRouter>
  )
}

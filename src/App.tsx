import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { ServicePage } from './components/ServicePage'
import { ContactPage } from './components/ContactPage'
import { DynamicPage } from './components/DynamicPage'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/:city/:service" element={<DynamicPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
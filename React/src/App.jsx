import { SectionProvider, useSection } from './context/SectionContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Layout from './components/Layout/Layout.jsx'
import NavButtons from './components/Navigation/NavButtons.jsx'
import FloatingButton from './components/Navigation/FloatingButton.jsx'
import BottomSheet from './components/Navigation/BottomSheet.jsx'
import Inicio from './components/sections/Inicio.jsx'
import Formacion from './components/sections/Formacion.jsx'
import Experiencia from './components/sections/Experiencia.jsx'
import Proyectos from './components/sections/Proyectos.jsx'
import Contacto from './components/sections/Contacto.jsx'
import Login from './pages/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Loading from './components/Loading.jsx'
import useMediaQuery from './hooks/useMediaQuery.js'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './styles/global.css'
import './styles/layout.css'
import './styles/navigation.css'
import './styles/sections.css'
import './styles/avatar.css'
import './styles/photo-uploader.css'
import './styles/states.css'
import './styles/admin.css'
import './styles/contact.css'
import './styles/login.css'

const sections = {
  Inicio,
  Formación: Formacion,
  Experiencia,
  Proyectos,
  Contacto,
}

function PublicView() {
  const { activeSection } = useSection()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const ActiveSection = sections[activeSection] || Inicio

  return (
    <Layout nav={isMobile ? null : <NavButtons />}>
      {isMobile && (
        <>
          <FloatingButton onClick={() => setIsSheetOpen((open) => !open)} />
          <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
            <NavButtons onNavigate={() => setIsSheetOpen(false)} />
          </BottomSheet>
        </>
      )}
      <ActiveSection />
    </Layout>
  )
}

function AppContent() {
  const { activeSection, setActiveSection } = useSection()
  const { user, loading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (activeSection !== 'Proyectos' && searchParams.has('proyecto')) {
      const next = new URLSearchParams(searchParams)
      next.delete('proyecto')
      setSearchParams(next, { replace: true })
    }
  }, [activeSection, searchParams, setSearchParams])

  if (loading) return <Loading />

  if (activeSection === 'Login') {
    if (user) {
      return <AdminLayout onExit={() => setActiveSection('Inicio')} />
    }

    return (
      <Layout>
        <Login />
      </Layout>
    )
  }

  return <PublicView />
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SectionProvider>
          <AppContent />
        </SectionProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App

import { createContext, useContext, useState } from 'react'

const SectionContext = createContext()

function seccionInicial() {
  if (typeof window === 'undefined') {
    return 'Inicio'
  }

  const params = new URLSearchParams(window.location.search)

  return params.has('proyecto') ? 'Proyectos' : 'Inicio'
}

export function SectionProvider({ children }) {
  const [activeSection, setActiveSection] = useState(seccionInicial)

  return (
    <SectionContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </SectionContext.Provider>
  )
}

export function useSection() {
  const context = useContext(SectionContext)
  if (!context) {
    throw new Error('useSection debe usarse dentro de SectionProvider')
  }
  return context
}

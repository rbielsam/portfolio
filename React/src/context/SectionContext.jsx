import { createContext, useContext, useState } from 'react'

const SectionContext = createContext()

export function SectionProvider({ children }) {
  const [activeSection, setActiveSection] = useState('Inicio')

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

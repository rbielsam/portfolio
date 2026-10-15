import { useSection } from '../../context/SectionContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import SessionChip from './SessionChip.jsx'

const buttons = [
  { id: 'Inicio', clave: 'seccion.inicio' },
  { id: 'Formación', clave: 'seccion.formacion' },
  { id: 'Experiencia', clave: 'seccion.experiencia' },
  { id: 'Proyectos', clave: 'seccion.proyectos' },
  { id: 'Contacto', clave: 'seccion.contacto' },
]

function NavButtons() {
  const { activeSection, setActiveSection } = useSection()
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <nav className="nav-buttons">
      {buttons.map(({ id, clave }) => (
        <button
          key={id}
          className={`nav-buttons__button ${activeSection === id ? 'nav-buttons__button--active' : ''}`}
          onClick={() => setActiveSection(id)}
        >
          {t(clave)}
        </button>
      ))}
      {user ? (
        <SessionChip />
      ) : (
        <button
          className={`nav-buttons__button ${activeSection === 'Login' ? 'nav-buttons__button--active' : ''}`}
          onClick={() => setActiveSection('Login')}
        >
          {t('nav.login')}
        </button>
      )}
    </nav>
  )
}

export default NavButtons

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

function NavButtons({ onNavigate }) {
  const { activeSection, setActiveSection } = useSection()
  const { user } = useAuth()
  const { t } = useLanguage()

  const go = (id) => {
    setActiveSection(id)
    if (onNavigate) onNavigate()
  }

  return (
    <nav className="nav-buttons">
      {buttons.map(({ id, clave }) => (
        <button
          key={id}
          className={`nav-buttons__button ${activeSection === id ? 'nav-buttons__button--active' : ''}`}
          onClick={() => go(id)}
        >
          {t(clave)}
        </button>
      ))}
      {user ? (
        <SessionChip />
      ) : (
        <button
          className={`nav-buttons__button ${activeSection === 'Login' ? 'nav-buttons__button--active' : ''}`}
          onClick={() => go('Login')}
        >
          {t('nav.login')}
        </button>
      )}
    </nav>
  )
}

export default NavButtons

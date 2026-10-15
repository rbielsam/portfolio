import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import BottomSheet from '../../components/Navigation/BottomSheet.jsx';
import LangSwitcher from '../../components/Language/LangSwitcher.jsx';
import AdminPerfil from './AdminPerfil.jsx';
import AdminFormacion from './AdminFormacion.jsx';
import AdminExperiencia from './AdminExperiencia.jsx';
import AdminProyectos from './AdminProyectos.jsx';
import AdminMensajes from './AdminMensajes.jsx';
import AdminUsuarios from './AdminUsuarios.jsx';

const views = {
  perfil: AdminPerfil,
  formacion: AdminFormacion,
  experiencia: AdminExperiencia,
  proyectos: AdminProyectos,
  mensajes: AdminMensajes,
  usuarios: AdminUsuarios,
};

const menu = [
  { key: 'perfil', clave: 'admin.perfil' },
  { key: 'formacion', clave: 'seccion.formacion' },
  { key: 'experiencia', clave: 'seccion.experiencia' },
  { key: 'proyectos', clave: 'seccion.proyectos' },
  { key: 'mensajes', clave: 'admin.mensajes' },
  { key: 'usuarios', clave: 'admin.usuarios' },
];

function AdminLayout({ onExit }) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState('perfil');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const ActiveView = views[activeView];

  async function handleLogout() {
    await logout();
    if (onExit) onExit();
  }

  function selectView(key) {
    setActiveView(key);
    setIsSheetOpen(false);
  }

  const menuItems = (
    <>
      <p className="admin__user">{user?.email}</p>
      {!isMobile && <LangSwitcher variant="dark" />}
      {menu
        .filter((item) => item.key !== 'usuarios' || can('users'))
        .map((item) => (
        <button
          key={item.key}
          className={`admin__nav-button ${activeView === item.key ? 'admin__nav-button--active' : ''}`}
          onClick={() => selectView(item.key)}
        >
          {t(item.clave)}
        </button>
      ))}
      <button className="admin__nav-button" onClick={onExit}>
        {t('admin.ver_portfolio')}
      </button>
      <button className="admin__nav-button admin__nav-button--logout" onClick={handleLogout}>
        {t('admin.cerrar_sesion')}
      </button>
    </>
  );

  return (
    <div className="admin">
      {isMobile ? (
        <header className="admin__topbar">
          <span className="admin__topbar-title">{t('admin.titulo')}</span>
          <LangSwitcher variant="dark" />
          <button
            className="admin__menu-button"
            onClick={() => setIsSheetOpen(true)}
            aria-label={t('nav.abrir_menu')}
          >
            ☰
          </button>
        </header>
      ) : (
        <nav className="admin__nav">{menuItems}</nav>
      )}

      <main className="admin__content">
        <ActiveView />
      </main>

      {isMobile && (
        <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
          <nav className="admin__nav admin__nav--sheet">{menuItems}</nav>
        </BottomSheet>
      )}
    </div>
  );
}

export default AdminLayout;

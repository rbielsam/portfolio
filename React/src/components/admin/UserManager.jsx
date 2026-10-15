import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client.js';
import mensajeDe from '../../api/mensajes.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const EMPTY_FORM = { name: '', email: '', role: 'reader', password: '', password_confirmation: '' };

export function UserManager() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      password_confirmation: '',
    });
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) {
          payload.password = form.password;
          payload.password_confirmation = form.password_confirmation;
        }
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post('/admin/users', {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });
      }

      cancel();
      await loadUsers();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(t('usuarios.confirmar', { name: user.name }))) return;

    setError(null);
    try {
      await api.delete(`/admin/users/${user.id}`);
      await loadUsers();
    } catch (err) {
      setError(err);
    }
  }

  if (loading) return <p>{t('usuarios.cargando')}</p>;
  if (error && users.length === 0) {
    return <p className="admin-error">{mensajeDe(error, t, 'usuarios.error_cargar')}</p>;
  }

  return (
    <div className="user-manager">
      <div className="user-manager__header">
        <h2 className="admin-view__title">{t('admin.usuarios')}</h2>
        <button className="admin-btn" type="button" onClick={openCreate}>
          {t('usuarios.crear')}
        </button>
      </div>

      {error && <p className="admin-error">{mensajeDe(error, t, 'usuarios.error_guardar')}</p>}

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-list__item">
            <div className="user-list__info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className={`user-role user-role--${user.role}`}>{t(`usuarios.rol_${user.role}`)}</span>
            </div>
            <div className="user-list__actions">
              <button className="admin-btn admin-btn--small" type="button" onClick={() => openEdit(user)}>
                {t('common.editar')}
              </button>
              <button className="admin-btn admin-btn--small admin-btn--danger" type="button" onClick={() => handleDelete(user)}>
                {t('common.eliminar')}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3 className="admin-form__title">{editingUser ? t('usuarios.editar_titulo') : t('usuarios.crear_titulo')}</h3>

          <label className="admin-form__label">
            {t('common.nombre')}
            <input className="admin-form__input" value={form.name} onChange={update('name')} required />
          </label>

          <label className="admin-form__label">
            {t('common.email')}
            <input className="admin-form__input" type="email" value={form.email} onChange={update('email')} required />
          </label>

          <label className="admin-form__label">
            {t('usuarios.rol')}
            <select className="admin-form__input" value={form.role} onChange={update('role')}>
              <option value="admin">{t('usuarios.rol_admin')}</option>
              <option value="editor">{t('usuarios.rol_editor')}</option>
              <option value="reader">{t('usuarios.rol_reader')}</option>
            </select>
          </label>

          {!editingUser && (
            <>
              <label className="admin-form__label">
                {t('usuarios.password')}
                <input className="admin-form__input" type="password" value={form.password} onChange={update('password')} required />
              </label>
              <label className="admin-form__label">
                {t('usuarios.confirm_password')}
                <input className="admin-form__input" type="password" value={form.password_confirmation} onChange={update('password_confirmation')} required />
              </label>
            </>
          )}

          {editingUser && (
            <>
              <label className="admin-form__label">
                {t('usuarios.password_nueva')}
                <input className="admin-form__input" type="password" value={form.password} onChange={update('password')} />
              </label>
              <label className="admin-form__label">
                {t('usuarios.confirm_nueva')}
                <input className="admin-form__input" type="password" value={form.password_confirmation} onChange={update('password_confirmation')} />
              </label>
            </>
          )}

          <div className="admin-form__actions">
            <button className="admin-btn" type="submit" disabled={saving}>
              {saving ? t('common.guardando') : t('common.guardar')}
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" onClick={cancel}>
              {t('common.cancelar')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UserManager;

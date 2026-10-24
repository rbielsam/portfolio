import { useEffect, useRef, useState } from 'react';
import api from '../../api/client.js';
import mensajeDe from '../../api/mensajes.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const ACCEPTED_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

function extensionOf(fileName) {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function draftsFrom(images) {
  return Object.fromEntries(images.map((image) => [image.id, image.caption ?? '']));
}

function ProjectImageManager({ project, onImagesChange }) {
  const { t } = useLanguage();
  const images = project.images || [];
  const [drafts, setDrafts] = useState(() => draftsFrom(images));
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setDrafts(draftsFrom(project.images || []));
    setError(null);
  }, [project.id]);

  const limitReached = images.length >= MAX_IMAGES;

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleFileChange(event) {
    setError(null);
    const selected = event.target.files?.[0];

    if (!selected) {
      setFile(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(extensionOf(selected.name))) {
      setFile(null);
      setError(t('proyectos.imagen_error_formato'));
      resetInput();
      return;
    }

    if (selected.size > MAX_SIZE) {
      setFile(null);
      setError(t('proyectos.imagen_error_tamano'));
      resetInput();
      return;
    }

    setFile(selected);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      return;
    }

    if (limitReached) {
      setError(t('proyectos.imagen_limite'));
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    const comentario = caption.trim();

    if (comentario) {
      formData.append('caption', comentario);
    }

    try {
      const created = await api.upload(`/projects/${project.id}/images`, formData);

      onImagesChange?.([...images, created]);
      setFile(null);
      setCaption('');
      resetInput();
    } catch (err) {
      setError(mensajeDe(err, t, 'proyectos.imagen_error_subir'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveCaption(image) {
    const anterior = image.caption ?? '';

    setSavingId(image.id);
    setError(null);

    try {
      const updated = await api.put(`/projects/${project.id}/images/${image.id}`, {
        caption: drafts[image.id] ?? anterior,
      });

      onImagesChange?.(images.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setDrafts((current) => ({ ...current, [image.id]: anterior }));
      setError(mensajeDe(err, t, 'proyectos.imagen_error_comentario'));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(image) {
    if (!window.confirm(t('proyectos.imagen_confirmar'))) {
      return;
    }

    setDeletingId(image.id);
    setError(null);

    try {
      await api.delete(`/projects/${project.id}/images/${image.id}`);
      onImagesChange?.(images.filter((item) => item.id !== image.id));
    } catch (err) {
      setError(mensajeDe(err, t, 'proyectos.imagen_error_eliminar'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="project-images">
      <div className="project-images__header">
        <h3 className="project-images__title">{t('proyectos.imagenes')}</h3>
        <p className="project-images__hint">{t('proyectos.imagenes_ayuda')}</p>
      </div>

      <p className="project-images__warning">{t('proyectos.imagenes_publicas')}</p>

      {error && <p className="admin-error">{error}</p>}

      {images.length === 0 ? (
        <p className="project-images__empty">{t('proyectos.sin_imagenes')}</p>
      ) : (
        <ul className="project-images__list">
          {images.map((image, index) => (
            <li key={image.id} className="project-images__item">
              <img
                className="project-images__thumb"
                src={image.url}
                alt={t('proyectos.imagen_alt', {
                  n: index + 1,
                  title: project.title,
                })}
                loading="lazy"
              />
              <div className="project-images__body">
                {index === 0 && (
                  <span className="admin-view__badge">{t('proyectos.portada')}</span>
                )}
                <label className="admin-form__label">
                  {t('proyectos.comentario')}
                  <textarea
                    className="admin-form__textarea project-images__caption"
                    maxLength={500}
                    value={drafts[image.id] ?? image.caption ?? ''}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [image.id]: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="project-images__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--small"
                    disabled={savingId === image.id}
                    onClick={() => handleSaveCaption(image)}
                  >
                    {savingId === image.id
                      ? t('common.guardando')
                      : t('proyectos.guardar_comentario')}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--small admin-btn--danger"
                    disabled={deletingId === image.id}
                    onClick={() => handleDelete(image)}
                  >
                    {t('proyectos.eliminar_imagen')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="project-images__upload" onSubmit={handleUpload}>
        <label className="admin-form__label" htmlFor="project-image-file">
          {t('proyectos.añadir_imagen')}
          <input
            id="project-image-file"
            ref={inputRef}
            className="admin-form__input"
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            onChange={handleFileChange}
          />
        </label>

        <label className="admin-form__label">
          {t('proyectos.comentario')}
          <textarea
            className="admin-form__textarea"
            maxLength={500}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          <small className="admin-form__hint">{t('proyectos.comentario_ayuda')}</small>
        </label>

        {file && (
          <p className="project-images__filename">
            {file.name} ({(file.size / 1024).toFixed(0)} KB)
          </p>
        )}

        {limitReached && (
          <p className="project-images__hint">{t('proyectos.imagen_limite')}</p>
        )}

        <button
          type="submit"
          className="admin-btn"
          disabled={!file || uploading || limitReached}
        >
          {uploading ? t('proyectos.subiendo') : t('proyectos.subir_imagen')}
        </button>
      </form>
    </section>
  );
}

export default ProjectImageManager;

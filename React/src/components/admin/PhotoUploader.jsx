import { useState, useEffect, useRef } from 'react';
import api from '../../api/client.js';
import { photoUrl } from '../../utils/initials.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const ACCEPTED_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE = 2 * 1024 * 1024;

function extensionOf(fileName) {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export function PhotoUploader({ currentPhoto, onUploaded, onRemoved, readOnly = false }) {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleChange(event) {
    setError(null);
    const selected = event.target.files?.[0];

    if (!selected) {
      setFile(null);
      return;
    }

    const extension = extensionOf(selected.name);

    if (!ACCEPTED_TYPES.includes(extension)) {
      setFile(null);
      setError(t('perfil.error_formato'));
      resetInput();
      return;
    }

    if (selected.size > MAX_SIZE) {
      setFile(null);
      setError(t('perfil.error_tamano'));
      resetInput();
      return;
    }

    setFile(selected);
  }

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function cancel() {
    setFile(null);
    setError(null);
    resetInput();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const method = currentPhoto ? 'PUT' : 'POST';
      const result = await api.upload('/profile/photo', formData, method);

      cancel();
      onUploaded?.(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    setError(null);

    try {
      await api.delete('/profile/photo');
      cancel();
      onRemoved?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function errorMessage(err) {
    if (err?.status && err?.message) {
      return err.message;
    }

    if (err?.status === 422) {
      return t('perfil.error_invalida');
    }

    return t('perfil.error_guardar');
  }

  const imageSrc = preview || photoUrl(currentPhoto);
  const imageOk = Boolean(imageSrc) && imageSrc !== failedSrc;

  return (
    <div className="photo-uploader">
      <p className="photo-uploader__label">{t('perfil.foto')}</p>

      <div className="photo-uploader__preview">
        {imageOk ? (
          <img
            src={imageSrc}
            alt={t('perfil.preview_alt')}
            onError={() => setFailedSrc(imageSrc)}
          />
        ) : (
          <span className="photo-uploader__placeholder">{t('perfil.sin_foto')}</span>
        )}
      </div>

      {file && (
        <p className="photo-uploader__filename">
          {file.name} ({(file.size / 1024).toFixed(0)} KB)
        </p>
      )}

      {!readOnly && (
        <input
          ref={inputRef}
          className="photo-uploader__input"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={handleChange}
        />
      )}

      {error && <p className="photo-uploader__error">{error}</p>}

      {!readOnly && (
        <div className="photo-uploader__actions">
          <button
            className="photo-uploader__button"
            type="button"
            disabled={!file || loading}
            onClick={handleSubmit}
          >
            {loading ? t('perfil.subir') : t('perfil.guardar_foto')}
          </button>

          <button
            className="photo-uploader__button photo-uploader__button--ghost"
            type="button"
            disabled={!file || loading}
            onClick={cancel}
          >
            {t('common.cancelar')}
          </button>

          {currentPhoto && !file && (
            <button
              className="photo-uploader__button photo-uploader__button--danger"
              type="button"
              disabled={loading}
              onClick={handleRemove}
            >
              {t('perfil.quitar_foto')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;

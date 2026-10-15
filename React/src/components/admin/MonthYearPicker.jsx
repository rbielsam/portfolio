import { useEffect, useState } from 'react';
import { MESES, aniosDisponibles } from '../../utils/dates.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function MonthYearPicker({ label, value = '', onChange }) {
  const { t, lang } = useLanguage();
  const [year, setYear] = useState(() => (value ? value.split('-')[0] : ''));
  const [month, setMonth] = useState(() => (value ? value.split('-')[1] : ''));

  useEffect(() => {
    const [anio, mes] = value.split('-');
    setYear(anio ?? '');
    setMonth(mes ?? '');
  }, [value]);

  function update(nextYear, nextMonth) {
    setYear(nextYear);
    setMonth(nextMonth);
    onChange(nextYear && nextMonth ? `${nextYear}-${nextMonth}` : '');
  }

  return (
    <label className="admin-form__label">
      {label}
      <span className="admin-form__dates">
        <select
          className="admin-form__input"
          aria-label={`${label} ${t('picker.mes')}`}
          value={month}
          onChange={(e) => update(year, e.target.value)}
        >
          <option value="">{t('picker.mes')}</option>
          {MESES[lang].map((nombre, index) => (
            <option key={nombre} value={String(index + 1).padStart(2, '0')}>
              {nombre}
            </option>
          ))}
        </select>

        <select
          className="admin-form__input"
          aria-label={`${label} ${t('picker.anio')}`}
          value={year}
          onChange={(e) => update(e.target.value, month)}
        >
          <option value="">{t('picker.anio')}</option>
          {aniosDisponibles(year).map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

export default MonthYearPicker;

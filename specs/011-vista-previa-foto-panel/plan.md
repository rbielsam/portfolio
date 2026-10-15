# Plan — Vista previa de la foto de perfil en el panel (Spec 011)

## Alcance

Corrección de un fallo **100% frontend**, confinada a **un único fichero**: `src/components/admin/PhotoUploader.jsx`.

- **No toca backend**: sin endpoints, sin migraciones, sin cambios en la respuesta de `/api/profile`.
- **No toca la estructura de datos**: `profiles.photo` sigue guardando `photos/xxx.jpg` igual que ahora.
- **No toca el resto del subidor**: validación de tipo y tamaño, botones, mensajes de error y borrado quedan intactos.
- **No toca la estética del panel** (spec **009**, reservada).
- **No toca la spec 010**: la navegación pública y el destino del login quedan como están.

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Helper de URL**: `photoUrl()` de `src/utils/initials.js` — ya usado por `sections/Inicio.jsx` y `Navigation/SessionChip.jsx`
- **Estilos**: `src/styles/photo-uploader.css` (ya existente; `.photo-uploader__placeholder` y `.photo-uploader__preview img` están definidos)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)

## Decisiones de implementación

### D1 — Aplicar `photoUrl()` solo a `currentPhoto`, nunca a `preview`

```jsx
const imageSrc = preview || photoUrl(currentPhoto);
```

- `photoUrl(null)` → `null` → se muestra el marcador (caso "sin foto" y caso "foto quitada" siguen funcionando sin código adicional).
- `photoUrl('photos/x.jpg')` → `/storage/photos/x.jpg` → imagen correcta.
- `preview` es un `blob:` generado por `URL.createObjectURL()`. Pasarlo por `photoUrl()` lo convertiría en `/storage/blob:http://...` y **rompería la previsualización local**. Por eso `preview` queda fuera de la llamada. Esto es exactamente el RF-2.

### D2 — El estado de imagen rota se guarda como **URL**, no como booleano

```jsx
const [failedSrc, setFailedSrc] = useState(null);
const imageOk = Boolean(imageSrc) && imageSrc !== failedSrc;
```

Y en el `<img>`: `onError={() => setFailedSrc(imageSrc)}`.

**Por qué no un booleano como en `SessionChip` (spec 010)**: allí la foto no cambia durante la sesión, así que un booleano pegajoso no molesta. Aquí `imageSrc` **sí cambia** (subir, quitar, elegir archivo): con un booleano, una foto rota dejaría el marcador clavado incluso después de subir una válida. Guardar la URL que falló se auto-invalida en cuanto `imageSrc` cambia, y **no hace falta ningún `useEffect`**.

### D3 — Sin CSS nuevo

Cuando `imageOk` es falso se renderiza el `<span class="photo-uploader__placeholder">` que ya existe y ya está estilado. No se añade ninguna regla a `photo-uploader.css`.

### D4 — La rama de `preview` no se toca en su lógica

El orden `preview || photoUrl(currentPhoto)` conserva la precedencia actual: si hay archivo local elegido, manda él; si no, se resuelve la foto guardada.

### D5 — La foto real no se toca: verificación no destructiva (decidido)

La foto actual (`photos/EUDUR9PqSeIpt9nPNBvFm8UpZ0Bk57Vm.jpg`) **es el dato real del usuario**. El usuario ha decidido **no modificarla**: ni subir una foto de prueba ni pulsar "Quitar foto".

Por tanto la validación manual se limita a operaciones **no destructivas**. Los dos criterios que exigirían tocar el dato («tras subir» y «tras quitar») se cubren mediante inspección de código y test estático, apoyándose en que comparten la misma expresión que el caso que sí se prueba.

## Estructura de ficheros

### Frontend (`React/`) — 2 ficheros (1 modificado, 1 nuevo)

```
src/
└── components/admin/PhotoUploader.jsx   (importar photoUrl, imageSrc, onError)
tests/
└── t16.test.js                          (nuevo: tests de la spec 011)
```

> No se modifica ningún test existente. `t15` (spec 010) y los anteriores quedan intactos.

## Pasos de implementación

1. **Tests primero**: crear `tests/t16.test.js` con las comprobaciones estáticas. Deben fallar todavía.
2. **`PhotoUploader.jsx`**: importar `photoUrl`, cambiar `shownImage` por `imageSrc` + `failedSrc`, añadir `onError`.
3. **Suite y build**: `npm test` y `npm run build` en verde.
4. **Validación manual** de las rutas no destructivas.
5. **Comprobación de regresión**: sección Inicio e indicador de sesión siguen mostrando la foto.

## Verificación

### Automática

- `npm test` → pasan los 151 existentes + los nuevos de `t16`. **Ningún test previo se modifica.**
- `npm run build` → sin errores.

### Manual — operaciones no destructivas

- **Abrir "Perfil" con la foto guardada**: la imagen se ve correctamente. Es el fallo actual (`naturalWidth: 0`) que debe pasar a cargar.
- **Elegir un archivo válido** (sin subirlo): aparece la previsualización local (`blob:`).
- **Cancelar la selección**: se vuelve a la foto guardada.
- **Sección Inicio**: la foto grande sigue viéndose (regresión del spec 005).
- **Indicador de sesión**: el chip sigue mostrando la foto (regresión del spec 010).
- **Sin foto**: comprobado por código y test; hoy ya muestra el marcador.

### Manual — no se realiza (decidido: no tocar la foto real)

- **Subir una foto de prueba** → **no se hace**. Cubierto por inspección: comparte la expresión `preview || photoUrl(currentPhoto)` con el caso "al abrir", que sí se prueba.
- **Quitar la foto** → **no se hace**. Cubierto por inspección: `onRemoved` pone `photo: null` → `photoUrl(null)` → `null` → marcador.

### Cobertura sin tocar datos

- El RF-1 (al abrir) y el RF-2 (previsualización local) se prueban manualmente porque no modifican nada.
- El criterio "tras subir" comparte **exactamente la misma expresión** que "al abrir" (`preview || photoUrl(currentPhoto)`); la única diferencia es que `preview` se limpia al terminar, comportamiento que no se modifica.
- El RF-3 (`onError`) se cubre con test estático.
- El borrado se cubre por inspección: `onRemoved` pone `photo: null` → `photoUrl(null)` → `null` → marcador.

## Criterios de finalización del plan

- Al abrir "Perfil" con una foto guardada, la imagen se carga (antes: icono roto).
- Elegir un archivo muestra su previsualización local y cancelar vuelve a la foto guardada.
- Sin foto, o con `photo = null`, se muestra "Sin foto", como hasta ahora.
- Si la imagen falla al cargarse, se muestra el marcador y no un icono roto.
- La sección Inicio y el indicador de sesión siguen mostrando la foto igual.
- El resto del subidor (validación, botones, errores, borrado) no cambia de comportamiento.
- Se toca un solo fichero de fuente.
- `npm test` y `npm run build` en verde, sin modificar ningún test existente.

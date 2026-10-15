# AGENTS.md — Portfolio

Portfolio es un proyecto web para mostrar mi perfil profesional, proyectos, experiencia y formación.
Su objetivo es presentar de forma clara mi perfil como desarrollador web y los proyectos realizados.

## Stack y estructura

La arquitectura y las tecnologías principales del proyecto se definirán durante la fase de planificación.

No asumir tecnologías, dependencias o decisiones de arquitectura que todavía no hayan sido definidas.

- `docs/`: documentación y decisiones generales del proyecto.
- `specs/`: especificaciones de funcionalidades y sus planes y tareas.
- `AGENTS.md`: reglas y convenciones permanentes que deben seguir los agentes.
- `MEMORY.md`: estado del proyecto, decisiones relevantes y aprendizajes que deban conservarse.

## Comandos

Los comandos de desarrollo, pruebas, lint y compilación se definirán cuando se establezca el stack del proyecto.

No ejecutar ni asumir comandos de herramientas que todavía no hayan sido definidos.

## Convenciones

- La interfaz y la documentación del proyecto estarán en español.
- El código seguirá las convenciones propias de las tecnologías utilizadas.
- Utilizar nombres claros y descriptivos.
- Mantener el código sencillo y comprensible.
- Evitar comentarios innecesarios; utilizarlos únicamente cuando aporten contexto.
- Mantener los cambios pequeños y enfocados.
- Seguir los patrones establecidos en el código existente.
- No introducir patrones o convenciones nuevos sin una razón justificada.

## Reglas de dominio / trampas conocidas

- La información privada del área de administración no debe exponerse públicamente.
- Las credenciales y secretos nunca deben incluirse en el código ni en archivos públicos.
- El frontend no debe acceder directamente a la base de datos.
- Las funcionalidades deben estar definidas en una spec aprobada antes de implementarse.
- Si una decisión no está definida o existe una contradicción, detenerse y preguntar al usuario en lugar de asumir.

## Forma de trabajar

- Leer `docs/constitution.md` antes de trabajar en el proyecto.
- Leer `MEMORY.md` al comenzar una tarea relevante.
- Leer la spec activa antes de modificar código.
- La spec aprobada es la fuente de verdad para la funcionalidad.
- No implementar funcionalidades que no estén definidas en una spec aprobada.
- Seguir el flujo SDD:
  `Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio`.
- No avanzar a la siguiente fase sin la aprobación explícita del usuario.
- Mantener los cambios pequeños y enfocados.
- Al terminar una tarea, explicar brevemente qué se ha realizado, las comprobaciones efectuadas y cualquier decisión pendiente.
- Actualizar `MEMORY.md` cuando cambie el estado del proyecto, se tome una decisión relevante o aparezca un aprendizaje importante.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## Límites

- ✅ Siempre: respetar `docs/constitution.md` y la spec activa.
- ✅ Siempre: mantener separadas la interfaz, la lógica de negocio y el acceso a datos.
- ✅ Siempre: proteger los datos privados y las credenciales.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Preguntar antes: añadir dependencias nuevas.
- ⚠️ Preguntar antes: crear funcionalidades que no estén definidas en la spec.
- ⚠️ Preguntar antes: modificar el formato o estructura de los datos.
- ⚠️ Preguntar antes: realizar cambios que afecten a funcionalidades existentes fuera del alcance de la tarea.
- 🚫 Nunca: implementar una funcionalidad que no esté definida en una spec aprobada.
- 🚫 Nunca: exponer credenciales, secretos o datos privados.
- 🚫 Nunca: acceder directamente a la base de datos desde el frontend.

## Verificación

- Las pruebas son una puerta de paso: no avanzar si las pruebas requeridas fallan.
- Cada requisito funcional de una spec debe poder verificarse mediante las pruebas o comprobaciones definidas para esa funcionalidad.
- Las funcionalidades de interfaz que no puedan verificarse mediante tests automáticos deberán comprobarse según el procedimiento definido en el plan.
- Antes de dar una tarea por terminada, comprobar que los cambios cumplen la spec activa.
- Comprobar que los cambios no introducen errores en funcionalidades existentes.

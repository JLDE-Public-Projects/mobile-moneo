# Moneo — instrucciones del proyecto

## Versión mostrada en el pie de página

`src/config/appVersion.ts` define `APP_VERSION`, que se muestra en `AppFooter`
junto a la firma del autor (formato `v1.21.42`). No es semver real ni tiene
relación con `version` de `app.json`/`package.json` (esa la administra EAS
Build por separado, no la toques para esto).

Formato `MAJOR.MINOR.PATCH`:

- **MAJOR**: fijo en `1`. Solo se sube a mano ante un cambio grande de verdad.
- **MINOR**: cantidad de commits `feat(...)` en main (aproxima el número de
  funcionalidades agregadas). Recalcular con:

  ```bash
  git log --oneline | grep -c '^[a-f0-9]* feat'
  ```

- **PATCH**: total de commits en main. Recalcular con:

  ```bash
  git rev-list --count HEAD
  ```

Cuándo actualizarla: no hace falta en cada commit. Cuando el usuario pida
subir la versión del footer (o al cerrar una tanda de cambios notable), correr
ambos comandos de arriba y actualizar `APP_VERSION` en
`src/config/appVersion.ts` con los valores resultantes.

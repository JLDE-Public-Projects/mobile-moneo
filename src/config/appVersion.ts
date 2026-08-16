/**
 * Versión mostrada en el pie de página de la app (junto a la firma del autor).
 *
 * Es solo para mostrar al usuario qué tan avanzado va el desarrollo (útil al
 * reportar un bug); no participa en el build de EAS ni en el número que suben
 * las tiendas (ese vive aparte, en `version` de app.json/package.json, y lo
 * administra EAS con `appVersionSource: "remote"`).
 *
 * Formato MAJOR.MINOR.PATCH, pero MINOR y PATCH no son semver real: se
 * calculan desde el historial de git.
 * - MAJOR: fijo en 1 (súbelo a mano en un cambio grande de verdad).
 * - MINOR: cantidad de commits `feat(...)`, como aproximación al número de
 *   funcionalidades agregadas. Recalcular con:
 *     git log --oneline | grep -c '^[a-f0-9]* feat'
 * - PATCH: total de commits en main. Recalcular con:
 *     git rev-list --count HEAD
 *
 * Subí este número a mano de vez en cuando (no hace falta en cada commit);
 * los comandos de arriba te dan los valores exactos al momento de hacerlo.
 */
export const APP_VERSION = '1.21.42';

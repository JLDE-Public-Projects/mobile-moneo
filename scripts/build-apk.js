#!/usr/bin/env node
/**
 * Compila el APK de Android y lo deja listo para compartir.
 *
 * Corre `./gradlew assembleRelease` (o `assembleDebug` con --debug), y copia
 * el .apk resultante a `apk/` en la raíz del proyecto —carpeta visible, en
 * vez de enterrado en `android/app/build/outputs/apk/...`— con un nombre que
 * incluye el nombre de la app y la versión: `Moneo-v1.21.42.apk`.
 *
 * La versión sale de `src/config/appVersion.ts` (la misma que se muestra en
 * el pie de página de la app), y el nombre de `app.json`.
 *
 * Uso:
 *   npm run build:apk          # release
 *   npm run build:apk -- --debug
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const isDebug = process.argv.includes('--debug');
const variant = isDebug ? 'debug' : 'release';
const gradleTask = isDebug ? 'assembleDebug' : 'assembleRelease';

function readAppName() {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  return appJson.expo?.name ?? 'app';
}

function readAppVersion() {
  const source = fs.readFileSync(path.join(ROOT, 'src/config/appVersion.ts'), 'utf8');
  const match = source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('No se pudo leer APP_VERSION desde src/config/appVersion.ts');
  }
  return match[1];
}

function findApk(variantDir) {
  const outputsDir = path.join(ROOT, 'android/app/build/outputs/apk', variantDir);
  const apkFile = fs
    .readdirSync(outputsDir)
    .find((file) => file.endsWith('.apk'));
  if (!apkFile) {
    throw new Error(`No se encontró ningún .apk en ${outputsDir}`);
  }
  return path.join(outputsDir, apkFile);
}

function main() {
  const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  console.log(`\n▶ Compilando ${gradleTask}...\n`);
  execFileSync(gradlewCmd, [gradleTask], {
    cwd: path.join(ROOT, 'android'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  const appName = readAppName();
  const appVersion = readAppVersion();
  const sourceApk = findApk(variant);

  const destDir = path.join(ROOT, 'apk');
  fs.mkdirSync(destDir, { recursive: true });

  const suffix = isDebug ? '-debug' : '';
  const destName = `${appName}-v${appVersion}${suffix}.apk`;
  const destPath = path.join(destDir, destName);
  fs.copyFileSync(sourceApk, destPath);

  console.log(`\n✔ APK copiado a apk/${destName}\n`);
}

main();

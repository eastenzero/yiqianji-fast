import { existsSync, mkdirSync, copyFileSync, renameSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || 'C:\\Android\\android-sdk';
const jdkCandidates = [
  process.env.JAVA_HOME,
  'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.9.10-hotspot',
  'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.17.10-hotspot',
].filter(Boolean);
const javaHome = jdkCandidates.find((dir) => existsSync(join(dir, 'bin', process.platform === 'win32' ? 'jlink.exe' : 'jlink')));

if (!javaHome) {
  throw new Error('JDK 21 not found. Install Temurin 21 and set JAVA_HOME.');
}
if (!existsSync(join(sdkDir, 'platforms', 'android-36', 'android.jar'))) {
  throw new Error(`Android SDK android-36 not found at ${sdkDir}.`);
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: sdkDir,
  ANDROID_SDK_ROOT: sdkDir,
  PATH: [
    join(javaHome, 'bin'),
    join(sdkDir, 'platform-tools'),
    join(sdkDir, 'build-tools', '36.0.0'),
    process.env.PATH || '',
  ].join(process.platform === 'win32' ? ';' : ':'),
};

const targetDir = join(root, 'public', 'downloads');
const target = join(targetDir, 'yiqianji-android.apk');
const backup = join(targetDir, `.yiqianji-android-${Date.now()}.apk.bak`);
let movedExistingApk = false;

try {
  if (existsSync(target)) {
    renameSync(target, backup);
    movedExistingApk = true;
  }
  run('npm run android:sync', root, env);
  if (movedExistingApk) {
    renameSync(backup, target);
    movedExistingApk = false;
  }
  run(process.platform === 'win32' ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug', join(root, 'android'), env);
} finally {
  if (movedExistingApk && existsSync(backup)) {
    renameSync(backup, target);
  }
}

const source = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
const distDir = join(root, 'dist', 'downloads');
if (existsSync(join(root, 'dist'))) {
  mkdirSync(distDir, { recursive: true });
  copyFileSync(source, join(distDir, 'yiqianji-android.apk'));
}

const sizeMb = statSync(target).size / 1024 / 1024;
console.log(`APK copied to ${target}`);
console.log(`Download path: /downloads/yiqianji-android.apk (${sizeMb.toFixed(1)} MB)`);

function run(command, cwd, env) {
  const result = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command], {
      cwd,
      env,
      stdio: 'inherit',
    })
    : spawnSync(command, {
      cwd,
      env,
      stdio: 'inherit',
    });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}: ${result.error?.message || ''}`);
  }
}

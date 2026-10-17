import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function findPgDump(): Promise<string | null> {
  // Check in PATH
  try {
    const cmd = process.platform === 'win32' ? 'where pg_dump' : 'which pg_dump';
    const { stdout } = await execAsync(cmd);
    const firstLine = stdout.trim().split('\n')[0]?.trim();
    if (firstLine && fs.existsSync(firstLine)) return firstLine;
  } catch {}

  // Check common OSPanel PostgreSQL paths on Windows
  if (process.platform === 'win32') {
    const ospanelCommon = [
      'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
      'C:\\OSPanel\\modules\\database\\PostgreSQL-17\\bin\\pg_dump.exe',
      'C:\\OSPanel\\modules\\database\\PostgreSQL-16\\bin\\pg_dump.exe',
      'C:\\OSPanel\\modules\\database\\PostgreSQL-15\\bin\\pg_dump.exe',
      'C:\\OSPanel\\modules\\database\\PostgreSQL-14\\bin\\pg_dump.exe',
    ];
    for (const p of ospanelCommon) {
      if (fs.existsSync(p)) return p;
    }
  }

  return null;
}

async function isDockerContainerRunning(containerName: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
    return stdout.trim().includes(containerName);
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n📦 [CardHub] Запуск резервного копирования базы данных...');

  const dbUrlStr = process.env.DATABASE_URL;
  if (!dbUrlStr) {
    console.error('❌ Ошибка: В .env отсутствует переменная DATABASE_URL');
    process.exit(1);
  }

  // Parse DATABASE_URL
  const parsed = new URL(dbUrlStr);
  const user = decodeURIComponent(parsed.username || 'postgres');
  const password = decodeURIComponent(parsed.password || '');
  const host = parsed.hostname || 'localhost';
  const port = parsed.port || '5432';
  const dbName = parsed.pathname.replace(/^\//, '').split('?')[0] || 'cardhub';

  const backupDir = path.resolve(process.cwd(), 'backups', 'postgres');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `cardhub_backup_${timestamp}.sql.gz`;
  const backupFilePath = path.join(backupDir, backupFileName);
  const checksumFilePath = `${backupFilePath}.sha256`;

  const dockerRunning = await isDockerContainerRunning('cardhub-db');
  const localPgDump = await findPgDump();

  console.log(`ℹ️ База данных: ${dbName} (${host}:${port}, пользователь: ${user})`);
  console.log(`ℹ️ Папка сохранения: ${backupDir}`);

  if (dockerRunning) {
    console.log('🐳 Обнаружен активный Docker-контейнер "cardhub-db", запуск дампа через контейнер...');
  } else if (localPgDump) {
    console.log(`💻 Найдена утилита pg_dump: ${localPgDump}`);
  } else {
    console.warn('⚠️ Локальная утилита pg_dump не найдена в PATH, проверяем системный вызов...');
  }

  // Stream pg_dump through gzip and sha256 to destination file
  const gzip = zlib.createGzip({ level: 9 });
  const hash = crypto.createHash('sha256');
  const outputStream = fs.createWriteStream(backupFilePath);

  await new Promise<void>((resolve, reject) => {
    let proc: ReturnType<typeof spawn>;

    if (dockerRunning) {
      proc = spawn('docker', ['exec', 'cardhub-db', 'pg_dump', '-U', user, dbName]);
    } else {
      const dumpCmd = localPgDump || 'pg_dump';
      const env = { ...process.env };
      if (password) env.PGPASSWORD = password;

      proc = spawn(dumpCmd, ['-h', host, '-p', port, '-U', user, '-d', dbName], {
        env,
      });
    }

    let stderr = '';
    if (proc.stderr) {
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    if (!proc.stdout) {
      reject(new Error('Не удалось получить поток вывода pg_dump'));
      return;
    }

    proc.stdout.pipe(gzip);

    gzip.on('data', (chunk) => {
      hash.update(chunk);
    });

    gzip.pipe(outputStream);

    outputStream.on('finish', () => {
      if (proc.exitCode !== 0 && proc.exitCode !== null) {
        reject(new Error(`pg_dump завершился с кодом ${proc.exitCode}: ${stderr}`));
      } else {
        resolve();
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  }).catch((err) => {
    // Cleanup failed file
    if (fs.existsSync(backupFilePath)) {
      try { fs.unlinkSync(backupFilePath); } catch {}
    }
    console.error('❌ Ошибка выполнения дампа:', err.message);
    process.exit(1);
  });

  const stats = fs.statSync(backupFilePath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  const checksum = hash.digest('hex');

  // Write sha256 checksum file
  fs.writeFileSync(checksumFilePath, `${checksum} *${backupFileName}\n`, 'utf-8');

  console.log(`✅ Дамп успешно создан: ${backupFileName}`);
  console.log(`📊 Размер архива: ${sizeMb} MB (${stats.size.toLocaleString('ru-RU')} байт)`);
  console.log(`🔒 Контрольная сумма SHA-256: ${checksum}`);

  // Retention: clean up backups older than 7 days
  console.log('🧹 Проверка ротации архивов (хранение 7 дней)...');
  const retentionMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let deletedCount = 0;

  const existingFiles = fs.readdirSync(backupDir);
  for (const file of existingFiles) {
    if (file.startsWith('cardhub_backup_')) {
      const filePath = path.join(backupDir, file);
      try {
        const fileStat = fs.statSync(filePath);
        if (now - fileStat.mtimeMs > retentionMs) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch {}
    }
  }

  console.log(`♻️ Удалено устаревших резервных копий: ${deletedCount}`);
  console.log('🎉 Резервное копирование завершено успешно!\n');
}

main().catch((err) => {
  console.error('Непредвиденная ошибка:', err);
  process.exit(1);
});

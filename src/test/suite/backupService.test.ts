import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { BackupManager } from '../../service/backupService';

suite('BackupManager Tests', () => {
  const backupDir = path.join(__dirname, 'testBackups');

  teardown(() => {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
  });

  test('backup writes a timestamped file with the given content', () => {
    const manager = new BackupManager(backupDir, 'global');

    const backupFile = manager.backup('{"id":1}', 'import');

    assert.ok(backupFile, 'backup should return the written path');
    assert.ok(fs.existsSync(backupFile!));
    assert.strictEqual(fs.readFileSync(backupFile!, 'utf8'), '{"id":1}');
    assert.ok(path.basename(backupFile!).startsWith('global-'));
    assert.ok(backupFile!.endsWith('-import.json'));
  });

  test('backup prunes oldest files beyond the retention limit', () => {
    const manager = new BackupManager(backupDir, 'global', 3);

    const written: string[] = [];
    for (let i = 0; i < 5; i++) {
      // distinct reasons keep the file names unique even within the same millisecond
      written.push(manager.backup(`{"i":${i}}`, `r${i}`)!);
    }

    const remaining = fs.readdirSync(backupDir).sort();
    assert.strictEqual(remaining.length, 3, 'only the retention limit may remain');
    // the survivors must be the most recent ones
    assert.deepStrictEqual(remaining, written.slice(-3).map(f => path.basename(f)).sort());
  });

  test('prefixes are isolated: pruning one prefix leaves the other untouched', () => {
    const globalManager = new BackupManager(backupDir, 'global', 2);
    const wsManager = new BackupManager(backupDir, 'ws', 2);

    for (let i = 0; i < 3; i++) {
      globalManager.backup('{}', `g${i}`);
    }
    wsManager.backup('{}', 'w0');

    const files = fs.readdirSync(backupDir);
    assert.strictEqual(files.filter(f => f.startsWith('global-')).length, 2);
    assert.strictEqual(files.filter(f => f.startsWith('ws-')).length, 1);
  });

  test('latestBackupTime reflects the most recent backup and is undefined when empty', () => {
    const manager = new BackupManager(backupDir, 'global');

    assert.strictEqual(manager.latestBackupTime(), undefined);

    const before = Date.now();
    manager.backup('{}', 'daily');
    const latest = manager.latestBackupTime();

    assert.ok(latest !== undefined);
    // allow a little clock slack around the write
    assert.ok(latest! >= before - 5000 && latest! <= Date.now() + 5000);
  });

  test('backup failure is swallowed and returns undefined', () => {
    // a file path in place of the backup directory makes mkdir fail
    const blockingFile = path.join(__dirname, 'blocking-file');
    fs.writeFileSync(blockingFile, 'x');
    try {
      const manager = new BackupManager(path.join(blockingFile, 'nested'), 'global');
      assert.strictEqual(manager.backup('{}', 'import'), undefined);
    } finally {
      fs.unlinkSync(blockingFile);
    }
  });
});

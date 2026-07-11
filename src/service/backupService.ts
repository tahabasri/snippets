import fs = require('fs');
import * as path from 'path';
import { LoggingUtility } from '../utility/loggingUtility';

/**
 * Rolling, timestamped JSON backups of the whole snippets tree, written before
 * destructive operations (import, troubleshoot, folder deletion) and at most once
 * a day on activation. Backups are best-effort: a failed backup is logged but never
 * blocks the operation itself.
 */
export class BackupManager {
    constructor(private _backupDir: string, private _prefix: string, private _maxBackups = 10) { }

    get backupDir(): string {
        return this._backupDir;
    }

    /**
     * @param content serialized snippets tree (JSON string)
     * @param reason short slug embedded in the file name (e.g. 'import', 'delete-folder')
     * @returns path of the written backup, or undefined if backing up failed
     */
    backup(content: string, reason: string): string | undefined {
        try {
            fs.mkdirSync(this._backupDir, { recursive: true });
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this._backupDir, `${this._prefix}-${stamp}-${reason}.json`);
            fs.writeFileSync(backupFile, content);
            this.prune();
            LoggingUtility.getInstance().info(`Snippets backup written (${backupFile})`);
            return backupFile;
        } catch (error) {
            LoggingUtility.getInstance().error(`Snippets backup failed: ${error}`);
            return undefined;
        }
    }

    /** mtime (ms epoch) of the most recent backup, or undefined when none exists */
    latestBackupTime(): number | undefined {
        const backups = this.listBackups();
        if (backups.length === 0) {
            return undefined;
        }
        return Math.max(...backups.map(f => fs.statSync(path.join(this._backupDir, f)).mtimeMs));
    }

    private listBackups(): string[] {
        if (!fs.existsSync(this._backupDir)) {
            return [];
        }
        return fs.readdirSync(this._backupDir)
            .filter(f => f.startsWith(`${this._prefix}-`) && f.endsWith('.json'));
    }

    private prune(): void {
        // ISO timestamps in the names make lexicographic order chronological
        const backups = this.listBackups().sort();
        for (const excess of backups.slice(0, Math.max(0, backups.length - this._maxBackups))) {
            fs.unlinkSync(path.join(this._backupDir, excess));
        }
    }
}

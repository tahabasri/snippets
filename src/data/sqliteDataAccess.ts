import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export class SqliteDataAccess {
    async getSnippetsFromSQLiteDb(filePath: string, extension: string): Promise<string | undefined> {
        let db;
        try {
            db = await open({
                filename: filePath.replace(extension, 'state.vscdb'),
                driver: sqlite3.Database
            });
            const data = await db.get('SELECT * FROM ItemTable WHERE key = ?', extension);
            return data?.value;
        } catch (error) {
            return undefined;
        } finally {
            if (db) {
                db.close();
            }
        }
      }
}
/**
 * @author xql.dev
 * @description init your database
 * @version 9.7.2
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 * @error "https://github.com/kirobotdev/stash/issues/8"
 */
import DatabaseSync from 'better-sqlite3';
import { join } from 'path';
import * as fs from 'fs';

const dataDir = join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export interface RPCConfig {
    rpctitle?: string;
    rpcdetails?: string;
    rpcstate?: string;
    appid?: string;
    rpcminparty?: number;
    rpcmaxparty?: number;
    rpctime?: number | null;
    rpclargeimage?: string;
    rpclargeimagetext?: string;
    rpcsmallimage?: string;
    rpcsmallimagetext?: string;
    buttontext1?: string;
    buttonlink1?: string;
    buttontext2?: string;
    buttonlink2?: string;
    rpctype?: string;
    rpcplatform?: string;
    rpconoff?: boolean;
    twitch?: string;
}

export interface SpotifyConfig {
    spotifyonoff?: boolean;
    spotifysongname?: string;
    spotifyartists?: string;
    spotifyalbum?: string;
    spotifylargeimage?: string;
    spotifysmallimage?: string;
    spotifysongid?: string;
    spotifyalbumid?: string;
    spotifyartistids?: string[];
    spotifyendtimestamp?: number | null;
}

export interface DBConfig extends RPCConfig, SpotifyConfig {
    language: 'fr' | 'en';
    platform?: string;
    captchaKey?: string;
}

const defaultSettings = {
    language: 'fr',
    rpctitle: '',
    rpcdetails: '',
    rpcstate: '',
    appid: '',
    rpcminparty: 0,
    rpcmaxparty: 0,
    rpctime: null,
    rpclargeimage: '',
    rpclargeimagetext: '',
    rpcsmallimage: '',
    rpcsmallimagetext: '',
    buttontext1: '',
    buttonlink1: '',
    buttontext2: '',
    buttonlink2: '',
    rpctype: '',
    rpcplatform: '',
    twitch: '',
    spotifyonoff: false,
    rpconoff: false,
    spotifysongname: '',
    spotifyartists: '',
    spotifyalbum: '',
    spotifylargeimage: '',
    spotifysmallimage: '',
    spotifysongid: '',
    spotifyalbumid: '',
    spotifyartistids: [],
    spotifyendtimestamp: null,
    platform: 'desktop',
    captchaKey: ''
};

export class Database {
    private static db: any;
    private static _cache: DBConfig = {} as DBConfig;

    static load(dbName: string = 'database') {
        const dbPath = join(process.cwd(), `${dbName}.sqlite`);
        this.db = new DatabaseSync(dbPath);
        
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);
        
        this.reload();
    }

    private static reload() {
        const rows = this.db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
        const config: any = { ...defaultSettings };
        
        for (const row of rows) {
            try {
                config[row.key] = JSON.parse(row.value);
            } catch {
                config[row.key] = row.value;
            }
        }
        
        this._cache = config;
    }

    static get config() {
        return this._cache;
    }

    static save() {
        const upsert = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        const transaction = this.db.transaction((data: any) => {
            for (const key in data) {
                const val = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
                upsert.run(key, val);
            }
        });
        transaction(this._cache);
    }

    static set(key: keyof DBConfig, value: any) {
        (this._cache as any)[key] = value;
        const upsert = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
        upsert.run(key, val);
    }
}


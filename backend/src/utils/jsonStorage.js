import fs from 'fs';
import path from 'path';

const STORAGE_PATH = path.resolve(process.cwd(), 'storage');

/**
 * Adaptador de persistencia JSON para fallback de base de datos
 */
class JsonStorage {
    constructor(entity) {
        this.filePath = path.join(STORAGE_PATH, `${entity}.json`);
        this.init();
    }

    init() {
        if (!fs.existsSync(STORAGE_PATH)) {
            fs.mkdirSync(STORAGE_PATH, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
        }
    }

    async getAll() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error leyendo ${this.filePath}:`, error);
            return [];
        }
    }

    async save(data) {
        try {
            const tmpPath = this.filePath + '.tmp';
            fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
            fs.renameSync(tmpPath, this.filePath);
            return true;
        } catch (error) {
            console.error(`Error guardando en ${this.filePath}:`, error);
            return false;
        }
    }

    async insert(item) {
        const data = await this.getAll();
        const newItem = {
            id: item.id || Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            ...item,
        };
        data.push(newItem);
        await this.save(data);
        return newItem;
    }

    /**
     * Inserción masiva: UNA lectura + UNA escritura.
     * Skips students whose id already exists.
     */
    async bulkInsert(items, dedupeKey = 'id') {
        const existing = await this.getAll();
        const existingKeys = new Set(existing.map(e => String(e[dedupeKey])));

        const toInsert = [];
        let skipped = 0;

        for (const item of items) {
            const key = String(item[dedupeKey] || '');
            if (key && existingKeys.has(key)) {
                skipped++;
                continue;
            }
            const newItem = {
                id: item.id || Math.random().toString(36).substr(2, 9),
                created_at: item.created_at || new Date().toISOString(),
                ...item,
                active: item.active !== undefined ? item.active : true,
            };
            toInsert.push(newItem);
            if (key) existingKeys.add(key);
        }

        if (toInsert.length > 0) {
            await this.save([...existing, ...toInsert]);
        }

        return { inserted: toInsert, skipped };
    }

    /**
     * Upsert masivo: inserta si no existe, actualiza si ya existe.
     * UNA lectura + UNA escritura para todos los items.
     */
    async bulkUpsert(items, dedupeKey = 'id') {
        const existing = await this.getAll();
        const indexMap = new Map(existing.map((e, i) => [String(e[dedupeKey]), i]));

        const inserted = [];
        const updated = [];

        for (const item of items) {
            const key = String(item[dedupeKey] || '');
            if (key && indexMap.has(key)) {
                const idx = indexMap.get(key);
                existing[idx] = { ...existing[idx], ...item, updated_at: new Date().toISOString() };
                updated.push(existing[idx]);
            } else {
                const newItem = {
                    id: item.id || Math.random().toString(36).substr(2, 9),
                    created_at: new Date().toISOString(),
                    ...item,
                    active: item.active !== undefined ? item.active : true,
                };
                existing.push(newItem);
                inserted.push(newItem);
                if (key) indexMap.set(key, existing.length - 1);
            }
        }

        await this.save(existing);
        return { inserted, updated };
    }

    /**
     * Borra TODOS los registros de la colección.
     */
    async deleteAll() {
        await this.save([]);
    }

    async update(id, updates) {
        const data = await this.getAll();
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
            await this.save(data);
            return data[index];
        }
        return null;
    }

    async find(predicate) {
        const data = await this.getAll();
        return data.filter(predicate);
    }
}

export const scanStorage = new JsonStorage('scans');
export const studentStorage = new JsonStorage('students');
export const routeStorage = new JsonStorage('routes');
export const settingStorage = new JsonStorage('settings');

import { SqliteDatabase } from './infrastructure/db/SqliteDatabase.js';
import { SqliteProductRepository } from './infrastructure/repositories/SqliteProductRepository.js';
import { SqliteSyncQueueRepository } from './infrastructure/repositories/SqliteSyncQueueRepository.js';
import { SqliteCloudConfigRepository } from './infrastructure/repositories/SqliteCloudConfigRepository.js';
import { AddProductUseCase } from './application/usecases/AddProductUseCase.js';
import { SyncQueueUseCase } from './application/usecases/SyncQueueUseCase.js';
import { ZaicoSyncUploader } from './infrastructure/services/SyncUploader.js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    }
}

async function runDeepTest() {
    loadEnv();
    const token = process.env.ZAICO_API_TOKEN;
    if (!token) { console.error('Token missing'); return; }

    console.log('--- Deep Debug Sync Test ---');
    const db = SqliteDatabase.getInstance();
    
    // Clean start (Fix SQL string quoting)
    db.prepare('DELETE FROM sync_queue').run();
    db.prepare("DELETE FROM products WHERE sku LIKE 'DEBUG-TEST-%'").run();

    const productRepo = new SqliteProductRepository(db);
    const syncRepo = new SqliteSyncQueueRepository(db);
    const configRepo = new SqliteCloudConfigRepository(db);
    
    // Intercept Uploader to log request/response
    const realUploader = new ZaicoSyncUploader();
    const debugUploader = {
        upload: async (item: any, token: string) => {
            const payload = JSON.parse(item.payload);
            console.log(`\n[DEBUG] === API REQUEST ===`);
            console.log(`[DEBUG] Operation: ${item.operationType}`);
            console.log(`[DEBUG] Payload:`, JSON.stringify(payload, null, 2));
            try {
                const res = await realUploader.upload(item, token);
                console.log(`\n[DEBUG] === API RESPONSE ===`);
                console.log(`[DEBUG] Status: SUCCESS`);
                console.log(`[DEBUG] Response Body:`, JSON.stringify(res, null, 2));
                return res;
            } catch (e: any) {
                console.log(`\n[DEBUG] === API RESPONSE ===`);
                console.error(`[DEBUG] Status: FAILED`);
                console.error(`[DEBUG] Error:`, e.message);
                throw e;
            }
        }
    };

    await configRepo.updateConfig({ isEnabled: true, apiToken: token });

    const sku = 'DEBUG-TEST-' + Math.floor(Math.random() * 1000000);
    const addUseCase = new AddProductUseCase(productRepo, syncRepo, configRepo);
    await addUseCase.execute({
        sku,
        name: 'Deep Debug Item',
        price: 500,
        stock: 50,
        unit: '個',
        minStock: 0,
        metadata: { category: 'Debug', location: 'Lab' }
    });

    console.log(`Local product added. Starting sync...`);
    const syncQueueUseCase = new SyncQueueUseCase(syncRepo, configRepo, productRepo, debugUploader as any);
    await syncQueueUseCase.processAll();

    const finalProduct = await productRepo.findBySku(sku);
    console.log(`\n[RESULT] Final Local Metadata:`, JSON.stringify(finalProduct?.metadata, null, 2));
    
    if (finalProduct?.metadata?.zaicoId) {
        console.log('--- Overall SUCCESS: zaicoId captured ---');
    } else {
        console.error('--- Overall FAILURE: zaicoId NOT captured ---');
    }
}

runDeepTest().catch(console.error);

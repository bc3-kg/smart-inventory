import { SqliteDatabase } from './infrastructure/db/SqliteDatabase.js';
import { SqliteProductRepository } from './infrastructure/repositories/SqliteProductRepository.js';
import { SqliteSyncQueueRepository } from './infrastructure/repositories/SqliteSyncQueueRepository.js';
import { SqliteCloudConfigRepository } from './infrastructure/repositories/SqliteCloudConfigRepository.js';
import { AddProductUseCase } from './application/usecases/AddProductUseCase.js';
import { UpdateStockUseCase } from './application/usecases/UpdateStockUseCase.js';
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

async function runFullFlowDebug() {
    loadEnv();
    const token = process.env.ZAICO_API_TOKEN;
    if (!token) { console.error('Token missing'); return; }

    console.log('--- Full Flow Debug Sync Test ---');
    const db = SqliteDatabase.getInstance();
    
    // Clean start
    db.prepare('DELETE FROM sync_queue').run();
    db.prepare("DELETE FROM products WHERE sku LIKE 'DEBUG-FLOW-%'").run();

    const productRepo = new SqliteProductRepository(db);
    const syncRepo = new SqliteSyncQueueRepository(db);
    const configRepo = new SqliteCloudConfigRepository(db);
    
    // Debug Uploader
    const realUploader = new ZaicoSyncUploader();
    const debugUploader = {
        upload: async (item: any, token: string) => {
            const payload = JSON.parse(item.payload);
            console.log(`\n[DEBUG] === API REQUEST (${item.operationType}) ===`);
            console.log(`[DEBUG] Payload:`, JSON.stringify(payload, null, 2));
            try {
                const res = await realUploader.upload(item, token);
                console.log(`[DEBUG] === API SUCCESS RESPONSE ===`);
                console.log(`[DEBUG] Body:`, JSON.stringify(res, null, 2));
                return res;
            } catch (e: any) {
                console.log(`[DEBUG] === API FAILURE RESPONSE ===`);
                console.error(`[DEBUG] Error:`, e.message);
                throw e;
            }
        }
    };

    await configRepo.updateConfig({ isEnabled: true, apiToken: token });

    // Step 1: Create Product (Will queue CREATE_PRODUCT)
    const sku = 'DEBUG-FLOW-' + Math.floor(Math.random() * 100000);
    const addUseCase = new AddProductUseCase(productRepo, syncRepo, configRepo);
    const product = await addUseCase.execute({
        sku,
        name: 'Flow Test Product',
        price: 100,
        stock: 10,
        unit: '個',
        minStock: 0,
        metadata: { category: 'Flow', location: 'Lab' }
    });
    console.log(`\n[STEP 1] Local product created. ID: ${product.id}`);

    // Step 2: Update Stock immediately (Will queue STOCK_IN with EMPTY inventory_id)
    const updateUseCase = new UpdateStockUseCase(productRepo, syncRepo, configRepo);
    await updateUseCase.execute({
        productId: product.id,
        statusId: 'IN', // Assuming 'IN' exists from previous seed
        quantity: 5,
        unitPrice: 100,
        reason: 'Flow stock addition'
    });
    console.log(`[STEP 2] Local stock update queued (Before sync, so no zaicoId yet).`);

    // Step 3: Process Queue
    // This should:
    // 1. Send CREATE_PRODUCT
    // 2. Update local DB with zaicoId
    // 3. Patch STOCK_IN with the NEW zaicoId before sending
    console.log(`\n[STEP 3] Starting Sync Processing...`);
    const syncQueueUseCase = new SyncQueueUseCase(syncRepo, configRepo, productRepo, debugUploader as any);
    await syncQueueUseCase.processAll();

    const finalProduct = await productRepo.findBySku(sku);
    console.log(`\n[FINAL RESULT] Local zaicoId: ${finalProduct?.metadata?.zaicoId}`);
    
    if (finalProduct?.metadata?.zaicoId) {
        console.log('--- FLOW VERIFIED SUCCESS ---');
    } else {
        console.error('--- FLOW VERIFIED FAILURE ---');
    }
}

runFullFlowDebug().catch(console.error);

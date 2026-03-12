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

// Manual .env parsing
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

async function runProductionTest() {
    loadEnv();
    const token = process.env.ZAICO_API_TOKEN;
    if (!token) {
        console.error('Error: ZAICO_API_TOKEN is not defined in .env');
        process.exit(1);
    }

    console.log('--- Start Production Sync Test (Real API Call) ---');
    console.log('Token check:', token.substring(0, 4) + '...');
    
    const db = SqliteDatabase.getInstance();
    const productRepo = new SqliteProductRepository(db);
    const syncRepo = new SqliteSyncQueueRepository(db);
    const configRepo = new SqliteCloudConfigRepository(db);
    const uploader = new ZaicoSyncUploader();

    // Reset sync queue for fresh test
    db.prepare('DELETE FROM sync_queue').run();

    // 1. Enable Cloud Sync
    await configRepo.updateConfig({
        isEnabled: true,
        apiToken: token
    });

    // 2. Add product (Queues CREATE_PRODUCT)
    const addUseCase = new AddProductUseCase(productRepo, syncRepo, configRepo);
    const sku = 'PROD-TEST-' + Math.floor(Math.random() * 1000000);
    const productData = {
        sku,
        name: 'Production Sync Test Item',
        price: 1000,
        stock: 10,
        unit: 'pcs',
        minStock: 1,
        metadata: {
            category: 'Testing',
            location: 'Remote'
        }
    };
    
    await addUseCase.execute(productData);
    console.log(`Step 1: Locally added product SKU: ${sku}`);

    // 3. Process first queue (Product Creation)
    console.log('Step 2: Sending CREATE_PRODUCT to Zaico...');
    const syncQueueUseCase = new SyncQueueUseCase(syncRepo, configRepo, productRepo, uploader);
    await syncQueueUseCase.processAll();

    // 4. Verify zaicoId
    const updatedProduct = await productRepo.findBySku(sku);
    const zaicoId = updatedProduct?.metadata?.zaicoId;

    if (zaicoId) {
        console.log(`SUCCESS: Created on Zaico. ID: ${zaicoId}`);

        // 5. Test Stock Update
        console.log('Step 3: Queuing Stock Update (IN 5)...');
        const updateUseCase = new UpdateStockUseCase(productRepo, syncRepo, configRepo);
        await updateUseCase.execute({
            productId: updatedProduct.id,
            statusId: 'IN',
            quantity: 5,
            unitPrice: 1000,
            reason: 'Production Sync Test Update'
        });

        console.log('Step 4: Sending STOCK_IN to Zaico...');
        await syncQueueUseCase.processAll();
        console.log('SUCCESS: Stock updated on Zaico.');
    } else {
        const failedItems = await syncRepo.getFailedItems();
        if (failedItems.length > 0) {
            console.error('FAILURE: Sync failed with error:', failedItems[0].errorMessage);
        } else {
            // Check status of items
            const count = db.prepare('SELECT COUNT(*) as c FROM sync_queue').get() as any;
            const statuses = db.prepare('SELECT status, operationType FROM sync_queue').all() as any[];
            console.error(`Sync items count: ${count.c}`);
            console.log('Queue Statuses:', JSON.stringify(statuses));
            console.error('FAILURE: Sync executed but no Zaico ID was saved. Please check if the API actually succeeded.');
        }
    }

    console.log('--- Production Test Finished ---');
}

runProductionTest().catch(console.error);

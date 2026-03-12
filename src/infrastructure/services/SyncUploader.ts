/* file:///d:/smart-inventory/src/infrastructure/services/SyncUploader.ts */
import { SyncQueueItem } from '../../domain/entities/SyncQueue';

export interface ISyncUploader {
    upload(item: SyncQueueItem, apiToken: string): Promise<any>;
}

export class ZaicoSyncUploader implements ISyncUploader {
    private baseUrl = 'https://web.zaico.co.jp/api/v1';

    async upload(item: SyncQueueItem, apiToken: string): Promise<any> {
        const payload = JSON.parse(item.payload);
        let endpoint = '';
        let method = 'POST';

        switch (item.operationType) {
            case 'CREATE_PRODUCT':
                endpoint = '/inventories';
                method = 'POST';
                break;
            case 'UPDATE_PRODUCT':
                const zaicoId = (payload as any).zaico_id;
                if (!zaicoId) throw new Error('Missing zaico_id for UPDATE_PRODUCT');
                endpoint = `/inventories/${zaicoId}`;
                method = 'PUT';
                delete (payload as any).zaico_id;
                break;
            case 'STOCK_IN':
            case 'RETURN':
                endpoint = '/purchases';
                method = 'POST';
                break;
            case 'STOCK_OUT':
            case 'CANCEL':
                endpoint = '/packing_slips';
                method = 'POST';
                break;
            case 'STOCKTAKE':
                const sid = (payload as any).zaico_id;
                if (!sid) throw new Error('Missing zaico_id for STOCKTAKE');
                endpoint = `/inventories/${sid}`;
                method = 'PUT';
                delete (payload as any).zaico_id;
                break;
            default:
                throw new Error(`Unsupported operation: ${item.operationType}`);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Zaico API Error (${response.status}): ${errorText}`);
        }

        return await response.json();
    }
}

/* file:///d:/smart-inventory/src/infrastructure/repositories/InMemoryCloudConfigRepository.ts */
import { CloudConfig } from '../../domain/entities/CloudConfig';
import { ICloudConfigRepository } from '../../domain/repositories/ICloudConfigRepository';

export class InMemoryCloudConfigRepository implements ICloudConfigRepository {
    private config: CloudConfig = {
        isEnabled: false,
        apiToken: ''
    };

    constructor() {
        this.loadFromStorage();
    }

    private saveToStorage() {
        localStorage.setItem('inventory_cloud_config', JSON.stringify(this.config));
    }

    private loadFromStorage() {
        const stored = localStorage.getItem('inventory_cloud_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            this.config = {
                ...parsed,
                lastSyncedAt: parsed.lastSyncedAt ? new Date(parsed.lastSyncedAt) : undefined
            };
        }
    }

    async getConfig(): Promise<CloudConfig> {
        return { ...this.config };
    }

    async updateConfig(config: CloudConfig): Promise<void> {
        this.config = { ...config };
        this.saveToStorage();
    }
}

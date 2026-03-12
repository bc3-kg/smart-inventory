/* file:///d:/smart-inventory/src/domain/entities/CloudConfig.ts */

export interface CloudConfig {
    isEnabled: boolean;
    apiToken: string;
    lastSyncedAt?: Date;
}

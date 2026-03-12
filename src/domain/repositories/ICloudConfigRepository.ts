/* file:///d:/smart-inventory/src/domain/repositories/ICloudConfigRepository.ts */
import { CloudConfig } from '../entities/CloudConfig';

export interface ICloudConfigRepository {
    getConfig(): Promise<CloudConfig>;
    updateConfig(config: CloudConfig): Promise<void>;
}

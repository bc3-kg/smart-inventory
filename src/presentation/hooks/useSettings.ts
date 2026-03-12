/* file:///d:/smart-inventory/src/presentation/hooks/useSettings.ts */
import { useState, useEffect, useCallback } from 'react';
import { CloudConfig } from '../../domain/entities/CloudConfig';
import { InMemoryCloudConfigRepository } from '../../infrastructure/repositories/InMemoryCloudConfigRepository';

const cloudConfigRepo = new InMemoryCloudConfigRepository();

export const useSettings = () => {
    const [cloudConfig, setCloudConfig] = useState<CloudConfig>({ isEnabled: false, apiToken: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchConfig = useCallback(async () => {
        const config = await cloudConfigRepo.getConfig();
        setCloudConfig(config);
    }, []);

    const updateCloudConfig = async (newConfig: CloudConfig) => {
        setIsUpdating(true);
        try {
            await cloudConfigRepo.updateConfig(newConfig);
            setCloudConfig(newConfig);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return {
        cloudConfig,
        updateCloudConfig,
        isUpdating,
        refresh: fetchConfig
    };
};

/* file:///d:/workspace/inventory-app/src/presentation/components/QRScanner.tsx */
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface QRScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();

        const startScanner = async () => {
            try {
                const videoInputDevices = await codeReader.listVideoInputDevices();
                if (videoInputDevices.length === 0) {
                    throw new Error('No camera found');
                }

                // Select back camera if possible
                const deviceId = videoInputDevices.find(d => d.label.toLowerCase().includes('back'))?.deviceId || videoInputDevices[0].deviceId;

                codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
                    if (result) {
                        onScan(result.getText());
                    }
                    if (err && !(err.name === 'NotFoundException')) {
                        // Silence not found errors as it scans continuously
                    }
                });
            } catch (err: any) {
                setError(err.message || 'Camera error');
            }
        };

        startScanner();

        return () => {
            codeReader.reset();
        };
    }, [onScan]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden border-2 border-primary/30"
        >
            <video ref={videoRef} className="w-full h-full object-cover" />

            {/* Scanner Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary/50 rounded-2xl relative">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.8)] animate-scan" />
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
            >
                <X size={20} />
            </button>

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center">
                    <Camera size={48} className="text-text-dim mb-4" />
                    <p className="text-white font-bold">{error}</p>
                    <button onClick={onClose} className="mt-4 text-primary underline">Fechar</button>
                </div>
            )}
        </motion.div>
    );
};

export default QRScanner;

import React, { useRef, useEffect, useState } from 'react';
import { X, Camera as CameraIcon, Download } from 'lucide-react';

export function CameraOverlay({ isOpen, onClose, db, leq, peak, address, weighting }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        if (isOpen && !stream) {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error('Camera access error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw Watermark Overlay
        const padding = 40;
        const fontSize = Math.floor(canvas.width * 0.05);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, canvas.height - fontSize * 6, canvas.width, fontSize * 6);

        ctx.font = `bold ${fontSize * 1.5}px Inter, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${Math.round(db)} dB(${weighting})`, padding, canvas.height - fontSize * 3.5);

        ctx.font = `${fontSize * 0.8}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`Leq: ${Math.round(leq)} dB | Peak: ${Math.round(peak)} dB`, padding, canvas.height - fontSize * 2.2);
        ctx.fillText(`位置: ${address}`, padding, canvas.height - fontSize * 1.2);
        ctx.fillText(`時間: ${new Date().toLocaleString('zh-TW')} | Nor104 校正標記`, padding, canvas.height - fontSize * 0.4);

        setCapturedImage(canvas.toDataURL('image/jpeg'));
    };

    const download = () => {
        if (!capturedImage) return;
        const link = document.createElement('a');
        link.download = `Noise_Evidence_${Date.now()}.jpg`;
        link.href = capturedImage;
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <button onClick={onClose} className="text-white/70 hover:text-white transition">
                    <X size={32} />
                </button>
                <div className="bg-black/40 px-4 py-1 rounded-full border border-white/20">
                    <span className="text-noise-red font-bold text-lg animate-pulse">{Math.round(db)} dB</span>
                </div>
            </div>

            {/* Video Preview */}
            {!capturedImage ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
            ) : (
                <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="absolute bottom-10 w-full flex justify-center items-center gap-10 z-10">
                {!capturedImage ? (
                    <button
                        onClick={capture}
                        className="w-20 h-20 bg-white rounded-full border-4 border-white/30 flex items-center justify-center hover:scale-105 active:scale-95 transition"
                    >
                        <div className="w-16 h-16 bg-white rounded-full border-2 border-black" />
                    </button>
                ) : (
                    <div className="flex gap-10">
                        <button
                            onClick={() => setCapturedImage(null)}
                            className="bg-white/10 glass px-6 py-3 rounded-full text-white font-medium"
                        >
                            重拍
                        </button>
                        <button
                            onClick={download}
                            className="bg-blue-600 px-6 py-3 rounded-full text-white font-medium flex items-center gap-2"
                        >
                            <Download size={20} />
                            下載報告
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

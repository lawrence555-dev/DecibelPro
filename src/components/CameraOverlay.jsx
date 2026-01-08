import React, { useRef, useEffect, useState } from 'react';
import { X, Camera as CameraIcon, Download, RotateCcw } from 'lucide-react';

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
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
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

        // --- Draw Professional Watermark (Card Style) ---
        const w = canvas.width;
        const h = canvas.height;
        const scale = w / 1000; // Scale base on width

        ctx.save();

        // 1. Bottom Gradient Overlay (Subtle)
        const grad = ctx.createLinearGradient(0, h * 0.7, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, h * 0.7, w, h * 0.3);

        // 2. Info Card Container
        const cardW = w * 0.9;
        const cardH = 220 * scale;
        const cardX = (w - cardW) / 2;
        const cardY = h - cardH - (40 * scale);

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20 * scale;
        ctx.fillStyle = 'rgba(15, 15, 20, 0.85)';

        // Manual rounded rect (for broader compatibility)
        const r = 24 * scale;
        ctx.beginPath();
        ctx.moveTo(cardX + r, cardY);
        ctx.lineTo(cardX + cardW - r, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
        ctx.lineTo(cardX + cardW, cardY + cardH - r);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
        ctx.lineTo(cardX + r, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
        ctx.lineTo(cardX, cardY + r);
        ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
        ctx.closePath();
        ctx.fill();

        // 3. Border Glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        ctx.restore();

        // 4. Content - Main dB
        const color = db > 75 ? '#ff4d4d' : '#22c55e';
        ctx.fillStyle = color;
        ctx.font = `bold ${85 * scale}px Inter, sans-serif`;
        ctx.fillText(`${Math.round(db)}`, cardX + 40 * scale, cardY + 110 * scale);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `bold ${30 * scale}px Inter, sans-serif`;
        ctx.fillText(`dB(${weighting})`, cardX + 45 * scale + ctx.measureText(`${Math.round(db)}`).width, cardY + 105 * scale);

        // 5. Secondary Stats (Leq / Peak)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = `${24 * scale}px Inter, sans-serif`;
        ctx.fillText(`LEQ ${Math.round(leq)} dB`, cardX + 40 * scale, cardY + 155 * scale);
        ctx.fillText(`PEAK ${Math.round(peak)} dB`, cardX + 220 * scale, cardY + 155 * scale);

        // 6. Metadata (Address & Time)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = `${20 * scale}px Inter, sans-serif`;
        ctx.fillText(address, cardX + 40 * scale, cardY + 195 * scale);

        // 7. Branding & Calibration
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = `bold ${22 * scale}px Inter, sans-serif`;
        ctx.fillText("DECIBEL PRO ULTRA V2.1", cardX + cardW - 40 * scale, cardY + 50 * scale);

        ctx.font = `${18 * scale}px Inter, sans-serif`;
        ctx.fillText(new Date().toLocaleString('zh-TW'), cardX + cardW - 40 * scale, cardY + 155 * scale);
        ctx.fillText("NOR104 CALIBRATION MARK", cardX + cardW - 40 * scale, cardY + 195 * scale);

        setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
    };

    const download = () => {
        if (!capturedImage) return;
        const link = document.createElement('a');
        link.download = `DecibelPro_Evidence_${Date.now()}.jpg`;
        link.href = capturedImage;
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={onClose} className="p-2 glass rounded-full text-white/70 hover:text-white transition">
                    <X size={24} />
                </button>
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                    <span className={`${db > 75 ? 'text-red-400' : 'text-green-400'} font-bold text-lg`}>{Math.round(db)} dB</span>
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
            <div className="absolute bottom-10 w-full flex justify-center items-center gap-10 z-10 px-8">
                {!capturedImage ? (
                    <button
                        onClick={capture}
                        className="w-20 h-20 bg-white rounded-full border-4 border-white/30 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10" />
                    </button>
                ) : (
                    <div className="flex w-full gap-4 max-w-sm">
                        <button
                            onClick={() => setCapturedImage(null)}
                            className="flex-1 glass py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            重拍
                        </button>
                        <button
                            onClick={download}
                            className="flex-[1.5] bg-white py-4 rounded-2xl text-gray-950 font-bold flex items-center justify-center gap-2 shadow-xl"
                        >
                            <Download size={20} />
                            下載證據報告
                        </button>
                    </div>
                )}
            </div>

            {!capturedImage && (
                <div className="absolute bottom-36 text-white/30 text-[10px] uppercase tracking-widest pointer-events-none">
                    準專業級存證系統 Nor104 已啟動
                </div>
            )}
        </div>
    );
}

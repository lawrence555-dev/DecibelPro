import React, { useRef, useEffect } from 'react';

export function AcousticVisualizer({ spectrum, waveform, colorClass, mode = 'spectrum' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const color = mode === 'spectrum' ? (colorClass.includes('green') ? '#10b981' : colorClass.includes('yellow') ? '#fbbf24' : '#ef4444') : '#60a5fa';

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';

        if (mode === 'spectrum' && spectrum.length > 0) {
            // Frequency Spectrum Line
            const sliceWidth = width / (spectrum.length / 2); // Only show first half (audible range)
            let x = 0;

            for (let i = 0; i < spectrum.length / 2; i++) {
                // Map dB (-100 to -20) to height
                const val = (spectrum[i] + 100) / 80;
                const y = height - (val * height);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }
        } else if (mode === 'waveform' && waveform.length > 0) {
            // Temporal Waveform Line
            const sliceWidth = width / waveform.length;
            let x = 0;

            ctx.moveTo(0, height / 2);
            for (let i = 0; i < waveform.length; i++) {
                const v = waveform[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }
        }

        ctx.stroke();

        // Add a subtle gradient fill below the line
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '44'); // 44 is hex alpha
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.fill();

    }, [spectrum, waveform, colorClass, mode]);

    return (
        <div className="w-full h-24 glass rounded-2xl overflow-hidden border border-white/5 relative">
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-full"
            />
            <div className="absolute top-2 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white/40 uppercase tracking-widest font-bold border border-white/10">
                {mode}
            </div>
        </div>
    );
}

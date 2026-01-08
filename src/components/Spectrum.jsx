import React, { useMemo } from 'react';

export function Spectrum({ data, colorClass }) {
    const bars = useMemo(() => {
        if (!data || data.length === 0) return Array(40).fill(0);

        // Downsample FFT data to 40 bars for UI
        const step = Math.floor(data.length / 40);
        const result = [];
        for (let i = 0; i < 40; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
                sum += data[i * step + j];
            }
            const avg = sum / step;
            // Map dB (-100 to -30) to height (0 to 100)
            const height = Math.max(5, Math.min(100, (avg + 100) * 1.4));
            result.push(height);
        }
        return result;
    }, [data]);

    return (
        <div className="w-full h-32 flex items-end justify-between gap-[2px] px-2 opacity-50">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className={`w-full rounded-t-full transition-all duration-100 ${colorClass.replace('text', 'bg')}`}
                    style={{
                        height: `${h}%`,
                        opacity: 0.3 + (h / 100) * 0.7
                    }}
                />
            ))}
        </div>
    );
}

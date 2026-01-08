/**
 * Decibel Pro Ultra (V2.0) - Acoustic Engine Utilities
 */

// Constant for A-weighting normalization at 1kHz
const A_OFFSET = 2.0;
// Constant for C-weighting normalization at 1kHz
const C_OFFSET = 0.06;

/**
 * Calculates the A-weighting correction in dB for a given frequency.
 * Formula based on IEC 61672-1:2003
 */
export function getAWeighting(f) {
    if (f <= 0) return -100;
    const f2 = f * f;
    const ra = (Math.pow(12194, 2) * Math.pow(f, 4)) /
        ((f2 + Math.pow(20.6, 2)) * Math.sqrt((f2 + Math.pow(107.7, 2)) * (f2 + Math.pow(737.9, 2))) * (f2 + Math.pow(12194, 2)));
    return 20 * Math.log10(ra) + A_OFFSET;
}

/**
 * Calculates the C-weighting correction in dB for a given frequency.
 */
export function getCWeighting(f) {
    if (f <= 0) return -100;
    const f2 = f * f;
    const rc = (Math.pow(12194, 2) * f2) /
        ((f2 + Math.pow(20.6, 2)) * (f2 + Math.pow(12194, 2)));
    return 20 * Math.log10(rc) + C_OFFSET;
}

/**
 * Acoustic Engine Class
 */
export class AcousticEngine {
    constructor(sampleRate, fftSize = 2048) {
        this.sampleRate = sampleRate;
        this.fftSize = fftSize;
        this.binCount = fftSize / 2;
        this.frequencyBinCount = this.binCount;

        // Pre-calculate weighting tables for efficiency
        this.aWeightingTable = new Float32Array(this.binCount);
        this.cWeightingTable = new Float32Array(this.binCount);

        for (let i = 0; i < this.binCount; i++) {
            const freq = (i * this.sampleRate) / this.fftSize;
            this.aWeightingTable[i] = getAWeighting(freq);
            this.cWeightingTable[i] = getCWeighting(freq);
        }

        // Leq state
        this.energySum = 0;
        this.sampleCount = 0;
        this.peakDecibel = -Infinity;
    }

    resetStats() {
        this.energySum = 0;
        this.sampleCount = 0;
        this.peakDecibel = -Infinity;
    }

    /**
     * Calculate SPL (Sound Pressure Level) from frequency data
     * @param {Float32Array} frequencyData - FFT output (dB)
     * @param {string} weighting - 'A' or 'C' or 'Z' (none)
     * @param {number} offset - Calibration offset (dB)
     */
    calculateSPL(frequencyData, weighting = 'A', offset = 0) {
        let sum = 0;
        const table = weighting === 'A' ? this.aWeightingTable : (weighting === 'C' ? this.cWeightingTable : null);

        for (let i = 0; i < frequencyData.length; i++) {
            // Convert dB to linear power
            let db = frequencyData[i];
            if (table) {
                db += table[i];
            }
            // Linear intensity P = 10^(db/10)
            sum += Math.pow(10, db / 10);
        }

        // Mean intensity
        const mean = sum / frequencyData.length;
        // Back to dB
        let spl = 10 * Math.log10(mean || 1e-10);
        spl += offset;

        // Update Peak
        if (spl > this.peakDecibel) {
            this.peakDecibel = spl;
        }

        // Update Leq data
        this.energySum += Math.pow(10, spl / 10);
        this.sampleCount++;

        return spl;
    }

    /**
     * Get the current Leq (Equivalent Continuous Sound Level)
     */
    getLeq() {
        if (this.sampleCount === 0) return 0;
        return 10 * Math.log10(this.energySum / this.sampleCount);
    }

    /**
     * Get the current Peak
     */
    getPeak() {
        return this.peakDecibel === -Infinity ? 0 : this.peakDecibel;
    }
}

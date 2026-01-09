import { useState, useEffect, useRef, useCallback } from 'react';
import { AcousticEngine } from '../utils/acousticEngine';

export function useAcousticEngine(options = {}) {
    const {
        fftSize = 2048,
        weighting = 'A',
        smoothing = 0.08,
        offset = 0,
        isEnabled = false
    } = options;

    const [db, setDb] = useState(0);
    const [leq, setLeq] = useState(0);
    const [peak, setPeak] = useState(0);
    const [spectrum, setSpectrum] = useState(new Float32Array(0));
    const [waveform, setWaveform] = useState(new Uint8Array(0));
    const [error, setError] = useState(null);

    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const engineRef = useRef(null);
    const requestRef = useRef(null);
    const smoothedDbRef = useRef(0);

    const startEngine = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = fftSize;
            analyserRef.current.smoothingTimeConstant = 0; // We handle smoothing ourselves

            const source = audioCtxRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            engineRef.current = new AcousticEngine(audioCtxRef.current.sampleRate, fftSize);
            setError(null);
        } catch (err) {
            console.error('Error starting acoustic engine:', err);
            setError(err.message);
        }
    }, [fftSize]);

    const stopEngine = useCallback(() => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    }, []);

    const update = useCallback(() => {
        if (!analyserRef.current || !engineRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        analyserRef.current.getFloatFrequencyData(dataArray);

        const currentSpl = engineRef.current.calculateSPL(dataArray, weighting, offset);

        // Apply smoothing: currentValue += (targetValue - currentValue) * smoothing
        smoothedDbRef.current += (currentSpl - smoothedDbRef.current) * smoothing;

        setDb(smoothedDbRef.current);
        setLeq(engineRef.current.getLeq());
        setPeak(engineRef.current.getPeak());
        setSpectrum(dataArray);

        // Fetch waveform data
        const timeData = new Uint8Array(analyserRef.current.fftSize);
        analyserRef.current.getByteTimeDomainData(timeData);
        setWaveform(timeData);

        requestRef.current = requestAnimationFrame(update);
    }, [weighting, offset, smoothing]);

    useEffect(() => {
        if (isEnabled) {
            startEngine().then(() => {
                requestRef.current = requestAnimationFrame(update);
            });
        } else {
            stopEngine();
        }
        return () => stopEngine();
    }, [isEnabled, startEngine, stopEngine, update]);

    const resetStats = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.resetStats();
        }
    }, []);

    return { db, leq, peak, spectrum, waveform, error, resetStats };
}

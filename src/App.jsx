import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Settings, History, Mic, Volume2, ShieldAlert, Navigation, X, Trash2 } from 'lucide-react';
import { useAcousticEngine } from './hooks/useAcousticEngine';
import { useLocation } from './hooks/useLocation';
import { getCurrentRegulation } from './utils/regulations';
import { CameraOverlay } from './components/CameraOverlay';
import { Spectrum } from './components/Spectrum';
import { useHistory } from './hooks/useHistory';

function App() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [weighting, setWeighting] = useState('A');
    const [offset, setOffset] = useState(0);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [regulation, setRegulation] = useState(getCurrentRegulation());

    const { db, leq, peak, spectrum, resetStats } = useAcousticEngine({
        isEnabled,
        weighting,
        offset,
        smoothing: 0.08
    });

    const { address } = useLocation();
    const { history, saveMeasurement } = useHistory();

    // Color semantics based on user specs
    const colorClass = useMemo(() => {
        if (db < 50) return 'text-noise-green';
        if (db < 75) return 'text-noise-yellow';
        return 'text-noise-red';
    }, [db]);

    const glowClass = useMemo(() => {
        if (db < 50) return 'bg-noise-green';
        if (db < 75) return 'bg-noise-yellow';
        return 'bg-noise-red';
    }, [db]);

    // Update regulation periodicially
    useEffect(() => {
        const timer = setInterval(() => {
            setRegulation(getCurrentRegulation());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const isViolation = db > regulation.limit;

    const handleSave = () => {
        if (db > 0) {
            saveMeasurement({
                db: Math.round(db),
                leq: Math.round(leq),
                peak: Math.round(peak),
                address,
                weighting,
                timestamp: new Date().toISOString()
            });
            alert('已存證至雲端 (僅保留最新 10 筆)');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 font-sans">
            <div className={`iphone-container relative overflow-hidden transition-all duration-700 ${isViolation ? 'ring-inset ring-8 ring-red-500/20' : ''}`}>

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-radial-gradient" />
                <div className={`absolute top-0 inset-x-0 h-64 opacity-20 blur-3xl ${glowClass} transition-colors duration-1000`} />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-between h-full p-8 pt-12">

                    {/* Header */}
                    <div className="w-full flex justify-between items-center">
                        <Settings className="text-white/40 w-6 h-6 cursor-pointer hover:text-white transition" />
                        <div className="flex flex-col items-center">
                            <h1 className="text-white/90 font-semibold text-sm tracking-[0.2em] uppercase">Decibel Pro Ultra</h1>
                            <span className="text-white/30 text-[10px] tracking-widest mt-1">V2.0 STABLE</span>
                        </div>
                        <button onClick={() => setIsHistoryOpen(true)}>
                            <History className="text-white/40 w-6 h-6 cursor-pointer hover:text-white transition" />
                        </button>
                    </div>

                    {/* Location Bar */}
                    <div className="mt-4 flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full border border-white/10">
                        <Navigation size={12} className="text-white/40" />
                        <span className="text-white/60 text-[10px] font-medium">{address}</span>
                    </div>

                    {/* Main Gauge */}
                    <div className="relative flex items-center justify-center w-72 h-72">
                        {/* Dynamic Glow */}
                        <div className={`absolute inset-0 rounded-full blur-[60px] opacity-30 ${glowClass} transition-colors duration-500 scale-90`} />

                        {/* Circle Gauge (毛玻璃效果) */}
                        <div className="glass w-full h-full rounded-full flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                            <span className={`text-7xl font-bold ${colorClass} transition-colors duration-500 tabular-nums drop-shadow-sm`}>
                                {db > 0 ? Math.round(db) : '--'}
                            </span>
                            <span className="text-white/30 text-xs mt-3 font-semibold tracking-[0.3em] uppercase">dBA</span>

                            <div className="mt-6 flex gap-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-white/20 text-[8px] uppercase tracking-widest">Leq</span>
                                    <span className="text-white/70 text-sm font-medium">{Math.round(leq)}</span>
                                </div>
                                <div className="h-6 w-[1px] bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-white/20 text-[8px] uppercase tracking-widest">Peak</span>
                                    <span className="text-white/70 text-sm font-medium">{Math.round(peak)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regulation Recommendation */}
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isViolation ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'} transition-all`}>
                            <ShieldAlert size={14} className={isViolation ? 'text-red-400' : 'text-white/40'} />
                            <span className={`text-[11px] font-medium ${isViolation ? 'text-red-400' : 'text-white/50'}`}>
                                {regulation.label} 控制值: {regulation.limit}dB
                            </span>
                        </div>
                        {isViolation && <span className="text-[10px] text-red-500/80 font-bold tracking-wider animate-pulse uppercase">超標警告</span>}
                    </div>

                    {/* Spectrum */}
                    <Spectrum data={spectrum} colorClass={colorClass} />

                    {/* Controls */}
                    <div className="w-full flex justify-around items-center mb-10">
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => setIsCameraOpen(true)}
                                className="glass p-4 rounded-full cursor-pointer hover:bg-white/10 active:scale-90 transition"
                            >
                                <Camera className="text-white/80 w-6 h-6" />
                            </button>
                            <span className="text-white/30 text-[10px] font-medium tracking-wider">拍照存證</span>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => setIsEnabled(!isEnabled)}
                                className={`p-7 rounded-full cursor-pointer shadow-xl transition-all duration-500 transform ${isEnabled ? 'bg-red-500 scale-110 shadow-red-500/30 ring-4 ring-white/10' : 'bg-white/5 glass ring-1 ring-white/20'}`}
                            >
                                <Mic className={`w-10 h-10 ${isEnabled ? 'text-white' : 'text-white/20'}`} />
                            </button>
                            <span className={`text-[11px] font-bold tracking-[.2em] transition-colors ${isEnabled ? 'text-red-500' : 'text-white/20'}`}>
                                {isEnabled ? 'STOP' : 'START'}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={handleSave}
                                className="glass p-4 rounded-full cursor-pointer hover:bg-white/10 active:scale-90 transition"
                            >
                                <Volume2 className="text-white/80 w-6 h-6" />
                            </button>
                            <span className="text-white/30 text-[10px] font-medium tracking-wider leading-none">
                                雲端備份
                            </span>
                        </div>
                    </div>

                    {/* iOS Indicator Bar */}
                    <div className="absolute bottom-2 w-32 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Camera Overlay */}
                <CameraOverlay
                    isOpen={isCameraOpen}
                    onClose={() => setIsCameraOpen(false)}
                    db={db}
                    leq={leq}
                    peak={peak}
                    address={address}
                    weighting={weighting}
                />

                {/* History Overlay */}
                {isHistoryOpen && (
                    <div className="absolute inset-0 z-50 bg-dark-bg/95 backdrop-blur-xl p-8 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-white font-bold text-xl">最近 10 筆存證紀錄</h2>
                            <button onClick={() => setIsHistoryOpen(false)}>
                                <X className="text-white/50" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4">
                            {history.length === 0 && <p className="text-white/20 text-center mt-10">尚無雲端紀錄</p>}
                            {history.map((record) => (
                                <div key={record.id} className="glass p-4 rounded-2xl flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-noise-red font-bold text-lg">{record.db} dB</span>
                                            <span className="text-white/30 text-[10px] uppercase">{record.weighting}W</span>
                                        </div>
                                        <span className="text-white/50 text-xs mt-1">{record.address}</span>
                                        <span className="text-white/20 text-[10px] mt-0.5">{new Date(record.timestamp || record.createdAt?.toDate()).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-white/40 text-[10px]">Leq: {record.leq}</span>
                                        <span className="text-white/40 text-[10px]">Peak: {record.peak}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-white/10 text-[10px] text-center mt-4">
                            系統僅保留每個用戶最新的 10 筆數據以節省空間
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import {
    Camera,
    Settings,
    History,
    Mic,
    ShieldAlert,
    Navigation,
    X,
    Trash2,
    CloudUpload,
    SlidersHorizontal
} from 'lucide-react';
import { useAcousticEngine } from './hooks/useAcousticEngine';
import { useLocation } from './hooks/useLocation';
import { getCurrentRegulation } from './utils/regulations';
import { CameraOverlay } from './components/CameraOverlay';
import { Spectrum } from './components/Spectrum';
import { useHistory } from './hooks/useHistory';

function App() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [weighting, setWeighting] = useState('A');
    const [offset, setOffset] = useState(90); // Default calibration
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
        if (isEnabled && db > 0) {
            saveMeasurement({
                db: Math.round(db),
                leq: Math.round(leq),
                peak: Math.round(peak),
                address,
                weighting,
                timestamp: new Date().toISOString()
            });
            alert('已存證至雲端 (僅保留最新 10 筆)');
        } else if (!isEnabled) {
            alert('請先開始監測再進行備份');
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
                        <button onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="text-white/40 w-6 h-6 cursor-pointer hover:text-white transition" />
                        </button>
                        <div className="flex flex-col items-center">
                            <h1 className="text-white/90 font-semibold text-sm tracking-[0.2em] uppercase">Decibel Pro Ultra</h1>
                            <span className="text-white/30 text-[10px] tracking-widest mt-1">V2.0 STABLE</span>
                        </div>
                        <button onClick={() => setIsHistoryOpen(true)}>
                            <History className="text-white/40 w-6 h-6 cursor-pointer hover:text-white transition" />
                        </button>
                    </div>

                    {/* Location Bar */}
                    <div className="mt-4 flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full border border-white/10 max-w-[80%]">
                        <Navigation size={12} className="text-white/40 flex-shrink-0" />
                        <span className="text-white/60 text-[10px] font-medium truncate">{address}</span>
                    </div>

                    {/* Main Gauge */}
                    <div className="relative flex items-center justify-center w-72 h-72">
                        {/* Dynamic Glow */}
                        <div className={`absolute inset-0 rounded-full blur-[60px] opacity-30 ${glowClass} transition-colors duration-500 scale-90`} />

                        {/* Circle Gauge (毛玻璃效果) */}
                        <div className="glass w-full h-full rounded-full flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                            <span className={`text-7xl font-bold ${colorClass} transition-colors duration-500 tabular-nums drop-shadow-sm`}>
                                {isEnabled ? Math.round(db) : '--'}
                            </span>
                            <span className="text-white/30 text-xs mt-3 font-semibold tracking-[0.3em] uppercase">dB({weighting})</span>

                            <div className="mt-6 flex gap-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-white/20 text-[8px] uppercase tracking-widest">Leq</span>
                                    <span className="text-white/70 text-sm font-medium">{isEnabled ? Math.round(leq) : '--'}</span>
                                </div>
                                <div className="h-6 w-[1px] bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-white/20 text-[8px] uppercase tracking-widest">Peak</span>
                                    <span className="text-white/70 text-sm font-medium">{isEnabled ? Math.round(peak) : '--'}</span>
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
                                <CloudUpload className="text-white/80 w-6 h-6" />
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

                {/* Settings Drawer Overlay */}
                {isSettingsOpen && (
                    <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-3xl flex flex-col">
                        <div className="p-8 pb-4 flex justify-between items-center bg-white/5 border-b border-white/10">
                            <h2 className="text-white font-bold text-xl flex items-center gap-2">
                                <SlidersHorizontal size={20} />
                                系統配置
                            </h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="p-2 glass rounded-full">
                                <X size={20} className="text-white/50" />
                            </button>
                        </div>

                        <div className="flex-1 p-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">校準補償 (Offset)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0" max="150"
                                        value={offset}
                                        onChange={(e) => setOffset(Number(e.target.value))}
                                        className="flex-1 accent-red-500 h-1.5 bg-white/10 rounded-full appearance-none"
                                    />
                                    <span className="text-white font-mono text-xl w-12 text-right">{offset}</span>
                                </div>
                                <p className="text-[10px] text-white/30 leading-relaxed italic">
                                    若數值與專業儀器 (如 Nor104) 有偏差，可在此進行靈敏度補償。
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">計權模式 (Weighting)</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setWeighting('A')}
                                        className={`flex-1 py-3 rounded-xl border transition-all ${weighting === 'A' ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-white/30'}`}
                                    >
                                        A-Weighting
                                    </button>
                                    <button
                                        onClick={() => setWeighting('C')}
                                        className={`flex-1 py-3 rounded-xl border transition-all ${weighting === 'C' ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-white/30'}`}
                                    >
                                        C-Weighting
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">裝置資訊</label>
                                <div className="glass p-4 rounded-2xl space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/50">硬體型號</span>
                                        <span className="text-white">iPhone 17 Pro</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/50">引擎版本</span>
                                        <span className="text-white">Acoustic Engine v2.1</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { resetStats(); alert('統計數據已重置'); }}
                                className="w-full py-4 glass text-red-400 font-bold rounded-2xl hover:bg-red-500/10 transition flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                清除本次統計 (Reset Stats)
                            </button>
                        </div>
                    </div>
                )}

                {/* History Overlay */}
                {isHistoryOpen && (
                    <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl p-8 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-white font-bold text-xl">最近 10 筆存證紀錄</h2>
                            <button onClick={() => setIsHistoryOpen(false)}>
                                <X className="text-white/50" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4">
                            {history.length === 0 && <p className="text-white/20 text-center mt-10 text-sm">尚無雲端紀錄</p>}
                            {history.map((record) => (
                                <div key={record.id} className="glass p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-white/20 transition">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-lg ${record.db > 75 ? 'text-red-400' : 'text-green-400'}`}>{record.db} dB</span>
                                            <span className="text-white/30 text-[10px] uppercase font-mono tracking-tighter bg-white/5 px-1.5 rounded">{record.weighting}W</span>
                                        </div>
                                        <span className="text-white/50 text-[10px] mt-1 max-w-[140px] truncate">{record.address}</span>
                                        <span className="text-white/20 text-[9px] mt-0.5">{new Date(record.timestamp || record.createdAt?.toDate()).toLocaleString('zh-TW')}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-white/20 text-[8px] uppercase tracking-tighter">Leq</span>
                                            <span className="text-white/60 text-xs font-mono">{record.leq}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-white/20 text-[8px] uppercase tracking-tighter">Peak</span>
                                            <span className="text-white/60 text-xs font-mono">{record.peak}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;

# Decibel Pro (專業分貝計)

Decibel Pro 是一款專為 iPhone 17 Pro 優化的極致分貝計 Web App，結合了奢華的毛玻璃美學 (Glassmorphism) 與精準的音訊平滑處理技術。

## 核心特色

### 1. 極致流暢的讀數體驗
- **平滑因子轉換**：採用高精確度平滑算法 (`currentValue += (targetValue - currentValue) * 0.08`)，消除數位讀數常見的生硬跳動，營造出如高級音響般的絲滑質感。
- **即時視覺回饋**：圓形量表會隨著音量大小動態進行微縮放與發光效果。

### 2. 高級視覺美學 (UI/UX)
- **Glassmorphism 設計**：核心顯示區具備強力的背景模糊 (`blur(20px)`)、細邊框與層次感。
- **動態色彩分級**：
  - **粉綠色 (#a7f3d0)**：安全環境 (< 50 dB)
  - **粉黃色 (#fde68a)**：注意環境 (50-75 dB)
  - **粉紅色 (#fca5a5)**：危險音量 (> 75 dB)
- **視覺頻譜圖**：正圓下方設有 20 根隨動態變化的物理長條。

### 3. 在地化法規制動
- **台灣噪音管制標準連動**：系統會根據即時時間（日間/晚間/夜間），自動高亮顯示對應的第二類區噪音限制標準。
- **全螢幕警告機制**：當讀數超過 80dB (或該時段限制值) 時，觸發四周紅色呼吸燈視覺警告。

## 技術棧
- **架構**：單檔案 HTML5 / CSS / JavaScript (無需編譯)
- **樣式**：Tailwind CSS / Vanilla CSS
- **核心**：Web Audio API (AnalyserNode)
- **字體**：Google Fonts (Inter & Noto Sans TC)

## 部署與使用
1. **本地執行**：直接使用瀏覽器開啟 `index.html`。
2. **託管建議**：建議部署於 Render (Static Site) 或 GitHub Pages。
   - **注意**：由於瀏覽器安全政策，請確保於 **HTTPS** 環境下執行，以獲得麥克風存取權限。

---
Produced by Decibel Pro Team | 2026 Summer Trip Series

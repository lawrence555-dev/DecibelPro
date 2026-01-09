# Decibel Pro Ultra (V2.2) 系統開發與操作說明

## 1. 專案願景與目標
開發一個專為 iPhone 17 Pro (402x874px) 優化的**專業級聲學測量 Web App**。
本系統不僅提供環境噪音讀數，更具備法律級存證功能、即時波形分析與雙重儲存保障。

## 2. V2.2 重大更新精粹 (最新)
- **高級視覺化引擎**：新增 **Real-time Waveform (時域波形)** 與 **Frequency Spectrum (頻譜線圖)**，支援一鍵切換模式。
- **混合儲存技術 (Hybrid Storage)**：整合 LocalStorage 與 Firebase。即便雲端未配置，紀錄依然保存在手機本機，實現「秒開」與「斷網備份」。
- **聲學計法校準 (Total Energy Sum)**：修正 SPL 計算邏輯，讀數更精準對齊專業分貝計（如 Nor104），環境底噪約穩定於 40-50dB。
- **硬體原始存取 (Raw Audio)**：停用瀏覽器自動增益 (AGC)，確保取得最真實的環境音壓。

## 3. 技術規格 (Tech Stack)
- **核心框架**：React.js (Vite 5)
- **渲染技術**：HTML5 Canvas (用於 60fps 高流暢度圖表)
- **雲端整合**：Firebase Auth (匿名) + Cloud Firestore
- **本機持久化**：Window LocalStorage (10 筆循環覆蓋)
- **部署平台**：Render (HTTPS 加密傳輸)

## 4. 關鍵功能操作

### 4.1 進階視覺化切換
- 在圓形儀表下方，點擊 **[SPECTRUM]** 或 **[WAVEFORM]** 標籤：
  - **Spectrum**：查看不同頻率的能量分佈。
  - **Waveform**：查看聲音的物理震動波形。

### 4.2 混合儲存保障
- **雲端同步燈**：
  - 🟢 綠燈：資料同步至 Firebase，更換設備也能找回紀錄。
  - 🔴 紅燈：資料僅儲存在本機 (LocalStorage)，即便網頁重整資料也不會消失。

### 4.3 專業拍照存證
- 點擊左下角相機，生成的浮水印報告包含：
  - **SPL 分貝值**、**Leq (能量平均)**、**Peak (峰值)**。
  - **地圖地址** 與 **防偽校正標籤**。
- 支援透過系統分享選單直接「儲存影像」至手機相簿。

## 5. 部署與開發設定

### 5.1 麥克風與相機權限
1. 必須在 **HTTPS** 安全連線下執行。
2. Android 用戶請避免在 LINE 內建瀏覽器開啟，建議切換至 **Chrome** 以取得權限。

### 5.2 Firebase 快速配置
- 請於 Firebase 控制台開啟 **Anonymous Auth** 與 **Firestore Database**，並將 API 金鑰填入 `src/firebase.js`。

---
*Developed by Antigravity x Google DeepMind*

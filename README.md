# Decibel Pro Ultra (V2.0) 系統開發規劃書

## 1. 專案願景與目標
開發一個專為 iPhone 17 Pro (402x874px) 優化的準專業級聲學測量 Web App。
本系統旨在提供優於一般分貝計的準確度，具備環境噪音存證功能，並整合台灣在地噪音法規參考。

## 2. 技術棧 (Tech Stack)
- **核心框架**：React.js
- **樣式系統**：Tailwind CSS (支援 Glassmorphism 磨砂質感)
- **聲學引擎**：Web Audio API (AnalyserNode)
- **後端服務**：Firebase (Authentication & Firestore)
- **地理資訊**：Geolocation API + OpenStreetMap Reverse Geocoding
- **影像處理**：HTML5 Camera API + Canvas API (用於生成浮水印報告)

## 3. UI/UX 設計規範
- **設備尺寸**：固定容器為 402px x 874px，支援 iOS `viewport-fit=cover`。
- **視覺風格**：
  - 深色美學底層 (#0a0a0c)，頂部帶有微弱徑向漸層。
  - 中心為「正圓形」顯示盤，具備毛玻璃效果與邊框動態發光。
  - **FFT 頻譜**：在背景或圓圈下方即時顯示 64-128 頻段的頻譜跳動。
- **色彩語義**：
  - < 50dB: 寧靜綠 (#a7f3d0)
  - 50-75dB: 注意黃 (#fde68a)
  - > 75dB: 警告紅 (#fca5a5)

## 4. 核心功能規格

### 4.1 專業級測量引擎
- **計權濾波器 (Weighting)**：
  - **A-Weighting (dBA)**：模擬人耳聽覺，用於一般環境噪音測量。
  - **C-Weighting (dBC)**：用於捕捉重低音 or 機械撞擊聲。
- **響應時間 (Response)**：
  - **Fast (125ms)**：捕捉瞬時噪音。
  - **Slow (1000ms)**：穩定背景讀數。
- **精密指標**：
  - **Leq (等效連續聲級)**：計算測量期間的能量平均值 (Energy Average)。
  - **Peak (峰值)**：記錄瞬間最高聲壓級。
- **校準系統**：提供 dB Offset 調整功能，用於對照專業儀器 (如 Nor104) 進行硬體補償。

### 4.2 舉證拍照系統 (Camera Overlay)
- 呼叫後置相機進行即時取景。
- **Canvas 合成功能**：在快門按下時，自動在影像下方嵌入證據資訊：
  - 當前分貝值、Leq、Max 指標。
  - 地理位置名稱 (如：雲林縣西螺鎮)。
  - 時間戳記與「Nor104 校正標記」。

### 4.3 地理位置與法規
- **地理逆編碼**：將 GPS 座標轉換為中文行政區域名稱。
- **台灣法規參考**：
  - 參照第二類區標準：日間 60dB / 晚間 50dB / 夜間 50dB。
  - 根據系統時間自動顯示當前時段建議。

### 4.4 雲端存證 (Firebase)
- **匿名登入**：確保每個用戶有獨立的 UUID。
- **資料儲存路徑**：`collection(db, 'artifacts', appId, 'public', 'data', 'measurements')`
- **數據導出**：支援將測量清單顯示於歷史紀錄。

## 5. 開發階段
1. **Step 1**: UI 骨架建立 - 實現 iPhone 17 Pro 尺寸容器與毛玻璃圓形儀表。
2. **Step 2**: 聲學算法實現 - 撰寫 Web Audio API 邏輯，包含 FFT 轉換與 A/C 計權公式。
3. **Step 3**: 統計邏輯優化 - 加入 Leq、Peak 與數值平滑處理 (Smoothing)。
4. **Step 4**: 地理與法規整合 - 加入 Geolocation 與自動時段判定。
5. **Step 5**: 拍照與浮水印 - 實作 Camera 模式與 Canvas 繪製報告功能。
6. **Step 6**: Firebase 存接 - 配置 Firestore 儲存路徑與歷史紀錄讀取。

---
## 部署建議 (Deployment)
本專案已針對 **Render** 進行優化，推薦使用 Render 託管：
1. **靜態網站 (Static Site)**：選擇 Render 的 Static Site 類型。
2. **建置指令 (Build Command)**：`npm run build`
3. **發佈目錄 (Publish Directory)**：`dist`
4. **HTTPS**：Render 會自動提供 SSL 憑證，這對啟用**麥克風**與**相機**權限至關重要。

## 如何啟動
1. `npm install`
2. `npm run dev`
3. 確保在 HTTPS 下運行以取得麥克風與相機權限。

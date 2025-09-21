# CloudMosa @ MeiChu Hackathon - CoinMind

企業：CloudMosa Inc.
組別：杯子濃湯
組別編號：5

CoinMind 為一個針對 Cloud Phone 的財務助理與記帳展示專案。前端提供簡潔、鍵盤友善的 UI；後端提供認證、交易記錄與對「AI 財務顧問 Agent」的橋接；Agent 透過 LLM 生成每日理財小語與個人化建議，並可選擇產出語音。

---

## 專案目的

- 讓超低解析度裝置也能使用的財務管理與建議系統
- 提供最小化但完整的流程：註冊/登入、建立交易紀錄、查看清單、獲取每日理財小語與個人化分析
- 藉由 LLM（Gemini）與簡單的代理行為（LangGraph）產生有用、可操作的理財建議

---

## 專案概觀

架構與資料流（Compose 啟動後）：
- 使用者 → Caddy（反向代理）
  - 前端：`http://localhost`（Caddy 直接代理至 Frontend 服務）
  - 後端 API：`http://localhost/api/*`（Caddy 轉發到 Backend 服務）
- Backend（FastAPI）
  - 提供 `/api/...` 的使用者、交易、認證、與分析端點
  - 與資料庫（PostgreSQL）連線
  - 向 Agent 發送請求以取得每日小語與個人化建議
- Agent（FastAPI + LangGraph/LLM）
  - 與 Google Generative AI（Gemini）互動以生成建議或小語
  - 可選擇性呼叫 TTS 服務產生語音回覆（需設定 `TTS_API_KEY`）
- Database（PostgreSQL）
  - 儲存使用者與交易資料
- 服務連接與對外埠口（預設）
  - Caddy: 80、443（對外）
  - Frontend: 3000（容器內，對外由 Caddy 代理）
  - Backend: 8000（容器內，映射到主機 8000；一般使用者透過 Caddy 的 80/443 存取 `/api/*`）
  - Agent: 8000（容器內，映射到主機 8001；僅供本機開發/除錯直連）
  - Postgres: 5432（容器內，使用 Volume 儲存資料）

API 文件（啟動後）：
- Backend Swagger Docs: http://localhost:8000/docs
- Agent Swagger Docs: http://localhost:8001/docs

---

## Tech Stack

- 基礎設施
  - Docker / Docker Compose
  - Caddy 反向代理
  - PostgreSQL（db 容器）
- Backend（Python 3.13）
  - FastAPI、Uvicorn
  - SQLAlchemy
  - Pydantic / pydantic-settings
  - python-jose（JWT）、passlib
- Agent（Python 3.13）
  - FastAPI、Uvicorn
  - LangChain Core、LangGraph
  - Google Generative AI（Gemini）整合
  - UnrealSpeech TTS
- Frontend
  - Next.js 15、React 19
  - Chakra UI、Tailwind CSS
- 開發工具
  - Python: uv（套件/鎖檔管理）、black、isort、flake8、pyright
  - JS/TS: ESLint、Prettier、TypeScript

---

## Setup

前置需求：
- 已安裝 Docker 與 Docker Compose

步驟：
1) 建立並填寫環境變數檔案
   - Backend：建立 `backend/.env`（可從 `backend/.env.example` 複製，若存在的話）
   - Agent：建立 `agent/.env`
   - Frontend：建立 `frontend/.env.local`

2) 建置與啟動
   - 在專案根目錄執行：
     ```
     docker compose up -d --build
     ```

3) 使用服務
   - 前端網站：http://localhost
   - 後端 API：http://localhost/api/...
   - 後端 Swagger Docs：http://localhost:8000/docs
   - Agent Swagger Docs：http://localhost:8001/docs

---

## 環境變數設定

### Backend（backend/.env）

至少需定義資料庫連線與安全相關設定。Compose 已提供名為 `db` 的 Postgres 服務，DSN 可如下：

```
# Database (供 backend 與 db 服務使用)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/postgres

# App
APP_NAME=CloudMosa Accounting API
DEBUG=false
AGENT_BASE_URL=http://agent:8000

# JWT/Security
SECRET_KEY=please-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SALT=please-change-me
```

說明：
- `DATABASE_URL`：使用 asyncpg 的 SQLAlchemy 連線字串，容器內請以 `db` 作為主機名稱
- `AGENT_BASE_URL`：Backend 於容器網路中呼叫 Agent 的 URL，預設 `http://agent:8000`
- 其他欄位可依需求調整（例如 `APP_NAME`、`DEBUG`）

### Agent（agent/.env）

Agent 需要 LLM API Key 才能運作建議與小語生成功能。

```
# Gemini
GEMINI_API_KEY=your-google-generative-ai-key
MODEL_ID=gemini-1.5-flash

# TTS
TTS_API_KEY=your-unrealspeech-api-key
```

說明：
- `GEMINI_API_KEY`：Google Generative AI（Gemini）API 金鑰
- `MODEL_ID`：可調整模型（預設 `gemini-1.5-flash`）
- `TTS_API_KEY`：啟用語音產生功能時必須提供此金鑰，否則語音路徑將回報缺少設定。

### Frontend（frontend/.env.local）

前端以環境變數決定呼叫 Backend 的基底 URL。使用 Caddy 時建議填入 `http://localhost`。如果部署到正式環境（prod），建議將 `BASE_URL` 設定為你的正式網域，例如：

```
BASE_URL=https://your-production-domain.com
```

並確保 Caddy 或其他反向代理已正確設定 SSL 與 API 路徑轉發。

```
# 使用 Caddy 反向代理時：
BASE_URL=http://localhost

# 若直接繞過 Caddy（例如 local 測試）可改用：
# BASE_URL=http://localhost:8000

# 選填：部分程式使用 BASE_PATH，若你需要自訂相對路徑前綴可設定
# BASE_PATH=/
```

---

## 常見問題（FAQ）

- 前端顯示資料抓取錯誤
  - 請檢查 `frontend/.env.local` 的 `BASE_URL` 是否指向可用的 Backend 位址（建議 `http://localhost` 搭配 Caddy）
- 後端連線資料庫失敗
  - 確認 `backend/.env` 中的 `DATABASE_URL` 正確、`db` 服務是否啟動成功
- Agent 回報 LLM/語音金鑰缺失
  - 確認 `agent/.env` 已填入必要的 `GEMINI_API_KEY`；若使用語音，請一併提供 `TTS_API_KEY`

# 使用官方 Node.js LTS (Long Term Support) 版本作為基礎映像
FROM node:18-slim

# 設定工作目錄
WORKDIR /usr/src/app

# 安裝 Puppeteer 所需的 Chromium 及其依賴項
# 參考: https://pptr.dev/guides/docker
# 我們使用 Debian (slim) 基礎映像，所以使用 apt-get
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    # 清理 apt 快取以減少映像大小
    && rm -rf /var/lib/apt/lists/*

# 設定 Puppeteer 的 Chromium 執行路徑環境變數
# Render 環境通常會將 Chromium 安裝在此路徑
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# 禁用 Puppeteer 的沙盒模式，這在 Docker 環境中通常是必要的
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_NO_SANDBOX=true

# 複製 package.json 和 package-lock.json (如果存在)
# 這樣可以利用 Docker 的層快取機制，只有當這些文件變更時才重新安裝依賴
COPY package*.json ./

# 安裝應用程式依賴
# 使用 --production 參數可以避免安裝開發依賴，如果您的應用程式不需要它們的話
# 如果您的 server.js 依賴於 devDependencies 中的某些包，請移除 --production
RUN npm install --production

# 複製應用程式的其餘原始碼到工作目錄
COPY . .

# 您的應用程式監聽的端口 (從 server.js 得知是 3000)
EXPOSE 3000

# 啟動應用程式的指令 (從 package.json 得知是 npm start)
CMD [ "npm", "start" ]
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { PDFDocument } = require('pdf-lib');
const app = express();
const port = 3000;

// 使用cors套件處理CORS，允許所有來源的跨域請求
const cors = require('cors');
app.use(cors({
  origin: '*', // 允許任何來源
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Accept-Language']
}));

app.use(bodyParser.json({ limit: '5mb' }));

// 產生 HTML 用來渲染 PDF/JPEG
function buildHTML(record, locale) {
  return `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${fs.readFileSync(__dirname + '/css/god-willing.css', 'utf8')}
        ${fs.readFileSync(__dirname + '/css/index.css', 'utf8')}
        ${fs.readFileSync(__dirname + '/css/widget-calendar-custom.css', 'utf8')}
        ${fs.readFileSync(__dirname + '/css/history-manager.css', 'utf8')}
        ${fs.readFileSync(__dirname + '/css/illustrate-score.css', 'utf8')}
        ${fs.readFileSync(__dirname + '/css/score-settings.css', 'utf8')}
      </style>
    </head>
    <body>
      ${(() => {
      // 格式化日期時間
      const recordDate = new Date(record.timestamp);
      const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei'
      };
      const formatter = new Intl.DateTimeFormat(locale || 'zh-TW', options);
      const parts = formatter.formatToParts(recordDate);
      const getPart = (type) => parts.find(part => part.type === type)?.value || '';
      const formattedDate = `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
      console.log(`Formatted Date: ${formattedDate}, Locale: ${locale}, LocaleTime: ${recordDate.toLocaleTimeString('zh-TW', { hour12: false, timeZone: 'UTC' })})}`);
      // 處理原爻值和六親選擇器
      let processedHTML = '';

      // 添加內容包裝器HTML
      if (record.contentWrapperHTML) {
        processedHTML += record.contentWrapperHTML;
      }

      // 處理父容器HTML，替換原爻值和六親選擇器
      if (record.parentHTML) {
        let parentHTML = record.parentHTML;

        // 如果有爻值數據，替換原爻值
        if (record.yaoValues && Array.isArray(record.yaoValues)) {
          let yaoIndex = 0; // Counter for yaoValues
          // Replace each original-yao select with a styled div and its corresponding value
          parentHTML = parentHTML.replace(
            /<select[^>]*class="[^"]*\boriginal-yao\b[^"]*"[^>]*>(.*?)<\/select>/gs,
            (match, selectedValue) => {
              // 這裡 selectedValue 就是抓到的 data-selected 屬性值
              if (yaoIndex < record.yaoValues.length && record.yaoValues[yaoIndex] !== undefined) {
                const value = String(record.yaoValues[yaoIndex]); // 或你也可以直接用 selectedValue
                yaoIndex++;
                return `<div class="original-yao-text" style="padding: 2px 5px; border: 1px solid black; background-color: rgb(248, 248, 248); display: inline-block; min-width: 20px; text-align: center; writing-mode: horizontal-tb; text-orientation: mixed; grid-column-start: 4; grid-row-start: ${11 + yaoIndex}; font - family: 標楷體; ">${value}</div>`;
              }
              return '<div></div>'; // fallback
            });
        }
        // 如果有六親值，替換六親選擇器
        if (record.sixRelationValue) {
          const sixRelationRegex = new RegExp(`<select[^>]*class="six-relation-select"[^>]*>.*?<\/select>`, 'gs');
          // Apply specific inline styles for six-relation text
          parentHTML = parentHTML.replace(sixRelationRegex, `<div style="text-align: center; font-weight: bold; font-size: 1em; color: #000000; padding: 1px;">${String(record.sixRelationValue).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`);
        }

        parentHTML = parentHTML.replace(
          /<textarea[^>]*class="[^"]*\baskInfo\b[^"]*"[^>]*placeholder="[^"]*"[^>]*>.*?<\/textarea>/gs,
          () => {
            const value = record.askInfo ?? "";
            return `<textarea class="askInfo" placeholder="請示：">${value.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>`;
          }
        );

        processedHTML += parentHTML;
      }


      return `
          <div class="record-preview-content">
            <div class="record-title">卦象記錄 (${formattedDate})</div>
            <div class="record-preview-container">
              <div class="preview-content">
                ${processedHTML}
              </div>
            </div>
          </div>
        `;
    })()}
    </body >
    </html >
  `;
}

// 遞迴處理PDF生成
async function generatePDFRecursively(browser, records, index, pdfDoc) {
  if (index >= records.length) {
    return pdfDoc;
  }

  const record = records[index];
  const htmlContent = buildHTML(record, browser.__locale);
  const page = await browser.newPage();

  // 設置頁面大小為A4尺寸
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });

  // 設置內容並等待渲染完成
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // 等待確保所有內容都已渲染
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 調整頁面樣式以確保內容填滿整個頁面
  await page.evaluate(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
  });

  // 生成PDF頁面
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    },
    scale: 1.0,
    preferCSSPageSize: false
  });

  // 關閉當前頁面
  await page.close();

  // 將頁面添加到PDF文檔
  if (index === 0) {
    // 第一個記錄，直接使用其PDF緩衝區
    pdfDoc = pdfBuffer;
  } else {
    // 使用pdf-lib合併PDF
    try {
      // 創建一個新的合併PDF文檔
      const mergedPdf = await PDFDocument.create();

      // 載入現有的PDF文檔
      const existingPdfDoc = await PDFDocument.load(pdfDoc);
      const newPdfDoc = await PDFDocument.load(pdfBuffer);

      // 複製所有頁面到合併文檔
      const existingPages = await mergedPdf.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
      existingPages.forEach(page => mergedPdf.addPage(page));

      const newPages = await mergedPdf.copyPages(newPdfDoc, newPdfDoc.getPageIndices());
      newPages.forEach(page => mergedPdf.addPage(page));

      // 將合併後的文檔保存為緩衝區
      pdfDoc = await mergedPdf.save();
    } catch (error) {
      console.error('合併PDF時發生錯誤:', error);
      // 如果合併失敗，至少返回第一個PDF
    }
  }

  // 遞迴處理下一個記錄
  return generatePDFRecursively(browser, records, index + 1, pdfDoc);
}

// PDF 下載 API
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).send('無效的記錄數據');
    }

    // 從請求頭中獲取Accept-Language
    const locale = req.headers['accept-language'] || 'zh-TW';

    let browser;
    let launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    };
    try {
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        console.log(`Using Chromium from PUPPETEER_EXECUTABLE_PATH for PDF: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
      } else {
        console.log('PUPPETEER_EXECUTABLE_PATH not set, using default Chromium for PDF generation.');
      }
      browser = await puppeteer.launch(launchOptions);
      // 將locale保存到browser實例中，以便在generatePDFRecursively中使用
      browser.__locale = locale;
      console.log('Puppeteer launched successfully for PDF generation.');
    } catch (launchError) {
      console.error('Failed to launch Puppeteer for PDF generation:', launchError);
      console.error('Puppeteer launch options used for PDF:', JSON.stringify(launchOptions, null, 2));
      return res.status(500).send('Failed to launch Puppeteer for PDF generation. Check server logs for details.');
    }

    // 使用遞迴方式處理所有記錄
    const pdfBuffer = await generatePDFRecursively(browser, records, 0, null);

    await browser.close();

    // 獲取當前日期作為文件名的一部分
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

    // 設置文件名
    const fileName = records[0] && records[0].askInfo ?
      `${records[0].askInfo}_${dateStr}.pdf` :
      `卦象記錄_${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('生成PDF時發生錯誤:', error);
    res.status(500).send('生成PDF時發生錯誤');
  }
});

// 遞迴處理JPEG生成
async function generateJPEGRecursively(browser, records, index, images) {
  if (index >= records.length) {
    return images;
  }

  const record = records[index];
  const htmlContent = buildHTML(record, browser.__locale);
  const page = await browser.newPage();

  // 設置頁面大小為A4尺寸
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });

  // 設置內容並等待渲染完成
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // 等待確保所有內容都已渲染
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 調整頁面樣式以確保內容填滿整個頁面
  await page.evaluate(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
  });

  // 生成JPEG
  const imageBuffer = await page.screenshot({
    fullPage: false,
    type: 'jpeg',
    quality: 100,
    clip: {
      x: 0,
      y: 0,
      width: 794,
      height: 1123
    },
    omitBackground: false
  });

  // 關閉當前頁面
  await page.close();

  // 將圖片添加到結果數組
  images.push({
    buffer: imageBuffer,
    name: record.askInfo || `卦象記錄_${index + 1}`
  });

  // 遞迴處理下一個記錄
  return generateJPEGRecursively(browser, records, index + 1, images);
}

// 創建ZIP文件
async function createZipFromImages(images) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高壓縮級別
    });

    const chunks = [];

    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // 添加每個圖片到ZIP
    images.forEach((image, index) => {
      // 確保檔案名稱有效，移除可能導致問題的字符
      const safeName = (image.name || `卦象記錄_${index + 1}`).replace(/[\/:*?"<>|]/g, '_');
      archive.append(image.buffer, { name: `${safeName}.jpeg` });
    });

    // 確保完成歸檔過程
    archive.finalize();
  });
}

// JPEG 下載 API
app.post('/api/generate-jpeg', async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).send('無效的記錄數據');
    }

    // 從請求頭中獲取Accept-Language
    const locale = req.headers['accept-language'] || 'zh-TW';

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    });

    // 將locale保存到browser實例中，以便在generateJPEGRecursively中使用
    browser.__locale = locale;

    // 使用遞迴方式處理所有記錄
    const images = await generateJPEGRecursively(browser, records, 0, []);

    await browser.close();

    // 獲取當前日期作為文件名的一部分
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

    // 如果只有一個記錄，直接返回JPEG
    if (records.length === 1) {
      const jpegFileName = records[0] && records[0].askInfo ?
        `${records[0].askInfo}_${dateStr}.jpeg` :
        `卦象記錄_${dateStr}.jpeg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(jpegFileName)}`
      });
      res.send(images[0].buffer);
    } else {
      // 多個記錄，創建ZIP文件
      const zipBuffer = await createZipFromImages(images);
      const zipFileName = `卦象記錄_${dateStr}.zip`;

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(zipFileName)}`
      });
      res.send(zipBuffer);
    }
  } catch (error) {
    console.error('生成JPEG時發生錯誤:', error);
    res.status(500).send('生成JPEG時發生錯誤');
  }
});

app.listen(port, () => {
  console.log(`PDF / JPEG 伺服器正在運行：http://localhost:${port}`);
});

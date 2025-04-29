/**
 * 歷史記錄管理模塊
 * 處理卦象記錄的儲存、讀取、刪除和下載功能
 */
const downloadFlag = false; // 設置為true以開放下載功能，設置為false以關閉下載功能

// 初始化歷史記錄管理
document.addEventListener('DOMContentLoaded', function () {
    initHistoryManager();
    setupStoreButton();
});

/**
 * 初始化歷史記錄管理UI和事件
 */
function initHistoryManager() {
    // 確保歷史按鈕和相關UI元素已添加到DOM
    const historyBtn = document.getElementById('history-btn');
    const historyOverlay = document.querySelector('.history-overlay');
    const historyContainer = document.querySelector('.history-container');
    const historyCloseBtn = document.querySelector('.history-close-btn');

    if (!historyBtn || !historyOverlay || !historyContainer || !historyCloseBtn) {
        console.error('歷史記錄UI元素未找到');
        return;
    }

    // 顯示或隱藏歷史記錄視窗
    function toggleHistory() {
        historyOverlay.classList.toggle('visible');
        historyContainer.classList.toggle('visible');

        // 如果視窗變為可見，則載入歷史記錄
        if (historyContainer.classList.contains('visible')) {
            loadHistoryRecords();
        }
    }

    // 點擊按鈕顯示歷史記錄
    historyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleHistory();
    });

    // 點擊關閉按鈕隱藏歷史記錄
    historyCloseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleHistory();
    });

    // 點擊遮罩層隱藏歷史記錄
    historyOverlay.addEventListener('click', function (e) {
        e.preventDefault();
        toggleHistory();
    });

    // 防止點擊歷史記錄容器時關閉視窗
    historyContainer.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // 設置下載按鈕事件
    document.getElementById('download-selected-btn').addEventListener('click', function () {
        downloadSelectedRecords();
    });

    // 設置刪除按鈕事件
    document.getElementById('delete-selected-btn').addEventListener('click', function () {
        deleteSelectedRecords();
    });

    // 設置全選/取消全選按鈕事件
    document.getElementById('select-all-btn').addEventListener('click', function () {
        toggleSelectAll();
    });

    // 設置下載格式選擇事件
    document.getElementById('download-format').addEventListener('change', function () {
        // 可以在這裡添加格式變更的相關邏輯
    });
}

/**
 * 設置儲存按鈕事件
 */
function setupStoreButton() {
    const storeBtn = document.getElementById('store-btn');
    if (!storeBtn) {
        console.error('儲存按鈕未找到');
        return;
    }

    storeBtn.addEventListener('click', function () {
        saveCurrentRecord();
    });
}

/**
 * 儲存當前卦象記錄
 */
function saveCurrentRecord() {
    // 獲取當前日期作為分類依據
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeStamp = now.toISOString();

    // 獲取god-willing區塊內容
    const contentWrapperElement = document.querySelector('.content-wrapper');
    const contentWrapperHTML = contentWrapperElement ? contentWrapperElement.outerHTML : '';

    // 獲取parent區塊內容
    const parentElement = document.querySelector('.parent');
    const parentHTML = parentElement ? parentElement.outerHTML : '';

    // 取得所有原爻的值
    const yaoValues = [];
    if (parentElement) {
        parentElement.querySelectorAll('.original-yao').forEach(select => {
            yaoValues.push(select.value);
        });
    }

    // 獲取askInfo區塊內容
    const askInfo = document.querySelector('.askInfo')?.value;

    // 創建記錄對象
    const record = {
        id: Date.now().toString(), // 使用時間戳作為唯一ID
        dateKey: dateKey,
        timestamp: timeStamp,
        contentWrapperHTML: contentWrapperHTML,
        parentHTML: parentHTML,
        yaoValues: yaoValues,
        askInfo: askInfo
    };

    // 從localStorage獲取現有記錄
    let records = JSON.parse(localStorage.getItem('guaRecords') || '{}');

    // 確保該日期的記錄數組存在
    if (!records[dateKey]) {
        records[dateKey] = [];
    }

    // 添加新記錄
    records[dateKey].push(record);

    // 保存回localStorage
    localStorage.setItem('guaRecords', JSON.stringify(records));

    // 顯示成功消息
    alert('卦象記錄已成功儲存！');
}

/**
 * 載入歷史記錄並顯示在視窗中
 */
function loadHistoryRecords() {
    const recordsContainer = document.getElementById('history-records');
    if (!recordsContainer) {
        console.error('歷史記錄容器未找到');
        return;
    }

    // 清空現有內容
    recordsContainer.innerHTML = '';

    // 從localStorage獲取記錄
    const records = JSON.parse(localStorage.getItem('guaRecords') || '{}');
    const dateKeys = Object.keys(records).sort().reverse(); // 按日期降序排列

    if (dateKeys.length === 0) {
        recordsContainer.innerHTML = '<div class="no-records">暫無歷史記錄</div>';
        return;
    }

    // 為每個日期創建一個區塊
    dateKeys.forEach(dateKey => {
        const dateRecords = records[dateKey];
        if (!dateRecords || dateRecords.length === 0) return;

        // 創建日期標題
        const dateSection = document.createElement('div');
        dateSection.className = 'date-section';
        dateSection.innerHTML = `<h3>${dateKey}</h3>`;

        // 創建記錄列表
        const recordsList = document.createElement('div');
        recordsList.className = 'records-list';

        // 添加每條記錄
        dateRecords.forEach(record => {
            const recordItem = document.createElement('div');
            recordItem.className = 'record-item';
            recordItem.dataset.id = record.id;

            // 格式化時間
            const recordTime = new Date(record.timestamp);
            const timeStr = recordTime.toLocaleTimeString();

            // 檢查askInfo是否為undefined
            record.askInfo = record.askInfo || '';

            // 創建記錄內容
            recordItem.innerHTML = `
                <div class="record-header">
                    <input type="checkbox" class="record-checkbox" data-id="${record.id}">
                    <span>${record.askInfo}</span>
                    <span class="record-time">${timeStr}</span>
                </div>
                <div class="record-preview">
                    <div class="preview-loading">載入中...</div>
                </div>
            `;

            // 創建縮圖預覽
            createThumbnail(record, recordItem);

            // 添加點擊預覽事件
            recordItem.querySelector('.record-preview').addEventListener('click', function () {
                previewRecord(record);
            });

            recordsList.appendChild(recordItem);
        });

        dateSection.appendChild(recordsList);
        recordsContainer.appendChild(dateSection);
    });
}

/**
 * 為記錄創建縮圖
 */
function createThumbnail(record, recordItem) {
    // 創建一個臨時容器用於渲染記錄
    const tempContainer = document.createElement('div');
    tempContainer.className = 'record-preview-container';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = 'auto'; // 設定固定寬度以確保圖片質量
    tempContainer.style.height = ''; // 設定固定高度以確保圖片質量
    tempContainer.style.backgroundColor = 'white';
    document.body.appendChild(tempContainer);

    // 添加記錄內容
    tempContainer.innerHTML = `
        <div class="preview-content" style="padding: 10px;">
            ${record.contentWrapperHTML || ''}
            ${record.parentHTML || ''}
        </div>
    `;

    // 設置askInfo文本區域的值
    const askInfoTextarea = tempContainer.querySelector('.askInfo');
    if (askInfoTextarea && record.askInfo) {
        askInfoTextarea.value = record.askInfo;
    }

    // 處理原爻值顯示
    if (record.yaoValues && Array.isArray(record.yaoValues)) {
        const previewParent = tempContainer.querySelector('.parent');
        if (previewParent) {
            const selects = previewParent.querySelectorAll('.original-yao');
            selects.forEach((select, idx) => {
                if (record.yaoValues[idx] !== undefined) {
                    // 創建一個div元素來替換select
                    const div = document.createElement('div');
                    div.className = 'original-yao-text';
                    div.textContent = record.yaoValues[idx];
                    div.style.padding = '2px 5px';
                    div.style.border = '1px solid black';
                    div.style.backgroundColor = '#f8f8f8';
                    div.style.display = 'inline-block';
                    div.style.minWidth = '20px';
                    div.style.textAlign = 'center';
                    div.style.writingMode = 'horizontal-tb';
                    div.style.textOrientation = 'mixed';
                    div.style.gridColumnStart = 4;
                    div.style.gridRowStart = 12 + idx;
                    div.style.fontFamily = '標楷體, KaiTi, serif';

                    // 替換select元素
                    select.parentNode.replaceChild(div, select);
                }
            });
        }
        // 保存六親選擇器值
        const sixRelationSelect = tempContainer.querySelector('.six-relation-select');
        const sixRelationValue = sixRelationSelect?.value;

        // 如果找到六親選擇器且有值，則替換為文本顯示
        if (sixRelationSelect && sixRelationValue) {
            // 創建一個div元素來替換select
            const div = document.createElement('div');
            div.className = 'original-yao-text';
            div.textContent = sixRelationValue;
            div.style.padding = '2px 5px';
            div.style.backgroundColor = '#f8f8f8';
            div.style.display = 'inline-block';
            div.style.minWidth = '20px';
            div.style.textAlign = 'center';
            div.style.writingMode = 'horizontal-tb';
            div.style.textOrientation = 'mixed';
            div.style.gridColumnStart = 6;
            div.style.gridRowStart = 7;
            div.style.fontFamily = '標楷體, KaiTi, serif';

            // 替換select元素
            sixRelationSelect.parentNode.replaceChild(div, sixRelationSelect);
        }
    }

    // 使用dom-to-image-more將容器轉換為縮略圖
    domtoimage.toJpeg(tempContainer, {
        quality: 0.8,
        bgcolor: 'white',
        width: 400,
        height: 450,
        style: {
            'transform': 'scale(0.5)',
            'transform-origin': 'top'

        }
    }).then(dataUrl => {
        // 移除臨時容器
        document.body.removeChild(tempContainer);

        // 創建縮略圖
        const thumbnail = document.createElement('img');
        thumbnail.src = dataUrl;
        thumbnail.style.width = '100%';
        thumbnail.style.height = '100%';
        thumbnail.style.objectFit = 'contain';

        // 替換載入中的提示
        const previewDiv = recordItem.querySelector('.record-preview');
        previewDiv.innerHTML = '';
        previewDiv.appendChild(thumbnail);
    }).catch(error => {
        console.error('生成縮略圖時發生錯誤:', error);
        // 移除臨時容器
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
        // 顯示錯誤提示
        const previewDiv = recordItem.querySelector('.record-preview');
        previewDiv.innerHTML = '<div class="preview-icon">👁️</div>';
    });
}

/**
 * 預覽單條記錄
 */
function previewRecord(record) {
    const previewContainer = document.getElementById('record-preview-container');
    if (!previewContainer) {
        console.error('預覽容器未找到');
        return;
    }

    // 顯示預覽容器
    previewContainer.classList.add('visible');

    // 設置預覽內容
    previewContainer.innerHTML = `
        <div class="preview-header">
            <h3>記錄預覽 (${new Date(record.timestamp).toLocaleString()})</h3>
            <button class="preview-close-btn">X</button>
        </div>
        <div class="preview-content">
            ${record.contentWrapperHTML}
            ${record.parentHTML}
        </div>
    `;

    // 設置askInfo文本區域的值
    const askInfoTextarea = previewContainer.querySelector('.askInfo');
    if (askInfoTextarea && record.askInfo) {
        askInfoTextarea.value = record.askInfo;
    }

    // 設定預覽內容的原爻值並將選單替換為純文本顯示
    if (record.yaoValues && Array.isArray(record.yaoValues)) {
        const previewParent = previewContainer.querySelector('.parent');
        if (previewParent) {
            const selects = previewParent.querySelectorAll('.original-yao');
            selects.forEach((select, idx) => {
                if (record.yaoValues[idx] !== undefined) {
                    // 獲取選中的值
                    const selectedValue = record.yaoValues[idx];

                    // 創建一個span元素來替換select
                    const div = document.createElement('div');
                    div.className = 'original-yao-text';
                    div.textContent = selectedValue;
                    div.style.padding = '2px 5px';
                    div.style.border = '1px solid black';
                    div.style.backgroundColor = '#f8f8f8';
                    div.style.display = 'inline-block';
                    div.style.minWidth = '20px';
                    div.style.textAlign = 'center';
                    div.style.writingMode = 'horizontal-tb';
                    div.style.textOrientation = 'mixed';
                    div.style.gridColumnStart = 4;
                    div.style.gridRowStart = 12 + idx;
                    div.style.fontFamily = '標楷體';
                    div.style.KaiTi = 'serif';

                    // 替換select元素
                    select.parentNode.replaceChild(div, select);
                }
            });

            // 保存六親選擇器值
            const sixRelationSelect = previewContainer.querySelector('.six-relation-select');
            const sixRelationValue = sixRelationSelect?.value;
            console.log(sixRelationValue);

            // 如果找到六親選擇器且有值，則替換為文本顯示
            if (sixRelationSelect && sixRelationValue) {
                // 創建一個div元素來替換select
                const div = document.createElement('div');
                div.className = 'original-yao-text';
                div.textContent = sixRelationValue;
                div.style.padding = '2px 5px';
                div.style.backgroundColor = '#f8f8f8';
                div.style.display = 'inline-block';
                div.style.minWidth = '20px';
                div.style.textAlign = 'center';
                div.style.writingMode = 'horizontal-tb';
                div.style.textOrientation = 'mixed';
                div.style.gridColumnStart = 6;
                div.style.gridRowStart = 7;
                div.style.fontFamily = '標楷體, KaiTi, serif';

                // 替換select元素
                sixRelationSelect.parentNode.replaceChild(div, sixRelationSelect);
            }

        }
    }


    // 設置關閉按鈕事件
    previewContainer.querySelector('.preview-close-btn').addEventListener('click', function () {
        previewContainer.classList.remove('visible');
        // 完全清空預覽容器內容，而不只是移除可見狀態
        previewContainer.innerHTML = '';
    }
    );
}

/**
 * 下載選中的記錄
 */
function downloadSelectedRecords() {
    if (!downloadFlag) {
        alert("目前下載功能未開放");
        return;
    }
    const checkboxes = document.querySelectorAll('.record-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('請至少選擇一條記錄');
        return;
    }

    // 獲取下載格式
    const format = document.getElementById('download-format').value;

    // 從localStorage獲取記錄
    const allRecords = JSON.parse(localStorage.getItem('guaRecords') || '{}');
    const selectedRecords = [];

    // 收集選中的記錄
    checkboxes.forEach(checkbox => {
        const recordId = checkbox.dataset.id;

        // 在所有日期中查找該記錄
        Object.values(allRecords).forEach(dateRecords => {
            const record = dateRecords.find(r => r.id === recordId);
            if (record) {
                selectedRecords.push(record);
            }
        });
    });

    if (selectedRecords.length === 0) {
        alert('未找到選中的記錄');
        return;
    }

    // 根據格式下載
    if (format === 'pdf') {
        downloadAsPDF(selectedRecords);
    } else if (format === 'jpeg') {
        downloadAsJPEG(selectedRecords);
    }
}

/**
 * 將記錄下載為PDF
 */
function downloadAsPDF(records) {
    if (!records || records.length === 0) {
        alert('沒有可下載的記錄');
        return;
    }

    // 創建一個臨時容器用於渲染記錄
    const tempContainer = document.createElement('div');
    tempContainer.className = 'temp-preview-container';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px'; // 設定固定寬度以確保圖片質量
    document.body.appendChild(tempContainer);

    // 處理每條記錄
    const processRecord = (index) => {
        if (index >= records.length) {
            // 所有記錄處理完畢，移除臨時容器
            document.body.removeChild(tempContainer);
            return;
        }

        const record = records[index];

        // 清空臨時容器
        tempContainer.innerHTML = '';

        // 創建記錄標題
        const titleDiv = document.createElement('div');
        titleDiv.className = 'record-title';
        titleDiv.style.padding = '10px';
        titleDiv.style.backgroundColor = '#f8f8f8';
        titleDiv.style.borderBottom = '1px solid #ddd';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.textAlign = 'center';

        // 格式化日期時間
        const recordDate = new Date(record.timestamp);
        const formattedDate = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}-${recordDate.getDate().toString().padStart(2, '0')} ${recordDate.toLocaleTimeString()}`;
        titleDiv.textContent = `卦象記錄 (${formattedDate})`;

        tempContainer.appendChild(titleDiv);

        // 添加記錄內容
        const contentDiv = document.createElement('div');
        contentDiv.className = 'record-preview-container';
        contentDiv.style.padding = '15px';
        contentDiv.style.backgroundColor = 'white';
        contentDiv.innerHTML = `        
            <div class="preview-content">
                ${record.contentWrapperHTML}
                ${record.parentHTML}
            </div>
        `;
        tempContainer.appendChild(contentDiv);

        // 處理原爻值顯示
        if (record.yaoValues && Array.isArray(record.yaoValues)) {
            const previewParent = contentDiv.querySelector('.parent');
            if (previewParent) {
                const selects = previewParent.querySelectorAll('.original-yao');
                selects.forEach((select, idx) => {
                    if (record.yaoValues[idx] !== undefined) {
                        // 創建一個div元素來替換select
                        const div = document.createElement('div');
                        div.className = 'original-yao-text';
                        div.textContent = record.yaoValues[idx];
                        div.style.padding = '2px 5px';
                        div.style.border = '1px solid black';
                        div.style.backgroundColor = '#f8f8f8';
                        div.style.display = 'inline-block';
                        div.style.minWidth = '20px';
                        div.style.textAlign = 'center';
                        div.style.writingMode = 'horizontal-tb';
                        div.style.textOrientation = 'mixed';
                        div.style.gridColumnStart = 4;
                        div.style.gridRowStart = 14 + idx;
                        div.style.fontFamily = '標楷體, KaiTi, serif';

                        // 替換select元素
                        select.parentNode.replaceChild(div, select);
                    }
                });

                // 處理六親選擇器
                const sixRelationSelect = contentDiv.querySelector('.six-relation-select');
                if (sixRelationSelect) {
                    const sixRelationValue = sixRelationSelect.value;
                    const div = document.createElement('div');
                    div.className = 'original-yao-text';
                    div.textContent = sixRelationValue;
                    div.style.padding = '2px 5px';
                    div.style.backgroundColor = '#f8f8f8';
                    div.style.display = 'inline-block';
                    div.style.minWidth = '20px';
                    div.style.textAlign = 'center';
                    div.style.writingMode = 'horizontal-tb';
                    div.style.textOrientation = 'mixed';
                    div.style.gridColumnStart = 6;
                    div.style.gridRowStart = 7;
                    div.style.fontFamily = '標楷體, KaiTi, serif';

                    // 替換select元素
                    sixRelationSelect.parentNode.replaceChild(div, sixRelationSelect);
                }
            }
        }

        // 使用dom-to-image-more將容器轉換為圖片
        domtoimage.toJpeg(tempContainer, {
            quality: 0.95,
            bgcolor: 'white',
            style: {
                'transform': 'none'
            }
        }).then(dataUrl => {
            // 使用jsPDF創建PDF文檔
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // 創建臨時圖片以獲取尺寸
            const img = new Image();
            img.src = dataUrl;
            img.onload = function () {
                // 計算PDF頁面尺寸
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                const imgX = (pageWidth - imgWidth * ratio) / 2;
                const imgY = 10; // 頂部留出一些空間

                // 添加圖片到PDF
                pdf.addImage(dataUrl, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

                // 保存PDF
                pdf.save(`卦象記錄_${record.dateKey}_${index + 1}.pdf`);

                // 處理下一條記錄
                setTimeout(() => {
                    processRecord(index + 1);
                }, 500); // 添加延遲以避免瀏覽器阻止多次下載
            };
        }).catch(error => {
            console.error('生成PDF時發生錯誤:', error);
            alert(`生成PDF時發生錯誤: ${error.message}`);
            // 即使出錯也繼續處理下一條記錄
            setTimeout(() => {
                processRecord(index + 1);
            }, 500);
        });
    };

    // 開始處理第一條記錄
    processRecord(0);
}

/**
 * 將記錄下載為JPEG
 * 直接使用選中的歷史記錄作為下載依據，不使用截圖方式
 */
function downloadAsJPEG(records) {
    if (!records || records.length === 0) {
        alert('沒有可下載的記錄');
        return;
    }

    // 創建一個臨時容器用於渲染記錄
    const tempContainer = document.createElement('div');
    tempContainer.className = 'temp-preview-container';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px'; // 設定固定寬度以確保圖片質量
    document.body.appendChild(tempContainer);

    // 處理每條記錄
    const processRecord = (index) => {
        if (index >= records.length) {
            // 所有記錄處理完畢，移除臨時容器
            document.body.removeChild(tempContainer);
            return;
        }

        const record = records[index];

        // 清空臨時容器
        tempContainer.innerHTML = '';

        // 創建記錄標題
        const titleDiv = document.createElement('div');
        titleDiv.className = 'record-title';
        titleDiv.style.padding = '10px';
        titleDiv.style.backgroundColor = '#f8f8f8';
        titleDiv.style.borderBottom = '1px solid #ddd';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.textAlign = 'center';

        // 格式化日期時間
        const recordDate = new Date(record.timestamp);
        const formattedDate = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}-${recordDate.getDate().toString().padStart(2, '0')} ${recordDate.toLocaleTimeString()}`;
        titleDiv.textContent = `卦象記錄 (${formattedDate})`;

        tempContainer.appendChild(titleDiv);

        // 添加記錄內容
        const contentDiv = document.createElement('div');
        contentDiv.className = 'record-preview-container';
        contentDiv.style.padding = '15px';
        contentDiv.style.backgroundColor = 'white';
        contentDiv.innerHTML = `        
            <div class="preview-content">
                ${record.contentWrapperHTML}
                ${record.parentHTML}
            </div>
        `;

        // 處理原爻值顯示
        if (record.yaoValues && Array.isArray(record.yaoValues)) {
            const previewParent = contentDiv.querySelector('.parent');
            if (previewParent) {
                const selects = previewParent.querySelectorAll('.original-yao');
                selects.forEach((select, idx) => {
                    if (record.yaoValues[idx] !== undefined) {
                        // 創建一個div元素來替換select
                        const div = document.createElement('div');
                        div.className = 'original-yao-text';
                        div.textContent = record.yaoValues[idx];
                        div.style.padding = '2px 5px';
                        div.style.border = '1px solid black';
                        div.style.backgroundColor = '#f8f8f8';
                        div.style.display = 'inline-block';
                        div.style.minWidth = '20px';
                        div.style.textAlign = 'center';
                        div.style.writingMode = 'horizontal-tb';
                        div.style.textOrientation = 'mixed';
                        div.style.gridColumnStart = 4;
                        div.style.gridRowStart = 14 + idx;
                        div.style.fontFamily = '標楷體, KaiTi, serif';

                        // 替換select元素
                        select.parentNode.replaceChild(div, select);
                    }
                });

                // 處理六親選擇器
                const sixRelationSelect = contentDiv.querySelector('.six-relation-select');
                if (sixRelationSelect) {
                    const sixRelationValue = sixRelationSelect.value;
                    const div = document.createElement('div');
                    div.className = 'original-yao-text';
                    div.textContent = sixRelationValue;
                    div.style.padding = '2px 5px';
                    div.style.backgroundColor = '#f8f8f8';
                    div.style.display = 'inline-block';
                    div.style.minWidth = '20px';
                    div.style.textAlign = 'center';
                    div.style.writingMode = 'horizontal-tb';
                    div.style.textOrientation = 'mixed';
                    div.style.gridColumnStart = 6;
                    div.style.gridRowStart = 7;
                    div.style.fontFamily = '標楷體, KaiTi, serif';

                    // 替換select元素
                    sixRelationSelect.parentNode.replaceChild(div, sixRelationSelect);
                }
            }
        }

        // 使用dom-to-image-more將容器轉換為圖片
        domtoimage.toJpeg(tempContainer, {
            quality: 0.95,
            bgcolor: 'white',
            style: {
                'transform': 'none'
            }
        }).then(dataUrl => {
            // 創建下載連結
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `卦象記錄_${record.dateKey}_${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 處理下一條記錄
            setTimeout(() => {
                processRecord(index + 1);
            }, 500); // 添加延遲以避免瀏覽器阻止多次下載
        }).catch(error => {
            console.error('生成圖片時發生錯誤:', error);
            alert(`生成圖片時發生錯誤: ${error.message}`);
            // 即使出錯也繼續處理下一條記錄
            setTimeout(() => {
                processRecord(index + 1);
            }, 500);
        });
    };

    // 開始處理第一條記錄
    processRecord(0);
}

/**
 * 刪除選中的記錄
 */
function deleteSelectedRecords() {
    const checkboxes = document.querySelectorAll('.record-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('請至少選擇一條記錄');
        return;
    }

    // 確認刪除
    if (!confirm(`確定要刪除選中的 ${checkboxes.length} 條記錄嗎？`)) {
        return;
    }

    // 從localStorage獲取記錄
    const records = JSON.parse(localStorage.getItem('guaRecords') || '{}');
    const recordIds = Array.from(checkboxes).map(cb => cb.dataset.id);

    // 遍歷所有日期，刪除選中的記錄
    let deletedCount = 0;
    Object.keys(records).forEach(dateKey => {
        const originalLength = records[dateKey].length;
        records[dateKey] = records[dateKey].filter(record => !recordIds.includes(record.id));
        deletedCount += originalLength - records[dateKey].length;

        // 如果該日期下沒有記錄了，刪除該日期鍵
        if (records[dateKey].length === 0) {
            delete records[dateKey];
        }
    });

    // 保存回localStorage
    localStorage.setItem('guaRecords', JSON.stringify(records));

    // 重新載入記錄
    loadHistoryRecords();

    // 顯示成功消息
    alert(`成功刪除 ${deletedCount} 條記錄`);
}

/**
 * 全選/取消全選
 */
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.record-checkbox');
    const selectAllBtn = document.getElementById('select-all-btn');

    // 檢查是否所有複選框都已選中
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    // 切換選中狀態
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });

    // 更新按鈕文字
    selectAllBtn.textContent = allChecked ? '全選' : '取消全選';
}
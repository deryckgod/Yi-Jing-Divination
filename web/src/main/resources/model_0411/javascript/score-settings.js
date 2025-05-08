// 算分邏輯設定介面功能

// 定義算分模塊
const scoreModules = [
    { id: 'threeHarmony', name: '三合', description: '計算三合分數' },
    { id: 'greedyLife', name: '貪生忘剋', description: '計算貪生忘剋分數' },
    { id: 'sixClash', name: '六沖', description: '計算六沖分數' },
    { id: 'tombExtinction', name: '入墓入絕', description: '計算動爻間入墓入絕分數' }
];

// 默認算分邏輯配置
const defaultLogicConfig = {
    name: '默認配置',
    modules: [...scoreModules]
};

// 獲取所有保存的算分邏輯配置
function getSavedLogicConfigs() {
    const savedConfigs = localStorage.getItem('scoreLogicConfigs');
    if (!savedConfigs) {
        // 如果沒有保存的配置，則創建默認配置
        const configs = [defaultLogicConfig];
        localStorage.setItem('scoreLogicConfigs', JSON.stringify(configs));
        return configs;
    }
    return JSON.parse(savedConfigs);
}

// 獲取當前選中的算分邏輯配置
function getCurrentLogicConfig() {
    const currentConfigId = localStorage.getItem('currentLogicConfigId');
    const configs = getSavedLogicConfigs();

    // 如果沒有當前配置ID或找不到對應配置，則使用第一個配置
    if (!currentConfigId || !configs.find(c => c.name === currentConfigId)) {
        localStorage.setItem('currentLogicConfigId', configs[0].name);
        return configs[0];
    }

    return configs.find(c => c.name === currentConfigId) || configs[0];
}

// 初始化設定介面
export function initScoreSettings() {
    // 添加設定按鈕
    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'settings-btn';
    settingsBtn.className = 'settings-btn';
    settingsBtn.innerHTML = '⚙️';
    document.body.appendChild(settingsBtn);

    // 創建設定視窗
    const settingsOverlay = document.createElement('div');
    settingsOverlay.className = 'settings-overlay';
    document.body.appendChild(settingsOverlay);

    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'settings-container';
    settingsContainer.innerHTML = `
        <div class="settings-header">
            <h2>算分邏輯設定</h2>
            <button class="settings-close-btn">X</button>
        </div>
        <div class="settings-content">
            <div class="logic-selector-container">
                <div class="logic-selector-header">
                    <select id="logic-config-select" class="logic-config-select"></select>
                    <div class="logic-buttons">
                        <button id="add-logic-btn" class="add-logic-btn">新增</button>
                        <button id="delete-logic-btn" class="delete-logic-btn">刪除</button>
                        <button id="reset-logic-btn" class="reset-logic-btn">重設</button>
                    </div>
                </div>
            </div>
            <div class="module-container">
                <p>拖拉下方模塊調整算分順序：</p>
                <ul class="module-list" id="module-list"></ul>
            </div>
        </div>
        <div class="settings-footer">
            <button class="settings-save-btn">保存設定</button>
        </div>
    `;
    document.body.appendChild(settingsContainer);

    // 載入模塊列表
    loadModuleList();

    // 添加事件監聽器
    settingsBtn.addEventListener('click', toggleSettings);
    settingsOverlay.addEventListener('click', toggleSettings);
    document.querySelector('.settings-close-btn').addEventListener('click', toggleSettings);
    document.querySelector('.settings-save-btn').addEventListener('click', saveSettings);

    // 添加算分邏輯管理相關事件監聽器
    document.getElementById('logic-config-select').addEventListener('change', handleLogicConfigChange);
    document.getElementById('add-logic-btn').addEventListener('click', addNewLogicConfig);
    document.getElementById('delete-logic-btn').addEventListener('click', deleteLogicConfig);
    document.getElementById('reset-logic-btn').addEventListener('click', resetLogicConfig);

    // 初始化拖拉功能
    initDragAndDrop();
}

// 載入模塊列表
function loadModuleList() {
    const moduleList = document.getElementById('module-list');
    moduleList.innerHTML = '';

    // 獲取當前選中的算分邏輯配置
    const currentConfig = getCurrentLogicConfig();
    const modules = currentConfig.modules;

    // 填充模塊列表
    modules.forEach(module => {
        const li = document.createElement('li');
        li.className = 'module-item';
        li.setAttribute('data-id', module.id);
        li.innerHTML = `
            <div class="module-handle">☰</div>
            <div class="module-name">${module.name}</div>
            <div class="module-description">${module.description}</div>
        `;
        moduleList.appendChild(li);
    });

    // 填充算分邏輯選單
    fillLogicConfigSelect();
}

// 填充算分邏輯選單
function fillLogicConfigSelect() {
    const selectElement = document.getElementById('logic-config-select');
    if (!selectElement) return;

    // 清空選單
    selectElement.innerHTML = '';

    // 獲取所有保存的算分邏輯配置
    const configs = getSavedLogicConfigs();
    const currentConfigId = localStorage.getItem('currentLogicConfigId') || configs[0].name;

    // 填充選單
    configs.forEach(config => {
        const option = document.createElement('option');
        option.value = config.name;
        option.textContent = config.name;
        option.selected = config.name === currentConfigId;
        selectElement.appendChild(option);
    });
}

// 初始化拖拉功能
function initDragAndDrop() {
    const moduleList = document.getElementById('module-list');
    let draggedItem = null;
    let isDragging = false;
    let initialMouseOffsetX = 0;
    let initialMouseOffsetY = 0;
    let currentY = 0; // Still needed for placeholder logic

    // 為每個模塊項添加拖拉事件
    document.querySelectorAll('.module-item').forEach(item => {
        // 鼠標按下事件 - 整個模塊項都可以拖拉
        item.addEventListener('mousedown', function (e) {
            e.preventDefault();
            draggedItem = item;
            isDragging = true;

            // 添加拖拉中的樣式
            draggedItem.classList.add('dragging');

            // 創建拖拉時的視覺效果
            const rect = draggedItem.getBoundingClientRect(); // Get original rect first
            // 保存鼠標在元素內的相對位置
            initialMouseOffsetX = e.clientX - rect.left;
            initialMouseOffsetY = e.clientY - rect.top;

            draggedItem.style.position = 'absolute'; // Set position to allow offsetParent calculation
            // 設置較高的z-index確保元素在最上層
            draggedItem.style.zIndex = '1010';       // Set z-index
            draggedItem.style.width = rect.width + 'px'; // Set width

            // Calculate position relative to offset parent
            const offsetParent = draggedItem.offsetParent || document.body;
            const offsetParentRect = offsetParent.getBoundingClientRect();
            draggedItem.style.left = (rect.left - offsetParentRect.left) + 'px';
            draggedItem.style.top = (rect.top - offsetParentRect.top) + 'px';
            draggedItem.style.cursor = 'grabbing';
            // 確保內容在拖拉時保持可見
            draggedItem.style.opacity = '1';
            draggedItem.style.backgroundColor = '#4CAF50';
            // 添加陰影效果增強視覺層次感
            draggedItem.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            // 確保所有子元素都可見
            Array.from(draggedItem.children).forEach(child => {
                child.style.visibility = 'visible';
                child.style.opacity = '1';
            });
            // 防止pointer-events被設為none
            draggedItem.style.pointerEvents = 'auto';

            // 創建佔位元素
            const placeholder = document.createElement('li');
            placeholder.className = 'module-item placeholder';
            placeholder.style.height = rect.height + 'px';
            placeholder.style.opacity = '0.3';
            moduleList.insertBefore(placeholder, draggedItem);
        });

        // 添加視覺提示，讓用戶知道整個模塊可以拖拉
        item.style.cursor = 'grab';
    });

    // 鼠標移動事件
    document.addEventListener('mousemove', function (e) {
        if (!isDragging || !draggedItem) return;

        e.preventDefault();
        currentY = e.clientY; // This is for placeholder logic, keep it.

        // 更新拖拉元素位置
        const offsetParent = draggedItem.offsetParent || document.body;
        const offsetParentRect = offsetParent.getBoundingClientRect();
        draggedItem.style.left = (e.clientX - initialMouseOffsetX - offsetParentRect.left) + 'px';
        draggedItem.style.top = (e.clientY - initialMouseOffsetY - offsetParentRect.top) + 'px';
        // startY = currentY; // No longer needed for this positioning method

        // 檢查是否需要重新排序
        const placeholder = document.querySelector('.placeholder');
        const items = Array.from(moduleList.querySelectorAll('.module-item:not(.dragging):not(.placeholder)'));

        const closestItem = items.reduce((closest, item) => {
            const box = item.getBoundingClientRect();
            const offset = currentY - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: item };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;

        if (closestItem) {
            moduleList.insertBefore(placeholder, closestItem);
        } else {
            moduleList.appendChild(placeholder);
        }
    });

    // 鼠標釋放事件
    document.addEventListener('mouseup', function () {
        if (!isDragging || !draggedItem) return;

        // 恢復拖拉元素的樣式
        draggedItem.style.position = '';
        draggedItem.style.zIndex = '';
        draggedItem.style.top = '';
        draggedItem.style.left = '';
        draggedItem.style.width = '';
        draggedItem.style.opacity = '';
        draggedItem.style.backgroundColor = '';
        draggedItem.style.cursor = '';
        draggedItem.style.boxShadow = '';
        draggedItem.style.pointerEvents = '';

        // 恢復子元素的樣式
        Array.from(draggedItem.children).forEach(child => {
            child.style.visibility = '';
            child.style.opacity = '';
        });

        draggedItem.classList.remove('dragging');

        // 將拖拉元素放置到佔位元素的位置
        const placeholder = document.querySelector('.placeholder');
        if (placeholder) {
            moduleList.insertBefore(draggedItem, placeholder);
            moduleList.removeChild(placeholder);
        }

        // 重置拖拉狀態
        isDragging = false;
        draggedItem = null;
    });
}

// 切換設定視窗顯示
function toggleSettings() {
    const settingsOverlay = document.querySelector('.settings-overlay');
    const settingsContainer = document.querySelector('.settings-container');

    if (settingsOverlay.style.display === 'block') {
        settingsOverlay.style.display = 'none';
        settingsContainer.style.display = 'none';
    } else {
        settingsOverlay.style.display = 'block';
        settingsContainer.style.display = 'flex';
        // 重新載入模塊列表
        loadModuleList();
        // 重新初始化拖拉功能
        initDragAndDrop();
    }
}

// 處理算分邏輯選單變更
function handleLogicConfigChange(event) {
    const selectedConfigName = event.target.value;
    localStorage.setItem('currentLogicConfigId', selectedConfigName);

    // 重新載入模塊列表
    loadModuleList();
    // 重新初始化拖拉功能
    initDragAndDrop();
}

// 添加新的算分邏輯配置
function addNewLogicConfig() {
    const configName = prompt('請輸入新算分邏輯配置名稱：');
    if (!configName) return;

    // 檢查名稱是否已存在
    const configs = getSavedLogicConfigs();
    if (configs.some(c => c.name === configName)) {
        alert('配置名稱已存在，請使用其他名稱');
        return;
    }

    // 獲取當前模塊順序
    const moduleItems = document.querySelectorAll('.module-item');
    const modules = [];

    moduleItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const module = scoreModules.find(m => m.id === id);
        if (module) {
            modules.push(module);
        }
    });

    // 創建新配置
    const newConfig = {
        name: configName,
        modules: modules
    };

    // 添加到配置列表
    configs.push(newConfig);
    localStorage.setItem('scoreLogicConfigs', JSON.stringify(configs));

    // 選中新配置
    localStorage.setItem('currentLogicConfigId', configName);

    // 重新載入模塊列表和選單
    loadModuleList();
    initDragAndDrop();

    alert('新算分邏輯配置已創建');
}

// 刪除當前選中的算分邏輯配置
function deleteLogicConfig() {
    const configs = getSavedLogicConfigs();
    if (configs.length <= 1) {
        alert('至少需要保留一個算分邏輯配置');
        return;
    }

    const currentConfigId = localStorage.getItem('currentLogicConfigId') || configs[0].name;
    const confirmDelete = confirm(`確定要刪除「${currentConfigId}」配置嗎？`);
    if (!confirmDelete) return;

    // 刪除配置
    const newConfigs = configs.filter(c => c.name !== currentConfigId);
    localStorage.setItem('scoreLogicConfigs', JSON.stringify(newConfigs));

    // 選中第一個配置
    localStorage.setItem('currentLogicConfigId', newConfigs[0].name);

    // 重新載入模塊列表和選單
    loadModuleList();
    initDragAndDrop();

    alert('算分邏輯配置已刪除');
}

// 重設當前選中的算分邏輯配置
function resetLogicConfig() {
    const confirmReset = confirm('確定要重設當前算分邏輯配置嗎？');
    if (!confirmReset) return;

    const currentConfigId = localStorage.getItem('currentLogicConfigId');
    const configs = getSavedLogicConfigs();
    const currentConfigIndex = configs.findIndex(c => c.name === currentConfigId);

    if (currentConfigIndex === -1) return;

    // 如果是默認配置，則重設為原始模塊順序
    if (currentConfigId === '默認配置') {
        configs[currentConfigIndex].modules = [...scoreModules];
    } else {
        // 否則重設為當前保存的順序
        const currentConfig = getCurrentLogicConfig();
        configs[currentConfigIndex].modules = [...currentConfig.modules];
    }

    localStorage.setItem('scoreLogicConfigs', JSON.stringify(configs));

    // 重新載入模塊列表
    loadModuleList();
    initDragAndDrop();

    alert('算分邏輯配置已重設');
}

// 保存設定
function saveSettings() {
    const moduleItems = document.querySelectorAll('.module-item');
    const newOrder = [];

    moduleItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const module = scoreModules.find(m => m.id === id);
        if (module) {
            newOrder.push(module);
        }
    });

    // 更新當前選中的算分邏輯配置
    const currentConfigId = localStorage.getItem('currentLogicConfigId');
    const configs = getSavedLogicConfigs();
    const currentConfigIndex = configs.findIndex(c => c.name === currentConfigId);

    if (currentConfigIndex !== -1) {
        configs[currentConfigIndex].modules = newOrder;
        localStorage.setItem('scoreLogicConfigs', JSON.stringify(configs));
    }

    // 更新計算順序
    updateCalculationOrder(newOrder);

    // 關閉設定視窗
    toggleSettings();

    // 顯示保存成功提示
    alert('設定已保存');
}

// 更新計算順序
function updateCalculationOrder(moduleOrder) {
    // 如果沒有提供模塊順序，則從當前配置獲取
    if (!moduleOrder) {
        const currentConfig = getCurrentLogicConfig();
        moduleOrder = currentConfig.modules;
    }

    // 將模塊ID映射到對應的函數名稱
    const moduleFunctions = {
        'threeHarmony': ['calculateDaySunThreeHarmony', 'calculateStraightThreeHarmony', 'calculateTriangleThreeHarmony'],
        'greedyLife': ['calculateGreedyLifeScore'],
        'sixClash': ['calculateSixClashScore'],
        'tombExtinction': ['mainGodtoTombExtinctionScore', 'calculateTombExtinctionScore']
    };

    // 創建一個自定義事件，傳遞新的計算順序
    const event = new CustomEvent('scoreOrderChanged', {
        detail: {
            moduleOrder: moduleOrder.map(m => m.id),
            functionOrder: moduleOrder.flatMap(m => moduleFunctions[m.id] || [])
        }
    });

    // 觸發事件
    document.dispatchEvent(event);
}
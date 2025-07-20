/**
 * 金鑰驗證功能
 */

// 初始化金鑰驗證界面
function initLicenseKeyUI() {
    // 創建金鑰按鈕
    const licenseKeyBtn = document.createElement('button');
    licenseKeyBtn.id = 'license-key-btn';
    licenseKeyBtn.className = 'license-key-btn';
    licenseKeyBtn.innerHTML = '🔑';
    document.body.appendChild(licenseKeyBtn);

    // 創建遮罩層
    const licenseKeyOverlay = document.createElement('div');
    licenseKeyOverlay.className = 'license-key-overlay';
    document.body.appendChild(licenseKeyOverlay);

    // 創建金鑰容器
    const licenseKeyContainer = document.createElement('div');
    licenseKeyContainer.className = 'license-key-container';
    licenseKeyContainer.innerHTML = `
        <div class="license-key-header">
            <h2>金鑰驗證</h2>
            <button class="license-key-close-btn">X</button>
        </div>
        <div class="license-key-content">
            <div class="license-key-input-group">
                <label for="license-key-input">請輸入金鑰：</label>
                <input type="text" id="license-key-input" class="license-key-input" placeholder="請輸入您的授權金鑰">
            </div>
            <button id="license-key-verify-btn" class="license-key-verify-btn">驗證金鑰</button>
            <div id="license-key-status" class="license-key-status"></div>
            <div id="license-key-info" class="license-key-info" style="display: none;">
                <p>金鑰狀態：<span id="license-key-status-text"></span></p>
                <p>剩餘使用次數：<span id="license-key-remaining-uses" class="remaining-uses"></span></p>
            </div>
        </div>
    `;
    document.body.appendChild(licenseKeyContainer);

    // 添加事件監聽器
    licenseKeyBtn.addEventListener('click', toggleLicenseKeyUI);
    licenseKeyOverlay.addEventListener('click', toggleLicenseKeyUI);
    document.querySelector('.license-key-close-btn').addEventListener('click', toggleLicenseKeyUI);
    document.getElementById('license-key-verify-btn').addEventListener('click', verifyLicenseKey);
    document.getElementById('license-key-input').addEventListener('input', function() {
        // 重置狀態顯示
        document.getElementById('license-key-status').className = 'license-key-status';
        document.getElementById('license-key-status').style.display = 'none';
        document.getElementById('license-key-info').style.display = 'none';
    });

    // 檢查本地存儲中是否有有效的金鑰
    checkStoredLicenseKey();
}

// 切換金鑰驗證界面顯示/隱藏
function toggleLicenseKeyUI() {
    const licenseKeyOverlay = document.querySelector('.license-key-overlay');
    const licenseKeyContainer = document.querySelector('.license-key-container');
    
    licenseKeyOverlay.classList.toggle('visible');
    licenseKeyContainer.classList.toggle('visible');
    
    // 如果是顯示界面，則聚焦到輸入框
    if (licenseKeyContainer.classList.contains('visible')) {
        document.getElementById('license-key-input').focus();
    }
}

// 驗證金鑰
async function verifyLicenseKey() {
    const licenseKeyInput = document.getElementById('license-key-input');
    const licenseKey = licenseKeyInput.value.trim();
    const statusElement = document.getElementById('license-key-status');
    const infoElement = document.getElementById('license-key-info');
    const verifyButton = document.getElementById('license-key-verify-btn');
    
    // 檢查金鑰是否為空
    if (!licenseKey) {
        statusElement.textContent = '請輸入金鑰';
        statusElement.className = 'license-key-status error';
        statusElement.style.display = 'block';
        return;
    }
    
    // 禁用按鈕，防止重複提交
    verifyButton.disabled = true;
    verifyButton.textContent = '驗證中...';
    
    try {
        // 發送請求到後端驗證金鑰
        const response = await fetch('http://localhost:3000/api/verify-license-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ licenseKey })
        });
        
        const data = await response.json();
        
        // 更新狀態顯示
        if (data.valid) {
            statusElement.textContent = '金鑰驗證成功！';
            statusElement.className = 'license-key-status success';
            
            // 顯示金鑰信息
            document.getElementById('license-key-status-text').textContent = '有效';
            document.getElementById('license-key-remaining-uses').textContent = data.remainingUses;
            infoElement.style.display = 'block';
            
            // 將金鑰保存到本地存儲
            localStorage.setItem('licenseKey', licenseKey);
            localStorage.setItem('licenseKeyExpiry', Date.now() + (24 * 60 * 60 * 1000)); // 24小時有效期
        } else {
            statusElement.textContent = data.message || '金鑰無效';
            statusElement.className = 'license-key-status error';
            infoElement.style.display = 'none';
            
            // 清除本地存儲中的金鑰
            localStorage.removeItem('licenseKey');
            localStorage.removeItem('licenseKeyExpiry');
        }
    } catch (error) {
        console.error('驗證金鑰時發生錯誤:', error);
        statusElement.textContent = '驗證過程中發生錯誤，請稍後再試';
        statusElement.className = 'license-key-status error';
        infoElement.style.display = 'none';
    } finally {
        // 恢復按鈕狀態
        verifyButton.disabled = false;
        verifyButton.textContent = '驗證金鑰';
        statusElement.style.display = 'block';
    }
}

// 檢查本地存儲中是否有有效的金鑰
async function checkStoredLicenseKey() {
    const storedKey = localStorage.getItem('licenseKey');
    const expiryTime = localStorage.getItem('licenseKeyExpiry');
    
    // 如果有存儲的金鑰且未過期，則自動驗證
    if (storedKey && expiryTime && Date.now() < parseInt(expiryTime)) {
        document.getElementById('license-key-input').value = storedKey;
        await verifyLicenseKey();
    }
}

// 導出函數
export { initLicenseKeyUI };
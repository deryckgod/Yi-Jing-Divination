/**
 * 金鑰管理模塊
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 金鑰數據文件路徑
const LICENSE_KEYS_FILE = path.join(__dirname, 'data', 'license-keys.json');

// 確保數據目錄存在
function ensureDataDirectoryExists() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// 讀取金鑰數據
function readLicenseKeys() {
    ensureDataDirectoryExists();
    
    if (!fs.existsSync(LICENSE_KEYS_FILE)) {
        // 如果文件不存在，創建一個空的金鑰數據文件
        fs.writeFileSync(LICENSE_KEYS_FILE, JSON.stringify({}), 'utf8');
        return {};
    }
    
    try {
        const data = fs.readFileSync(LICENSE_KEYS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('讀取金鑰數據時發生錯誤:', error);
        return {};
    }
}

// 保存金鑰數據
function saveLicenseKeys(licenseKeys) {
    ensureDataDirectoryExists();
    
    try {
        fs.writeFileSync(LICENSE_KEYS_FILE, JSON.stringify(licenseKeys, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('保存金鑰數據時發生錯誤:', error);
        return false;
    }
}

// 生成新的金鑰
function generateLicenseKey(maxUses = 10) {
    // 生成一個隨機的金鑰
    const licenseKey = crypto.randomBytes(16).toString('hex');
    
    // 讀取現有的金鑰數據
    const licenseKeys = readLicenseKeys();
    
    // 添加新的金鑰
    licenseKeys[licenseKey] = {
        createdAt: new Date().toISOString(),
        maxUses: maxUses,
        usedCount: 0,
        active: true
    };
    
    // 保存更新後的金鑰數據
    saveLicenseKeys(licenseKeys);
    
    return licenseKey;
}

// 驗證金鑰
function verifyLicenseKey(licenseKey) {
    // 讀取金鑰數據
    const licenseKeys = readLicenseKeys();
    
    // 檢查金鑰是否存在
    if (!licenseKeys[licenseKey]) {
        return {
            valid: false,
            message: '無效的金鑰'
        };
    }
    
    const keyData = licenseKeys[licenseKey];
    
    // 檢查金鑰是否已停用
    if (!keyData.active) {
        return {
            valid: false,
            message: '此金鑰已被停用'
        };
    }
    
    // 檢查金鑰是否已用完
    if (keyData.usedCount >= keyData.maxUses) {
        return {
            valid: false,
            message: '此金鑰已達到最大使用次數'
        };
    }
    
    // 增加使用次數
    keyData.usedCount += 1;
    keyData.lastUsedAt = new Date().toISOString();
    
    // 如果達到最大使用次數，標記為不活躍
    if (keyData.usedCount >= keyData.maxUses) {
        keyData.active = false;
    }
    
    // 保存更新後的金鑰數據
    saveLicenseKeys(licenseKeys);
    
    return {
        valid: true,
        remainingUses: keyData.maxUses - keyData.usedCount
    };
}

// 停用金鑰
function deactivateLicenseKey(licenseKey) {
    // 讀取金鑰數據
    const licenseKeys = readLicenseKeys();
    
    // 檢查金鑰是否存在
    if (!licenseKeys[licenseKey]) {
        return false;
    }
    
    // 停用金鑰
    licenseKeys[licenseKey].active = false;
    
    // 保存更新後的金鑰數據
    return saveLicenseKeys(licenseKeys);
}

// 獲取所有金鑰
function getAllLicenseKeys() {
    return readLicenseKeys();
}

// 重置金鑰使用次數
function resetLicenseKeyUsage(licenseKey) {
    // 讀取金鑰數據
    const licenseKeys = readLicenseKeys();
    
    // 檢查金鑰是否存在
    if (!licenseKeys[licenseKey]) {
        return false;
    }
    
    // 重置使用次數
    licenseKeys[licenseKey].usedCount = 0;
    licenseKeys[licenseKey].active = true;
    
    // 保存更新後的金鑰數據
    return saveLicenseKeys(licenseKeys);
}

module.exports = {
    generateLicenseKey,
    verifyLicenseKey,
    deactivateLicenseKey,
    getAllLicenseKeys,
    resetLicenseKeyUsage
};
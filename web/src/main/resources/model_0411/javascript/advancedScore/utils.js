// 引入常量
import {
    trigramMap,
    sixtyFourGuaMap,
    NaJiaDiZhi,
    EightTrigramsFiveElements,
    FiveElementsCycle,
    EarthlyBranchClash,
    EarthlyBranchTomb,
    EarthlyBranchExtinction,
    earthlyBranchToElement,
    dizhiGroups,
    markupStyle,
    yaoClasses,
    godScores,
    zhiList
} from '../yijing-constants.js';
/**
 * 將六親關係轉換為神類型（用神、原神、忌神、仇神、閒神）
 * @param {string} relation - 六親關係（子、父、兄、官、財）
 * @returns {string} - 返回對應的神類型
 */
export function convertRelationToGodType(relation) {
    // 獲取各個神類型對應的六親
    const yongShen = document.querySelector('.div28').querySelector('.six-relation-select').value; // 用神
    const yuanShen = document.querySelector('.div29').querySelector('.six-relation-item-upper').textContent; // 原神
    const jiShen = document.querySelector('.div30').querySelector('.six-relation-item-upper').textContent;   // 忌神
    const chouShen = document.querySelector('.div31').querySelector('.six-relation-item-upper').textContent; // 仇神
    const xianShen = document.querySelector('.div32').querySelector('.six-relation-item-upper').textContent; // 閒神

    // 將六親關係轉換為對應的神類型
    if (relation === yongShen) {
        return '用神';
    } else if (relation === yuanShen) {
        return '原神';
    } else if (relation === jiShen) {
        return '忌神';
    } else if (relation === chouShen) {
        return '仇神';
    } else if (relation === xianShen) {
        return '閒神';
    }

    // 如果沒有匹配到任何神類型，返回原六親關係
    return relation;
}

/**
 * 檢查動爻分數是否達到原六親對應神分數的40%
 * @param {number} currentScore - 當前動爻分數
 * @param {string} relation - 六親關係 (用神、原神、忌神、仇神、閒神)
 * @returns {boolean} - 返回是否達到40%閾值
 */
export function isScoreAboveThreshold(currentScore, relation) {
    // 獲取原始分數 (根據六親關係)
    const originalScore = godScores[relation] || 0;

    // 計算40%閾值
    const threshold = originalScore * 0.4;

    // 根據原始分數的正負性質進行不同的比較
    if (originalScore > 0) {
        // 原分數為正，當前分數需大於等於原分數的40%
        return originalScore >= currentScore && currentScore >= threshold;
    } else if (originalScore < 0) {
        // 原分數為負，當前分數需小於等於原分數的40%
        return originalScore <= currentScore && currentScore <= threshold;
    }

    return false; // 原分數為0，可能為三合、貪生忘剋，不進行判斷
}

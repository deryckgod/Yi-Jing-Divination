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

import {
    mainGodtoTombExtinctionScore
} from './tombExtinctionScore.js';

import {
    convertRelationToGodType,
    isScoreAboveThreshold
} from './utils.js';
/**
 * 計算動爻的動化分數
 * @param {string} originalDizhi - 原爻地支
 * @param {string} changeDizhi - 變爻地支
 * @param {number} index - 爻的索引 (0-5)
 * @param {string} relation - 六親關係 (用神、原神、忌神、仇神、閒神)
 * @param {boolean} isKongWang - 是否空亡
 * @param {boolean} isClash - 是否日沖
 * @returns {object} - 返回動化類型和分數
 */
export function calculateTransformationScore(originalDizhi, changeDizhi, index, relation, isKongWang, isClash) {
    // 獲取爻位顯示元素
    const yaoDiv = document.querySelector(`.${yaoClasses[index]}`);
    let yaoInfo = yaoDiv.textContent || '';
    let score = 0.0;
    let transformationType = '';
    let scoreMultiplier = 1;

    // 獲取基本分數 (根據六親關係)
    if (relation) {
        score = godScores[relation] || 0;
    }

    // 空亡地支
    const kongWangText = document.querySelector('.div16').textContent;
    const kongWangDizhi = kongWangText.split('');

    // 判斷變爻地支是否空亡
    const isChangeKongWang = changeDizhi && kongWangDizhi.includes(changeDizhi);

    // 判斷原爻和變爻地支的五行
    const originalElement = originalDizhi ? earthlyBranchToElement[originalDizhi] : null;
    const changeElement = changeDizhi ? earthlyBranchToElement[changeDizhi] : null;


    // 判斷動化類型
    if (originalDizhi === changeDizhi) {
        // 1. 伏吟
        transformationType = '伏吟';
        scoreMultiplier = 1; // 分數*100%
    } else if (originalElement === changeElement) {
        // 判斷是化進神還是化退神
        const originalIndex = zhiList.indexOf(originalDizhi);
        const changeIndex = zhiList.indexOf(changeDizhi);

        // 計算順序 (考慮循環)
        let isForward = false;
        if (changeIndex > originalIndex) {
            isForward = (changeIndex - originalIndex) <= 6;
        } else {
            isForward = (originalIndex - changeIndex) >= 6;
        }

        if (isForward) {
            // 2. 化進神
            transformationType = '化進神';
            scoreMultiplier = 1; // 分數*100%
        } else {
            // 3. 化退神
            transformationType = '化退神';
            scoreMultiplier = 0.9; // 分數*90%
        }
    } else {
        // 判斷五行生剋關係
        if (originalElement && changeElement) {
            if (originalElement === '金' && changeElement === '水' ||
                originalElement === '水' && changeElement === '木' ||
                originalElement === '木' && changeElement === '火' ||
                originalElement === '火' && changeElement === '土' ||
                originalElement === '土' && changeElement === '金') {
                // 4. 化洩
                transformationType = '化洩';
                if (relation === '原神') {
                    transformationType = '化用神';
                }
                scoreMultiplier = 1;
            } else if (originalElement === '金' && changeElement === '木' ||
                originalElement === '木' && changeElement === '土' ||
                originalElement === '土' && changeElement === '水' ||
                originalElement === '水' && changeElement === '火' ||
                originalElement === '火' && changeElement === '金') {
                // 5. 化制
                transformationType = '化制';
                scoreMultiplier = 1;
            } else if (changeElement === '金' && originalElement === '水' ||
                changeElement === '水' && originalElement === '木' ||
                changeElement === '木' && originalElement === '火' ||
                changeElement === '火' && originalElement === '土' ||
                changeElement === '土' && originalElement === '金') {
                // 6. 回頭生
                transformationType = '回頭生';
                scoreMultiplier = 1; // 分數*100%
            } else if (changeElement === '金' && originalElement === '木' ||
                changeElement === '木' && originalElement === '土' ||
                changeElement === '土' && originalElement === '水' ||
                changeElement === '水' && originalElement === '火' ||
                changeElement === '火' && originalElement === '金') {
                // 7. 回頭剋
                transformationType = '回頭剋';
                scoreMultiplier = 0.1; // 分數*10%

                // 例外情況：用神的六親如果是回頭剋且原爻不空亡，則分數直接為-15，因可能"沖散"，故沒與化空、空化空一起寫
                // if (relation === '用神' && !isKongWang) {
                //     score = -15;
                //     scoreMultiplier = 1;
                // }
            }
        }
    }

    if (isKongWang && isChangeKongWang) {
        // 8. 空化空
        transformationType = '空化空';
        scoreMultiplier = 0.01; // 分數*1%
    } else if (isChangeKongWang) {
        // 9. 化空
        transformationType = '化空';
        scoreMultiplier = 0.1; // 分數*10%
    }

    // 處理日沖情況
    if (isClash && !isKongWang && !isChangeKongWang && !(transformationType === '化空' || transformationType === '空化空')) {
        // 11. 沖散
        transformationType += ' 沖散';
        scoreMultiplier *= 0.1; // 分數再乘10%
    } else if (isClash && isKongWang && !(transformationType === '化空' || transformationType === '空化空')) {
        // 12. 沖實
        transformationType += ' 沖實';
        scoreMultiplier *= 0.9; // 分數再乘90%
    } else if (isKongWang && !(transformationType === '化空' || transformationType === '空化空')) {
        // 10. 空動
        transformationType = '空動';
        scoreMultiplier = 0.1; // 分數*10%
    }

    // 例外情況：用神的六親如果是化空或空化空，則分數直接為-15
    if (relation === '用神' && (transformationType === '化空' || transformationType === '空化空' || transformationType.includes('回頭剋'))) {
        score = -15;
        scoreMultiplier = 1;
        if (transformationType.includes('回頭剋') && (transformationType.includes('沖實') || transformationType.includes('沖散'))) {
            transformationType += ' 用神只計回頭剋';
        }
    }

    // 獲取日辰地支
    const dayBranch = document.querySelector('.div12').textContent.slice(-1);

    // 情況1: 最後檢查如果用神是動爻且入日墓絕 動化分數直接為-15
    if (relation === '用神' && originalDizhi) {
        const { isTomb, isExtinction } = checkTombExtinction(originalDizhi, dayBranch);
        if (isTomb || isExtinction) {
            score = -15;
            scoreMultiplier = 1;
            transformationType = isTomb ? ' 入日墓' : ' 入日絕';
        }
    } else if (relation != '用神' && originalDizhi &&
        !(transformationType.includes("回頭剋") || transformationType.includes("沖散") || transformationType.includes("空"))) {
        const { isTomb, isExtinction } = checkTombExtinction(originalDizhi, dayBranch);
        if (isTomb || isExtinction) {
            scoreMultiplier *= 0.1;
            transformationType += isTomb ? ' 入日墓' : ' 入日絕';
        }
    }

    // 化洩、化制 加減分
    if (transformationType.includes('化洩')) {
        score = score > 0 ? score - 2 : score + 2; // 正負號放外面，裡面數字-2
    } else if (transformationType.includes('化制')) {
        score = score > 0 ? score - 3 : score + 3; // 正負號放外面，裡面數字-3
    }

    // 計算最終分數
    const finalScore = parseFloat((score * scoreMultiplier).toFixed(2));

    // 更新爻位顯示
    if (transformationType) {
        let displayText = `${relation} ${transformationType} ${finalScore}`;
        if (!yaoInfo.includes(displayText) && !yaoInfo.includes('被用神入')) {
            yaoDiv.textContent = yaoInfo ? `${yaoInfo} ${displayText} ` : displayText;
        }
    }
    return { type: transformationType, score: finalScore };
}

/**
 * 計算靜爻的暗動分數
 * @param {string} originalDizhi - 原爻地支
 * @param {number} index - 爻的索引 (0-5)
 * @param {string} relation - 六親關係
 * @returns {object} - 返回動化類型和分數
 */
export function calculateHiddenTransformation(originalDizhi, index, relation) {
    // 獲取爻位顯示元素
    const yaoDiv = document.querySelector(`.${yaoClasses[index]} `);
    let yaoInfo = yaoDiv.textContent || '';
    let score = 0.0;
    let transformationType = '';
    let scoreMultiplier = 1;

    // 獲取基本分數 (根據六親關係)
    if (relation) {
        score = godScores[relation] || 0;
    }

    // 獲取日沖地支
    const dayClashBranch = document.querySelector('.div15').textContent;
    const isClash = originalDizhi === dayClashBranch;

    // 獲取空亡地支
    const kongWangText = document.querySelector('.div16').textContent;
    const kongWangDizhi = kongWangText.split('');
    const isKongWang = kongWangDizhi.includes(originalDizhi);

    // 判斷暗動類型
    if (isClash && isKongWang) {
        // 2. 空暗動
        transformationType = '空暗動';
        scoreMultiplier = 0.02; // 分數*2%
    } else if (isClash) {
        // 1. 暗動
        transformationType = '暗動';
        scoreMultiplier = 0.2; // 分數*20%
    }

    // 計算最終分數
    const finalScore = parseFloat((score * scoreMultiplier).toFixed(2));

    // 更新爻位顯示
    if (transformationType) {
        let displayText = `${relation} ${transformationType} ${finalScore}`;
        if (!yaoInfo.includes(displayText)) {
            yaoDiv.textContent = yaoInfo ? `${yaoInfo} ${displayText} ` : displayText;
        }
    }

    return { type: transformationType, score: finalScore };
}

/**
 * 檢查地支是否入墓或入絕
 * @param {string} dizhi - 地支
 * @param {string} targetDizhi - 目標地支（日辰或其他動爻地支）
 * @returns {object} - 返回是否入墓或入絕
 */
export function checkTombExtinction(dizhi, targetDizhi) {
    const isTomb = EarthlyBranchTomb[dizhi] === targetDizhi;
    const isExtinction = EarthlyBranchExtinction[dizhi] === targetDizhi;
    return { isTomb, isExtinction };
}

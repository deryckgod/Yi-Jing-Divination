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
    convertRelationToGodType,
    isScoreAboveThreshold
} from './utils.js';

import {
    checkTombExtinction
} from './transformationScore.js';

import { checkSixClashRelation } from './sixClashScore.js';
/**
 * 計算所有動爻的入墓入絕情況
 * 此函數將在calculateSixClashScore和updateSunScore之間被調用
 */
export function calculateTombExtinctionScore() {
    // 獲取所有動爻
    const movingYaos = [];
    const originalYao = document.querySelectorAll('.original-yao');

    originalYao.forEach(yao => {
        const yaoValue = yao.value;
        if (yaoValue === 'O' || yaoValue === 'X') {
            const yaoIndex = 71 - parseInt(Array.from(yao.classList).find(cls => cls.startsWith('div')).substring(3));
            const dizhiDiv = document.querySelector(`.div${59 - yaoIndex}`);
            const dizhi = dizhiDiv.textContent.charAt(0);
            const relationDiv = document.querySelector(`.div${53 - yaoIndex}`);
            const relation = relationDiv.textContent.charAt(0);

            // 獲取六親關係
            const godType = convertRelationToGodType(relation);

            // 獲取動爻分數
            const yaoDiv = document.querySelector(`.${yaoClasses[yaoIndex]}`);
            const yaoInfo = yaoDiv.textContent || '';
            const scoreMatch = yaoInfo.match(/[-+]?\d+(\.\d+)?$/);
            const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;

            // 檢查分數是否達到閾值
            if (isScoreAboveThreshold(score, godType)) {
                movingYaos.push({
                    index: yaoIndex,
                    dizhi,
                    relation: godType,
                    score
                });
            }
        }
    });

    // 如果沒有動爻，直接返回
    if (movingYaos.length === 0) {
        return;
    }

    // 檢查每個動爻的入墓入絕情況
    movingYaos.forEach(yao => {
        // 檢查動爻是否入墓入絕
        const originalDizhi = yao.dizhi;
        const index = yao.index;
        const relation = yao.relation;

        // 獲取爻位顯示元素
        const yaoDiv = document.querySelector(`.${yaoClasses[index]}`);
        let yaoInfo = yaoDiv.textContent || '';
        // 獲取當前爻動化分數 
        let score = yao.score;

        // 檢查入墓入絕情況
        const { scoreMultiplier, transformationType } = checkYaotoTombExtinction(originalDizhi, index, relation, '', score);

        // 如果有入墓入絕情況，更新顯示
        if (transformationType) {

            // 計算最終分數
            const finalScore = parseFloat((score * scoreMultiplier).toFixed(2));

            // 更新爻位顯示
            let displayText = `${relation}${transformationType} ${finalScore}`;
            if (!yaoInfo.includes(displayText)) {
                yaoDiv.textContent = displayText;
            }
        }
    });
}


/**
 * 檢查動爻間入墓絕情況並計算分數調整
 * @param {string} originalDizhi - 原爻地支
 * @param {number} index - 爻的索引 (0-5)
 * @param {string} relation - 六親關係 (用神、原神、忌神、仇神、閒神)
 * @returns {object} - 返回是否入墓或入絕、分數調整倍數和類型描述
 */
export function checkYaotoTombExtinction(originalDizhi, index, relation, transformationTypeOrigin, originScore) {
    let scoreMultiplier = 1;
    let transformationType = '';
    // 情況2: 動爻間入墓絕
    // 檢查非用神六親的原爻地支是否入日辰墓絕或其他動爻地支的墓絕
    if (relation !== '用神' && originalDizhi &&
        !(transformationTypeOrigin.includes("回頭剋") || transformationTypeOrigin.includes("沖散") || transformationTypeOrigin.includes("空"))) {
        // 檢查是否入其他動爻地支的墓絕
        let isTombOther = false;
        let isExtinctionOther = false;

        // 檢查特殊的六沖關係（寅申、巳亥）
        let isSpecialClash = false;
        const movingYaos = [];
        // 原爻狀態(給特殊情況用)
        movingYaos.push({
            index: index,
            dizhi: originalDizhi,
            score: originScore
        });

        // 獲取所有動爻地支
        const originalYao = document.querySelectorAll('.original-yao');
        originalYao.forEach(yao => {
            const yaoValue = yao.value;
            if (yaoValue === 'O' || yaoValue === 'X') {
                const yaoIndex = 71 - parseInt(Array.from(yao.classList).find(cls => cls.startsWith('div')).substring(3));
                if (yaoIndex !== index) { // 不是當前爻
                    const otherYaoDizhi = document.querySelector(`.div${59 - yaoIndex}`).textContent.charAt(0);
                    const otherYaoRelation = convertRelationToGodType(document.querySelector(`.div${53 - yaoIndex}`).textContent.charAt(0));

                    // 獲取非用神動爻的分數
                    const otherYaoDiv = document.querySelector(`.${yaoClasses[yaoIndex]}`);
                    const otherYaoInfo = otherYaoDiv.textContent || '';
                    const scoreMatch = otherYaoInfo.match(/[-+]?\d+(\.\d+)?$/);
                    const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;

                    // 檢查分數是否達到閾值，只有達到閾值的動爻才會影響用神
                    if (isScoreAboveThreshold(score, otherYaoRelation) && !otherYaoInfo.includes("三合") && !otherYaoInfo.includes("貪生")) {

                        const { isTomb, isExtinction } = checkTombExtinction(originalDizhi, otherYaoDizhi);
                        // 迴圈檢查全部可能會入墓絕的爻
                        isTombOther = isTombOther || isTomb;
                        isExtinctionOther = isExtinctionOther || isExtinction;
                        // 檢查是否是特殊的六沖關係（寅申、巳亥）
                        if ((originalDizhi === '寅' && otherYaoDizhi === '申') || (originalDizhi === '申' && otherYaoDizhi === '寅') ||
                            (originalDizhi === '巳' && otherYaoDizhi === '亥') || (originalDizhi === '亥' && otherYaoDizhi === '巳')) {
                            movingYaos.push({
                                index: yaoIndex,
                                dizhi: otherYaoDizhi,
                                score: score
                            });
                            const yao1 = movingYaos[0];
                            const yao2 = movingYaos[1];
                            console.log(movingYaos);
                            console.log('檢查特殊的六沖關係（寅申、巳亥）', yao1, yao2);
                            // 檢查是否有六沖關係
                            checkSixClashRelation(yao1, yao2);
                            isSpecialClash = true;
                        }
                    }
                }
            }
        });

        // 如果不是 特殊六沖 且 非用神六親的原爻地支入日辰墓絕或其他動爻地支的墓絕 非用神六親的動化分數要乘10%
        if (!isSpecialClash && (isTombOther || isExtinctionOther)) {
            scoreMultiplier *= 0.1;
            transformationType += isTombOther ? ' 入墓' : ' 入絕';
        }

    }

    return { scoreMultiplier, transformationType };
}


// 情況3: 用神入非用神動爻墓絕
// 檢查用神地支是否入非用神六親的動爻墓絕
// 修改其他爻的分數內容，非當前INDEX動化分數
export function mainGodtoTombExtinctionScore(index, movingFlag) {

    // 獲取日辰地支
    const dayBranch = document.querySelector('.div12').textContent.slice(-1);

    const mainGodElement = document.querySelector('.mainGodInfo').textContent.slice(0, 1);
    const { isTomb, isExtinction } = checkTombExtinction(mainGodElement, dayBranch);
    if (movingFlag && (isTomb || isExtinction)) {
        return; // 直接返回，不再繼續執行下面的程式碼，避免重複計算和報錯
    }

    // 獲取所有非用神的動爻
    const changingYaos = document.querySelectorAll('.original-yao');
    changingYaos.forEach(yao => {
        const yaoValue = yao.value;
        if (yaoValue === 'O' || yaoValue === 'X') {
            const yaoIndex = 71 - parseInt(Array.from(yao.classList).find(cls => cls.startsWith('div')).substring(3));
            if (yaoIndex !== index) { // 不是當前爻
                const otherYaoRelation = convertRelationToGodType(document.querySelector(`.div${53 - yaoIndex}`).textContent.charAt(0));

                // 如果不是用神六親
                if (otherYaoRelation !== '用神') {
                    const otherYaoDizhi = document.querySelector(`.div${59 - yaoIndex}`).textContent.charAt(0);
                    const { isTomb, isExtinction } = checkTombExtinction(mainGodElement, otherYaoDizhi);

                    // 如果用神地支入非用神六親的動爻墓絕
                    if (isTomb || isExtinction) {
                        // 非用神六親動化分數直接為-15
                        const nonMainGodYaoDiv = document.querySelector(`.${yaoClasses[yaoIndex]}`);
                        let nonMainGodYaoInfo = nonMainGodYaoDiv.textContent || '';

                        const scoreMatch = nonMainGodYaoInfo.match(/[-+]?\d+(\.\d+)?$/);
                        const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;
                        if (isScoreAboveThreshold(score, otherYaoRelation)) {
                            let displayText = isTomb ? `${otherYaoRelation} 被用神入墓 -15` : `${otherYaoRelation} 被用神入絕 -15`;
                            if (!nonMainGodYaoInfo.includes(displayText)) {
                                nonMainGodYaoDiv.textContent = displayText;
                            }
                        }

                    }
                }
            }
        }
    });

}
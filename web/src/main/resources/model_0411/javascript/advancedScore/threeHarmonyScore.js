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
    zhiList,
    harmonyGroups,
    generatingElements,
    restrainingElements,
    yaoNameClasses
} from '../yijing-constants.js';

import { isScoreAboveThreshold } from './transformationScore.js';

import {
    convertRelationToGodType
} from './utils.js';
/**
 * 檢查三個地支是否構成三合
 * @param {string[]} branches - 三個地支
 * @returns {object} - 返回是否構成三合及對應的五行
 */
function checkThreeHarmony(branches) {
    // 排序地支以便比較
    const sortedBranches = [...branches].sort();

    // 檢查是否匹配任何一組三合
    for (const group of harmonyGroups) {
        const sortedGroup = [...group.branches].sort();
        if (JSON.stringify(sortedBranches) === JSON.stringify(sortedGroup)) {
            return { isHarmony: true, element: group.element };
        }
    }

    return { isHarmony: false, element: null };
}

/**
 * 檢查兩個動爻之間不能有動爻且至少隔一個靜爻
 * @param {number[]} movingYaoIndices - 動爻索引數組
 * @returns {boolean} - 返回是否符合條件：兩個動爻之間不能有動爻且至少隔一個靜爻
 */
function hasStaticYaoBetween(movingYaoIndices) {
    // 排序動爻索引
    const sortedIndices = [...movingYaoIndices].sort((a, b) => a - b);

    // 只檢查排序後相鄰的動爻對之間的條件
    for (let i = 0; i < sortedIndices.length - 1; i++) {
        const current = sortedIndices[i];
        const next = sortedIndices[i + 1];

        // 檢查兩個動爻之間是否至少隔一個位置
        if (next - current <= 1) {
            return false; // 相鄰動爻，不符合條件
        }

        // 檢查兩個動爻之間是否有其他動爻
        let hasOtherMovingYao = false;
        for (let pos = current + 1; pos < next; pos++) {
            // 檢查此位置是否是動爻
            const originalYaoElement = document.querySelector(`.div${71 - pos}.original-yao`);
            if (originalYaoElement && (originalYaoElement.value === 'O' || originalYaoElement.value === 'X')) {
                hasOtherMovingYao = true;
                break;
            }
        }

        if (hasOtherMovingYao) {
            console.log('two moving yao between one moving yao');
            return false; // 兩個動爻之間有其他動爻，不符合條件
        }

        // 檢查兩個動爻之間是否至少有一個靜爻
        let hasStaticYao = false;
        for (let pos = current + 1; pos < next; pos++) {
            // 檢查此位置是否是靜爻
            const originalYaoElement = document.querySelector(`.div${71 - pos}.original-yao`);
            if (originalYaoElement && (originalYaoElement.value === '/' || originalYaoElement.value === '//')) {
                hasStaticYao = true;
                break;
            }
        }

        if (!hasStaticYao) {
            console.log('two moving yao between no static yao');
            return false; // 兩個動爻之間沒有靜爻，不符合條件
        }
    }

    return true; // 所有檢查都通過，符合條件
}

/**
 * 計算日辰三合分數
 * 日辰地支與兩個動爻的原爻地支構成三合
 */
export function calculateDaySunThreeHarmony() {
    // 獲取日辰地支
    const dayBranch = document.querySelector('.div12').textContent.slice(-1);

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
                movingYaos.push({ index: yaoIndex, dizhi, relation: godType });
            }
        }
    });

    // 如果動爻少於2個，無法構成三合
    if (movingYaos.length < 2) {
        return;
    }

    // 檢查日辰與任意兩個動爻是否構成三合
    for (let i = 0; i < movingYaos.length - 1; i++) {
        for (let j = i + 1; j < movingYaos.length; j++) {
            const branches = [dayBranch, movingYaos[i].dizhi, movingYaos[j].dizhi];
            const { isHarmony, element } = checkThreeHarmony(branches);

            // 檢查兩個動爻之間是否有靜爻
            const hasStaticBetween = hasStaticYaoBetween([movingYaos[i].index, movingYaos[j].index]);

            if (isHarmony && hasStaticBetween) {
                // 計算三合分數
                calculateHarmonyScore(element, [movingYaos[i], movingYaos[j]], '日辰');
            }
        }
    }
}

/**
 * 計算直線三合分數
 * 三個動爻的原爻地支構成三合
 */
export function calculateStraightThreeHarmony() {
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
                movingYaos.push({ index: yaoIndex, dizhi, relation: godType });
            }
        }
    });

    // 如果動爻少於3個，無法構成直線三合
    if (movingYaos.length < 3) {
        return;
    }

    // 檢查任意三個動爻是否構成三合
    for (let i = 0; i < movingYaos.length - 2; i++) {
        for (let j = i + 1; j < movingYaos.length - 1; j++) {
            for (let k = j + 1; k < movingYaos.length; k++) {
                const branches = [movingYaos[i].dizhi, movingYaos[j].dizhi, movingYaos[k].dizhi];
                const { isHarmony, element } = checkThreeHarmony(branches);

                // 檢查三個動爻之間是否有靜爻
                const hasStaticBetween = hasStaticYaoBetween([movingYaos[i].index, movingYaos[j].index, movingYaos[k].index]);
                console.log(hasStaticBetween);
                console.log(movingYaos[i].index, movingYaos[j].index, movingYaos[k].index);
                if (isHarmony && hasStaticBetween) {
                    // 計算三合分數
                    calculateHarmonyScore(element, [movingYaos[i], movingYaos[j], movingYaos[k]], '直線');
                }
            }
        }
    }
}

/**
 * 計算三角三合分數
 * 兩個動爻的原爻地支與一個動爻的變爻地支構成三合
 * 限制條件：只能初爻、三爻動二爻不動或四爻、上爻動五爻不動
 */
export function calculateTriangleThreeHarmony() {
    // 獲取所有動爻
    const movingYaos = [];
    const originalYao = document.querySelectorAll('.original-yao');

    // 記錄每個爻位的狀態（動或靜）
    const yaoStatus = [false, false, false, false, false, false]; // 索引0-5對應初爻到上爻

    originalYao.forEach(yao => {
        const yaoValue = yao.value;
        const yaoIndex = 71 - parseInt(Array.from(yao.classList).find(cls => cls.startsWith('div')).substring(3));

        // 記錄爻的狀態（動或靜）
        yaoStatus[yaoIndex] = (yaoValue === 'O' || yaoValue === 'X');

        if (yaoValue === 'O' || yaoValue === 'X') {
            const originalDizhiDiv = document.querySelector(`.div${59 - yaoIndex}`);
            const originalDizhi = originalDizhiDiv.textContent.charAt(0);
            const changeDizhiDiv = document.querySelector(`.div${83 - yaoIndex}`);
            const changeDizhi = changeDizhiDiv.textContent.charAt(0);
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
                    originalDizhi,
                    changeDizhi,
                    relation: godType
                });
            }
        }
    });

    // 如果動爻少於2個，無法構成三角三合
    if (movingYaos.length < 2) {
        return;
    }

    // 檢查是否符合特定模式：初爻、三爻動而二爻不動，或四爻、上爻動而五爻不動
    const isValidPattern =
        (yaoStatus[0] && !yaoStatus[1] && yaoStatus[2]) || // 初爻、三爻動而二爻不動
        (yaoStatus[3] && !yaoStatus[4] && yaoStatus[5]);   // 四爻、上爻動而五爻不動

    // 如果不符合特定模式，直接返回
    if (!isValidPattern) {
        return;
    }

    // 檢查任意兩個動爻的原爻地支與任一動爻的變爻地支是否構成三合
    for (let i = 0; i < movingYaos.length - 1; i++) {
        for (let j = i + 1; j < movingYaos.length; j++) {
            // 檢查是否符合特定的爻位組合
            const isFirstThirdYaos =
                (movingYaos[i].index === 0 && movingYaos[j].index === 2) ||
                (movingYaos[i].index === 2 && movingYaos[j].index === 0);

            const isFourthSixthYaos =
                (movingYaos[i].index === 3 && movingYaos[j].index === 5) ||
                (movingYaos[i].index === 5 && movingYaos[j].index === 3);

            // 只有符合特定爻位組合的才進行三角三合檢查
            if (isFirstThirdYaos || isFourthSixthYaos) {
                // 檢查第一個動爻的變爻地支與兩個動爻的原爻地支是否構成三合
                const branches1 = [movingYaos[i].changeDizhi, movingYaos[i].originalDizhi, movingYaos[j].originalDizhi];
                const result1 = checkThreeHarmony(branches1);

                // 檢查第二個動爻的變爻地支與兩個動爻的原爻地支是否構成三合
                const branches2 = [movingYaos[j].changeDizhi, movingYaos[i].originalDizhi, movingYaos[j].originalDizhi];
                const result2 = checkThreeHarmony(branches2);

                // 檢查兩個動爻之間是否有靜爻
                const hasStaticBetween = hasStaticYaoBetween([movingYaos[i].index, movingYaos[j].index]);

                if (hasStaticBetween) {
                    if (result1.isHarmony) {
                        // 計算三角三合分數（使用第一個動爻的變爻地支）
                        calculateHarmonyScore(result1.element, [movingYaos[i], movingYaos[j]], '三角', movingYaos[i].changeDizhi);
                    }

                    if (result2.isHarmony) {
                        // 計算三角三合分數（使用第二個動爻的變爻地支）
                        calculateHarmonyScore(result2.element, [movingYaos[i], movingYaos[j]], '三角', movingYaos[j].changeDizhi);
                    }
                }
            }
        }
    }
}

/**
 * 計算三合分數並更新顯示
 * @param {string} element - 三合對應的五行
 * @param {Array} yaos - 參與三合的爻
 * @param {string} type - 三合類型（日辰、直線、三角）
 * @param {string} changeDizhi - 變爻地支（僅用於三角三合）
 */
function calculateHarmonyScore(element, yaos, type, changeDizhi = null) {
    // 獲取用神五行
    const selectedRelation = document.querySelector('.six-relation-select').value;
    const relationElements = {};

    // 獲取並處理所有六親關係容器
    const relationContainers = Array.from(document.querySelectorAll('.six-relation-container'));

    if (relationContainers.length > 0) {
        // 處理第一個容器（用神選擇器）
        const firstContainer = relationContainers[0];
        relationElements[firstContainer.querySelector('.six-relation-select').value] =
            firstContainer.querySelector('.six-relation-item-lower').textContent;

        // 處理其餘容器
        relationContainers.slice(1).forEach(item => {
            try {
                const relation = item.querySelector('.six-relation-item-upper').textContent;
                const elementText = item.querySelector('.six-relation-item-lower').textContent;
                if (relation && elementText) {
                    relationElements[relation] = elementText;
                }
            } catch (error) {
                console.error('處理六親關係時出錯:', error);
            }
        });
    }
    const mainGodElement = relationElements[selectedRelation];

    // 計算分數
    let score = 0;
    // 從generatingElements常量獲取五行生克關係
    // 判斷三合五行與用神五行的關係
    if (element === mainGodElement) {
        // 三合五行與用神五行相同，分數為15
        score = 15;
    } else if (generatingElements[element] === mainGodElement) {
        // 三合五行生用神五行，分數為10
        score = 10;
    } else if (generatingElements[mainGodElement] === element) {
        // 三合五行被用神五行所生，分數為-5
        score = -5;
    } else if (restrainingElements[element] === mainGodElement) {
        // 三合五行剋用神五行，分數為-15
        score = -15;
    } else if (restrainingElements[mainGodElement] === element) {
        // 三合五行被用神五行所剋，分數為-5
        score = -10;
    } else {
        // 其他情況，默認為0分
        score = 0;
    }

    // 三合分數乘以1.5倍
    const finalScore = parseFloat((score * 1.5).toFixed(2));

    let count = 0;
    // 更新爻位顯示
    yaos.forEach(yao => {
        count++;
        const yaoDiv = document.querySelector(`.${yaoClasses[yao.index]}`);
        let harmonyText = '';

        if (type === '日辰') {
            // 日辰三合
            const dayBranch = document.querySelector('.div12').textContent.slice(-1);
            const otherYao = yaos.find(y => y.index !== yao.index);
            harmonyText = `${yaoNameClasses[yao.index]}、${yaoNameClasses[otherYao.index]} ${otherYao.dizhi}${yao.dizhi}${dayBranch} 日辰三合合化「${element}」局 `;
            harmonyText += (count === yaos.length) ? `${finalScore}` : '0';
        } else if (type === '直線') {
            // 直線三合
            const otherYaos = yaos.filter(y => y.index !== yao.index);
            harmonyText = `${yaoNameClasses[yao.index]}、${yaoNameClasses[otherYaos[0].index]}、${yaoNameClasses[otherYaos[1].index]} ${otherYaos[0].dizhi}${yao.dizhi}${otherYaos[1].dizhi} 直線三合合化「${element}」局 `;
            harmonyText += (count === yaos.length) ? `${finalScore}` : '0';
        } else if (type === '三角') {
            // 三角三合
            const otherYao = yaos.find(y => y.index !== yao.index);
            harmonyText = `${yaoNameClasses[yao.index]}、${yaoNameClasses[otherYao.index]} ${yao.originalDizhi}${otherYao.originalDizhi}${changeDizhi} 三角三合合化「${element}」局 `;
            harmonyText += (count === yaos.length) ? `${finalScore}` : '0';
        }

        // 更新爻位顯示
        if (harmonyText && !yaoDiv.textContent.includes(harmonyText)) {
            yaoDiv.textContent = harmonyText;

        }
    });
}

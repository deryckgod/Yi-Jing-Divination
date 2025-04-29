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
    yaoNameClasses,
    godScores,
    zhiList,
    generatingElements
} from '../yijing-constants.js';

import { isScoreAboveThreshold } from './transformationScore.js';

import {
    convertRelationToGodType
} from './utils.js';
/**
 * 計算貪生忘剋分數
 * 檢查動爻之間的五行關係，計算貪生忘剋的分數
 */
export function calculateGreedyLifeScore() {
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
            if (isScoreAboveThreshold(score, godType) && !yaoInfo.includes("三合")) {
                // 獲取地支對應的五行
                const element = earthlyBranchToElement[dizhi];
                movingYaos.push({
                    index: yaoIndex,
                    dizhi,
                    element,
                    relation: godType,
                    score
                });
            }
        }
    });

    // 如果動爻少於2個，無法構成貪生忘剋
    if (movingYaos.length < 2) {
        return;
    }

    // 檢查任意兩個動爻之間的五行關係
    for (let i = 0; i < movingYaos.length - 1; i++) {
        for (let j = i + 1; j < movingYaos.length; j++) {
            const yao1 = movingYaos[i];
            const yao2 = movingYaos[j];

            // 檢查是否有貪生忘剋關係
            checkGreedyLifeRelation(yao1, yao2);
        }
    }
}

/**
 * 檢查兩個動爻之間是否有貪生忘剋關係
 * @param {object} yao1 - 第一個動爻
 * @param {object} yao2 - 第二個動爻
 */
function checkGreedyLifeRelation(yao1, yao2) {
    // 檢查五行生剋關係
    const isYao1GeneratingYao2 = generatingElements[yao1.element] === yao2.element; // yao1生yao2
    const isYao2GeneratingYao1 = generatingElements[yao2.element] === yao1.element; // yao2生yao1

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

    // 檢查貪生忘剋情況
    if (isYao1GeneratingYao2 && mainGodElement != yao1.element) {
        // yao1生yao2，yao1貪生忘剋
        processGreedyLife(yao1, yao2);
    }

    if (isYao2GeneratingYao1 && mainGodElement != yao2.element) {
        // yao2生yao1，yao2貪生忘剋
        processGreedyLife(yao2, yao1);
    }
}

/**
 * 處理貪生忘剋情況並計算分數
 * @param {object} greedyYao - 貪生忘剋的爻
 * @param {object} otherYao - 另一個爻
 * @param {string} mainGodElement - 用神五行
 */
function processGreedyLife(greedyYao, otherYao) {
    // 更新爻位顯示
    const yaoDiv = document.querySelector(`.${yaoClasses[greedyYao.index]}`);
    const greedyText = `貪生忘剋 ${yaoNameClasses[otherYao.index]} 不計分 0`;

    // 更新爻位顯示
    if (!yaoDiv.textContent.includes(greedyText) && !yaoDiv.textContent.includes("貪生忘剋")) {
        yaoDiv.textContent = yaoDiv.textContent ? `${yaoDiv.textContent} ${greedyText}` : greedyText;
    }
}
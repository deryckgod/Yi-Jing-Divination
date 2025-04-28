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
            if (isScoreAboveThreshold(score, godType)) {
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
    const isYao1GeneratingYao2 = FiveElementsCycle[yao1.element] === yao2.element; // yao1生yao2
    const isYao2GeneratingYao1 = FiveElementsCycle[yao2.element] === yao1.element; // yao2生yao1
    const isYao1RestrainingYao2 = yao1.element === FiveElementsCycle[FiveElementsCycle[yao2.element]]; // yao1剋yao2
    const isYao2RestrainingYao1 = yao2.element === FiveElementsCycle[FiveElementsCycle[yao1.element]]; // yao2剋yao1

    // 獲取用神五行
    const selectedRelation = document.querySelector('.six-relation-select').value;
    const relationElements = {};
    document.querySelectorAll('.six-relation-item').forEach(item => {
        const relation = item.querySelector('.six-relation-item-upper').textContent;
        const elementText = item.querySelector('.six-relation-item-lower').textContent;
        relationElements[relation] = elementText;
    });
    const mainGodElement = relationElements[selectedRelation];

    // 檢查貪生忘剋情況
    if (isYao1GeneratingYao2 && isYao2RestrainingYao1) {
        // yao1生yao2，yao2剋yao1，yao1貪生忘剋
        processGreedyLife(yao1, yao2, mainGodElement);
    }

    if (isYao2GeneratingYao1 && isYao1RestrainingYao2) {
        // yao2生yao1，yao1剋yao2，yao2貪生忘剋
        processGreedyLife(yao2, yao1, mainGodElement);
    }
}

/**
 * 處理貪生忘剋情況並計算分數
 * @param {object} greedyYao - 貪生忘剋的爻
 * @param {object} otherYao - 另一個爻
 * @param {string} mainGodElement - 用神五行
 */
function processGreedyLife(greedyYao, otherYao, mainGodElement) {
    // 計算分數
    let score = 0;

    // 根據貪生忘剋爻的六親關係和用神五行計算分數
    if (greedyYao.relation === '用神') {
        // 用神貪生忘剋，分數為-10
        score = -10;
    } else if (greedyYao.relation === '原神') {
        // 原神貪生忘剋，分數為-8
        score = -8;
    } else if (greedyYao.relation === '忌神') {
        // 忌神貪生忘剋，分數為8
        score = 8;
    } else if (greedyYao.relation === '仇神') {
        // 仇神貪生忘剋，分數為5
        score = 5;
    } else if (greedyYao.relation === '閒神') {
        // 閒神貪生忘剋，分數為0
        score = 0;
    }

    // 更新爻位顯示
    const yaoDiv = document.querySelector(`.${yaoClasses[greedyYao.index]}`);
    const greedyText = `${greedyYao.relation} 貪生忘剋 ${score}`;

    // 更新爻位顯示
    if (!yaoDiv.textContent.includes(greedyText)) {
        yaoDiv.textContent = yaoDiv.textContent ? `${yaoDiv.textContent} ${greedyText}` : greedyText;
    }
}
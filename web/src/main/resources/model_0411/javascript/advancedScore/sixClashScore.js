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
 * 計算六沖分數
 * 檢查動爻之間的地支沖克關係，計算六沖的分數
 */
export function calculateSixClashScore() {
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

    // 如果動爻少於2個，無法構成六沖
    if (movingYaos.length < 2) {
        return;
    }

    // 檢查任意兩個動爻之間的地支沖克關係
    for (let i = 0; i < movingYaos.length - 1; i++) {
        for (let j = i + 1; j < movingYaos.length; j++) {
            const yao1 = movingYaos[i];
            const yao2 = movingYaos[j];

            // 檢查是否有六沖關係
            checkSixClashRelation(yao1, yao2);
        }
    }
}

/**
 * 檢查兩個動爻之間是否有六沖關係
 * @param {object} yao1 - 第一個動爻
 * @param {object} yao2 - 第二個動爻
 */
function checkSixClashRelation(yao1, yao2) {
    // 檢查地支是否相沖
    const isClash = EarthlyBranchClash[yao1.dizhi] === yao2.dizhi;

    if (isClash) {
        // 計算六沖分數
        calculateClashScore(yao1, yao2);
    }
}

/**
 * 計算六沖分數並更新顯示
 * @param {object} yao1 - 第一個動爻
 * @param {object} yao2 - 第二個動爻
 */
function calculateClashScore(yao1, yao2) {
    // 獲取用神五行
    const selectedRelation = document.querySelector('.six-relation-select').value;

    // 計算分數
    let score1 = 0;
    let score2 = 0;

    // 根據六親關係計算分數
    if (yao1.relation === '用神') {
        // 用神被沖，分數為-12
        score1 = -12;
    } else if (yao1.relation === '原神') {
        // 原神被沖，分數為-10
        score1 = -10;
    } else if (yao1.relation === '忌神') {
        // 忌神被沖，分數為10
        score1 = 10;
    } else if (yao1.relation === '仇神') {
        // 仇神被沖，分數為8
        score1 = 8;
    } else if (yao1.relation === '閒神') {
        // 閒神被沖，分數為0
        score1 = 0;
    }

    if (yao2.relation === '用神') {
        // 用神被沖，分數為-12
        score2 = -12;
    } else if (yao2.relation === '原神') {
        // 原神被沖，分數為-10
        score2 = -10;
    } else if (yao2.relation === '忌神') {
        // 忌神被沖，分數為10
        score2 = 10;
    } else if (yao2.relation === '仇神') {
        // 仇神被沖，分數為8
        score2 = 8;
    } else if (yao2.relation === '閒神') {
        // 閒神被沖，分數為0
        score2 = 0;
    }

    // 更新爻位顯示
    const yaoDiv1 = document.querySelector(`.${yaoClasses[yao1.index]}`);
    const yaoDiv2 = document.querySelector(`.${yaoClasses[yao2.index]}`);

    const clashText1 = `${yao1.relation} 被${yao2.dizhi}沖 ${score1}`;
    const clashText2 = `${yao2.relation} 被${yao1.dizhi}沖 ${score2}`;

    // 更新爻位顯示
    if (!yaoDiv1.textContent.includes(clashText1)) {
        yaoDiv1.textContent = yaoDiv1.textContent ? `${yaoDiv1.textContent} ${clashText1}` : clashText1;
    }

    if (!yaoDiv2.textContent.includes(clashText2)) {
        yaoDiv2.textContent = yaoDiv2.textContent ? `${yaoDiv2.textContent} ${clashText2}` : clashText2;
    }
}
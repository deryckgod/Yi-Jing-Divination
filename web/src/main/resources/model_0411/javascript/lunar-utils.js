// 引入常量
import {
    trigramMap,
    sixtyFourGuaMap,
    NaJiaDiZhi,
    EightTrigramsFiveElements,
    FiveElementsCycle,
    EarthlyBranchClash,
    earthlyBranchToElement,
    dizhiGroups,
    markupStyle,
    yaoClasses
} from './yijing-constants.js';

import {
    determineMainGod,
    updateSunScore,
    updateMoonScore,
    updateGodWillingScore
} from './god-willing.js';

import {
    varietyScoreOrigin,
    varietyScoreChanging
} from './advancedScore/varietyScore.js';

import {
    calculateTransformationScore,
    calculateHiddenTransformation
} from './advancedScore/transformationScore.js';

import {
    calculateTombExtinctionScore,
    checkYaotoTombExtinction
} from './advancedScore/tombExtinctionScore.js';

import {
    calculateDaySunThreeHarmony,
    calculateStraightThreeHarmony,
    calculateTriangleThreeHarmony
} from './advancedScore/threeHarmonyScore.js';

import { calculateGreedyLifeScore } from './advancedScore/greedyLifeScore.js';

import { calculateSixClashScore } from './advancedScore/sixClashScore.js';

import {
    convertRelationToGodType
} from './advancedScore/utils.js';
// updateGua函數
export function updateGua() {
    // 原爻
    const yaos = Array.from(document.querySelectorAll('.original-yao')).map(select => {
        const value = select.value;
        return {
            yinYang: (value === '/' || value === 'O') ? '1' : '0',
            position: parseInt(select.className.replace('div', '')) - 66,
            value: select.value // 保存原始值，用於判斷動爻/靜爻
        };
    }).sort((a, b) => a.position - b.position);

    // 生成原卦与變卦
    const upperTrigram = yaos.slice(0, 3).map(y => y.yinYang).join('');
    const lowerTrigram = yaos.slice(3).map(y => y.yinYang).join('');

    // 更新原卦
    updateOriginalGua(upperTrigram, lowerTrigram);

    // 原卦地支分配
    const upperTrigramName = trigramMap[upperTrigram];
    const lowerTrigramName = trigramMap[lowerTrigram];
    const originalLowerDizhi = NaJiaDiZhi[lowerTrigramName].slice(0, 3);
    const originalUpperDizhi = NaJiaDiZhi[upperTrigramName].slice(3);

    // 變爻
    const bianYaoPositions = updateBianYao();
    //console.log('bianYaoPositions', bianYaoPositions); // Debugging printout

    // 根据變爻生成變卦
    let bianLower = lowerTrigram.split('');
    let bianUpper = upperTrigram.split('');

    // 更新變卦
    updateBianGua(bianUpper, bianLower, bianYaoPositions);

    // 變卦地支分配
    const changedLower = bianLower.join('');
    const changedUpper = bianUpper.join('');
    const changedLowerName = trigramMap[changedLower];
    const changedUpperName = trigramMap[changedUpper];
    const changedLowerDizhi = NaJiaDiZhi[changedLowerName].slice(0, 3);
    const changedUpperDizhi = NaJiaDiZhi[changedUpperName].slice(3);

    let { shiPosition, yingPosition, compare } = updateShiYing(lowerTrigram, upperTrigram);

    // 新增首卦div26邏輯
    const shiYaoPosition = shiPosition - 60; // 取得世爻在卦中的位置(0-5)
    // 更新首卦
    let shouGua = updateDiv26(shiYaoPosition, compare, upperTrigram, lowerTrigram);
    // 處理六親五行對應邏輯
    const currentElement = EightTrigramsFiveElements[shouGua];
    const relationElements = FiveElementsCycle[currentElement];

    // 觸發六親更新
    updateSixRelations(document.querySelector('.six-relation-select').value, shouGua);

    // 更新卦身
    updateDiv17(shiYaoPosition, yaos);

    // 清空動化分數紀錄
    for (let yaoPosition = 0; yaoPosition < 6; yaoPosition++) {
        const initializeYaoDisplay = document.querySelector(`.${yaoClasses[yaoPosition]}`);
        initializeYaoDisplay.innerHTML = '';
    }

    // 更新用神資訊
    const { isKongWang, isShi, isChanged, isFuShan } = determineMainGod(yaos, originalLowerDizhi.concat(originalUpperDizhi), changedLowerDizhi.concat(changedUpperDizhi),
        bianYaoPositions, relationElements, shouGua, shiPosition, yingPosition);

    // 更新變爻地支六親(計算分數會看是否有變爻干支六親，故優先原爻執行)
    updateChangeDizhiAndRelation(changedLowerDizhi, changedUpperDizhi, relationElements, bianYaoPositions);

    // 更新原爻地支六親 
    updateOriginalDizhiAndRelation(originalLowerDizhi, originalUpperDizhi, relationElements);

    // 計算三合分數 
    calculateDaySunThreeHarmony();
    calculateStraightThreeHarmony();
    calculateTriangleThreeHarmony();

    // 計算貪生忘剋分數 
    calculateGreedyLifeScore();

    // 計算六沖分數 
    calculateSixClashScore();

    // 計算入墓入絕分數
    calculateTombExtinctionScore();

    // 更新日辰分數 
    const { sunScore, isTomb, isExtinction } = updateSunScore(relationElements);

    // 更新月辰分數
    const moonScore = updateMoonScore(relationElements);

    // 更新天意分數
    updateGodWillingScore(isKongWang, isShi, sunScore, moonScore, isChanged, isFuShan, isTomb, isExtinction);
}

// 原爻地支六親
// 因为原卦地支的位置是固定的，所以我们可以直接使用索引来更新它们的内容
// 因為由下往上是倒序，所以用 div${N - i) 的方式傳入值
export function updateOriginalDizhiAndRelation(originalLowerDizhi, originalUpperDizhi, relationElements) {

    originalLowerDizhi.concat(originalUpperDizhi).forEach((dz, index) => {
        const element = earthlyBranchToElement[dz];
        let relation = Object.entries(relationElements)
            .find(([_, v]) => v === element)?.[0] || '';
        // 更新div48-53顯示
        document.querySelector(`.div${53 - index}`).textContent = relation;
        // 更新原卦地支顯示（div54-59）
        document.querySelector(`.div${59 - index}`).textContent = dz;
        // 新增原爻空亡、沖
        varietyScoreOrigin(dz, index);

        // 獲取原爻值
        const originalYao = document.querySelectorAll('.original-yao')[5 - index];
        if (originalYao) {
            const yaoValue = originalYao.value;
            relation = convertRelationToGodType(relation); // 將六親關係轉換為神類型，如：用神、原神、忌神、仇神、閒神
            // 判斷是否為靜爻
            if (yaoValue === '/' || yaoValue === '//') {
                // 檢查是否與日沖地支相同
                const dayClashBranch = document.querySelector('.div15').textContent;
                const isClash = dz === dayClashBranch;
                if (isClash) {
                    // 計算靜爻暗動分數
                    calculateHiddenTransformation(dz, index, relation);
                }
            } else if (yaoValue === 'O' || yaoValue === 'X') {
                // 動爻情況
                // 檢查是否與日沖地支相同
                const dayClashBranch = document.querySelector('.div15').textContent;
                const isClash = dz === dayClashBranch;

                // 檢查是否與空亡地支相同
                const kongWangText = document.querySelector('.div16').textContent;
                const kongWangDizhi = kongWangText.split('');
                const isKongWang = kongWangDizhi.includes(dz);

                // 獲取變爻地支 (從變卦地支顯示中獲取)
                const changeDizhi = document.querySelector(`.div${83 - index}`).textContent.charAt(0);

                // 計算動爻動化分數 (使用原爻地支的relation作為神的判斷依據)
                if (changeDizhi) {
                    calculateTransformationScore(dz, changeDizhi, index, relation, isKongWang, isClash);
                }
            }
        }
    });
}

// 變爻地支六親
export function updateChangeDizhiAndRelation(changedLowerDizhi, changedUpperDizhi, relationElements, bianYaoPositions) {
    changedLowerDizhi.concat(changedUpperDizhi).forEach((dz, index) => {
        const element = earthlyBranchToElement[dz];
        const relation = Object.entries(relationElements)
            .find(([_, v]) => v === element)?.[0] || '';

        // 有變卦才顯示(倒敘)
        if (bianYaoPositions.includes(5 - index)) {
            document.querySelector(`.div${89 - index}`).textContent = relation;
            // 新增變爻空亡
            varietyScoreChanging(dz, index);
        } else {
            document.querySelector(`.div${89 - index}`).textContent = '';
            document.querySelector(`.div${83 - index}`).textContent = '';
        }
    });
}

// 新增空亡計算函式
export function getKongWang(dayGanZhi) {
    const ganList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    let currentGan = dayGanZhi[0];
    let currentZhi = dayGanZhi[1];

    // 寻找最近的旬首（天干为甲）
    let steps = ganList.indexOf(currentGan);
    let xunZhiIndex = (zhiList.indexOf(currentZhi) - steps + 12) % 12;

    // 计算空亡地支（旬首地支+10和+11）
    const kongIndex1 = (xunZhiIndex + 10) % 12;
    const kongIndex2 = (xunZhiIndex + 11) % 12;

    return `${zhiList[kongIndex1]}${zhiList[kongIndex2]}`;
}

// 新增更新原卦函數
export function updateOriginalGua(upperTrigram, lowerTrigram) {
    const originalGuaKey = trigramMap[upperTrigram] + trigramMap[lowerTrigram];
    const originalGuaName = sixtyFourGuaMap[originalGuaKey] || originalGuaKey;
    document.querySelector('.div27').textContent = originalGuaName;
}

// 變爻
export function updateBianYao() {
    // 新增變爻处理逻辑
    const bianYaoPositions = [];
    document.querySelectorAll('.original-yao').forEach((select, index) => {
        const bianYaoDiv = document.querySelector(`.div${72 + index}`);
        if (select.value === 'O') {
            bianYaoDiv.textContent = '//';
            bianYaoPositions.push(index);
        } else if (select.value === 'X') {
            bianYaoDiv.textContent = '/';
            bianYaoPositions.push(index);
        } else {
            bianYaoDiv.textContent = '';
        }
    });
    return bianYaoPositions;
}

export function updateBianGua(bianUpper, bianLower, bianYaoPositions) {
    bianYaoPositions.forEach(pos => {
        if (pos < 3) {
            bianUpper[pos] = bianUpper[pos] === '1' ? '0' : '1';
        } else {
            const lowerPos = pos - 3;
            bianLower[lowerPos] = bianLower[lowerPos] === '1' ? '0' : '1';
        }
    });
    const changedGuaKey = trigramMap[bianUpper.join('')] + trigramMap[bianLower.join('')];
    const changedGuaName = sixtyFourGuaMap[changedGuaKey] || changedGuaKey;
    document.querySelector('.div33').textContent = changedGuaName;
}

// 更新卦身div17
export function updateDiv17(shiYaoPosition, yaos) {
    // 卦身div17判斷邏輯
    // 動態計算卦身地支
    const isYangYao = yaos.find(y => y.position === shiYaoPosition)?.yinYang === '1';

    const selectedDizhi = isYangYao
        ? dizhiGroups.front[shiYaoPosition % dizhiGroups.front.length]
        : dizhiGroups.back[shiYaoPosition % dizhiGroups.back.length];

    document.querySelector('.div17').textContent = selectedDizhi;
}

// 更新首卦div26
export function updateDiv26(shiYaoPosition, compare, upperTrigram, lowerTrigram) {
    let shouGua = '';

    if ([0, 4, 5].includes(shiYaoPosition)) { // 初爻、二爻、上爻
        shouGua = trigramMap[upperTrigram];
    } else if ([1, 2].includes(shiYaoPosition)) { // 四爻、五爻
        const invertedLower = lowerTrigram.split('').map(b => b === '1' ? '0' : '1').join('');
        shouGua = trigramMap[invertedLower];
    } else if (shiYaoPosition === 3) { // 三爻
        const isDifferent = !compare.heaven && !compare.human && !compare.earth;
        shouGua = isDifferent ? trigramMap[upperTrigram] : trigramMap[lowerTrigram];
    }

    document.querySelector('.div26').textContent = `${shouGua}　${EightTrigramsFiveElements[shouGua]}`;
    //console.log(document.querySelector('.six-relation-select').value);
    updateSixRelations(document.querySelector('.six-relation-select').value, shouGua);

    return shouGua;
}


// 多型實現六親更新
export function updateSixRelations(selectValue, shouGua) {
    const sequence = ["財", "子", "兄", "父", "官"];
    const startIndex = sequence.indexOf(selectValue);
    const reorderedSequence = sequence.slice(startIndex).concat(sequence.slice(0, startIndex));

    // 提取共用生成函式
    const generateSelectElement = (selectedValue) => {
        return `<div class="six-relation-container">
            <span class="six-relation-item-upper">
            <select class="six-relation-select">
            ${reorderedSequence.map(opt =>
            `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`
        ).join('')}
        </select>
        </span>
        `;
    };

    const generateRelationContainer = (relation, value) => {
        const lowerSpan = value ? `<span class="six-relation-item-lower">${value}</span>` : '';
        return `<div class="six-relation-container">
            <span class="six-relation-item-upper">${relation}</span>
            ${lowerSpan}
        </div>`;
    };

    // 統一處理邏輯
    const processRelation = (i, relations) => {
        const nextIndex = (startIndex + i) % 5;
        const relationDiv = document.querySelector(`.div${28 + i}`);
        const currentRelation = sequence[nextIndex];

        if (i === 0) {
            relationDiv.innerHTML = generateSelectElement(currentRelation) +
                (relations ? `<span class="six-relation-item-lower">${relations[currentRelation]}</span></div>` : '</div>');
        } else {
            relationDiv.innerHTML = generateRelationContainer(currentRelation, relations?.[currentRelation]);
        }
    };

    // 根據是否有首卦分支處理
    if (typeof shouGua !== 'undefined') {
        const currentElement = EightTrigramsFiveElements[shouGua];
        const relations = FiveElementsCycle[currentElement];

        for (let i = 0; i < 5; i++) {
            processRelation(i, relations);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            processRelation(i);
        }
    }
}

// 修改updateShiYing函數
export function updateShiYing(lowerTrigram, upperTrigram) {

    // 比對三才位置
    const compare = {
        earth: lowerTrigram[2] === upperTrigram[2],
        human: lowerTrigram[1] === upperTrigram[1],
        heaven: lowerTrigram[0] === upperTrigram[0]
    };
    // 世應判定邏輯
    let shiPosition = 0;
    let yingPosition = 0;

    if (compare.heaven && !compare.human && !compare.earth) {
        shiPosition = 64; yingPosition = 61;
    } else if (!compare.heaven && compare.human && compare.earth) {
        shiPosition = 61; yingPosition = 64;
    } else if (compare.human && !compare.heaven && !compare.earth) {
        shiPosition = 62; yingPosition = 65;
    } else if (!compare.human && compare.heaven && compare.earth) {
        shiPosition = 63; yingPosition = 60;
    } else if (compare.earth && !compare.heaven && !compare.human) {
        shiPosition = 62; yingPosition = 65;
    } else if (!compare.earth && compare.heaven && compare.human) {
        shiPosition = 65; yingPosition = 62;
    } else if (compare.heaven && compare.human && compare.earth) {
        shiPosition = 60; yingPosition = 63;
    } else {
        shiPosition = 63; yingPosition = 60;
    }

    // 更新顯示
    document.querySelectorAll('.div60, .div61, .div62, .div63, .div64, .div65')
        .forEach(div => div.textContent = '');

    document.querySelector(`.div${shiPosition}`).textContent = '世';
    document.querySelector(`.div${yingPosition}`).textContent = '應';

    // 返回一個包含三個值的對象，增加yingPosition
    return { shiPosition, yingPosition, compare };
}



export function updateDate(event) {
    const info = event.detail;
    const div9 = document.querySelector('.div9'); // 年
    const div10 = document.querySelector('.div10'); // 月
    const div12 = document.querySelector('.div12'); // 日

    // 更新顯示內容
    div9.textContent = `${info.gzYearZH}`;
    div10.textContent = `${info.gzMonthZH}`;
    div12.textContent = `${info.gzDayZH}`;

    // 月破、日沖地支
    const div14 = document.querySelector('.div14'); // 月破
    const div15 = document.querySelector('.div15'); // 日沖

    // 獲取月地支並查詢相沖關係
    const monthBranch = info.gzMonthZH.slice(-1);
    const clashBranchMonth = EarthlyBranchClash[monthBranch] || '';
    div14.textContent = `${clashBranchMonth}`;

    // 獲取日地支並查詢相沖關係
    const dayBranch = info.gzDayZH.slice(-1);
    const clashBranchDay = EarthlyBranchClash[dayBranch] || '';
    div15.textContent = `${clashBranchDay}`;

    const div16 = document.querySelector('.div16'); // 空亡
    const dayGanZhi = info.gzDayZH;
    const kongWang = getKongWang(dayGanZhi);
    div16.textContent = `${kongWang}`;
}

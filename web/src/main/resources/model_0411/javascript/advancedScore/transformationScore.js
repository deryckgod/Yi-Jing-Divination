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
                else {
                    score = score > 0 ? score - 2 : score + 2; // 正負號放外面，裡面數字-2
                }
                scoreMultiplier = 1;
            } else if (originalElement === '金' && changeElement === '木' ||
                originalElement === '木' && changeElement === '土' ||
                originalElement === '土' && changeElement === '水' ||
                originalElement === '水' && changeElement === '火' ||
                originalElement === '火' && changeElement === '金') {
                // 5. 化制
                transformationType = '化制';
                score = score > 0 ? score - 3 : score + 3; // 正負號放外面，裡面數字-3
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

                // 例外情況：用神的六親如果是回頭剋，則分數直接為-15，因可能"沖散"，故沒與化空、空化空一起寫
                if (relation === '用神') {
                    score = -15;
                    scoreMultiplier = 1;
                }
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
    if (relation === '用神' && (transformationType === '化空' || transformationType === '空化空')) {
        score = -15;
        scoreMultiplier = 1;
    }

    // 檢查入墓入絕情況
    const { scoreMultiplier: tombMultiplier, transformationType: tombType } = checkYaoTombExtinction(originalDizhi, index, relation, transformationType);
    scoreMultiplier *= tombMultiplier;
    if (tombType) {
        transformationType += tombType;
    }

    // 獲取日辰地支
    const dayBranch = document.querySelector('.div12').textContent.slice(-1);

    // 最後檢查如果用神是動爻且入日墓絕 動化分數直接為-15
    if (relation === '用神' && originalDizhi) {
        const { isTomb, isExtinction } = checkTombExtinction(originalDizhi, dayBranch);
        if (isTomb || isExtinction) {
            score = -15;
            scoreMultiplier = 1;
            transformationType = isTomb ? ' 入日墓' : ' 入日絕';
        }
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

    // 用神靜爻入其他動爻墓絕，影響其他動爻
    mainGodtoTombExtinctionScore(originalDizhi, index, relation);

    // 計算最終分數
    const finalScore = parseFloat((score * scoreMultiplier).toFixed(2));

    // 更新爻位顯示
    if (transformationType) {
        let displayText = `${relation} ${transformationType} ${finalScore} `;
        if (!yaoInfo.includes(displayText)) {
            yaoDiv.textContent = yaoInfo ? `${yaoInfo} ${displayText} ` : displayText;
        }
    }

    return { type: transformationType, score: finalScore };
}

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

/**
 * 檢查動爻間入墓絕情況並計算分數調整
 * @param {string} originalDizhi - 原爻地支
 * @param {number} index - 爻的索引 (0-5)
 * @param {string} relation - 六親關係 (用神、原神、忌神、仇神、閒神)
 * @returns {object} - 返回是否入墓或入絕、分數調整倍數和類型描述
 */
export function checkYaoTombExtinction(originalDizhi, index, relation, transformationTypeOrigin) {
    let scoreMultiplier = 1;
    let transformationType = '';

    // 獲取日辰地支
    const dayBranch = document.querySelector('.div12').textContent.slice(-1);

    // 情況2: 動爻間入墓絕
    // 檢查非用神六親的原爻地支是否入日辰墓絕或其他動爻地支的墓絕
    if (relation !== '用神' && originalDizhi &&
        !(transformationTypeOrigin.includes("回頭剋") || transformationTypeOrigin.includes("沖散") || transformationTypeOrigin.includes("空"))) {
        // 檢查是否入日辰墓絕
        const { isTomb: isTombDay, isExtinction: isExtinctionDay } = checkTombExtinction(originalDizhi, dayBranch);

        // 檢查是否入其他動爻地支的墓絕
        let isTombOther = false;
        let isExtinctionOther = false;

        // 獲取所有動爻地支
        const originalYao = document.querySelectorAll('.original-yao');
        originalYao.forEach(yao => {
            const yaoValue = yao.value;
            if (yaoValue === 'O' || yaoValue === 'X') {
                const yaoIndex = 71 - parseInt(Array.from(yao.classList).find(cls => cls.startsWith('div')).substring(3));
                if (yaoIndex !== index) { // 不是當前爻
                    const otherYaoDizhi = document.querySelector(`.div${59 - yaoIndex}`).textContent.charAt(0);
                    const { isTomb, isExtinction } = checkTombExtinction(originalDizhi, otherYaoDizhi);
                    // 迴圈檢查全部可能會入墓絕的爻
                    isTombOther = isTombOther || isTomb;
                    isExtinctionOther = isExtinctionOther || isExtinction;
                }
            }
        });

        // 如果非用神六親的原爻地支入日辰墓絕或其他動爻地支的墓絕 非用神六親的動化分數要乘10%
        if (isTombDay || isExtinctionDay) {
            scoreMultiplier *= 0.1;
            transformationType += isTombDay ? ' 入日墓' : ' 入日絕';
        } else if (isTombOther || isExtinctionOther) {
            scoreMultiplier *= 0.1;
            transformationType += isTombOther ? ' 入墓絕' : ' 入墓絕';
        }
    }

    // 情況3: 用神入非用神動爻墓絕
    mainGodtoTombExtinctionScore(originalDizhi, index, relation);

    return { scoreMultiplier, transformationType };
}

// 情況3: 用神入非用神動爻墓絕
// 檢查用神地支是否入非用神六親的動爻墓絕
// 修改其他爻的分數內容，非當前INDEX動化分數
function mainGodtoTombExtinctionScore(originalDizhi, index, relation) {
    if (relation === '用神') {
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
                        const { isTomb, isExtinction } = checkTombExtinction(originalDizhi, otherYaoDizhi);

                        // 如果用神地支入非用神六親的動爻墓絕
                        if (isTomb || isExtinction) {
                            // 非用神六親動化分數直接為-15
                            const nonMainGodYaoDiv = document.querySelector(`.${yaoClasses[yaoIndex]}`);
                            let nonMainGodYaoInfo = nonMainGodYaoDiv.textContent || '';
                            let displayText = isTomb ? `${otherYaoRelation} 被用神入墓 -15` : `${otherYaoRelation} 被用神入絕 -15`;
                            if (!nonMainGodYaoInfo.includes(displayText)) {
                                nonMainGodYaoDiv.textContent = displayText;
                            }
                        }
                    }
                }
            }
        });
    }
}

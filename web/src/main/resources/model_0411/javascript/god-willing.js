// 引入常量
import {
    NaJiaDiZhi,
    earthlyBranchToElement,
    restrainingElements,
    generatingElements
} from './yijing-constants.js';

import {
    calculateTransformationScore,
    calculateHiddenTransformation,
    checkTombExtinction
} from './advancedScore/transformationScore.js';

import {
    convertRelationToGodType
} from './advancedScore/utils.js';
// 用神資訊mainGodInfo處理邏輯
export function determineMainGod(yaos, originalDizhi, changedDizhi, bianYaoPositions, relationElements, shouGua, shiPosition, yingPosition, harmonyPosition) {
    // 獲取用神五行（div28的六親五行）
    const selectedRelation = document.querySelector('.six-relation-select').value;
    const mainGodElement = relationElements[selectedRelation];
    let mainGodInfo = '';
    let otherShiDizhi = '';
    let isKongWang = false;
    let isShi = false;
    let isChanged = false;
    let isFuShan = false;
    let isMoving = false;
    let isStatic = false;
    let yaoPosition = -1; // 用於保存選中的爻的位置

    // 獲取空亡地支
    const kongWangText = document.querySelector('.div16').textContent;
    const kongWangDizhi = kongWangText.split('');

    // 世爻和應爻在卦中的位置(0-5)
    const shiYaoPosition = shiPosition - 60;
    const yingYaoPosition = yingPosition - 60;

    // 1. 檢查動爻（"O"、"X"）之原爻干支
    const movingYaos = yaos.filter(y => y.value === 'O' || y.value === 'X')
        .sort((a, b) => a.position - b.position);

    if (movingYaos.length > 0) {
        // 收集所有符合用神五行的動爻
        let matchingMovingYaos = [];

        movingYaos.forEach(yao => {
            const position = yao.position;
            const dizhi = originalDizhi[5 - position]; // 倒序索引
            const element = earthlyBranchToElement[dizhi];
            const relation = Object.entries(relationElements)
                .find(([_, v]) => v === element)?.[0] || '';

            if (relation === selectedRelation && harmonyPosition !== position) {
                matchingMovingYaos.push({
                    position,
                    dizhi,
                    relation,
                    isKongWang: kongWangDizhi.includes(dizhi),
                    isShi: position === shiYaoPosition,
                    isYing: position === yingYaoPosition
                });
            }
        });

        matchingMovingYaos = matchingMovingYaos.reverse(); // 倒序排序

        // 按優先順序選擇用神
        if (matchingMovingYaos.length > 0) {
            const kongWangShiYao = matchingMovingYaos.find(y => y.isKongWang && y.isShi);
            const kongWangYao = matchingMovingYaos.find(y => y.isKongWang);
            const shiYao = matchingMovingYaos.find(y => y.isShi);
            // 1.0 選擇空亡地支且持世爻
            if (kongWangShiYao) {
                mainGodInfo = `${kongWangShiYao.dizhi}${kongWangShiYao.relation}`;
                isKongWang = true;
                isShi = true;
                yaoPosition = kongWangShiYao.position;
            }
            // 1.1 優先選擇空亡地支
            else if (kongWangYao) {
                mainGodInfo = `${kongWangYao.dizhi}${kongWangYao.relation}`;
                isKongWang = true;
                yaoPosition = kongWangYao.position;
            }
            // 1.2 其次選擇世爻
            else if (shiYao) {
                mainGodInfo = `${shiYao.dizhi}${shiYao.relation}`;
                isShi = true;
                yaoPosition = shiYao.position;
            }
            // 1.3 再次選擇應爻
            else if (matchingMovingYaos.find(y => y.isYing)) {
                const yingYao = matchingMovingYaos.find(y => y.isYing);
                mainGodInfo = `${yingYao.dizhi}${yingYao.relation}`;
                yaoPosition = yingYao.position;
            }
            // 1.4 最後選擇第一個
            else {
                const firstYao = matchingMovingYaos.pop();
                mainGodInfo = `${firstYao.dizhi}${firstYao.relation}`;
                yaoPosition = firstYao.position;
            }

            // 主要用神為動爻取得
            isMoving = true;
        }
    }

    // 2. 如果動爻沒有找到，檢查靜爻（"/"、"//"）之原爻干支
    if (!mainGodInfo) {
        const staticYaos = yaos.filter(y => y.value === '/' || y.value === '//')
            .sort((a, b) => a.position - b.position);

        if (staticYaos.length > 0) {
            // 收集所有符合用神五行的靜爻
            const matchingStaticYaos = [];

            staticYaos.forEach(yao => {
                const position = yao.position;
                const dizhi = originalDizhi[5 - position]; // 倒序索引
                const element = earthlyBranchToElement[dizhi];
                const relation = Object.entries(relationElements)
                    .find(([_, v]) => v === element)?.[0] || '';

                if (relation === selectedRelation) {
                    matchingStaticYaos.push({
                        position,
                        dizhi,
                        relation,
                        isKongWang: kongWangDizhi.includes(dizhi),
                        isShi: position === shiYaoPosition,
                        isYing: position === yingYaoPosition
                    });
                }
            });

            // 按優先順序選擇用神
            if (matchingStaticYaos.length > 0) {
                const kongWangShiYao = matchingStaticYaos.find(y => y.isKongWang && y.isShi);
                const kongWangYao = matchingStaticYaos.find(y => y.isKongWang);
                const shiYao = matchingStaticYaos.find(y => y.isShi);
                // 2.0 選擇空亡地支且持世爻
                if (kongWangShiYao) {
                    mainGodInfo = `${kongWangShiYao.dizhi}${kongWangShiYao.relation}`;
                    isKongWang = true;
                    isShi = true;
                    yaoPosition = kongWangShiYao.position;
                }
                // 2.1 優先選擇空亡地支
                else if (kongWangYao) {
                    mainGodInfo = `${kongWangYao.dizhi}${kongWangYao.relation}`;
                    isKongWang = true;
                    yaoPosition = kongWangYao.position;
                }
                // 2.2 其次選擇世爻
                else if (shiYao) {
                    mainGodInfo = `${shiYao.dizhi}${shiYao.relation}`;
                    isShi = true;
                    yaoPosition = shiYao.position;
                }
                // 2.3 再次選擇應爻
                else if (matchingStaticYaos.find(y => y.isYing)) {
                    const yingYao = matchingStaticYaos.find(y => y.isYing);
                    mainGodInfo = `${yingYao.dizhi}${yingYao.relation}`;
                    yaoPosition = yingYao.position;
                }
                // 2.4 最後選擇第一個
                else {
                    const firstYao = matchingStaticYaos.pop();
                    mainGodInfo = `${firstYao.dizhi}${firstYao.relation}`;
                    yaoPosition = firstYao.position;
                }

                // 主要用神為靜爻取得
                isStatic = true;
            }
        }
    }

    // 3. 檢查日辰地支 (不會有空亡的情況)
    if (!mainGodInfo) {
        const dayBranch = document.querySelector('.div12').textContent.slice(-1);
        const dayElement = earthlyBranchToElement[dayBranch];

        if (dayElement === mainGodElement) {
            const dayRelation = selectedRelation;
            mainGodInfo = `${dayBranch}${dayRelation} (日辰)`;
            yaoPosition = -1; // 日辰不是爻位
        }
    }

    // 4. 檢查月建地支
    if (!mainGodInfo) {
        const monthBranch = document.querySelector('.div10').textContent.slice(-1);
        const monthElement = earthlyBranchToElement[monthBranch];

        if (monthElement === mainGodElement) {
            const monthRelation = selectedRelation;
            mainGodInfo = `${monthBranch}${monthRelation} (月建)`;
            yaoPosition = -1; // 月建不是爻位

            // 檢查是否為空亡地支
            if (kongWangDizhi.includes(monthBranch)) {
                isKongWang = true;
            }
        }
    }

    // 5. 檢查變爻干支
    if (!mainGodInfo && bianYaoPositions.length > 0) {
        // 收集所有符合用神五行的變爻
        const matchingChangedYaos = [];

        bianYaoPositions.forEach(position => {
            const dizhi = changedDizhi[5 - position]; // 倒序索引
            const element = earthlyBranchToElement[dizhi];
            const relation = Object.entries(relationElements)
                .find(([_, v]) => v === element)?.[0] || '';

            if (relation === selectedRelation) {
                matchingChangedYaos.push({
                    position,
                    dizhi,
                    relation,
                    isKongWang: kongWangDizhi.includes(dizhi)
                });
            }
        });

        const kongWangYao = matchingChangedYaos.find(y => y.isKongWang);
        if (kongWangYao) {
            mainGodInfo = `${kongWangYao.dizhi}${kongWangYao.relation}`;
            isKongWang = true;
            isChanged = true;
            yaoPosition = kongWangYao.position;
        }
        // 由下往上取第一個
        else if (matchingChangedYaos.length > 0) {
            const firstChangedYao = matchingChangedYaos.pop();
            mainGodInfo = `${firstChangedYao.dizhi}${firstChangedYao.relation}`;
            isChanged = true;
            yaoPosition = firstChangedYao.position;
        }
    }

    // 6. 取伏神
    if (!mainGodInfo) {
        const fuShenResult = updateFuShen(shouGua, relationElements, true);
        if (fuShenResult) {
            mainGodInfo = fuShenResult;

            // 檢查是否為空亡地支
            if (kongWangDizhi.includes(fuShenResult[0])) {
                isKongWang = true;
            }

            isFuShan = true;
            yaoPosition = -1; // 伏神不是爻位
        }
    } else {
        // 清除伏神
        updateFuShen(shouGua, relationElements, false);
    }

    // 7. 檢查是否有其餘相同六親持世
    if (isMoving || isStatic) {
        let shiYaoExcept = shiYaoExceptionScore(yaos, originalDizhi, relationElements, selectedRelation, shiYaoPosition, isShi);
        isShi = shiYaoExcept.isShi;
        otherShiDizhi = shiYaoExcept.returnDizhi;
    }

    if (isChanged) {
        mainGodInfo += '（變爻）';
    }
    if (isFuShan) {
        mainGodInfo += '（伏神）';
    }
    if (isKongWang) {
        mainGodInfo += '（空亡）';
    }
    if (isShi) {
        mainGodInfo += '（持世）';
    }
    // 更新用神資訊顯示
    document.querySelector('.mainGodInfo').textContent = mainGodInfo;

    return { isKongWang, isShi, isChanged, isFuShan, yaoPosition, otherShiDizhi };
}

// 世爻例外情況計分
function shiYaoExceptionScore(yaos, originalDizhi, relationElements, selectedRelation, shiYaoPosition, isShi) {
    const matchingStaticYaos = [];
    let returnDizhi = '';

    yaos.forEach(yao => {
        const position = yao.position;
        const dizhi = originalDizhi[5 - position]; // 倒序索引
        const element = earthlyBranchToElement[dizhi];
        const relation = Object.entries(relationElements)
            .find(([_, v]) => v === element)?.[0] || '';

        if (relation === selectedRelation) {
            matchingStaticYaos.push({
                isShi: position === shiYaoPosition,
                dizhi
            });
        }
    });
    // 按優先順序選擇用神
    if (matchingStaticYaos.length > 0) {
        const shiYao = matchingStaticYaos.find(y => y.isShi);
        if (shiYao) {
            isShi = true;
            returnDizhi = shiYao.dizhi;
        }
    }

    return { isShi, returnDizhi };
}

export function updateSunScore(relationElements) {
    const selectedRelation = document.querySelector('.six-relation-select').value;
    const mainGodElement = relationElements[selectedRelation];
    const dayBranch = document.querySelector('.div12').textContent.slice(-1);
    const dayBranchElement = earthlyBranchToElement[dayBranch];
    let sunInfo = '';
    let sunScore = 0;

    // 判斷日辰五行與用神五行的關係
    if (dayBranchElement === mainGodElement) {
        // 日辰五行同用神五行 日助
        sunInfo = '日助';
        sunScore = 80;
    } else {

        if (generatingElements[dayBranchElement] === mainGodElement) {
            // 日辰五行生用神五行 日生
            sunInfo = '日生';
            sunScore = 75;
        } else if (restrainingElements[dayBranchElement] === mainGodElement) {
            // 日辰五行剋用神五行 日剋
            sunInfo = '日剋';
            sunScore = 55;
        } else {
            // 其餘情況 日平
            sunInfo = '日平';
            sunScore = 60;
        }
    }

    const mainGodDizhi = document.querySelector('.mainGodInfo').textContent.slice(0, 1);

    // 檢查主要用神地支是否入日辰墓絕
    const { isTomb, isExtinction } = checkTombExtinction(mainGodDizhi, dayBranch);
    if (isTomb) {
        sunScore = 50;
        sunInfo = '入日墓';
    }
    else if (isExtinction) {
        sunScore = 50;
        sunInfo = '入日絕';
    }

    // 更新日辰分數顯示
    document.querySelector('.sunInfo').innerHTML = `${sunInfo} <span>${sunScore}</span>`;

    return { sunScore, isTomb, isExtinction };
}

export function updateMoonScore(relationElements) {
    const selectedRelation = document.querySelector('.six-relation-select').value;
    const mainGodElement = relationElements[selectedRelation];
    const monthBranch = document.querySelector('.div10').textContent.slice(-1);
    const monthBranchElement = earthlyBranchToElement[monthBranch];
    let moonInfo = '';
    let moonScore = 0;

    // 判斷月建五行與用神五行的關係
    if (monthBranchElement === mainGodElement || generatingElements[monthBranchElement] === mainGodElement) {
        // 月建五行同用神五行 或 生用神五行 月旺相
        moonInfo = '月旺相';
        moonScore = 70;
    } else {
        moonInfo = '月休囚';
        moonScore = 60;
    }

    // 更新月建分數顯示
    document.querySelector('.moonInfo').innerHTML = `${moonInfo} <span>${moonScore}</span>`;

    return moonScore;
}

export function updateGodWillingScore(isKongWang, isShi, sunScore, moonScore, isChanged, isFuShan, isTomb, isExtinction, otherShiDizhi) {
    let result = 0;

    // 月旺相 且 用神不為入日墓絕
    if (moonScore === 70 && !isTomb && !isExtinction) {
        if (sunScore > 60) {// 日助 日生
            result = sunScore;
        } else if (sunScore === 60) {// 日平
            result = moonScore;
        } else {// 日剋
            result = (moonScore + sunScore) / 2;
        }
    }
    // 月休囚
    else {
        result = sunScore;
    }

    // 獲取空亡地支
    const kongWangText = document.querySelector('.div16').textContent;
    const kongWangDizhi = kongWangText.split('');

    if (isKongWang) {
        result = sunScore > 60 ? (50 + sunScore) / 2 : 50;
    }
    if (isShi) {
        result = !kongWangDizhi.includes(otherShiDizhi) ? result + 5 : result;
    }
    if (isChanged || isFuShan) {
        result -= 5;
    }

    document.querySelector('.willingInfo').innerHTML = `<span>${result}</span>`;
}

// 新增伏神更新函数
export function updateFuShen(shouGua, relationElements, activeFlag) {
    const fuShenDizhi = NaJiaDiZhi[shouGua];
    const selectedRelation = document.querySelector('.six-relation-select').value;
    let showFlag = false;
    let fuShenResult = '';

    fuShenDizhi.forEach((dz, index) => {
        const element = earthlyBranchToElement[dz];
        const relation = Object.entries(relationElements)
            .find(([_, v]) => v === element)?.[0] || '';

        // 只有在選中六親的時候才顯示，並且只顯示一次
        if (selectedRelation === relation && !showFlag && activeFlag) {
            // 更新div42-47显示（倒序）
            document.querySelector(`.div${47 - index}`).innerHTML = `<span class="hidden-god">${dz}${relation}</span>`;
            fuShenResult = `${dz}${relation}`;
            showFlag = true;
        }
        else {
            document.querySelector(`.div${47 - index}`).innerHTML = `<span class="hidden-god"></span>`;
        }
    });

    return fuShenResult;
}

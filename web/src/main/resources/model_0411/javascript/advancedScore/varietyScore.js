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
} from '../yijing-constants.js';

import {
    determineMainGod,
    updateSunScore,
    updateMoonScore,
    updateGodWillingScore
} from '../god-willing.js';

export function varietyScoreOrigin(dz, index) {
    // 檢查是否與日沖地支相同
    const dayClashBranch = document.querySelector('.div15').textContent;
    const isClash = dz === dayClashBranch;

    // 檢查是否與空亡地支相同
    const kongWangText = document.querySelector('.div16').textContent;
    const kongWangDizhi = kongWangText.split('');
    const isKongWang = kongWangDizhi.includes(dz);

    // 創建標記元素
    if (isClash || isKongWang) {
        const dizhiDiv = document.querySelector(`.div${59 - index}`);
        let markupHTML = '';
        if (markupStyle === 'visual') {
            // 視覺標記方式（紅色圓圈和藍色底線）
            if (isKongWang && isClash) {
                markupHTML = `<span style="color: purple; border: 2px solid red; border-radius: 50%; box-shadow : 0 0 0 1px blue; text-decoration-color: blue; padding: 0 2px;">${dz}</span>`;
            } else if (isKongWang) {
                markupHTML = `<span style="color: red; border: 2px solid red; border-radius: 50%; padding: 0 2px;">${dz}</span>`;
            } else if (isClash) {
                markupHTML = `<span style="color: blue; border-botten : 1px solid blue; text-decoration-color: blue; padding: 0 2px;">${dz}</span>`;
            }
        } else {
            // 文字標記方式（顯示「空」「沖」文字）
            if (isKongWang && isClash) {
                markupHTML = `${dz}<div class="markup"><span>空</span><span>沖</span></div>`;
            } else if (isKongWang) {
                markupHTML = `${dz}<div class="markup"><span>空</span></div>`;
            } else if (isClash) {
                markupHTML = `${dz}<div class="markup"><span>沖</span></div>`;
            }
        }
        // 直接用標記替換原有內容
        dizhiDiv.innerHTML = markupHTML;

        // 更新first-yao~sixth-yao的對應ROW區塊
        const yaoPosition = index; // 轉換為爻位置 (0-5)
        const yaoDiv = document.querySelector(`.${yaoClasses[yaoPosition]}`);

        // // 添加標記到對應爻位
        // let yaoInfo = yaoDiv.textContent || '';
        // if (isClash) {
        //     if (!yaoInfo.includes('日沖')) {
        //         yaoInfo += (yaoInfo ? ' ' : '') + '日沖';
        //     }
        // }
        // if (isKongWang) {
        //     if (!yaoInfo.includes('空亡')) {
        //         yaoInfo += (yaoInfo ? ' ' : '') + '空亡';
        //     }
        // }
        // yaoDiv.textContent = yaoInfo;
    }

    // 返回空亡和日沖狀態，供其他函數使用
    return { isKongWang, isClash };
}

export function varietyScoreChanging(dz, index) {
    const dizhiDiv = document.querySelector(`.div${83 - index}`);
    dizhiDiv.textContent = dz;
    const dayClashBranch = document.querySelector('.div15').textContent;
    const isClash = dz === dayClashBranch;
    const kongWangText = document.querySelector('.div16').textContent;
    const kongWangDizhi = kongWangText.split('');
    const isKongWang = kongWangDizhi.includes(dz);
    if (isClash || isKongWang) {
        let markupHTML = '';
        if (markupStyle === 'visual') {
            if (isKongWang && isClash) {
                markupHTML = `<span style="color: purple; border: 2px solid red; border-radius: 50%; box-shadow : 0 0 0 1px blue; text-decoration-color: blue; padding: 0 2px;">${dz}</span>`;
            } else if (isKongWang) {
                markupHTML = `<span style="color: red; border: 2px solid red; border-radius: 50%; padding: 0 2px;">${dz}</span>`;
            } else if (isClash) {
                markupHTML = `<span style="color: blue; border-botten : 1px solid blue; text-decoration-color: blue; padding: 0 2px;">${dz}</span>`;
            }
        } else {
            if (isKongWang && isClash) {
                markupHTML = `${dz}<div class="markup"><span>空</span><span>沖</span></div>`;
            } else if (isKongWang) {
                markupHTML = `${dz}<div class="markup"><span>空</span></div>`;
            } else if (isClash) {
                markupHTML = `${dz}<div class="markup"><span>沖</span></div>`;
            }
        }
        dizhiDiv.innerHTML = markupHTML;
        const yaoPosition = index;
        const yaoDiv = document.querySelector(`.${yaoClasses[yaoPosition]}`);
        // let yaoInfo = yaoDiv.textContent || '';
        // if (isClash) {
        //     if (!yaoInfo.includes('日沖')) {
        //         yaoInfo += (yaoInfo ? ' ' : '') + '日沖';
        //     }
        // }
        // if (isKongWang) {
        //     if (!yaoInfo.includes('變爻空亡')) {
        //         yaoInfo += (yaoInfo ? ' ' : '') + '變爻空亡';
        //     }
        // }
        // yaoDiv.textContent = yaoInfo;
    }
}
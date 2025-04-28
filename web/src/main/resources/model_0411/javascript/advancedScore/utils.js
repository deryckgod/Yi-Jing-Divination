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
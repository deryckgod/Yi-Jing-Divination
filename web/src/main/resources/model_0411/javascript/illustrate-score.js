// 更新分數顯示函數
export function updateScoreDisplay() {
    const illustrateScore = document.querySelector('.illustate-score');
    // 清除除了主卦和總分以外的所有元素
    const children = Array.from(illustrateScore.children);
    for (let i = children.length - 1; i >= 0; i--) {
        if (!children[i].classList.contains('mainGod') && !children[i].classList.contains('totalScore')) {
            illustrateScore.removeChild(children[i]);
        }
    }

    // 獲取六爻的值
    const yaoValues = [
        document.querySelector('.first-yao').textContent,
        document.querySelector('.second-yao').textContent,
        document.querySelector('.third-yao').textContent,
        document.querySelector('.fourth-yao').textContent,
        document.querySelector('.fifth-yao').textContent,
        document.querySelector('.sixth-yao').textContent
    ];

    // 計算總分
    let totalScore = parseFloat(document.querySelector('.willingInfo').textContent);
    console.log(totalScore);
    const totalScoreElement = illustrateScore.querySelector('.totalScore');

    // 為每個有值的爻添加一行
    yaoValues.forEach((value, index) => {
        if (value && value !== `${index + 1}-yao`) {
            // 提取分數 - 假設分數在括號中，如 "some text (10)"
            const scoreMatch = value.match(/[-+]?\d+(\.\d+)?$/);
            const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;
            totalScore += score;

            // 創建新的分數項
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';

            // 設置網格位置
            if (index < 3) {
                // 第1-3個項目從column=2、row=1開始垂直排列
                scoreItem.style.gridColumn = '2';
                scoreItem.style.gridRow = `${index + 2}`;
            } else {
                // 第4-6個項目從column=1、row=1開始垂直排列
                scoreItem.style.gridColumn = '1';
                scoreItem.style.gridRow = `${index - 3 + 2}`;
            }

            if (scoreMatch) {
                // 提取文字部分（不包含數字）
                const textPart = value.substring(0, value.lastIndexOf(scoreMatch[0])).trim();

                // 創建文字部分
                scoreItem.textContent = textPart + ' ';

                // 創建數字部分，使用span標籤並添加.number類
                const numberSpan = document.createElement('span');
                numberSpan.className = 'number';
                numberSpan.textContent = scoreMatch[0];
                scoreItem.appendChild(numberSpan);
            } else {
                // 如果沒有數字，直接顯示全部文字
                scoreItem.textContent = value;
            }

            // 插入到總分之後
            illustrateScore.appendChild(scoreItem);
        }
    });
    const totalScoreSpan = document.createElement('span');
    totalScoreSpan.className = 'number';
    totalScoreSpan.textContent = parseFloat((totalScore).toFixed(2));;
    // 更新總分
    totalScoreElement.textContent = `總分： `;
    totalScoreElement.appendChild(totalScoreSpan);

    // 設置總分的網格位置，跨越兩列
    totalScoreElement.style.gridColumn = '1 / span 2';
    totalScoreElement.style.gridRow = '1';
}
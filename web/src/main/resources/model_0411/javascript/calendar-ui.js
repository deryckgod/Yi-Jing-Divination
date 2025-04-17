/**
 * 日曆UI控制模塊
 * 處理日曆組件的顯示/隱藏和響應式調整
 */

// 在DOM加載完成後初始化
document.addEventListener('DOMContentLoaded', function () {
    initCalendarUI();
});

/**
 * 初始化日曆UI控制
 */
function initCalendarUI() {
    const calendarToggleBtn = document.getElementById('calendar-toggle-btn');
    const calendarOverlay = document.querySelector('.calendar-overlay');
    const widgetCalendar = document.querySelector('.widget-calendar');
    const calendarCloseBtn = document.querySelector('.calendar-close-btn');
    const calendarContainer = document.querySelector('.calendar-container');

    if (!calendarToggleBtn || !calendarOverlay || !widgetCalendar || !calendarCloseBtn) {
        console.error('日曆UI元素未找到');
        return;
    }

    // 顯示或隱藏日曆
    function toggleCalendar() {
        widgetCalendar.classList.toggle('visible');
        calendarOverlay.classList.toggle('visible');
        calendarCloseBtn.classList.toggle('visible');
        calendarContainer.classList.toggle('visible');
    }

    // 點擊按鈕顯示日曆
    calendarToggleBtn.addEventListener('click', toggleCalendar);

    // 點擊關閉按鈕隱藏日曆
    calendarCloseBtn.addEventListener('click', toggleCalendar);

    // 點擊遮罩層隱藏日曆
    calendarOverlay.addEventListener('click', toggleCalendar);

    // 阻止日曆內部點擊事件冒泡到遮罩層
    // calendarContainer.addEventListener('click', function (event) {
    //     event.stopPropagation();
    // });

    // 監聽日期選擇事件
    widgetCalendar.addEventListener('onSelect', function () {
        // 選擇日期後延遲關閉日曆，確保事件處理完成
        //setTimeout(toggleCalendar, 300);
    });

    // 響應式調整
    function adjustCalendarSize() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (viewportWidth <= 480) {
            // 移動設備上的調整
            calendarContainer.style.width = '100%';
            calendarContainer.style.maxHeight = '80vh';
        } else if (viewportWidth <= 768) {
            // 平板設備上的調整
            calendarContainer.style.width = '95vw';
            calendarContainer.style.maxHeight = '90vh';
        } else {
            // 桌面設備上的調整
            calendarContainer.style.width = 'auto';
            calendarContainer.style.maxHeight = '90vh';
        }
    }

    // 初始調整大小
    adjustCalendarSize();

    // 監聽視窗大小變化
    window.addEventListener('resize', adjustCalendarSize);
}

/**
 * 公開的顯示/隱藏日曆方法
 * 可以從其他模塊調用
 */
export function toggleCalendar() {
    const widgetCalendar = document.querySelector('.widget-calendar');
    const calendarOverlay = document.querySelector('.calendar-overlay');
    const calendarCloseBtn = document.querySelector('.calendar-close-btn');
    const calendarContainer = document.querySelector('.calendar-container');

    if (widgetCalendar && calendarOverlay && calendarCloseBtn && calendarContainer) {
        widgetCalendar.classList.toggle('visible');
        calendarOverlay.classList.toggle('visible');
        calendarCloseBtn.classList.toggle('visible');
        calendarContainer.classList.toggle('visible');
    }
}
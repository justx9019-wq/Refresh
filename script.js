const CYCLE_DAYS = 5;
const CIRCUMFERENCE = 2 * Math.PI * 90; // 565.48

// جلب العناصر من الواجهة
const daysCountEl = document.getElementById('days-count');
const daysLabelEl = document.getElementById('days-label');
const subCountdownEl = document.getElementById('sub-countdown');
const progressBar = document.getElementById('progress-bar');
const lastRefreshEl = document.getElementById('last-refresh-date');
const nextRefreshEl = document.getElementById('next-refresh-date');
const refreshBtn = document.getElementById('refresh-btn');

// دالة لتنسيق التاريخ بالأرقام فقط (DD/MM/YYYY)
function formatDateNumeric(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// دالة سحرية لحساب اللون المناسب بناءً على نسبة الوقت المتبقي (من 0 إلى 1)
function getColorForProgress(progress) {
    let hue;
    if (progress > 0.5) {
        // النصف الأول من الدورة: تحول ناعم من البرتقالي الدافئ (درجة 40) إلى الأزرق السماوي من أبل (درجة 200)
        const p = (progress - 0.5) / 0.5; // تحويل النطاق ليكون بين 0 و 1
        hue = 40 + p * (200 - 40);
    } else {
        // النصف الأخير من الدورة: تحول تدريجي من الأحمر الناري (درجة 0) إلى البرتقالي (درجة 40)
        const p = progress / 0.5; // تحويل النطاق ليكون بين 0 و 1
        hue = p * 40;
    }
    // إرجاع اللون بصيغة HSL مع تشبع وإضاءة مثالية للشاشات الداكنة
    return `hsl(${hue}, 90%, 55%)`;
}

// تحديث الواجهة والعداد التنازلي بالثانية
function updateUI() {
    let lastRefresh = localStorage.getItem('last_refresh_time');
    
    // بدء دورة جديدة افتراضياً إذا كانت الذاكرة فارغة
    if (!lastRefresh) {
        lastRefresh = new Date().getTime();
        localStorage.setItem('last_refresh_time', lastRefresh);
    }

    const now = new Date().getTime();
    const cycleMs = CYCLE_DAYS * 24 * 60 * 60 * 1000;
    const elapsedMs = now - parseInt(lastRefresh);
    
    // حساب الوقت المتبقي بالملي ثانية والنسبة المئوية
    const remainingMs = Math.max(0, cycleMs - elapsedMs);
    const progress = remainingMs / cycleMs; // قيمة بين 0.0 و 1.0

    // حساب تفاصيل الوقت (أيام، ساعات، دقائق، ثواني)
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

    // 1. تحديث الأيام والنص التابع لها
    daysCountEl.innerText = days;
    if (days === 1) {
        daysLabelEl.innerText = "يوم متبقي";
    } else if (days === 2) {
        daysLabelEl.innerText = "يومان متبقيان";
    } else if (days > 2 && days <= 10) {
        daysLabelEl.innerText = "أيام متبقية";
    } else {
        daysLabelEl.innerText = "يوم";
    }

    // 2. تحديث عداد الساعات والدقائق والثواني بدقة (على شكل 12:05:45)
    const displayHours = String(hours).padStart(2, '0');
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(seconds).padStart(2, '0');
    subCountdownEl.innerText = `${displayHours}:${displayMinutes}:${displaySeconds}`;

    // 3. تحديث شريط التقدم الدائري
    const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
    progressBar.style.strokeDashoffset = offset;

    // 4. تطبيق التلوين الذكي الديناميكي للدائرة والنص التنازلي معاً
    const dynamicColor = getColorForProgress(progress);
    progressBar.style.stroke = dynamicColor;
    subCountdownEl.style.color = dynamicColor;

    // إضافة تأثير نبض (Pulse) عندما يتبقى أقل من يوم واحد لزيادة التنبيه
    if (days < 1) {
        subCountdownEl.classList.add('animate-pulse');
    } else {
        subCountdownEl.classList.remove('animate-pulse');
    }

    // 5. عرض تاريخ آخر تجديد والتجديد القادم كأرقام بالكامل وبدون أسماء أشهر
    const lastDate = new Date(parseInt(lastRefresh));
    const nextDate = new Date(parseInt(lastRefresh) + cycleMs);

    lastRefreshEl.innerText = formatDateNumeric(lastDate);
    nextRefreshEl.innerText = formatDateNumeric(nextDate);
}

// دالة إعادة التعيين والربط مع نظام الاختصارات عند الضغط على الزر
function triggerRefresh() {
    const now = new Date().getTime();
    localStorage.setItem('last_refresh_time', now);
    
    // تحديث فوري للواجهة لتعطيك شعوراً بالاستجابة السريعة
    updateUI();

    // فتح الاختصار في نظام iOS/iPadOS لتجديد الإشعار الرسمي
    setTimeout(() => {
        window.location.href = "shortcuts://run-shortcut?name=مجدد شهادات SideStore";
    }, 600);
}

// ربط الزر بالدالة
refreshBtn.addEventListener('click', triggerRefresh);

// تشغيل العداد وتحديثه بشكل فوري ومستمر كل ثانية واحدة
updateUI();
setInterval(updateUI, 1000);

const tradingSundays2025 = [
    "2025-01-26", "2025-03-30", "2025-04-27", "2025-06-29",
    "2025-08-31", "2025-12-14", "2025-12-21"
];

const tradingSundays2026 = [
    "2026-01-25", "2026-03-29", "2026-04-26", "2026-06-28",
    "2026-08-30", "2026-12-06", "2026-12-13", "2026-12-20"
];

const allTradingSundays = [...tradingSundays2025, ...tradingSundays2026];

const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const isSunday = today.getDay() === 0;

const resultEl = document.getElementById("result");
const upcomingEl = document.getElementById("upcoming");
const nextSundayEl = document.getElementById("next-sunday");

if (isSunday && allTradingSundays.includes(todayStr)) {
    resultEl.textContent = "TAK! 🛒";
    resultEl.classList.add("yes");
} else if (isSunday) {
    resultEl.textContent = "NIE. 💤";
    resultEl.classList.add("no");
} else {
    const weekdayName = today.toLocaleDateString("pl-PL", {weekday: "long"});
    resultEl.textContent = `Nie, dziś jest ${weekdayName}`;
    resultEl.classList.add("no");

    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7));
    const nextSundayStr = nextSunday.toISOString().split("T")[0];

    const isNextSundayTrading = allTradingSundays.includes(nextSundayStr);
    const formattedNext = nextSunday.toLocaleDateString("pl-PL", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const info = isNextSundayTrading
        ? `Najbliższa niedziela (${formattedNext}) jest <span class="highlight">handlowa 🛒</span>.`
        : `Najbliższa niedziela (${formattedNext}) <span class="highlight">nie jest handlowa 💤</span>.`;

    const p = document.createElement("p");
    p.innerHTML = info;
    nextSundayEl.appendChild(p);
}

const futureSundays = allTradingSundays.filter(date => date > todayStr).slice(0, 10);
let lastYear = null;

for (const date of futureSundays) {
    const d = new Date(date);
    const year = d.getFullYear();

    if (lastYear !== null && year !== lastYear) {
        const separatorLi = document.createElement("li");
        separatorLi.textContent = "";
        separatorLi.style.fontWeight = "bold";
        separatorLi.style.margin = "1rem 0 0.5rem";
        separatorLi.style.listStyle = "none";
        upcomingEl.appendChild(separatorLi);
    }
    lastYear = year;

    const formatted = d.toLocaleDateString("pl-PL", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const li = document.createElement("li");
    li.textContent = formatted;

    upcomingEl.appendChild(li);
}

document.getElementById("download-ical").addEventListener("click", () => {
    const events = allTradingSundays.map(date => {
        return `
BEGIN:VEVENT
DTSTAMP:${formatICalDate(new Date())}
UID:${date}@niedziela-handlowa
DTSTART;VALUE=DATE:${date.replace(/-/g, '')}
DTEND;VALUE=DATE:${addOneDay(date).replace(/-/g, '')}
SUMMARY:Niedziela handlowa
TRANSP:TRANSPARENT
END:VEVENT`.trim();
    }).join("\n");

    const ical = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//pivovarit/niedziela-handlowa
METHOD:PUBLISH
${events}
END:VCALENDAR`;

    const blob = new Blob([ical], {type: 'text/calendar'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "niedziele-handlowe-2025-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
});

function formatICalDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addOneDay(dateStr) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}
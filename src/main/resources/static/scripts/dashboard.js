document.addEventListener("DOMContentLoaded", async function () {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let tradeDataGlobal = [];

    try {
        const response = await fetch("/getAllTrades");
        const trades = await response.json();
        tradeDataGlobal = trades;

        if (!Array.isArray(trades)) {
            console.error("Invalid data received:", trades);
            return;
        }

        const sum = arr => arr.reduce((a, b) => a + b, 0);
        const avg = arr => arr.length ? sum(arr) / arr.length : 0;

        // === Metrics ===
        const totalTrades = trades.length;
        const totalProfit = sum(trades.map(t => t.pnl)).toFixed(2);
        const wins = trades.filter(t => t.pnl > 0).length;
        const losses = totalTrades - wins;
        const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;

        const buyCount = trades.filter(t => t.tradeType.toLowerCase() === "buy").length;
        const sellCount = trades.filter(t => t.tradeType.toLowerCase() === "sell").length;

        const emotions = {
            entrySetup: avg(trades.map(t => t.entrySetup || 0)),
            exitDiscipline: avg(trades.map(t => t.exitDiscipline || 0)),
            correctQuantity: avg(trades.map(t => t.correctQuantity || 0)),
            calculatedRisk: avg(trades.map(t => t.calculatedRisk || 0)),
            emotionDiscipline: avg(trades.map(t => t.emotionDiscipline || 0))
        };

        const labels = trades.map(t => new Date(t.tradeDate).toLocaleDateString());
        const plData = trades.map(t => t.pnl);

        // === Update Stats Summary ===
        document.querySelector('.card:nth-child(1) p').innerText = totalTrades;
        document.querySelector('.card:nth-child(2) p').innerText =
            (totalProfit >= 0 ? "+" : "") + `$${totalProfit}`;
        document.querySelector('.card:nth-child(2) p').className = totalProfit >= 0 ? 'positive' : 'negative';
        document.querySelector('.card:nth-child(3) p').innerText = `${winRate}%`;

        // R/R ratio calculation (based on reward/pnl string parsing, optional)
        const rrRatio = avg(trades.map(t => {
            const risk = parseFloat(t.risk);
            const pnl = t.pnl;

            if (isNaN(risk) || risk === 0 || pnl === null) return 1;

            return Math.abs(pnl) / risk;
        }));
        document.querySelector('.card:nth-child(4) p').innerText = `1:${rrRatio.toFixed(1)}`;

        // === Profit Chart ===
        new Chart(document.getElementById('profitChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Profit/Loss ($)',
                    data: plData,
                    borderColor: '#00a86b',
                    backgroundColor: 'rgba(0, 168, 107, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#00a86b'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top', labels: { color: '#1e1e2f' }},
                    title: { display: true, text: 'Profit Over Time', color: '#1e1e2f' }
                },
                scales: {
                    x: { ticks: { color: '#1e1e2f' }},
                    y: { beginAtZero: true, ticks: { color: '#1e1e2f' }}
                }
            }
        });

        // === Win vs Loss Chart ===
        new Chart(document.getElementById('winLossChart').getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ['#4caf50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Win vs Loss Distribution', color: '#1e1e2f' },
                    legend: { labels: { color: '#1e1e2f' }}
                }
            }
        });

        // === Buy vs Sell Chart ===
        new Chart(document.getElementById('tradeTypeChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Buy', 'Sell'],
                datasets: [{
                    data: [buyCount, sellCount],
                    backgroundColor: ['#2196f3', '#ff9800']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Buy vs Sell Trades', color: '#1e1e2f' },
                    legend: { labels: { color: '#1e1e2f' }}
                }
            }
        });

        // === Radar Chart (Emotions & Discipline) ===
        new Chart(document.getElementById('emotionDisciplineChart').getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Entry Setup', 'Exit Discipline', 'Correct Quantity', 'Calculated Risk', 'Emotion Discipline'],
                datasets: [{
                    label: 'Avg Rating (1–10)',
                    data: [
                        emotions.entrySetup,
                        emotions.exitDiscipline,
                        emotions.correctQuantity,
                        emotions.calculatedRisk,
                        emotions.emotionDiscipline
                    ],
                    backgroundColor: 'rgba(33,150,243,0.2)',
                    borderColor: '#2196f3',
                    pointBackgroundColor: '#2196f3'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Emotional & Mental Ratings',
                        color: '#1e1e2f'
                    },
                    legend: {
                        labels: { color: '#1e1e2f' }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: '#ccc' },
                        grid: { color: '#eee' },
                        pointLabels: { color: '#1e1e2f' },
                        ticks: { beginAtZero: true, color: '#1e1e2f' }
                    }
                }
            }
        });

        // === Helper: Format local date string ===
        function formatLocalDateKey(date) {
            const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            return local.toISOString().split('T')[0];
        }

        // === Calendar P/L View ===
        function renderCalendar(trades, year, month) {
            const calendarEl = document.getElementById('calendar');
            const monthTitleEl = document.getElementById('calendar-month-title');
            if (!calendarEl || !monthTitleEl) return;

            calendarEl.innerHTML = '';
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            monthTitleEl.innerText = `${monthNames[month]} ${year}`;

            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            weekdays.forEach(day => {
                const header = document.createElement('div');
                header.classList.add('calendar-header');
                header.innerText = day;
                calendarEl.appendChild(header);
            });

            // Map of date (yyyy-mm-dd) => total PnL
            const tradeMap = {};
            trades.forEach(t => {
                const date = new Date(t.tradeDate);
                const key = formatLocalDateKey(date);
                if (!tradeMap[key]) tradeMap[key] = 0;
                tradeMap[key] += t.pnl;
            });

            // Empty cells before first day of month
            for (let i = 0; i < firstDay; i++) {
                const empty = document.createElement('div');
                empty.classList.add('calendar-day');
                calendarEl.appendChild(empty);
            }

            // Fill in actual days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, month, day);
                const key = formatLocalDateKey(dateObj);
                const pnl = tradeMap[key];

                const cell = document.createElement('div');
                cell.classList.add('calendar-day');

                if (pnl != null) {
                    const pnlClass = pnl >= 0 ? 'profit' : 'loss';
                    cell.innerHTML = `${day}<br><span class="${pnlClass}">${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</span>`;
                } else {
                    cell.innerText = day;
                }

                calendarEl.appendChild(cell);
            }
        }

        renderCalendar(tradeDataGlobal, currentYear, currentMonth);

        document.getElementById('calendar-prev').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(tradeDataGlobal, currentYear, currentMonth);
        });

        document.getElementById('calendar-next').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(tradeDataGlobal, currentYear, currentMonth);
        });

    } catch (error) {
        console.error("Error fetching trade data:", error);
    }
});

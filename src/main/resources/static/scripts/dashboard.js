document.addEventListener("DOMContentLoaded", async function () {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let tradeDataGlobal = []; // Filtered trades for dashboard charts
    let allTradesGlobal = []; // All trades for calendar (unfiltered)

    // Chart instances for proper lifecycle management
    let chartProfitChart = null;
    let chartWinLoss = null;
    let chartTradeType = null;
    let chartDiscipline = null;

    async function loadTrades(startDate, endDate) {
        let url = "/getAllTrades?sort=asc";
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await authFetch(url);
        const trades = await response.json();
        tradeDataGlobal = trades; // Store filtered data for charts

        // On initial load (no filter), also update allTradesGlobal
        if (!startDate && !endDate) {
            allTradesGlobal = trades;
        }

        renderDashboard(trades);
        renderCalendar(allTradesGlobal, currentYear, currentMonth); // Calendar always uses all trades
    }

    function renderDashboard(trades) {
        if (!Array.isArray(trades)) {
            console.error("Invalid data received:", trades);
            return;
        }

        const sum = arr => arr.reduce((a, b) => a + b, 0);
        const avg = arr => arr.length ? sum(arr) / arr.length : 0;

        // === Metrics ===
        const totalTrades = trades.length;
        const totalProfit = sum(trades.map(t => t.pnl)).toFixed(2);
        const wins = trades.filter(t => t.pnl >= 0).length;
        const losses = totalTrades - wins;
        const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;

        const buyCount = trades.filter(t => t.tradeType.toLowerCase() === "buy").length;
        const sellCount = trades.filter(t => t.tradeType.toLowerCase() === "sell").length;

        const emotions = {
            enteredOnSetup: avg(trades.map(t => t.enteredOnSetup || 0)),
            fixedStopLoss: avg(trades.map(t => t.fixedStopLoss || 0)),
            calculatedQuantity: avg(trades.map(t => t.calculatedQuantity || 0)),
            calculatedRisk: avg(trades.map(t => t.calculatedRisk || 0)),
            emotionalControlled: avg(trades.map(t => t.emotionalControlled || 0))
        };

        const labels = trades.map(t => new Date(t.tradeDate).toLocaleDateString());
        const plData = trades.map(t => t.pnl);

        // === Update Stats Summary ===
        document.querySelector('.card:nth-child(1) p').innerText = totalTrades;
        document.querySelector('.card:nth-child(2) p').innerText =
            (totalProfit >= 0 ? "+" : "") + `${totalProfit}`;
        document.querySelector('.card:nth-child(2) p').className = totalProfit >= 0 ? 'positive' : 'negative';
        document.querySelector('.card:nth-child(3) p').innerText = `${winRate}%`;

        // R/R ratio calculation (Average Win / Average Loss)
        const winningTrades = trades.filter(t => t.pnl >= 0);
        const losingTrades = trades.filter(t => t.pnl < 0);

        const avgWin = winningTrades.length ? sum(winningTrades.map(t => t.pnl)) / winningTrades.length : 0;
        const avgLoss = losingTrades.length ? Math.abs(sum(losingTrades.map(t => t.pnl))) / losingTrades.length : 0;

        let rrRatio = 0;
        if (avgLoss > 0) {
            rrRatio = avgWin / avgLoss;
        } else {
            rrRatio = avgWin > 0 ? avgWin : 0;
        }

        document.querySelector('.card:nth-child(4) p').innerText = `1:${rrRatio.toFixed(1)}`;

        // === Daily Background Plugin ===
        const dailyBackgroundPlugin = {
            id: 'dailyBackground',
            beforeDraw: (chart) => {
                const { ctx, chartArea: { top, bottom, left, right }, scales: { x } } = chart;
                const labels = chart.data.labels;
                if (!labels || labels.length === 0) return;

                ctx.save();

                // Helper to find boundary between two data indices
                const getMidPoint = (i1, i2) => {
                    const p1 = x.getPixelForValue(i1);
                    const p2 = x.getPixelForValue(i2);
                    return (p1 + p2) / 2;
                };

                // Remove duplicate consecutive labels to find day groups
                // We assume labels are sorted by date as per loadTrades logic
                let currentDay = labels[0];
                let startIndex = 0;
                let dayCount = 0;

                for (let i = 1; i <= labels.length; i++) {
                    const isLast = i === labels.length;
                    const dayChanged = !isLast && labels[i] !== currentDay;

                    if (isLast || dayChanged) {
                        // Boundaries
                        // Start: if first day, use chart left. Else, midpoint with prev item.
                        const startX = (startIndex === 0)
                            ? left
                            : getMidPoint(startIndex - 1, startIndex);

                        // End: if last group, use chart right. Else, midpoint with next item.
                        const endX = isLast
                            ? right
                            : getMidPoint(i - 1, i);

                        // Draw background for every other day (e.g., odd count)
                        if (dayCount % 2 == 0) {
                            ctx.fillStyle = 'rgba(187, 200, 70, 0.3)';
                            ctx.fillRect(startX, top, endX - startX, bottom - top);
                        } else {
                            ctx.fillStyle = 'rgba(70, 187, 200, 0.3)';
                            ctx.fillRect(startX, top, endX - startX, bottom - top);
                        }

                        if (!isLast) {
                            currentDay = labels[i];
                            startIndex = i;
                            dayCount++;
                        }
                    }
                }
                ctx.restore();
            }
        };

        // === Profit Chart ===
        if (chartProfitChart) chartProfitChart.destroy();
        chartProfitChart = new Chart(document.getElementById('profitChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Profit/Loss',
                    data: plData,
                    borderColor: '#00a86b',
                    backgroundColor: 'rgba(0, 168, 107, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#00a86b'
                }]
            },
            plugins: [dailyBackgroundPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: { position: 'top', labels: { color: '#1e1e2f' } },
                    title: { display: true, text: 'Profit Over Time', color: '#1e1e2f' },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                const index = context[0].dataIndex;
                                const trade = trades[index];
                                const date = new Date(trade.tradeDate);
                                return `${date.toLocaleDateString()} (${date.toLocaleDateString('en-US', { weekday: 'long' })})`;
                            },
                            label: function (context) {
                                const index = context.dataIndex;
                                const trade = trades[index];
                                const pnlStr = trade.pnl >= 0 ? `+${trade.pnl}` : `${trade.pnl}`;
                                return [
                                    `Instrument: ${trade.instrument}`,
                                    `P/L: ${pnlStr}`,
                                    `Risk: ${trade.risk}`,
                                    `Discipline: ${calculateDiscipline(trade)}/5`
                                ];
                            },
                            labelColor: function (context) {
                                const index = context.dataIndex;
                                const trade = trades[index];
                                const isProfit = trade.pnl >= 0;
                                return {
                                    borderColor: isProfit ? '#4caf50' : '#f44336',
                                    backgroundColor: isProfit ? '#4caf50' : '#f44336'
                                };
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: '#1e1e2f' } },
                    y: { beginAtZero: true, ticks: { color: '#1e1e2f' } }
                }
            }
        });

        // === Win vs Loss Chart ===
        if (chartWinLoss) chartWinLoss.destroy();
        chartWinLoss = new Chart(document.getElementById('winLossChart').getContext('2d'), {
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
                    legend: { labels: { color: '#1e1e2f' } }
                }
            }
        });

        // === Buy vs Sell Chart ===
        if (chartTradeType) chartTradeType.destroy();
        chartTradeType = new Chart(document.getElementById('tradeTypeChart').getContext('2d'), {
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
                    legend: { labels: { color: '#1e1e2f' } }
                }
            }
        });

        // === Discipline Score Gauge Chart ===
        // Calculate overall discipline percentage
        const totalRules = 5; // 5 rules per trade
        const totalPossiblePoints = totalTrades * totalRules;

        let totalPositivePoints = 0;
        trades.forEach(t => {
            totalPositivePoints += (t.enteredOnSetup);
            totalPositivePoints += (t.fixedStopLoss);
            totalPositivePoints += (t.calculatedQuantity);
            totalPositivePoints += (t.calculatedRisk);
            totalPositivePoints += (t.emotionalControlled);
        });

        const disciplinePercentage = totalPossiblePoints > 0
            ? ((totalPositivePoints / totalPossiblePoints) * 100).toFixed(1)
            : 0;

        // Count trades that followed ALL 5 rules vs trades that didn't
        const tradesFollowedAllRules = trades.filter(t =>
            t.enteredOnSetup > 0 &&
            t.fixedStopLoss > 0 &&
            t.calculatedQuantity > 0 &&
            t.calculatedRisk > 0 &&
            t.emotionalControlled > 0
        ).length;

        const tradesNotFollowedAllRules = totalTrades - tradesFollowedAllRules;

        // Determine gauge color based on percentage
        let gaugeColor;
        if (disciplinePercentage >= 80) {
            gaugeColor = '#4caf50'; // Green
        } else if (disciplinePercentage >= 60) {
            gaugeColor = '#ff9800'; // Orange/Yellow
        } else {
            gaugeColor = '#f44336'; // Red
        }

        // Create semi-circle gauge chart
        if (chartDiscipline) chartDiscipline.destroy();
        chartDiscipline = new Chart(document.getElementById('emotionDisciplineChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [disciplinePercentage, 100 - disciplinePercentage],
                    backgroundColor: [gaugeColor, '#e0e0e0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                circumference: 180,
                rotation: -90,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                if (index === 0) {
                                    // First segment (colored part) - trades that followed all rules
                                    return `Followed All Rules: ${tradesFollowedAllRules} trades`;
                                } else {
                                    // Second segment (gray part) - trades that didn't follow all rules
                                    return `Not All Rules Followed: ${tradesNotFollowedAllRules} trades`;
                                }
                            },
                            title: function () {
                                return ''; // No title in tooltip
                            }
                        }
                    },
                    title: {
                        display: false
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                afterDraw: function (chart) {
                    const ctx = chart.ctx;
                    const width = chart.width;
                    const height = chart.height;

                    ctx.restore();
                    ctx.font = 'bold 36px Arial';
                    ctx.fillStyle = gaugeColor;
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';

                    const centerX = width / 2;
                    const centerY = height / 1.5;

                    ctx.fillText(disciplinePercentage + '%', centerX, centerY);

                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#666';
                    ctx.fillText('Discipline Score', centerX, centerY + 30);

                    ctx.save();
                }
            }]
        });

    }

    // === Helper: Calculate discipline score ===
    function calculateDiscipline(trade) {
        return (trade.enteredOnSetup || 0) +
            (trade.fixedStopLoss || 0) +
            (trade.calculatedQuantity || 0) +
            (trade.calculatedRisk || 0) +
            (trade.emotionalControlled || 0);
    }

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

        // Map of date (yyyy-mm-dd) => trade statistics
        const tradeMap = {};
        trades.forEach(t => {
            const date = new Date(t.tradeDate);
            const key = formatLocalDateKey(date);

            if (!tradeMap[key]) {
                tradeMap[key] = {
                    totalPnL: 0,
                    totalTrades: 0,
                    profitTrades: 0,
                    lossTrades: 0,
                    followedAllRules: 0,
                    notFollowedAllRules: 0
                };
            }

            tradeMap[key].totalPnL += t.pnl;
            tradeMap[key].totalTrades += 1;

            if (t.pnl > 0) {
                tradeMap[key].profitTrades += 1;
            } else if (t.pnl < 0) {
                tradeMap[key].lossTrades += 1;
            }

            // Check if all 5 rules were followed
            const allRulesFollowed = t.enteredOnSetup > 0 &&
                t.fixedStopLoss > 0 &&
                t.calculatedQuantity > 0 &&
                t.calculatedRisk > 0 &&
                t.emotionalControlled > 0;

            if (allRulesFollowed) {
                tradeMap[key].followedAllRules += 1;
            } else {
                tradeMap[key].notFollowedAllRules += 1;
            }
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
            const stats = tradeMap[key];

            const cell = document.createElement('div');
            cell.classList.add('calendar-day');

            if (stats) {
                const pnlClass = stats.totalPnL >= 0 ? 'profit' : 'loss';
                cell.innerHTML = `${day}<br><span class="${pnlClass}">${stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}</span>`;

                // Add tooltip with detailed statistics
                cell.setAttribute('title',
                    `Total Trades: ${stats.totalTrades}\n` +
                    `Profit Trades: ${stats.profitTrades}\n` +
                    `Loss Trades: ${stats.lossTrades}\n` +
                    `Followed All Rules: ${stats.followedAllRules}\n` +
                    `Not All Rules Followed: ${stats.notFollowedAllRules}`
                );

                cell.style.cursor = 'pointer';
            } else {
                cell.innerText = day;
            }

            calendarEl.appendChild(cell);
        }
    }

    // Calendar navigation event listeners (outside renderDashboard to prevent multiple registrations)
    document.getElementById('calendar-prev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(allTradesGlobal, currentYear, currentMonth); // Use all trades for navigation
    });

    document.getElementById('calendar-next').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(allTradesGlobal, currentYear, currentMonth); // Use all trades for navigation
    });

    // Date range filter logic
    document.getElementById('filter-date-btn').addEventListener('click', function () {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        loadTrades(startDate, endDate);
    });

    // === Helper: Format Date for Input ===
    const formatDateInput = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    // === Helper: Get Monday of Current Week ===
    function getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    // === Quick Date Buttons Logic ===
    document.getElementById('btn-today').addEventListener('click', function () {
        const today = new Date();
        const dateStr = formatDateInput(today);
        document.getElementById('start-date').value = dateStr;
        document.getElementById('end-date').value = dateStr;
        loadTrades(dateStr, dateStr);
    });

    document.getElementById('btn-week').addEventListener('click', function () {
        const today = new Date();
        const monday = getMonday(today);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const startStr = formatDateInput(monday);
        const endStr = formatDateInput(sunday);

        document.getElementById('start-date').value = startStr;
        document.getElementById('end-date').value = endStr;
        loadTrades(startStr, endStr);
    });

    document.getElementById('btn-last-week').addEventListener('click', function () {
        const today = new Date();
        const currentMonday = getMonday(today);
        const lastMonday = new Date(currentMonday);
        lastMonday.setDate(currentMonday.getDate() - 7);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);

        const startStr = formatDateInput(lastMonday);
        const endStr = formatDateInput(lastSunday);

        document.getElementById('start-date').value = startStr;
        document.getElementById('end-date').value = endStr;
        loadTrades(startStr, endStr);
    });

    document.getElementById('btn-month').addEventListener('click', function () {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startStr = formatDateInput(firstDay);
        const endStr = formatDateInput(lastDay);

        document.getElementById('start-date').value = startStr;
        document.getElementById('end-date').value = endStr;
        loadTrades(startStr, endStr);
    });

    // === CSV Download Functionality ===
    function downloadCSV() {
        const trades = tradeDataGlobal;

        if (!trades || trades.length === 0) {
            alert('No data available to download. Please adjust your filters or add trades.');
            return;
        }

        // CSV Headers
        const headers = [
            'Trade Date',
            'Instrument',
            'Trade Type',
            'Quantity',
            'Risk',
            'Reward',
            'Strategy',
            'P/L',
            'Emotion',
            'Entry Reason',
            'Exit Reason',
            'Mistakes',
            'Notes',
            'Entered On Setup',
            'Fixed Stop Loss',
            'Calculated Quantity',
            'Calculated Risk',
            'Emotional Controlled',
            'Total Discipline Score'
        ];

        // Helper function to escape CSV values
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape double quotes and wrap in quotes if contains comma, newline, or quote
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
                return '"' + stringValue.replace(/"/g, '""') + '"';
            }
            return stringValue;
        };

        // Build CSV content
        let csvContent = headers.join(',') + '\n';

        trades.forEach(trade => {
            const disciplineScore = calculateDiscipline(trade);
            const row = [
                escapeCSV(trade.tradeDate),
                escapeCSV(trade.instrument),
                escapeCSV(trade.tradeType),
                escapeCSV(trade.quantity),
                escapeCSV(trade.risk),
                escapeCSV(trade.reward || ''),
                escapeCSV(trade.strategy || ''),
                escapeCSV(trade.pnl),
                escapeCSV(trade.emotion),
                escapeCSV(trade.entryReason || ''),
                escapeCSV(trade.exitReason || ''),
                escapeCSV(trade.mistakes || ''),
                escapeCSV(trade.notes || ''),
                escapeCSV(trade.enteredOnSetup),
                escapeCSV(trade.fixedStopLoss),
                escapeCSV(trade.calculatedQuantity),
                escapeCSV(trade.calculatedRisk),
                escapeCSV(trade.emotionalControlled),
                escapeCSV(disciplineScore)
            ];
            csvContent += row.join(',') + '\n';
        });

        // Create download link and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Generate filename with current date and time
        const now = new Date();
        const dateStr = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        const filename = `dashboard-report-${dateStr}-${timeStr}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Download button event listener
    document.getElementById('download-report-btn').addEventListener('click', downloadCSV);

    // Initial load (all trades)
    loadTrades();
});

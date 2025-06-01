document.addEventListener("DOMContentLoaded", function () {
    // === Profit/Loss Line Chart ===
    const ctxProfit = document.getElementById('profitChart').getContext('2d');
    new Chart(ctxProfit, {
        type: 'line',
        data: {
            labels: ['May 1', 'May 3', 'May 5', 'May 7', 'May 9', 'May 11', 'May 13'],
            datasets: [{
                label: 'Profit/Loss ($)',
                data: [100, -80, 150, 200, -40, 120, 300],
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
                title: { display: true, text: 'Profit Over Last 7 Trades', color: '#1e1e2f' }
            },
            scales: {
                x: { ticks: { color: '#1e1e2f' }},
                y: { beginAtZero: true, ticks: { color: '#1e1e2f' }}
            }
        }
    });

    // === Win vs Loss Pie Chart ===
    const ctxWinLoss = document.getElementById('winLossChart').getContext('2d');
    new Chart(ctxWinLoss, {
        type: 'pie',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                data: [28, 14], // More wins than losses
                backgroundColor: ['#4caf50', '#f44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Win vs Loss Distribution',
                    color: '#1e1e2f'
                },
                legend: {
                    labels: {
                        color: '#1e1e2f'
                    }
                }
            }
        }
    });

    // === Trade Type Doughnut Chart ===
    const ctxTradeType = document.getElementById('tradeTypeChart').getContext('2d');
    new Chart(ctxTradeType, {
        type: 'doughnut',
        data: {
            labels: ['Buy', 'Sell'],
            datasets: [{
                data: [22, 20], // Balanced number of buy and sell
                backgroundColor: ['#2196f3', '#ff9800']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Buy vs Sell Trades',
                    color: '#1e1e2f'
                },
                legend: {
                    labels: {
                        color: '#1e1e2f'
                    }
                }
            }
        }
    });

    // === Emotion & Discipline Radar Chart ===
    const ctxEmotion = document.getElementById('emotionDisciplineChart').getContext('2d');
    new Chart(ctxEmotion, {
        type: 'radar',
        data: {
            labels: ['Confidence', 'Fear', 'Greed', 'Patience', 'Discipline'],
            datasets: [{
                label: 'Avg Rating (1–10)',
                data: [8, 3, 5, 7, 9],
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
                    labels: {
                        color: '#1e1e2f'
                    }
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
});

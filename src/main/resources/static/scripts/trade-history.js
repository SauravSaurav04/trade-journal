document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".trade-table");
    const tableBody = table.querySelector("tbody");
    const headers = table.querySelectorAll("th .sortable");
    let currentSortIndex = null;
    let currentSortDirection = true;

    async function fetchTrades(startDate, endDate) {
        let url = "/getAllTrades";
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        try {
            const response = await authFetch(url);
            const trades = await response.json();
            renderTrades(trades);
        } catch (err) {
            console.error("Failed to load trades:", err);
            tableBody.innerHTML = "<tr><td colspan='11'>Error loading trades</td></tr>";
        }
    }

    function renderTrades(trades) {
        tableBody.innerHTML = "";
        trades.forEach((trade, index) => {
            const row = document.createElement("tr");
            const disciplineScore = trade.enteredOnSetup + trade.fixedStopLoss + trade.calculatedQuantity + trade.calculatedRisk + trade.emotionalControlled;
            let rrRatio = "0";
            if (trade.risk !== 0) {
                const ratio = trade.pnl / trade.risk;
                rrRatio = `1 : ${ratio.toFixed(1)}`; // Show 1 decimal place
            }

            row.style.cursor = "pointer";
            row.addEventListener("click", () => openModal(trade));

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${trade.tradeDate}</td>
                <td>${trade.instrument}</td>
                <td>${trade.tradeType}</td>
                <td>${trade.quantity}</td>
                <td>${trade.risk}</td>
                <td>${rrRatio}</td>
                <td>${disciplineScore}</td>
                <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">
                    ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Date range filter logic
    document.getElementById('filter-date-btn').addEventListener('click', function () {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        fetchTrades(startDate, endDate);
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
        fetchTrades(dateStr, dateStr);
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
        fetchTrades(startStr, endStr);
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
        fetchTrades(startStr, endStr);
    });

    document.getElementById('btn-month').addEventListener('click', function () {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startStr = formatDateInput(firstDay);
        const endStr = formatDateInput(lastDay);

        document.getElementById('start-date').value = startStr;
        document.getElementById('end-date').value = endStr;
        fetchTrades(startStr, endStr);
    });

    // Sorting logic
    const getCellValue = (tr, idx) => {
        const text = tr.children[idx].textContent.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return new Date(text);
        const number = parseFloat(text.replace(/[^\d.-]/g, ''));
        return isNaN(number) ? text.toLowerCase() : number;
    };

    const comparer = (idx, asc) => (a, b) => {
        const valA = getCellValue(a, idx);
        const valB = getCellValue(b, idx);
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
    };

    headers.forEach((thSpan, idx) => {
        thSpan.addEventListener("click", () => {
            const rows = Array.from(tableBody.querySelectorAll("tr"));
            const asc = currentSortIndex === idx ? !currentSortDirection : true;
            rows.sort(comparer(idx, asc));
            rows.forEach(row => tableBody.appendChild(row));
            headers.forEach(h => h.classList.remove("asc", "desc"));
            thSpan.classList.add(asc ? "asc" : "desc");
            currentSortIndex = idx;
            currentSortDirection = asc;
        });
    });

    // === Modal Logic ===
    const modal = document.getElementById("trade-modal");
    const closeBtn = document.querySelector(".close-btn");

    // Fields
    const modalStrategy = document.getElementById("modal-strategy");
    const modalReward = document.getElementById("modal-reward");
    const modalEmotion = document.getElementById("modal-emotion");

    const modalEntry = document.getElementById("modal-entry-reason");
    const modalExit = document.getElementById("modal-exit-reason");
    const modalMistakes = document.getElementById("modal-mistakes");
    const modalNotes = document.getElementById("modal-notes");

    const modalEntrySetup = document.getElementById("modal-entry-setup");
    const modalExitDiscipline = document.getElementById("modal-exit-discipline");
    const modalCorrectQty = document.getElementById("modal-correct-qty");
    const modalCalculatedRisk = document.getElementById("modal-calculated-risk");
    const modalEmotionDiscipline = document.getElementById("modal-emotion-discipline");

    function openModal(trade) {
        modalStrategy.textContent = trade.strategy || "N/A";
        modalReward.textContent = trade.reward || "N/A";
        modalEmotion.textContent = trade.emotion || "N/A";

        modalEntry.textContent = trade.entryReason || "N/A";
        modalExit.textContent = trade.exitReason || "N/A";
        modalMistakes.textContent = trade.mistakes || "N/A";
        modalNotes.textContent = trade.notes || "N/A";

        // Discipline
        modalEntrySetup.textContent = trade.enteredOnSetup;
        modalExitDiscipline.textContent = trade.fixedStopLoss;
        modalCorrectQty.textContent = trade.calculatedQuantity;
        modalCalculatedRisk.textContent = trade.calculatedRisk;
        modalEmotionDiscipline.textContent = trade.emotionalControlled;

        // Wire edit button
        const editBtn = document.getElementById("modal-edit-btn");
        if (editBtn) {
            editBtn.style.display = "inline-block";
            editBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `/templates/add-trade.html?id=${trade.id}`;
            };
        }

        // Charts & Videos
        const chartsContainer = document.getElementById("modal-charts-container");
        chartsContainer.innerHTML = ""; // Clear previous

        let hasCharts = false;

        if (trade.entryChartUrl) {
            const btn = document.createElement("a");
            btn.href = trade.entryChartUrl;
            btn.target = "_blank";
            btn.className = "chart-btn";
            btn.textContent = "View Entry Chart";
            chartsContainer.appendChild(btn);
            hasCharts = true;
        }

        if (trade.exitChartUrl) {
            const btn = document.createElement("a");
            btn.href = trade.exitChartUrl;
            btn.target = "_blank";
            btn.className = "chart-btn";
            btn.textContent = "View Exit Chart";
            chartsContainer.appendChild(btn);
            hasCharts = true;
        }

        if (trade.entryVideoUrl) {
            const btn = document.createElement("a");
            btn.href = trade.entryVideoUrl;
            btn.target = "_blank";
            btn.className = "chart-btn";
            btn.textContent = "View Entry Video";
            chartsContainer.appendChild(btn);
            hasCharts = true;
        }

        if (trade.exitVideoUrl) {
            const btn = document.createElement("a");
            btn.href = trade.exitVideoUrl;
            btn.target = "_blank";
            btn.className = "chart-btn";
            btn.textContent = "View Exit Video";
            chartsContainer.appendChild(btn);
            hasCharts = true;
        }

        if (!hasCharts) {
            chartsContainer.innerHTML = "<p style='color: #888; font-style: italic;'>No charts or video uploaded.</p>";
        }

        // Use flex to display considering our CSS change
        modal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Lock background scroll
    }

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Unlock background scroll
    }

    closeBtn.addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Initial load (all trades)
    fetchTrades();
});

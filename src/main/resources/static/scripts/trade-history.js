document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".trade-table");
    const tableBody = table.querySelector("tbody");
    const headers = table.querySelectorAll("th .sortable");
    let currentSortIndex = null;
    let currentSortDirection = true;

    // Fetch trades from Spring Boot API and render
    async function fetchTrades() {
        try {
            const response = await fetch("/getAllTrades");
            const trades = await response.json();
            tableBody.innerHTML = "";

            trades.forEach((trade, index) => {
                const row = document.createElement("tr");
                const disciplineScore = trade.entrySetup + trade.exitDiscipline + trade.correctQuantity + trade.calculatedRisk + trade.emotionDiscipline;
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${trade.tradeDate}</td>
                    <td>${trade.instrument}</td>
                    <td>${trade.tradeType}</td>
                    <td>${trade.quantity}</td>
                    <td>${trade.risk}</td>
                    <td>${trade.reward}</td>
                    <td>${trade.strategy}</td>
                    <td>${trade.emotion}</td>
                    <td>${disciplineScore}</td>
                    <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">
                        ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (err) {
            console.error("Failed to load trades:", err);
            tableBody.innerHTML = "<tr><td colspan='11'>Error loading trades</td></tr>";
        }
    }

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

    // Load data on page load
    fetchTrades();
});

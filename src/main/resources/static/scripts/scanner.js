async function runScanner() {
    const timeframe = document.getElementById("timeframe").value;
    const threshold = document.getElementById("threshold").value;
    const ema = document.getElementById("ema").value;
    const resultsContainer = document.getElementById("scannerResults");

    // Clear previous results
    resultsContainer.innerHTML = "<p>🔄 Scanning stocks...</p>";

    try {
        const response = await fetch(`/scanner?interval=${timeframe}&threshold=${threshold}&ema=${ema}`);
        if (!response.ok) {
            throw new Error("Failed to fetch scanner results.");
        }

        const stocks = await response.json();

        if (stocks.length === 0) {
            resultsContainer.innerHTML = `<p>❌ No stocks found near EMA-${parseFloat(ema).toFixed(2)} for the selected timeframe.</p>`;
            return;
        }

        // Build result cards
        resultsContainer.innerHTML = "";
        stocks.forEach(symbol => {
            const card = document.createElement("div");
            card.className = "stock-card";
            card.innerHTML = `
                <h4>${symbol}</h4>
                <p>📍 Near EMA-${ema} (${timeframe})</p>
            `;
            resultsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Scanner error:", error);
        resultsContainer.innerHTML = "<p>⚠️ An error occurred while scanning. Please try again later.</p>";
    }
}

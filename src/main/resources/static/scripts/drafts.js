document.addEventListener("DOMContentLoaded", () => {
    fetchDrafts();
});

async function fetchDrafts() {
    try {
        const response = await authFetch("/getDrafts");
        if (response.ok) {
            const drafts = await response.json();
            renderTable(drafts);
        } else {
            console.error("Failed to fetch drafts");
        }
    } catch (error) {
        console.error("Error fetching drafts:", error);
    }
}

function renderTable(trades) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    trades.forEach((trade, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${trade.tradeDate || "-"}</td>
            <td>${trade.instrument || "-"}</td>
            <td>${trade.tradeType || "-"}</td>
            <td>${trade.quantity || "-"}</td>
            <td>
                <button class="edit-btn" onclick="editDraft(${trade.id})" style="padding: 5px 10px; cursor: pointer; background-color: #00a86b; color: white; border: none; border-radius: 4px;">Complete Trade</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function editDraft(id) {
    window.location.href = `/templates/add-trade.html?id=${id}`;
}

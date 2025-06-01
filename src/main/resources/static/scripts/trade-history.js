document.addEventListener("DOMContentLoaded", () => {
    // Existing sorting code here...
    const table = document.querySelector(".trade-table");
    const modal = document.getElementById("tradeModal");
    const closeBtn = modal.querySelector(".close-button");
    const tradeDetails = document.getElementById("tradeDetails");
    let selectedRow = null;

    const fieldNames = [
        { label: "Date", name: "date", type: "date" },
        { label: "Instrument", name: "instrument", type: "text" },
        { label: "Type", name: "type", type: "text" },
        { label: "Entry", name: "entry", type: "number" },
        { label: "Exit", name: "exit", type: "number" },
        { label: "Stop Loss", name: "stopLoss", type: "number" },
        { label: "Take Profit", name: "takeProfit", type: "number" },
        { label: "Qty", name: "qty", type: "number" },
        { label: "Risk", name: "risk", type: "number" },
        { label: "Strategy", name: "strategy", type: "text" },
        { label: "Emotion", name: "emotion", type: "text" },
        { label: "Discipline", name: "discipline", type: "number" },
        { label: "P/L", name: "pl", type: "number" },
    ];

    // Show modal with read-only data
    table.querySelectorAll("tbody tr").forEach(row => {
        row.addEventListener("click", () => {
            selectedRow = row;
            const cells = row.querySelectorAll("td");

            tradeDetails.innerHTML = "";

            fieldNames.forEach((field, i) => {

                // Skip fields you don't want in the modal
                if (["date", "instrument", "type"].includes(field.name)) return;

                const value = cells[i].textContent.trim().replace(/[+$]/g, '');
                const div = document.createElement("div");
                div.className = "modal-field";
                div.dataset.index = i;

                div.innerHTML = `
                    <span class="modal-label">${field.label}</span>
                    <div class="field-display">
                        <span class="field-value">${value}</span>
                        <span class="edit-icon" title="Edit">✏️</span>
                    </div>
                `;
                tradeDetails.appendChild(div);
            });

            modal.style.display = "flex";
        });
    });

    // Close modal
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = e => {
        if (e.target === modal) modal.style.display = "none";
    };

    // Handle edit click
    tradeDetails.addEventListener("click", e => {
        if (!e.target.classList.contains("edit-icon")) return;

        const fieldDiv = e.target.closest(".modal-field");
        const valueSpan = fieldDiv.querySelector(".field-value");
        const originalValue = valueSpan.textContent;
        const index = parseInt(fieldDiv.dataset.index);
        const field = fieldNames[index];

        // Replace display with input
        const input = document.createElement("input");
        input.type = field.type;
        input.value = originalValue;
        input.className = "edit-input";

        const controls = document.createElement("div");
        controls.className = "edit-controls";
        controls.innerHTML = `
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        `;

        const displayDiv = fieldDiv.querySelector(".field-display");
        displayDiv.innerHTML = "";
        displayDiv.appendChild(input);
        displayDiv.appendChild(controls);

        // Save changes
        controls.querySelector(".save-btn").onclick = () => {
            const newValue = input.value.trim();
            const rowCell = selectedRow.querySelectorAll("td")[index];

            rowCell.textContent = (field.name === "pl" && !newValue.startsWith("-")) ? "+" + newValue : newValue;

            if (field.name === "pl") {
                rowCell.classList.remove("positive", "negative");
                rowCell.classList.add(parseFloat(newValue) >= 0 ? "positive" : "negative");
            }

            displayDiv.innerHTML = `
                <span class="field-value">${newValue}</span>
                <span class="edit-icon" title="Edit">✏️</span>
            `;
        };

        // Cancel editing
        controls.querySelector(".cancel-btn").onclick = () => {
            displayDiv.innerHTML = `
                <span class="field-value">${originalValue}</span>
                <span class="edit-icon" title="Edit">✏️</span>
            `;
        };
    });

    // Delete button
    modal.querySelector(".delete-btn").onclick = () => {
        if (selectedRow && confirm("Are you sure you want to delete this trade?")) {
            selectedRow.remove();
            modal.style.display = "none";
        }
    };
});

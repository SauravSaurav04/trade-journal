function updateDisciplineScore() {
    const names = ["enteredOnSetup", "fixedStopLoss", "calculatedQuantity", "calculatedRisk", "emotionalControlled"];
    let score = 0;

    names.forEach(name => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (checked) {
            score += (checked.value === "1") ? 1 : -1;
        }
    });

    const slider = document.getElementById("disciplineScoreSlider");
    const label = document.getElementById("disciplineScoreValue");

    slider.value = score;
    label.innerText = score >= 0 ? `+${score}` : score;
}

const urlParams = new URLSearchParams(window.location.search);
const tradeId = urlParams.get('id');

let isDraft = false;

document.addEventListener("DOMContentLoaded", () => {

    // Check if we are editing a trade (either draft or published)
    if (tradeId) {
        loadTradeDetails(tradeId);
    }

    // 1. Radio buttons for Discipline Score
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.addEventListener("change", updateDisciplineScore));
    updateDisciplineScore();

    // 2. Button Selection Logic (Replaces Dropdowns)
    const selectionGroups = document.querySelectorAll(".selection-group");
    selectionGroups.forEach(group => {
        const inputId = group.dataset.inputId;
        const hiddenInput = document.getElementById(inputId);
        if (!hiddenInput) return;

        const buttons = group.querySelectorAll(".option-btn");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                // Deselect others in group
                buttons.forEach(b => b.classList.remove("active"));
                // Select clicked
                btn.classList.add("active");

                // Update hidden input
                const value = btn.dataset.value;
                hiddenInput.value = value;

                // Handle "Other" field toggle
                const otherInputId = "other" + inputId.charAt(0).toUpperCase() + inputId.slice(1);
                const otherInput = document.getElementById(otherInputId);

                if (otherInput) {
                    if (value === "Other") {
                        otherInput.style.display = "block";
                        // Only require if NOT draft
                        if (!isDraft) otherInput.setAttribute("required", "true");
                        otherInput.focus();
                    } else {
                        otherInput.style.display = "none";
                        otherInput.removeAttribute("required");
                    }
                }
            });
        });
    });

    // Save as Draft Button Listener
    const saveDraftBtn = document.getElementById("saveDraftButton");
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener("click", () => {
            isDraft = true;
            // Trigger form submission
            document.querySelector("form").dispatchEvent(new Event("submit"));
        });
    }

    // Save Trade (Published) Listener - ensure isDraft is false
    const saveTradeBtn = document.getElementById("saveTradeButton");
    if (saveTradeBtn) {
        saveTradeBtn.addEventListener("click", () => {
            isDraft = false;
        });
    }
});

async function loadTradeDetails(id) {
    try {
        const response = await authFetch(`/trades/${id}`);
        if (response.ok) {
            const trade = await response.json();
            if (trade) {
                // Adjust title and buttons depending on status
                if (trade.status === "PUBLISHED") {
                    document.querySelector("h2").innerText = "Edit Trade";
                    const saveTradeBtn = document.getElementById("saveTradeButton");
                    if (saveTradeBtn) saveTradeBtn.textContent = "Save Changes";
                    
                    const saveDraftBtn = document.getElementById("saveDraftButton");
                    if (saveDraftBtn) saveDraftBtn.style.display = "none";
                } else {
                    document.querySelector("h2").innerText = "Complete Trade";
                }

                // Pre-fill form
                document.getElementById("tradeDate").value = trade.tradeDate;
                document.getElementById("pnl").value = trade.pnl;
                document.getElementById("entryReason").value = trade.entryReason || "";
                document.getElementById("exitReason").value = trade.exitReason || "";
                document.getElementById("mistakes").value = trade.mistakes || "";
                document.getElementById("notes").value = trade.notes || "";

                // Helper to click buttons
                const selectButton = (inputId, value) => {
                    const group = document.querySelector(`.selection-group[data-input-id="${inputId}"]`);
                    if (group) {
                        const btn = group.querySelector(`.option-btn[data-value="${value}"]`);
                        if (btn) btn.click();
                        else {
                            // Handle "Other"
                            const otherBtn = group.querySelector(`.option-btn[data-value="Other"]`);
                            if (otherBtn) {
                                otherBtn.click();
                                const otherInput = document.getElementById("other" + inputId.charAt(0).toUpperCase() + inputId.slice(1));
                                if (otherInput) otherInput.value = value;
                            }
                        }
                    }
                };

                if (trade.instrument) selectButton("instrument", trade.instrument);
                if (trade.tradeType) selectButton("tradeType", trade.tradeType);
                if (trade.quantity) selectButton("quantity", trade.quantity);
                if (trade.risk) selectButton("risk", trade.risk);
                if (trade.reward) selectButton("reward", trade.reward);
                if (trade.strategy) selectButton("strategy", trade.strategy);
                if (trade.emotion) selectButton("emotion", trade.emotion);

                // Radios
                if (trade.enteredOnSetup !== null && trade.enteredOnSetup !== undefined) {
                    const radio = document.querySelector(`input[name="enteredOnSetup"][value="${trade.enteredOnSetup}"]`);
                    if (radio) radio.checked = true;
                }
                if (trade.fixedStopLoss !== null && trade.fixedStopLoss !== undefined) {
                    const radio = document.querySelector(`input[name="fixedStopLoss"][value="${trade.fixedStopLoss}"]`);
                    if (radio) radio.checked = true;
                }
                if (trade.calculatedQuantity !== null && trade.calculatedQuantity !== undefined) {
                    const radio = document.querySelector(`input[name="calculatedQuantity"][value="${trade.calculatedQuantity}"]`);
                    if (radio) radio.checked = true;
                }
                if (trade.calculatedRisk !== null && trade.calculatedRisk !== undefined) {
                    const radio = document.querySelector(`input[name="calculatedRisk"][value="${trade.calculatedRisk}"]`);
                    if (radio) radio.checked = true;
                }
                if (trade.emotionalControlled !== null && trade.emotionalControlled !== undefined) {
                    const radio = document.querySelector(`input[name="emotionalControlled"][value="${trade.emotionalControlled}"]`);
                    if (radio) radio.checked = true;
                }

                updateDisciplineScore();
            }
        } else {
            console.error("Failed to fetch trade details with ID:", id);
            showToast("Failed to load trade details", "error");
        }
    } catch (e) {
        console.error("Error loading trade details", e);
        showToast("Error loading trade details", "error");
    }
}

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Manual Validation for Hidden Inputs - ONLY IF NOT DRAFT
    if (!isDraft) {
        // Helper to alert and focus/scroll
        const alertAndFocus = (msg, elementId, isSelectionGroup = false) => {
            showToast(msg, 'error');
            if (isSelectionGroup) {
                const group = document.querySelector(`.selection-group[data-input-id="${elementId}"]`);
                if (group) group.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const el = document.getElementById(elementId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.focus();
                }
            }
        };

        // 1. Date
        if (!document.getElementById("tradeDate").value) {
            alertAndFocus("Please enter Date of Trade", "tradeDate");
            return;
        }

        // 2. Instrument
        if (!document.getElementById("instrument").value) {
            alertAndFocus("Please select Instrument Name", "instrument", true);
            return;
        }

        // 3. Trade Type
        if (!document.getElementById("tradeType").value) {
            alertAndFocus("Please select Trade Type", "tradeType", true);
            return;
        }

        // 4. Quantity
        if (!document.getElementById("quantity").value) {
            alertAndFocus("Please select Quantity", "quantity", true);
            return;
        }

        // 5. Risk
        if (!document.getElementById("risk").value) {
            alertAndFocus("Please select Risk", "risk", true);
            return;
        }

        // 6. Profit/Loss
        if (!document.getElementById("pnl").value) {
            alertAndFocus("Please enter Profit/Loss", "pnl");
            return;
        }

        // 7. Emotional Status
        if (!document.getElementById("emotion").value) {
            alertAndFocus("Please select Emotional Status", "emotion", true);
            return;
        }

        // 8. Discipline Checklist
        const disciplineFields = [
            { name: "enteredOnSetup", label: "Entered on Setup" },
            { name: "fixedStopLoss", label: "Fixed Stop Loss" },
            { name: "calculatedQuantity", label: "Calculated Quantity" },
            { name: "calculatedRisk", label: "Calculated Risk" },
            { name: "emotionalControlled", label: "Emotion Controlled" }
        ];

        for (const field of disciplineFields) {
            if (!document.querySelector(`input[name="${field.name}"]:checked`)) {
                showToast(`Please select YES or NO for: ${field.label}`, 'error');
                const item = document.querySelector(`input[name="${field.name}"]`).closest('.discipline-item');
                if (item) item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }
    }

    const submitButton = isDraft ? document.getElementById("saveDraftButton") : document.getElementById("saveTradeButton");
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    const formData = new FormData(e.target);
    const plainData = Object.fromEntries(formData.entries());

    // Add status
    plainData.status = isDraft ? "DRAFT" : "PUBLISHED";

    // Include ID if editing
    if (tradeId) {
        plainData.id = tradeId;
    }

    try {
        const formDataToSend = new FormData();
        formDataToSend.append("data", new Blob([JSON.stringify(plainData)], { type: "application/json" }));

        const entryFile = document.getElementById("entryChartScreenshot").files[0];
        if (entryFile) {
            formDataToSend.append("entryChartScreenshot", entryFile);
        }

        const exitFile = document.getElementById("exitChartScreenshot").files[0];
        if (exitFile) {
            formDataToSend.append("exitChartScreenshot", exitFile);
        }

        const entryVideoFile = document.getElementById("entryVideo").files[0];
        if (entryVideoFile) {
            formDataToSend.append("entryVideo", entryVideoFile);
        }

        const exitVideoFile = document.getElementById("exitVideo").files[0];
        if (exitVideoFile) {
            formDataToSend.append("exitVideo", exitVideoFile);
        }

        const response = await authFetch("/trades", {
            method: "POST",
            body: formDataToSend
        });

        if (response.ok) {
            let successMsg = isDraft ? "Trade Saved as Draft!" : "Trade Saved!";
            if (tradeId && !isDraft) {
                successMsg = "Trade Updated!";
            }
            showToast(successMsg, 'success');
            location.href = isDraft ? "/templates/drafts.html" : "/templates/trade-history.html";
        } else {
            const errorText = await response.text();
            showToast("Error saving trade: " + errorText, 'error');
            submitButton.disabled = false;
            submitButton.textContent = isDraft ? "Save as Draft" : (tradeId ? "Save Changes" : "Save Trade");
        }
    } catch (error) {
        console.error("Request failed:", error);
        showToast("An error occurred", 'error');
        submitButton.disabled = false;
        submitButton.textContent = isDraft ? "Save as Draft" : (tradeId ? "Save Changes" : "Save Trade");
    }
});

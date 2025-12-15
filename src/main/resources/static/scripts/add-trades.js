function updateDisciplineScore() {
    const names = ["entrySetup", "exitDiscipline", "correctQuantity", "calculatedRisk", "emotionDiscipline"];
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

document.addEventListener("DOMContentLoaded", () => {
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
                        otherInput.setAttribute("required", "true");
                        otherInput.focus();
                    } else {
                        otherInput.style.display = "none";
                        otherInput.removeAttribute("required");
                    }
                }
            });
        });
    });
});

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Manual Validation for Hidden Inputs (since they don't trigger browser validation UI)
    const requiredIds = ["instrument", "tradeType", "quantity", "risk", "emotion"];
    for (const id of requiredIds) {
        const input = document.getElementById(id);
        if (input && !input.value) {
            alert(`Please select a value for ${id.charAt(0).toUpperCase() + id.slice(1)}`);
            // Highlight the group?
            const group = document.querySelector(`.selection-group[data-input-id="${id}"]`);
            if (group) group.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }

    const submitButton = document.getElementById("saveTradeButton");
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    const formData = new FormData(e.target);
    const plainData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("/trades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(plainData)
        });

        if (response.ok) {
            alert("Trade saved!");
            location.reload(); // Reload to clear form or redirect
        } else {
            const errorText = await response.text();
            alert("Error saving trade: " + errorText);
            submitButton.disabled = false;
            submitButton.textContent = "Save Trade";
        }
    } catch (error) {
        console.error("Request failed:", error);
        alert("An error occurred.");
        submitButton.disabled = false;
        submitButton.textContent = "Save Trade";
    }
});

function toggleOtherInput(selectElement, otherInputId) {
    const otherInput = document.getElementById(otherInputId);
    if (selectElement.value === "Other") {
        otherInput.style.display = "block";
        otherInput.setAttribute("required", "true");
    } else {
        otherInput.style.display = "none";
        otherInput.removeAttribute("required");
    }
}

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
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.addEventListener("change", updateDisciplineScore));
    updateDisciplineScore();
});

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = Object.fromEntries(formData.entries());

    const response = await fetch("/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert("Trade saved!");
    } else {
        alert("Error saving trade.");
    }
});

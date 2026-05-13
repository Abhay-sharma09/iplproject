const API = "http://127.0.0.1:8000";

const teams = [
    "Chennai Super Kings",
    "Delhi Capitals",
    "Gujarat Titans",
    "Kolkata Knight Riders",
    "Lucknow Super Giants",
    "Mumbai Indians",
    "Punjab Kings",
    "Rajasthan Royals",
    "Royal Challengers Bengaluru",
    "Sunrisers Hyderabad"
];

const decisions = ["bat", "field"];

const teamThemeMap = {
    "Mumbai Indians": "mi",
    "Chennai Super Kings": "csk",
    "Kolkata Knight Riders": "kkr",
    "Sunrisers Hyderabad": "srh",
    "Delhi Capitals": "dc",
    "Gujarat Titans": "gt",
    "Rajasthan Royals": "rr",
    "Punjab Kings": "pbks",
    "Lucknow Super Giants": "lsg",
    "Royal Challengers Bengaluru": "rcb"
};

// Helper to apply team theme to a card
function applyTeamTheme(input, teamName) {
    const card = input.closest('.card');
    const themeClass = teamThemeMap[teamName];
    
    // Remove existing team themes
    card.classList.forEach(cls => {
        if (cls.startsWith('team-accent-')) card.classList.remove(cls);
    });

    if (themeClass) {
        card.classList.add(`team-accent-${themeClass}`);
    }
}

let compareChart = null;

const teamPairs = {
    team1: "team2",
    team2: "team1",
    c1: "c2",
    c2: "c1"
};

function getTeamListForInput(input) {
    if (input.id === "toss_winner") {
        const selectedTeams = [
            document.getElementById("team1").value,
            document.getElementById("team2").value
        ].filter(Boolean);

        return selectedTeams.length > 0 ? selectedTeams : teams;
    }

    const pairedInputId = teamPairs[input.id];
    if (!pairedInputId) return teams;

    const pairedValue = document.getElementById(pairedInputId).value;
    return teams.filter(team => team !== pairedValue);
}

function getListForInput(input) {
    return input.id === "toss_decision" ? decisions : getTeamListForInput(input);
}

function removeTeamTheme(card) {
    if (!card) return;

    [...card.classList].forEach(cls => {
        if (cls.startsWith("team-accent-")) card.classList.remove(cls);
    });
}

// Helper to close all suggestion boxes
function closeAllSuggestions() {
    document.querySelectorAll(".suggestions").forEach(box => {
        box.style.display = "none";
    });
}

// Optimized suggestion logic
function handleSuggestions(input, list, showAll = false) {
    let box = input.parentElement.querySelector(".suggestions");
    let value = showAll ? "" : input.value.toLowerCase();

    closeAllSuggestions();
    box.innerHTML = "";

    let filtered = list.filter(t => t.toLowerCase().includes(value));

    if (filtered.length === 0 && value === "") {
        // Show all if empty and focused
        filtered = list;
    } else if (filtered.length === 0) {
        box.style.display = "none";
        return;
    }

    filtered.forEach(t => {
        let div = document.createElement("div");
        div.innerText = t;
        div.onclick = (e) => {
            e.stopPropagation();
            input.value = t;
            box.style.display = "none";

            const pairedInputId = teamPairs[input.id];
            if (pairedInputId) {
                const pairedInput = document.getElementById(pairedInputId);
                if (pairedInput.value === t) {
                    pairedInput.value = "";
                }
            }

            if ((input.id === "team1" || input.id === "team2") && document.getElementById("toss_winner").value) {
                const validTossWinners = getTeamListForInput(document.getElementById("toss_winner"));
                if (!validTossWinners.includes(document.getElementById("toss_winner").value)) {
                    document.getElementById("toss_winner").value = "";
                }
            }
            
            // Apply theme if it's a team input
            if (teamPairs[input.id] || input.id === 'teamStats') {
                applyTeamTheme(input, t);
            }
        };
        box.appendChild(div);
    });

    box.style.display = "block";
}

// Global click listener to close dropdowns
document.addEventListener("click", () => {
    closeAllSuggestions();
});

// Event listeners for inputs
function setupInputListeners() {
    document.querySelectorAll('.input-box input').forEach(input => {
        input.addEventListener('keyup', (e) => {
            handleSuggestions(e.target, getListForInput(e.target));
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
            handleSuggestions(e.target, getListForInput(e.target), true);
        });
    });

    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const input = btn.parentElement.querySelector('input');
            handleSuggestions(input, getListForInput(input), true);
        });
    });
}

function clearCard(cardType) {
    const card = document.getElementById(`${cardType}Card`);
    if (!card) return;

    card.querySelectorAll("input").forEach(input => {
        input.value = "";
    });

    card.querySelectorAll(".suggestions").forEach(box => {
        box.innerHTML = "";
        box.style.display = "none";
    });

    removeTeamTheme(card);

    if (cardType === "predictor") {
        document.getElementById("result").innerHTML = "";
    }

    if (cardType === "stats") {
        document.getElementById("statsResult").innerHTML = "";
    }

    if (cardType === "compare") {
        document.getElementById("compareResult").innerHTML = "";

        if (compareChart) {
            compareChart.destroy();
            compareChart = null;
        }

        const chartContainer = card.querySelector(".chart-container");
        if (chartContainer && !document.getElementById("compareChart")) {
            chartContainer.innerHTML = '<canvas id="compareChart"></canvas>';
        }
    }
}

// Predict
document.getElementById("predictBtn").onclick = async () => {
    const btn = document.getElementById("predictBtn");
    const result = document.getElementById("result");

    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    const toss_winner = document.getElementById("toss_winner").value;
    const toss_decision = document.getElementById("toss_decision").value;

    if (!team1 || !team2 || !toss_winner || !toss_decision) {
        result.innerHTML = "<span style='color: var(--accent); font-weight: 800;'>⚠️ PLEASE FILL ALL FIELDS</span>";
        return;
    }

    if (team1 === team2) {
        result.innerHTML = "<span style='color: var(--accent); font-weight: 800;'>PLEASE SELECT TWO DIFFERENT TEAMS</span>";
        return;
    }

    btn.innerText = "Processing Data...";
    btn.disabled = true;

    try {
        let res = await fetch(API + "/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                team1, team2, toss_winner, toss_decision
            })
        });

        let data = await res.json();
        if (data.no_data) {
            result.innerHTML = `<span style="color: var(--accent); font-weight: 800;">${data.error}</span>`;
            return;
        }
        if (data.error) throw new Error(data.error);

        result.innerHTML = `
            <div style="background: rgba(240, 195, 48, 0.1); padding: 25px; border-radius: 20px; border: 2px solid var(--primary); text-align: center;">
                <div style="color: var(--primary); font-size: 0.85rem; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px;">WIN PROBABILITY</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: #fff;">🏆 ${data.winner}</div>
                <div style="font-size: 1.1rem; color: var(--text-muted); margin-top: 5px; font-weight: 600;">${data.probability}% Confidence</div>
            </div>
        `;
    } catch (err) {
        result.innerText = "❌ Error: " + err.message;
    } finally {
        btn.innerText = "Predict Outcome";
        btn.disabled = false;
    }
};

// Stats
document.getElementById("statsBtn").onclick = async () => {
    const team = document.getElementById("teamStats").value;
    if (!team) return;

    try {
        const res = await fetch(API + "/team-stats/" + encodeURIComponent(team));
        const data = await res.json();
        const result = document.getElementById("statsResult");
        const message = data.message
            ? `<div style="margin-top: 15px; color: var(--text-muted); text-align: center; font-weight: 600;">${data.message}</div>`
            : "";

        result.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                <div class="stat-item">
                    <div class="stat-label">Matches</div>
                    <div class="stat-value">${data.matches}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Wins</div>
                    <div class="stat-value">${data.wins}</div>
                </div>
            </div>
            <div style="margin-top: 20px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; text-align: center; border-left: 5px solid var(--primary);">
                <div style="color: var(--primary); font-size: 2.5rem; font-weight: 900; line-height: 1;">${data.win_percentage}%</div>
                <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin-top: 10px;">Overall Win Rate</div>
            </div>
            ${message}
        `;
    } catch (err) {
        console.error(err);
    }
};

// Compare
document.getElementById("compareBtn").onclick = async () => {
    const t1 = document.getElementById("c1").value;
    const t2 = document.getElementById("c2").value;
    if (!t1 || !t2) return;
    if (t1 === t2) {
        document.getElementById("compareResult").innerHTML = "<span style='color: var(--accent); font-weight: 800;'>Please select two different teams.</span>";
        return;
    }

    try {
        const params = new URLSearchParams({ team1: t1, team2: t2 });
        const res = await fetch(API + `/compare?${params.toString()}`);
        const data = await res.json();
        const result = document.getElementById("compareResult");

        updateCompareChart(t1, t2, data.team1_wins, data.team2_wins);
        result.innerHTML = `
            <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; font-weight: 600; font-size: 0.9rem;">
                Total Head-To-Head: <span style="color: var(--primary)">${data.total_matches}</span>
            </div>
        `;
    } catch (err) {
        console.error(err);
    }
};

function updateCompareChart(name1, name2, wins1, wins2) {
    const chartContainer = document.querySelector("#compareCard .chart-container");
    if (chartContainer && !document.getElementById("compareChart")) {
        chartContainer.innerHTML = '<canvas id="compareChart"></canvas>';
    }

    const ctx = document.getElementById('compareChart').getContext('2d');

    if (compareChart) {
        compareChart.destroy();
        compareChart = null;
    }

    if (wins1 === 0 && wins2 === 0) {
        ctx.canvas.parentElement.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No historical records found for this matchup.</div>';
        return;
    }

    compareChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [name1, name2],
            datasets: [{
                data: [wins1, wins2],
                backgroundColor: ['#f0c330', '#eb2f06'],
                hoverOffset: 0,
                borderWidth: 0,
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f8fafc',
                        padding: 25,
                        usePointStyle: true,
                        font: { size: 13, family: 'Outfit', weight: '600' }
                    }
                }
            }
        }
    });
}

// Initialize
setupInputListeners();

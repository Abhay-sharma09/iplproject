const API = "http://127.0.0.1:8000";

const teams = [
    "Sunrisers Hyderabad",
    "Royal Challengers Bangalore",
    "Mumbai Indians",
    "Rising Pune Supergiant",
    "Gujarat Lions",
    "Kolkata Knight Riders",
    "Kings XI Punjab",
    "Delhi Daredevils"
];

const decisions = ["bat", "field"];

// team suggestions
function showSuggestions(input) {
    let box = input.parentElement.querySelector(".suggestions");
    let value = input.value.toLowerCase();

    box.innerHTML = "";

    let filtered = teams.filter(t => t.toLowerCase().includes(value));

    filtered.forEach(t => {
        let div = document.createElement("div");
        div.innerText = t;
        div.onclick = () => {
            input.value = t;
            box.style.display = "none";
        };
        box.appendChild(div);
    });

    box.style.display = "block";
}

// dropdown click
function toggleDropdown(btn) {
    let box = btn.parentElement.querySelector(".suggestions");
    let input = btn.parentElement.querySelector("input");

    box.innerHTML = "";

    teams.forEach(t => {
        let div = document.createElement("div");
        div.innerText = t;
        div.onclick = () => {
            input.value = t;
            box.style.display = "none";
        };
        box.appendChild(div);
    });

    box.style.display = "block";
}

// decision suggestions
function showDecision(input) {
    let box = input.parentElement.querySelector(".suggestions");

    box.innerHTML = "";

    decisions.forEach(d => {
        let div = document.createElement("div");
        div.innerText = d;
        div.onclick = () => {
            input.value = d;
            box.style.display = "none";
        };
        box.appendChild(div);
    });

    box.style.display = "block";
}

function toggleDecision(btn) {
    let box = btn.parentElement.querySelector(".suggestions");
    let input = btn.parentElement.querySelector("input");

    box.innerHTML = "";

    decisions.forEach(d => {
        let div = document.createElement("div");
        div.innerText = d;
        div.onclick = () => {
            input.value = d;
            box.style.display = "none";
        };
        box.appendChild(div);
    });

    box.style.display = "block";
}

// Predict
document.getElementById("predictBtn").onclick = async () => {
    let res = await fetch(API + "/predict", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            team1: team1.value,
            team2: team2.value,
            toss_winner: toss_winner.value,
            toss_decision: toss_decision.value
        })
    });

    let data = await res.json();

    result.innerText = `🏆 ${data.winner} (${data.probability}%)`;
};

// Stats
document.getElementById("statsBtn").onclick = async () => {
    let res = await fetch(API + "/team-stats/" + teamStats.value);
    let data = await res.json();

    statsResult.innerText =
        `Matches: ${data.matches}, Wins: ${data.wins}, Win%: ${data.win_percentage}%`;
};

// Compare
document.getElementById("compareBtn").onclick = async () => {
    let res = await fetch(API + `/compare?team1=${c1.value}&team2=${c2.value}`);
    let data = await res.json();

    compareResult.innerText =
        `${c1.value}: ${data.team1_wins} | ${c2.value}: ${data.team2_wins}`;
};
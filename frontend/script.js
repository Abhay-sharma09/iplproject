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

// Load teams into all dropdowns
function loadTeams() {
    let ids = ["team1", "team2", "toss_winner", "teamStats", "c1", "c2"];

    ids.forEach(id => {
        let select = document.getElementById(id);
        select.innerHTML = "";

        teams.forEach(team => {
            let option = document.createElement("option");
            option.value = team;
            option.text = team;
            select.appendChild(option);
        });
    });
}

// 🔥 Sync toss winner with selected teams
function syncTossWinner() {
    let team1 = document.getElementById("team1").value;
    let team2 = document.getElementById("team2").value;
    let toss = document.getElementById("toss_winner");

    toss.innerHTML = "";

    [team1, team2].forEach(team => {
        let option = document.createElement("option");
        option.value = team;
        option.text = team;
        toss.appendChild(option);
    });
}

// 🎯 Predict match
async function predict() {
    let data = {
        team1: document.getElementById("team1").value,
        team2: document.getElementById("team2").value,
        toss_winner: document.getElementById("toss_winner").value,
        toss_decision: document.getElementById("toss_decision").value
    };

    try {
        let res = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        let result = await res.json();

        document.getElementById("result").innerText =
            `🏆 ${result.winner} (${result.probability}%)`;

    } catch (err) {
        console.log(err);
        alert("Backend not connected ❌");
    }
}

// 📊 Get stats
async function getStats() {
    let team = document.getElementById("teamStats").value;

    try {
        let res = await fetch(`http://127.0.0.1:8000/team-stats/${team}`);
        let data = await res.json();

        document.getElementById("statsResult").innerText =
            `Matches: ${data.matches}, Wins: ${data.wins}, Win%: ${data.win_percentage}%`;

    } catch (err) {
        alert("Error fetching stats");
    }
}

// ⚔️ Compare teams
async function compare() {
    let t1 = document.getElementById("c1").value;
    let t2 = document.getElementById("c2").value;

    try {
        let res = await fetch(`http://127.0.0.1:8000/compare?team1=${t1}&team2=${t2}`);
        let data = await res.json();

        document.getElementById("compareResult").innerText =
            `${t1}: ${data.team1_wins} wins | ${t2}: ${data.team2_wins} wins`;

    } catch (err) {
        alert("Error comparing teams");
    }
}

// Load everything
loadTeams();
syncTossWinner();
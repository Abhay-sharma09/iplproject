from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
from pydantic import BaseModel

import os

app = FastAPI()

# ✅ CORS FIX (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory for absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model & encoders
model = pickle.load(open(os.path.join(BASE_DIR, "model.pkl"), "rb"))
encoders = pickle.load(open(os.path.join(BASE_DIR, "encoders.pkl"), "rb"))

# Load dataset
data = pd.read_csv(os.path.join(BASE_DIR, "data", "cleaned_matches.csv"))

CURRENT_TEAM_ALIASES = {
    "Chennai Super Kings": ["Chennai Super Kings"],
    "Delhi Capitals": ["Delhi Capitals", "Delhi Daredevils"],
    "Gujarat Titans": ["Gujarat Titans"],
    "Kolkata Knight Riders": ["Kolkata Knight Riders"],
    "Lucknow Super Giants": ["Lucknow Super Giants"],
    "Mumbai Indians": ["Mumbai Indians"],
    "Punjab Kings": ["Punjab Kings", "Kings XI Punjab"],
    "Rajasthan Royals": ["Rajasthan Royals"],
    "Royal Challengers Bengaluru": [
        "Royal Challengers Bengaluru",
        "Royal Challengers Bangalore",
    ],
    "Sunrisers Hyderabad": ["Sunrisers Hyderabad"],
}

MODEL_TEAM_ALIASES = {
    "Punjab Kings": "Kings XI Punjab",
    "Royal Challengers Bengaluru": "Royal Challengers Bangalore",
}

DISPLAY_TEAM_NAMES = {
    "Delhi Daredevils": "Delhi Capitals",
    "Kings XI Punjab": "Punjab Kings",
    "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
}


def team_aliases(team: str):
    return CURRENT_TEAM_ALIASES.get(team, [team])


def model_team_name(team: str):
    return MODEL_TEAM_ALIASES.get(team, team)


def display_team_name(team: str):
    return DISPLAY_TEAM_NAMES.get(team, team)


class MatchData(BaseModel):
    team1: str
    team2: str
    toss_winner: str
    toss_decision: str

@app.get("/")
def home():
    return {"message": "Advanced IPL Predictor 🚀"}

# 🔥 Prediction
@app.post("/predict")
def predict(data_input: MatchData):
    try:
        mapped_input = data_input.dict()
        for key in ["team1", "team2", "toss_winner"]:
            mapped_input[key] = model_team_name(mapped_input[key])

        for key in ["team1", "team2", "toss_winner"]:
            if mapped_input[key] not in encoders[key].classes_:
                return {
                    "error": f"Prediction data is not available for {data_input.dict()[key]}.",
                    "no_data": True,
                }

        df = pd.DataFrame([mapped_input])

        for col in df.columns:
            df[col] = encoders[col].transform(df[col])

        pred = model.predict(df)[0]
        prob = model.predict_proba(df)[0]

        winner = encoders['winner'].inverse_transform([pred])[0]

        return {
            "winner": display_team_name(winner),
            "probability": round(max(prob)*100, 2)
        }

    except Exception as e:
        return {"error": str(e)}

# 📊 Team stats
@app.get("/team-stats/{team}")
def team_stats(team: str):
    aliases = team_aliases(team)
    matches_played = data[(data['team1'].isin(aliases)) | (data['team2'].isin(aliases))]
    wins = matches_played[matches_played['winner'].isin(aliases)]
    win_percentage = 0 if len(matches_played) == 0 else round(len(wins)/len(matches_played)*100, 2)

    return {
        "team": team,
        "matches": len(matches_played),
        "wins": len(wins),
        "win_percentage": win_percentage,
        "message": "" if len(matches_played) else f"No historical data available for {team}."
    }

# ⚔️ Team comparison
@app.get("/compare")
def compare(team1: str, team2: str):
    team1_aliases = team_aliases(team1)
    team2_aliases = team_aliases(team2)

    matches = data[
        ((data['team1'].isin(team1_aliases)) & (data['team2'].isin(team2_aliases))) |
        ((data['team1'].isin(team2_aliases)) & (data['team2'].isin(team1_aliases)))
    ]

    t1_wins = len(matches[matches['winner'].isin(team1_aliases)])
    t2_wins = len(matches[matches['winner'].isin(team2_aliases)])

    return {
        "team1": team1,
        "team2": team2,
        "team1_wins": t1_wins,
        "team2_wins": t2_wins,
        "total_matches": len(matches),
        "message": "" if len(matches) else "No historical records found for this matchup."
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
from pydantic import BaseModel

app = FastAPI()

# ✅ CORS FIX (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model & encoders
model = pickle.load(open("backend/model.pkl", "rb"))
encoders = pickle.load(open("backend/encoders.pkl", "rb"))

# Load dataset
data = pd.read_csv("backend/data/cleaned_matches.csv")

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
        df = pd.DataFrame([data_input.dict()])

        for col in df.columns:
            df[col] = encoders[col].transform(df[col])

        pred = model.predict(df)[0]
        prob = model.predict_proba(df)[0]

        winner = encoders['winner'].inverse_transform([pred])[0]

        return {
            "winner": winner,
            "probability": round(max(prob)*100, 2)
        }

    except Exception as e:
        return {"error": str(e)}

# 📊 Team stats
@app.get("/team-stats/{team}")
def team_stats(team: str):
    matches_played = data[(data['team1'] == team) | (data['team2'] == team)]
    wins = matches_played[matches_played['winner'] == team]

    return {
        "team": team,
        "matches": len(matches_played),
        "wins": len(wins),
        "win_percentage": round(len(wins)/len(matches_played)*100, 2)
    }

# ⚔️ Team comparison
@app.get("/compare")
def compare(team1: str, team2: str):
    matches = data[
        ((data['team1'] == team1) & (data['team2'] == team2)) |
        ((data['team1'] == team2) & (data['team2'] == team1))
    ]

    t1_wins = len(matches[matches['winner'] == team1])
    t2_wins = len(matches[matches['winner'] == team2])

    return {
        "team1": team1,
        "team2": team2,
        "team1_wins": t1_wins,
        "team2_wins": t2_wins,
        "total_matches": len(matches)
    }
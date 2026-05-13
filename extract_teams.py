import pandas as pd
data = pd.read_csv("backend/data/cleaned_matches.csv")
teams = sorted(list(set(data['team1'].unique()) | set(data['team2'].unique())))
print(", ".join([f'"{team}"' for team in teams]))

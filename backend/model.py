import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load dataset
matches = pd.read_csv("backend/data/matches.csv")

# Select columns
matches = matches[['team1', 'team2', 'toss_winner', 'toss_decision', 'winner']]
matches.dropna(inplace=True)

# Save original for stats
matches.to_csv("backend/data/cleaned_matches.csv", index=False)

# Encoding
le_dict = {}
for col in matches.columns:
    le = LabelEncoder()
    matches[col] = le.fit_transform(matches[col])
    le_dict[col] = le

# Split
X = matches.drop('winner', axis=1)
y = matches['winner']

# Train model
model = RandomForestClassifier(n_estimators=200)
model.fit(X, y)

# Save model + encoders
pickle.dump(model, open("backend/model.pkl", "wb"))
pickle.dump(le_dict, open("backend/encoders.pkl", "wb"))

print("✅ Advanced model trained!")
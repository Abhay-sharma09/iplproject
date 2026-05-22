IPL Prime Predictor

IPL Prime Predictor is a machine learning based IPL match prediction web application built using FastAPI, scikit-learn, HTML, CSS, and JavaScript. It predicts match winners, provides team statistics, and compares teams using historical IPL data.

Features
IPL match winner prediction
Team analytics and win percentage
Head-to-head team comparison
Random Forest machine learning model
FastAPI backend APIs
Interactive frontend using JavaScript
Chart.js based comparison charts
Duplicate team prevention
Clear/reset functionality
Historical IPL data analysis

Tech Stack
Frontend
HTML
CSS
JavaScript
Chart.js
Backend
FastAPI
Python
scikit-learn
pandas
Machine Learning

The project uses a Random Forest Classifier trained on IPL historical match data. Team names and toss decisions are encoded using Label Encoders before training.

Project Structure
backend/
frontend/
notebooks/
run.py
README.md
API Endpoints
POST /predict
GET /team-stats/{team}
GET /compare
Setup
pip install fastapi uvicorn pandas scikit-learn pydantic

Run Project
python run.py
or
python -m uvicorn backend.main:app --reload

Future Improvements

Add latest IPL seasons
Support new IPL teams
Add authentication
Deploy on cloud
Improve model accuracy
Add live match prediction

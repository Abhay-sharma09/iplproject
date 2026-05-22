# IPL Prime Predictor

## About The Project

IPL Prime Predictor is a Machine Learning based web application that predicts IPL match winners using historical IPL match data. The project also provides team statistics and head-to-head team comparison through an interactive frontend interface.

The application is built using FastAPI, Scikit-learn, HTML, CSS, and JavaScript.

---

# Features

- IPL Match Winner Prediction
- Team Statistics and Win Percentage
- Head-to-Head Team Comparison
- Random Forest Machine Learning Model
- FastAPI REST APIs
- Interactive Frontend UI
- Chart.js Data Visualization
- Historical IPL Data Analysis

---

# Tech Stack

## Frontend
- HTML
- CSS
- JavaScript
- Chart.js

## Backend
- Python
- FastAPI
- Pandas
- Scikit-learn

## Machine Learning
- Random Forest Classifier
- Label Encoding

---

# Installation

```bash
git clone <your-repository-link>
cd iplproject
pip install fastapi uvicorn pandas scikit-learn pydantic
```

---

# How To Run The Project

## Start Backend Server

```bash
python -m uvicorn backend.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

## Open Frontend

Open this file in your browser:

```text
frontend/index.html
```

---

# Future Improvements

- Add Latest IPL Seasons
- Improve Prediction Accuracy
- Live Match Prediction
- Cloud Deployment


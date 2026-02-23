from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import os
from predictor import run_predict

app = FastAPI()

class PredictRequest(BaseModel):
    db_path: str = 'backend/db/planna.db'

class PredictResponse(BaseModel):
    predicted_income: float
    confidence_score: float

@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    db_path = req.db_path
    if not os.path.exists(db_path):
        raise HTTPException(status_code=400, detail='DB not found')

    # Run the prediction logic (simple stub)
    result = run_predict(db_path)

    # Write analytics back to DB
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute('INSERT INTO Analytics (metric_date, predicted_income, confidence_score) VALUES (date("now"), ?, ?)', (result['predicted_income'], result['confidence_score']))
    conn.commit()
    conn.close()

    return PredictResponse(predicted_income=result['predicted_income'], confidence_score=result['confidence_score'])

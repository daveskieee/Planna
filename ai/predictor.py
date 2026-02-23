import sqlite3
import numpy as np

def run_predict(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    # Simple aggregation: sum event_total for last 6 months
    cur.execute("SELECT strftime('%Y-%m', event_date) as ym, SUM(event_total) FROM Events GROUP BY ym ORDER BY ym DESC LIMIT 6")
    rows = cur.fetchall()
    conn.close()

    values = [r[1] or 0 for r in rows][::-1]
    if len(values) == 0:
        predicted = 0.0
        conf = 0.0
    else:
        # naive prediction: mean of recent months
        predicted = float(np.mean(values))
        # confidence: scaled by count
        conf = min(0.99, 0.5 + 0.1 * len(values))

    return {'predicted_income': predicted, 'confidence_score': conf}

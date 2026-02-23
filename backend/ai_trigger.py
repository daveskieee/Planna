#!/usr/bin/env python
"""
Simple AI trigger script that calls the AI service endpoint.
This is a best-effort, detached runner invoked by the backend.
"""
import sys
import argparse
import requests

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--db', required=True)
    args = p.parse_args()

    # Best-effort notify local AI service
    try:
        resp = requests.post('http://127.0.0.1:8000/predict', json={'db_path': args.db}, timeout=5)
        print('AI service response', resp.status_code)
    except Exception as e:
        print('AI trigger error:', e)

if __name__ == '__main__':
    main()

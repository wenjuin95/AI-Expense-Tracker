FROM python:3.12-slim

WORKDIR /app

COPY backend/requirement.txt ./backend/requirement.txt
RUN pip install --no-cache-dir -r ./backend/requirement.txt

COPY backend ./backend

RUN mkdir -p /app/data /app/backend/receipts

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# 📝AI-Expense-Tracker
An expense tracker that uses OCR and vision-capable AI models through Ollama or Google Gemini to extract structured expense data from receipts.

The application allows users to upload one or multiple receipts, automatically extract expense information, review and edit the extracted data, and save the final result into a SQLite database.

## 💡What Problem Does It Solve?
Managing expenses from physical or digital receipts can involve repetitive manual work. Users need to read information from receipts, enter it into a system, verify the values, and organize the expenses before they can be useful for tracking or analysis.

This project addresses several of these problems:

### ℹ️ **Reduce Manual Data Entry**
- Manually entering expenses from receipts can be repetitive and time-consuming.

### ℹ️ **Convert Unstructured Receipts into Structured Data**
- A receipt is primarily a visual document. The information is not naturally stored as structured fields that an application can easily query or analyze.

The application converts the receipt into structured expense data.
```text
Receipt Image / PDF
        ↓
    Vision Model
        ↓
      JSON
        ↓
Expense + Expense Items
```
> This makes the extracted information usable by the application for expense history, filtering, and analysis.
<br>

### ℹ️ **Avoid Mixing AI Processing with Permanent Data Storage**
<img src="public/multiple%20review.png" width="100%"><br>
- Receipt scanning and expense storage are treated as separate operations.

Scanning a receipt produces a temporary draft:
```text
POST /expenses/scan
        ↓
   Process Receipt
        ↓
    Return Draft
```
Only after the user confirms the information is the expense saved:
```text
POST /expenses
        ↓
 Final Validation
        ↓
     SQLite
```
> This separation makes the workflow safer because an AI-generated result does not automatically become a permanent expense.
<br>

### ℹ️ **Simplify Repetitive Receipt Processing**
<img src="public/multiple%20receipt.png" width="100%"><br>
- Users may have multiple receipts that need to be entered.

Instead of processing each receipt through a completely separate workflow, the application supports batch receipt scanning.
```text
Receipt 1 ──┐
Receipt 2 ──┤
Receipt 3 ──┼──→ Batch Processing
Receipt 4 ──┤
Receipt 5 ──┘
                  ↓
            Expense Drafts
                  ↓
             User Review
```
> Multiple receipts can therefore be processed through the same extraction pipeline.
<br>

### ℹ️ **Turn Saved Expenses into Useful Information**
<img src="public/expense%20overview.png" width="100%"><br>
- Simply storing expenses is not enough if the user cannot easily understand their spending.

Once expenses are stored as structured data, the application can organize them into expense history and summarize spending by category.
```text
Saved Expenses
      ↓
Structured Data
      ↓
Expense History
      ↓
Category Summary
      ↓
Understand Spending
```
> This provides a foundation for further features such as monthly spending summaries, filtering, budgets, and other expense analytics.
<br>

## 💭Workflow
The application can also process multiple receipts in one request.
```text
                  USER
                   │
                   ▼
             Upload Receipt
                   │
                   ▼
              React Frontend
                   │
                   ▼
          POST /expenses/scan
                   │
                   ▼
          Temporary File Storage
                   │
                   ▼
          ReceiptProcessor
                   │
                   ▼
             Vision AI Model
                   │
                   ▼
              JsonParser
                   │
                   ▼
          ExpenseValidator
                   │
                   ▼
             Expense Draft
                   │
                   ▼
            Review & Edit
                   │
             ┌─────┴─────┐
             │           │
         Discard       Save
             │           │
             ▼           ▼
       Delete Temp   POST /expenses
             |           │
             ▼           ▼
           Delete   Final Validation
       Expense Draft     │
                         ▼
                 ExpenseRepository
                         │
                         ▼
                      SQLite
                         │
                         ▼
                  Expense History
```
> Receipts are processed sequentially to avoid running multiple vision-model requests at the same time.
<br>

## Prerequisites
- Docker
- Ollama
- Python
- pip

## 💻 Ollama Setup
If you want to run the AI model locally, install Ollama and make sure it is running.

Verify:
```
ollama --version
```
Check installed models:
```
ollama list
```
Pull a supported vision model, for example:
```
ollama pull gemma3:4b
```
> The exact model can be configured in the backend configuration.
> Make sure Ollama is accessible from the backend container.
<br>

## 💻🌐 Gemini Setup
If using Google Gemini, create a Gemini API key and place it in:
```
backend/.env

Example:

MODEL_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
```
> Do not commit .env or API keys to Git.
<br>

## 📖 Running the Application
1. Clone the repository:
```
git clone <your-repository-url>
cd AI-Expense-Tracker
```

2. Configure the backend environment:
```
cp backend/.env.example backend/.env
```
Then edit:
```
backend/.env
```

3. Choose your AI provider.

For Ollama:
```
MODEL_PROVIDER=ollama
```
For Gemini:
```
MODEL_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=YOUR_MODEL_NAME_HERE
```

4. Start build the application
```bash
make build
```

5. Start run the application
```bash
make run
```

> The services will start the backend and frontend. <br>
> Frontend: http://localhost:5173 <br>
> Backend API: http://localhost:8000 <br>
> FastAPI documentation: http://localhost:8000/docs <br>


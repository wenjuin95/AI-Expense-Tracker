# AI-Expense-Tracker
An expense tracker that uses OCR and an Ollama vision model to extract expense data from uploaded receipts.

## Workflow
```text
                 ┌───────────────┐
                 │ Select Receipt│
                 └───────┬───────┘
                         ↓
                POST /expenses/scan
                         ↓
                  Save temporary file
                         ↓
                  ReceiptProcessor
                         ↓
                    OllamaClient
                         ↓
                     JsonParser
                         ↓
                 ExpenseValidator
                         ↓
                  Return OCR Draft
                         ↓
                ┌─────────────────┐
                │  User Reviews   │
                │  & Edits        │
                └────────┬────────┘
                         │
                ┌────────┴────────┐
                ↓                 ↓
             DISCARD             SAVE
                │                 │
                ↓                 ↓
        Delete temporary      POST /expenses
             receipt               │
                                  ↓
                         Validate final data
                                  ↓
                         ExpenseRepository
                                  ↓
                     ┌────────────┼────────────┐
                     ↓            ↓            ↓
                  Receipt      Expense    ExpenseItems
                     └────────────┼────────────┘
                                  ↓
                                SQLite
```
Receipt files are temporary processing inputs. They are not saved in the database and are deleted after scanning. The database stores the extracted expense information and its line items.

## Application Structure
```text
backend/app/
├── main.py                    # Creates the FastAPI application
├── api/expense_api.py         # Expense routes
├── clients/ollama_client.py   # Ollama integration and prompts
├── core/config.py             # Application configuration
├── database/                  # SQLAlchemy connection and models
├── repositories/              # Database queries and writes
├── schemas/                   # Pydantic request models
├── services/                  # Receipt processing and validation
└── utils/json_parser.py       # Model-response JSON parsing

frontend/src/
├── api/expenseApi.ts          # Backend HTTP requests
├── components/Layout.tsx      # Shared application layout
├── pages/                     # Upload, list, and detail screens
└── types/expenses.ts          # Shared frontend types
```

## API Routes
| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/expenses/scan` | Upload and process a receipt temporarily |
| `POST` | `/expenses` | Save the reviewed expense to SQLite |
| `GET` | `/expenses` | List saved expenses |
| `GET` | `/expenses/{expense_id}` | View one expense and its items |
| `DELETE` | `/expenses/{expense_id}` | Delete one expense |

## Running the Application
Start the backend from the repository root:
```bash
uvicorn backend.app.main:app --reload
```

Start the frontend in a second terminal:
```bash
cd frontend
npm install
npm run dev
```


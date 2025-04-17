# QueryMySheet

Query your spreadsheets (Google Sheets, CSV, Excel) using natural language. This tool lets you ask questions about your data in plain English and get instant results.

## Features

*   Connect to Google Sheets via URL.
*   Upload CSV, XLS, or XLSX files.
*   Ask natural language questions about your data.
*   View results in an easy-to-read table.
*   Export results to CSV (Coming soon!).
*   Simple, clean interface.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite, CSS
*   **Core Logic:** (Potentially add backend language/framework if applicable, e.g., Python/Flask/FastAPI)
*   **AI/LLM:** (Specify the model or service used for NLQ processing, e.g., OpenAI API)
*   **Libraries:** `papaparse`, `xlsx`, `lucide-react`

## Setup and Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/IdeaFlowCo/QueryMySheet.git
    cd QueryMySheet
    ```

2.  **Set up Frontend:**
    ```bash
    cd frontend
    npm install
    ```

3.  **Environment Variables:**
    *   Navigate to the `frontend` directory.
    *   Copy the example environment file: `cp .env.example .env`
    *   Edit the `.env` file and add any necessary API keys or configuration (e.g., `VITE_OPENAI_API_KEY=your_api_key_here` if using OpenAI).

4.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5173`.

## How it Works

1.  **Provide Your Data:** Either paste a Google Sheet URL (ensure it's publicly accessible or you have permission) or upload a CSV/Excel file.
2.  **Ask a Question:** Type your question about the data in the input box (e.g., "show me all employees hired after 2020", "what are the total sales for Q3?").
3.  **Get Results:** Click "Go". The application will process your sheet data and your question, displaying the relevant results in a table below.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file (if applicable) for details. *(Note: Add a LICENSE file if you intend to use one)* 
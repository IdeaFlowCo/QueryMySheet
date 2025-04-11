# QueryMySheet

An intelligent document querying application that lets you analyze Google Sheets and CSV files using natural language.

## Features

- Query spreadsheet data using natural language
- Support for Google Sheets URLs and file uploads (CSV/Excel)
- Responsive design with drag-and-drop functionality
- OS-aware keyboard shortcuts
- Simple, clean interface

## Development

This project uses React for the frontend and Express for the backend.

### Prerequisites

- Node.js 18+ 
- npm 8+

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and add your API keys:
   ```
   cp .env.example .env
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Environment Variables

Create a `.env` file with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
```

## Deployment to Vercel

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fquerymysheet)

### Manual Deployment

1. Install Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Link your project:
   ```
   vercel link
   ```

3. Add the required environment variables:
   ```
   vercel env add OPENAI_API_KEY
   ```

4. Deploy to production:
   ```
   vercel --prod
   ```

### Environment Variables on Vercel

Make sure to add the following environment variables in the Vercel dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key

## License

MIT
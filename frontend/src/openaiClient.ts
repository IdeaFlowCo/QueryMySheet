import OpenAI from "openai";

let apiKey: string | undefined;

// Check if import.meta.env is available (Vite environment)
if (typeof import.meta !== "undefined" && import.meta.env) {
    apiKey = import.meta.env.VITE_OPENAI_API_KEY;
} else {
    // Fallback to process.env (Node/Jest environment - requires dotenv setup for Jest)
    apiKey = process.env.VITE_OPENAI_API_KEY;
}

// Define the OpenAI client type
type OAIClientType = OpenAI;

// Instantiate real or stub client
const openaiClient: OAIClientType = apiKey
    ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
    : // Provide a clearer stub or throw an error if no key is found in any environment
      (() => {
          console.error(
              "ERROR: VITE_OPENAI_API_KEY not found. Ensure it's set in your .env file and accessible via process.env for Node/Jest or import.meta.env for Vite."
          );
          // Return a non-functional stub to avoid hard crashing, but log error.
          return {
              chat: {
                  completions: {
                      create: async () => {
                          console.error(
                              "OpenAI client not initialized due to missing API key."
                          );
                          return { choices: [] };
                      },
                  },
              },
          } as unknown as OAIClientType;
      })();

export default openaiClient;

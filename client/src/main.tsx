import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "QueryMySheet - Query your spreadsheets with AI";

createRoot(document.getElementById("root")!).render(<App />);

import "./App.css";
import { DataProvider } from "./context/DataContext";
import DataLoader from "./components/DataLoader";
import SearchFilter from "./components/SearchFilter";
import DataTable from "./components/DataTable";

function App() {
    return (
        <DataProvider>
            <div style={{ padding: "1rem" }}>
                <h1>QueryMySheet</h1>
                <DataLoader />
                <SearchFilter />
                <DataTable />
            </div>
        </DataProvider>
    );
}

export default App;

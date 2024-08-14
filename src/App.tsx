import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Page } from "./Page";
import "./styles/base.css";
import "./styles/theme.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
}

export default App;

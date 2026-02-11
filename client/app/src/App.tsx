import { AppRoutes } from "./routes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster theme="system" position="top-right" richColors closeButton />
    </>
  );
}

export default App;

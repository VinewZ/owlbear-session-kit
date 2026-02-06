import { StrictMode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import OBR from "@owlbear-rodeo/sdk";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <StyledEngineProvider enableCssLayer>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <WaitForOBR>
          <RouterProvider router={router} />
        </WaitForOBR>
      </StyledEngineProvider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// React Provider that wraps children and waits for OBR to be ready
function WaitForOBR({ children }: { children: React.ReactNode }) {
  const [isOBRReady, setIsOBRReady] = useState(false);

  useEffect(() => {
    if (!OBR.isAvailable) return;

    OBR.onReady(() => {
      setIsOBRReady(true);
    });
  }, []);

  if (!isOBRReady) {
    return <div>Waiting For OBR...</div>;
  }

  return <>{children}</>;
}

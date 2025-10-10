// Disable SES lockdown to prevent intrinsics warnings and allow wallet interaction
// This must be done before importing stellar-sdk or freighter-api
if (typeof window !== "undefined") {
  // @ts-ignore - Prevent SES lockdown from being applied
  window.LOCKDOWN = false;
  // @ts-ignore - Override lockdown function if it exists
  if (typeof globalThis.lockdown === "function") {
    globalThis.lockdown = () => {};
  }
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

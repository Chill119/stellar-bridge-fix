// Disable SES lockdown to prevent intrinsics warnings and allow wallet interaction
// This must be done before importing stellar-sdk or freighter-api
if (typeof window !== "undefined") {
  // @ts-ignore - Prevent SES lockdown from being applied
  window.LOCKDOWN = false;
  
  // @ts-ignore - Override lockdown and harden functions
  Object.defineProperty(globalThis, 'lockdown', {
    value: () => {},
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(globalThis, 'harden', {
    value: (obj: any) => obj,
    writable: true,
    configurable: true
  });
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

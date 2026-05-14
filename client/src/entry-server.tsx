import ReactDOMServer from "react-dom/server";
import { Router } from "wouter";
import helmetPkg from "react-helmet-async";
const { HelmetProvider } = helmetPkg as any;
import App from "./App";

// Simple static location hook for SSR — no useSyncExternalStore needed
function makeStaticHook(path: string) {
  const hook = () => [path, () => {}] as [string, (to: string) => void];
  hook.searchHook = () => "";
  return hook;
}

export function render(url: string): { html: string; helmet: any } {
  const helmetContext: any = {};

  const html = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <Router hook={makeStaticHook(url)}>
        <App />
      </Router>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet };
}

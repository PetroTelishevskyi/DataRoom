import { useContext } from "react";
import {
  BrowserActionContext,
  defaultBrowserActions,
} from "./browser-action-context";

export function useBrowserActions() {
  const context = useContext(BrowserActionContext);

  if (!context) {
    return {
      ...defaultBrowserActions,
      setBrowserActions: () => undefined,
    };
  }

  return context;
}

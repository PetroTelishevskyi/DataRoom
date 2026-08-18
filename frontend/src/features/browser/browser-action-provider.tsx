import { PropsWithChildren, useMemo, useState } from "react";
import {
  BrowserActionContext,
  defaultBrowserActions,
  type BrowserActionState,
} from "./browser-action-context";

export function BrowserActionProvider({ children }: PropsWithChildren) {
  const [actions, setActions] =
    useState<BrowserActionState>(defaultBrowserActions);
  const value = useMemo(
    () => ({
      ...actions,
      setBrowserActions: setActions,
    }),
    [actions],
  );

  return (
    <BrowserActionContext.Provider value={value}>
      {children}
    </BrowserActionContext.Provider>
  );
}

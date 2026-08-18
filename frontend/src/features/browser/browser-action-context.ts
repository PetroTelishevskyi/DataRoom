import { createContext } from "react";
import type { CreateFolderHandler } from "./browser-action.types";

export type BrowserActionState = {
  canCreateFolder: boolean;
  itemCount: number | null;
  onCreateFolder?: CreateFolderHandler;
};

export type BrowserActionContextValue = BrowserActionState & {
  setBrowserActions: (actions: BrowserActionState) => void;
};

export const defaultBrowserActions: BrowserActionState = {
  canCreateFolder: false,
  itemCount: null,
};

export const BrowserActionContext =
  createContext<BrowserActionContextValue | null>(null);

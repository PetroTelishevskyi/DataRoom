import { createContext } from "react";
import type {
  CreateFolderHandler,
  UploadFilesHandler,
} from "./browser-action.types";

export type BrowserActionState = {
  canCreateFolder: boolean;
  canUpload: boolean;
  itemCount: number | null;
  onCreateFolder?: CreateFolderHandler;
  onUploadFiles?: UploadFilesHandler;
};

export type BrowserActionContextValue = BrowserActionState & {
  setBrowserActions: (actions: BrowserActionState) => void;
};

export const defaultBrowserActions: BrowserActionState = {
  canCreateFolder: false,
  canUpload: false,
  itemCount: null,
};

export const BrowserActionContext =
  createContext<BrowserActionContextValue | null>(null);

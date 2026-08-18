import { createContext } from "react";
import type {
  CreateFolderHandler,
  UploadFileHandler,
} from "./browser-action.types";

export type BrowserActionState = {
  canCreateFolder: boolean;
  canUpload: boolean;
  itemCount: number | null;
  onCreateFolder?: CreateFolderHandler;
  onUploadFile?: UploadFileHandler;
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

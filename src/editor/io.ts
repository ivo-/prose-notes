import * as tauriIO from "./io.tauri";
import * as webIO from "./io.web";

const isTauri = Boolean(window.__TAURI__);

export const init = isTauri ? tauriIO.init : webIO.init;
export const persist = isTauri ? tauriIO.persist : webIO.persist;
export const uploadFile = isTauri ? tauriIO.uploadFile : webIO.uploadFile;
export const createOrSelectNoteContent = isTauri
  ? tauriIO.createOrSelectNoteContent
  : webIO.createOrSelectNoteContent;
export const listenForFileUploads = isTauri
  ? tauriIO.listenForFileUploads
  : webIO.listenForFileUploads;

export const openDataDir = isTauri ? tauriIO.openDataDir : webIO.openDataDir;

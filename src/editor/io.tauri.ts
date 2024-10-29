import { open } from "@tauri-apps/api/dialog";
import { tauri } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import {
  BaseDirectory,
  createDir,
  exists,
  readBinaryFile,
  readTextFile,
  writeBinaryFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Note, State } from "./state";

const baseDir = ".prose";
const NOTES_DIR_NAME = `${baseDir}/notes`;
const FILES_DIR_NAME = `${baseDir}/files`;
const CONFIG_FILE_NAME = `${baseDir}/state.json`;

export const init = async (state: State) => {
  const appDirExists = await exists(baseDir, {
    dir: BaseDirectory.Home,
  });

  if (!appDirExists) {
    await createDir(baseDir, {
      dir: BaseDirectory.Home,
    });
  }

  const stateFileExists = await exists(CONFIG_FILE_NAME, {
    dir: BaseDirectory.Home,
  });

  if (!stateFileExists) {
    await writeTextFile(
      { path: CONFIG_FILE_NAME, contents: JSON.stringify(state) },
      { dir: BaseDirectory.Home }
    );
  }

  const notesDirExists = await exists(NOTES_DIR_NAME, {
    dir: BaseDirectory.Home,
  });
  if (!notesDirExists) {
    await createDir(NOTES_DIR_NAME, {
      dir: BaseDirectory.Home,
    });
  }

  const filesDirExists = await exists(FILES_DIR_NAME, {
    dir: BaseDirectory.Home,
  });
  if (!filesDirExists) {
    await createDir(FILES_DIR_NAME, {
      dir: BaseDirectory.Home,
    });
  }

  const appStateText = await readTextFile(CONFIG_FILE_NAME, {
    dir: BaseDirectory.Home,
  });

  return JSON.parse(appStateText) as State;
};

export const persist = async (state: State) => {
  await writeTextFile(CONFIG_FILE_NAME, JSON.stringify(state), {
    dir: BaseDirectory.Home,
  });

  const currentNote = state.currentNote;
  if (!currentNote) return;

  await writeTextFile(
    `${NOTES_DIR_NAME}/${currentNote.id}.json`,
    JSON.stringify(currentNote.content),
    {
      dir: BaseDirectory.Home,
    }
  );

  console.log("persisted");
};

export const createOrSelectNoteContent = async (id: string) => {
  const noteFileExists = await exists(`${NOTES_DIR_NAME}/${id}.json`, {
    dir: BaseDirectory.Home,
  });

  let content = {};
  if (!noteFileExists) {
    await writeTextFile(`${NOTES_DIR_NAME}/${id}.json`, JSON.stringify({}), {
      dir: BaseDirectory.Home,
    });
  } else {
    const contentText = await readTextFile(`${NOTES_DIR_NAME}/${id}.json`, {
      dir: BaseDirectory.Home,
    });

    content = JSON.parse(contentText);
  }

  return content as Note["content"];
};

export const uploadFile = async (sourceFilePath: string) => {
  const fileContent = await readBinaryFile(sourceFilePath);
  const fileName = sourceFilePath.split("/").pop() || sourceFilePath;

  const targetFilePath = `${FILES_DIR_NAME}/${fileName}`;
  await writeBinaryFile(targetFilePath, fileContent, {
    dir: BaseDirectory.Home,
  });

  return convertFileSrc((await homeDir()) + targetFilePath);
};

export const listenForFileUploads = (callback: (url: string) => void) => {
  const unListen = listen("tauri://file-drop", async (event) => {
    const fileNames = event.payload as string[];
    const url = await uploadFile(fileNames[0]);
    debugger;
    callback(url);
  });

  return () => {
    unListen.then((f) => f());
  };
};

export const openDataDir = async () => {
  await tauri.invoke("show_in_folder", { path: (await homeDir()) + baseDir });

  return "";
};

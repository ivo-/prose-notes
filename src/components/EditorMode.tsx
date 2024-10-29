import React from "react";

export type Mode = "editor" | "preview" | "presentation";

export type EditorModeProps = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

export const EditorMode: React.FC<EditorModeProps> = ({ mode, setMode }) => {
  const handleButtonClick = (selectedMode: Mode) => {
    setMode(selectedMode);
  };

  return (
    <>
      <div className="field has-addons is-centered">
        <p className="control" style={{ width: "100%" }}>
          <button
            className={`button is-fullwidth ${mode === "editor" ? "is-success" : ""}`}
            onClick={() => handleButtonClick("editor")}
          >
            <span className="icon is-small">
              <i className="fas fa-pen"></i>
            </span>
            <span>Editor</span>
          </button>
        </p>
        <p className="control" style={{ width: "100%" }}>
          <button
            className={`button is-fullwidth ${mode === "preview" ? "is-success" : ""}`}
            onClick={() => handleButtonClick("preview")}
          >
            <span className="icon is-small">
              <i className="fas fa-eye"></i>
            </span>
            <span>Preview</span>
          </button>
        </p>
        <p className="control" style={{ width: "100%" }}>
          <button
            className={`button is-fullwidth ${mode === "presentation" ? "is-success" : ""}`}
            onClick={() => handleButtonClick("presentation")}
          >
            <span className="icon is-small">
              <i className="fab fa-slideshare"></i>
            </span>
            <span>Slides</span>
          </button>
        </p>
      </div>
    </>
  );
};

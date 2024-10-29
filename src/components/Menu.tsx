import classNames from "classnames";
import { memo, useState, useCallback, useMemo } from "react";
import { State } from "../editor/state";

import styles from "./Menu.module.css";

export const tagClassName = "prose--tag";
export const noteClassName = "prose--tag--note";

export const TAGS_DELIMITER = "/";

type Note = State["notes"][number];

type TagsTree = {
  [tag: string]: {
    notes: State["notes"];
    children: undefined | TagsTree;
  };
};

const Menu = ({
  notes,
  onDelete,
  onCreateEmptyNote,
  onSetCurrentNote,
  currentNoteId,
}: {
  notes: State["notes"];
  currentNoteId: string | null;
  onDelete: (id: string) => void;
  onSetCurrentNote: (id: string) => void;
  onCreateEmptyNote: () => void;
}) => {
  const tagGroups = getNestedTags(notes);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div className={styles.menu}>
      <NoteList
        notes={notes.filter((n) =>
          selectedTags.every((t) => n.tags.find((tag) => tag.startsWith(t)))
        )}
        currentNoteId={currentNoteId}
        onDelete={onDelete}
        onSetCurrentNote={onSetCurrentNote}
        onCreateEmptyNote={onCreateEmptyNote}
      />
      <TagList
        graph={tagGroups}
        selectedTags={selectedTags}
        onSelectTags={setSelectedTags}
      />
    </div>
  );
};

const TagList = memo(function TagList({
  graph,
  selectedTags,
  onSelectTags,
}: {
  graph: TagsTree;
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
}) {
  const [opened, setOpened] = useState(true);

  return (
    <nav className="panel is-primary">
      <aside className="menu">
        <ul className="menu-list">
          <li>
            <a className="is-active" onClick={() => setOpened(!opened)}>
              <span className="icon is-small">
                <i
                  className={classNames(
                    "fas",
                    opened ? " fa-angle-down" : " fa-angle-up"
                  )}
                  aria-hidden="true"
                ></i>
              </span>
              Tags
            </a>
            {opened ? (
              <ul className={styles.list}>
                {Object.keys(graph).map((t) => (
                  <Tag
                    key={t}
                    tag={t}
                    graph={graph}
                    selectedTags={selectedTags}
                    onSelectTags={onSelectTags}
                  />
                ))}
              </ul>
            ) : null}
          </li>
        </ul>
      </aside>
    </nav>
  );
});

const Tag = memo(function Tag({
  tag,
  graph,
  selectedTags,
  onSelectTags,
}: {
  tag: string;
  graph: TagsTree;
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
}) {
  const { children } = graph[tag];
  const [opened, setOpened] = useState(false);
  const hasSubtags = children && Object.keys(children).length > 0;
  const isSelected = selectedTags.includes(tag);
  const handleSelect = () => {
    if (isSelected) {
      onSelectTags(selectedTags.filter((t) => t !== tag));
    } else {
      onSelectTags([...selectedTags, tag]);
    }
  };
  return (
    <li key={tag} data-tag={tag} className={tagClassName}>
      <a className="text-ellipsis">
        {hasSubtags ? (
          <span className="icon is-small" onClick={() => setOpened(!opened)}>
            <i
              className={classNames(
                "fas",
                opened ? " fa-angle-down" : " fa-angle-up"
              )}
              aria-hidden="true"
            ></i>
          </span>
        ) : null}
        <span
          className={classNames("tag is-medium", isSelected && "is-success")}
          onClick={handleSelect}
        >
          {tag}
        </span>
      </a>

      {hasSubtags && opened ? (
        <ul className="menu-list">
          <li>
            {Object.keys(children).map((t) => (
              <Tag
                key={t}
                tag={t}
                graph={children}
                selectedTags={selectedTags}
                onSelectTags={onSelectTags}
              />
            ))}
          </li>
        </ul>
      ) : null}
    </li>
  );
});

const NoteList = memo(function NodeList({
  notes,
  currentNoteId,
  onDelete,
  onSetCurrentNote,
  onCreateEmptyNote,
}: {
  notes: State["notes"];
  currentNoteId: string | null;
  onDelete: (id: string) => void;
  onSetCurrentNote: (id: string) => void;
  onCreateEmptyNote: () => void;
}) {
  const [opened, setOpened] = useState(true);
  const onDeleteCallbacks = useMemo(
    () =>
      notes.map((note) => () => {
        onDelete(note.id);
      }),
    [notes, onDelete]
  );

  return (
    <nav className={`panel is-primary ${styles.noteList}`}>
      <aside className="menu">
        <ul className="menu-list">
          <li onClick={() => setOpened(!opened)}>
            <a className="is-active">
              <span className="icon is-small">
                <i
                  className={classNames(
                    "fas",
                    opened ? " fa-angle-down" : " fa-angle-up"
                  )}
                  aria-hidden="true"
                ></i>
              </span>
              Notes
            </a>
          </li>
        </ul>
      </aside>
      {opened ? (
        <>
          <div className={styles.list}>
            {notes.map((n, i) => (
              <Note
                key={i}
                note={n}
                currentNoteId={currentNoteId}
                onSetCurrentNote={onSetCurrentNote}
                onDelete={onDeleteCallbacks[i]}
                isLast={i === notes.length - 1}
              />
            ))}
          </div>
          <div className="panel-block">
            <button
              className="button is-primary is-fullwidth"
              onClick={() => onCreateEmptyNote()}
            >
              New
            </button>
          </div>
        </>
      ) : null}
    </nav>
  );
});

const Note = memo(function Note({
  note,
  currentNoteId,
  onSetCurrentNote,
  onDelete,
  isLast = false,
}: {
  note: Note;
  currentNoteId: string | null;
  onSetCurrentNote: (id: string) => void;
  onDelete: () => void;
  isLast: boolean;
}) {
  const isActive = note.id === currentNoteId;
  return (
    <a
      className={classNames("panel-block", "relative", isActive && "is-active")}
      onClick={() => onSetCurrentNote(note.id)}
    >
      <div className={styles.noteWrapper}>
        <div>
          <span className="panel-icon">
            <i className="fas fa-book" aria-hidden="true"></i>
          </span>
          {note.title}
        </div>
        <div>
          <NoteMenu onDelete={onDelete} isLast={isLast} />
        </div>
      </div>
    </a>
  );
});

const NoteMenu = memo(function NoteMenu({
  onDelete,
  isLast = false,
}: {
  onDelete: () => void;
  isLast: boolean;
}) {
  const onDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this note?")) {
        onDelete();
      }
    },
    [onDelete]
  );
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      className={classNames(
        "dropdown is-right",
        isLast && "is-up",
        isHovered && "is-active"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="dropdown-trigger">
        <button
          className="button is-small"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
        >
          <span className="icon is-small">
            <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          <a
            href="#"
            className="dropdown-item has-text-danger"
            onClick={onDeleteClick}
          >
            Delete
          </a>
        </div>
      </div>
    </div>
  );
});

export const getNestedTagsFromTag = (tag: string) => {
  const tags = tag.split(TAGS_DELIMITER);
  const nestedTags = [];

  let currentTag = "";
  for (const tag of tags) {
    currentTag += tag;
    nestedTags.push(currentTag);
    currentTag += TAGS_DELIMITER;
  }

  return nestedTags;
};

export const getNestedTags = (notes: State["notes"]) => {
  return Array.from(new Set(notes.map((n) => n.tags).flat())).reduce(
    (result, tag) => {
      let current: TagsTree = result;
      for (const t of getNestedTagsFromTag(tag)) {
        if (!current[t]) {
          current[t] = {
            notes: notes.filter((n) => n.tags.includes(tag)),
            children: {},
          };
        } else {
          current[t].notes = [
            ...current[t].notes,
            ...notes.filter(
              (n) => n.tags.includes(tag) && !current[t].notes.includes(n)
            ),
          ];
        }
        current = current[t].children!;
      }

      return result;
    },
    {} as TagsTree
  );
};

export default memo(Menu);

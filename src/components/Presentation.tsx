import { useState, useRef, useCallback } from "react";
import { useKey, useFullscreen, useToggle, useEvent } from "react-use";
import { getPreviewNode } from "../editor/preview";
import * as opened from "../editor/decorations/opened";
import * as folded from "../editor/decorations/folded";
import * as checkbox from "../editor/decorations/checkbox";
import * as counter from "../editor/decorations/counter";
import * as proportion from "../editor/decorations/proportion";
import * as hr from "../editor/decorations/hr";
import * as todo from "../editor/decorations/todo";
import { PRESENTATION_CONTAINER_ID } from "../editor/constants";

export default function Presentation() {
  const ref = useRef(null);
  const [show, toggleFullscreen] = useToggle(false);

  useFullscreen(ref, show, {
    onClose: () => toggleFullscreen(false),
  });

  const [page, setPage] = useState(0);

  // TODO: Potentially cache preview node on mount to avoid re-creating it on every
  //       render. Component will be unmounted and mounted again when switching
  //       between editor and preview.
  const content = getPreviewNode();

  const slides: HTMLElement[][] = [];

  const handlePrevPage = useCallback(() => {
    setPage(Math.max(page - 1, 0));
    return false;
  }, [page]);

  const handleNextPage = useCallback(() => {
    const foldedNode = document.querySelector(
      `#${PRESENTATION_CONTAINER_ID} .${folded.classNameOpening}`
    );
    if (foldedNode) {
      elementClassNameEventHandlers[folded.classNameOpening](
        foldedNode as HTMLElement
      );
      return false;
    }
    setPage(Math.min(page + 1, slides.length - 1));
    return false;
  }, [page, slides.length]);

  useKey("ArrowLeft", handlePrevPage, {}, [page]);
  useKey("ArrowRight", handleNextPage, {}, [page]);

  useEvent("click", (e) => {
    const node = e.target as HTMLElement;
    for (const className in elementClassNameEventHandlers) {
      if (node.classList.contains(className)) {
        elementClassNameEventHandlers[className](node);
        return;
      }
    }
  });

  if (!content) return null;

  let currentSlide: HTMLElement[] = [];
  slides.push(currentSlide);

  Array.from(content.children).forEach((n, i) => {
    const node = n as HTMLElement;
    if (i === 0) {
      currentSlide.push(node);
      return;
    }

    if (node.classList.contains(hr.className)) {
      currentSlide = [];
      slides.push(currentSlide);
      return;
    }

    currentSlide.push(node);
  });

  return (
    <div id={PRESENTATION_CONTAINER_ID} className="ProseMirror">
      <div className="content mt-5">
        <nav className="pagination" role="navigation">
          <div
            className="pagination-previous button"
            onClick={() => toggleFullscreen()}
          >
            <span className="icon is-small">
              <i className="fas fa-expand"></i>
            </span>
            <span>Toggle Fullscreen</span>
          </div>

          <ul className="pagination-list" style={{ margin: 0 }}>
            <li>
              <a href="#" className="pagination-link" onClick={handlePrevPage}>
                Previous
              </a>
              <a href="#" className="pagination-link is-current">
                <span data-testid="current-page">{page + 1}</span> /{" "}
                <span data-testid="pages">{slides.length}</span>
              </a>
              <a href="#" className="pagination-link" onClick={handleNextPage}>
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <hr />
      <section>
        <div
          ref={ref}
          dangerouslySetInnerHTML={{
            __html: slides[page].map((node) => node.outerHTML).join(""),
          }}
        />
      </section>
    </div>
  );
}

// Re-crate some of the interactions from the editor for the purpose of having
// interactive slides. Changes to the elements won't be reflected back to the
// editor.
const elementClassNameEventHandlers: Record<string, (e: HTMLElement) => void> =
  {
    [opened.classNameOpening]: (node) => {
      node.classList.remove(opened.className, opened.classNameOpening);
      node.classList.add(folded.className, folded.classNameOpening);

      let next = node;
      while ((next = next.nextElementSibling as HTMLElement)) {
        if (next.classList.contains(opened.classNameClosing)) {
          next.classList.remove(opened.className, opened.classNameClosing);
          next.classList.add(folded.className, folded.classNameClosing);
          break;
        }

        if (next.classList.contains(opened.className)) {
          next.classList.remove(opened.className);
          next.classList.add(folded.className);
          continue;
        }
      }
    },

    [folded.classNameOpening]: (node) => {
      node.classList.remove(folded.className, folded.classNameOpening);
      node.classList.add(opened.className, opened.classNameOpening);

      let next = node;
      while ((next = next.nextElementSibling as HTMLElement)) {
        if (next.classList.contains(folded.classNameClosing)) {
          next.classList.remove(folded.className, folded.classNameClosing);
          next.classList.add(opened.className, opened.classNameClosing);
          break;
        }

        if (next.classList.contains(folded.className)) {
          next.classList.remove(folded.className);
          next.classList.add(opened.className);
          continue;
        }
      }
    },

    [checkbox.className]: (node) => {
      node.classList.toggle(checkbox.checkedClassName);
    },

    [todo.className]: (node) => {
      node.classList.toggle(todo.checkedClassName);
    },

    [counter.leftClassName]: (node) => {
      let next = node;
      while ((next = next.nextElementSibling as HTMLElement)) {
        if (next.classList.contains(counter.className)) {
          const value = Number(next.textContent);
          next.textContent = String(Math.max(value - 1, 0));
          break;
        }
      }
    },

    [counter.rightClassName]: (node) => {
      let prev = node;
      while ((prev = prev.previousElementSibling as HTMLElement)) {
        if (prev.classList.contains(counter.className)) {
          const value = Number(prev.textContent);
          prev.textContent = String(value + 1);
          break;
        }
      }
    },

    [proportion.leftClassName]: (node) => {
      let next = node;
      while ((next = next.nextElementSibling as HTMLElement)) {
        if (next.classList.contains(proportion.className)) {
          const m = (next.textContent || "").split(
            proportion.PROPORTION_DELIMITER
          );
          next.textContent = `${Math.max(Number(m[0]) - 1, 0)}${
            m[1] ? `${proportion.PROPORTION_DELIMITER}${m[1]}` : ""
          }`;
          break;
        }
      }
    },

    [proportion.rightClassName]: (node) => {
      let prev = node;
      while ((prev = prev.previousElementSibling as HTMLElement)) {
        if (prev.classList.contains(proportion.className)) {
          const m = (prev.textContent || "").split(
            proportion.PROPORTION_DELIMITER
          );
          prev.textContent = `${Math.min(Number(m[0]) + 1, parseInt(m[1], 10))}${
            m[1] ? `${proportion.PROPORTION_DELIMITER}${m[1]}` : ""
          }`;
          break;
        }
      }
    },
  };

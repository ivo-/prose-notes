import React, { MouseEventHandler, useCallback, useRef } from "react";
import { ProseDecorations } from "../editor/decorations";

const DecorationsByClassName = ProseDecorations.reduce((result, d) => {
  if (d.className in result) {
    throw new Error(`Decoration className collision on: ${d.className}`);
  }
  return {
    ...result,
    [d.className]: d,
  };
}, {} as Record<string, typeof ProseDecorations[number]>);

export type RowOptionsMenuProps = {
  top: number;
  left: number;
  triggerRow: HTMLElement;
  onClose: () => void;
};

const RowOptionsMenu: React.FC<RowOptionsMenuProps> = ({
  top,
  left,
  onClose,
  triggerRow,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { className: triggerRowClassName } = triggerRow;
  const customOptions =
    DecorationsByClassName[triggerRowClassName]?.menuOptions || [];
  const handleClose: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const target = e.target as HTMLElement;
      if (target === rootRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const handleDelete: MouseEventHandler<HTMLElement> = useCallback(() => {
    triggerRow.parentNode?.removeChild(triggerRow);
    onClose();
  }, [triggerRow, onClose]);

  return (
    <div className="wrapper" onClick={handleClose} ref={rootRef}>
      <div className="content">
        <nav>
          <ul>
            <li key="delete">
              <button onClick={handleDelete}>Delete</button>
            </li>
            {customOptions.map((option) => (
              <li key={option.name}>
                <button onClick={() => option.handler(triggerRow)}>
                  {option.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <style jsx global>{`
        .wrapper {
          position: fixed;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }
        .content {
          position: absolute;
          top: ${top}px;
          left: ${left}px;
          width: 150px;
          height: 300px;
          background: blue;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default RowOptionsMenu;

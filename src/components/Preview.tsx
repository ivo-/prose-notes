import { PREVIEW_CONTAINER_ID } from "../editor/constants";
import { getPreviewNode } from "../editor/preview";

export default function Preview() {
  const previewNode = getPreviewNode();

  return (
    <div id={PREVIEW_CONTAINER_ID} className="ProseMirror preview">
      <section
        dangerouslySetInnerHTML={{
          __html: previewNode?.outerHTML || "",
        }}
      ></section>
    </div>
  );
}

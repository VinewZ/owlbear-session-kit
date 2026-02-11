import OBR, { type ContextMenuContext } from "@owlbear-rodeo/sdk";
import { createFileRoute } from "@tanstack/react-router";
import {
  ATTACH_SHEET_CONTEXT_MENU_ID,
  RIGHT_SHEET_POPOVER_ID,
} from "@/lib/constants";
import * as Y from "yjs"

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  function handleOBKClick(context: ContextMenuContext) {
    if (context.items.length !== 1) {
      OBR.notification.show(
        "ERROR: select only one character to view sheet",
        "ERROR",
      );
      return;
    }
    OBR.popover.open({
      id: RIGHT_SHEET_POPOVER_ID,
      url: `/sheet/${context.items[0].id}`,
      height: 500,
      width: 600,
      disableClickAway: true,
      anchorOrigin: {
        horizontal: "RIGHT",
        vertical: "BOTTOM",
      },
    });
  }

  OBR.contextMenu.create({
    id: ATTACH_SHEET_CONTEXT_MENU_ID,
    icons: [
      {
        icon: "/icons/sheet.svg",
        label: "View Sheet",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
        },
      },
    ],
    onClick: handleOBKClick,
  });

  const ydoc = new Y.Doc()

  return (
    <div>
      <div>AVAILABLE: {String(OBR.isAvailable)}</div>
      <div>READY: {String(OBR.isReady)}</div>
    </div>
  );
}

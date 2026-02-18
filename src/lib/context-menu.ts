import OBR, { type ContextMenuContext } from "@owlbear-rodeo/sdk";
import {
	ATTACH_SHEET_CONTEXT_MENU_ID,
	DEFAULT_SHEET_POPOVER_SIZE,
	SHEET_POPVER_ID,
} from "./constants";

function handleContextMenuClick(context: ContextMenuContext) {
  console.log("Open Sheet")
	if (context.items.length !== 1) {
		OBR.notification.show(
			"ERROR: select only one character to view sheet",
			"ERROR",
		);
		return;
	}
	OBR.popover.open({
		id: SHEET_POPVER_ID,
		url: `/extensions/sheet/${context.items[0].id}`,
		height: DEFAULT_SHEET_POPOVER_SIZE.height,
		width: DEFAULT_SHEET_POPOVER_SIZE.width,
		disableClickAway: true,
		anchorOrigin: {
			horizontal: "RIGHT",
			vertical: "BOTTOM",
		},
	});
}

export function setupContextMenu() {
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
		onClick: handleContextMenuClick,
	});
}

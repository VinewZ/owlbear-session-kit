import OBR, { type ContextMenuContext } from "@owlbear-rodeo/sdk";
import { chunkedBroadcast } from "@/lib/obr/use-chunked-broadcast";
import {
	ATTACH_SHEET_CONTEXT_MENU_ID,
	DEFAULT_SHEET_POPOVER_SIZE,
	SHEET_POPOVER_ID,
	SYNC_UPDATE_CHANNEL,
} from "./constants";

export async function setupOBR() {
	await setupSheetContext();
	setupListeners();
}

function setupListeners() {
	const { listenMessage } = chunkedBroadcast;
	const unsubscribe = listenMessage({
		channel: SYNC_UPDATE_CHANNEL,
		onMessage: (e) => console.log(e),
	});

	return () => {
		if (unsubscribe) unsubscribe();
	};
}

async function setupSheetContext() {
	await OBR.contextMenu.create({
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

function handleContextMenuClick(context: ContextMenuContext) {
	if (context.items.length !== 1) {
		OBR.notification.show(
			"ERROR: select only one character to view sheet",
			"ERROR",
		);
		return;
	}

	OBR.popover.open({
		id: SHEET_POPOVER_ID,
		url: `/extensions/sheet/${context.items[0].id}`,
		height: DEFAULT_SHEET_POPOVER_SIZE.height,
		width: DEFAULT_SHEET_POPOVER_SIZE.width,
		// disableClickAway: true,
		anchorOrigin: {
			horizontal: "RIGHT",
			vertical: "BOTTOM",
		},
	});
}

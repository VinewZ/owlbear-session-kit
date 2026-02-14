import OBR, { type ContextMenuContext } from "@owlbear-rodeo/sdk";
import { createFileRoute } from "@tanstack/react-router";
import {
	ATTACH_SHEET_CONTEXT_MENU_ID,
	DEFAULT_SHEET_POPOVER_SIZE,
	SHEET_POPVER_ID,
} from "@/lib/constants";

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
			id: SHEET_POPVER_ID,
			url: `/sheet/${context.items[0].id}`,
			height: DEFAULT_SHEET_POPOVER_SIZE.height,
			width: DEFAULT_SHEET_POPOVER_SIZE.width,
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

	return (
		<div>
			<div>AVAILABLE: {String(OBR.isAvailable)}</div>
			<div>READY: {String(OBR.isReady)}</div>
		</div>
	);
}

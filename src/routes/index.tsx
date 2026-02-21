import OBR, { type ContextMenuContext } from "@owlbear-rodeo/sdk";
import { createFileRoute } from "@tanstack/react-router";

import { useEffect } from "react";
import { DiceTray } from "@/components/dice-tray";
import {
	ATTACH_SHEET_CONTEXT_MENU_ID,
	DEFAULT_SHEET_POPOVER_SIZE,
	SHEET_POPOVER_ID,
} from "@/lib/constants";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	useEffect(() => {
		if (!OBR.isAvailable) return;

		OBR.onReady(async () => {
			await OBR.contextMenu.remove(ATTACH_SHEET_CONTEXT_MENU_ID);
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
		});
	}, []);

	return <DiceTray />;
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

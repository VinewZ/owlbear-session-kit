import { createFileRoute } from "@tanstack/react-router";
import { DiceTray } from "@/components/dice-tray";

export const Route = createFileRoute("/extensions/dice")({
	component: DiceTray,
});

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/extensions/dice/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>dice ext</div>;
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OBRProvider } from "@/providers/obr";

export const Route = createFileRoute("/extensions")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<OBRProvider>
			<Outlet />
		</OBRProvider>
	);
}

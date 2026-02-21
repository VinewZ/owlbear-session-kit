import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { OBRGate } from "@/components/obr-gate";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function RootComponent() {
	return (
		<OBRGate>
			<Outlet />
			<TanStackDevtools
				config={{
					position: "top-right",
					hideUntilHover: true,
					defaultOpen: false,
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</OBRGate>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});

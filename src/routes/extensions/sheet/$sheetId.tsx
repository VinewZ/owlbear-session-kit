import { createFileRoute } from "@tanstack/react-router";
import { useDB } from "@/lib/idb/hooks/use-db";

export const Route = createFileRoute("/extensions/sheet/$sheetId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sheetId } = Route.useParams();

	const [value, updateValue] = useDB("SHEETS", sheetId, "");
	return (
		<div className="border border-red-500">
			<input
				className="border border-blue-500"
				value={value}
				onChange={(e) => updateValue(e.currentTarget.value)}
			/>
			<div>{value}</div>
		</div>
	);
}

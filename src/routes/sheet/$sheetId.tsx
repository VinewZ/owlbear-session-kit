import { Box, Skeleton } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/footer";
import { Upload } from "@/components/upload";
import { useCharacterSheet } from "@/hooks/use-character-sheet";

import { CharacterSheet } from "./-components/character-sheet";

export const Route = createFileRoute("/sheet/$sheetId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sheetId } = Route.useParams();
	const {
		sheet,
		loading,
		save,
		update,
		remove,
		refresh,
		attachSheet,
		deletePermanently,
	} = useCharacterSheet(sheetId);

	return (
		<Box className="w-full h-full">
			{loading ? (
				<Box className="flex flex-col gap-4 p-4">
					<Skeleton variant="rectangular" height={80} className="rounded-lg" />
					<Box className="grid grid-cols-3 gap-4 flex-1">
						<Skeleton variant="rectangular" className="rounded-lg" />
						<Skeleton variant="rectangular" className="rounded-lg" />
						<Skeleton variant="rectangular" className="rounded-lg" />
					</Box>
				</Box>
			) : sheet ? (
				<CharacterSheet sheet={sheet} sheetId={sheetId} update={update} />
			) : (
				<Upload sheetId={sheetId} onUpload={save} onAttachSheet={attachSheet} />
			)}
			<Footer
				onDelete={deletePermanently}
				onUnlink={remove}
				onRefresh={refresh}
			/>
		</Box>
	);
}

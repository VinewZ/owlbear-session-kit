import {
	Box,
	Card,
	CardContent,
	CardMedia,
	Container,
	Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: DocsPage,
});

const extensions = [
	{
		id: "dice",
		name: "Dice Tray",
		description:
			"3D physics-based dice roller with realistic physics and multiple dice styles. Click highlighted dice notation in your character sheet (e.g., 2d6+3) to roll dice. Configure dice style, bonus, and advantage/disadvantage in the sidebar.",
		icon: "/icons/owl-icon.svg",
	},
	{
		id: "sheet",
		name: "Character Sheet",
		description:
			"Digital character sheet for D&D 5e. Upload a PDF or JSON to import your character. View and edit abilities, skills, combat stats, spells, and equipment. Right-click a character token and select 'View Sheet' to open.",
		icon: "/icons/sheet.svg",
	},
];

function DocsPage() {
	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Typography variant="h3" component="h1" gutterBottom>
				Session Kit
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				A collection of extensions for Owlbear Rodeo to enhance your tabletop
				gaming experience.
			</Typography>

			<Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
				Extensions
			</Typography>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				{extensions.map((ext) => (
					<Card key={ext.id} sx={{ display: "flex" }}>
						<CardMedia
							component="img"
							sx={{ width: 80, height: 80, p: 2, objectFit: "contain" }}
							image={ext.icon}
							alt={ext.name}
						/>
						<CardContent>
							<Typography variant="h6" component="h2">
								{ext.name}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ext.description}
							</Typography>
						</CardContent>
					</Card>
				))}
			</Box>

			<Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
				Getting Started
			</Typography>
			<Typography variant="body2" color="text.secondary">
				Open this extension in Owlbear Rodeo by clicking the extension icon in
				the top-left corner of a room. The dice tray will open, and you can
				access the character sheet by right-clicking on any character token.
			</Typography>
		</Container>
	);
}

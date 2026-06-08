import NoHistoryIcon from "@mui/icons-material/ManageSearchRounded";
import HistoryIcon from "@mui/icons-material/SavedSearchRounded";
import HiddenIcon from "@mui/icons-material/VisibilityOffRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Dispatch, SetStateAction } from "react";
import SimpleBar from "simplebar-react";
import { DicePreview } from "../previews/DicePreview";
import {
	type RollHistoryEntry,
	useRollHistoryStore,
} from "./roll-history-store";

type DiceHistoryPropsT = {
	showHistory: boolean;
	setShowHistory: Dispatch<SetStateAction<boolean>>;
};

export function DiceHistory({
	showHistory,
	setShowHistory,
}: DiceHistoryPropsT) {
	return (
		<IconButton
			color={showHistory ? "primary" : "default"}
			onClick={() => {
				setShowHistory((prev) => !prev);
			}}
		>
			<HistoryIcon />
		</IconButton>
	);
}

export function DiceHistoryView() {
	const entries = useRollHistoryStore((state) => state.entries);
	const theme = useTheme();

	return (
		<Box
			component="div"
			sx={{
				width: "100dvw",
				height: "100dvh",
				bgcolor: theme.palette.mode === "dark" ? "#22263a" : "#f1f3f9",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				px={2}
				py={1}
				sx={{ flexShrink: 0 }}
			>
				<Typography variant="subtitle2" fontWeight={600}>
					Roll History
				</Typography>
				<ClearHistoryButton />
			</Stack>
			<Divider />
			{entries.length === 0 ? (
				<EmptyHistory />
			) : (
				<SimpleBar style={{ flex: 1, overflow: "hidden" }}>
					<Stack gap={0} px={1} py={1}>
						{[...entries].reverse().map((entry) => (
							<RollHistoryItem key={entry.id} entry={entry} />
						))}
					</Stack>
				</SimpleBar>
			)}
		</Box>
	);
}

function ClearHistoryButton() {
	const entries = useRollHistoryStore((state) => state.entries);
	const clearHistory = useRollHistoryStore((state) => state.clearHistory);
	if (entries.length === 0) return null;
	return (
		<Chip
			label="Clear"
			size="small"
			variant="outlined"
			onClick={clearHistory}
		/>
	);
}

function EmptyHistory() {
	const theme = useTheme();
	return (
		<Stack
			sx={{
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				gap: 0.5,
				height: "100%",
				pb: 4,
			}}
		>
			<Box
				component="div"
				sx={{
					fontSize: "2rem",
					color:
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.46)"
							: "rgba(0, 0, 0, 0.46)",
					display: "flex",
					p: 1,
				}}
			>
				<NoHistoryIcon />
			</Box>
			<Typography variant="h6">No History</Typography>
			<Typography variant="caption" textAlign="center">
				Roll dice to add to the roll history.
			</Typography>
		</Stack>
	);
}

function RollHistoryItem({ entry }: { entry: RollHistoryEntry }) {
	const theme = useTheme();
	const timeStr = formatRelativeTime(entry.timestamp);

	return (
		<Stack
			direction="row"
			alignItems="center"
			gap={1}
			px={1.5}
			py={1}
			sx={{
				borderRadius: 1,
				"&:hover": {
					bgcolor:
						theme.palette.mode === "dark"
							? "rgba(255,255,255,0.05)"
							: "rgba(0,0,0,0.04)",
				},
			}}
		>
			<Avatar
				sx={{
					bgcolor: entry.player.color,
					width: 28,
					height: 28,
					fontSize: "0.8rem",
				}}
			>
				{entry.player.name[0]}
			</Avatar>
			<Stack flex={1} minWidth={0}>
				<Stack direction="row" alignItems="center" gap={0.5}>
					<Typography
						variant="body2"
						fontWeight={600}
						noWrap
						sx={{ lineHeight: 1.2 }}
					>
						{entry.player.name}
					</Typography>
					<Typography
						variant="caption"
						sx={{
							color:
								theme.palette.mode === "dark"
									? "rgba(255,255,255,0.46)"
									: "rgba(0,0,0,0.46)",
							flexShrink: 0,
						}}
					>
						{timeStr}
					</Typography>
				</Stack>
				{entry.diceRoll.hidden ? (
					<Stack direction="row" alignItems="center" gap={0.5}>
						<HiddenIcon sx={{ fontSize: 16, opacity: 0.6 }} />
						<Typography variant="caption" sx={{ opacity: 0.6 }}>
							Hidden Roll
						</Typography>
					</Stack>
				) : (
					<Stack direction="row" alignItems="center" gap={0.25} flexWrap="wrap">
						{entry.dieResults.map((die) => (
							<Stack
								key={`${die.type}-${die.value}`}
								direction="row"
								alignItems="center"
								gap={0.15}
							>
								<DicePreview
									diceStyle={die.style}
									diceType={die.type}
									size="small"
								/>
								<Typography variant="caption" fontWeight={500}>
									{die.value}
								</Typography>
							</Stack>
						))}
						{entry.diceRoll.bonus !== undefined &&
							entry.diceRoll.bonus !== 0 && (
								<Typography variant="caption" fontWeight={500}>
									{entry.diceRoll.bonus > 0 ? "+" : ""}
									{entry.diceRoll.bonus}
								</Typography>
							)}
					</Stack>
				)}
			</Stack>
			{!entry.diceRoll.hidden && entry.finalValue !== null && (
				<Typography
					variant="h6"
					fontWeight={700}
					sx={{ flexShrink: 0, lineHeight: 1 }}
				>
					{entry.finalValue}
				</Typography>
			)}
		</Stack>
	);
}

function formatRelativeTime(timestamp: number): string {
	const diffMs = Date.now() - timestamp;
	const diffSec = Math.floor(diffMs / 1000);
	if (diffSec < 60) return "just now";
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h`;
	const diffDay = Math.floor(diffHr / 24);
	return `${diffDay}d`;
}

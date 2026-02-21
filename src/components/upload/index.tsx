import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Collapse,
	Paper,
	Typography,
} from "@mui/material";
import { CheckCircle2, FileText, Upload as UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { use5eSheetParser } from "@/hooks/pdf/use-5e-sheet-parser";
import { useToken } from "@/lib/obr/hooks/use-token";
import { logger } from "@/lib/utils";
import type { CharacterT } from "@/types";

type UploadState = "idle" | "dragover" | "parsing" | "error" | "success";

interface UploadProps {
	sheetId: string;
	onUpload: (character: CharacterT) => Promise<void>;
}

export function Upload({ sheetId, onUpload }: UploadProps) {
	const { t } = useTranslation();
	const { parsePdf } = use5eSheetParser();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { token } = useToken(sheetId);

	const [state, setState] = useState<UploadState>("idle");
	const [error, setError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileSelect = async (file: File) => {
		if (file.type !== "application/pdf") {
			setError(t("upload.errors.invalidType"));
			setState("error");
			return;
		}

		setSelectedFile(file);
		setError(null);
		setState("parsing");

		try {
			const character = await parsePdf(file);
			if (!character) {
				logger.error("Parsed PDF is empty");
				setError(t("upload.errors.empty"));
				setState("error");
				return;
			}

			setState("success");

			setTimeout(async () => {
				await onUpload(character);
			}, 800);
		} catch (err) {
			logger.error("Unable to parse PDF:", err);
			setError(t("upload.errors.parseFailed"));
			setState("error");
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
		event.target.value = "";
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
		setState("dragover");
	};

	const handleDragLeave = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (state === "dragover") {
			setState("idle");
		}
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();

		const file = event.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		} else {
			setState("idle");
		}
	};

	const handleDismissError = () => {
		setError(null);
		setState("idle");
		setSelectedFile(null);
	};

	const isInteractive = state === "idle" || state === "dragover";
	const isProcessing = state === "parsing" || state === "success";

	return (
		<Box className="flex flex-col items-center justify-center h-full p-8 gap-6">
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,application/pdf"
				onChange={handleFileChange}
				className="hidden"
			/>

			<Paper
				elevation={0}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={isInteractive ? handleButtonClick : undefined}
				className={`
					w-full max-w-md p-8 cursor-pointer transition-all duration-200
					border-2 border-dashed rounded-2xl text-center
					${state === "dragover" ? "border-primary bg-primary/10 scale-[1.02]" : ""}
					${state === "idle" ? "border-foreground/20 hover:border-primary/50 hover:bg-secondary" : ""}
					${isProcessing ? "border-primary/50 bg-secondary cursor-default" : ""}
					${state === "error" ? "border-error/50 bg-error/5" : ""}
					${state === "success" ? "border-success bg-success/10" : ""}
				`}
			>
				{state === "success" ? (
					<Box className="flex flex-col items-center gap-4">
						<CheckCircle2
							size={64}
							className="text-success animate-[scale-in_0.3s_ease-out]"
						/>
						<Typography variant="h6" className="text-success font-semibold">
							{t("upload.success")}
						</Typography>
					</Box>
				) : isProcessing ? (
					<Box className="flex flex-col items-center gap-4">
						<CircularProgress size={48} />
						<Typography variant="body1" className="text-foreground/70">
							{t("upload.parsing")}
						</Typography>
						{selectedFile && (
							<Typography variant="caption" className="text-foreground/50">
								{selectedFile.name}
							</Typography>
						)}
					</Box>
				) : (
					<Box className="flex flex-col items-center gap-4">
						<Box
							className={`
								w-16 h-16 rounded-full flex items-center justify-center
								${state === "dragover" ? "bg-primary/20" : "bg-secondary"}
							`}
						>
							<UploadIcon
								size={32}
								className={
									state === "dragover" ? "text-primary" : "text-foreground/40"
								}
							/>
						</Box>

						<Box>
							<Typography variant="h6" className="font-medium">
								{t("upload.dragDrop")}
							</Typography>
							<Typography variant="body2" className="text-foreground/60 mt-1">
								{t("upload.orClick")}
							</Typography>
						</Box>

						{selectedFile && state === "error" && (
							<Paper
								variant="outlined"
								className="flex items-center gap-2 px-3 py-2 mt-2"
							>
								<FileText size={20} className="text-foreground/60" />
								<Typography
									variant="body2"
									className="text-foreground/70 truncate max-w-[200px]"
								>
									{selectedFile.name}
								</Typography>
							</Paper>
						)}
					</Box>
				)}
			</Paper>

			<Collapse in={!!error}>
				<Alert
					severity="error"
					onClose={handleDismissError}
					className="max-w-md"
				>
					{error}
				</Alert>
			</Collapse>

			{token && (
				<Box className="flex items-center gap-3">
					<Box className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 bg-secondary flex items-center justify-center shrink-0">
						{token.image?.url ? (
							<img
								src={token.image.url}
								alt={token.name || "Token"}
								className="w-full h-full object-cover"
							/>
						) : (
							<Typography variant="h6" className="text-primary font-bold">
								{token.name?.[0] ?? "?"}
							</Typography>
						)}
					</Box>
					<Box>
						<Typography variant="caption" className="text-foreground/60 block">
							{t("upload.uploadingFor")}
						</Typography>
						<Typography variant="body1" className="font-medium">
							{token.name || t("upload.unknownToken")}
						</Typography>
					</Box>
				</Box>
			)}

			<Box className="flex flex-col items-center gap-2">
				<Button
					variant="contained"
					onClick={handleButtonClick}
					disabled={isProcessing}
					startIcon={
						isProcessing ? (
							<CircularProgress size={20} color="inherit" />
						) : (
							<UploadIcon size={20} />
						)
					}
					className="px-6"
				>
					{isProcessing ? t("upload.parsing") : t("upload.browseFiles")}
				</Button>

				<Typography
					variant="caption"
					className="text-foreground/40 text-center"
				>
					{t("upload.supportedFormats")}
				</Typography>
			</Box>
		</Box>
	);
}

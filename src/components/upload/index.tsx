import { Button } from "@mui/material";
import { Loader2, Upload as UploadIcon } from "lucide-react";
import { useRef } from "react";
import type * as Y from "yjs";
import { use5eSheetParser } from "@/hooks/pdf/use-5e-sheet-parser";
import { useToken } from "@/lib/obr/hooks/use-token";
import { logger } from "@/lib/utils";
import { replaceSheetFromJSON } from "@/lib/yjs/helpers/replace-sheet-from-json";

interface UploadProps {
	sheetId: string;
	ydoc: Y.Doc;
}

export function Upload({ sheetId, ydoc }: UploadProps) {
	const { isLoading, parsePdf } = use5eSheetParser();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { token } = useToken(sheetId);

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;
		event.target.value = "";

		if (file.type !== "application/pdf") {
			alert("Please select a PDF file");
			return;
		}

		try {
			const character = await parsePdf(file);
			if (!character) return logger.error("Parsed PDF is empty");
			if (!character) {
				logger.error("Parsed PDF is empty");
				return;
			}

			replaceSheetFromJSON(ydoc, sheetId, character);
		} catch (err) {
			logger.error("Unable to parse PDF:", err);
			alert("Failed to parse PDF. Please try again.");
		}
	};

	return (
		<div className="inline-block">
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,application/pdf"
				onChange={handleFileChange}
				className="hidden"
			/>

			<Button
				type="button"
				onClick={handleButtonClick}
				disabled={isLoading}
				variant="contained"
				startIcon={isLoading ? <Loader2 /> : <UploadIcon />}
			>
				{isLoading ? "Parsing..." : `Upload PDF for Sheet ${token?.name}`}
			</Button>
		</div>
	);
}

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useState } from "react";
import { logger } from "@/lib/utils";
import type { CharacterT } from "@/types";
import { parsePdfForm } from "./parser";

GlobalWorkerOptions.workerSrc = pdfWorker;

export function use5eSheetParser() {
	const [character, setCharacter] = useState<CharacterT | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const parsePdf = async (file: File): Promise<CharacterT | null> => {
		if (file.type !== "application/pdf") {
			setError("Please upload a PDF file.");
			return null;
		}

		setIsLoading(true);
		setError(null);
		setCharacter(null); // Reset previous character state

		try {
			const arrbuf = await file.arrayBuffer();
			const loadingTask = getDocument(arrbuf);
			const pdf = await loadingTask.promise;
			const form = await pdf.getFieldObjects?.();

			if (!form) {
				setError("No character sheet form fields found in the PDF.");
				setIsLoading(false); // Stop loading if no form
				return null;
			}

			const parsedChar = parsePdfForm(form);
			setCharacter(parsedChar);
			return parsedChar;
		} catch (e) {
			logger.error("Error parsing PDF:", e);
			setError(
				e instanceof Error
					? e.message
					: "An unknown error occurred while parsing the PDF.",
			);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	return { character, isLoading, error, parsePdf };
}

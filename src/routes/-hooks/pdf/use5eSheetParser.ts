import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useState } from "react";
import { type CharacterT, parsePdfForm } from "./parser";

GlobalWorkerOptions.workerSrc = pdfWorker;

export function use5eSheetParser() {
  const [character, setCharacter] = useState<CharacterT | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsePdf = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
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
        return;
      }

      const parsedChar = parsePdfForm(form);
      setCharacter(parsedChar);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "An unknown error occurred while parsing the PDF.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { character, isLoading, error, parsePdf };
}

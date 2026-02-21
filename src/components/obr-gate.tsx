import OBR from "@owlbear-rodeo/sdk";
import { createContext, useContext, useEffect, useState } from "react";
import { useGlobalSheetSync } from "@/hooks/use-global-sheet-sync";

type OBRContextValue = {
	isReady: boolean;
};

const OBRContext = createContext<OBRContextValue>({ isReady: false });

export function useOBR() {
	return useContext(OBRContext);
}

type OBRGateProps = {
	children: React.ReactNode;
};

export function OBRGate({ children }: OBRGateProps) {
	const [isReady, setIsReady] = useState(false);

	useGlobalSheetSync();

	useEffect(() => {
		if (!OBR.isAvailable) {
			setIsReady(true);
			return;
		}

		OBR.onReady(() => {
			setIsReady(true);
		});
	}, []);

	if (!isReady) {
		return null;
	}

	return (
		<OBRContext.Provider value={{ isReady }}>{children}</OBRContext.Provider>
	);
}

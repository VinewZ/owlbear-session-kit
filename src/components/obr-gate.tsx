import OBR from "@owlbear-rodeo/sdk";
import { createContext, useContext, useEffect, useState } from "react";

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

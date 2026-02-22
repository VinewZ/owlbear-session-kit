import OBR from "@owlbear-rodeo/sdk";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { setupOBR } from "@/lib/obr/setup-obr";

type OBRContextValue = {
	isReady: boolean;
};

const OBRContext = createContext<OBRContextValue>({ isReady: false });

export function useOBR() {
	return useContext(OBRContext);
}

type OBRProviderProps = {
	children: React.ReactNode;
};

export function OBRProvider({ children }: OBRProviderProps) {
	const [isReady, setIsReady] = useState(false);
	const initializedRef = useRef(false);

	useEffect(() => {
		const init = async () => {
			if (initializedRef.current) return;
			initializedRef.current = true;

			try {
				await setupOBR();
			} catch (err) {
				console.error("setupOBR failed", err);
			}

			setIsReady(true);
		};

		if (!OBR.isAvailable) return;

		if (OBR.isReady) {
			init();
		} else {
			OBR.onReady(init);
		}
	}, []);

	if (!isReady) return null;

	return (
		<OBRContext.Provider value={{ isReady }}>{children}</OBRContext.Provider>
	);
}

import OBR from "@owlbear-rodeo/sdk";

let initPromise: Promise<void> | null = null;

export function initOBR(): Promise<void> {
	if (initPromise) return initPromise;

	if (!OBR.isAvailable) {
		return Promise.resolve();
	}

	initPromise = new Promise((resolve) => {
		OBR.onReady(() => {
			resolve();
		});
	});

	return initPromise;
}

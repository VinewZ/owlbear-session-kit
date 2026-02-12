import { useSyncExternalStore } from "react";
import type * as Y from "yjs";

export function useYMap<T extends Y.AbstractType<unknown>>(ymap: T): T {
	return useSyncExternalStore(
		(onStoreChange) => {
			ymap.observe(onStoreChange);
			return () => ymap.unobserve(onStoreChange);
		},
		() => ymap,
		() => ymap,
	);
}

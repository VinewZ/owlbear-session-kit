
import { useCallback, useEffect, useState } from "react";
import type * as Y from "yjs";

export function useYState<T>(
  ymap: Y.Map<any>,
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    return ymap.get(key) ?? defaultValue;
  });

  // Pull remote updates → React
  useEffect(() => {
    const handler = () => {
      const next = ymap.get(key) ?? defaultValue;
      setValue(next);
    };

    ymap.observe(handler);
    return () => ymap.unobserve(handler);
  }, [ymap, key, defaultValue]);

  // Push local updates → Yjs
  const set = useCallback(
    (next: T) => {
      setValue(next);        // immediate UI update
      ymap.set(key, next);   // sync to Yjs
    },
    [ymap, key]
  );

  return [value, set];
}

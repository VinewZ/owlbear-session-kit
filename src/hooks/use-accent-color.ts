import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { ACCENT_COLOR_KEY } from "@/lib/constants";

export function useAccentColor() {
  const [accentColor, setAccentColor] = useState<string>("#BB99FF");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function init() {
      const metadata = await OBR.player.getMetadata();
      const storedColor = metadata[ACCENT_COLOR_KEY] as string | undefined;

      if (storedColor) {
        setAccentColor(storedColor);
      } else {
        const playerColor = await OBR.player.getColor();
        setAccentColor(playerColor);
      }

      setLoading(false);

      unsubscribe = OBR.player.onChange((player) => {
        const stored = player.metadata[ACCENT_COLOR_KEY] as string | undefined;
        if (stored) {
          setAccentColor(stored);
        } else {
          setAccentColor(player.color);
        }
      });
    }

    OBR.onReady(() => {
      init();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  async function saveAccentColor(color: string) {
    await OBR.player.setMetadata({ [ACCENT_COLOR_KEY]: color });
    setAccentColor(color);
  }

  async function clearAccentColor() {
    await OBR.player.setMetadata({ [ACCENT_COLOR_KEY]: undefined });
    const playerColor = await OBR.player.getColor();
    setAccentColor(playerColor);
  }

  return { accentColor, loading, saveAccentColor, clearAccentColor };
}

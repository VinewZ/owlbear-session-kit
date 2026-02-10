import OBR, { type Image, isImage } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { logger } from "@/lib/utils";

export function useToken(id: string) {
  const [token, setToken] = useState<Image | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchToken = async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await OBR.scene.items.getItems(isImage);
        const item = items?.find((item) => item.id === id);

        if (mounted) {
          if (item) {
            setToken(item);
          } else {
            logger.warn("No item found with ID:", id);
            setError(`No token found with ID: ${id}`);
          }
        }
      } catch (error) {
        logger.error("Error fetching item:", error);
        if (mounted) {
          setError(error instanceof Error ? error.message : "Unknown error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchToken();
    } else {
      setLoading(false);
      setToken(null);
    }

    return () => {
      mounted = false;
    };
  }, [id]); // Re-run when id changes

  return { token, loading, error };
}

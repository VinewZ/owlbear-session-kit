import { Skeleton } from "@mui/material";

type CharacterPortraitT = {
  isLoading: boolean;
  url: string;
};
export function CharacterPortrait({ isLoading, url }: CharacterPortraitT) {
  if (isLoading) {
    return <Skeleton width={80} height={80} variant="circular" />;
  }

  return <img src={url} alt="Character Portrait" width={80} height={80} />;
}

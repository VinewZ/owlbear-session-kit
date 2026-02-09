import type { CharacterT } from "@/hooks/pdf/parser";

type InteractiveSheetPropsT = {
  character: CharacterT
}

export function InteractiveSheet({character}: InteractiveSheetPropsT) {
  return (
    <div>
      <div>Interactive</div>
      <div>Sheet</div>
    </div>
  );
}

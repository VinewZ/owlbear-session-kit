// One sheet has a "character" field
export type SheetMap = {
  character: Y.Map<CharacterT>;
};

// Map of sheets: sheetId -> sheet
export type SheetsMap = Y.Map<Y.Map<SheetMap>>;

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };


export type YjsMessage =
  | { type: "sync-request" }
  | { type: "sync-response"; update: number[] }
  | { type: "update"; update: number[] };

# Roadmap — DB-less CRDT Sync over OBR Broadcast

## Phase 0 — Core Design Decisions (Lock These First)

### 0.1 Data Ownership Model

*   No database
*   No GM authority
*   No stable player IDs
*   No room metadata storage
*   No locks
*   Last-write-wins semantics via CRDT

#### Source of truth:

*   CRDT document replicated across connected peers
*   Persistence is local only (IndexedDB)

### 0.2 Data Model Choice

Use Yjs with:

*   `Y.Map` for character root
*   `Y.Array` for lists (spells, equipment, features)
*   `Y.Text` only if needed (optional)

#### Example:

```typescript
character: Y.Map({
  meta: Y.Map(),
  spells: Y.Array<Y.Map>(),
  equipment: Y.Array<Y.Map>(),
  features: Y.Array<string>(),
})
```

Do NOT store the whole JSON as a single blob — let CRDT handle fields.

## Phase 1 — Local CRDT Setup

### 1.1 Initialize Yjs Document

*   Create one `Y.Doc` per character sheet
*   Assign random `clientID` (Yjs already does this)

### 1.2 Bind CRDT to UI

*   Convert form fields ↔ Yjs maps
*   UI edits directly mutate Yjs doc
*   No manual conflict resolution

### 1.3 Local Persistence (Optional but Recommended)

*   Use `y-indexeddb`
*   Automatically persists CRDT state per browser

#### This enables:

*   Session reloads
*   Offline edits
*   Faster resyncs

## Phase 2 — OBR Broadcast Transport Layer

### 2.1 Define Broadcast Channels

| Channel           | Purpose                    |
| :---------------- | :------------------------- |
| `sheet:announce`  | Presence & discovery       |
| `sheet:sync:sv`   | State vector exchange      |
| `sheet:sync:update` | CRDT update chunks         |

### 2.2 Message Schema

All messages are JSON-serializable and ≤ 16 KB.

```typescript
type BroadcastMessage =
  | { type: "hello"; docId: string; clientId: string }
  | { type: "state-vector"; docId: string; sv: any } // 'sv' is a Yjs state vector
  | { type: "update"; docId: string; updateId: string; index: number; total: number; data: string } // 'data' is base64 encoded update chunk
```

### 2.3 Chunking Strategy

Because Yjs updates are binary:

*   Encode update as base64
*   Split into chunks ≤ ~14 KB
*   Send sequentially

#### Each chunk contains:

*   `updateId`
*   `chunkIndex`
*   `totalChunks`

## Phase 3 — Sync Protocol (Critical)

### 3.1 Peer Discovery

On sheet open:

```typescript
broadcast.sendMessage("sheet:announce", {
  type: "hello",
  docId,
  clientId
})
```

### 3.2 State Vector Exchange

On receiving `hello`:

*   Respond with local state vector
    *   `encodeStateVector(doc)`

#### Send:

```typescript
{ type: "state-vector", docId, sv }
```

### 3.3 Missing Update Calculation

When receiving a state vector:

```typescript
const update = encodeStateAsUpdate(doc, remoteSV)
```

If update size > 0:

*   Chunk it
*   Broadcast chunks

### 3.4 Update Reassembly

Receiver:

*   Collect chunks by `updateId`
*   Reassemble in correct order
*   Apply once complete:
    *   `Y.applyUpdate(doc, update)`

#### Yjs guarantees:

*   Idempotency
*   Order independence
*   Convergence

## Phase 4 — Permission Model (Non-Authoritative)

### 4.1 Permission Philosophy

*   Permissions are UI-level only
*   CRDT does not enforce permissions
*   Anyone with edit access can mutate

#### This matches your statement:

“If players are editing, they should be allowed.”

### 4.2 Enforcement Strategy

*   GM grants edit access via UI
*   Non-editors get read-only bindings
*   CRDT still syncs state for everyone
*   No locks.
*   No validation.
*   No rollback.

## Phase 5 — Handling Session Boundaries

### 5.1 Late Joiner (No Local Data)

#### Flow:

*   New player opens sheet
*   Broadcasts `hello`
*   Any existing peer responds with state vector
*   Full CRDT state syncs automatically
*   Only one peer needs the data.

### 5.2 GM Change

*   GM is irrelevant to data state
*   CRDT ownership is collective
*   Permissions UI updates dynamically
*   No rekeying.
*   No resalting.
*   No authority transfer.

### 5.3 Scene Change

*   CRDT lives outside entities
*   Scene reload does not affect sheet
*   Sheet remains intact across scenes

<h2>Phase 6 — Performance & Safety</h2>

<h3>6.1 Update Throttling</h3>

*   Batch rapid UI edits
*   Let Yjs accumulate changes
*   Broadcast updates at small intervals (e.g., 50–100 ms)

<h3>6.2 Memory Constraints</h3>

*   Avoid huge text fields
*   Normalize large arrays
*   Prefer structured CRDTs over blobs
*   Your ~10 KB parsed sheet is safe.

<h3>6.3 Failure Handling</h3>

*   Duplicate messages → ignored
*   Out-of-order chunks → buffered
*   Partial sync → retried via state vectors

<h2>Phase 7 — Optional Enhancements</h2>

<h3>7.1 Awareness (Cursors / Presence)</h3>

*   Use Yjs Awareness API:
    *   Who is editing
    *   Which section is focused
*   Purely cosmetic.

<h3>7.2 Snapshot Export</h3>

*   Allow manual export to JSON
*   Optional PDF regeneration
*   No backend required

<h2>Final Architecture Summary</h2>

```
Yjs CRDT
   ↓
OBR.broadcast (pub/sub)
   ↓
Connected peers
   ↓
Local IndexedDB persistence
```

*   No database
*   No backend
*   No authority
*   No locks
*   No stable IDs

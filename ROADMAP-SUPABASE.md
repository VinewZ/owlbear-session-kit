# VTT Character Sheet Extension – Implementation Roadmap

## Phase 0 — Constraints & Principles (Baseline)

*   No authentication
*   Anonymous players
*   GM can change
*   Scene entities are ephemeral
*   Entity IDs and metadata are unstable
*   Room metadata limited to 16 KB
*   External persistence allowed (Supabase)
*   Character sheets are large and frequently edited
*   Multiple viewers, single editor at a time

## Phase 1 — External Persistence (Supabase)

### 1. Supabase Project Setup

*   Create project
*   Enable anonymous access
*   Disable auth requirements for API usage

### 2. Database Schema

Table: `rooms`

Fields:
*   `room_id TEXT PRIMARY KEY`
*   `state JSONB NOT NULL`
*   `version INTEGER NOT NULL`
*   `updated_at TIMESTAMP`

### 3. JSON State Structure

*   `schemaVersion`
*   `characters` (map keyed by character UUID)

Each character contains:
*   `id`
*   `name`
*   `sheet` (parsed PDF JSON)
*   `lock` (optional)
*   `permissions` (advisory)

## Phase 2 — Room Identity & Access

### 4. Room Identifier Strategy

*   Use stable VTT room/world ID if available
*   Otherwise generate once and persist externally
*   Never tie room identity to GM or player

### 5. Supabase Access Pattern

*   One row per room
*   Full state fetched on join / scene load
*   Cached locally
*   Subscribed for updates (optional)

## Phase 3 — Character Identity Model

### 6. Character IDs

*   Generate UUID (`crypto.randomUUID()`)
*   Independent of:
    *   Player IDs
    *   Entity IDs
    *   Scene IDs

### 7. Character Lifecycle

*   Create character → insert into room state
*   Update character → patch inside state
*   Delete character → remove from state
*   Characters survive scene changes

## Phase 4 — Scene & Entity Binding (Runtime Only)

### 8. Ephemeral Entity Binding

On scene load:
*   Entities created with new IDs

Binding process:
*   Entity → Character UUID

Binding stored:
*   In memory
*   Or small scene metadata (optional)

### 9. Sheet Attach UI

*   Open entity
*   Fetch available characters
*   Select existing or create new
*   Bind entity to character for session

## Phase 5 — Local Editing Model

### 10. Local Draft System

Maintain:
*   `authoritativeState`
*   `draftState`
*   All edits apply to draft only
*   Dirty flag tracking

### 11. Commit Triggers

*   On blur
*   Debounced (500–1500 ms)
*   Explicit save
*   GM confirmation (optional)

## Phase 6 — Update & Sync Strategy

### 12. Write Strategy

*   No per-keystroke writes
*   Batch updates
*   One character update per commit

### 13. Supabase Update Pattern

*   Optimistic locking using `version`
*   Reject on mismatch
*   Never auto-merge

### 14. Read Strategy

*   Subscribe or poll room state
*   Update local cache on changes
*   Never overwrite active drafts silently

## Phase 7 — Concurrent Editing Control

### 15. Advisory Edit Lock

Stored per character:
*   `sessionId`
*   `timestamp`
*   Session ID generated per client load

### 16. Lock Acquisition

*   Attempt lock on edit open
*   Use optimistic update
*   If lock exists → read-only mode

### 17. Lock Expiration

*   Time-based expiry (e.g., 2 minutes)
*   GM override capability
*   No background jobs

## Phase 8 — Conflict Handling

### 18. Commit-Time Validation

Check:
*   Lock ownership
*   Version match

On failure:
*   Reject commit
*   Reload authoritative state
*   Notify user

### 19. UX for Conflicts

*   Clear error messages
*   Visual lock indicators
*   Read-only fallback

## Phase 9 — Permissions Model (No Auth)

### 20. Authority Rules

GM permissions determined by VTT
GM can:
*   Edit all sheets
*   Override locks

Non-GM:
*   Edit only bound characters
*   Or read-only

### 21. Advisory Enforcement

*   Enforced client-side only
*   Supabase remains dumb storage

## Phase 10 — Performance & Safety

### 22. Payload Discipline

*   JSON only
*   No binary data
*   No base64 assets

### 23. Size Monitoring

*   Keep room state under ~200 KB
*   Split to per-character rows if exceeded

### 24. Failure Modes

*   Room ID leakage → acceptable risk
*   Concurrent edit → safe rejection
*   Client disconnect → lock expires

## Phase 11 — UX Polish (Optional but Recommended)

### 25. Visual Indicators

*   Editing status
*   Lock ownership
*   Read-only mode

### 26. Recovery Flows

*   Rebind entities after scene change
*   Reopen sheet after conflict
*   Manual refresh

## Final Architecture Summary

```
Supabase (Authoritative)
 └─ Room
     └─ Characters (UUID)
         └─ Sheet JSON

VTT (Ephemeral)
 └─ Scenes
     └─ Entities
         └─ Runtime binding → Character UUID
```

## Completion Criteria

*   No data loss on scene change
*   No silent overwrites
*   No reliance on player IDs
*   No reliance on entity IDs
*   Works with anonymous players
*   Scales within Supabase free tier

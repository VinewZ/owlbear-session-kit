# Migration Plan: IndexedDB to Supabase Realtime

This document outlines the complete migration from IndexedDB with P2P broadcast synchronization to Supabase Postgres with Realtime synchronization.

## Overview

- **Current State**: IndexedDB for local storage + OBR broadcast for P2P sync
- **Target State**: Supabase Postgres for cloud storage + Supabase Realtime for automatic sync
- **Access Model**: All users have full access to all sheets (no authentication/authorization needed)

---

## Prerequisites

### 1. Existing Database Schema (Already Created)

```sql
create table public.sheets (
    id text not null,
    data jsonb not null,
    last_modified bigint not null,
    last_synced bigint null,
    constraint sheets_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_sheets_last_modified on public.sheets using btree (last_modified desc) TABLESPACE pg_default;
```

**Note:** The `version` field was removed from the migration plan - the schema only tracks `last_modified` for synchronization.

### 2. Supabase Configuration (Already Done)

File: `/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase
```

**Environment Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Your publishable key (new format: `sb_publishable_xxx`)

### 3. Enable Realtime on the Sheets Table

In your Supabase Dashboard:
1. Go to **Database → Tables**
2. Click on the `sheets` table
3. Navigate to **Realtime** tab
4. Enable the following events:
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE

### 4. Disable Row Level Security (RLS)

Since all users have full access, disable RLS entirely:

```sql
ALTER TABLE public.sheets DISABLE ROW LEVEL SECURITY;
```

---

## Migration Phases

### Phase 1: Create Supabase Storage Service

**File**: `/src/lib/storage/supabase.ts`

```typescript
import supabase from "@/lib/supabase";
import type { CharacterT } from "@/types";
import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js';

export interface SheetRecord {
  id: string;
  data: CharacterT;
  last_modified: number;
}

// CRUD Operations
export async function getSheet(id: string): Promise<SheetRecord | null> {
  const { data, error } = await supabase
    .from("sheets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data;
}

export async function saveSheet(id: string, data: CharacterT): Promise<void> {
  const { error } = await supabase.from("sheets").upsert(
    {
      id,
      data,
      last_modified: Date.now(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

export async function deleteSheet(id: string): Promise<void> {
  const { error } = await supabase.from("sheets").delete().eq("id", id);

  if (error) throw error;
}

export async function getAllSheets(): Promise<SheetRecord[]> {
  const { data, error } = await supabase
    .from("sheets")
    .select("*")
    .order("last_modified", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Realtime subscription helper
export function subscribeToSheet(
  sheetId: string,
  callback: (payload: {
    eventType: string;
    new: SheetRecord | null;
    old: SheetRecord | null;
  }) => void
) {
  const channel = supabase.channel(`sheet-${sheetId}`);
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sheets',
      filter: `id=eq.${sheetId}`,
    },
    (payload: RealtimePostgresChangesPayload<SheetRecord>) => {
      if (payload.eventType === 'DELETE') {
        callback({
          eventType: payload.eventType,
          new: null,
          old: payload.old as SheetRecord,
        });
      } else {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.eventType === 'INSERT' ? null : (payload.old as SheetRecord | null),
        });
      }
    }
  );
  return channel.subscribe();
}

// Subscribe to all sheets (for list views)
export function subscribeToAllSheets(
  callback: (payload: {
    eventType: string;
    new: SheetRecord | null;
    old: SheetRecord | null;
  }) => void
) {
  const channel = supabase.channel('all-sheets');
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sheets',
    },
    (payload: RealtimePostgresChangesPayload<SheetRecord>) => {
      if (payload.eventType === 'DELETE') {
        callback({
          eventType: payload.eventType,
          new: null,
          old: payload.old as SheetRecord,
        });
      } else {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.eventType === 'INSERT' ? null : (payload.old as SheetRecord | null),
        });
      }
    }
  );
  return channel.subscribe();
}
```

---

### Phase 2: Refactor useCharacterSheet Hook

**File**: `/src/hooks/use-character-sheet.ts`

```typescript
import { useCallback, useEffect, useState } from "react";
import {
  deleteSheet,
  getSheet,
  saveSheet,
  subscribeToSheet,
} from "@/lib/storage/supabase";
import type { CharacterT } from "@/types";

export function useCharacterSheet(sheetId: string) {
  const [sheet, setSheet] = useState<CharacterT | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const record = await getSheet(sheetId);
        if (mounted) {
          setSheet(record?.data || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load sheet:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [sheetId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = subscribeToSheet(sheetId, (payload) => {
      if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
        if (payload.new) {
          setSheet(payload.new.data);
        }
      } else if (payload.eventType === "DELETE") {
        setSheet(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sheetId]);

  const save = useCallback(
    async (data: CharacterT) => {
      try {
        await saveSheet(sheetId, data);
      } catch (err) {
        console.error("Failed to save sheet:", err);
        throw err;
      }
    },
    [sheetId]
  );

  const update = useCallback(
    async (data: CharacterT) => {
      // Optimistic update for local UI responsiveness
      setSheet(data);
      try {
        await saveSheet(sheetId, data);
      } catch (err) {
        console.error("Failed to update sheet:", err);
        // Revert on error
        const record = await getSheet(sheetId);
        setSheet(record?.data || null);
      }
    },
    [sheetId]
  );

  const remove = useCallback(async () => {
    try {
      await deleteSheet(sheetId);
    } catch (err) {
      console.error("Failed to delete sheet:", err);
      throw err;
    }
  }, [sheetId]);

  return {
    sheet,
    loading,
    save,
    update,
    remove,
  };
}
```

**Key Changes:**
- Removed all P2P broadcast logic
- Added `subscribeToSheet` for automatic real-time updates
- Removed manual broadcast of updates
- Simplified `save` and `remove` functions
- Removed unused `isRemoteUpdate` ref
- `version` field handling removed (no longer in schema)

---

### Phase 3: Delete Obsolete Files

The following files are no longer needed and should be deleted:

#### Storage Layer
- `/src/lib/storage/indexeddb.ts` - Replaced by Supabase storage
- `/src/lib/storage/types.ts` - Types moved to supabase.ts

#### P2P Broadcast Infrastructure
- `/src/lib/obr/hooks/use-chunked-broadcast/index.ts`
- `/src/lib/obr/hooks/use-chunked-broadcast/chunker.ts`
- `/src/hooks/use-global-sheet-sync.ts`

#### Type Definitions
- `/src/types/broadcast.ts` - P2P message types no longer needed
- `/src/types/storage.ts` - SheetRecord type moved to supabase.ts

**Commands:**

```bash
rm /src/lib/storage/indexeddb.ts
rm /src/lib/storage/types.ts
rm -rf /src/lib/obr/hooks/use-chunked-broadcast
rm /src/hooks/use-global-sheet-sync.ts
rm /src/types/broadcast.ts
rm /src/types/storage.ts
```

---

### Phase 4: Update Type Exports

**File**: `/src/types/index.ts`

Remove exports for deleted files:

```typescript
export * from "./character";
```

---

### Phase 5: Clean Up Component Dependencies

**File**: `/src/components/obr-gate.tsx`

Remove the unused `useGlobalSheetSync` import and call:

```typescript
import OBR from "@owlbear-rodeo/sdk";
import { createContext, useContext, useEffect, useState } from "react";

// Removed: import { useGlobalSheetSync } from "@/hooks/use-global-sheet-sync";

type OBRContextValue = {
  isReady: boolean;
};

const OBRContext = createContext<OBRContextValue>({ isReady: false });

export function useOBR() {
  return useContext(OBRContext);
}

type OBRGateProps = {
  children: React.ReactNode;
};

export function OBRGate({ children }: OBRGateProps) {
  const [isReady, setIsReady] = useState(false);

  // Removed: useGlobalSheetSync();

  useEffect(() => {
    if (!OBR.isAvailable) {
      setIsReady(true);
      return;
    }

    OBR.onReady(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <OBRContext.Provider value={{ isReady }}>{children}</OBRContext.Provider>
  );
}
```

---

### Phase 6: Rename Broadcast Channel (Optional Improvement)

The dice tray feature uses a separate BroadcastChannel for dice roll notifications. Rename the constant to avoid confusion with the removed sheet sync.

**Update `/src/lib/constants.ts`:**

```typescript
export const DICE_BROADCAST_CHANNEL = `${DNS_ID}/dice-broadcast-channel`;
// Removed: MAIN_BROADCAST_CHANNEL
```

**Update `/src/hooks/dice/highlight-dice.tsx`:**

```typescript
import { DICE_BROADCAST_CHANNEL } from "@/lib/constants";
// ...
const channel = new BroadcastChannel(DICE_BROADCAST_CHANNEL);
```

**Update `/src/components/dice-tray/index.tsx`:**

```typescript
import { DICE_BROADCAST_CHANNEL } from "@/lib/constants";
// ...
const channel = new BroadcastChannel(DICE_BROADCAST_CHANNEL);
```

---

### Phase 7: Remove Dependencies

#### Update package.json

Remove the `idb` dependency:

```json
{
  "dependencies": {
    // "idb": "^8.0.3"  <-- Remove this line
  }
}
```

#### Reinstall dependencies

```bash
bun install
```

---

## Comparison: P2P vs Supabase Realtime

### P2P (Current - OBR Broadcast)

**Pros:**
- Works offline
- No external service dependency for sync
- Very low latency (direct peer communication)
- Instant local reads/writes

**Cons:**
- No persistence (data lost on browser clear)
- Room-only access (can't access from other Owlbear rooms)
- Per-device storage (no cloud sync)
- Complex custom sync protocol
- Requires initial full-sync handshake
- Broadcast size limitations

### Supabase Realtime

**Pros:**
- Cloud persistence (sheets survive browser clears)
- Cross-room access (same sheets in any Owlbear room)
- Multi-device sync (seamless across desktop/mobile)
- Automatic real-time synchronization
- Simpler codebase (no custom sync protocol)
- No broadcast size limitations
- Automatic reconnection handling
- Postgres MVCC for conflict resolution

**Cons:**
- Requires internet connection
- Dependency on Supabase service availability
- Initial load may have slight delay (network round-trip)
- Free tier has concurrent connection limits (500)

---

## Testing Checklist

- [ ] Supabase Realtime enabled on `sheets` table
- [ ] RLS disabled on `sheets` table
- [ ] Environment variables configured (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
- [ ] `/src/lib/storage/supabase.ts` created with CRUD and subscription functions
- [ ] `/src/hooks/use-character-sheet.ts` updated to use Supabase + Realtime
- [ ] `/src/hooks/use-global-sheet-sync.ts` deleted
- [ ] `/src/lib/storage/indexeddb.ts` deleted
- [ ] `/src/lib/storage/types.ts` deleted
- [ ] `/src/lib/obr/hooks/use-chunked-broadcast/` directory deleted
- [ ] `/src/types/broadcast.ts` deleted
- [ ] `/src/types/storage.ts` deleted
- [ ] `/src/types/index.ts` updated (removed deleted exports)
- [ ] `/src/components/obr-gate.tsx` updated (removed useGlobalSheetSync)
- [ ] `package.json` updated (removed `idb` dependency)
- [ ] Dependencies reinstalled (`bun install`)
- [ ] Application builds without errors
- [ ] Sheets load from Supabase
- [ ] Sheet updates sync across multiple browser tabs/devices
- [ ] Sheet deletion syncs across clients

---

## Rollback Plan

If issues arise during migration:

1. **Restore from git:**
   ```bash
   git checkout HEAD -- /src/lib/storage/
   git checkout HEAD -- /src/hooks/
   git checkout HEAD -- /src/types/
   ```

2. **Reinstall idb:**
   ```bash
   bun add idb@^8.0.3
   ```

3. **Data migration back to IndexedDB:**
   - Export sheets from Supabase
   - Re-import using IndexedDB saveSheet function

---

## Migration Complete

After completing all phases:

1. All sheets are stored in Supabase Postgres
2. Real-time sync works automatically across all clients
3. No P2P/OBR broadcast complexity remains
4. Sheets persist across rooms and devices
5. Codebase is significantly simpler
6. Version field removed from schema and types

The migration is complete when:
- ✅ Application builds without errors
- ✅ Sheets load from Supabase
- ✅ Updates sync in real-time across multiple clients
- ✅ No IndexedDB or P2P broadcast code remains
- ✅ No `version` field references in code

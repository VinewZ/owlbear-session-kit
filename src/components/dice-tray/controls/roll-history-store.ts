import OBR, { type Player } from "@owlbear-rodeo/sdk";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useDiceRollStore } from "../dice/store";
import { getCombinedDiceValue } from "../helpers/getCombinedDiceValue";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { getPluginId } from "../plugin/getPluginId";
import type { DiceRoll } from "../types/DiceRoll";
import type { Die } from "../types/Die";

const MAX_HISTORY = 50;

export interface RollHistoryPlayer {
	id: string;
	name: string;
	color: string;
}

export interface RollHistoryEntry {
	id: string;
	player: RollHistoryPlayer;
	diceRoll: DiceRoll;
	dieResults: { type: Die["type"]; style: Die["style"]; value: number }[];
	finalValue: number | null;
	timestamp: number;
}

interface RollHistoryState {
	entries: RollHistoryEntry[];
	pushEntry: (entry: RollHistoryEntry) => void;
	clearHistory: () => void;
}

let entryCounter = 0;

export const useRollHistoryStore = create<RollHistoryState>()(
	immer((set) => ({
		entries: [],
		pushEntry(entry) {
			set((state) => {
				if (state.entries.length >= MAX_HISTORY) {
					state.entries.splice(0, state.entries.length - MAX_HISTORY + 1);
				}
				state.entries.push(entry);
			});
		},
		clearHistory() {
			set((state) => {
				state.entries = [];
			});
		},
	})),
);

function isFinishedRolling(player: Player): boolean {
	const rollValues = player.metadata[getPluginId("rollValues")] as
		| Record<string, number | null>
		| undefined;
	if (!rollValues) return false;
	const values = Object.values(rollValues);
	if (values.length === 0) return false;
	return values.every((v) => v !== null);
}

function extractRollData(player: Player) {
	const diceRoll = player.metadata[getPluginId("roll")] as DiceRoll | undefined;
	const rollValues = player.metadata[getPluginId("rollValues")] as
		| Record<string, number | null>
		| undefined;
	if (!diceRoll || !rollValues) return null;

	const finishedValues: Record<string, number> = {};
	for (const [id, value] of Object.entries(rollValues)) {
		if (value !== null) {
			finishedValues[id] = value;
		}
	}

	const finalValue = diceRoll.hidden
		? null
		: getCombinedDiceValue(diceRoll, finishedValues);

	const dieResults: RollHistoryEntry["dieResults"] = [];
	if (!diceRoll.hidden) {
		const dieList = getDieFromDice(diceRoll);
		for (const die of dieList) {
			const v = finishedValues[die.id];
			if (v !== undefined) {
				let displayValue = v;
				if (v === 0 && die.type === "D10") displayValue = 10;
				dieResults.push({
					type: die.type,
					style: die.style,
					value: displayValue,
				});
			}
		}
	}

	return { diceRoll, finalValue, dieResults };
}

const playerFinishedRef: Record<string, boolean> = {};

function checkPlayerRoll(player: Player) {
	const key = player.connectionId;
	const finished = isFinishedRolling(player);
	const wasFinished = playerFinishedRef[key];

	if (finished && !wasFinished) {
		const data = extractRollData(player);
		if (data) {
			useRollHistoryStore.getState().pushEntry({
				id: `roll-${++entryCounter}`,
				player: {
					id: player.id,
					name: player.name,
					color: player.color,
				},
				diceRoll: data.diceRoll,
				dieResults: data.dieResults,
				finalValue: data.finalValue,
				timestamp: Date.now(),
			});
		}
	}

	playerFinishedRef[key] = finished;
}

let localFinishedRef = false;

function checkLocalRoll() {
	const state = useDiceRollStore.getState();
	if (!state.roll) {
		localFinishedRef = false;
		return;
	}

	const values = Object.values(state.rollValues);
	const finished = values.length > 0 && values.every((v) => v !== null);

	if (finished && !localFinishedRef) {
		const finishedValues: Record<string, number> = {};
		for (const [id, value] of Object.entries(state.rollValues)) {
			if (value !== null) finishedValues[id] = value;
		}

		const finalValue = state.roll.hidden
			? null
			: getCombinedDiceValue(state.roll, finishedValues);

		const dieResults: RollHistoryEntry["dieResults"] = [];
		if (!state.roll.hidden) {
			const dieList = getDieFromDice(state.roll);
			for (const die of dieList) {
				const v = finishedValues[die.id];
				if (v !== undefined) {
					let displayValue = v;
					if (v === 0 && die.type === "D10") displayValue = 10;
					dieResults.push({
						type: die.type,
						style: die.style,
						value: displayValue,
					});
				}
			}
		}

		useRollHistoryStore.getState().pushEntry({
			id: `roll-${++entryCounter}`,
			player: { id: "local", name: "You", color: "#7c4dff" },
			diceRoll: state.roll,
			dieResults,
			finalValue,
			timestamp: Date.now(),
		});
	}

	localFinishedRef = finished;
}

let unsubParty: (() => void) | null = null;
let unsubRollStore: (() => void) | null = null;

export function initRollHistory() {
	OBR.party.getPlayers().then((players) => {
		for (const player of players) {
			if (isFinishedRolling(player)) {
				playerFinishedRef[player.connectionId] = true;
			}
		}
	});

	OBR.party.onChange((players) => {
		for (const player of players) {
			checkPlayerRoll(player);
		}
	});

	unsubRollStore = useDiceRollStore.subscribe(checkLocalRoll);
}

export function destroyRollHistory() {
	unsubParty?.();
	unsubRollStore?.();
	unsubParty = null;
	unsubRollStore = null;
}

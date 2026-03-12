import type { Abilities, CharacterT, Spell, Weapon } from "@/types";

export type { CharacterT } from "@/types";

const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

const SKILLS = [
	"ACROBATICS",
	"ANIMAL HANDLING",
	"ARCANA",
	"ATHLETICS",
	"DECEPTION",
	"HISTORY",
	"INSIGHT",
	"INTIMIDATION",
	"INVESTIGATION",
	"MEDICINE",
	"NATURE",
	"PERCEPTION",
	"PERFORMANCE",
	"PERSUASION",
	"RELIGION",
	"SLEIGHT OF HAND",
	"STEALTH",
	"SURVIVAL",
] as const;
type SkillKey = (typeof SKILLS)[number];

const WEAPON_FIELD_REGEX =
	/^(NAME|DAMAGE\/TYPE|NOTES|BONUS\/DC)\s-\sWEAPON\s(\d+)$/;

const SPELL_FIELD_REGEX =
	/^(SPELL NAME|SPELL LEVEL|RANGE|CASTING TIME|SPELL NOTES)\s*(\d+)$/;

const multiLineSplit = (v: string) =>
	v
		.split(/\r\n?|\n/)
		.filter((line) => line.trim() !== "")
		.join("\r\n");

function createEmptyCharacter(): CharacterT {
	const abilities: Abilities = {};
	for (const ability of ABILITIES) {
		abilities[ability] = {};
	}

	return {
		identity: {
			name: "",
			class: "",
			subclass: "",
			level: 0,
			experience: 0,
			background: "",
			species: "",
			traits: "",
			feats: "",
			personality: "",
			alignment: "",
			appearance: "",
			languages: "",
			passivePerception: 0,
		},
		abilities,
		skills: {},
		combat: {},
		weapons: [],
		spellcasting: {
			ability: "",
			attackBonus: "",
			saveDC: 0,
			mod: "",
		},
		spells: [],
		classFeatures: "",
		proficiencies: "",
		tool: "",
		equipment: "",
		currency: {
			cp: 0,
			sp: 0,
			ep: 0,
			gp: 0,
			pp: 0,
		},
	};
}

export function parsePdfForm(form: Record<string, unknown[]>): CharacterT {
	const char = createEmptyCharacter();
	const weaponMap: Record<number, Weapon> = {};
	const spellMap: Record<number, Spell> = {};

	for (const [field, widgets] of Object.entries(form)) {
		if (field.startsWith("Check Box")) continue;

		for (const widget of widgets as { value?: unknown }[]) {
			if (typeof widget.value !== "string") continue;

			const value = widget.value.trim();
			if (!value) continue;

			const weaponMatch = field.match(WEAPON_FIELD_REGEX);
			if (weaponMatch) {
				const [, kind, indexStr] = weaponMatch;
				const index = Number(indexStr);
				weaponMap[index] ??= {};
				switch (kind) {
					case "NAME":
						weaponMap[index].name = value;
						break;
					case "DAMAGE/TYPE":
						weaponMap[index].damage = value;
						break;
					case "NOTES":
						weaponMap[index].notes = value;
						break;
					case "BONUS/DC":
						weaponMap[index].bonus = value;
						break;
				}
				continue;
			}

			const spellMatch = field.match(SPELL_FIELD_REGEX);
			if (spellMatch) {
				const [, kind, indexStr] = spellMatch;
				const index = Number(indexStr);
				spellMap[index] ??= {};
				switch (kind) {
					case "SPELL NAME":
						spellMap[index].name = value;
						break;
					case "SPELL LEVEL":
						spellMap[index].level = Number(value);
						break;
					case "RANGE":
						spellMap[index].range = value;
						break;
					case "CASTING TIME":
						spellMap[index].castingTime = value;
						break;
					case "SPELL NOTES":
						spellMap[index].notes = value;
						break;
				}
				continue;
			}

			let isAbility = false;
			for (const ab of ABILITIES) {
				if (field === `${ab} SCORE`) {
					char.abilities[ab].score = Number(value);
					isAbility = true;
					break;
				}
				if (field === `${ab} MOD`) {
					char.abilities[ab].mod = Number(value);
					isAbility = true;
					break;
				}
				if (field === `${ab} SAVE`) {
					char.abilities[ab].save = Number(value);
					isAbility = true;
					break;
				}
			}
			if (isAbility) continue;

			if (SKILLS.includes(field as SkillKey)) {
				char.skills[field] = Number(value);
				continue;
			}

			if (field === "CLASS FEATURES 1" || field === "CLASS FEATURES 2") {
				const features = multiLineSplit(value);
				char.classFeatures = char.classFeatures
					? `${char.classFeatures}\r\n${features}`
					: features;
				continue;
			}

			switch (field) {
				case "Name":
					char.identity.name = value;
					break;
				case "Class":
					char.identity.class = value;
					break;
				case "Subclass":
					char.identity.subclass = value || "Subclass";
					break;
				case "Level":
					char.identity.level = Number(value);
					break;
				case "XP Points":
					char.identity.experience = Number(value);
					break;
				case "Background":
					char.identity.background = value;
					break;
				case "Species":
					char.identity.species = value;
					break;
				case "SPECIES TRAITS":
					char.identity.traits = multiLineSplit(value);
					break;
				case "FEATS":
					char.identity.feats = multiLineSplit(value);
					break;
				case "BACKSTORY / PERSONALITY":
					char.identity.personality = multiLineSplit(value);
					break;
				case "Alignment":
					char.identity.alignment = multiLineSplit(value);
					break;
				case "APPEARANCE":
					char.identity.appearance = multiLineSplit(value);
					break;
				case "LANGUAGES":
					char.identity.languages = multiLineSplit(value);
					break;
				case "EQUIPMENT":
					char.equipment = multiLineSplit(value);
					break;
				case "PASSIVE PERCEPTION":
					char.identity.passivePerception = Number(value);
					break;

				case "Armor Class":
					char.combat.armorClass = Number(value);
					break;
				case "SPEED":
					char.combat.speed = value;
					break;
				case "init":
					char.combat.initiative = Number(value);
					break;
				case "PROF BONUS":
					char.combat.proficiencyBonus = Number(value);
					break;
				case "Max HP":
					char.combat.maxHP = Number(value);
					break;
				case "Current HP":
					char.combat.currentHP = Number(value);
					break;
				case "Temp HP":
					char.combat.tempHP = Number(value) || 0;
					break;

				case "SPELL SAVE DC":
					if (char.spellcasting) char.spellcasting.saveDC = Number(value);
					break;
				case "SPELL ATTACK BONUS":
					if (char.spellcasting) char.spellcasting.attackBonus = value;
					break;
				case "SPELLCASTING ABILITY":
					if (char.spellcasting) char.spellcasting.ability = value;
					break;
				case "SPELLCASTING MOD":
					if (char.spellcasting) char.spellcasting.mod = value;
					break;

				case "WEAPON PROF":
					char.proficiencies = multiLineSplit(value);
					break;
				case "TOOL PROF":
					char.tool = value;
					break;

				case "CP":
					char.currency.cp = Number(value);
					break;
				case "SP":
					char.currency.sp = Number(value);
					break;
				case "EP":
					char.currency.ep = Number(value);
					break;
				case "GP":
					char.currency.gp = Number(value);
					break;
				case "PP":
					char.currency.pp = Number(value);
					break;
			}
		}
	}

	char.weapons = Object.entries(weaponMap)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([, weapon]) => weapon);

	char.spells = Object.entries(spellMap)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([, spell]) => spell)
		.filter((spell) => spell.name);

	return char;
}

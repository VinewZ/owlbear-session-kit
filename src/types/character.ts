export type Weapon = {
	name?: string;
	damage?: string;
	notes?: string;
	bonus?: string;
};

export type Spell = {
	name?: string;
	level?: number;
	range?: string;
	castingTime?: string;
	notes?: string;
};

export type Spellcasting = {
	ability?: string;
	saveDC?: number;
	attackBonus?: string;
	mod?: string;
};

export type Identity = {
	name: string;
	class: string;
	subclass: string;
	level: number;
	experience: number;
	background: string;
	species: string;
	traits: string;
	feats: string;
	personality: string;
	alignment: string;
	appearance: string;
	languages: string;
	passivePerception: number;
};

export type Combat = {
	maxHP?: number;
	currentHP?: number;
	tempHP?: number;
	armorClass?: number;
	speed?: string;
	initiative?: number;
	proficiencyBonus?: number;
};

export type Abilities = Record<
	string,
	{
		score?: number;
		mod?: number;
		save?: number;
	}
>;

export type Currency = {
	cp: number;
	sp: number;
	ep: number;
	gp: number;
	pp: number;
};

export type CharacterT = {
	identity: Identity;
	equipment: string;
	abilities: Abilities;
	skills: Record<string, number>;
	combat: Combat;
	weapons: Weapon[];
	spellcasting?: Spellcasting;
	spells: Spell[];
	classFeatures: string;
	proficiencies: string;
	tool: string;
	currency: Currency;
};

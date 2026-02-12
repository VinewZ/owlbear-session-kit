const DNS_ID = "com.vinewz.session-kit";
export const RIGHT_SHEET_POPOVER_ID = `${DNS_ID}/right-sheet-popover`;
export const ATTACH_SHEET_CONTEXT_MENU_ID = `${DNS_ID}/attach-sheet-context-menu`;
export const SHEET_UPLOADED_ID = `${DNS_ID}/sheet-uploaded-id`;
export const SHEET_PARSED_ID = `${DNS_ID}/sheet-parsed-id`;

export const DICE_REGEX = /\b[1-9]\d*[dD](?:4|6|8|10|12|20|100)(?:[+-]\d+)?\b/g;

export const Y_CHARACTER_SHEETS = `${DNS_ID}/character-sheets`;

export const MAIN_BROADCAST_CHANNEL = `${DNS_ID}/main-broadcast-channel`;

// WebRTC Configuration
export const WEBRTC_SIGNALING_CHANNEL = `${DNS_ID}/webrtc-signaling`;

// Yjs sync configuration
export const YJS_UPDATE_BUFFER_MS = 50; // ms to buffer rapid edits
export const YJS_SYNC_TIMEOUT_MS = 10000; // max wait for initial sync

export const SKILL_TO_ABILITY = {
	ACROBATICS: "DEX",
	"SLEIGHT OF HAND": "DEX",
	STEALTH: "DEX",

	ATHLETICS: "STR",

	ARCANA: "INT",
	HISTORY: "INT",
	INVESTIGATION: "INT",
	NATURE: "INT",
	RELIGION: "INT",

	ANIMAL_HANDLING: "WIS",
	INSIGHT: "WIS",
	MEDICINE: "WIS",
	PERCEPTION: "WIS",
	SURVIVAL: "WIS",

	DECEPTION: "CHA",
	INTIMIDATION: "CHA",
	PERFORMANCE: "CHA",
	PERSUASION: "CHA",
};

export const EX_JSON = {
	identity: {
		name: "Kirin",
		class: "Guerreiro",
		subclass: "-",
		level: 1,
		experience: 0,
		background: "Soldado",
		species: "Tiefling",
		traits:
			"Você é um Humanoide.\r\nVocê é de tamanho Médio (180), escolhido quando seleciona esta espécie.\r\nVocê possui um deslocamento de 9 m (30 pés).\r\nVocê possui Visão no Escuro com alcance de 18 m (60 pés).",
		feats:
			"Estilo de Luta - Combate com Armas Grandes - Pg. 127\r\nAo rolar dano de arma de duas mãos, trate resultados 1 ou 2 nos dados como 3.\r\nVocê pode tratar qualquer resultado 1 ou 2 em um dado de dano como 3.\r\nAtacante Selvagem - Origem (Soldado) - Pg. 185-201\r\n1x por turno, ao atingir com arma, role o dano 2x e use o melhor resultado.",
		personality:
			"Personalidade:\r\n- Direto\r\n- Inquieto\r\n- Estável\r\n- Curioso\r\n- Atento\r\n- Engraçado\r\n- Prestativo\r\n- Pragmático",
		alignment: "Neutro e Bom",
		appearance: "",
		languages: "Comum, Infernal, Orc, Gigante",
		passivePerception: 13,
	},
	abilities: {
		STR: {
			mod: 3,
			score: 17,
			save: 5,
		},
		DEX: {
			mod: 3,
			score: 16,
			save: 3,
		},
		CON: {
			mod: 2,
			score: 14,
			save: 4,
		},
		INT: {
			mod: 0,
			save: 0,
			score: 11,
		},
		WIS: {
			mod: 1,
			score: 13,
		},
		CHA: {
			score: 14,
			save: 2,
			mod: 2,
		},
	},
	skills: {
		ACROBATICS: 3,
		"SLEIGHT OF HAND": 3,
		STEALTH: 3,
		PERSUASION: 2,
		PERFORMANCE: 2,
		DECEPTION: 2,
		SURVIVAL: 1,
		PERCEPTION: 3,
		MEDICINE: 1,
		INSIGHT: 1,
		"ANIMAL HANDLING": 3,
		RELIGION: 0,
		NATURE: 0,
		HISTORY: 0,
		ARCANA: 0,
		ATHLETICS: 5,
		INVESTIGATION: 0,
	},
	combat: {
		initiative: 0,
		speed: "30ft/9m",
		proficiencyBonus: 2,
		currentHP: 12,
		armorClass: 16,
		tempHP: 0,
		maxHP: 12,
	},
	weapons: [
		{
			name: "Espada grande",
			bonus: "+5",
			damage: "2d6 Cortante",
			notes: "Marcial, Pesada, 2 Mãos",
		},
		{
			name: "Mangual",
			bonus: "+5",
			damage: "1d8 Contundente",
		},
		{
			name: "Azagaias",
			bonus: "+5",
			damage: "1d6 Perfurante",
		},
		{
			name: "Ataque Desarmado",
			bonus: "+5",
			damage: "4 Concussão",
		},
	],
	spellcasting: {
		ability: "Carisma",
		attackBonus: "+3",
		saveDC: 11,
		mod: "+1",
	},
	spells: [
		{
			range: "36m",
			castingTime: "Ação",
			name: "Raio de Fogo",
			notes: "V/S - Pg - 323",
			level: 0,
		},
		{
			range: "9m",
			castingTime: "Ação",
			level: 0,
			notes: "V - Pg - 335 - 1 Min",
			name: "Taumaturgia",
		},
	],
	classFeatures:
		"Maestria em Armas - Pg.127\r\nEspada Grande (Garantido): Se errar, causa 3 de dano (seu MOD de Força)\r\n-\r\nMangual(Drenar): Acertou? Desvantagem na próxima jogada antes do início do seu próximo turno\r\n-\r\nAzagaia (Lentidão): Acertou? Reduz deslocamento do alvo em 3m.",
	proficiencies: "Armas Simples, Armas Marciais",
	tool: "Kit de jogos: Conjunto de Dados",
	equipment:
		"1 Cota de Malha\r\n1 Espada Grande\r\n1 Mangual\r\n8 Azagaia\r\n1 Kit de Explorador de Masmorras:\r\n - Caixa para Fogo, Cantil, Corda, Estrepes, Mochila, 2 potes de Óleo, Pé de Cabra, 10 dias de Rações, 10 Tochas.\r\n1 Pergaminho Vampírico\r\n1 Cinto do Mártir Esquecido\r\nUma vez por descanso longo quando o usuário estiver com menos de 50% de HP ganha HP temporário de CON + PROF",
};

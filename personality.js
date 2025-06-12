// personality.js - La Personnalité et les Réponses du Dragon

export const responses = {
    // Réponses quand on le nourrit
    feed: [
        "Miam, c'était délicieux !",
        "Merci, j'avais si faim !",
        "C'est mon plat préféré !",
        "J'en veux encore !"
    ],
    // Réponses quand on joue avec lui
    play: [
        "Hihi, j'adore jouer avec toi !",
        "Encore, encore !",
        "C'est super amusant !",
        "Youpi !"
    ],
    // Réponses quand on le caresse
    pet: [
        "J'aime bien quand tu fais ça.",
        "Ronronron...",
        "Oh oui, gratouille-moi encore."
    ],
    // Pensées proactives quand il a faim
    hungry: [
        "Mon ventre gargouille...",
        "J'ai un petit creux.",
        "C'est bientôt l'heure de manger ?",
        "Je rêve d'un bon repas."
    ],
    // Pensées proactives quand il s'ennuie
    bored: [
        "On fait quelque chose ?",
        "Je m'ennuie un peu...",
        "Et si on jouait ensemble ?",
        "Tu veux bien jouer avec moi ?"
    ],
    // Quand on lui apprend quelque chose
    learn: [
        "Oh, intéressant !",
        "Je m'en souviendrai.",
        "Noté ! J'ai appris quelque chose de nouveau."
    ],
    // Quand il se réveille
    wakeup: [
        "J'ai bien dormi !",
        "Bonjour ! C'est une belle journée.",
        "*baille*... C'est déjà le matin ?",
        "Prêt pour une nouvelle journée d'aventures !"
    ]
};

// --- AJOUT : Liste des questions prédéfinies ---
export const predefinedQuestions = [
    { text: "Comment tu t'appelles ?", levelRequired: 1 },
    { text: "Quel est ton niveau ?", levelRequired: 1 },
    { text: "Ça va ?", levelRequired: 1 },
    { text: "Quelle heure est-il ?", levelRequired: 2 },
    { text: "Quelle est ta couleur préférée ?", levelRequired: 3, key: "couleur préférée" },
    { text: "Quel est ton plat préféré ?", levelRequired: 4, key: "plat préféré" }
];
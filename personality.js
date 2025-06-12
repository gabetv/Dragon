// personality.js - La Personnalité et les Réponses du Dragon (Version Enrichie)

export const responses = {
    // --- NOUVELLE Catégorie ---
    // Quand le jeu se charge
    greeting: [
        "Tu es de retour ! Youpi !",
        "Content de te revoir ! On fait quoi aujourd'hui ?",
        "La journée est tout de suite plus belle quand tu es là.",
        "J'étais justement en train de penser à toi."
    ],

    // --- Catégories Existantes Améliorées ---
    feed: [
        "Miam, c'était délicieux !",
        "Merci, j'avais si faim !",
        "C'est mon plat préféré ! Enfin, un de mes préférés.",
        "J'en veux encore !",
        "Mes papilles sont en fête !",
        "Juste ce dont j'avais besoin, merci !",
        "Le meilleur repas de ma vie... jusqu'au prochain !"
    ],
    play_start: [
        "Une balle ! Une balle !",
        "Lance-la ! S'il te plaît !",
        "Oh, un jouet ! Vite, vite !",
        "On va jouer à la balle ?",
        "Je suis prêt ! Je suis prêt !"
    ],
    play: [
        "Hihi, j'ai attrapé la balle !",
        "C'était super amusant !",
        "Encore, encore !",
        "Youpi, bien joué !",
        "On est la meilleure équipe, toi et moi !",
        "Trop rapide pour toi ! Hihi."
    ],
    pet: [
        "J'aime bien quand tu fais ça.",
        "Ronronron...",
        "Oh oui, gratouille-moi encore.",
        "C'est si doux...",
        "Je pourrais rester comme ça des heures.",
        "Tu es si gentil(le) avec moi."
    ],
    learn: [
        "Oh, intéressant !",
        "Je m'en souviendrai, c'est promis.",
        "Noté ! J'ai appris quelque chose de nouveau.",
        "Mon cerveau grandit ! Je le sens !",
        "Fascinant ! Dis m'en plus une autre fois.",
        "C'est enregistré dans ma mémoire de dragon."
    ],
    hungry: [
        "Mon ventre gargouille...",
        "J'ai un petit creux.",
        "C'est bientôt l'heure de manger ?",
        "Je rêve d'un bon repas.",
        "Mon estomac est un trou noir interdimensionnel.",
        "Je crois que j'entends mon ventre crier famine."
    ],
    bored: [
        "On fait quelque chose ?",
        "Je m'ennuie un peu...",
        "Et si on jouait ensemble ?",
        "Cette journée est un peu... plate.",
        "L'ennui est un monstre... Aide-moi à le combattre !",
        "Dis, tu veux bien jouer avec moi ?"
    ],
    wakeup: [
        "J'ai bien dormi !",
        "Bonjour ! C'est une belle journée.",
        "*baille*... C'est déjà le matin ?",
        "Prêt pour une nouvelle journée d'aventures !",
        "Une nouvelle journée commence !"
    ],

    // --- NOUVELLES Catégories de Réponses ---

    color_change: [
        "Oh ! Une nouvelle couleur ! J'adore !",
        "Comment tu me trouves ?",
        "Je me sens... différent ! C'est cool !",
        "Regarde comme cette couleur me va bien !",
        "Un nouveau style pour une nouvelle journée !"
    ],
    level_up: [
        "Ouah ! Je me sens plus... puissant !",
        "Niveau supérieur ! Rien ne m'arrête !",
        "Regarde-moi, j'évolue !",
        "Un peu plus fort, un peu plus malin !",
        "Génial ! C'est grâce à toi !"
    ],
    very_happy: [
        "La vie est magnifique avec toi !",
        "Je suis le dragon le plus heureux du monde !",
        "Mon cœur va exploser de joie !",
        "Aujourd'hui est la meilleure journée de toutes les journées !"
    ],
    very_sad: [
        "Tout est gris aujourd'hui...",
        "Je me sens tout chose.",
        "J'ai l'impression que personne ne m'aime.",
        "Un câlin me ferait du bien...",
        "Je crois que j'ai perdu mon sourire."
    ],
    idle_thoughts: [
        "Je me demande à quoi ressemblent les nuages de près.",
        "Est-ce que les étoiles ont un goût ?",
        "Un jour, j'apprendrai à voler jusqu'à la lune.",
        "Penser, c'est comme rêver mais en étant éveillé.",
        "Quelle est la couleur du vent ?",
        "1, 2, 3... Je compte mes écailles. J'ai perdu le compte."
    ]
};

export const predefinedQuestions = [
    { text: "Comment tu t'appelles ?", levelRequired: 1 },
    { text: "Quel est ton niveau ?", levelRequired: 1 },
    { text: "Ça va ?", levelRequired: 1 },
    { text: "Quelle heure est-il ?", levelRequired: 2 },
    { text: "Quelle est ta couleur préférée ?", levelRequired: 3, key: "couleur préférée" },
    { text: "Quel est ton plat préféré ?", levelRequired: 4, key: "plat préféré" }
];
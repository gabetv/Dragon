// dragon_ai.js - Le Cerveau du Dragon

// On utilise 'export default' pour que cette classe puisse être importée par d'autres fichiers.
export default class DragonAI {
    constructor() {
        this.hunger = 80.0;
        this.happiness = 80.0;
        this.state = "happy"; // État actuel (ex: "happy", "sad", etc.)
        this.actionTimer = 0; // Durée d'une action en cours
        this.lastThoughtTime = 0; // Pour espacer les pensées

        // --- Personnalisation et Connaissances ---
        this.name = "Drago";
        this.knowledge = {}; // Dictionnaire pour stocker ce que l'utilisateur lui apprend
        
        this.load(); // Charger les données sauvegardées au démarrage
    }

    // --- MISE À JOUR DE L'IA (LA BOUCLE DE VIE) ---
    update(dt) {
        // Mise à jour des stats de base
        this.hunger -= dt * 1.5;
        this.happiness -= dt * 1.0;
        if (this.hunger < 0) this.hunger = 0;
        if (this.happiness < 0) this.happiness = 0;
        
        // Si une action est en cours, on ne change pas d'état
        if (this.actionTimer > 0) {
            this.actionTimer -= dt;
            return; // Sort de la fonction pour ne pas écraser l'état de l'action
        }

        // --- Logique de décision de l'état passif ---
        const hour = new Date().getHours();
        const isNightTime = (hour < 6 || hour >= 22);

        if (this.hunger < 30 || this.happiness < 30) {
            this.state = "sad";
        } else if (isNightTime && this.hunger > 80 && this.happiness > 80) {
            this.state = "sleeping";
        } else if (this.happiness > 95) {
            this.state = "in_love";
        } else {
            this.state = "happy";
        }
    }

    // --- ACTIONS ---
    setActionState(newState, duration) {
        this.state = newState;
        this.actionTimer = duration;
    }

    feed() {
        this.hunger = Math.min(100.0, this.hunger + 25);
        this.happiness = Math.min(100.0, this.happiness + 5);
        this.setActionState("eating", 3);
        return "Miam !"; // Retourne la pensée à afficher
    }

    play() {
        this.happiness = Math.min(100.0, this.happiness + 20);
        this.setActionState("playing", 4);
        return "Hihi, c'est amusant !";
    }

    pet() {
        if (this.actionTimer > 0 || this.state === 'sad') return null; // Ne retourne rien si l'action échoue
        this.happiness = Math.min(100.0, this.happiness + 3);
        this.setActionState("in_love", 2);
        return null; // Pas de pensée spécifique pour une caresse, l'animation suffit
    }
    
    // --- GESTION DE LA SAUVEGARDE ---
    save() {
        const data = {
            hunger: this.hunger,
            happiness: this.happiness,
            name: this.name,
            knowledge: this.knowledge
        };
        localStorage.setItem('petSaveData', JSON.stringify(data));
        console.log("Données du dragon sauvegardées.");
    }

    load() {
        const data = localStorage.getItem('petSaveData');
        if (data) {
            const savedState = JSON.parse(data);
            this.hunger = savedState.hunger || 80.0;
            this.happiness = savedState.happiness || 80.0;
            this.name = savedState.name || "Drago";
            this.knowledge = savedState.knowledge || {};
            console.log("Données du dragon chargées.");
        }
    }
}
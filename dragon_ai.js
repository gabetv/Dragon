// dragon_ai.js - Le Cerveau du Dragon (avec XP, Niveaux et Couleur)

export default class DragonAI {
    constructor() {
        // Stats de base
        this.hunger = 80.0;
        this.happiness = 80.0;
        this.state = "happy";
        this.actionTimer = 0;

        // Système de Progression
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.skills = [];

        // Personnalisation et Connaissances
        this.name = "Drago";
        this.knowledge = {};
        this.color = "default"; // --- AJOUTÉ : Couleur par défaut ---
        
        this.load();
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.level++;
            this.xp -= this.xpToNextLevel;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            const newSkill = this.unlockSkill();
            return { message: `LEVEL UP ! Je suis niveau ${this.level} !`, skill: newSkill };
        }
        return null;
    }

    unlockSkill() {
        if (this.level === 2) { this.skills.push("Gourmand Agile"); return "Compétence : Manger me rend plus heureux !"; }
        if (this.level === 3) { this.skills.push("Apprentissage Rapide"); return "Compétence : J'apprends plus vite !"; }
        if (this.level === 4) { this.skills.push("Maître du Jeu"); return "Compétence : Jouer me donne plus de joie !"; }
        return null;
    }
    
    hasSkill(skillName) {
        // Recherche si une compétence est présente (ex: 'Apprentissage Rapide')
        return this.skills.includes(skillName);
    }

    update(dt) {
        this.hunger -= dt * 1.5;
        this.happiness -= dt * 1.0;
        if (this.hunger < 0) this.hunger = 0;
        if (this.happiness < 0) this.happiness = 0;
        
        if (this.actionTimer > 0) {
            this.actionTimer -= dt;
            return;
        }
        
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

    setActionState(newState, duration) {
        this.state = newState;
        this.actionTimer = duration;
    }

    feed() {
        this.hunger = Math.min(100.0, this.hunger + 25);
        this.happiness = Math.min(100.0, this.happiness + (this.hasSkill("Gourmand Agile") ? 10 : 5));
        this.setActionState("eating", 3);
        return "Miam !";
    }

    play() {
        this.happiness = Math.min(100.0, this.happiness + (this.hasSkill("Maître du Jeu") ? 30 : 20));
        this.setActionState("playing", 4);
        return "Hihi, c'est amusant !";
    }

    pet() {
        if (this.actionTimer > 0 || this.state === 'sad') return null;
        this.happiness = Math.min(100.0, this.happiness + 3);
        this.setActionState("in_love", 2);
        return null;
    }
    
    save() {
        const data = {
            hunger: this.hunger,
            happiness: this.happiness,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            skills: this.skills,
            name: this.name,
            knowledge: this.knowledge,
            color: this.color // --- AJOUTÉ ---
        };
        localStorage.setItem('petSaveData', JSON.stringify(data));
        // console.log("Données du dragon sauvegardées."); // Optionnel, pour le débogage
    }

    load() {
        const data = localStorage.getItem('petSaveData');
        if (data) {
            const s = JSON.parse(data);
            this.hunger = s.hunger ?? 80.0;
            this.happiness = s.happiness ?? 80.0;
            this.level = s.level ?? 1;
            this.xp = s.xp ?? 0;
            this.xpToNextLevel = s.xpToNextLevel ?? 100;
            this.skills = s.skills ?? [];
            this.name = s.name ?? "Drago";
            this.knowledge = s.knowledge ?? {};
            this.color = s.color ?? "default"; // --- AJOUTÉ ---
            console.log("Données du dragon chargées.");
        }
    }
}
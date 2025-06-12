// dragon_brain.js - Le Cerveau décisionnel du Dragon

import { responses } from './personality.js';

export default class DragonBrain {
    constructor(dragon) {
        this.dragon = dragon; // Référence au dragon lui-même pour accéder à ses stats
        
        // Suivi pour éviter la répétition des pensées
        this.lastProactiveThoughtType = null;
        this.proactiveCooldown = 0;
    }

    /**
     * Choisit une réponse aléatoire pour une action donnée.
     * @param {string} actionType - Le type d'action (ex: 'feed', 'play').
     * @returns {string} Une phrase aléatoire.
     */
    getResponse(actionType) {
        const options = responses[actionType];
        if (!options || options.length === 0) {
            return "...";
        }
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Le dragon réfléchit et peut décider d'exprimer un besoin.
     * Appelé périodiquement par la boucle de jeu.
     * @returns {string|null} Une pensée proactive ou null.
     */
    think() {
        if (this.proactiveCooldown > 0) {
            this.proactiveCooldown--;
            return null;
        }

        if (this.dragon.actionTimer > 0) {
            return null;
        }

        const thoughts = [];
        if (this.dragon.hunger < 40 && this.lastProactiveThoughtType !== 'hungry') {
            thoughts.push('hungry');
        }
        if (this.dragon.happiness < 50 && this.lastProactiveThoughtType !== 'bored') {
            thoughts.push('bored');
        }
        
        if (thoughts.length > 0) {
            const thoughtType = thoughts[Math.floor(Math.random() * thoughts.length)];
            this.lastProactiveThoughtType = thoughtType;
            this.proactiveCooldown = 3; // Attend 3 cycles de pensée avant de se répéter
            return this.getResponse(thoughtType);
        }

        // Si tout va bien, réinitialiser pour qu'il puisse se plaindre à nouveau plus tard
        this.lastProactiveThoughtType = null;
        return null;
    }

    /**
     * Traite une question posée par l'utilisateur.
     * @param {string} question - La question de l'utilisateur.
     * @returns {string} La réponse du dragon.
     */
    processQuestion(question) {
        const q = question.toLowerCase().trim();

        // Intelligence "innée" et "spéciale"
        if (q.includes('comment tu t\'appelles') || q.includes('ton nom')) {
            return `Je m'appelle ${this.dragon.name}, bien sûr !`;
        }
        if (q.includes('quel âge as-tu') || q.includes('ton niveau')) {
            return `Je suis niveau ${this.dragon.level} !`;
        }
        if (q.includes('quelle heure est-il') || q.includes('l\'heure')) {
            const now = new Date();
            return `Il est ${now.getHours()} heures et ${now.getMinutes()} minutes.`;
        }
        if (q.includes('ça va')) {
            if (this.dragon.happiness > 70) return "Super ! Et toi ?";
            if (this.dragon.happiness > 40) return "Ça va bien, merci.";
            return "Pas terrible, je me sens un peu seul...";
        }
        // Question spéciale qui dépend d'une stat
        if (q === 'couleur préférée') {
            const colorName = {
                'default': 'orange',
                'green': 'vert',
                'blue': 'bleu',
                'purple': 'violet'
            }[this.dragon.color] || 'cette couleur';
            return `En ce moment, j'aime bien le ${colorName} !`;
        }

        // Intelligence "acquise" : il cherche dans ce qu'on lui a appris
        const learnedAnswer = this.dragon.knowledge[q];
        if (learnedAnswer) {
            return `Ah, je sais ! La réponse est : ${learnedAnswer}`;
        }
        
        // Si la question spéciale n'a pas encore de réponse enseignée
        if (q === 'plat préféré') {
            return "Hmm, je n'ai pas encore de plat préféré. Tu veux m'en apprendre un ?";
        }

        // S'il ne sait vraiment pas
        return "Désolé, je ne connais pas encore la réponse à cette question.";
    }
}
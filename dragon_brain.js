// dragon_brain.js - Le Cerveau décisionnel du Dragon

import { responses } from './personality.js';

export default class DragonBrain {
    constructor(dragon) {
        this.dragon = dragon; // Référence au dragon lui-même pour accéder à ses stats
        this.proactiveThoughtCooldown = 0;
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
        // Retourne une phrase au hasard depuis la liste
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Le dragon réfléchit et peut décider d'exprimer un besoin.
     * Appelé périodiquement par la boucle de jeu.
     * @returns {string|null} Une pensée proactive ou null.
     */
    think() {
        // Le dragon n'est pas d'humeur à penser s'il est en pleine action
        if (this.dragon.actionTimer > 0) {
            return null;
        }

        // Si la faim est basse, il y a une chance qu'il le dise
        if (this.dragon.hunger < 40 && Math.random() < 0.5) {
            return this.getResponse('hungry');
        }

        // Si le bonheur est bas, il y a une chance qu'il veuille jouer
        if (this.dragon.happiness < 50 && Math.random() < 0.5) {
            return this.getResponse('bored');
        }
        
        return null; // Aucune pensée particulière pour le moment
    }

    /**
     * Traite une question posée par l'utilisateur.
     * @param {string} question - La question de l'utilisateur.
     * @returns {string} La réponse du dragon.
     */
    processQuestion(question) {
        const q = question.toLowerCase().trim();

        // Intelligence "innée" : il répond à des questions simples de lui-même
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

        // Intelligence "acquise" : il cherche dans ce qu'on lui a appris
        const learnedAnswer = this.dragon.knowledge[q];
        if (learnedAnswer) {
            return `Ah, je sais ! La réponse est : ${learnedAnswer}`;
        }

        // S'il ne sait vraiment pas
        return "Désolé, je ne connais pas encore la réponse à cette question.";
    }
}
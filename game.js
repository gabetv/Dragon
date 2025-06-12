// game.js - Le Moteur du Jeu (affichage et interactions)

// On importe notre classe d'IA depuis le nouveau fichier
import DragonAI from './dragon_ai.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Références aux éléments HTML ---
    const dragonElement = document.getElementById('dragon');
    const creatureWorld = document.getElementById('creature-world');
    const hungerBarFill = document.getElementById('hunger-bar-fill');
    const happinessBarFill = document.getElementById('happiness-bar-fill');
    const btnFeed = document.getElementById('btn-feed');
    const btnPlay = document.getElementById('btn-play');
    const thoughtBubble = document.getElementById('thought-bubble');
    const btnRename = document.getElementById('btn-rename');
    const btnTeach = document.getElementById('btn-teach');
    const btnAsk = document.getElementById('btn-ask');

    // --- Fonction pour la bulle de pensée (inchangée) ---
    let thoughtTimeout;
    function showThought(message, duration = 3) {
        if (!message) return; // Ne fait rien si le message est vide
        clearTimeout(thoughtTimeout);
        thoughtBubble.textContent = message;
        thoughtBubble.classList.remove('hidden');
        void thoughtBubble.offsetWidth;
        thoughtBubble.classList.add('visible');
        thoughtTimeout = setTimeout(() => {
            thoughtBubble.classList.remove('visible');
        }, duration * 1000);
    }
    
    // --- Moteur de Jeu ---
    const game = {
        creature: new DragonAI(), // On crée une instance de notre IA
        spritemap: { "happy": { "x": 27, "y": 78, "w": 360, "h": 497 }, "sad": { "x": 538, "y": 71, "w": 398, "h": 491 }, "playing": { "x": 44, "y": 603, "w": 431, "h": 458 }, "eating": { "x": 571, "y": 596, "w": 416, "h": 469 }, "sleeping": { "x": 29, "y": 1090, "w": 446, "h": 428 }, "in_love": { "x": 604, "y": 1094, "w": 382, "h": 428 } },
        lastTime: 0,
        
        init() {
            console.log(`Bonjour, je m'appelle ${this.creature.name} !`);
            
            // Lier les boutons d'action
            btnFeed.addEventListener('click', () => showThought(this.creature.feed(), 2));
            btnPlay.addEventListener('click', () => showThought(this.creature.play(), 2));
            dragonElement.addEventListener('click', () => showThought(this.creature.pet()));

            // Lier les boutons de personnalisation
            btnRename.addEventListener('click', () => this.renameCreature());
            btnTeach.addEventListener('click', () => this.teachCreature());
            btnAsk.addEventListener('click', () => this.askCreature());

            // Boucles de sauvegarde et de jeu
            setInterval(() => this.creature.save(), 5000);
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        },
        
        renameCreature() { /* ... (code inchangé) ... */ },
        teachCreature() { /* ... (code inchangé) ... */ },
        askCreature() { /* ... (code inchangé) ... */ },
        gameLoop(currentTime) { /* ... (code inchangé) ... */ },
        render() { /* ... (code inchangé) ... */ }
    };

    // Copier-coller des fonctions restantes de l'objet 'game'
    game.renameCreature = function() { const newName = prompt(`Comment veux-tu m'appeler ?`, this.creature.name); if (newName && newName.trim() !== '') { this.creature.name = newName.trim(); showThought(`Super ! Appelle-moi ${this.creature.name} !`, 4); }};
    game.teachCreature = function() { const key = prompt("Que veux-tu m'apprendre ? (Ex: ma couleur préférée)"); if (!key || key.trim() === '') return; const value = prompt(`D'accord, et quelle est la réponse à "${key}" ?`); if (!value || value.trim() === '') return; this.creature.knowledge[key.trim().toLowerCase()] = value.trim(); showThought(`J'ai appris quelque chose !`, 2);};
    game.askCreature = function() { const question = prompt("Que veux-tu me demander ?"); if (!question || question.trim() === '') return; const answer = this.creature.knowledge[question.trim().toLowerCase()]; if (answer) { showThought(`La réponse à "${question}" est : ${answer}`, 5); } else { showThought(`Désolé, je ne connais pas encore la réponse à ça...`, 3); }};
    game.gameLoop = function(currentTime) { const dt = (currentTime - this.lastTime) / 1000; this.lastTime = currentTime; this.creature.update(dt); this.render(); requestAnimationFrame(this.gameLoop.bind(this)); };
    game.render = function() {
        hungerBarFill.style.width = `${this.creature.hunger}%`; happinessBarFill.style.width = `${this.creature.happiness}%`;
        // Logique de pensée passive
        const now = performance.now();
        if (now - this.creature.lastThoughtTime > 10000) {
            if (this.creature.hunger < 25) { showThought("J'ai un petit creux..."); this.creature.lastThoughtTime = now; }
            else if (this.creature.happiness < 25) { showThought("Je m'ennuie un peu..."); this.creature.lastThoughtTime = now; }
        }
        const currentState = this.creature.state;
        if (this.spritemap[currentState]) {
            const coords = this.spritemap[currentState]; const displayHeight = creatureWorld.clientHeight * 0.45; const displayWidth = displayHeight * (coords.w / coords.h);
            dragonElement.style.width = `${displayWidth}px`; dragonElement.style.height = `${displayHeight}px`;
            const scale = displayWidth / coords.w; const sheetRealWidth = 1024; const sheetRealHeight = 1522;
            dragonElement.style.backgroundSize = `${sheetRealWidth * scale}px ${sheetRealHeight * scale}px`;
            dragonElement.style.backgroundPosition = `-${coords.x * scale}px -${coords.y * scale}px`;
        }
    };

    // Lancer le jeu !
    game.init();
});
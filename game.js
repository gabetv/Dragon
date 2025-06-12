// game.js - Le Moteur du Jeu (avec gestion du profil)

import DragonAI from './dragon_ai.js';

document.addEventListener('DOMContentLoaded', () => {

    // Un seul endroit pour toutes les références aux éléments HTML
    const elements = {
        dragon: document.getElementById('dragon'),
        world: document.getElementById('creature-world'),
        hungerBar: document.getElementById('hunger-bar-fill'),
        happyBar: document.getElementById('happiness-bar-fill'),
        feedBtn: document.getElementById('btn-feed'),
        playBtn: document.getElementById('btn-play'),
        bubble: document.getElementById('thought-bubble'),
        renameBtn: document.getElementById('btn-rename'),
        teachBtn: document.getElementById('btn-teach'),
        askBtn: document.getElementById('btn-ask'),
        profileBtn: document.getElementById('btn-profile'),
        modal: document.getElementById('profile-modal'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalName: document.getElementById('modal-dragon-name'),
        modalLevel: document.getElementById('modal-level'),
        modalXpBar: document.getElementById('modal-xp-bar-fill'),
        modalXpText: document.getElementById('modal-xp-text'),
        modalSkills: document.getElementById('modal-skills-list'),
        colorPicker: document.getElementById('color-picker')
    };

    let thoughtTimeout;
    function showThought(message, duration = 3) {
        if (!message) return;
        clearTimeout(thoughtTimeout);
        elements.bubble.textContent = message;
        elements.bubble.classList.remove('hidden');
        void elements.bubble.offsetWidth;
        elements.bubble.classList.add('visible');
        thoughtTimeout = setTimeout(() => {
            elements.bubble.classList.remove('visible');
        }, duration * 1000);
    }

    const game = {
        creature: new DragonAI(),
        spritemap: { "happy": { "x": 27, "y": 78, "w": 360, "h": 497 }, "sad": { "x": 538, "y": 71, "w": 398, "h": 491 }, "playing": { "x": 44, "y": 603, "w": 431, "h": 458 }, "eating": { "x": 571, "y": 596, "w": 416, "h": 469 }, "sleeping": { "x": 29, "y": 1090, "w": 446, "h": 428 }, "in_love": { "x": 604, "y": 1094, "w": 382, "h": 428 } },
        lastTime: 0,
        
        init() {
            this.bindEvents();
            this.updateDragonColor(); // Applique la couleur sauvegardée au démarrage
            setInterval(() => this.creature.save(), 5000);
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        },

        bindEvents() {
            elements.feedBtn.onclick = () => this.handleAction(this.creature.feed(), this.creature.gainXP(10));
            elements.playBtn.onclick = () => this.handleAction(this.creature.play(), this.creature.gainXP(15));
            elements.dragon.onclick = () => this.handleAction(this.creature.pet(), this.creature.gainXP(5));
            elements.renameBtn.onclick = () => this.renameCreature();
            elements.teachBtn.onclick = () => this.teachCreature();
            elements.askBtn.onclick = () => this.askCreature();
            // Nouveaux événements pour le profil
            elements.profileBtn.onclick = () => this.openProfile();
            elements.modalCloseBtn.onclick = () => this.closeProfile();
            elements.colorPicker.onclick = (e) => {
                if (e.target.classList.contains('color-btn')) {
                    this.changeDragonColor(e.target.dataset.color);
                }
            };
        },

        handleAction(thought, levelUpInfo) {
            showThought(thought, 2);
            if (levelUpInfo) this.announceLevelUp(levelUpInfo);
        },

        announceLevelUp({ message, skill }) {
            setTimeout(() => {
                showThought(message, 3);
                if (skill) {
                    setTimeout(() => { showThought(skill, 5); }, 3100);
                }
            }, 500);
        },

        openProfile() {
            elements.modalName.textContent = this.creature.name;
            elements.modalLevel.textContent = this.creature.level;
            const xpPercent = (this.creature.xp / this.creature.xpToNextLevel) * 100;
            elements.modalXpBar.style.width = `${xpPercent}%`;
            elements.modalXpText.textContent = `${Math.floor(this.creature.xp)} / ${this.creature.xpToNextLevel} XP`;
            
            elements.modalSkills.innerHTML = '';
            if (this.creature.skills.length === 0) {
                elements.modalSkills.innerHTML = '<li>Aucune pour le moment</li>';
            } else {
                this.creature.skills.forEach(skillName => {
                    const li = document.createElement('li');
                    li.textContent = skillName;
                    elements.modalSkills.appendChild(li);
                });
            }
            elements.modal.classList.remove('hidden');
        },

        closeProfile() {
            elements.modal.classList.add('hidden');
        },

        changeDragonColor(color) {
            this.creature.color = color;
            this.updateDragonColor();
        },

        updateDragonColor() {
            let filterValue = 'none';
            if (this.creature.color === 'green') filterValue = 'hue-rotate(90deg) saturate(1.2)';
            else if (this.creature.color === 'blue') filterValue = 'hue-rotate(180deg) saturate(1.5)';
            else if (this.creature.color === 'purple') filterValue = 'hue-rotate(240deg) saturate(1.2)';
            elements.dragon.style.filter = filterValue;
        },

        renameCreature() { const newName = prompt(`Comment veux-tu m'appeler ?`, this.creature.name); if (newName && newName.trim()) { this.creature.name = newName.trim(); showThought(`Super ! Appelle-moi ${this.creature.name} !`, 4); } },
        teachCreature() {
            const key = prompt("Que veux-tu m'apprendre ?"); if (!key) return;
            const value = prompt(`D'accord, et quelle est la réponse à "${key}" ?`); if (!value) return;
            this.creature.knowledge[key.trim().toLowerCase()] = value.trim();
            this.handleAction(`J'ai appris quelque chose !`, this.creature.gainXP(this.creature.hasSkill("Apprentissage Rapide") ? 30 : 20));
        },
        askCreature() { const q = prompt("Que veux-tu me demander ?"); if (!q) return; const answer = this.creature.knowledge[q.trim().toLowerCase()]; showThought(answer ? `La réponse est : ${answer}` : "Désolé, je ne sais pas encore...", 5); },
        
        gameLoop(currentTime) {
            this.creature.update((currentTime - this.lastTime) / 1000);
            this.lastTime = currentTime;
            this.render();
            requestAnimationFrame(this.gameLoop.bind(this));
        },

        render() {
            elements.hungerBar.style.width = `${this.creature.hunger}%`;
            elements.happyBar.style.width = `${this.creature.happiness}%`;
            document.title = `${this.creature.name} - Nv ${this.creature.level}`;
            
            const state = this.creature.state;
            if (this.spritemap[state]) {
                const coords = this.spritemap[state];
                const displayHeight = elements.world.clientHeight * 0.45;
                const displayWidth = displayHeight * (coords.w / coords.h);
                elements.dragon.style.width = `${displayWidth}px`;
                elements.dragon.style.height = `${displayHeight}px`;
                const scale = displayWidth / coords.w;
                const sheetRealWidth = 1024;
                const sheetRealHeight = 1522;
                elements.dragon.style.backgroundSize = `${sheetRealWidth * scale}px ${sheetRealHeight * scale}px`;
                elements.dragon.style.backgroundPosition = `-${coords.x * scale}px -${coords.y * scale}px`;
            }
        }
    };
    
    game.init();
});
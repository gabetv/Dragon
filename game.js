// game.js - Version mise à jour pour l'IA avancée

import DragonAI from './dragon_ai.js';
import * as THREE from './js/three.module.js';
import { OBJLoader } from './js/OBJLoader.js';

document.addEventListener('DOMContentLoaded', () => {

    const elements = {
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

    function speak(text) {
        if (!('speechSynthesis' in window)) { return; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.pitch = 1.3;
        utterance.rate = 1.1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
    }

    function showThought(message, duration = 3, shouldSpeak = true) {
        if (!message) return;

        clearTimeout(thoughtTimeout);
        elements.bubble.textContent = message;
        elements.bubble.classList.remove('hidden');
        void elements.bubble.offsetWidth;
        elements.bubble.classList.add('visible');
        thoughtTimeout = setTimeout(() => {
            elements.bubble.classList.remove('visible');
        }, duration * 1000);

        if (shouldSpeak) {
            speak(message);
        }
    }

    const game = {
        creature: new DragonAI(),
        lastTime: 0,
        clock: new THREE.Clock(),
        // --- NOUVEAU : Timer pour les pensées proactives ---
        proactiveThoughtTimer: 15.0, // Le dragon pensera pour la première fois après 15s

        threeD: {
            scene: null,
            camera: null,
            renderer: null,
            dragonModel: null,
            ambientLight: null,
            directionalLight: null
        },
        
        init() {
            this.initThree();
            this.loadDragonModel();
            this.bindEvents();
            setInterval(() => this.creature.save(), 5000);
            this.lastTime = performance.now();
            this.gameLoop();
        },

        initThree() {
            this.threeD.scene = new THREE.Scene();
            this.threeD.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.threeD.renderer.setSize(elements.world.clientWidth, elements.world.clientHeight);
            this.threeD.renderer.setPixelRatio(window.devicePixelRatio);
            elements.world.appendChild(this.threeD.renderer.domElement);
            const aspect = elements.world.clientWidth / elements.world.clientHeight;
            this.threeD.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
            this.threeD.camera.position.z = 15;
            this.threeD.camera.position.y = 2;
            this.threeD.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            this.threeD.scene.add(this.threeD.ambientLight);
            this.threeD.directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
            this.threeD.directionalLight.position.set(5, 10, 7.5);
            this.threeD.scene.add(this.threeD.directionalLight);
        },

        loadDragonModel() {
            const textureLoader = new THREE.TextureLoader();
            const colorMap = textureLoader.load('assets/texture_diffuse.png');
            const normalMap = textureLoader.load('assets/texture_normal.png');
            const roughnessMap = textureLoader.load('assets/texture_roughness.png');
            const metalnessMap = textureLoader.load('assets/texture_metallic.png');
            const emissiveMap = textureLoader.load('assets/texture_pbr.png');
            colorMap.colorSpace = THREE.SRGBColorSpace;
            emissiveMap.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.MeshStandardMaterial({
                map: colorMap,
                normalMap: normalMap,
                roughnessMap: roughnessMap,
                metalnessMap: metalnessMap,
                emissiveMap: emissiveMap,
                emissive: 0xffffff,
                emissiveIntensity: 0.2
            });
            const loader = new OBJLoader();
            loader.load('assets/dragon.obj', (object) => {
                this.threeD.dragonModel = object;
                object.traverse((child) => { if (child.isMesh) { child.material = material; } });
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3()).length();
                const center = box.getCenter(new THREE.Vector3());
                object.scale.multiplyScalar(10 / size);
                object.position.sub(center);
                this.threeD.scene.add(object);
                this.updateDragonColor(); 
            },
            (xhr) => {},
            (error) => { showThought("Oups, je n'arrive pas à apparaître...", 10, false); });
        },
        
        bindEvents() {
            elements.feedBtn.onclick = () => this.handleAction(this.creature.feed(), this.creature.gainXP(10));
            elements.playBtn.onclick = () => this.handleAction(this.creature.play(), this.creature.gainXP(15));
            this.threeD.renderer.domElement.onclick = () => this.handleAction(this.creature.pet(), this.creature.gainXP(5));
            elements.renameBtn.onclick = () => this.renameCreature();
            elements.teachBtn.onclick = () => this.teachCreature();
            elements.askBtn.onclick = () => this.askCreature();
            elements.profileBtn.onclick = () => this.openProfile();
            elements.modalCloseBtn.onclick = () => this.closeProfile();
            elements.colorPicker.onclick = (e) => {
                if (e.target.classList.contains('color-btn')) { this.changeDragonColor(e.target.dataset.color); }
            };
            window.addEventListener('resize', () => this.onWindowResize());
        },

        handleAction(thought, levelUpInfo) {
            showThought(thought, 2);
            if (levelUpInfo) this.announceLevelUp(levelUpInfo);
        },

        announceLevelUp({ message, skill }) {
            setTimeout(() => {
                showThought(message, 3);
                if (skill) { setTimeout(() => { showThought(skill, 5); }, 3100); }
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
            if (!this.threeD.dragonModel) return;
            let tintColor = 0xffffff;
            if (this.creature.color === 'green') tintColor = 0x90ee90;
            else if (this.creature.color === 'blue') tintColor = 0xadd8e6;
            else if (this.creature.color === 'purple') tintColor = 0xdda0dd;
            this.threeD.dragonModel.traverse((child) => {
                if (child.isMesh) { child.material.color.setHex(tintColor); }
            });
        },

        renameCreature() { const newName = prompt(`Comment veux-tu m'appeler ?`, this.creature.name); if (newName && newName.trim()) { this.creature.name = newName.trim(); showThought(`Super ! Appelle-moi ${this.creature.name} !`, 4); } },
        
        // --- MODIFIÉ : Utilise le nouveau cerveau ---
        teachCreature() {
            const key = prompt("Que veux-tu m'apprendre ?"); if (!key) return;
            const value = prompt(`D'accord, et quelle est la réponse à "${key}" ?`); if (!value) return;
            this.creature.knowledge[key.trim().toLowerCase()] = value.trim();
            const thought = this.creature.brain.getResponse('learn');
            const xpGain = this.creature.gainXP(this.creature.hasSkill("Apprentissage Rapide") ? 30 : 20);
            this.handleAction(thought, xpGain);
        },

        // --- MODIFIÉ : Utilise le nouveau cerveau ---
        askCreature() {
            const q = prompt("Que veux-tu me demander ?"); if (!q) return;
            const answer = this.creature.brain.processQuestion(q);
            showThought(answer, 5);
        },
        
        onWindowResize() {
            const world = elements.world;
            this.threeD.camera.aspect = world.clientWidth / world.clientHeight;
            this.threeD.camera.updateProjectionMatrix();
            this.threeD.renderer.setSize(world.clientWidth, world.clientHeight);
        },

        // --- MODIFIÉ : Gère les pensées proactives ---
        gameLoop() {
            requestAnimationFrame(this.gameLoop.bind(this));
            const deltaTime = this.clock.getDelta();
            
            this.creature.update(deltaTime);
            
            // Logique pour les pensées proactives
            this.proactiveThoughtTimer -= deltaTime;
            if (this.proactiveThoughtTimer <= 0) {
                const thought = this.creature.brain.think();
                if (thought) {
                    showThought(thought, 4, false); // On ne lit pas à voix haute pour ne pas être intrusif
                }
                // Réinitialise le timer pour la prochaine pensée (entre 20 et 35 secondes)
                this.proactiveThoughtTimer = 20 + Math.random() * 15;
            }

            // Animation du dragon
            if (this.threeD.dragonModel) {
                const elapsedTime = this.clock.getElapsedTime();
                this.threeD.dragonModel.position.y = Math.sin(elapsedTime * 1.5) * 0.2;
                if (this.creature.state === 'playing') {
                     this.threeD.dragonModel.rotation.y += deltaTime * 2;
                } else {
                    this.threeD.dragonModel.rotation.y = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.y, 0, deltaTime * 3);
                }
            }
            
            this.renderUI();
            if(this.threeD.renderer && this.threeD.scene && this.threeD.camera){
                 this.threeD.renderer.render(this.threeD.scene, this.threeD.camera);
            }
        },

        renderUI() {
            elements.hungerBar.style.width = `${this.creature.hunger}%`;
            elements.happyBar.style.width = `${this.creature.happiness}%`;
            document.title = `${this.creature.name} - Nv ${this.creature.level}`;
        }
    };
    
    game.init();
});
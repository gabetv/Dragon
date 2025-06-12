// game.js - Version Finale Complète et Corrigée

import DragonAI from './dragon_ai.js';
import { predefinedQuestions, responses } from './personality.js';
import * as THREE from './js/three.module.js';
import { OBJLoader } from './js/OBJLoader.js';

document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        gameContainer: document.getElementById('game-container'),
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
        colorPicker: document.getElementById('color-picker'),
        sunIcon: document.getElementById('sun-icon'),
        moonIcon: document.getElementById('moon-icon'),
        askModal: document.getElementById('ask-modal'),
        askModalCloseBtn: document.getElementById('ask-modal-close-btn'),
        questionsList: document.getElementById('modal-questions-list'),
    };

    let thoughtTimeout;

    function createZParticleCanvas() {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.font = `bold ${size * 0.75}px Fredoka, sans-serif`;
        ctx.fillStyle = 'rgba(240, 248, 255, 0.9)';
        ctx.shadowColor = 'rgba(120, 120, 255, 0.7)';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Z', size / 2, size / 2 + 5);
        return canvas;
    }

    function playSound(soundId) {
        try {
            const sound = document.getElementById(soundId);
            sound.currentTime = 0;
            sound.play();
        } catch (e) {
            console.warn(`Impossible de jouer le son : ${soundId}`, e);
        }
    }

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
        clock: new THREE.Clock(),
        proactiveThoughtTimer: 15.0,
        isNight: false,
        miniGameState: 'IDLE',
        
        threeD: { 
            scene: null, camera: null, renderer: null, dragonModel: null, ambientLight: null, directionalLight: null,
            sleepParticles: [], sleepParticleMaterial: null, sleepParticleTimer: 0,
            ball: null,
            ballTargetPosition: new THREE.Vector3(),
            originalDragonPosition: new THREE.Vector3()
        },
        
        init() {
            this.initThree();
            this.loadDragonModel();
            this.bindEvents();
            this.updateWorldAppearance();
            setInterval(() => this.creature.save(), 5000);
            setTimeout(() => { showThought(this.creature.brain.getResponse('greeting'), 3); }, 1500);
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

            const particleCanvas = createZParticleCanvas();
            const particleTexture = new THREE.CanvasTexture(particleCanvas);
            this.threeD.sleepParticleMaterial = new THREE.SpriteMaterial({ map: particleTexture, transparent: true, depthTest: false });

            const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff4136, roughness: 0.4 });
            this.threeD.ball = new THREE.Mesh(ballGeometry, ballMaterial);

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
            const material = new THREE.MeshStandardMaterial({ map: colorMap, normalMap: normalMap, roughnessMap: roughnessMap, metalnessMap: metalnessMap, emissiveMap: emissiveMap, emissive: 0xffffff, emissiveIntensity: 0.2 });
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
                this.updateWorldAppearance();
            }, (xhr) => {}, (error) => { showThought("Oups, je n'arrive pas à apparaître...", 10, false); });
        },

        bindEvents() {
            elements.feedBtn.onclick = () => { playSound('sfx-eat'); this.handleAction(this.creature.feed(), this.creature.gainXP(10)); };
            elements.playBtn.onclick = () => {
                if (this.miniGameState !== 'IDLE' || this.creature.state === 'sleeping') return;
                this.startFetchGame();
            };
            this.threeD.renderer.domElement.onclick = (event) => this.handleCanvasClick(event);
            elements.renameBtn.onclick = () => this.renameCreature();
            elements.teachBtn.onclick = () => this.teachCreature();
            elements.askBtn.onclick = () => this.openAskModal();
            elements.askModalCloseBtn.onclick = () => this.closeAskModal();
            elements.profileBtn.onclick = () => this.openProfile();
            elements.modalCloseBtn.onclick = () => this.closeProfile();
            elements.colorPicker.onclick = (e) => { if (e.target.classList.contains('color-btn')) { this.changeDragonColor(e.target.dataset.color); } };
            window.addEventListener('resize', () => this.onWindowResize());
            elements.sunIcon.onclick = () => { if (this.isNight) { this.isNight = false; this.updateWorldAppearance(); } };
            elements.moonIcon.onclick = () => { if (!this.isNight) { this.isNight = true; this.updateWorldAppearance(); } };
        },
        
        startFetchGame() {
            this.miniGameState = 'AWAITING_THROW';
            
            const ballDepth = 2;
            const visibleWidth = this.getVisibleWidthAtZ(ballDepth);
            const maxX = (visibleWidth / 2) * 0.8;
            
            const side = Math.random() < 0.5 ? -1 : 1;
            this.threeD.ball.position.set(side * maxX, 0.5, ballDepth);

            this.threeD.scene.add(this.threeD.ball);

            if (this.threeD.dragonModel) {
                this.threeD.dragonModel.lookAt(this.threeD.ball.position);
                this.threeD.originalDragonPosition.copy(this.threeD.dragonModel.position);
            }
            elements.feedBtn.disabled = true;
            elements.playBtn.disabled = true;
            showThought(this.creature.brain.getResponse('play_start'), 3);
        },

        handleCanvasClick(event) {
            if (this.miniGameState === 'AWAITING_THROW') {
                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();
                const rect = this.threeD.renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, this.threeD.camera);
                const intersects = raycaster.intersectObject(this.threeD.ball);
                if (intersects.length > 0) {
                    playSound('sfx-play');
                    this.miniGameState = 'FETCHING';
                    this.threeD.ballTargetPosition.set(-this.threeD.ball.position.x, 0.5, 2);
                }
            } else if (this.miniGameState === 'IDLE') {
                playSound('sfx-click');
                this.handleAction(this.creature.pet(), this.creature.gainXP(5));
            }
        },

        endFetchGame() {
            this.miniGameState = 'IDLE';
            elements.feedBtn.disabled = false;
            elements.playBtn.disabled = false;
            if (this.threeD.dragonModel) {
                this.threeD.dragonModel.rotation.set(0, 0, 0);
            }
            this.handleAction(this.creature.play(), this.creature.gainXP(15));
        },
        
        spawnSleepParticle() {
            if (!this.threeD.dragonModel) return;
            const particle = new THREE.Sprite(this.threeD.sleepParticleMaterial.clone());
            const startPosition = this.threeD.dragonModel.position.clone();
            particle.position.x = startPosition.x + (Math.random() - 0.5) * 1.5;
            particle.position.y = startPosition.y + 3;
            particle.position.z = startPosition.z + (Math.random() - 0.5) * 1.5;
            const scale = 1 + Math.random() * 0.5;
            particle.scale.set(scale, scale, 1);
            particle.userData = { lifetime: 3.0 + Math.random() * 2, velocity: new THREE.Vector3(0, 0.4, 0) };
            this.threeD.scene.add(particle);
            this.threeD.sleepParticles.push(particle);
        },
        updateSleepParticles(dt) {
            for (let i = this.threeD.sleepParticles.length - 1; i >= 0; i--) {
                const particle = this.threeD.sleepParticles[i];
                particle.userData.lifetime -= dt;
                if (particle.userData.lifetime <= 0) {
                    this.threeD.scene.remove(particle);
                    this.threeD.sleepParticles.splice(i, 1);
                } else {
                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(dt));
                    if (particle.userData.lifetime < 1.0) { particle.material.opacity = particle.userData.lifetime; }
                }
            }
        },
        clearSleepParticles() {
            this.threeD.sleepParticles.forEach(p => this.threeD.scene.remove(p));
            this.threeD.sleepParticles = [];
        },

        handleAction(thought, levelUpInfo) { showThought(thought, 2); if (levelUpInfo) this.announceLevelUp(levelUpInfo); },
        
        announceLevelUp({ skill }) {
            setTimeout(() => {
                const levelUpThought = this.creature.brain.getResponse('level_up');
                showThought(`${levelUpThought} Je suis niveau ${this.creature.level} !`, 4);
                if (skill) {
                    setTimeout(() => {
                        showThought(skill, 5);
                    }, 4100);
                }
            }, 500);
        },
        
        openProfile() { elements.modalName.textContent = this.creature.name; elements.modalLevel.textContent = this.creature.level; const xpPercent = (this.creature.xp / this.creature.xpToNextLevel) * 100; elements.modalXpBar.style.width = `${xpPercent}%`; elements.modalXpText.textContent = `${Math.floor(this.creature.xp)} / ${this.creature.xpToNextLevel} XP`; elements.modalSkills.innerHTML = ''; if (this.creature.skills.length === 0) { elements.modalSkills.innerHTML = '<li>Aucune pour le moment</li>'; } else { this.creature.skills.forEach(skillName => { const li = document.createElement('li'); li.textContent = skillName; elements.modalSkills.appendChild(li); }); } elements.modal.classList.remove('hidden'); },
        closeProfile() { elements.modal.classList.add('hidden'); },
        
        openAskModal() { elements.questionsList.innerHTML = ''; predefinedQuestions.forEach(q => { if (this.creature.level >= q.levelRequired) { const questionDiv = document.createElement('div'); questionDiv.classList.add('question-item'); questionDiv.textContent = q.text; questionDiv.onclick = () => { const questionToProcess = q.key || q.text; const answer = this.creature.brain.processQuestion(questionToProcess); showThought(answer, 5); this.closeAskModal(); }; elements.questionsList.appendChild(questionDiv); } }); elements.askModal.classList.remove('hidden'); },
        closeAskModal() { elements.askModal.classList.add('hidden'); },
        
        changeDragonColor(color) {
            this.creature.color = color;
            if (!this.isNight) {
                this.updateDragonColor();
            }
            showThought(this.creature.brain.getResponse('color_change'), 3);
        },
        
        updateDragonColor() { if (!this.threeD.dragonModel) return; let tintColor = 0xffffff; if (this.creature.color === 'green') tintColor = 0x90ee90; else if (this.creature.color === 'blue') tintColor = 0xadd8e6; else if (this.creature.color === 'purple') tintColor = 0xdda0dd; this.threeD.dragonModel.traverse((child) => { if (child.isMesh) { child.material.color.setHex(tintColor); } }); },
        renameCreature() { const newName = prompt(`Comment veux-tu m'appeler ?`, this.creature.name); if (newName && newName.trim()) { this.creature.name = newName.trim(); showThought(`Super ! Appelle-moi ${this.creature.name} !`, 4); } },
        teachCreature() { const key = prompt("Que veux-tu m'apprendre ?"); if (!key) return; const value = prompt(`D'accord, et quelle est la réponse à "${key}" ?`); if (!value) return; this.creature.knowledge[key.trim().toLowerCase()] = value.trim(); const thought = this.creature.brain.getResponse('learn'); const xpGain = this.creature.gainXP(this.creature.hasSkill("Apprentissage Rapide") ? 30 : 20); this.handleAction(thought, xpGain); },
        onWindowResize() {
            const world = elements.world;
            this.threeD.camera.aspect = world.clientWidth / world.clientHeight;
            this.threeD.camera.updateProjectionMatrix();
            this.threeD.renderer.setSize(world.clientWidth, world.clientHeight);
        },

        getVisibleWidthAtZ(depth) {
            const cameraZ = this.threeD.camera.position.z;
            const distance = cameraZ - depth;
            const fovInRadians = THREE.MathUtils.degToRad(this.threeD.camera.fov);
            const visibleHeight = 2 * Math.tan(fovInRadians / 2) * distance;
            return visibleHeight * this.threeD.camera.aspect;
        },

        gameLoop() {
            requestAnimationFrame(this.gameLoop.bind(this));
            const deltaTime = this.clock.getDelta();
            
            if (this.threeD.dragonModel) {
                if (this.miniGameState === 'FETCHING') {
                    this.threeD.ball.position.lerp(this.threeD.ballTargetPosition, deltaTime * 5);
                    this.threeD.dragonModel.lookAt(this.threeD.ball.position);
                    this.threeD.dragonModel.position.lerp(this.threeD.ball.position, deltaTime * 2);
                    if (this.threeD.dragonModel.position.distanceTo(this.threeD.ball.position) < 1.0) {
                        this.miniGameState = 'RETURNING';
                        this.threeD.scene.remove(this.threeD.ball);
                    }
                } else if (this.miniGameState === 'RETURNING') {
                    this.threeD.dragonModel.position.lerp(this.threeD.originalDragonPosition, deltaTime * 2.5);
                    this.threeD.dragonModel.lookAt(0, 1, 5);
                    if (this.threeD.dragonModel.position.distanceTo(this.threeD.originalDragonPosition) < 0.1) {
                        this.endFetchGame();
                    }
                } else {
                    const elapsedTime = this.clock.getElapsedTime(); 
                    if (this.creature.state === 'sleeping') {
                        this.threeD.dragonModel.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
                        this.threeD.dragonModel.rotation.y = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.y, 0, deltaTime * 3);
                        this.threeD.dragonModel.rotation.z = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.z, Math.PI * 0.05, deltaTime);
                    } else if (this.creature.state === 'playing') {
                        this.threeD.dragonModel.rotation.y += deltaTime * 2;
                        this.threeD.dragonModel.position.y = Math.sin(elapsedTime * 1.5) * 0.2;
                        this.threeD.dragonModel.rotation.z = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.z, 0, deltaTime);
                    } else if (this.creature.state === 'sad') {
                        this.threeD.dragonModel.position.y = THREE.MathUtils.lerp(this.threeD.dragonModel.position.y, -0.2, deltaTime);
                        this.threeD.dragonModel.rotation.z = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.z, 0, deltaTime);
                    } else if (this.miniGameState === 'AWAITING_THROW') {
                         this.threeD.dragonModel.lookAt(this.threeD.ball.position);
                    } else {
                        this.threeD.dragonModel.position.y = Math.sin(elapsedTime * 1.5) * 0.2;
                        this.threeD.dragonModel.rotation.y = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.y, 0, deltaTime * 3);
                        this.threeD.dragonModel.rotation.z = THREE.MathUtils.lerp(this.threeD.dragonModel.rotation.z, 0, deltaTime);
                    }
                }
            }

            if (this.miniGameState === 'IDLE') {
                const oldState = this.creature.state;
                this.creature.update(deltaTime);
                const newState = this.creature.state;
                if (newState === 'sleeping' && oldState !== 'sleeping') { showThought("Zzz... Bonne nuit...", 4, false); }
                if (newState !== 'sleeping' && oldState === 'sleeping') { showThought(this.creature.brain.getResponse('wakeup'), 3); }

                this.proactiveThoughtTimer -= deltaTime;
                if (this.proactiveThoughtTimer <= 0) {
                    let thought = null;
                    if (this.creature.hunger < 20 || this.creature.happiness < 20) {
                        thought = this.creature.brain.getResponse('very_sad');
                    } else if (this.creature.happiness > 95) {
                        thought = this.creature.brain.getResponse('very_happy');
                    } else {
                        thought = this.creature.brain.think();
                        if (!thought && Math.random() < 0.25) {
                           thought = this.creature.brain.getResponse('idle_thoughts');
                        }
                    }
                    if (thought) {
                        showThought(thought, 4, false);
                    }
                    this.proactiveThoughtTimer = 15 + Math.random() * 10;
                }
            }

            if (this.creature.state === 'sleeping') {
                this.threeD.sleepParticleTimer -= deltaTime;
                if (this.threeD.sleepParticleTimer <= 0) { this.spawnSleepParticle(); this.threeD.sleepParticleTimer = 1.2; }
            } else {
                if (this.threeD.sleepParticles.length > 0) { this.clearSleepParticles(); }
            }
            this.updateSleepParticles(deltaTime);
            
            elements.teachBtn.disabled = this.creature.state === 'sleeping';
            elements.askBtn.disabled = this.miniGameState !== 'IDLE';

            this.renderUI();
            if (this.threeD.renderer && this.threeD.scene && this.threeD.camera) { this.threeD.renderer.render(this.threeD.scene, this.threeD.camera); }
        },

        updateWorldAppearance() {
            if (!this.threeD.ambientLight || !this.threeD.directionalLight) return;
            if (this.isNight) {
                elements.gameContainer.classList.add('night-theme');
                elements.moonIcon.classList.remove('inactive-icon');
                elements.sunIcon.classList.add('inactive-icon');
                this.threeD.ambientLight.intensity = 0.1;
                this.threeD.directionalLight.intensity = 0.8;
                this.threeD.directionalLight.color.setHex(0xb0c4de);
                if (this.threeD.dragonModel) {
                    this.threeD.dragonModel.traverse(child => {
                        if (child.isMesh) {
                            child.material.emissiveIntensity = 0;
                            child.material.color.setHex(0x101214);
                        }
                    });
                }
            } else {
                elements.gameContainer.classList.remove('night-theme');
                elements.sunIcon.classList.remove('inactive-icon');
                elements.moonIcon.classList.add('inactive-icon');
                this.threeD.ambientLight.intensity = 0.7;
                this.threeD.directionalLight.intensity = 2.0;
                this.threeD.directionalLight.color.setHex(0xffffff);
                if (this.threeD.dragonModel) {
                    this.updateDragonColor(); 
                    this.threeD.dragonModel.traverse(child => {
                        if (child.isMesh) {
                            child.material.emissiveIntensity = 0.2;
                        }
                    });
                }
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
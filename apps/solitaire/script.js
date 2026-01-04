// Basic Three.js Scene Setup
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Starting Solitaire script...");

    // --- GAME STATE & CORE THREE.JS VARS ---
    let scene, camera, renderer;
    let scoreManager, currentScore;
    let deck, tableau, foundations, stock, waste, moveHistory;
    
    // --- TEXTURE & LOADING ---
    let cardTexture; // Will hold the loaded spritesheet
    const loadedTextures = {}; // Cache for loaded textures

    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);

    loadingManager.onLoad = function () {
        console.log("All textures loaded successfully. Building scene...");
        // Now that textures are ready, we can build the parts of the scene that use them.
        createTable();
        dealCards();
        console.log("Scene construction complete.");
    };

    loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log(`Loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal}.`);
    };

    loadingManager.onError = function (url) {
        console.error(`There was an error loading ${url}`);
    };


    // --- SCENE SETUP ---
    function setupScene() {
        console.log("Setting up Scene...");
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(scene.position);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(renderer.domElement);
        } else {
            console.error("Fatal: game-container element not found!");
            return;
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        console.log("Base scene setup complete.");
    }

    // --- PRELOAD ALL TEXTURES ---
    function loadAllTextures() {
        console.log("Beginning texture loading process...");
        const texturesToLoad = {
            cardSpritesheet: 'textures/card_spritesheet.png',
            tableColor: 'textures/brushed_aluminum.jpg',
            tableDisplacement: 'textures/brushed_aluminum_displ.jpg',
            tableNormal: 'textures/brushed_aluminum_norm.jpg',
            tableRoughness: 'textures/brushed_aluminum_spec.jpg',
            tableAo: 'textures/brushed_aluminum_ao.jpg'
        };

        for (const key in texturesToLoad) {
            textureLoader.load(texturesToLoad[key], (texture) => {
                if (key === 'cardSpritesheet') {
                    cardTexture = texture; // Assign to global var for card creation
                }
                loadedTextures[key] = texture;
            });
        }
    }

    // --- TABLE SETUP ---
    function createTable() {
        console.log("Creating table mesh...");
        const tableGeometry = new THREE.PlaneGeometry(20, 12);
        const tableMaterial = new THREE.MeshStandardMaterial({
            map: loadedTextures.tableColor,
            normalMap: loadedTextures.tableNormal,
            roughnessMap: loadedTextures.tableRoughness,
            aoMap: loadedTextures.tableAo,
            displacementMap: loadedTextures.tableDisplacement,
            displacementScale: 0.05,
            metalness: 0.8,
            roughness: 0.2,
        });

        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.rotation.x = -Math.PI / 2;
        table.position.y = -1;
        scene.add(table);
        console.log("Table created and added to scene.");
    }


    // --- GHOST HITBOXES & UI ELEMENTS ---
    let drawStyle = 1; // Default to draw one

    function createHitboxesAndUI() {
        console.log("Creating hitboxes and setting up UI...");
        const tableauGroup = new THREE.Group();
        const foundationGroup = new THREE.Group();
        const stockHitbox = new THREE.Group();

        const hitboxGeometry = new THREE.BoxGeometry(1.5, 2.2, 0.1);
        const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0.5 });

        for (let i = 0; i < 7; i++) {
            const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial.clone());
            hitbox.position.set(-6 + (i * 2), 2, 0);
            hitbox.name = `tableau-${i}`;
            tableauGroup.add(hitbox);
        }

        for (let i = 0; i < 4; i++) {
            const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial.clone());
            hitbox.position.set(1 + (i * 2), 5, 0);
            hitbox.name = `foundation-${i}`;
            foundationGroup.add(hitbox);
        }
        
        const stockBox = new THREE.Mesh(hitboxGeometry, hitboxMaterial.clone());
        stockBox.position.set(-8, 5, 0);
        stockBox.name = 'stock';
        stockHitbox.add(stockBox);

        scene.add(tableauGroup, foundationGroup, stockHitbox);
        
        document.getElementById('draw-style-select').addEventListener('change', (e) => {
            drawStyle = parseInt(e.target.value);
        });
        document.getElementById('new-game-btn').addEventListener('click', () => location.reload());
        document.getElementById('undo-btn').addEventListener('click', () => undoLastMove());
        console.log("Hitboxes and UI are ready.");
    }


    // --- TEXTURE ATLAS & CARD CLASS ---
    const ATLAS_COLS = 13, ATLAS_ROWS = 5, CARD_UV_WIDTH = 1 / ATLAS_COLS, CARD_UV_HEIGHT = 1 / ATLAS_ROWS;

    function getCardFaceMaterial(suit, value) {
        const suitMap = { 'hearts': 0, 'diamonds': 1, 'clubs': 2, 'spades': 3 };
        const valueMap = { 'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12 };
        const u = valueMap[value] * CARD_UV_WIDTH;
        const v = 1 - ((suitMap[suit] + 1) * CARD_UV_HEIGHT);
        
        const faceTexture = cardTexture.clone();
        faceTexture.needsUpdate = true;
        faceTexture.repeat.set(CARD_UV_WIDTH, CARD_UV_HEIGHT);
        faceTexture.offset.set(u, v);
        
        return new THREE.MeshStandardMaterial({ map: faceTexture });
    }

    function getCardBackMaterial() {
        const u = 2 * CARD_UV_WIDTH, v = 1 - ((4 + 1) * CARD_UV_HEIGHT);

        const backTexture = cardTexture.clone();
        backTexture.needsUpdate = true;
        backTexture.repeat.set(CARD_UV_WIDTH, CARD_UV_HEIGHT);
        backTexture.offset.set(u, v);

        return new THREE.MeshStandardMaterial({ map: backTexture });
    }

    class Card {
        constructor(suit, value) {
            this.suit = suit;
            this.value = value;
            // Mesh is created on-demand by the Deck class after textures are loaded.
            this.mesh = this.createCardMesh();
        }
        createCardMesh() {
            const geometry = new THREE.BoxGeometry(1.5, 2.2, 0.05);
            const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
            const materials = [sideMaterial, sideMaterial, sideMaterial, sideMaterial, getCardFaceMaterial(this.suit, this.value), getCardBackMaterial()];
            const mesh = new THREE.Mesh(geometry, materials);
            mesh.userData.card = this;
            return mesh;
        }
    }


    // --- DECK CLASS ---
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    class Deck {
        constructor() {
            this.cards = [];
            this.createDeck();
            this.shuffle();
        }
        createDeck() {
            console.log("Creating deck object...");
            for (const suit of suits) { for (const value of values) { this.cards.push(new Card(suit, value)); } }
            console.log("Deck object created with 52 cards.");
        }
        shuffle() {
            for (let i = this.cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; }
        }
        deal() { return this.cards.pop(); }
    }


    // --- GAME LOGIC ---
    function dealCards() {
        console.log("Dealing cards...");
        deck = new Deck(); // Deck and cards are now created here
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = deck.deal();
                card.mesh.position.set(-6 + (j * 2), 2 - (i * 0.2), 0);
                if (i === j) { card.mesh.rotation.y = Math.PI; }
                tableau[j].push(card);
                scene.add(card.mesh);
            }
        }
        stock = deck.cards;
        stock.forEach(card => card.mesh.visible = false);
        console.log("Card dealing complete.");
    }

    function initGame() {
        console.log("Initializing Solitaire Game...");
        // Initialize state and managers
        tableau = [[], [], [], [], [], [], []];
        foundations = [[], [], [], []];
        stock = [];
        waste = [];
        moveHistory = [];
        currentScore = 0;
        scoreManager = new ScoreManager('solitaire-3d');

        // Setup the non-texture-dependent parts of the world
        setupScene();
        createHitboxesAndUI();
        
        // Start loading textures. The onLoad callback will handle the rest.
        loadAllTextures();

        // Update UI
        document.getElementById('score').innerText = currentScore;
        document.getElementById('high-score').innerText = scoreManager.getHighScore();
        console.log("Game Initialization started. Waiting for textures...");
    }

    function showWinOverlay() {
        const finalScore = `Your Score: ${currentScore}`;
        showOverlay("You Win!", finalScore, [{ text: "Play Again", action: () => location.reload() }]);
    }


    // --- INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null;

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject.name === 'stock') handleStockClick();
            else if (clickedObject.userData.card) handleCardClick(clickedObject.userData.card);
            else if (selectedObject && (clickedObject.name.startsWith('tableau-') || clickedObject.name.startsWith('foundation-'))) handleMove(selectedObject, clickedObject.name);
        }
    }

    function handleCardClick(card) { /* ... selection logic ... */ }
    function handleStockClick() { /* ... stock logic ... */ }
    function isValidMove(cardToMove, destinationName) { /* ... move validation logic ... */ return false; }
    function handleMove(card, destinationName) { /* ... move handling ... */ }
    function findCardPile(card) { /* ... find pile logic ... */ return null; }
    function updateScore(points) {
        currentScore += points;
        document.getElementById('score').innerText = currentScore;
        scoreManager.updateScore(currentScore);
        document.getElementById('high-score').innerText = scoreManager.getHighScore();
    }
    function animateCardMove(card, destinationObject) { /* ... animation logic ... */ }
    function undoLastMove() { /* ... undo logic ... */ }

    window.addEventListener('click', onMouseClick);


    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        if(renderer && scene && camera) renderer.render(scene, camera);
    }

    // --- RESIZE HANDLER ---
    function onWindowResize() {
        if(camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    window.addEventListener('resize', onWindowResize);


    // --- START ---
    initGame();
    animate();
    console.log("Animation loop started.");
});

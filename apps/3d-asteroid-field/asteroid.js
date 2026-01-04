(function() {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene.background = new THREE.Color(0x0a0a0a);
    camera.position.z = 10;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);

    // Player spaceship
    const spaceshipGeometry = new THREE.ConeGeometry(0.5, 1, 8);
    const spaceshipMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const spaceship = new THREE.Mesh(spaceshipGeometry, spaceshipMaterial);
    spaceship.rotation.x = Math.PI / 2;
    scene.add(spaceship);

    // Player movement
    const mouse = new THREE.Vector2();
    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Lasers
    const lasers = [];
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    document.addEventListener('click', () => {
        if (!gameIsOver) {
            const laserGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const laser = new THREE.Mesh(laserGeometry, laserMaterial);
            laser.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
            laser.rotation.x = Math.PI / 2;
            lasers.push(laser);
            scene.add(laser);
        }
    });

    // Asteroids
    const asteroids = [];
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

    function createAsteroid() {
        const asteroidGeometry = new THREE.IcosahedronGeometry(Math.random() * 2 + 0.5, 0);
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.x = (Math.random() - 0.5) * 50;
        asteroid.position.y = (Math.random() - 0.5) * 50;
        asteroid.position.z = -100;
        asteroids.push(asteroid);
        scene.add(asteroid);
    }

    // Game state
    let score = 0;
    let gameIsOver = false;
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    highScoreElement.textContent = getHighScore('asteroid-field');

    restartButton.addEventListener('click', () => {
        resetGame();
    });

    function resetGame() {
        score = 0;
        scoreElement.textContent = score;
        gameIsOver = false;
        gameOverScreen.style.display = 'none';

        // Clear asteroids
        for (let i = asteroids.length - 1; i >= 0; i--) {
            scene.remove(asteroids[i]);
        }
        asteroids.length = 0;

        // Clear lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
            scene.remove(lasers[i]);
        }
        lasers.length = 0;

        // Reset spaceship position
        spaceship.position.set(0, 0, 0);
        
        animate();
    }

    // Game loop
    function animate() {
        if(gameIsOver) return;

        requestAnimationFrame(animate);

        // Spaceship movement
        spaceship.position.x += (mouse.x * 10 - spaceship.position.x) * 0.1;
        spaceship.position.y += (mouse.y * 10 - spaceship.position.y) * 0.1;

        // Laser movement
        for (let i = lasers.length - 1; i >= 0; i--) {
            const laser = lasers[i];
            laser.position.z -= 1;
            if (laser.position.z < -100) {
                scene.remove(laser);
                lasers.splice(i, 1);
            }
        }

        // Asteroid management
        if (Math.random() < 0.1) {
            createAsteroid();
        }

        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            asteroid.position.z += 0.5;

            // Laser-asteroid collision
            for (let j = lasers.length - 1; j >= 0; j--) {
                const laser = lasers[j];
                if (laser.position.distanceTo(asteroid.position) < 2) {
                    scene.remove(asteroid);
                    asteroids.splice(i, 1);
                    scene.remove(laser);
                    lasers.splice(j, 1);
                    score += 10;
                    scoreElement.textContent = score;
                    break; // Move to next asteroid
                }
            }

            // Player-asteroid collision
            if (asteroid && asteroid.position.distanceTo(spaceship.position) < 1) {
                saveHighScore('asteroid-field', score);
                gameIsOver = true;
                finalScoreElement.textContent = score;
                highScoreElement.textContent = getHighScore('asteroid-field');
                gameOverScreen.style.display = 'flex';
            }

            if (asteroid && asteroid.position.z > 20) {
                scene.remove(asteroid);
                asteroids.splice(i, 1);
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- TESTING HOOK ---
    // Expose a function to the global scope for Playwright to trigger the game over state.
    window.triggerGameOverForTesting = () => {
        gameIsOver = true;
        finalScoreElement.textContent = score;
        highScoreElement.textContent = getHighScore('asteroid-field');
        gameOverScreen.style.display = 'flex';
    };
})();

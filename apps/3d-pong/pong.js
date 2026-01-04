// Basic Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color to match the site's theme (dark)
scene.background = new THREE.Color(0x0a0a0a);

camera.position.z = 5;

// Neon material for game elements
const neonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Bright green

// Game elements
const paddleGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
const playerPaddle = new THREE.Mesh(paddleGeometry, neonMaterial);
playerPaddle.position.x = -4;
scene.add(playerPaddle);

const opponentPaddle = new THREE.Mesh(paddleGeometry, neonMaterial);
opponentPaddle.position.x = 4;
scene.add(opponentPaddle);

const ballGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const ball = new THREE.Mesh(ballGeometry, neonMaterial);
scene.add(ball);

// Ball velocity
let ballVelocity = new THREE.Vector3(0.05, 0.02, 0);

// Game boundaries
const topWall = new THREE.BoxGeometry(9, 0.1, 0.1);
const bottomWall = new THREE.BoxGeometry(9, 0.1, 0.1);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });

const topWallMesh = new THREE.Mesh(topWall, wallMaterial);
topWallMesh.position.y = 3;
scene.add(topWallMesh);

const bottomWallMesh = new THREE.Mesh(bottomWall, wallMaterial);
bottomWallMesh.position.y = -3;
scene.add(bottomWallMesh);


// Player controls
document.addEventListener('mousemove', (event) => {
    // Convert mouse position to world coordinates
    const y = (event.clientY / window.innerHeight) * 6 - 3;
    playerPaddle.position.y = -y;
});

// Simple AI for opponent
function updateOpponent() {
    const distance = ball.position.y - opponentPaddle.position.y;
    opponentPaddle.position.y += distance * 0.05; // Smoothing factor
}

// Game loop
function animate() {
    requestAnimationFrame(animate);

    // Move the ball
    ball.position.add(ballVelocity);

    // Bounce off top/bottom walls
    if (ball.position.y > 2.9 || ball.position.y < -2.9) {
        ballVelocity.y *= -1;
    }

    // Bounce off paddles
    if (
        (ball.position.x > 3.9 && ball.position.distanceTo(opponentPaddle.position) < 0.6) ||
        (ball.position.x < -3.9 && ball.position.distanceTo(playerPaddle.position) < 0.6)
    ) {
        ballVelocity.x *= -1;
    }

    // Score and reset
    if (ball.position.x > 5 || ball.position.x < -5) {
        ball.position.set(0, 0, 0);
        ballVelocity.x *= -1;
    }

    updateOpponent();

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

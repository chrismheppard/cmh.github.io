// Basic Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color
scene.background = new THREE.Color(0x0a0a0a);

camera.position.z = 3;

// Create the globe
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

// Mouse interaction variables
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

// Mouse event listeners for rotation
document.addEventListener('mousedown', (e) => {
    isDragging = true;
});
document.addEventListener('mouseup', (e) => {
    isDragging = false;
});
document.addEventListener('mousemove', (e) => {
    const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
    };

    if (isDragging) {
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                toRadians(deltaMove.y * 1),
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));
        
        globe.quaternion.multiplyQuaternions(deltaRotationQuaternion, globe.quaternion);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});


// Game loop
function animate() {
    requestAnimationFrame(animate);

    if (!isDragging) {
        globe.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Helper function to convert degrees to radians
function toRadians(degree) {
    return degree * (Math.PI / 180);
}

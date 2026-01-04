document.addEventListener('DOMContentLoaded', () => {
    let controls;

    // Basic Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Camera Position
    camera.position.set(10, 20, 20);
    camera.lookAt(0, 0, 0);

    // Grid
    const gridSize = 100;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0x444444); // Neon blue grid lines
    scene.add(gridHelper);

    // Invisible plane for raycasting
    const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
    planeGeometry.rotateX(-Math.PI / 2); // Align with the grid
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const objects = [plane]; // Array of objects to intersect with

    function onMouseClick(event) {
        // Normalize mouse coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            addBuilding(intersectPoint);
        }
    }

    function addBuilding(position) {
        const buildingHeight = Math.random() * 10 + 2; // Random height between 2 and 12
        const buildingGeometry = new THREE.BoxGeometry(0.9, buildingHeight, 0.9); // Slightly smaller than grid cell

        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1,
            metalness: 0.5,
            roughness: 0.5,
        });

        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

        // Snap to grid
        building.position.x = Math.round(position.x);
        building.position.z = Math.round(position.z);
        building.position.y = buildingHeight / 2;

        scene.add(building);
    }

    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    window.addEventListener('click', onMouseClick, false);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (controls) {
            controls.update();
        }
        renderer.render(scene, camera);
    }

    // Load OrbitControls and then start the animation
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
    script.onload = () => {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2.1;
        
        // Start the animation loop only after everything is set up
        animate();
    };
    document.body.appendChild(script);
});

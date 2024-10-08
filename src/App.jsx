import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      aspectRatio,
      0.1,
      200
    );
    camera.position.z = 10; // Move the camera further away if needed

    const canvas = document.querySelector('canvas.threejs');
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./src/rh/studio_small_09_4k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;

      const gltfLoader = new GLTFLoader();
      gltfLoader.load('./src/modle/dyson_sphere/scene.gltf', (gltf) => {
        const model = gltf.scene;

        // Calculate bounding box
        const boundingBox = new THREE.Box3().setFromObject(model);
        const center = boundingBox.getCenter(new THREE.Vector3());

        // Scale the model
        const scaleFactor = 6; // Increased scaling factor
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center the model after scaling
        model.updateMatrixWorld(true); // Update world matrix
        const newBoundingBox = new THREE.Box3().setFromObject(model);
        const newCenter = newBoundingBox.getCenter(new THREE.Vector3());
        model.position.sub(newCenter).add(center);

        // Store references to specific spheres
        const spheres = [];

        model.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap = texture;
            child.material.envMapIntensity = 1.0;
            child.material.metalness = 1.0;
            child.material.roughness = 0.2;
            child.needsUpdate = true;

            // Add specific spheres to the array
            if (child.name.includes('Sphere')) {
              spheres.push(child);
            }
          }
        });

        scene.add(model);

        // Load default font and create text
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
          const textGeometry = new TextGeometry('SAPEFORCE', {
            font: font,
            size: 2,
            height: 0.1,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          // Position the text above the model
          textMesh.position.set(-7, 5, 0); // Adjust this position as needed
          scene.add(textMesh);
        });

        function animate() {
          requestAnimationFrame(animate);

          // Rotate each sphere individually
          spheres.forEach((sphere) => {
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.01;
          });

          controls.update();
          renderer.render(scene, camera);
        }

        animate();
      }, undefined, (error) => {
        console.error('An error happened while loading the model:', error);
      });
    });

  }, []);

  return <canvas className='threejs' />;
}

export default App;

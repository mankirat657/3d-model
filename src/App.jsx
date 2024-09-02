import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -1 * aspectRatio,
      1 * aspectRatio,
      1,
      -1,
      0.1,
      200
    );
    camera.position.z = 5;

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

  return <canvas className='threejs' style={{ position: 'relative' }} />
}

export default App;

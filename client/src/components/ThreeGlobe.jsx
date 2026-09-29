import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeGlobe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Adjusted camera distance to fill space exactly like screenshot
    camera.position.z = 3.55;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main Group
    const mainGroup = new THREE.Group();
    // Tilt Earth axis slightly (~18 degrees)
    mainGroup.rotation.z = (18 * Math.PI) / 180;
    scene.add(mainGroup);

    // Earth Sphere
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'
    );
    const bumpTexture = textureLoader.load(
      'https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg'
    );

    const earthGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.035,
      specular: new THREE.Color(0x223344),
      shininess: 15,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    mainGroup.add(earthMesh);

    // Atmospheric Outer Glow Effect
    const atmosphereGeo = new THREE.SphereGeometry(1.52, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.2, 0.5, 0.9, 0.75) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Orbit Trajectory Lines matching screenshot precisely
    const orbitsGroup = new THREE.Group();
    mainGroup.add(orbitsGroup);

    const orbitConfigs = [
      { rx: 1.78, ry: 1.70, rotX: 0.7, rotY: 0.4, rotZ: 0.1, color: 0x38bdf8, op: 0.8 }, // Light Blue
      { rx: 1.86, ry: 1.75, rotX: -0.6, rotY: 1.1, rotZ: -0.3, color: 0x10b981, op: 0.85 }, // Green
      { rx: 1.96, ry: 1.82, rotX: 1.2, rotY: -0.5, rotZ: 0.7, color: 0xef4444, op: 0.75 }, // Red
      { rx: 2.06, ry: 1.88, rotX: -0.8, rotY: -0.8, rotZ: 1.0, color: 0x3b82f6, op: 0.7 }, // Darker Blue
      { rx: 1.90, ry: 1.84, rotX: 0.2, rotY: 1.5, rotZ: -0.7, color: 0x60a5fa, op: 0.65 },
    ];

    orbitConfigs.forEach((cfg) => {
      const curve = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(128);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.op,
      });
      const ellipse = new THREE.Line(geom, mat);
      ellipse.rotation.x = cfg.rotX;
      ellipse.rotation.y = cfg.rotY;
      ellipse.rotation.z = cfg.rotZ;
      orbitsGroup.add(ellipse);
    });

    // Ambient + Directional Sun Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(4.5, 4.5, 4.5);
    scene.add(sunLight);

    // Continuous 360 Animation Loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.0025; // Smooth rotation
      orbitsGroup.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      earthGeo.dispose();
      earthMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function RotatingEarthBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5.2;

    // WebGL Renderer optimized for 60fps performance (capped DPR to 1, powerPreference high-performance)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // Performance boost: disabled expensive MSAA antialiasing
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1); // Performance boost: locked pixel ratio to 1
    container.appendChild(renderer.domElement);

    // Group for Earth + Orbits
    const earthGroup = new THREE.Group();
    earthGroup.position.set(1.8, 0.5, 0);
    earthGroup.rotation.z = (23.4 * Math.PI) / 180;
    scene.add(earthGroup);

    // Texture Loader with low footprint textures
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    );

    // 1. Earth Sphere (Optimized segment count 32x32 for ultra smooth 60fps)
    const earthGeo = new THREE.SphereGeometry(1.15, 32, 32);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 10,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. Optimized Atmosphere Outer Glow
    const atmosphereGeo = new THREE.SphereGeometry(1.18, 32, 32);
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.85, 1.0, 0.8) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 3. Lightweight Multi-Colored Orbit Lines
    const orbitsGroup = new THREE.Group();
    earthGroup.add(orbitsGroup);

    const orbitConfigs = [
      { rx: 1.45, ry: 1.35, rotX: 0.8, rotY: 0.4, rotZ: 0.2, color: 0x00f2fe, speed: 0.003 },
      { rx: 1.55, ry: 1.42, rotX: -0.6, rotY: 1.1, rotZ: -0.4, color: 0x10b981, speed: -0.002 },
      { rx: 1.68, ry: 1.50, rotX: 1.2, rotY: -0.5, rotZ: 0.8, color: 0xff2a5f, speed: 0.004 },
    ];

    const orbitLines = [];
    orbitConfigs.forEach((cfg) => {
      const curve = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(64); // Reduced curve points to 64
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.8,
      });
      const ellipse = new THREE.Line(geom, mat);
      ellipse.rotation.x = cfg.rotX;
      ellipse.rotation.y = cfg.rotY;
      ellipse.rotation.z = cfg.rotZ;
      orbitsGroup.add(ellipse);
      orbitLines.push({ line: ellipse, speed: cfg.speed });
    });

    // Ambient + Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    sunLight.position.set(5, 4, 5);
    scene.add(sunLight);

    // Smooth 60fps Loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      earthMesh.rotation.y += 0.003;
      orbitLines.forEach((item) => {
        item.line.rotation.z += item.speed;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}

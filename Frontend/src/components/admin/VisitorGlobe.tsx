import { useEffect, useRef } from "react";
import * as THREE from "three";

interface VisitorGlobeProps {
  data: { country: string; visits: number }[];
}

// Simple country to Lat/Long mapping for visualization
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "United States": [37.0902, -95.7129],
  "India": [20.5937, 78.9629],
  "United Kingdom": [55.3781, -3.4360],
  "Germany": [51.1657, 10.4515],
  "Canada": [56.1304, -106.3468],
  "France": [46.2276, 2.2137],
  "Australia": [-25.2744, 133.7751],
  "Brazil": [-14.2350, -51.9253],
  "Japan": [36.2048, 138.2529],
  "China": [35.8617, 104.1954],
  "Russia": [61.5240, 105.3188],
  // Add more as needed or default to center
};

export function VisitorGlobe({ data }: VisitorGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Globe
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Inner Solid Globe
    const innerGeo = new THREE.SphereGeometry(4.9, 64, 64);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.8,
    });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerGlobe);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 15;

    // Plot Points
    const latLongToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new THREE.Vector3(x, y, z);
    };

    data.forEach(item => {
      const coords = COUNTRY_COORDS[item.country] || [0, 0];
      const pos = latLongToVector3(coords[0], coords[1], 5);
      
      const dotGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      globe.add(dot);

      // Simple "ping" ring
      const ringGeo = new THREE.RingGeometry(0.15, 0.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globe.add(ring);
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    const currentContainer = containerRef.current;
    return () => {
      currentContainer?.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse(obj => {
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
          if ((obj as THREE.Mesh).material) {
              const mat = (obj as THREE.Mesh).material;
              if (Array.isArray(mat)) {
                mat.forEach(m => m.dispose());
              } else {
                mat.dispose();
              }
          }
      });
      scene.clear();
    };
  }, [data]);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-500 uppercase tracking-widest backdrop-blur-sm">
           Live_Visitor_Cluster_Map
        </div>
      </div>
    </div>
  );
}

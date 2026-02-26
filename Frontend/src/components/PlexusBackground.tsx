/**
 * ============================================
 * PLEXUS BACKGROUND COMPONENT
 * ============================================
 * 
 * A high-performance 3D particle cloud with:
 * - BufferGeometry for GPU-optimized particles
 * - Dynamic line connections between nearby points
 * - Smooth 3D rotation animation
 * - Mouse-based parallax tilt effect
 * - Accessibility (reduced motion support)
 * - Performance optimization (mobile, visibility API)
 * - Configurable via props
 * 
 * Built with Three.js and React
 * ============================================
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// ============================================
// TYPES & INTERFACES
// ============================================

interface PlexusConfig {
    particleCount: number;
    particleSize: number;
    particleColor: number;
    connectionDistance: number;
    lineColor: number;
    lineOpacity: number;
    cloudSpread: { x: number; y: number; z: number };
    rotationSpeed: { x: number; y: number };
    parallaxIntensity: number;
    parallaxSmoothing: number;
}

interface PlexusBackgroundProps {
    /** Number of particles (auto-reduced on mobile) */
    particleCount?: number;
    /** Particle color in hex format */
    particleColor?: number;
    /** Line connection color in hex format */
    lineColor?: number;
    /** Enable sci-fi color scheme (cyan particles, purple lines) */
    sciFiTheme?: boolean;
    /** Disable all animations */
    static?: boolean;
}

interface ParticleVelocity {
    x: number;
    y: number;
    z: number;
}

// ============================================
// DEFAULT CONFIGURATION
// ============================================

const DEFAULT_CONFIG: PlexusConfig = {
    particleCount: 300,
    particleSize: 2,
    particleColor: 0xffffff,
    connectionDistance: 150,
    lineColor: 0xffffff,
    lineOpacity: 0.15,
    cloudSpread: { x: 800, y: 600, z: 400 },
    rotationSpeed: { x: 0.00008, y: 0.00012 },
    parallaxIntensity: 0.0003,
    parallaxSmoothing: 0.05
};

// Sci-Fi color scheme
const SCIFI_COLORS = {
    particleColor: 0x00d4ff,  // Cyan
    lineColor: 0xa855f7       // Purple
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if device is mobile
 */
const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};

// ============================================
// MAIN COMPONENT
// ============================================

export const PlexusBackground: React.FC<PlexusBackgroundProps> = ({
    particleCount,
    particleColor,
    lineColor,
    sciFiTheme = true,
    static: isStatic = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const plexusGroupRef = useRef<THREE.Group | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);
    const linesRef = useRef<THREE.LineSegments | null>(null);
    const velocitiesRef = useRef<ParticleVelocity[]>([]);
    const animationIdRef = useRef<number>(0);
    const isVisibleRef = useRef<boolean>(true);

    // Mouse tracking
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0, y: 0 });
    const currentRotationRef = useRef({ x: 0, y: 0 });

    // Build configuration with props, responsive adjustments, and accessibility
    const config = useMemo((): PlexusConfig => {
        const reducedMotion = prefersReducedMotion();
        const isMobile = isMobileDevice();

        // Determine colors
        const colors = sciFiTheme
            ? { particle: particleColor ?? SCIFI_COLORS.particleColor, line: lineColor ?? SCIFI_COLORS.lineColor }
            : { particle: particleColor ?? DEFAULT_CONFIG.particleColor, line: lineColor ?? DEFAULT_CONFIG.lineColor };

        // Calculate particle count (reduce on mobile)
        const baseCount = particleCount ?? DEFAULT_CONFIG.particleCount;
        const adjustedCount = isMobile ? Math.floor(baseCount * 0.5) : baseCount;

        return {
            ...DEFAULT_CONFIG,
            particleCount: adjustedCount,
            particleColor: colors.particle,
            lineColor: colors.line,
            // Disable animations if reduced motion preferred or static prop
            rotationSpeed: (reducedMotion || isStatic)
                ? { x: 0, y: 0 }
                : DEFAULT_CONFIG.rotationSpeed,
            parallaxIntensity: (reducedMotion || isStatic)
                ? 0
                : DEFAULT_CONFIG.parallaxIntensity,
            // Reduce connection distance on mobile for performance
            connectionDistance: isMobile ? 100 : DEFAULT_CONFIG.connectionDistance
        };
    }, [particleCount, particleColor, lineColor, sciFiTheme, isStatic]);

    // Create particle cloud with BufferGeometry
    const createParticleCloud = useCallback((): THREE.Points => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.particleCount * 3);
        const velocities: ParticleVelocity[] = [];

        for (let i = 0; i < config.particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * config.cloudSpread.x;
            positions[i3 + 1] = (Math.random() - 0.5) * config.cloudSpread.y;
            positions[i3 + 2] = (Math.random() - 0.5) * config.cloudSpread.z;

            velocities.push({
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.2
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        velocitiesRef.current = velocities;

        const material = new THREE.PointsMaterial({
            color: config.particleColor,
            size: config.particleSize,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9
        });

        return new THREE.Points(geometry, material);
    }, [config]);

    // Create line connections
    const createLineConnections = useCallback((): THREE.LineSegments => {
        const maxConnections = config.particleCount * 10;
        const positions = new Float32Array(maxConnections * 6);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setDrawRange(0, 0);

        const material = new THREE.LineBasicMaterial({
            color: config.lineColor,
            transparent: true,
            opacity: config.lineOpacity
        });

        return new THREE.LineSegments(geometry, material);
    }, [config]);

    // Update line connections
    const updateLineConnections = useCallback(() => {
        const particles = particlesRef.current;
        const lines = linesRef.current;
        if (!particles || !lines) return;

        const particlePositions = particles.geometry.attributes.position.array as Float32Array;
        const linePositions = lines.geometry.attributes.position.array as Float32Array;

        let lineIndex = 0;
        let connectionCount = 0;
        const maxDistance = config.connectionDistance;
        const maxDistanceSq = maxDistance * maxDistance; // Optimize: avoid sqrt

        for (let i = 0; i < config.particleCount; i++) {
            const i3 = i * 3;
            const x1 = particlePositions[i3];
            const y1 = particlePositions[i3 + 1];
            const z1 = particlePositions[i3 + 2];

            for (let j = i + 1; j < config.particleCount; j++) {
                const j3 = j * 3;
                const x2 = particlePositions[j3];
                const y2 = particlePositions[j3 + 1];
                const z2 = particlePositions[j3 + 2];

                const dx = x1 - x2;
                const dy = y1 - y2;
                const dz = z1 - z2;
                const distanceSq = dx * dx + dy * dy + dz * dz;

                if (distanceSq < maxDistanceSq) {
                    linePositions[lineIndex++] = x1;
                    linePositions[lineIndex++] = y1;
                    linePositions[lineIndex++] = z1;
                    linePositions[lineIndex++] = x2;
                    linePositions[lineIndex++] = y2;
                    linePositions[lineIndex++] = z2;
                    connectionCount++;
                }
            }
        }

        lines.geometry.setDrawRange(0, connectionCount * 2);
        lines.geometry.attributes.position.needsUpdate = true;
    }, [config]);

    // Animation loop
    const animate = useCallback(() => {
        // Skip if tab is not visible
        if (!isVisibleRef.current) {
            animationIdRef.current = requestAnimationFrame(animate);
            return;
        }

        const plexusGroup = plexusGroupRef.current;
        const particles = particlesRef.current;
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;

        if (!plexusGroup || !particles || !renderer || !scene || !camera) {
            animationIdRef.current = requestAnimationFrame(animate);
            return;
        }

        // Continuous rotation
        plexusGroup.rotation.x += config.rotationSpeed.x;
        plexusGroup.rotation.y += config.rotationSpeed.y;

        // Parallax effect
        currentRotationRef.current.x +=
            (targetRotationRef.current.x - currentRotationRef.current.x) * config.parallaxSmoothing;
        currentRotationRef.current.y +=
            (targetRotationRef.current.y - currentRotationRef.current.y) * config.parallaxSmoothing;

        plexusGroup.rotation.x += currentRotationRef.current.x;
        plexusGroup.rotation.y += currentRotationRef.current.y;

        // Particle movement (skip if reduced motion)
        if (config.rotationSpeed.x !== 0 || config.rotationSpeed.y !== 0) {
            const positions = particles.geometry.attributes.position.array as Float32Array;
            const velocities = velocitiesRef.current;

            for (let i = 0; i < config.particleCount; i++) {
                const i3 = i * 3;

                positions[i3] += velocities[i].x;
                positions[i3 + 1] += velocities[i].y;
                positions[i3 + 2] += velocities[i].z;

                // Boundary check
                if (Math.abs(positions[i3]) > config.cloudSpread.x / 2) velocities[i].x *= -1;
                if (Math.abs(positions[i3 + 1]) > config.cloudSpread.y / 2) velocities[i].y *= -1;
                if (Math.abs(positions[i3 + 2]) > config.cloudSpread.z / 2) velocities[i].z *= -1;
            }

            particles.geometry.attributes.position.needsUpdate = true;
        }

        // Update connections
        updateLineConnections();

        // Render
        renderer.render(scene, camera);

        animationIdRef.current = requestAnimationFrame(animate);
    }, [config, updateLineConnections]);

    // Initialize Three.js scene
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            2000
        );
        camera.position.z = 500;
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create plexus group
        const plexusGroup = new THREE.Group();
        plexusGroupRef.current = plexusGroup;

        // Create particles and lines
        const particles = createParticleCloud();
        particlesRef.current = particles;
        plexusGroup.add(particles);

        const lines = createLineConnections();
        linesRef.current = lines;
        plexusGroup.add(lines);

        scene.add(plexusGroup);

        // Event handlers
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (config.parallaxIntensity === 0) return;

            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;

            targetRotationRef.current.x = mouseRef.current.y * config.parallaxIntensity * 100;
            targetRotationRef.current.y = mouseRef.current.x * config.parallaxIntensity * 100;
        };

        // Visibility API - pause when tab not visible
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start animation
        animationIdRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            cancelAnimationFrame(animationIdRef.current);

            particles.geometry.dispose();
            (particles.material as THREE.PointsMaterial).dispose();
            lines.geometry.dispose();
            (lines.material as THREE.LineBasicMaterial).dispose();

            renderer.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [createParticleCloud, createLineConnections, animate, config.parallaxIntensity]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[-1]"
            style={{ background: '#000000' }}
            aria-hidden="true"
            role="presentation"
        />
    );
};

export default PlexusBackground;

"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

// ===================== 常量与配置 =====================

const CYLINDER_PARAMS = {
    count: 2000,
    topRadius: 30,        // 顶部（宽端）半径
    bottomRadius: 3,      // 底部（尖端）半径
    height: 160,
    surfaceThickness: 3,
    ringRatio: 0.05,
    ringHeight: 4,
};

// 亮色粒子调色板（避免深色，与暗色背景形成对比）
const BRIGHT_COLORS: [number, number, number][] = [
    [1.0, 0.95, 0.4],   // 黄色
    [0.4, 0.7, 1.0],    // 蓝色
    [1.0, 0.7, 0.4],    // 琥珀色
    [0.4, 1.0, 0.95],   // 青色
    [0.5, 1.0, 0.5],    // 绿色
    [1.0, 0.6, 0.2],    // 橙色
    [1.0, 0.35, 0.35],  // 红色
    [0.8, 0.4, 1.0],    // 紫色
    [1.0, 0.5, 0.8],    // 粉色
];

const SHUTTLE_CONFIG = {
    modelPath: "/three/space_plane.glb",
    scale: [2, 2, 2] as [number, number, number],
    position: [-60, 0, -20] as [number, number, number],
    rotation: [-1.5, -0.4, -0.6] as [number, number, number]
};

const CAMERA_CONFIG = {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 95, 0.01] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
};

// ===================== 着色器 =====================

const VERTEX_SHADER = `
    uniform float uTime;
    uniform float uSize;
    attribute float aSize;
    attribute vec3 aColor;
    varying vec3 vColor;

    void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        // 圆锥体绕Y轴旋转，底部(尖端)角速度最快，顶部最慢
        float angle = uTime * 0.08;
        float t = clamp((modelPosition.y + 80.0) / 160.0, 0.0, 1.0);
        float heightSpeed = 1.0 + (1.0 - t) * (1.0 - t) * 5.0;
        angle *= heightSpeed;

        float cosA = cos(angle);
        float sinA = sin(angle);
        float newX = modelPosition.x * cosA - modelPosition.z * sinA;
        float newZ = modelPosition.x * sinA + modelPosition.z * cosA;
        modelPosition.x = newX;
        modelPosition.z = newZ;

        vec4 viewPosition = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * viewPosition;

        gl_PointSize = aSize * uSize * (80.0 / -viewPosition.z);

        vColor = aColor;
    }
`;

const FRAGMENT_SHADER = `
    uniform sampler2D uTexture;
    varying vec3 vColor;

    void main() {
        // 距离中心越远越暗，模拟自发光光晕
        float dist = length(gl_PointCoord - vec2(0.5));
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 1.5);

        // 核心区域额外叠加白光，快速衰减
        float core = 1.0 - smoothstep(0.0, 0.15, dist);
        core = pow(core, 2.0);

        vec4 textureColor = texture2D(uTexture, gl_PointCoord);
        vec3 finalColor = vColor * glow * 4.0 + vec3(core * 3.0);
        gl_FragColor = vec4(finalColor, glow) * textureColor;
    }
`;

// ===================== 工具函数 =====================

/** 创建粒子圆形纹理（Canvas 径向渐变，紫色系） */
const createParticleTexture = (THREE: typeof import("three")) => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);

        // 中心白亮 → 紫色 → 透明
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.1, "rgba(200, 180, 255, 1)");
        gradient.addColorStop(0.3, "rgba(139, 92, 246, 0.8)");
        gradient.addColorStop(0.6, "rgba(99, 102, 241, 0.3)");
        gradient.addColorStop(1, "rgba(67, 56, 202, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
};

/** 生成圆锥星环粒子数据（底部尖端、顶部宽端） */
const generateCylinderParticles = (params: typeof CYLINDER_PARAMS) => {
    const { count, topRadius, bottomRadius, height, surfaceThickness, ringRatio, ringHeight } = params;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const ringCount = Math.floor(count * ringRatio);
    const halfH = height / 2;

    for (let i = 0; i < count; i++) {
        const isRing = i < ringCount;
        const angle = Math.random() * Math.PI * 2;

        // 腰部光环粒子集中在圆锥底部（尖端），表面粒子均匀分布在高度方向
        const y = isRing
            ? -halfH + Math.random() * ringHeight
            : (Math.random() - 0.5) * height;

        // 圆锥半径：底部(y=-halfH)小，顶部(y=+halfH)大
        const t = (y + halfH) / height; // 0=底部, 1=顶部
        const baseR = bottomRadius + t * (topRadius - bottomRadius);
        const r = baseR + (Math.random() - 0.5) * surfaceThickness;

        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(angle) * r;

        if (isRing) {
            sizes[i] = Math.random() * 3 + 2;
        } else {
            sizes[i] = Math.random() * 2.5 + 1;
        }

        // 从亮色调色板中随机取色
        const colorIdx = Math.floor(Math.random() * BRIGHT_COLORS.length);
        const baseColor = BRIGHT_COLORS[colorIdx];
        colors[i * 3] = baseColor[0];
        colors[i * 3 + 1] = baseColor[1];
        colors[i * 3 + 2] = baseColor[2];
    }

    return { positions, sizes, colors };
};

/** 创建场景（灯光 + 背景图） */
const setupScene = async (THREE: typeof import("three")) => {
    const { TextureLoader } = await import("three");
    const scene = new THREE.Scene();

    const bgTexture = await new TextureLoader().loadAsync("/imgs/2k_stars_milky_way.png");
    scene.background = bgTexture;

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    return scene;
};

/** 创建摄像机 */
const setupCamera = (THREE: typeof import("three")) => {
    const camera = new THREE.PerspectiveCamera(
        CAMERA_CONFIG.fov,
        window.innerWidth / window.innerHeight,
        CAMERA_CONFIG.near,
        CAMERA_CONFIG.far
    );
    camera.position.set(...CAMERA_CONFIG.position);
    camera.lookAt(...CAMERA_CONFIG.lookAt);
    return camera;
};

/** 创建渲染器 */
const setupRenderer = (THREE: typeof import("three"), canvas: HTMLCanvasElement) => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
};

/** 加载航天飞机模型 */
const loadShuttle = async (scene: THREE.Scene): Promise<THREE.Group | null> => {
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { DRACOLoader } = await import("three/addons/loaders/DRACOLoader.js");

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/");
    loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve) => {
        loader.load(
            SHUTTLE_CONFIG.modelPath,
            (gltf) => {
                const shuttleModel = gltf.scene;
                shuttleModel.scale.set(...SHUTTLE_CONFIG.scale);
                shuttleModel.position.set(...SHUTTLE_CONFIG.position);
                shuttleModel.rotation.set(...SHUTTLE_CONFIG.rotation);
                // 确保飞机渲染在粒子之上：设为透明队列 + 高 renderOrder
                shuttleModel.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.renderOrder = 1;
                        if (mesh.material) {
                            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                            materials.forEach((mat) => {
                                mat.transparent = true;
                                mat.depthWrite = true;
                            });
                        }
                    }
                });
                scene.add(shuttleModel);
                console.log("✅ 飞机加载成功");
                resolve(shuttleModel);
            },
            (xhr) => console.log(`加载中: ${(xhr.loaded / xhr.total) * 100}%`),
            (err) => {
                console.error("❌ 加载失败", err);
                resolve(null);
            }
        );
    });
};

/** 创建圆锥星环粒子系统 */
const createCylinderGalaxy = (THREE: typeof import("three")) => {
    const { positions, sizes, colors } = generateCylinderParticles(CYLINDER_PARAMS);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 3.5 },
            uTexture: { value: createParticleTexture(THREE) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    return new THREE.Points(geometry, material);
};

// ===================== 主组件 =====================

const ThreeBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let renderer: THREE.WebGLRenderer;
        let particles: THREE.Points;
        let animationId: number;
        let shuttle: THREE.Group | null = null;

        const initThree = async () => {
            const THREE = await import("three");

            if (!canvasRef.current) {
                return;
            }

            scene = await setupScene(THREE);
            camera = setupCamera(THREE);
            renderer = setupRenderer(THREE, canvasRef.current);

            shuttle = await loadShuttle(scene);

            particles = createCylinderGalaxy(THREE);
            scene.add(particles);

            // 动画循环
            const animate = () => {
                animationId = requestAnimationFrame(animate);
                if (shuttle) {
                    shuttle.position.y += Math.sin(Date.now() * 0.005) * 0.01;
                }
                const material = particles.material as THREE.ShaderMaterial;
                material.uniforms.uTime.value += 0.01;
                renderer.render(scene, camera);
            };

            animate();

            // 窗口大小调整
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
            };
        };

        const timer = setTimeout(() => {
            initThree();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (renderer) {
                renderer.dispose();
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0"
        />
    );
};

export default ThreeBackground;

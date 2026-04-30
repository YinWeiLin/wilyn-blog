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
    rotation: [-1.5, -0.4, -0.6] as [number, number, number],
    // 三个尾焰喷口的本地偏移（相对于飞机模型原点）
    flames: [
        { offset: [0, -1, 18.2] as [number, number, number] },   // 中间喷口
        { offset: [-1.5, -3.5, 18.2] as [number, number, number] }, // 左喷口
        { offset: [1.5, -3.5, 18.2] as [number, number, number] },  // 右喷口
    ],
};

const FLAME_CONFIG = {
    count: 6000,           // 每个喷口的粒子数
    length: 8,             // 尾焰长度
    baseRadius: 0.15,      // 尖端半径
    endRadius: 1.2,        // 底面半径
    color: [0.6, 0.8, 1.0] as [number, number, number], // 液氢蓝
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
        float heightSpeed = 0.2 + (1.0 - t) * (1.0 - t) * 2.0;
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

// ===================== 尾焰着色器 =====================

const FLAME_VERTEX_SHADER = `
    uniform float uTime;
    uniform float uSize;
    attribute float aSize;
    attribute float aProgress;  // 粒子静态进度，用于径向特征
    attribute float aOffset;    // 粒子时间偏移，让流动不同步
    varying float vProgress;

    void main() {
        // 流动进度：5s 一个周期，从粗端(t=1)流向细端(t=0)
        float cycle = uTime / 5.0;
        float flow = 1.0 - fract(cycle + aOffset);
        float t = flow;

        // 沿 -Z 方向喷射（长度=8.0，与 FLAME_CONFIG.length 一致）
        float z = -t * 8.0;

        // 圆锥半径（baseRadius=0.15, endRadius=1.2，与 FLAME_CONFIG 一致）
        float r = 0.15 + t * 1.05;

        // 径向分布：底面粒子贴表面，其余填充内部
        float currentAngle = atan(position.y, position.x);
        float isSurface = step(0.7, aProgress);
        float offsetR = mix(r * sqrt(fract(aOffset * 7.31)), r * (0.85 + fract(aOffset * 3.17) * 0.15), isSurface);

        vec3 pos = vec3(cos(currentAngle) * offsetR, sin(currentAngle) * offsetR, z);

        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * viewPosition;

        float progressScale = 1.0 + t * 2.0;
        gl_PointSize = aSize * uSize * progressScale * (80.0 / -viewPosition.z);

        vProgress = t;
    }
`;

const FLAME_FRAGMENT_SHADER = `
    uniform sampler2D uTexture;
    uniform vec3 uFlameColor;
    varying float vProgress;

    void main() {
        float dist = length(gl_PointCoord - vec2(0.5));

        // 大光晕
        float halo = 1.0 - smoothstep(0.0, 0.5, dist);

        // 粗端(t=1)更亮，细端(t=0)更暗
        float fade = pow(vProgress, 1.5);

        vec4 textureColor = texture2D(uTexture, gl_PointCoord);
        vec3 finalColor = uFlameColor * halo * 4.0 * fade;
        float alpha = halo * fade;
        gl_FragColor = vec4(finalColor, alpha) * textureColor;
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

/** 创建液氢蓝尾焰纹理（Canvas 径向渐变） */
const createFlameTexture = (THREE: typeof import("three")) => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);

        // 中心白亮 → 液氢淡蓝 → 透明
        gradient.addColorStop(0, "rgba(230, 245, 255, 1)");
        gradient.addColorStop(0.1, "rgba(180, 220, 255, 1)");
        gradient.addColorStop(0.3, "rgba(130, 190, 255, 0.8)");
        gradient.addColorStop(0.6, "rgba(80, 150, 240, 0.3)");
        gradient.addColorStop(1, "rgba(40, 100, 200, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
};

/** 生成单个尾焰喷口的粒子数据（圆锥形，尖端细→底面粗，沿 -Z 方向喷射） */
const generateFlameParticles = (config: typeof FLAME_CONFIG) => {
    const { count, length, baseRadius, endRadius } = config;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const progresses = new Float32Array(count);
    const offsets = new Float32Array(count);

    const baseCount = Math.floor(count * 0.7); // 70% 粒子集中在粗端（底面）

    for (let i = 0; i < count; i++) {
        const isBase = i < baseCount;
        let t: number;

        if (isBase) {
            // 粗端：progress 集中在 0.5~1.0
            t = 0.5 + Math.random() * 0.5;
        } else {
            // 其余粒子：分布在 0~0.5（细端部分）
            t = Math.random() * 0.5;
        }
        progresses[i] = t;

        // 每个粒子的时间偏移，让流动不同步
        offsets[i] = Math.random();

        // 沿 -Z 方向喷射
        const z = -t * length;

        // 圆锥半径：尖端细(baseRadius)→底面粗(endRadius)
        const r = baseRadius + t * (endRadius - baseRadius);
        const angle = Math.random() * Math.PI * 2;

        if (isBase) {
            // 底面附近粒子：贴在圆锥表面
            const surfaceR = r * (0.85 + Math.random() * 0.15);
            positions[i * 3] = Math.cos(angle) * surfaceR;
            positions[i * 3 + 1] = Math.sin(angle) * surfaceR;
            positions[i * 3 + 2] = z;
        } else {
            // 其余粒子：均匀填充圆锥体积
            const offsetR = r * Math.sqrt(Math.random());
            positions[i * 3] = Math.cos(angle) * offsetR;
            positions[i * 3 + 1] = Math.sin(angle) * offsetR;
            positions[i * 3 + 2] = z;
        }

        // 底面附近粒子偏小，其余尖端小底面大
        if (isBase) {
            sizes[i] = 0.3 + Math.random() * 0.5;
        } else {
            sizes[i] = t * 2.0 + Math.random() * 0.5;
        }
    }

    return { positions, sizes, progresses, offsets };
};

/** 创建单个尾焰粒子系统 */
const createFlame = (THREE: typeof import("three")) => {
    const { positions, sizes, progresses, offsets } = generateFlameParticles(FLAME_CONFIG);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aProgress", new THREE.BufferAttribute(progresses, 1));
    geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader: FLAME_VERTEX_SHADER,
        fragmentShader: FLAME_FRAGMENT_SHADER,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 3.5 },
            uTexture: { value: createFlameTexture(THREE) },
            uFlameColor: { value: new THREE.Vector3(...FLAME_CONFIG.color) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    // 尾焰渲染层级高于飞机(1)，确保尾焰不会被飞机遮挡
    points.renderOrder = 2;
    return points;
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
        const flames: THREE.Points[] = [];

        const initThree = async () => {
            const THREE = await import("three");

            if (!canvasRef.current) {
                return;
            }

            scene = await setupScene(THREE);
            camera = setupCamera(THREE);
            renderer = setupRenderer(THREE, canvasRef.current);

            shuttle = await loadShuttle(scene);

            // 飞机加载成功后，创建 3 个尾焰并挂载到飞机 Group 上
            if (shuttle) {
                for (const flameConfig of SHUTTLE_CONFIG.flames) {
                    const flame = createFlame(THREE);
                    flame.position.set(...flameConfig.offset);
                    shuttle.add(flame);
                    flames.push(flame);
                }
            }

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
                // 更新尾焰 shader 时间
                for (const flame of flames) {
                    const flameMat = flame.material as THREE.ShaderMaterial;
                    flameMat.uniforms.uTime.value += 0.01;
                }
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

"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

interface ThreeBackgroundProps {
    isDark: boolean;
}

// 扩展 Window 类型以支持主题更新函数
declare global {
    interface Window {
        __updateParticleTheme?: (isDarkMode: boolean) => void;
    }
}

const ThreeBackground = ({ isDark }: ThreeBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let renderer: THREE.WebGLRenderer;
        let particles: THREE.Points;
        let animationId: number;

        const initThree = async () => {
            const THREE = await import("three");

            if (!canvasRef.current) {
                return;
            }

            console.log("Three.js 初始化开始...");

            // 场景设置
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.z = 50;

            renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current,
                alpha: true,
                antialias: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);

            // 创建粒子系统
            const particleCount = 1000;
            const positions = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 150;
                positions[i + 1] = (Math.random() - 0.5) * 150;
                positions[i + 2] = (Math.random() - 0.5) * 150;

                velocities[i] = (Math.random() - 0.5) * 0.02;
                velocities[i + 1] = (Math.random() - 0.5) * 0.02;
                velocities[i + 2] = (Math.random() - 0.5) * 0.02;
            }

            // 为每个粒子设置随机大小（3-7之间）
            for (let i = 0; i < particleCount; i++) {
                sizes[i] = Math.random() * 12 + 3;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

            // 创建球形纹理（有光照效果）
            const createParticleTexture = (isDarkMode: boolean) => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // 绘制球形高光效果
                    const gradient = ctx.createRadialGradient(28, 28, 0, 32, 32, 32);

                    if (isDarkMode) {
                        // 暗色主题：蓝白色系（明亮、清透）
                        gradient.addColorStop(0, 'rgba(200, 220, 255, 1)');
                        gradient.addColorStop(0.2, 'rgba(96, 165, 250, 1)');
                        gradient.addColorStop(0.6, 'rgba(59, 130, 246, 1)');
                        gradient.addColorStop(0.9, 'rgba(37, 99, 235, 0.8)');
                        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
                    } else {
                        // 亮色主题：深蓝紫色系（深邃、柔和）
                        gradient.addColorStop(0, 'rgba(139, 92, 246, 1)');    // 紫色高光
                        gradient.addColorStop(0.2, 'rgba(99, 102, 241, 1)');  // 靛蓝
                        gradient.addColorStop(0.6, 'rgba(79, 70, 229, 1)');   // 深蓝紫
                        gradient.addColorStop(0.9, 'rgba(67, 56, 202, 0.8)'); // 更深紫
                        gradient.addColorStop(1, 'rgba(67, 56, 202, 0)');     // 透明边缘
                    }

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(32, 32, 32, 0, Math.PI * 2);
                    ctx.fill();
                }
                return new THREE.CanvasTexture(canvas);
            };

            // 获取初始主题状态（通过闭包访问外部 isDark）
            const texture = createParticleTexture(isDark);

            const material = new THREE.PointsMaterial({
                size: 1,
                map: texture,
                transparent: true,
                sizeAttenuation: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            // 动画循环
            const animate = () => {
                animationId = requestAnimationFrame(animate);

                const positions = particles.geometry.attributes.position.array;

                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];

                    if (Math.abs(positions[i]) > 50) {
                        velocities[i] *= -1;
                    }
                    if (Math.abs(positions[i + 1]) > 50) {
                        velocities[i + 1] *= -1;
                    }
                    if (Math.abs(positions[i + 2]) > 50) {
                        velocities[i + 2] *= -1;
                    }
                }

                particles.geometry.attributes.position.needsUpdate = true;
                particles.rotation.y += 0.001;

                renderer.render(scene, camera);
            };

            animate();
            console.log("Three.js 初始化完成！粒子数量:", particleCount);

            // 窗口大小调整
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener("resize", handleResize);

            // 主题切换处理
            const updateParticleColor = (isDarkMode: boolean) => {
                if (!particles) {
                    return;
                }
                const newTexture = createParticleTexture(isDarkMode);
                const material = particles.material as THREE.PointsMaterial;
                material.map = newTexture;
                material.needsUpdate = true;
            };

            // 暴露给外部的更新函数
            window.__updateParticleTheme = updateParticleColor;

            return () => {
                window.removeEventListener("resize", handleResize);
            };
        };

        // 延迟加载 Three.js
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
            delete window.__updateParticleTheme;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 只在组件挂载时初始化一次

    // 监听主题变化，更新粒子颜色
    useEffect(() => {
        if (window.__updateParticleTheme) {
            window.__updateParticleTheme(isDark);
        }
    }, [isDark]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 opacity-60 dark:opacity-40"
            style={{ pointerEvents: "none" }}
        />
    );
};

export default ThreeBackground;

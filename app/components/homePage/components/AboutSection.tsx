const AboutSection = () => {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
            <div className="w-full max-w-4xl">
                <h2 className="mb-8 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                    关于本站
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <p>
                        这是一个基于 Next.js 构建的个人赛博空间，用于记录技术探索、编程思考、学习笔记和生活感悟。
                    </p>
                    <p>
                        在这座赛博宫殿里，你可以找到关于 React、TypeScript、Next.js 等现代前端技术的分享，
                        也能看到我的生活日常、思维碎片和个人成长轨迹。
                    </p>
                    <p className="text-center text-base text-zinc-500 dark:text-zinc-400">
                        宫殿持续扩建中，敬请期待更多精彩内容...
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;

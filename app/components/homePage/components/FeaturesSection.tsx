const FeaturesSection = () => {
    const features = [
        {
            title: "现代化架构",
            description: "使用 Next.js 16 App Router 架构，享受最新的 React 特性"
        },
        {
            title: "类型安全",
            description: "采用 TypeScript 开发，提供类型安全保障"
        },
        {
            title: "响应式设计",
            description: "使用 Tailwind CSS 构建响应式设计，支持暗色模式"
        },
        {
            title: "易于维护",
            description: "简洁清晰的代码结构，易于维护和扩展"
        }
    ];

    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-6 py-20 dark:bg-zinc-800">
            <div className="w-full max-w-6xl">
                <h2 className="mb-12 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                    宫殿特色
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-700"
                        >
                            <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-300">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;

"use client";

import { useEffect } from "react";
import { useTheme } from "@/store/themeStore";

export function ThemeUpdater() {
    const isDark = useTheme((state) => state.isDark);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDark]);

    return null;
}

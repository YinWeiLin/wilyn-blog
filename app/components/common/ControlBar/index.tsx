import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";

const ControlBar = () => {
    return (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
        </div>
    );
};

export default ControlBar;

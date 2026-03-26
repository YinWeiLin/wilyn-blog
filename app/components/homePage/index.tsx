import ControlBar from "../common/ControlBar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";

const IndexPage = () => {
    return (
        <div className="bg-zinc-50 dark:bg-zinc-900">
            <ControlBar />
            <HeroSection />
            <FeaturesSection />
            <AboutSection />
            <ContactSection />
        </div>
    );
};

export default IndexPage;

import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero-section";
import HowItWorks from "@/components/sections/HowItWorks";
import { FooterSection } from "@/components/sections/footer-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <HowItWorks />
      <FooterSection />
      
    </main>);

}
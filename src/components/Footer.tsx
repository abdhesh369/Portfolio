import { Github, Linkedin, Twitter, Facebook, Instagram, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToHero = () => {
    document.getElementById("hero")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-12">
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground hover:text-primary transition-colors hover-elevate"
            onClick={scrollToHero}
          >
            <Home className="w-4 h-4" />
            Back to Top
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold font-display">AS<span className="text-primary">.</span></h3>
              <p className="text-sm text-muted-foreground mt-2">
                Building systems with purpose and precision.
              </p>
            </div>

            <div className="flex gap-6">
              <FooterLink href="https://github.com/abdhesh369" icon={<Github className="w-5 h-5" />} label="Github" />
              <FooterLink href="www.linkedin.com/in/abdhesh369" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
              <FooterLink href="https://x.com/abdhesh369" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
              <FooterLink href="https://www.instagram.com/abdhesh.369" icon={<Instagram className="w-5 h-5" />} label="Instagram" />
              <FooterLink href="https://www.facebook.com/abdhesh.369" icon={<Facebook className="w-5 h-5" />} label="Facebook" />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} All rights reserved.</p>
          <p>Designed & Built by Myself.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href}
      target="_blank" 
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

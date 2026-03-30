import Navbar from "#src/components/Navbar";
import Footer from "#src/components/Footer";
import { SEO } from "#src/components/SEO";
import { Guestbook } from "#src/components/Guestbook";
import { useSiteSettings } from "#src/hooks/use-site-settings";

export default function GuestbookPage() {
    const { data: settings } = useSiteSettings();
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20" style={{ fontFamily: "var(--font-body)" }}>
            <SEO
                slug="guestbook"
                title={`Guestbook | ${settings?.personalName || "Portfolio Owner"}`}
                description="Leave a message, some feedback, or just say hello!"
            />
            <Navbar />
            <main className="pt-20">
                <Guestbook />
            </main>
            <Footer />
        </div>
    );
}

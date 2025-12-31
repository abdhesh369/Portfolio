import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageApiSchema, type InsertMessage } from "../../shared/schema";
import { useSendMessage } from "@/hooks/use-portfolio";
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
  const { mutate: sendMessage } = useSendMessage();
  
const form = useForm<InsertMessage>({
  resolver: zodResolver(insertMessageApiSchema),
  defaultValues: {
    name: "",
    email: "",
    subject: "",
    message: "",
  },
});

  const onSubmit = (data: InsertMessage) => {
    sendMessage(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <section id="contact" className="section-container">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Get In Touch</h2>
          <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a project in mind or want to discuss engineering? I'd love to hear from you.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-lg p-8 md:p-12 max-w-2xl mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h3 className="text-2xl font-bold text-center">Contact Information</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10 hover-elevate transition-all">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Email</p>
                  <a href="mailto:abdheshshah111@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm break-all">
                    abdheshshah111@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10 hover-elevate transition-all">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Location</p>
                  <p className="text-muted-foreground text-sm">
                    Kathmandu, Nepal
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10 hover-elevate transition-all">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Phone</p>
                  <a href="tel:+9779761363076" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    +977 9761363076
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-primary/10 text-center">
              <p className="text-sm text-muted-foreground italic">
                "Simplicity is the soul of efficiency."
              </p>
              <p className="text-sm font-semibold text-primary mt-1">~~~~~~</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

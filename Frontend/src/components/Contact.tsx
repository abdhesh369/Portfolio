import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageApiSchema, type InsertMessage } from "@shared/schema";
import { useSendMessage } from "@/hooks/use-portfolio";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle, Github, Linkedin, Terminal, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Cyber Input Component
const CyberInput = ({
  id,
  label,
  type = "text",
  error,
  register,
  required,
  isTextarea = false
}: {
  id: keyof InsertMessage;
  label: string;
  type?: string;
  error?: string;
  register: UseFormRegister<InsertMessage>;
  required?: boolean;
  isTextarea?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const Component = isTextarea ? "textarea" : "input";

  return (
    <div className="relative group">
      {/* Corner Accents */}
      <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 transition-colors duration-300 ${isFocused ? "border-cyan-400" : "border-white/20"}`} />
      <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 transition-colors duration-300 ${isFocused ? "border-cyan-400" : "border-white/20"}`} />
      <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 transition-colors duration-300 ${isFocused ? "border-cyan-400" : "border-white/20"}`} />
      <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 transition-colors duration-300 ${isFocused ? "border-cyan-400" : "border-white/20"}`} />

      <Component
        {...register(id as any, {
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setHasValue(e.target.value.length > 0)
        })}
        type={type}
        id={id}
        rows={isTextarea ? 5 : undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          setIsFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
        className={`w-full px-4 py-3 bg-[#0a0520]/50 border rounded-lg outline-none transition-all duration-300 font-mono text-sm ${error
          ? 'border-red-500/50 focus:border-red-500'
          : 'border-white/10 focus:border-cyan-500/50 hover:border-white/20'
          } ${isFocused || hasValue ? 'pt-8 pb-2' : 'pt-5 pb-5'} placeholder-transparent text-gray-200 resize-none`}
      />

      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none font-mono uppercase tracking-wider ${isFocused || hasValue
          ? 'top-2 text-[10px] text-cyan-400'
          : 'top-4 text-xs text-gray-500'
          }`}
      >
        {'>'} {label} {required && <span className="text-red-400">*</span>}
      </label>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-2 top-2 text-[10px] text-red-400 font-mono bg-red-950/30 px-2 py-0.5 rounded border border-red-500/30"
          >
            ! ERROR: {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Data Card
const DataCard = ({ icon: Icon, label, value, href, delay }: { icon: React.ElementType; label: string; value: string; href?: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="group"
  >
    <a
      href={href}
      className={`flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all ${!href && 'pointer-events-none'}`}
    >
      <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-200 truncate font-mono">{value}</p>
      </div>
      {href && <Copy className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />}
    </a>
  </motion.div>
);

export default function Contact() {
  const { mutate: sendMessage, isPending } = useSendMessage();
  const [showSuccess, setShowSuccess] = useState(false);

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
        setShowSuccess(true);
      },
    });
  };

  return (
    <section id="contact" className="section-container relative overflow-hidden py-24">
      {/* Background Grid */}


      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-4"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            COMM_LINK_OPEN
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-display text-white mb-4"
          >
            Initialize <span className="text-cyan-400">Connection</span>
          </motion.h2>

          <p className="text-gray-400 max-w-lg mx-auto">
            Ready to collaborate on high-performance systems? Transmit your data below.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Contact Info Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0a0520]/80 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Terminal className="w-24 h-24 text-cyan-500" />
              </div>

              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                Direct Channels
              </h3>

              <div className="space-y-4 relative z-10">
                <DataCard icon={Mail} label="Email Protocol" value="abdheshshah111@gmail.com" href="mailto:abdheshshah111@gmail.com?subject=Project%20Inquiry&body=Hi%20Abdhesh," delay={0.1} />
                <DataCard icon={MapPin} label="Base Location" value="Kathmandu, Nepal" href="#" delay={0.2} />
                <DataCard icon={Phone} label="Signal Freq" value="+977 9761363076" href="tel:+9779761363076" delay={0.3} />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-[#0a0520]/80 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                Social Uplink
              </h3>
              <div className="flex gap-4">
                <SocialLink href="https://github.com/abdhesh369" icon={Github} label="GitHub" delay={0.4} />
                <SocialLink href="https://www.linkedin.com/in/abdhesh369" icon={Linkedin} label="LinkedIn" delay={0.5} />
              </div>
            </div>
          </div>

          {/* Form Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative"
          >
            {/* Terminal Frame */}
            <div className="relative bg-[#050510]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-1 shadow-2xl">
              {/* Header Bar */}
              <div className="bg-white/5 px-4 py-2 rounded-t-xl flex items-center justify-between border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-[10px] font-mono text-gray-500">msg_transmission.exe</div>
              </div>

              <div className="p-6 md:p-8 relative">
                <AnimatePresence>
                  {showSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050510]/95 rounded-b-xl"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Transmission Successful</h3>
                      <p className="text-gray-400 mb-8 font-mono text-sm">Target received packet. Awaiting response.</p>
                      <Button onClick={() => setShowSuccess(false)} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                        Send Another Packet
                      </Button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <CyberInput id="name" label="Identity" register={form.register} error={form.formState.errors.name?.message} required />
                    <CyberInput id="email" label="Return Address" type="email" register={form.register} error={form.formState.errors.email?.message} required />
                  </div>

                  <CyberInput id="subject" label="Header / Subject" register={form.register} error={form.formState.errors.subject?.message} required />
                  <CyberInput id="message" label="Packet Payload" isTextarea register={form.register} error={form.formState.errors.message?.message} required />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase tracking-widest rounded-lg relative overflow-hidden group"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">/</span> UPLOADING...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                        INITIATE_TRANSMISSION <Send className="w-4 h-4" />
                      </span>
                    )}
                    <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </form>
              </div>

              {/* Footer Bar */}
              <div className="bg-white/5 px-4 py-2 rounded-b-xl border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-600">
                <span>SECURE_CONNECTION: TLS_v1.3</span>
                <span>LATENCY: 12ms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const SocialLink = ({ href, icon: Icon, label, delay }: { href: string; icon: React.ElementType; label: string; delay: number }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ scale: 1.05 }}
    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg text-gray-400 hover:text-cyan-400 transition-all"
    title={label}
    aria-label={label}
  >
    <Icon className="w-5 h-5" />
  </motion.a>
);

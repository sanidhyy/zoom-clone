"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  Settings, 
  Cpu, 
  Mic2, 
  Image as ImageIcon, 
  Video, 
  Save,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const ServerSettingsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (user?.primaryEmailAddress?.emailAddress === "developer@eburon.ai") {
        setIsAdmin(true);
      } else {
        router.push("/");
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-1">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <ShieldAlert className="h-12 w-12 text-red-500 animate-pulse" />
          <h1 className="text-xl font-medium text-white/80">Premium Access Required</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        <header className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full hover:bg-white/5"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                Server Intelligence
              </h1>
              <p className="text-white/40 text-sm mt-1">Configure advanced AI tools and engines</p>
            </div>
          </div>
          <Button className="premium-button bg-blue-600 hover:bg-blue-500 rounded-full px-6 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
            <Save className="mr-2 h-4 w-4" /> Save Configuration
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ollama Cloud */}
          <section className="glassmorphism p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 text-blue-400">
              <Cpu className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Ollama Cloud</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/60">Endpoint URL</Label>
                <Input placeholder="https://api.ollama.cloud" className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">API Key</Label>
                <Input type="password" placeholder="sk-..." className="bg-white/5 border-white/10 rounded-xl" />
              </div>
            </div>
          </section>

          {/* ElevenLabs */}
          <section className="glassmorphism p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 text-purple-400">
              <Mic2 className="h-5 w-5" />
              <h3 className="font-semibold text-lg">ElevenLabs Voice</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/60">API Key</Label>
                <Input type="password" placeholder="el-..." className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Default Voice ID</Label>
                <Input placeholder="EXAVIT9521UX..." className="bg-white/5 border-white/10 rounded-xl" />
              </div>
            </div>
          </section>

          {/* Google Intelligence */}
          <section className="glassmorphism p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 text-emerald-400">
              <ImageIcon className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Google Nano & Banana</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/60">Nano Engine ID</Label>
                  <Input placeholder="nano-v1" className="bg-white/5 border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60">Banana App ID</Label>
                  <Input placeholder="banana-..." className="bg-white/5 border-white/10 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/60">Lyra (Audio)</Label>
                  <Input placeholder="lyra-v2" className="bg-white/5 border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60">Veo (Visual)</Label>
                  <Input placeholder="veo-main" className="bg-white/5 border-white/10 rounded-xl" />
                </div>
              </div>
            </div>
          </section>

          {/* OpenAI Advanced */}
          <section className="glassmorphism p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 text-orange-400">
              <Video className="h-5 w-5" />
              <h3 className="font-semibold text-lg">OpenAI Sora & Beyond</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/60">OpenAI API Key</Label>
                <Input type="password" placeholder="sk-proj-..." className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Sora Video Access</Label>
                <Input placeholder="sora-v1-beta" className="bg-white/5 border-white/10 rounded-xl" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ServerSettingsPage;

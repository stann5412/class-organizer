import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 to-indigo-900/40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">UniPlan</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display font-bold text-5xl leading-tight mb-6">
            Master your semester with confidence.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Track assignments, manage course schedules, and visualize your academic journey in one beautifully designed workspace.
          </p>
        </div>

        <div className="relative z-10 text-sm text-indigo-200/60">
          © {new Date().getFullYear()} UniPlan Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start lg:hidden mb-6">
               <div className="bg-primary/10 p-3 rounded-xl">
                 <GraduationCap className="w-10 h-10 text-primary" />
               </div>
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your student dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <a href="/api/login">
              <Button className="w-full h-12 text-base font-medium group" size="lg">
                Sign in with Replit
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
          
          <div className="pt-6 text-center text-sm text-muted-foreground">
            <p>Don't have an account? Just sign in to get started instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

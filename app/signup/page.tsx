"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#18181b 2px, transparent 2px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Top Navbar Area */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6 md:p-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-none flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-zinc-900 text-xl tracking-tight hidden md:block">
            Canvas
          </span>
        </Link>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0 }}
        className="w-full max-w-md bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_rgba(24,24,27,1)] md:shadow-[16px_16px_0px_rgba(24,24,27,1)] relative z-10"
      >
        <div className="p-8 md:p-12 flex flex-col">
          
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter mb-2 uppercase">
            Start Here.
          </h1>
          <p className="text-zinc-500 font-medium mb-8">
            Create an account to start designing.
          </p>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-zinc-900 text-sm">FULL NAME</label>
              <input 
                type="text" 
                placeholder="Jane Doe"
                className="w-full border-2 border-zinc-200 bg-zinc-50 p-4 font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors rounded-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-zinc-900 text-sm">EMAIL</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full border-2 border-zinc-200 bg-zinc-50 p-4 font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors rounded-none"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-zinc-900 text-sm">PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border-2 border-zinc-200 bg-zinc-50 p-4 font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors rounded-none"
              />
            </div>

            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg py-4 border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(24,24,27,1)] transition-all mt-4">
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-zinc-500 font-medium">Already have an account? </span>
            <Link href="/login" className="font-bold text-zinc-900 hover:underline underline-offset-4 decoration-2">
              Log in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

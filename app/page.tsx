"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MousePointer2, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      {/* TOP NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6 md:p-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-zinc-900 rounded-none flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-zinc-900 text-xl tracking-tight">
            Canvas
          </span>
        </div>
        
        <div className="flex items-center gap-6 pointer-events-auto">
          <Link href="/login" className="font-bold text-zinc-900 hover:underline underline-offset-4 decoration-2 transition-all">
            Log In
          </Link>
          <Link href="/signup" className="font-bold text-white bg-zinc-900 border-2 border-zinc-900 px-6 py-2 hover:bg-white hover:text-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* LEFT HALF - TYPOGRAPHY & CTA */}
      <div className="flex-1 flex flex-col justify-center p-12 md:p-24 relative z-10 bg-white">

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9] mb-8"
        >
          DESIGN <br />
          WITHOUT <br />
          BOUNDARIES.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-zinc-600 max-w-md mb-12 leading-relaxed"
        >
          The AI-powered infinite canvas for teams that move fast. No rounded corners, no fluff. Just pure, unadulterated creativity.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link 
            href="/workspaces"
            className="inline-flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 py-5 rounded-none border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(24,24,27,1)] transition-all"
          >
            Enter Dashboard
          </Link>
        </motion.div>
      </div>

      {/* RIGHT HALF - ANIMATED GRAPHIC */}
      <div className="flex-1 bg-zinc-50 border-t-4 md:border-t-0 md:border-l-4 border-zinc-900 relative overflow-hidden flex items-center justify-center p-8 md:p-12">
        
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#18181b 2px, transparent 2px)",
            backgroundSize: "32px 32px"
          }}
        />

        {/* The "Canvas" Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-lg aspect-square bg-white border-4 border-zinc-900 relative shadow-[12px_12px_0px_rgba(24,24,27,1)] md:shadow-[16px_16px_0px_rgba(24,24,27,1)] flex flex-col"
        >
          {/* Mockup Top Bar */}
          <div className="h-12 border-b-4 border-zinc-900 bg-zinc-100 flex items-center px-4 gap-3 shrink-0">
            <div className="w-4 h-4 border-2 border-zinc-900 bg-zinc-300" />
            <div className="w-4 h-4 border-2 border-zinc-900 bg-zinc-300" />
            <div className="w-4 h-4 border-2 border-zinc-900 bg-zinc-300" />
          </div>

          {/* Animated Elements inside Canvas */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            
            {/* Shape 1: Black Square */}
            <motion.div 
              animate={{ 
                x: [0, 40, 10, 0], 
                y: [0, -20, 30, 0],
                rotate: [0, 10, -5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[20%] w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-zinc-900"
            />

            {/* Shape 2: Pink Accent */}
            <motion.div 
              animate={{ 
                x: [0, -30, 20, 0], 
                y: [0, 50, -10, 0],
                rotate: [0, -15, 10, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[30%] right-[20%] w-20 h-20 md:w-24 md:h-24 bg-pink-500 border-4 border-zinc-900"
            />

            {/* Shape 3: Outline Element */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[20%] left-[30%] w-32 h-16 md:w-40 md:h-20 border-4 border-dashed border-zinc-900 bg-white/50 backdrop-blur-sm"
            />

            {/* Animated Cursor */}
            <motion.div
              animate={{ 
                x: [0, 120, -40, 0],
                y: [0, 40, 120, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-1/2 z-20"
            >
              <MousePointer2 className="w-10 h-10 text-zinc-900 fill-pink-500 -rotate-12 drop-shadow-md" />
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

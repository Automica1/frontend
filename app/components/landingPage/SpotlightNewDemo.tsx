"use client";
import React from "react";
import { Spotlight } from "../ui/spotlight-new";
import {CanvasRevealEffectDemo} from "../services/Demo"

export function SpotlightNewDemo() {
  return (
    <div className=" w-full pb-20 rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight />
      
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="lg:pt-20 md:pt-10 text-5xl lg:text-7xl font-light md:text-7xl text-center bg-clip-text  bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 text-white tracking-tighter leading-tight">
          Our Most Popular AI Solutions
        </h1>
        <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl font-light leading-relaxed opacity-90 mt-5 text-center mx-auto">
          Explore our most trusted AI tools driving automation and security for businesses worldwide.
        </p>
        
            <CanvasRevealEffectDemo/>
      </div>
    </div>
  );
}

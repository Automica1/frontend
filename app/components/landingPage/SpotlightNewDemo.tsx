"use client";
import React from "react";
import { Spotlight } from "../ui/spotlight-new";
import { CanvasRevealEffectDemo } from "../services/Demo"

export function SpotlightNewDemo() {
  return (
    <div className=" w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight />
      
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="lg:pt-20 md:pt-10 text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Our Most Popular AI Solutions
        </h1>
        <p className="mt-5 font-normal text-xl text-neutral-300 max-w-lg text-center mx-auto">
          Explore our most trusted AI tools driving automation and security for businesses worldwide.
        </p>
        
            <CanvasRevealEffectDemo/>
      </div>
    </div>
  );
}

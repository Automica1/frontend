'use client'

import { useEffect, useRef, useState } from 'react'

export default function TopologyBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    const p5Script = document.createElement('script')
    p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js'
    p5Script.async = true

    const vantaScript = document.createElement('script')
    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js'
    vantaScript.async = true

    p5Script.onload = () => {
      document.body.appendChild(vantaScript)
    }

    vantaScript.onload = () => {
      if ((window as any).VANTA && !vantaEffect) {
        const effect = (window as any).VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x6b4e96,
          backgroundColor: 0x110022
        })
        setVantaEffect(effect)
      }
    }

    document.body.appendChild(p5Script)

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return <div ref={vantaRef} className="w-full h-full" />
}

export default function PremiumAtomLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0d]">
      {/* Background gradient for loader */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      {/* Loader container */}
      <div className="relative">
        <style jsx>{`
          .atom-loader {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            animation: pulse 2s infinite ease-in-out;
          }
          
          .atom-ring {
            position: absolute;
            width: 190px;
            height: 190px;
            border: 1px solid transparent;
            border-radius: 50%;
            border-bottom: 8px solid var(--ring-color);
            animation: rotate1 1s ease-in-out infinite;
            box-shadow: 0 0 4px rgba(142, 142, 142, 0.3);
          }
          
          @keyframes rotate1 {
            from { transform: rotateX(50deg) rotateZ(110deg); }
            to { transform: rotateX(50deg) rotateZ(470deg); }
          }
          
          .atom-ring:nth-child(2) {
            --ring-color: #8f51ea;
            animation-name: rotate2;
          }
          
          @keyframes rotate2 {
            from { transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg); }
            to { transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg); }
          }
          
          .atom-ring:nth-child(3) {
            --ring-color: #0044ff;
            animation-name: rotate3;
          }
          
          @keyframes rotate3 {
            from { transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg); }
            to { transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg); }
          }
          
          .atom-ring:nth-child(4) {
            --ring-color: #fe53bb;
            animation-name: rotate4;
            width: 380px;
            height: 380px;
            border: 2px solid transparent;
            border-bottom: 16px solid var(--ring-color);
          }
          
          @keyframes rotate4 {
            from { transform: rotateX(50deg) rotateZ(470deg); }
            to { transform: rotateX(50deg) rotateZ(110deg); }
          }
          
          .atom-ring:nth-child(5) {
            --ring-color: #8f51ea;
            animation-name: rotate5;
            width: 380px;
            height: 380px;
            border: 2px solid transparent;
            border-bottom: 16px solid var(--ring-color);
          }
          
          @keyframes rotate5 {
            from { transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg); }
            to { transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg); }
          }
          
          .atom-ring:nth-child(6) {
            --ring-color: #0044ff;
            animation-name: rotate6;
            width: 380px;
            height: 380px;
            border: 2px solid transparent;
            border-bottom: 16px solid var(--ring-color);
          }
          
          @keyframes rotate6 {
            from { transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg); }
            to { transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg); }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 0 20px #fe53bb, 0 0 40px #8f51ea;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              box-shadow: 0 0 30px #fe53bb, 0 0 60px #8f51ea;
            }
          }
          
          .atom-nucleus {
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #fe53bb, #8f51ea);
            border-radius: 50%;
            box-shadow: 0px 0 20px #fe53bb, 0 0 40px #8f51ea;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 1s ease-in-out infinite;
          }
          
          /* Ring color variables */
          .atom-ring:nth-child(1) { --ring-color: #fe53bb; }
          .atom-ring:nth-child(2) { --ring-color: #8f51ea; }
          .atom-ring:nth-child(3) { --ring-color: #0044ff; }
          .atom-ring:nth-child(4) { --ring-color: #fe53bb; }
          .atom-ring:nth-child(5) { --ring-color: #8f51ea; }
          .atom-ring:nth-child(6) { --ring-color: #0044ff; }
        `}</style>
        
        <div className="atom-loader">
          <div className="atom-nucleus" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
          <div className="atom-ring" />
        </div>
        
        {/* Loading text */}
        {/* <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-white text-lg font-light tracking-wider animate-pulse">
            Initializing Atomic Intelligence...
          </p>
        </div> */}
      </div>
    </div>
  );
}
// 'use client';
// import React, { useState, useEffect, useRef } from 'react'
// import Spline from '@splinetool/react-spline';

// export default function Test() {
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [shouldLoad, setShouldLoad] = useState(false);
//   const splineRef = useRef(null);

//   useEffect(() => {
//     // Delay the loading slightly to ensure component is mounted
//     const timer = setTimeout(() => {
//       setShouldLoad(true);
//     }, 100);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleLoad = () => {
//     console.log('Scene loaded successfully');
//     setIsLoading(false);
//   };

//   const handleError = (err) => {
//     console.error('Spline Error:', err);
//     setError(err.message || 'Failed to load scene');
//     setIsLoading(false);
//   };

//   return (
//     <main className='h-screen bg-gray-100'>
//       <h1 className='text-3xl font-bold text-center py-10'>Test Spline Component</h1>
//       <div className='w-full h-[calc(100vh-120px)] relative'>
//         {isLoading && !error && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//               <p>Loading Spline scene...</p>
//             </div>
//           </div>
//         )}
        
//         {error ? (
//           <div className="flex items-center justify-center h-full text-red-500">
//             <div className="text-center">
//               <p className="mb-4">Error loading scene: {error}</p>
//               <button 
//                 onClick={() => {
//                   setError(null);
//                   setIsLoading(true);
//                   setShouldLoad(false);
//                   setTimeout(() => setShouldLoad(true), 100);
//                 }}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         ) : shouldLoad ? (
//           <Spline
//             ref={splineRef}
//              scene="https://prod.spline.design/kCAH13Ra3ih3JEX9/scene.splinecode"
//             // scene="https://prod.spline.design/Kj4h9K-4OXXdKSxr/scene.splinecode"
//             // scene="https://prod.spline.design/eW0cjkqOjY02xXvZ/scene.splinecode"
//             onLoad={handleLoad}
//             onError={handleError}
//             style={{
//               width: '100%',
//               height: '100%',
//             }}
//           />
//         ) : null}
//       </div>
//     </main>
//   )
// }
'use client'
import { useState, useEffect } from 'react';

export default function CustomLoading() {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 10);
    
    return () => clearInterval(interval);
  }, []);
  
  // Number of dots around the cart
  const dotsCount = 12;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="relative h-32 w-32">
        {/* Cart Icon in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
        <img className="sm:w-16 w-16" src="/logo.png" />
        </div>
        
        {/* Rotating Dots */}
        {Array.from({ length: dotsCount }).map((_, index) => {
          const angle = (index * (360 / dotsCount) + rotation) % 360;
          const radian = (angle * Math.PI) / 180;
          const x = 50 + 35 * Math.cos(radian);
          const y = 50 + 35 * Math.sin(radian);
          
          return (
            <div 
              key={index}
              className="absolute h-3 w-3 rounded-full bg-green-700"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.2 + (0.8 * (index % dotsCount)) / dotsCount
              }}
            />
          );
        })}
      </div>
      
      
    </div>
  );
}
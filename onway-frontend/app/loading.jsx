'use client'
import { useState, useEffect } from 'react';

export default function CustomLoader() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        return newProgress >= 100 ? 0 : newProgress;
      });
    }, 50);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            {/* Shopping cart icon */}
            <img className="h-16 w-16" src="/logo.png" />
          
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Loading your products</h2>
        <p className="text-gray-600 text-center mb-4">Please wait while we prepare your shopping experience</p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-green-700 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Loading messages that change */}
        <div className="h-6">
          {progress < 30 && (
            <p className="text-sm text-gray-500 text-center animate-pulse">Fetching the latest products...</p>
          )}
          {progress >= 30 && progress < 60 && (
            <p className="text-sm text-gray-500 text-center animate-pulse">Checking for special offers...</p>
          )}
          {progress >= 60 && progress < 90 && (
            <p className="text-sm text-gray-500 text-center animate-pulse">Personalizing your experience...</p>
          )}
          {progress >= 90 && (
            <p className="text-sm text-gray-500 text-center animate-pulse">Almost ready!</p>
          )}
        </div>
      </div>
    </div>
  );
}
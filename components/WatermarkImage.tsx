
import React from 'react';

interface WatermarkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  watermarkText?: string;
  isBlurred?: boolean;
  containerClassName?: string;
  noWatermark?: boolean;
}

export const WatermarkImage: React.FC<WatermarkImageProps> = ({ 
  watermarkText = "LoveLink", 
  isBlurred = false,
  containerClassName = "",
  className = "",
  noWatermark = false,
  style,
  ...props 
}) => {
  return (
    <div 
        className={`relative overflow-hidden select-none ${containerClassName}`}
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      <img 
        {...props} 
        className={`${className} ${isBlurred ? 'blur-xl' : ''} transition-all duration-300 w-full h-full pointer-events-none`}
        style={style}
        draggable={false}
      />
      
      {/* Privacy Shield: Transparent Overlay to intercept Right Clicks/Drag */}
      <div className="absolute inset-0 z-50 bg-transparent"></div>

      {!noWatermark && (
        <>
          {/* Dynamic Watermark Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-30 select-none"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold' font-size='12' fill='white' transform='rotate(-45 50 50)'%3E${watermarkText}%3C/text%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
            }}
          ></div>
          
          {/* Centered Large Watermark (Optional for better visibility) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 opacity-20">
              <span className="text-white font-extrabold text-2xl md:text-4xl -rotate-45 drop-shadow-md select-none">
                  {watermarkText}
              </span>
          </div>
        </>
      )}
    </div>
  );
};

import { Eye, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useState } from "react";

interface DetectedImageProps {
  imageUrl: string;
}

export default function DetectedImage({ imageUrl }: DetectedImageProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="card relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-electric-600 flex items-center justify-center">
            <Eye className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Detected Image</h3>
            <p className="text-[11px] font-mono text-white/40 tracking-wider">
              COMPUTER VISION OUTPUT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomed(!zoomed)}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/60 hover:text-cyan-400 hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
          >
            {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/60 hover:text-cyan-400 hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            aria-label="Open full size image"
          >
            <Maximize2 className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-navy-950 border border-white/10">
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-md z-10" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-md z-10" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400/40 rounded-bl-md z-10" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400/40 rounded-br-md z-10" />

        <img
          src={imageUrl}
          alt="AI detected road image with bounding boxes"
          className={`w-full transition-transform duration-500 ${
            zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML += `
                <div class="flex flex-col items-center justify-center py-20 text-white/40">
                  <p class="text-sm">Unable to load detected image</p>
                  <p class="text-xs mt-1 font-mono">Check that the Flask server is serving static files</p>
                </div>
              `;
            }
          }}
        />
      </div>
    </div>
  );
}

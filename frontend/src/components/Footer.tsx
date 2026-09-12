import { Radar, Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-navy-950">
      <div className="container-max px-4 md:px-8 lg:px-16 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white">
                  RoadSense<span className="gradient-text"> AI</span>
                </span>
                <div className="text-[9px] font-mono text-white/40 tracking-wider">
                  ROAD INTELLIGENCE
                </div>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              AI-Based Road Condition Monitoring using YOLO11n and computer vision.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              <a href="/" className="text-sm text-white/50 hover:text-cyan-400 transition-colors">Home</a>
              <a href="/analyze" className="text-sm text-white/50 hover:text-cyan-400 transition-colors">Analyze Road</a>
              <a href="/#features" className="text-sm text-white/50 hover:text-cyan-400 transition-colors">Features</a>
              <a href="/#how-it-works" className="text-sm text-white/50 hover:text-cyan-400 transition-colors">How It Works</a>
              <a href="/#about" className="text-sm text-white/50 hover:text-cyan-400 transition-colors">About Project</a>
            </div>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {["YOLO11n", "Python", "Flask", "OpenCV", "React", "TypeScript"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-lg glass text-xs font-mono text-white/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 text-center md:text-left">
            Academic CSE / AI Project. For educational and demonstration purposes.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-danger-400" />
            <span>for road safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

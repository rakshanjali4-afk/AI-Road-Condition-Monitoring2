import { FlaskConical, Eye, Code2, GraduationCap, BookOpen, Target } from "lucide-react";

const TECH_STACK = [
  { name: "YOLO11n", description: "Object detection model" },
  { name: "Python", description: "Core programming language" },
  { name: "Flask", description: "Web API framework" },
  { name: "OpenCV", description: "Image processing library" },
  { name: "Computer Vision", description: "Visual analysis domain" },
];

export default function About() {
  return (
    <section id="about" className="section-padding relative">
      <div className="absolute inset-0 gradient-mesh" />

      <div className="container-max relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono font-semibold text-amber-400 tracking-widest uppercase">
                Academic Project
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance mb-6">
              About the <span className="gradient-text">Project</span>
            </h2>

            <p className="text-white/60 leading-relaxed mb-4 text-balance">
              RoadSense AI is an academic prototype that demonstrates how computer vision and deep learning can assist with automated visual road inspection. The system uses a YOLO11n model trained to detect road conditions and objects from images.
            </p>
            <p className="text-white/50 leading-relaxed mb-8 text-sm">
              This project is built as part of a Computer Science & Engineering / AI curriculum, showcasing the integration of object detection models with web interfaces for practical, real-world applications. It is designed for project demonstrations, academic evaluation, and hackathon presentations.
            </p>

            {/* Highlights */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-hover">
                <Target className="w-6 h-6 text-cyan-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Automated Inspection</h4>
                <p className="text-xs text-white/50">Visual road condition analysis without manual field surveys.</p>
              </div>
              <div className="card-hover">
                <Eye className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Computer Vision</h4>
                <p className="text-xs text-white/50">YOLO11n powered object detection on road imagery.</p>
              </div>
            </div>
          </div>

          {/* Right: Tech stack */}
          <div className="card relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Technology Stack</h3>
              </div>

              <div className="space-y-3">
                {TECH_STACK.map((tech, index) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/5 transition-all duration-300 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: "forwards",
                      opacity: 0,
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-600/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{tech.name}</div>
                      <div className="text-xs text-white/40">{tech.description}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-blink" />
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/60 leading-relaxed">
                    This is an academic prototype for educational purposes. AI detection results are informational and should not be used as the sole basis for road safety decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

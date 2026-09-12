import { Upload, ImageIcon, X, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/api";

interface UploadCardProps {
  selectedFile: File | null;
  previewUrl: string | null;
  fileError: string | null;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onAnalyze: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}

export default function UploadCard({
  selectedFile,
  previewUrl,
  fileError,
  isLoading,
  onFileSelect,
  onFileRemove,
  onAnalyze,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
}: UploadCardProps) {
  return (
    <div className="card relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Analyze Road Condition</h2>
            <p className="text-xs text-white/40">Upload a road image for AI analysis</p>
          </div>
        </div>

        {/* Upload area */}
        {!selectedFile && (
          <label
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 md:p-12 text-center ${
              isDragOver
                ? "border-cyan-400 bg-cyan-400/10 scale-[1.01]"
                : "border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02]"
            }`}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
                e.target.value = "";
              }}
              disabled={isLoading}
            />

            {/* Animated upload icon */}
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-cyan-400 animate-float" />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-pulse-ring" />
            </div>

            <p className="text-sm font-semibold text-white mb-1">
              {isDragOver ? "Drop your image here" : "Drag and drop or click to upload"}
            </p>
            <p className="text-xs text-white/40 mb-4">
              JPG, JPEG, PNG — Maximum 10 MB
            </p>

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-xs font-medium text-white/70 hover:bg-white/10 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Choose Image
            </span>
          </label>
        )}

        {/* Preview area */}
        {selectedFile && previewUrl && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden bg-navy-950 border border-white/10">
              <img
                src={previewUrl}
                alt={`Preview of ${selectedFile.name}`}
                className="w-full max-h-80 object-contain"
              />
              <button
                onClick={onFileRemove}
                disabled={isLoading}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-navy-950/80 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-danger-400 hover:bg-danger-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-danger-400/50 disabled:opacity-50"
                aria-label="Remove selected image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-xl glass">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={onFileRemove}
                disabled={isLoading}
                className="text-xs text-white/50 hover:text-danger-400 transition-colors flex-shrink-0 disabled:opacity-50"
              >
                Remove
              </button>
            </div>

            <button
              onClick={onAnalyze}
              disabled={isLoading}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Upload className="w-5 h-5" />
              Analyze Road
            </button>
          </div>
        )}

        {/* File validation error */}
        {fileError && !selectedFile && (
          <div className="mt-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-400 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {fileError}
          </div>
        )}
      </div>
    </div>
  );
}


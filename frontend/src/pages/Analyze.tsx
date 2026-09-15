import {
  useState,
  type DragEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import jsPDF from "jspdf";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

type Detection = {
  name: string;
  confidence: number;
};

type AnalysisResult = {
  condition: string;
  image_url: string;
  detections: Detection[];
};

type ScanHistoryItem = {
  id: string;
  date: string;
  condition: string;
  score: number;
  detections: string[];
};

const OBJECT_CLASSES = [
  "LMV",
  "HMV",
  "Pedestrian",
  "RoadDamages",
  "SpeedBump",
  "UnsurfacedRoad",
];

function Analyze() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintLocation, setComplaintLocation] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");

  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("roadScanHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  const processFile = (file: File | null) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, JPEG or PNG image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please upload an image smaller than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    setResult(null);
    setError("");
    setComplaintSubmitted(false);
    setShowComplaint(false);
  };

  /* =========================================================
     NORMAL FILE SELECT
  ========================================================= */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    processFile(event.target.files?.[0] || null);
  };

  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] || null;

    processFile(file);
  };

  /* =========================================================
     AI ANALYSIS
  ========================================================= */

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select or drag an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setComplaintSubmitted(false);

    try {
      const formData = new FormData();

      formData.append("image", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("AI server error");
      }

      const data: AnalysisResult =
        await response.json();

      setResult(data);

      /* =====================================================
         SAVE HISTORY
      ===================================================== */

      const roadDamage =
        data.detections.filter(
          (item) => item.name === "RoadDamages"
        ).length;

      const unsurfaced =
        data.detections.filter(
          (item) => item.name === "UnsurfacedRoad"
        ).length;

      const speedBumps =
        data.detections.filter(
          (item) => item.name === "SpeedBump"
        ).length;

      let score = 100;

      score -= roadDamage * 20;
      score -= unsurfaced * 20;
      score -= speedBumps * 5;

      score = Math.max(
        0,
        Math.min(100, score)
      );

      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        condition: data.condition,
        score,
        detections: data.detections.map(
          (item) => item.name
        ),
      };

      const savedHistory = [
        historyItem,
        ...scanHistory,
      ].slice(0, 10);

      setScanHistory(savedHistory);

      localStorage.setItem(
        "roadScanHistory",
        JSON.stringify(savedHistory)
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the AI server. Please make sure your Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DETECTION COUNTS
  ========================================================= */

  const getCount = (className: string) => {
    if (!result) return 0;

    return result.detections.filter(
      (detection) =>
        detection.name === className
    ).length;
  };

  const totalObjects =
    result?.detections.length || 0;

  const averageConfidence =
    result &&
    result.detections.length > 0
      ? result.detections.reduce(
          (sum, detection) =>
            sum + detection.confidence,
          0
        ) / result.detections.length
      : 0;

  const roadDamageCount =
    getCount("RoadDamages");

  const speedBumpCount =
    getCount("SpeedBump");

  const unsurfacedRoadCount =
    getCount("UnsurfacedRoad");

  /* =========================================================
     ROAD CONDITION SCORE
  ========================================================= */

  const calculateConditionScore = () => {
    if (!result) return 0;

    let score = 100;

    score -= roadDamageCount * 20;
    score -= unsurfacedRoadCount * 20;
    score -= speedBumpCount * 5;

    return Math.max(
      0,
      Math.min(100, score)
    );
  };

  const conditionScore =
    calculateConditionScore();

  /* =========================================================
     CONDITION
  ========================================================= */

  const getConditionColor = () => {
    if (!result) {
      return "text-gray-400";
    }

    if (result.condition === "BAD") {
      return "text-red-400";
    }

    if (result.condition === "MODERATE") {
      return "text-yellow-400";
    }

    return "text-emerald-400";
  };

  const getConditionBackground = () => {
    if (!result) {
      return "bg-gray-500/10 border-gray-500/20";
    }

    if (result.condition === "BAD") {
      return "bg-red-500/10 border-red-500/20";
    }

    if (result.condition === "MODERATE") {
      return "bg-yellow-500/10 border-yellow-500/20";
    }

    return "bg-emerald-500/10 border-emerald-500/20";
  };

  const getConditionLabel = () => {
    if (!result) return "Ready";

    if (result.condition === "BAD") {
      return "Poor";
    }

    if (result.condition === "MODERATE") {
      return "Moderate";
    }

    return "Excellent";
  };

  /* =========================================================
     BAR WIDTH
  ========================================================= */

  const getBarWidth = (count: number) => {
    if (totalObjects === 0) return 0;

    return Math.max(
      (count / totalObjects) * 100,
      count > 0 ? 8 : 0
    );
  };

  /* =========================================================
     COMPLAINT
  ========================================================= */

  const generateComplaintId = () => {
    const randomNumber =
      Math.floor(
        1000 + Math.random() * 9000
      );

    return `RC-${new Date().getFullYear()}-${randomNumber}`;
  };

  const handleComplaintSubmit = () => {
    if (!complaintLocation.trim()) {
      alert("Please enter the location.");
      return;
    }

    if (!complaintDescription.trim()) {
      alert("Please enter a description.");
      return;
    }

    const id = generateComplaintId();

    setComplaintId(id);
    setComplaintSubmitted(true);
    setShowComplaint(false);
  };

  /* =========================================================
     CLEAR HISTORY
  ========================================================= */

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(
      "roadScanHistory"
    );
  };

  /* =========================================================
     PDF REPORT
  ========================================================= */

  const downloadReport = () => {
    if (!result) return;

    const pdf = new jsPDF();

    const reportDate =
      new Date().toLocaleString();

    pdf.setFontSize(20);

    pdf.text(
      "AI Road Condition Analysis Report",
      20,
      20
    );

    pdf.setFontSize(11);

    pdf.text(
      `Generated: ${reportDate}`,
      20,
      30
    );

    pdf.setFontSize(15);

    pdf.text(
      "Road Condition",
      20,
      45
    );

    pdf.setFontSize(12);

    pdf.text(
      `Condition: ${result.condition}`,
      20,
      55
    );

    pdf.text(
      `Condition Score: ${conditionScore}/100`,
      20,
      65
    );

    pdf.text(
      `Average Detection Confidence: ${averageConfidence.toFixed(
        1
      )}%`,
      20,
      75
    );

    pdf.setFontSize(15);

    pdf.text(
      "Detection Summary",
      20,
      90
    );

    pdf.setFontSize(12);

    let y = 100;

    OBJECT_CLASSES.forEach(
      (className) => {
        pdf.text(
          `${className}: ${getCount(
            className
          )}`,
          25,
          y
        );

        y += 8;
      }
    );

    y += 5;

    pdf.setFontSize(15);

    pdf.text(
      "Road Safety Analysis",
      20,
      y
    );

    y += 10;

    pdf.setFontSize(11);

    if (roadDamageCount > 0) {
      pdf.text(
        "• Road damage detected. Further inspection may be required.",
        25,
        y
      );

      y += 8;
    }

    if (unsurfacedRoadCount > 0) {
      pdf.text(
        "• Unsurfaced road detected. Maintenance may be required.",
        25,
        y
      );

      y += 8;
    }

    if (speedBumpCount > 0) {
      pdf.text(
        "• Speed bump detected. Drivers should maintain appropriate speed.",
        25,
        y
      );

      y += 8;
    }

    if (
      roadDamageCount === 0 &&
      unsurfacedRoadCount === 0 &&
      speedBumpCount === 0
    ) {
      pdf.text(
        "• No road-condition anomaly detected by the current model.",
        25,
        y
      );

      y += 8;
    }

    pdf.save(
      "road-condition-report.pdf"
    );
  };

  /* =========================================================
     KEYBOARD
  ========================================================= */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleAnalyze();
    }
  };

  /* =========================================================
     SCROLL HELPER
  ========================================================= */

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =========================================================
     OBJECT ICON
  ========================================================= */

  const getObjectIcon = (
    className: string
  ) => {
    switch (className) {
      case "LMV":
        return "🚗";

      case "HMV":
        return "🚛";

      case "Pedestrian":
        return "🧍";

      case "RoadDamages":
        return "⚠️";

      case "SpeedBump":
        return "🚧";

      case "UnsurfacedRoad":
        return "🛣️";

      default:
        return "🔹";
    }
  };

  return (
    <main className="min-h-screen bg-[#020b18] text-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-[#031326]/95 backdrop-blur-xl">
        <div className="flex min-h-[88px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-2xl shadow-lg shadow-cyan-500/10">
              🛣️
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                Road Condition Analyzer
              </h1>

              <p className="text-xs text-cyan-300 md:text-sm">
                AI-Powered Road Safety &amp;
                Condition Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-sm font-semibold text-emerald-400">
              {loading
                ? "Analyzing"
                : "Ready"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="sticky top-[88px] hidden h-[calc(100vh-88px)] w-60 shrink-0 border-r border-cyan-500/20 bg-[#031326] p-3 md:block">
          <nav className="space-y-2">
            <button
              onClick={() =>
                scrollTo("dashboard-top")
              }
              className="flex w-full items-center gap-4 rounded-xl bg-blue-600 px-4 py-3 text-left font-medium shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
            >
              <span className="text-xl">
                🏠
              </span>

              <span>Home</span>
            </button>

            <button
              onClick={() =>
                scrollTo("upload-section")
              }
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-medium text-gray-300 transition hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <span className="text-xl">
                🖼️
              </span>

              <span>Upload Image</span>
            </button>

            <button
              onClick={() =>
                scrollTo("upload-section")
              }
              className="flex w-full items-center gap-4 rounded-xl bg-cyan-500/10 px-4 py-3 text-left font-medium text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <span className="text-xl">
                🤖
              </span>

              <span>Analyze Road</span>
            </button>

            <button
              onClick={() =>
                scrollTo("results-section")
              }
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-medium text-gray-300 transition hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <span className="text-xl">
                📊
              </span>

              <span>Results</span>
            </button>
          </nav>
        </aside>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div
          id="dashboard-top"
          className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-[1500px]">
            {/* =================================================
                MOBILE NAVIGATION
            ================================================= */}

            <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-[#06182b] p-2 md:hidden">
              <button
                onClick={() =>
                  scrollTo("dashboard-top")
                }
                className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm"
              >
                🏠 Home
              </button>

              <button
                onClick={() =>
                  scrollTo("upload-section")
                }
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
              >
                🖼️ Upload
              </button>

              <button
                onClick={() =>
                  scrollTo("results-section")
                }
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
              >
                📊 Results
              </button>
            </div>

            {/* =================================================
                MAIN ANALYZER
            ================================================= */}

            <section
              id="upload-section"
              className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(350px,0.9fr)]"
            >
              {/* =================================================
                  IMAGE PANEL
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#041a30] shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3 border-b border-cyan-500/10 px-5 py-4">
                  <span className="text-2xl">
                    🖼️
                  </span>

                  <h2 className="text-xl font-bold">
                    Detected Objects
                  </h2>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative mx-4 mt-4 flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition md:min-h-[480px] ${
                    isDragging
                      ? "scale-[1.01] border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/10"
                      : "border-cyan-500/20 bg-[#020d1c]"
                  }`}
                >
                  {result ? (
                    <img
                      src={`${API_BASE_URL}${result.image_url}`}
                      alt="AI analyzed road"
                      className="h-full max-h-[500px] w-full object-contain"
                    />
                  ) : preview ? (
                    <img
                      src={preview}
                      alt="Selected road"
                      className="max-h-[450px] w-full object-contain p-4"
                    />
                  ) : (
                    <div className="px-6 text-center">
                      <div className="mb-5 text-6xl">
                        {isDragging
                          ? "📥"
                          : "📷"}
                      </div>

                      <h3 className="text-lg font-semibold">
                        {isDragging
                          ? "Drop your road image here"
                          : "Drag & Drop Road Image Here"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-400">
                        or click Choose Image
                        below
                      </p>

                      <p className="mt-3 text-xs text-gray-500">
                        JPG, JPEG or PNG •
                        Maximum 10 MB
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020b18]/75 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />

                        <p className="font-semibold text-cyan-300">
                          AI is analyzing
                          the road...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <label
                    htmlFor="road-image"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/5 px-5 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                  >
                    <span className="text-xl">
                      ⬆️
                    </span>

                    <span>
                      Upload Image
                    </span>
                  </label>

                  <input
                    id="road-image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={handleAnalyze}
                    disabled={
                      !selectedFile ||
                      loading
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-xl">
                      🤖
                    </span>

                    {loading
                      ? "Analyzing..."
                      : "Analyze Road"}
                  </button>
                </div>

                {selectedFile && (
                  <div className="px-4 pb-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400">
                      Selected:{" "}
                      <span className="text-gray-200">
                        {selectedFile.name}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mx-4 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* =================================================
                  RESULTS PANEL
              ================================================= */}

              <div
                id="results-section"
                className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#041a30] shadow-2xl shadow-black/20"
              >
                <div className="flex items-center gap-3 border-b border-cyan-500/10 px-5 py-4">
                  <span className="text-2xl">
                    📋
                  </span>

                  <h2 className="text-xl font-bold">
                    Analysis Results
                  </h2>
                </div>

                {/* SCORE */}
                <div className="m-4 rounded-xl border border-cyan-500/10 bg-[#031326] p-5">
                  <h3 className="text-lg font-bold">
                    Road Condition Score
                  </h3>

                  <div className="mt-5 flex items-center justify-center gap-6">
                    {/* CIRCLE */}
                    <div
                      className="relative flex h-36 w-36 items-center justify-center rounded-full"
                      style={{
                        background: result
                          ? `conic-gradient(#00e5b0 ${conditionScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
                          : "conic-gradient(#18a6ff 360deg, rgba(255,255,255,0.08) 0deg)",
                      }}
                    >
                      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#031326]">
                        <span className="text-2xl font-bold">
                          {conditionScore}
                          /100
                        </span>

                        <span className="mt-1 text-xs text-gray-500">
                          SCORE
                        </span>
                      </div>
                    </div>

                    <div>
                      <div
                        className={`flex items-center gap-2 text-xl font-bold ${getConditionColor()}`}
                      >
                        <span>
                          {result
                            ? "✓"
                            : "●"}
                        </span>

                        <span>
                          {getConditionLabel()}
                        </span>
                      </div>

                      {result && (
                        <p
                          className={`mt-2 text-sm font-semibold ${getConditionColor()}`}
                        >
                          {result.condition}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* OBJECT COUNTS */}

                <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-cyan-500/10 bg-[#031326]">
                  {[
                    {
                      name: "Total Objects",
                      count: totalObjects,
                      icon: "🔷",
                    },
                    {
                      name: "RoadDamages",
                      count: roadDamageCount,
                      icon: "⚠️",
                    },
                    {
                      name: "SpeedBump",
                      count: speedBumpCount,
                      icon: "🚧",
                    },
                    {
                      name: "UnsurfacedRoad",
                      count:
                        unsurfacedRoadCount,
                      icon: "🛣️",
                    },
                    {
                      name: "LMV",
                      count: getCount("LMV"),
                      icon: "🚗",
                    },
                    {
                      name: "HMV",
                      count: getCount("HMV"),
                      icon: "🚛",
                    },
                    {
                      name: "Pedestrian",
                      count:
                        getCount(
                          "Pedestrian"
                        ),
                      icon: "🧍",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between px-5 py-3 ${
                        index !== 6
                          ? "border-b border-white/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {item.icon}
                        </span>

                        <span className="text-sm font-medium text-gray-300">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-lg font-bold text-white">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CONFIDENCE */}

                {result && (
                  <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-gray-500">
                        Average Confidence
                      </span>

                      <span className="font-bold text-cyan-300">
                        {averageConfidence.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            averageConfidence,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                RESULTS DETAILS
            ================================================= */}

            {result && (
              <div className="mt-6 space-y-6">
                {/* =================================================
                    DETECTION OVERVIEW
                ================================================= */}

                <section className="rounded-2xl border border-cyan-500/20 bg-[#041a30] p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                      📊 Detection Overview
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Number of objects and
                      road conditions detected
                      by the AI model.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {OBJECT_CLASSES.map(
                      (className) => {
                        const count =
                          getCount(
                            className
                          );

                        return (
                          <div
                            key={className}
                            className="rounded-xl border border-white/10 bg-[#031326] p-4"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {getObjectIcon(
                                    className
                                  )}
                                </span>

                                <span className="font-semibold">
                                  {className}
                                </span>
                              </div>

                              <span className="font-bold text-cyan-300">
                                {count}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                                style={{
                                  width: `${getBarWidth(
                                    count
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>

                {/* =================================================
                    ROAD SAFETY ANALYSIS
                ================================================= */}

                <section className="rounded-2xl border border-cyan-500/20 bg-[#041a30] p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                      🤖 AI Road Safety Analysis
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Key road-condition findings
                      from the detected objects.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <SafetyCard
                      title="Road Damage"
                      count={roadDamageCount}
                      icon="⚠️"
                      description={
                        roadDamageCount > 0
                          ? "Road damage was detected. This area may require inspection or maintenance."
                          : "No road damage was detected in this image."
                      }
                    />

                    <SafetyCard
                      title="Speed Bump"
                      count={speedBumpCount}
                      icon="🚧"
                      description={
                        speedBumpCount > 0
                          ? "A speed bump was detected. Drivers should remain alert and maintain an appropriate speed."
                          : "No speed bump was detected in this image."
                      }
                    />

                    <SafetyCard
                      title="Unsurfaced Road"
                      count={
                        unsurfacedRoadCount
                      }
                      icon="🛣️"
                      description={
                        unsurfacedRoadCount >
                        0
                          ? "An unsurfaced road area was detected and may require attention."
                          : "No unsurfaced road was detected in this image."
                      }
                    />
                  </div>
                </section>

                {/* =================================================
                    DETECTED OBJECTS
                ================================================= */}

                <section className="rounded-2xl border border-cyan-500/20 bg-[#041a30] p-6">
                  <h2 className="mb-5 text-2xl font-bold">
                    🔎 Detected Objects
                  </h2>

                  {result.detections.length ===
                  0 ? (
                    <p className="text-gray-400">
                      No objects detected.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.detections.map(
                        (
                          detection,
                          index
                        ) => (
                          <div
                            key={`${detection.name}-${index}`}
                            className="rounded-xl border border-white/10 bg-[#031326] p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>
                                  {getObjectIcon(
                                    detection.name
                                  )}
                                </span>

                                <span className="font-semibold">
                                  {
                                    detection.name
                                  }
                                </span>
                              </div>

                              <span className="text-sm font-bold text-cyan-300">
                                {detection.confidence.toFixed(
                                  2
                                )}
                                %
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-cyan-400"
                                style={{
                                  width: `${Math.min(
                                    detection.confidence,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>

                {/* =================================================
                    DOWNLOAD REPORT
                ================================================= */}

                <section className="flex flex-col gap-5 rounded-2xl border border-cyan-500/20 bg-[#041a30] p-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      📄 Road Analysis Report
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Download the current AI
                      analysis as a PDF.
                    </p>
                  </div>

                  <button
                    onClick={downloadReport}
                    className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-[#00111f] transition hover:bg-cyan-400"
                  >
                    📄 Download Report
                  </button>
                </section>

                {/* =================================================
                    REPORT ISSUE
                ================================================= */}

                {(roadDamageCount > 0 ||
                  unsurfacedRoadCount >
                    0) && (
                  <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                          Road Issue Detected
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          🚨 Report / Raise
                          Complaint
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                          Report this detected
                          road issue for
                          further inspection.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setShowComplaint(
                            true
                          )
                        }
                        className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-400"
                      >
                        🚨 Report This Issue
                      </button>
                    </div>
                  </section>
                )}

                {/* =================================================
                    COMPLAINT FORM
                ================================================= */}

                {showComplaint && (
                  <section className="rounded-2xl border border-red-400/20 bg-[#041a30] p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          🚨 Raise Road Complaint
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                          Provide basic details
                          about the detected
                          issue.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setShowComplaint(
                            false
                          )
                        }
                        className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/10 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Detected Issue
                        </label>

                        <input
                          type="text"
                          value={
                            roadDamageCount >
                            0
                              ? "Road Damage"
                              : "Unsurfaced Road"
                          }
                          readOnly
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-300 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Location
                        </label>

                        <input
                          type="text"
                          placeholder="Enter road/location"
                          value={
                            complaintLocation
                          }
                          onChange={(event) =>
                            setComplaintLocation(
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-medium">
                        Description
                      </label>

                      <textarea
                        rows={4}
                        placeholder="Describe the road issue..."
                        value={
                          complaintDescription
                        }
                        onChange={(event) =>
                          setComplaintDescription(
                            event.target
                              .value
                          )
                        }
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="mt-5">
                      <p className="mb-2 text-sm font-medium">
                        Evidence Image
                      </p>

                      {result && (
                        <img
                          src={`${API_BASE_URL}${result.image_url}`}
                          alt="Road issue evidence"
                          className="max-h-48 rounded-xl object-contain"
                        />
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={
                          handleComplaintSubmit
                        }
                        className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-400"
                      >
                        Submit Complaint
                      </button>

                      <button
                        onClick={() =>
                          setShowComplaint(
                            false
                          )
                        }
                        className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-gray-300 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </section>
                )}

                {/* =================================================
                    COMPLAINT SUCCESS
                ================================================= */}

                {complaintSubmitted && (
                  <section className="rounded-2xl border border-green-400/30 bg-green-400/10 p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">
                        ✅
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-green-400">
                          Complaint Submitted
                          Successfully
                        </h2>

                        <p className="mt-2 text-gray-300">
                          Your road issue report
                          has been recorded
                          successfully.
                        </p>

                        <p className="mt-3">
                          Complaint ID:{" "}
                          <strong className="text-green-400">
                            {complaintId}
                          </strong>
                        </p>

                        <p className="mt-2 text-sm text-gray-400">
                          Status: Submitted
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* =================================================
                    SCAN HISTORY
                ================================================= */}

                {scanHistory.length > 0 && (
                  <section className="rounded-2xl border border-cyan-500/20 bg-[#041a30] p-6">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          🕒 Recent Scan History
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                          Recent road analysis
                          results stored in
                          this browser.
                        </p>
                      </div>

                      <button
                        onClick={
                          clearHistory
                        }
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Clear History
                      </button>
                    </div>

                    <div className="space-y-3">
                      {scanHistory.map(
                        (scan) => (
                          <div
                            key={scan.id}
                            className="rounded-xl border border-white/10 bg-[#031326] p-4"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-xs text-gray-500">
                                  {scan.date}
                                </p>

                                <p className="mt-1 font-semibold">
                                  Road Condition:{" "}
                                  <span className="text-cyan-300">
                                    {
                                      scan.condition
                                    }
                                  </span>
                                </p>
                              </div>

                              <div className="flex gap-6">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Score
                                  </p>

                                  <p className="font-bold">
                                    {scan.score}
                                    /100
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500">
                                    Objects
                                  </p>

                                  <p className="font-bold">
                                    {
                                      scan
                                        .detections
                                        .length
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {scan.detections
                                .length >
                              0 ? (
                                scan.detections.map(
                                  (
                                    item,
                                    index
                                  ) => (
                                    <span
                                      key={`${item}-${index}`}
                                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                                    >
                                      {
                                        item
                                      }
                                    </span>
                                  )
                                )
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No objects
                                  detected
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SAFETY CARD
========================================================= */

function SafetyCard({
  title,
  count,
  icon,
  description,
}: {
  title: string;
  count: number;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#031326] p-5 transition hover:border-cyan-400/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {icon}
          </span>

          <h3 className="font-semibold">
            {title}
          </h3>
        </div>

        <span className="text-2xl font-bold text-cyan-300">
          {count}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </div>
  );
}

export default Analyze;
import { useState } from "react";
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

  /* ================= FILE UPLOAD ================= */

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

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

  /* ================= AI ANALYSIS ================= */

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setComplaintSubmitted(false);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI server error");
      }

      const data: AnalysisResult = await response.json();

      setResult(data);

      /* ================= SAVE SCAN HISTORY ================= */

      const roadDamage = data.detections.filter(
        (item) => item.name === "RoadDamages"
      ).length;

      const unsurfaced = data.detections.filter(
        (item) => item.name === "UnsurfacedRoad"
      ).length;

      const speedBumps = data.detections.filter(
        (item) => item.name === "SpeedBump"
      ).length;

      let score = 100;

      score -= roadDamage * 20;
      score -= unsurfaced * 20;
      score -= speedBumps * 5;

      score = Math.max(0, Math.min(100, score));

      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        condition: data.condition,
        score,
        detections: data.detections.map((item) => item.name),
      };

      const savedHistory = [historyItem, ...scanHistory].slice(0, 10);

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

  /* ================= DETECTION COUNT ================= */

  const getCount = (className: string) => {
    if (!result) return 0;

    return result.detections.filter(
      (detection) => detection.name === className
    ).length;
  };

  const totalObjects = result?.detections.length || 0;

  const averageConfidence =
    result && result.detections.length > 0
      ? result.detections.reduce(
          (sum, detection) => sum + detection.confidence,
          0
        ) / result.detections.length
      : 0;

  const roadDamageCount = getCount("RoadDamages");
  const speedBumpCount = getCount("SpeedBump");
  const unsurfacedRoadCount = getCount("UnsurfacedRoad");

  /* ================= ROAD CONDITION SCORE ================= */

  const calculateConditionScore = () => {
    if (!result) return 0;

    let score = 100;

    score -= roadDamageCount * 20;
    score -= unsurfacedRoadCount * 20;
    score -= speedBumpCount * 5;

    return Math.max(0, Math.min(100, score));
  };

  const conditionScore = calculateConditionScore();

  /* ================= CHART BAR WIDTH ================= */

  const getBarWidth = (count: number) => {
    if (totalObjects === 0) return 0;

    return Math.max((count / totalObjects) * 100, count > 0 ? 8 : 0);
  };

  /* ================= CONDITION STYLE ================= */

  const getConditionClass = () => {
    if (!result) return "";

    if (result.condition === "BAD") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (result.condition === "MODERATE") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }

    return "border-green-500/30 bg-green-500/10 text-green-400";
  };

  /* ================= COMPLAINT ID ================= */

  const generateComplaintId = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return `RC-${new Date().getFullYear()}-${randomNumber}`;
  };

  /* ================= COMPLAINT SUBMIT ================= */

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

  /* ================= CLEAR HISTORY ================= */

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem("roadScanHistory");
  };

  /* ================= DOWNLOAD PDF REPORT ================= */

  const downloadReport = () => {
    if (!result) return;

    const pdf = new jsPDF();

    const reportDate = new Date().toLocaleString();

    pdf.setFontSize(20);
    pdf.text("AI Road Condition Analysis Report", 20, 20);

    pdf.setFontSize(11);
    pdf.text(`Generated: ${reportDate}`, 20, 30);

    pdf.setFontSize(15);
    pdf.text("Road Condition", 20, 45);

    pdf.setFontSize(12);
    pdf.text(`Condition: ${result.condition}`, 20, 55);
    pdf.text(`Condition Score: ${conditionScore}/100`, 20, 65);

    pdf.text(
      `Average Detection Confidence: ${averageConfidence.toFixed(1)}%`,
      20,
      75
    );

    pdf.setFontSize(15);
    pdf.text("Detection Summary", 20, 90);

    pdf.setFontSize(12);

    let y = 100;

    OBJECT_CLASSES.forEach((className) => {
      pdf.text(`${className}: ${getCount(className)}`, 25, y);
      y += 8;
    });

    y += 5;

    pdf.setFontSize(15);
    pdf.text("Road Safety Analysis", 20, y);

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

    y += 8;

    pdf.setFontSize(10);

    pdf.text(
      "Prototype notice: This report is based on AI model detections",
      20,
      y
    );

    pdf.text(
      "and is not an official engineering road assessment.",
      20,
      y + 6
    );

    pdf.save("road-condition-report.pdf");
  };

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
            AI Road Analysis
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Analyze Road Condition
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Upload a road image and let the AI model detect vehicles,
            pedestrians and road conditions.
          </p>
        </div>

        {/* ================= UPLOAD ================= */}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="grid gap-8 lg:grid-cols-2">

            {/* Upload */}

            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Upload Road Image
              </h2>

              <label
                htmlFor="road-image"
                className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/10 p-6 text-center transition hover:border-cyan-400/50"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Selected road"
                    className="max-h-64 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <div className="mb-4 text-5xl">📷</div>

                    <p className="font-medium">
                      Click to upload an image
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                      JPG, JPEG or PNG
                    </p>
                  </>
                )}
              </label>

              <input
                id="road-image"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0] || null)
                }
              />

              {selectedFile && (
                <p className="mt-3 text-sm text-gray-400">
                  Selected: {selectedFile.name}
                </p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="mt-5 w-full rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "🔄 Analyzing..." : "🤖 Analyze Road"}
              </button>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>

            {/* Result Image */}

            <div>
              <h2 className="mb-4 text-xl font-semibold">
                AI Result
              </h2>

              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-white/10 bg-black/20 p-4">
                {result ? (
                  <img
                    src={`${API_BASE_URL}${result.image_url}`}
                    alt="AI analyzed road"
                    className="max-h-[400px] rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="mb-3 text-5xl">🛣️</div>

                    <p>
                      AI result will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ================= RESULTS ================= */}

        {result && (
          <div className="mt-8 space-y-8">

            {/* ================= ROAD CONDITION ================= */}

            <section
              className={`rounded-2xl border p-6 ${getConditionClass()}`}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-medium uppercase tracking-wider opacity-70">
                    AI Road Condition
                  </p>

                  <h2 className="mt-1 text-4xl font-bold">
                    {result.condition}
                  </h2>

                </div>

                <div className="rounded-xl bg-black/20 px-5 py-4">

                  <p className="text-sm opacity-70">
                    Average Confidence
                  </p>

                  <p className="text-2xl font-bold">
                    {averageConfidence.toFixed(1)}%
                  </p>

                </div>

              </div>

              {/* Condition Score */}

              <div className="mt-6 rounded-xl bg-black/20 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm opacity-70">
                      Prototype Road Condition Score
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {conditionScore}/100
                    </p>

                  </div>

                  <div className="text-4xl">
                    {conditionScore >= 80
                      ? "🟢"
                      : conditionScore >= 50
                      ? "🟡"
                      : "🔴"}
                  </div>

                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                    style={{
                      width: `${conditionScore}%`,
                    }}
                  />

                </div>

                <p className="mt-3 text-xs opacity-60">
                  This is a prototype score calculated from detected
                  road-condition classes and is not an official
                  engineering assessment.
                </p>

              </div>
            </section>

            {/* ================= DETECTION SUMMARY ================= */}

            <section>

              <h2 className="mb-4 text-2xl font-bold">
                Detection Summary
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                  title="LMV"
                  value={getCount("LMV")}
                  icon="🚗"
                />

                <StatCard
                  title="HMV"
                  value={getCount("HMV")}
                  icon="🚛"
                />

                <StatCard
                  title="Pedestrians"
                  value={getCount("Pedestrian")}
                  icon="🚶"
                />

                <StatCard
                  title="Total Objects"
                  value={totalObjects}
                  icon="🔍"
                />

              </div>

            </section>

            {/* ================= DETECTION CHART ================= */}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

              <div className="mb-6">

                <h2 className="text-2xl font-bold">
                  📊 Detection Overview
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Number of objects and road conditions detected by
                  the AI model.
                </p>

              </div>

              <div className="space-y-5">

                {OBJECT_CLASSES.map((className) => {

                  const count = getCount(className);

                  return (
                    <div key={className}>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="font-medium">
                          {className}
                        </span>

                        <span className="font-bold text-cyan-400">
                          {count}
                        </span>

                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">

                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                          style={{
                            width: `${getBarWidth(count)}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>

            </section>

            {/* ================= ROAD SAFETY ANALYSIS ================= */}

            <section>

              <div className="mb-6">

                <h2 className="text-2xl font-bold">
                  🤖 AI Road Safety Analysis
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Analysis based on objects detected in the uploaded
                  image.
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
                      ? "A speed bump was detected. Drivers should be alert and maintain appropriate speed."
                      : "No speed bump was detected in this image."
                  }
                />

                <SafetyCard
                  title="Unsurfaced Road"
                  count={unsurfacedRoadCount}
                  icon="🛣️"
                  description={
                    unsurfacedRoadCount > 0
                      ? "An unsurfaced road area was detected and may require attention."
                      : "No unsurfaced road was detected in this image."
                  }
                />

              </div>

            </section>

            {/* ================= CONFIDENCE ================= */}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Detection Confidence
                  </h2>

                  <p className="text-sm text-gray-400">
                    Average confidence of detected objects
                  </p>

                </div>

                <span className="text-2xl font-bold text-cyan-400">
                  {averageConfidence.toFixed(1)}%
                </span>

              </div>

              <div className="h-4 overflow-hidden rounded-full bg-white/10">

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

            </section>

            {/* ================= AI SUMMARY ================= */}

            <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

              <h2 className="text-2xl font-bold">
                🧠 AI Analysis Summary
              </h2>

              <div className="mt-4 space-y-3 text-gray-300">

                <p>
                  The AI model detected{" "}
                  <strong className="text-white">
                    {totalObjects}
                  </strong>{" "}
                  object
                  {totalObjects !== 1 ? "s" : ""} in the uploaded image.
                </p>

                {roadDamageCount > 0 && (
                  <p>
                    ⚠️ Road damage has been detected. The location
                    should be considered for further inspection.
                  </p>
                )}

                {unsurfacedRoadCount > 0 && (
                  <p>
                    🛣️ An unsurfaced road area has been detected.
                  </p>
                )}

                {speedBumpCount > 0 && (
                  <p>
                    🚧 A speed bump has been detected. Drivers should
                    maintain an appropriate speed.
                  </p>
                )}

                {roadDamageCount === 0 &&
                  unsurfacedRoadCount === 0 &&
                  speedBumpCount === 0 && (
                    <p>
                      ✅ No road-condition anomaly was detected in
                      this image by the current model.
                    </p>
                  )}

                <p className="text-sm text-gray-400">
                  Note: AI detection is based on the trained model and
                  should be treated as a decision-support result, not
                  a definitive road safety assessment.
                </p>

              </div>

            </section>

            {/* ================= DETECTED OBJECTS ================= */}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

              <h2 className="mb-5 text-2xl font-bold">
                🔎 Detected Objects
              </h2>

              {result.detections.length === 0 ? (
                <p className="text-gray-400">
                  No objects detected.
                </p>
              ) : (
                <div className="space-y-4">

                  {result.detections.map((detection, index) => (

                    <div
                      key={`${detection.name}-${index}`}
                      className="rounded-xl border border-white/10 bg-black/10 p-4"
                    >

                      <div className="mb-2 flex items-center justify-between">

                        <span className="font-semibold">
                          {detection.name}
                        </span>

                        <span className="text-sm font-bold text-cyan-400">
                          {detection.confidence.toFixed(2)}%
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

                  ))}

                </div>
              )}

            </section>

            {/* ================= DOWNLOAD REPORT ================= */}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    📄 Road Analysis Report
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Download the current AI analysis as a PDF report.
                  </p>

                </div>

                <button
                  onClick={downloadReport}
                  className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
                >
                  📄 Download Report
                </button>

              </div>

            </section>

            {/* ================= REPORT ISSUE ================= */}

            {(roadDamageCount > 0 ||
              unsurfacedRoadCount > 0) && (

              <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                      Road Issue Detected
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      🚨 Report / Raise Complaint
                    </h2>

                    <p className="mt-2 max-w-2xl text-gray-400">
                      Report this detected road issue for further
                      inspection.
                    </p>

                  </div>

                  <button
                    onClick={() => setShowComplaint(true)}
                    className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-400"
                  >
                    🚨 Report This Issue
                  </button>

                </div>

              </section>
            )}

            {/* ================= COMPLAINT FORM ================= */}

            {showComplaint && (

              <section className="rounded-2xl border border-red-400/20 bg-white/5 p-6">

                <div className="mb-6 flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-bold">
                      🚨 Raise Road Complaint
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Provide basic details about the detected issue.
                    </p>

                  </div>

                  <button
                    onClick={() => setShowComplaint(false)}
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
                        roadDamageCount > 0
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
                      value={complaintLocation}
                      onChange={(e) =>
                        setComplaintLocation(e.target.value)
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
                    value={complaintDescription}
                    onChange={(e) =>
                      setComplaintDescription(e.target.value)
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
                    onClick={handleComplaintSubmit}
                    className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-400"
                  >
                    Submit Complaint
                  </button>

                  <button
                    onClick={() => setShowComplaint(false)}
                    className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>

                </div>

                <p className="mt-4 text-xs text-gray-500">
                  Prototype notice: this report is currently recorded
                  only in the frontend demonstration and is not directly
                  submitted to a government authority.
                </p>

              </section>
            )}

            {/* ================= COMPLAINT SUCCESS ================= */}

            {complaintSubmitted && (

              <section className="rounded-2xl border border-green-400/30 bg-green-400/10 p-6">

                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    ✅
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-green-400">
                      Complaint Submitted Successfully
                    </h2>

                    <p className="mt-2 text-gray-300">
                      Your road issue report has been recorded in the
                      prototype system.
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

            {/* ================= SCAN HISTORY ================= */}

            {scanHistory.length > 0 && (

              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h2 className="text-2xl font-bold">
                      🕒 Recent Scan History
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Recent road analysis results stored in this
                      browser.
                    </p>

                  </div>

                  <button
                    onClick={clearHistory}
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Clear History
                  </button>

                </div>

                <div className="space-y-4">

                  {scanHistory.map((scan) => (

                    <div
                      key={scan.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-4"
                    >

                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <div>

                          <p className="text-sm text-gray-400">
                            {scan.date}
                          </p>

                          <p className="mt-1 font-semibold">
                            Road Condition:{" "}
                            <span className="text-cyan-400">
                              {scan.condition}
                            </span>
                          </p>

                        </div>

                        <div className="flex gap-6">

                          <div>
                            <p className="text-xs text-gray-500">
                              Score
                            </p>

                            <p className="font-bold">
                              {scan.score}/100
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Objects
                            </p>

                            <p className="font-bold">
                              {scan.detections.length}
                            </p>
                          </div>

                        </div>

                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {scan.detections.length > 0 ? (
                          scan.detections.map((item, index) => (

                            <span
                              key={`${item}-${index}`}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                            >
                              {item}
                            </span>

                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No objects detected
                          </span>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              </section>
            )}

          </div>
        )}
      </div>
    </main>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-400">
          {title}
        </span>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

/* ================= SAFETY CARD ================= */

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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

      <div className="flex items-center justify-between">

        <h3 className="font-semibold">
          {title}
        </h3>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

      <p className="mt-4 text-3xl font-bold">
        {count}
      </p>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {description}
      </p>

    </div>
  );
}

export default Analyze;
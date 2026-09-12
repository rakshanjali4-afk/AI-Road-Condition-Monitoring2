export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const PREDICT_ENDPOINT = "/predict";

export interface Detection {
  name: string;
  confidence: number;
}

export interface PredictResponse {
  condition: string;
  image_url: string;
  detections: Detection[];
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export function validateImageFile(file: File): string | null {
  const fileName = file.name.toLowerCase();
  const hasValidType = VALID_TYPES.includes(file.type);
  const hasValidExtension = VALID_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    return "Unsupported file type. Please upload a JPG, JPEG, or PNG image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`;
  }

  return null;
}

export async function predictRoadCondition(
  image: File,
  onProgress?: (phase: string) => void
): Promise<PredictResponse> {
  onProgress?.("uploading");

  const formData = new FormData();
  formData.append("image", image);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${PREDICT_ENDPOINT}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Unable to connect to the AI server. Please make sure your Flask backend is running."
    );
  }

  onProgress?.("analyzing");

  if (response.status === 404) {
    throw new ApiError(
      "The AI server is running but the prediction endpoint was not found. Check that your Flask backend exposes /predict."
    );
  }

  if (response.status === 413) {
    throw new ApiError(
      "The image was rejected by the server because it is too large."
    );
  }

  if (response.status === 500) {
    throw new ApiError(
      "The AI server encountered an error while processing the image. Check your Flask backend logs."
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The AI server returned an unexpected response (status ${response.status}). Please try again.`
    );
  }

  onProgress?.("detecting");

  let data: PredictResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "The AI server returned an invalid response. Please try again with a different image."
    );
  }

  onProgress?.("complete");

  if (!data.condition || typeof data.condition !== "string") {
    throw new ApiError("The AI server returned an incomplete result.");
  }

  return data;
}

export function buildImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${API_BASE_URL}${imageUrl}`;
}

export type ConditionLevel = "GOOD" | "MODERATE" | "BAD";

export function normalizeCondition(condition: string): ConditionLevel {
  const upper = condition.toUpperCase().trim();
  if (upper === "GOOD") return "GOOD";
  if (upper === "MODERATE") return "MODERATE";
  if (upper === "BAD") return "BAD";
  return "MODERATE";
}

export interface DetectionCounts {
  roadDamage: number;
  speedBump: number;
  unsurfacedRoad: number;
  total: number;
}

export function countDetections(detections: Detection[]): DetectionCounts {
  return {
    roadDamage: detections.filter((d) => d.name === "RoadDamages").length,
    speedBump: detections.filter((d) => d.name === "SpeedBump").length,
    unsurfacedRoad: detections.filter((d) => d.name === "UnsurfacedRoad").length,
    total: detections.length,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

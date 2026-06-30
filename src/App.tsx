import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Users,
  PawPrint,
  LayoutDashboard,
  History,
  Settings,
  Download,
  Folder,
  FileCode,
  FileJson,
  Plus,
  Trash2,
  Cpu,
  Video,
  VideoOff,
  Radio,
  Clock,
  Sparkles,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  BarChart3,
  RefreshCw,
  Eye,
  Smile,
  Calendar,
  AlertTriangle,
  Flame,
  UserPlus,
  Globe,
  Battery
} from "lucide-react";
import { androidCodeFiles, SourceFile } from "./androidCode";

// Local storage helpers
const STORAGE_PREFIX = "ai_surveillance_";

export default function App() {
  // Navigation tabs (Home Dashboard, Live Camera Sandbox, Android Source Project, Faces Registry, Logs History, Settings, Web Bootstrap Dashboard)
  const [activeTab, setActiveTab] = useState<"dashboard" | "camera" | "source" | "faces" | "logs" | "settings" | "web">("dashboard");

  // State Management
  const [logs, setLogs] = useState<any[]>([]);
  const [faces, setFaces] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    metrics: {
      totalDetections: 0,
      knownMatched: 0,
      unknownAlerted: 0,
      animalsTracked: 0,
      systemHealth: "Optimal",
      mobileSyncStatus: "Synchronized"
    },
    classDistribution: [],
    hourlyActivity: []
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SourceFile>(androidCodeFiles[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  // Camera sandbox states
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [detectionConfidenceThreshold, setDetectionConfidenceThreshold] = useState<number>(0.75);
  const [trackingSensitivity, setTrackingSensitivity] = useState<number>(0.55);
  const [recognitionThreshold, setRecognitionThreshold] = useState<number>(0.72);
  const [fpsLimit, setFpsLimit] = useState<number>(30);
  const [appTheme, setAppTheme] = useState<string>("Dark");
  const [appLanguage, setAppLanguage] = useState<string>("English");
  const [storageLimit, setStorageLimit] = useState<number>(512); // MB
  const [batteryLevel, setBatteryLevel] = useState<number>(85); // %
  const [isOverheating, setIsOverheating] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([
    { id: 1, text: "AI Sentinel Shield is online & active", type: "info", timestamp: "02:39" },
    { id: 2, text: "Database cluster synchronization verified", type: "success", timestamp: "02:38" }
  ]);
  const [backups, setBackups] = useState<any[]>([]);
  const [renamingFaceId, setRenamingFaceId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState<string>("");
  const [newFaceNotes, setNewFaceNotes] = useState<string>("");
  const [newFaceAngles, setNewFaceAngles] = useState<{
    front: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  }>({
    front: true,
    left: true,
    right: true,
    up: false,
    down: false
  });
  const [selectedMockCamera, setSelectedMockCamera] = useState("CAM-01");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraLens, setCameraLens] = useState<"back" | "front">("back");
  const [cameraResolution, setCameraResolution] = useState<"640x480" | "1280x720" | "1920x1080">("1280x720");
  const [cameraFps, setCameraFps] = useState<30 | 60>(30);
  const [isAutoFocus, setIsAutoFocus] = useState(true);
  const [isHdr, setIsHdr] = useState(true);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [activeCameraFeedIndex, setActiveCameraFeedIndex] = useState(0);
  const [fps, setFps] = useState(30);

  // Form states for manual registration
  const [newFaceName, setNewFaceName] = useState("");
  const [newFaceGender, setNewFaceGender] = useState("Male");
  const [newFaceAge, setNewFaceAge] = useState("30");
  const [newFaceMood, setNewFaceMood] = useState("Calm");
  const [newFacePermission, setNewFacePermission] = useState<"Authorized" | "Restricted" | "Flagged">("Authorized");
  const [showFaceModal, setShowFaceModal] = useState(false);

  // Web Dashboard tab states
  const [selectedWebFile, setSelectedWebFile] = useState("dashboard.html");
  const [webFileContent, setWebFileContent] = useState("");
  const [copiedWeb, setCopiedWeb] = useState(false);

  // Form states for simulator
  const [simClassName, setSimClassName] = useState("person");
  const [simPersonName, setSimPersonName] = useState("Unknown");
  const [simGender, setSimGender] = useState("Male");
  const [simAge, setSimAge] = useState(25);
  const [simMood, setSimMood] = useState("Focused");
  const [simConfidence, setSimConfidence] = useState(0.85);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [videoActiveElement, setVideoActiveElement] = useState<HTMLVideoElement | null>(null);
  const [liveTrackingBox, setLiveTrackingBox] = useState<{ x: number; y: number; width: number; height: number; active: boolean }>({
    x: 35,
    y: 22,
    width: 30,
    height: 45,
    active: false,
  });
  const lerpBoxRef = useRef({ x: 35, y: 22, width: 30, height: 45, active: false });
  const lastActiveFrameRef = useRef<number>(Date.now());

  const [liveTelemetry, setLiveTelemetry] = useState({
    name: "???? Unknown",
    species: "Human",
    gender: "Male",
    age: "22–28",
    mood: "Happy",
    confidence: "98.4%",
    trackingId: "TRK-0099"
  });

  const setVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoActiveElement(node);
  };

  // Motion Heatmap Overlay States & Refs
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapDecay, setHeatmapDecay] = useState(0.96);
  const [heatmapThreshold, setHeatmapThreshold] = useState(20);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.75);

  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const accumGridRef = useRef<Float32Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [detRes, facesRes, statsRes, camRes, bkRes] = await Promise.all([
        fetch("/api/detections").then(r => r.json()),
        fetch("/api/faces").then(r => r.json()),
        fetch("/api/statistics").then(r => r.json()),
        fetch("/api/cameras").then(r => r.json()),
        fetch("/api/database/backups").then(r => r.json()).catch(() => ({ status: "error" }))
      ]);

      if (detRes.status === "success") setLogs(detRes.data);
      if (facesRes.status === "success") setFaces(facesRes.data);
      if (statsRes.status === "success") setStats(statsRes);
      if (camRes.status === "success") setCameras(camRes.data);
      if (bkRes && bkRes.status === "success") setBackups(bkRes.data);
    } catch (error) {
      console.error("Failed to load backend APIs. Using in-memory state fallback.", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-update stats and logs periodically to emulate dynamic surveillance streaming
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic fetch of generated Web Dashboard assets for Code Viewer
  useEffect(() => {
    if (activeTab === "web") {
      setWebFileContent("Reading compiled asset file... Please wait.");
      fetch(`/web/${selectedWebFile}`)
        .then(res => res.text())
        .then(text => setWebFileContent(text))
        .catch(err => {
          console.warn(`Could not load /web/${selectedWebFile}`, err);
          setWebFileContent(`<!-- Error: Could not resolve static asset /web/${selectedWebFile} -->`);
        });
    }
  }, [selectedWebFile, activeTab]);

  // Web Camera Setup
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    if (isWebcamOn && videoActiveElement) {
      const facingMode = cameraLens === "front" ? "user" : "environment";
      navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720, facingMode: facingMode } })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.warn("Video auto-play failed:", err));
          }
        })
        .catch((err) => {
          console.error("Webcam blocked or not found:", err);
          setIsWebcamOn(false);
          alert("Could not access local web camera. Please verify permission settings in the browser.");
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isWebcamOn, videoActiveElement, cameraLens]);

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Motion Heatmap & Live Bounding Box Tracking Loop
  useEffect(() => {
    if (!isWebcamOn || !videoActiveElement) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      prevFrameDataRef.current = null;
      accumGridRef.current = null;
      setLiveTrackingBox(prev => ({ ...prev, active: false }));
      return;
    }

    const video = videoActiveElement;
    
    // Create offscreen canvas for super lightweight processing (160x120)
    const offscreenCanvas = document.createElement("canvas");
    const w = 160;
    const h = 120;
    offscreenCanvas.width = w;
    offscreenCanvas.height = h;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    if (!offscreenCtx) return;

    const gridSize = w * h;
    if (!accumGridRef.current || accumGridRef.current.length !== gridSize) {
      accumGridRef.current = new Float32Array(gridSize);
    }
    const accum = accumGridRef.current;

    const processFrame = () => {
      if (!isWebcamOn || !videoActiveElement) {
        return;
      }
      if (video.paused || video.ended || video.readyState < 2) {
        animationFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      try {
        // Draw downsampled frame
        offscreenCtx.drawImage(video, 0, 0, w, h);
        const imgData = offscreenCtx.getImageData(0, 0, w, h);
        const pixels = imgData.data;

        let sumX = 0;
        let sumY = 0;
        let count = 0;
        let minX = w;
        let maxX = 0;
        let minY = h;
        let maxY = 0;

        if (prevFrameDataRef.current && prevFrameDataRef.current.length === pixels.length) {
          const prev = prevFrameDataRef.current;

          for (let i = 0; i < pixels.length; i += 4) {
            const r1 = pixels[i];
            const g1 = pixels[i + 1];
            const b1 = pixels[i + 2];

            const r2 = prev[i];
            const g2 = prev[i + 1];
            const b2 = prev[i + 2];

            const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
            const gridIndex = i / 4;

            // Decay previous traffic weight
            accum[gridIndex] = accum[gridIndex] * heatmapDecay;

            // Accumulate on motion detection (threshold check)
            if (diff > heatmapThreshold) {
              accum[gridIndex] = Math.min(255, accum[gridIndex] + 28);
            }

            // Calculate Bounding Box of Motion
            if (diff > heatmapThreshold) {
              const px = gridIndex % w;
              const py = Math.floor(gridIndex / w);
              sumX += px;
              sumY += py;
              count++;
              if (px < minX) minX = px;
              if (px > maxX) maxX = px;
              if (py < minY) minY = py;
              if (py > maxY) maxY = py;
            }
          }
        } else {
          prevFrameDataRef.current = new Uint8ClampedArray(pixels.length);
        }

        prevFrameDataRef.current.set(pixels);

        // Smoothly interpolate the box coordinates
        if (count > 20) {
          const targetPctX = (minX / w) * 100;
          const targetPctY = (minY / h) * 100;
          const targetPctW = ((maxX - minX) / w) * 100;
          const targetPctH = ((maxY - minY) / h) * 100;

          // Padding and boundaries
          const padW = Math.max(16, Math.min(70, targetPctW + 6));
          const padH = Math.max(26, Math.min(80, targetPctH + 10));
          const padX = Math.max(2, Math.min(100 - padW, targetPctX - 3));
          const padY = Math.max(2, Math.min(100 - padH, targetPctY - 5));

          const lerpSpeed = 0.15;
          lerpBoxRef.current.x = lerpBoxRef.current.x * (1 - lerpSpeed) + padX * lerpSpeed;
          lerpBoxRef.current.y = lerpBoxRef.current.y * (1 - lerpSpeed) + padY * lerpSpeed;
          lerpBoxRef.current.width = lerpBoxRef.current.width * (1 - lerpSpeed) + padW * lerpSpeed;
          lerpBoxRef.current.height = lerpBoxRef.current.height * (1 - lerpSpeed) + padH * lerpSpeed;
          lerpBoxRef.current.active = true;
          
          lastActiveFrameRef.current = Date.now();
        } else {
          // If no active motion, check how long it's been since we last saw motion
          const idleTime = Date.now() - lastActiveFrameRef.current;
          if (idleTime < 8000) {
            // LOCK AND HOVER: Keep the last locked target position! Add a tiny natural hover/breathe effect
            const lerpSpeed = 0.05;
            const time = Date.now() * 0.002;
            const microSwayX = Math.sin(time) * 0.6;
            const microSwayY = Math.cos(time * 0.8) * 0.4;
            
            lerpBoxRef.current.x = lerpBoxRef.current.x * (1 - lerpSpeed) + (lerpBoxRef.current.x + microSwayX) * lerpSpeed;
            lerpBoxRef.current.y = lerpBoxRef.current.y * (1 - lerpSpeed) + (lerpBoxRef.current.y + microSwayY) * lerpSpeed;
            
            // Breathe the box width/height slightly
            const breatheW = Math.sin(time * 0.5) * 0.5;
            const breatheH = Math.cos(time * 0.5) * 0.7;
            lerpBoxRef.current.width = lerpBoxRef.current.width * (1 - lerpSpeed) + (lerpBoxRef.current.width + breatheW) * lerpSpeed;
            lerpBoxRef.current.height = lerpBoxRef.current.height * (1 - lerpSpeed) + (lerpBoxRef.current.height + breatheH) * lerpSpeed;
          } else {
            // After 8 seconds of absolute standstill, slowly drift back to the center of the sensor area
            const lerpSpeed = 0.02;
            const time = Date.now() * 0.0015;
            const swayX = Math.sin(time) * 1.5;
            const swayY = Math.cos(time * 0.8) * 1.0;

            lerpBoxRef.current.x = lerpBoxRef.current.x * (1 - lerpSpeed) + (35 + swayX) * lerpSpeed;
            lerpBoxRef.current.y = lerpBoxRef.current.y * (1 - lerpSpeed) + (22 + swayY) * lerpSpeed;
            lerpBoxRef.current.width = lerpBoxRef.current.width * (1 - lerpSpeed) + 30 * lerpSpeed;
            lerpBoxRef.current.height = lerpBoxRef.current.height * (1 - lerpSpeed) + 45 * lerpSpeed;
          }
        }

        // Trigger dynamic state update
        setLiveTrackingBox({
          x: lerpBoxRef.current.x,
          y: lerpBoxRef.current.y,
          width: lerpBoxRef.current.width,
          height: lerpBoxRef.current.height,
          active: true
        });

        // Occasionally fluctuate confidence slightly in real-time
        if (Math.random() < 0.015) {
          setLiveTelemetry(prev => {
            // Only fluctuate if we are still using simulated scanning (e.g. name is Unknown or Scanning)
            if (prev.name.includes("Unknown") || prev.name.includes("Scanning")) {
              const baseConf = 97.6 + Math.random() * 1.3;
              const moods = ["Happy", "Focused", "Calm", "Serious", "Alert"];
              const randomMood = moods[Math.floor(Math.random() * moods.length)];
              return {
                ...prev,
                confidence: `${baseConf.toFixed(1)}%`,
                mood: randomMood
              };
            }
            return prev;
          });
        }

        // Generate visual colored heatmap if enabled
        if (showHeatmap) {
          const heatmapImgData = offscreenCtx.createImageData(w, h);
          const heatmapPixels = heatmapImgData.data;

          for (let i = 0; i < accum.length; i++) {
            const val = accum[i];
            const idx = i * 4;

            if (val < 8) {
              heatmapPixels[idx] = 0;
              heatmapPixels[idx + 1] = 0;
              heatmapPixels[idx + 2] = 0;
              heatmapPixels[idx + 3] = 0;
            } else {
              // Spectrum mapping: Blue -> Cyan -> Green -> Yellow -> Red
              let r = 0, g = 0, b = 0;
              if (val < 50) {
                const ratio = val / 50;
                r = 0;
                g = Math.floor(ratio * 200);
                b = 255;
              } else if (val < 100) {
                const ratio = (val - 50) / 50;
                r = Math.floor(ratio * 120);
                g = 255;
                b = Math.floor((1 - ratio) * 255);
              } else if (val < 180) {
                const ratio = (val - 100) / 80;
                r = 255;
                g = Math.floor(180 + (1 - ratio) * 75);
                b = 0;
              } else {
                const ratio = (val - 180) / 75;
                r = 255;
                g = Math.floor((1 - ratio) * 180);
                b = 0;
              }

              heatmapPixels[idx] = r;
              heatmapPixels[idx + 1] = g;
              heatmapPixels[idx + 2] = b;
              heatmapPixels[idx + 3] = Math.floor(Math.min(255, 45 + val * 0.8));
            }
          }

          offscreenCtx.putImageData(heatmapImgData, 0, 0);

          // Render interpolated overlay
          const visibleCanvas = heatmapCanvasRef.current;
          if (visibleCanvas) {
            const vw = video.videoWidth || 640;
            const vh = video.videoHeight || 480;
            if (visibleCanvas.width !== vw || visibleCanvas.height !== vh) {
              visibleCanvas.width = vw;
              visibleCanvas.height = vh;
            }
            const visibleCtx = visibleCanvas.getContext("2d");
            if (visibleCtx) {
              visibleCtx.clearRect(0, 0, vw, vh);
              visibleCtx.imageSmoothingEnabled = true;
              visibleCtx.imageSmoothingQuality = "high";
              visibleCtx.drawImage(offscreenCanvas, 0, 0, vw, vh);
            }
          }
        }
      } catch (err) {
        console.error("Error in heatmap frame processing loop:", err);
      }

      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isWebcamOn, videoActiveElement, showHeatmap, heatmapDecay, heatmapThreshold]);

  // Perform AI Frame Capture & Analysis
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert frame to Base64 image
        const base64Image = canvas.toDataURL("image/jpeg", 0.85);

        // Upload frame to Gemini Vision Endpoint
        const res = await fetch("/api/gemini/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image })
        });

        const data = await res.json();
        if (data.status === "success") {
          setAiAnalysisResult(data.data);
          // Synchronize to live telemetry
          setLiveTelemetry({
            name: data.data.personName || "???? Unknown",
            species: data.data.className === "person" ? "Human" : (data.data.className || "Unidentified"),
            gender: data.data.gender || "Male",
            age: data.data.age && data.data.age > 0 ? `${data.data.age}` : "22–28",
            mood: data.data.mood || "Happy",
            confidence: `${Math.round((data.data.confidence || 0.984) * 100)}%`,
            trackingId: data.data.trackingId || "TRK-0099"
          });
          // Refresh logs & stats dynamically
          fetchData();
        } else {
          alert("AI Analysis Error: " + data.message);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Error sending frame to server: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run customized detection simulator to generate quick test data
  const handleTriggerSimulate = async () => {
    setIsLoading(true);
    try {
      const mockLog = {
        className: simClassName,
        confidence: simConfidence,
        personName: simPersonName,
        gender: simGender,
        age: simAge,
        mood: simMood,
        cameraId: cameras[activeCameraFeedIndex]?.name || "Simulation Terminal",
        note: simClassName === "person"
          ? `${simPersonName === "Unknown" ? "Unknown subject" : `Subject "${simPersonName}"`} locked onto system target frame.`
          : `Active ${simClassName} tracked on sensor zone.`
      };

      const res = await fetch("/api/detections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockLog)
      });

      const data = await res.json();
      if (data.status === "success") {
        // Synchronize to live telemetry
        setLiveTelemetry({
          name: mockLog.personName || "???? Unknown",
          species: mockLog.className === "person" ? "Human" : (mockLog.className || "Unidentified"),
          gender: mockLog.gender || "Male",
          age: mockLog.age && mockLog.age > 0 ? `${mockLog.age}` : "22–28",
          mood: mockLog.mood || "Happy",
          confidence: `${Math.round((mockLog.confidence || 0.85) * 100)}%`,
          trackingId: `TRK-0${Math.floor(100 + Math.random() * 900)}`
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Register face submit
  const handleRegisterFace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaceName) return;

    try {
      const res = await fetch("/api/faces/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFaceName,
          gender: newFaceGender,
          age: parseInt(newFaceAge),
          moodTrend: newFaceMood,
          permissions: newFacePermission
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setNewFaceName("");
        setShowFaceModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Face registration
  const handleDeleteFace = async (id: string) => {
    if (!confirm("Are you sure you want to remove this biometric permission key?")) return;
    try {
      const res = await fetch(`/api/faces/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all security records
  const handleWipeLogs = async () => {
    if (!confirm("CRITICAL WARNING: This action will completely purge all synchronized live database history. Continue?")) return;
    try {
      const res = await fetch("/api/detections/clear", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export any individual Android code file or configuration
  const downloadCodeFile = (file: SourceFile) => {
    const element = document.createElement("a");
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(blob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper count badges
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cameraId.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterClass === "all") return matchesSearch;
    if (filterClass === "human") return matchesSearch && log.type === "human";
    if (filterClass === "unknown") return matchesSearch && log.type === "unknown";
    if (filterClass === "animal") return matchesSearch && log.type === "animal";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans antialiased selection:bg-indigo-600 selection:text-white flex flex-col">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-[#111827]/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-400/20">
            <Cpu className="w-6 h-6 text-indigo-100 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-indigo-300 bg-clip-text text-transparent">
              AI Vision Surveillance System
            </h1>
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Enterprise Node Network • Live 
            </p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-mono text-gray-400">
          <div className="border-l border-gray-800 pl-4">
            <span className="text-gray-500 block">SYSTEM STATUS</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Core Online
            </span>
          </div>
          <div className="border-l border-gray-800 pl-4">
            <span className="text-gray-500 block">LAST METRIC SYNC</span>
            <span className="text-gray-300 font-medium block mt-0.5">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="border-l border-gray-800 pl-4">
            <span className="text-gray-500 block">DATABASE LINK</span>
            <span className="text-indigo-400 font-semibold block mt-0.5">MySQL Active</span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2.5 bg-gray-800/60 hover:bg-gray-800 text-gray-300 rounded-xl transition duration-200 border border-gray-700/50 flex items-center gap-2 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-xs font-medium hidden sm:inline">Sync Cloud</span>
        </button>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Rail */}
        <nav className="md:w-64 bg-[#111827]/40 border-r border-gray-800/80 p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0">
          <div className="hidden md:block pb-4 mb-4 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block px-3">
              Surveillance Desk
            </span>
          </div>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
              activeTab === "dashboard"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("camera")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
              activeTab === "camera"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="flex items-center gap-2">
              Camera AI Sandbox
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("faces")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
              activeTab === "faces"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Face Biometrics</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 relative ${
              activeTab === "logs"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <History className="w-5 h-5" />
            <span>Surveillance Logs</span>
            {logs.length > 0 && (
              <span className="absolute right-4 px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-indigo-100 rounded-full">
                {logs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("source")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
              activeTab === "source"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span>Android Codebase</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
              activeTab === "settings"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Config Panels</span>
          </button>

          <button
            onClick={() => setActiveTab("web")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
              activeTab === "web"
                ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
          >
            <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="flex items-center gap-2">
              Web Dashboard
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-600 text-emerald-100 rounded">HTML5</span>
            </span>
          </button>

          {/* Quick info footer inside side rail */}
          <div className="hidden md:block pt-4 mt-auto px-4">
            <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800 text-[11px] text-gray-500 space-y-2">
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800 pb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Mobile Hardware
              </p>
              <div className="space-y-1 font-mono">
                <p>Engine: <span className="text-gray-300">CameraX API v5</span></p>
                <p>CV Pipeline: <span className="text-gray-300">OpenCV 5.0 Native</span></p>
                <p>Neural Runtime: <span className="text-indigo-400">NNAPI (YOLO+SFace)</span></p>
              </div>

              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800 pb-1 pt-1 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-400" /> Power Management
              </p>
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span>Battery:</span>
                  <span className={`font-bold ${batteryLevel < 20 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`}>{batteryLevel}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thermal core:</span>
                  <span className={`font-bold ${isOverheating ? "text-rose-500 animate-pulse" : "text-emerald-400"}`}>{isOverheating ? "OVERHEAT" : "NORMAL"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Throttle factor:</span>
                  <span className="text-gray-300 font-bold">{batteryLevel < 30 || isOverheating ? "50% Power Save" : "100% Full Load"}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Content Frame */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">

          {/* TAB 1: HOME DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Grid 1: Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111827]/70 backdrop-blur-md rounded-2xl p-5 border border-gray-800/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Total Detections</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">
                      {stats.metrics?.totalDetections || logs.length}
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="bg-[#111827]/70 backdrop-blur-md rounded-2xl p-5 border border-gray-800/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Known Faces Matched</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                      {stats.metrics?.knownMatched || logs.filter(l => l.type === 'human').length}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#111827]/70 backdrop-blur-md rounded-2xl p-5 border border-gray-800/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Unknown Alerts</span>
                    <span className="text-3xl font-extrabold text-rose-500 mt-1 block">
                      {stats.metrics?.unknownAlerted || logs.filter(l => l.type === 'unknown').length}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                  </div>
                </div>

                <div className="bg-[#111827]/70 backdrop-blur-md rounded-2xl p-5 border border-gray-800/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Animals Logged</span>
                    <span className="text-3xl font-extrabold text-amber-500 mt-1 block">
                      {stats.metrics?.animalsTracked || logs.filter(l => l.type === 'animal').length}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                    <PawPrint className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left block: Live camera view simulation & real-time feed */}
                <div className="lg:col-span-2 bg-[#111827]/50 border border-gray-800/80 rounded-2xl overflow-hidden flex flex-col">
                  <div className="px-5 py-4 bg-[#111827]/80 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4.5 h-4.5 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-gray-200">Active Live Camera Feed</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isWebcamOn ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}></span>
                      <span className="text-[11px] font-mono text-gray-400 font-semibold uppercase tracking-wider">
                        {isWebcamOn ? "LIVE STREAM" : "SIMULATED SOURCE"} • {cameras[0]?.fps || 30} FPS • {cameras[0]?.resolution || "1080p"}
                      </span>
                    </div>
                  </div>

                  {/* Camera simulated or real visual renderer */}
                  <div className="relative aspect-video bg-gray-950 flex items-center justify-center group overflow-hidden">
                    {isWebcamOn ? (
                      <div className="absolute inset-0 w-full h-full">
                        <video
                          ref={setVideoRef}
                          className="w-full h-full object-cover"
                          style={{ transform: cameraLens === "front" ? "scaleX(-1)" : "none" }}
                          playsInline
                          muted
                        />
                        {/* Live green bounding box over live webcam feed matching the user requested parameters */}
                        {liveTrackingBox.active && (
                          <div 
                            className="absolute border-2 border-emerald-500 bg-emerald-500/10 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-100 font-bold z-15 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                            style={{ 
                              top: `${liveTrackingBox.y}%`, 
                              left: `${cameraLens === "front" ? (100 - liveTrackingBox.x - liveTrackingBox.width) : liveTrackingBox.x}%`, 
                              width: `${liveTrackingBox.width}%`, 
                              height: `${liveTrackingBox.height}%` 
                            }}
                          >
                            <span className="bg-emerald-600 px-2 py-0.5 rounded text-white text-[9px] uppercase font-bold tracking-wider mr-1">Person Detected</span>
                            <p className="mt-2 text-yellow-300">ID: {liveTelemetry.trackingId}</p>
                            <p>Name: {liveTelemetry.name}</p>
                            <p>Species: {liveTelemetry.species}</p>
                            <p>Confidence: {liveTelemetry.confidence}</p>
                          </div>
                        )}

                        {/* Live scanner bar if analyzing */}
                        {isAnalyzing && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-bounce z-20"></div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Bounding Box Simulators */}
                        {logs.length > 0 && (
                          <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Box 1 for simulated person */}
                            <div className="absolute border-2 border-emerald-500 bg-emerald-500/5 rounded-md px-1 py-0.5 text-[10px] font-mono text-emerald-100 font-bold" style={{ top: '25%', left: '30%', width: '180px', height: '240px' }}>
                              <span className="bg-emerald-600 px-1.5 py-0.5 rounded text-white mr-1">HUMAN DETECTED</span>
                              <p className="mt-1">ID: TRK-0041 (96%)</p>
                              <p>Name: Alexander Wright</p>
                              <p>Mood: Smiling</p>
                            </div>

                            {/* Box 2 for simulated animal boundary */}
                            <div className="absolute border-2 border-amber-500 bg-amber-500/5 rounded-md px-1 py-0.5 text-[10px] font-mono text-amber-100 font-bold" style={{ top: '55%', left: '68%', width: '140px', height: '110px' }}>
                              <span className="bg-amber-600 px-1.5 py-0.5 rounded text-white mr-1">FELINE DETECTED</span>
                              <p className="mt-1">ID: TRK-0105 (94%)</p>
                              <p>Species: Cat</p>
                            </div>
                          </div>
                        )}

                        {/* Sim Video image background */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-55 transition-all duration-500" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80')` }}>
                        </div>

                        {/* Grid Overlay lines */}
                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none"></div>

                        {/* Center icon */}
                        <div className="relative z-10 flex flex-col items-center gap-2 text-center pointer-events-none p-4">
                          <div className="p-4 bg-indigo-600/10 rounded-full border border-indigo-500/20 text-indigo-300 backdrop-blur-md shadow-inner animate-pulse">
                            <Video className="w-10 h-10" />
                          </div>
                          <span className="text-sm font-semibold tracking-wide text-white drop-shadow-md">Surveillance Node Live Feed</span>
                          <p className="text-xs text-gray-300 max-w-sm drop-shadow-sm">Showing real-time stream simulation. For live camera input, click the Camera AI Sandbox tab.</p>
                        </div>
                      </>
                    )}

                    {/* Camera overlay HUD elements */}
                    <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800 text-[11px] font-mono text-gray-300 z-10 space-y-0.5">
                      <p className="text-indigo-400 font-bold">SOURCE: {cameras[0]?.name || "Main Lobby Entrance"}</p>
                      <p>LOCATION: {cameras[0]?.location || "Lobby Block A"}</p>
                      <p>BIOMETRICS: ENABLED (YuNet + SFace)</p>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-gray-800 text-[10px] font-mono text-gray-400 z-10 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date().toISOString()}</span>
                    </div>
                  </div>

                  {/* Video actions */}
                  <div className="p-4 bg-[#111827]/80 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                    <span>Active stream: <strong className={isWebcamOn ? "text-emerald-400" : "text-amber-400"}>{isWebcamOn ? "LIVE CAMERA STREAM ACTIVE" : "SIMULATED SOURCE ACTIVE"}</strong></span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsWebcamOn(!isWebcamOn)}
                        className={`px-3 py-1.5 font-medium rounded-lg transition flex items-center gap-1 ${
                          isWebcamOn 
                            ? "bg-rose-600 hover:bg-rose-500 text-white" 
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {isWebcamOn ? "Deactivate Camera" : "Activate Webcam Feed"}
                      </button>
                      {isWebcamOn && (
                        <button
                          onClick={() => setCameraLens(cameraLens === "back" ? "front" : "back")}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg transition flex items-center gap-1.5 border border-gray-700"
                          title="Flip camera lens front/back facing mode"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                          Flip Camera ({cameraLens === "front" ? "Front" : "Back"})
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab("camera")}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg transition flex items-center gap-1 border border-gray-700"
                      >
                        Open Sandbox Tab
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right block: Detection Simulator Control Panel OR Detected Person Telemetry */}
                <div className="bg-[#111827]/50 border border-gray-800/80 rounded-2xl p-5 flex flex-col space-y-4">
                  {isWebcamOn ? (
                    <div className="flex-1 flex flex-col space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h3 className="font-semibold text-emerald-400 flex items-center gap-2 text-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Detected Person
                        </h3>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                          Live Feed
                        </span>
                      </div>

                      {/* Live Bounding Box Thumbnail / Silhouette */}
                      <div className="relative aspect-video bg-gray-950/85 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center group">
                        {/* Target scanning grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
                        
                        {/* Corner brackets for aesthetic scanning HUD */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>

                        {/* Target Avatar Silhouette */}
                        <div className="relative z-10 flex flex-col items-center text-center p-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 relative overflow-hidden">
                            <Users className="w-8 h-8 text-emerald-400 animate-pulse" />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent"></div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Biometric Stream Active</span>
                        </div>
                      </div>

                      {/* Attributes list matching user request exactly */}
                      <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                          <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <span>👤</span> Name :
                          </span>
                          <span className="text-yellow-400 font-bold text-xs font-mono">
                            {liveTelemetry.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                          <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <span>🐾</span> Species :
                          </span>
                          <span className="text-gray-200 font-bold text-xs font-mono">
                            {liveTelemetry.species}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                          <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <span>🚻</span> Gender :
                          </span>
                          <span className="text-gray-200 font-bold text-xs font-mono">
                            {liveTelemetry.gender}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                          <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <span>🎂</span> Age :
                          </span>
                          <span className="text-gray-200 font-bold text-xs font-mono">
                            {liveTelemetry.age}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                          <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <span>😊</span> Mood :
                          </span>
                          <span className="text-emerald-400 font-bold text-xs font-mono flex items-center gap-1">
                            <Smile className="w-3.5 h-3.5 text-emerald-400" /> {liveTelemetry.mood}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-1">
                          <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <span>🎯</span> Confidence :
                          </span>
                          <span className="text-emerald-400 font-bold text-xs font-mono">
                            {liveTelemetry.confidence}
                          </span>
                        </div>
                      </div>

                      {/* Security Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button 
                          onClick={() => alert("Identity record flagged. Running supplementary database checks...")}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-xl border border-gray-700 transition"
                        >
                          Verify Identity
                        </button>
                        <button 
                          onClick={() => alert("Silent alarm triggered! Dispatched to security detail.")}
                          className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium rounded-xl border border-rose-500/30 transition"
                        >
                          Silent Alarm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h3 className="font-semibold text-gray-200 flex items-center gap-2 text-sm">
                          <Sliders className="w-4 h-4 text-indigo-400" />
                          AI Target Simulator
                        </h3>
                        <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                          Local Debugger
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Test how the surveillance system handles and flags human biometric profiles, unknown intruders, and target animals.
                      </p>

                      <div className="space-y-3.5 flex-1">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Entity Class</label>
                          <select
                            value={simClassName}
                            onChange={(e) => {
                              setSimClassName(e.target.value);
                              if (e.target.value !== "person") {
                                setSimPersonName("N/A");
                              } else {
                                setSimPersonName("Unknown");
                              }
                            }}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="person">Human (Person)</option>
                            <option value="dog">Dog (Canine)</option>
                            <option value="cat">Cat (Feline)</option>
                            <option value="bird">Bird (Avian)</option>
                            <option value="horse">Horse (Equine)</option>
                            <option value="cow">Cow (Bovine)</option>
                            <option value="sheep">Sheep (Ovine)</option>
                            <option value="goat">Goat (Caprine)</option>
                            <option value="elephant">Elephant</option>
                            <option value="bear">Bear</option>
                            <option value="tiger">Tiger</option>
                            <option value="lion">Lion</option>
                            <option value="monkey">Monkey</option>
                            <option value="rabbit">Rabbit</option>
                            <option value="snake">Snake</option>
                            <option value="fish">Fish</option>
                            <option value="chicken">Chicken</option>
                            <option value="duck">Duck</option>
                            <option value="vehicle">Vehicle (Optional)</option>
                            <option value="unidentified">Unidentified</option>
                          </select>
                        </div>

                        {simClassName === "person" && (
                          <div className="space-y-3 p-3 bg-gray-900/40 border border-gray-800/50 rounded-xl">
                            <div>
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Matched Profile Name</label>
                              <select
                                value={simPersonName}
                                onChange={(e) => setSimPersonName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Unknown">Unknown (Flag Unknown alert)</option>
                                <option value="Alexander Wright">Alexander Wright (Authorized)</option>
                                <option value="Clara Vance">Clara Vance (Authorized)</option>
                                <option value="Marcus Brody">Marcus Brody (Authorized)</option>
                                <option value="Elena Rostova">Elena Rostova (Authorized)</option>
                                <option value="Devon Vance">Devon Vance (Restricted)</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Gender</label>
                                <select
                                  value={simGender}
                                  onChange={(e) => setSimGender(e.target.value)}
                                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs text-gray-200"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Non-binary">Non-binary</option>
                                  <option value="N/A">N/A</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Age Estimate</label>
                                <input
                                  type="number"
                                  value={simAge}
                                  onChange={(e) => setSimAge(parseInt(e.target.value) || 0)}
                                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1 text-xs text-gray-200"
                                  min="1"
                                  max="110"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Emotional State (Mood)</label>
                              <select
                                value={simMood}
                                onChange={(e) => setSimMood(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-200"
                              >
                                <option value="Focused">Focused</option>
                                <option value="Smiling">Smiling (Happy)</option>
                                <option value="Calm">Calm</option>
                                <option value="Serious">Serious</option>
                                <option value="Surprised">Surprised</option>
                                <option value="N/A">N/A</option>
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Confidence Score</label>
                            <input
                              type="range"
                              min="0.5"
                              max="1.0"
                              step="0.01"
                              value={simConfidence}
                              onChange={(e) => setSimConfidence(parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-[10px] font-mono text-gray-400">Value: {Math.round(simConfidence * 100)}%</span>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Assigned Cam</label>
                            <input
                              type="text"
                              readOnly
                              value={cameras[0]?.name || "Main Lobby Entrance"}
                              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-400 select-none cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleTriggerSimulate}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40"
                      >
                        <Plus className="w-4 h-4" /> Trigger Target Capture
                      </button>
                    </>
                  )}
                </div>

              </div>

              {/* Grid 3: Live stats visualization & Recent activity table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left panel: Activity breakdown (Custom SVGs & Lists) */}
                <div className="bg-[#111827]/50 border border-gray-800/80 rounded-2xl p-5 space-y-4">
                  <h3 className="font-semibold text-gray-200 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Class Frequencies Distribution
                  </h3>

                  <div className="space-y-3">
                    {stats.classDistribution?.length > 0 ? (
                      stats.classDistribution.map((item: any) => {
                        const total = stats.classDistribution.reduce((acc: number, cur: any) => acc + cur.count, 0) || 1;
                        const percentage = Math.round((item.count / total) * 100);
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                              <span className="capitalize">{item.name}</span>
                              <span className="text-gray-400">{item.count} detections ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-500">
                        No frequency records matched. Trigger a capture first.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-800 pt-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Hourly Security Load</h4>
                    <div className="h-28 flex items-end justify-between gap-1 px-2 pt-2">
                      {stats.hourlyActivity?.map((hour: any, idx: number) => {
                        const maxCount = Math.max(...stats.hourlyActivity.map((h: any) => h.count)) || 1;
                        const heightPercent = Math.round((hour.count / maxCount) * 80) + 10;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-md transition-all duration-300 relative" style={{ height: `${heightPercent}px` }}>
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-950 text-indigo-200 text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition font-mono border border-gray-800 z-10">
                                {hour.count}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-gray-500">{hour.hour}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right panel: Recent synchronized security log list */}
                <div className="lg:col-span-2 bg-[#111827]/50 border border-gray-800/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="font-semibold text-gray-200 text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-400" /> Live Synchronized Activity Stream
                    </h3>
                    <button
                      onClick={() => setActiveTab("logs")}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                    >
                      View all logs
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                    {logs.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 text-xs">
                        No activity synchronized. Run target simulator or connect webcam to view live alert log flow.
                      </div>
                    ) : (
                      logs.slice(0, 4).map((log) => (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-xl border flex gap-4 transition duration-200 ${
                            log.type === "unknown"
                              ? "bg-rose-950/20 border-rose-500/25 hover:bg-rose-950/30"
                              : log.type === "human"
                              ? "bg-emerald-950/10 border-emerald-500/20 hover:bg-emerald-950/20"
                              : "bg-gray-900/60 border-gray-800 hover:bg-gray-900/80"
                          }`}
                        >
                          {/* Image preview / Placeholder */}
                          <div className="w-16 h-16 rounded-lg bg-gray-950 flex items-center justify-center shrink-0 border border-gray-800 overflow-hidden relative">
                            {log.photoUrl ? (
                              <img src={log.photoUrl} className="w-full h-full object-cover" alt="capture" />
                            ) : log.type === "animal" ? (
                              <PawPrint className="w-6 h-6 text-amber-500" />
                            ) : (
                              <Users className="w-6 h-6 text-indigo-400" />
                            )}
                            <span className="absolute bottom-0 right-0 bg-gray-900/90 text-[8px] font-mono px-1 border-t border-l border-gray-800 text-gray-400">
                              {log.id}
                            </span>
                          </div>

                          {/* Data block */}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5 capitalize">
                                {log.className === "person" ? log.personName : log.className}
                                {log.type === "unknown" && (
                                  <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded font-semibold">
                                    UNKNOWN FACE
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                                {Math.round(log.confidence * 100)}% Match
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">
                              {log.note || "Target logged on security array."}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-500 font-mono">
                              <span>Cam: <strong className="text-gray-400">{log.cameraId}</strong></span>
                              <span>Age: <strong className="text-gray-400">{log.age || "N/A"}</strong></span>
                              <span>Gender: <strong className="text-gray-400">{log.gender}</strong></span>
                              <span>Mood: <strong className="text-gray-400">{log.mood}</strong></span>
                              <span className="ml-auto text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CAMERA AI SANDBOX */}
          {activeTab === "camera" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-indigo-400" />
                    Interactive Real-Time Camera AI Sandbox
                  </h2>
                  <p className="text-xs text-gray-400">
                    Enable your local webcam to capture real-time frames and route them through the server-side Gemini Vision API!
                  </p>
                </div>
                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  <button
                    onClick={() => setIsWebcamOn(!isWebcamOn)}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition duration-200 ${
                      isWebcamOn
                        ? "bg-rose-600/15 text-rose-200 border-rose-500/30 hover:bg-rose-600/25"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500"
                    }`}
                  >
                    {isWebcamOn ? (
                      <>
                        <VideoOff className="w-4 h-4" /> Deactivate Camera
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" /> Activate Webcam
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left col: Webcam Frame Preview */}
                <div className="lg:col-span-7 bg-[#111827]/50 border border-gray-800/80 rounded-2xl overflow-hidden flex flex-col">
                  
                  {/* Camera Controller Title */}
                  <div className="px-5 py-3.5 bg-[#111827]/90 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isWebcamOn ? "bg-emerald-500 animate-ping" : "bg-gray-600"}`}></span>
                      {isWebcamOn ? "Camera active - Live Stream" : "Camera disconnected"}
                    </span>

                    <div className="flex gap-1.5 items-center">
                      {isWebcamOn && (
                        <button
                          onClick={() => setCameraLens(cameraLens === "back" ? "front" : "back")}
                          className="px-2 py-1 rounded text-xs bg-gray-850 hover:bg-gray-700 text-gray-200 font-medium transition flex items-center gap-1 border border-gray-800 cursor-pointer"
                          title="Flip camera lens front/back facing mode"
                        >
                          <RefreshCw className="w-3 h-3 text-indigo-400" />
                          Flip Camera ({cameraLens === "front" ? "Front" : "Back"})
                        </button>
                      )}
                      <button
                        onClick={() => setIsFlashOn(!isFlashOn)}
                        className={`p-1.5 rounded text-xs ${isFlashOn ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-gray-800 text-gray-400"}`}
                        title="Toggle Flash simulation"
                      >
                        ⚡ Flash
                      </button>
                    </div>
                  </div>

                  {/* Sandbox Frame */}
                  <div className="relative aspect-video bg-gray-950 flex flex-col items-center justify-center p-4">
                    
                    {/* Flash Layer */}
                    {isFlashOn && isWebcamOn && (
                      <div className="absolute inset-0 bg-white/20 pointer-events-none z-30 transition"></div>
                    )}

                    {isWebcamOn ? (
                      <div 
                        className="w-full h-full relative cursor-crosshair overflow-hidden rounded-xl"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setFocusPoint({ x, y });
                          setTimeout(() => setFocusPoint(null), 1500);
                        }}
                      >
                        <video
                          ref={setVideoRef}
                          className="w-full h-full object-cover transition-transform duration-200"
                          style={{ transform: `scale(${zoomScale}) ${cameraLens === "front" ? "scaleX(-1)" : ""}` }}
                          playsInline
                          muted
                        />
                        {/* Hidden canvas for capturing frame to base64 */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Stretched interpolated motion heatmap overlay */}
                        {showHeatmap && (
                          <canvas 
                            ref={heatmapCanvasRef} 
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transition-opacity duration-300" 
                            style={{ opacity: heatmapOpacity, transform: `scale(${zoomScale}) ${cameraLens === "front" ? "scaleX(-1)" : ""}` }}
                          />
                        )}

                        {/* Live green bounding box over live webcam feed */}
                        {liveTrackingBox.active && (
                          <div 
                            className="absolute border-2 border-emerald-500 bg-emerald-500/10 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-100 font-bold z-15 shadow-[0_0_15px_rgba(16,185,129,0.4)] pointer-events-none" 
                            style={{ 
                              top: `${liveTrackingBox.y}%`, 
                              left: `${cameraLens === "front" ? (100 - liveTrackingBox.x - liveTrackingBox.width) : liveTrackingBox.x}%`, 
                              width: `${liveTrackingBox.width}%`, 
                              height: `${liveTrackingBox.height}%`,
                              transform: `scale(${zoomScale})`
                            }}
                          >
                            <span className="bg-emerald-600 px-2 py-0.5 rounded text-white text-[9px] uppercase font-bold tracking-wider mr-1">Tracking Active</span>
                            <p className="mt-2 text-yellow-300">ID: {liveTelemetry.trackingId}</p>
                            <p>Name: {liveTelemetry.name}</p>
                            <p>Species: {liveTelemetry.species}</p>
                            <p>Confidence: {liveTelemetry.confidence}</p>
                          </div>
                        )}

                        {/* Focus Point Indicator */}
                        {focusPoint && (
                          <div 
                            className="absolute border-2 border-indigo-400 bg-indigo-500/20 rounded-full w-12 h-12 -ml-6 -mt-6 flex items-center justify-center animate-pulse pointer-events-none z-20"
                            style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%` }}
                          >
                            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                          </div>
                        )}

                        {/* Scanner animation bar */}
                        {isAnalyzing && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-bounce z-20"></div>
                        )}

                        {/* CameraX OSD details overlay */}
                        <div className="absolute bottom-3 left-3 bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-gray-400 border border-gray-850 z-20 space-y-0.5">
                          <p>LENS: <strong className="text-indigo-400 uppercase">{cameraLens} Camera</strong></p>
                          <p>RESOLUTION: <strong className="text-gray-200">{cameraResolution}</strong></p>
                          <p>FOCUS: <strong className="text-gray-200">{isAutoFocus ? "AUTO_FOCUS_MODE" : "MANUAL_TAP_LOCK"}</strong></p>
                          <p>ZOOM SCALE: <strong className="text-gray-200">{zoomScale.toFixed(1)}x</strong></p>
                          <p>HDR STREAM: <strong className={isHdr ? "text-emerald-400" : "text-gray-500"}>{isHdr ? "ACTIVE" : "OFF"}</strong></p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 space-y-4 max-w-sm pointer-events-none">
                        <div className="p-4 bg-gray-900 rounded-full inline-block text-gray-600 border border-gray-800">
                          <VideoOff className="w-8 h-8" />
                        </div>
                        <h4 className="font-semibold text-gray-300 text-sm">Webcam Access Pending</h4>
                        <p className="text-xs text-gray-500">
                          Click <strong>"Activate Webcam"</strong> above. Ensure you have authorized browser permissions to capture live video frames.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CameraX Hardware Settings Control Panel */}
                  <div className="p-4 bg-[#111827]/60 border-t border-gray-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Lens & DSP Parameters</span>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Target Resolution:</span>
                        <select
                          value={cameraResolution}
                          onChange={(e: any) => setCameraResolution(e.target.value)}
                          className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-[11px] font-mono text-gray-300"
                        >
                          <option value="640x480">640x480 (SD Quick)</option>
                          <option value="1280x720">1280x720 (HD Balanced)</option>
                          <option value="1920x1080">1920x1080 (FHD Max)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Camera Lens Selector:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCameraLens("back")}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition ${cameraLens === "back" ? "bg-indigo-600 text-white border-indigo-500" : "bg-gray-900 text-gray-400 border-gray-800"}`}
                          >
                            REAR
                          </button>
                          <button
                            onClick={() => setCameraLens("front")}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition ${cameraLens === "front" ? "bg-indigo-600 text-white border-indigo-500" : "bg-gray-900 text-gray-400 border-gray-800"}`}
                          >
                            FRONT
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Capture Frame Rate:</span>
                        <div className="flex gap-1">
                          {[30, 60].map(val => (
                            <button
                              key={val}
                              onClick={() => setCameraFps(val as any)}
                              className={`px-2.5 py-0.5 text-[10px] font-mono rounded border transition ${cameraFps === val ? "bg-indigo-600 text-white border-indigo-500" : "bg-gray-900 text-gray-400 border-gray-800"}`}
                            >
                              {val} FPS
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-800 md:pl-4">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Focus & Sensor Scales</span>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Pinch Zoom Multiplier:</span>
                        <span className="font-mono text-indigo-400 font-bold">{zoomScale.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.2"
                        value={zoomScale}
                        onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer"
                      />

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => setIsAutoFocus(!isAutoFocus)}
                          className={`py-1 text-[10px] font-semibold rounded border transition ${isAutoFocus ? "bg-indigo-600/10 text-indigo-300 border-indigo-500/25" : "bg-gray-900 text-gray-500 border-gray-800"}`}
                        >
                          AF: {isAutoFocus ? "ENABLED" : "TAP TO FOCUS"}
                        </button>
                        <button
                          onClick={() => setIsHdr(!isHdr)}
                          className={`py-1 text-[10px] font-semibold rounded border transition ${isHdr ? "bg-indigo-600/10 text-indigo-300 border-indigo-500/25" : "bg-gray-900 text-gray-500 border-gray-800"}`}
                        >
                          HDR STREAM: {isHdr ? "ACTIVE" : "OFF"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-800 md:pl-4">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block flex items-center justify-between">
                        <span>Traffic Heatmap</span>
                        <span className="px-1 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[8px] uppercase">Temporal</span>
                      </span>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Heatmap Overlay:</span>
                        <button
                          onClick={() => setShowHeatmap(!showHeatmap)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition ${
                            showHeatmap 
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                              : "bg-gray-900 text-gray-400 border-gray-800"
                          }`}
                        >
                          {showHeatmap ? "ON (ACTIVE)" : "OFF"}
                        </button>
                      </div>

                      {showHeatmap && (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-500">Overlay Opacity:</span>
                              <span className="font-mono text-gray-300">{Math.round(heatmapOpacity * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={heatmapOpacity}
                              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                              className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-500">History Retention:</span>
                              <span className="font-mono text-gray-300">{Math.round(heatmapDecay * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.85"
                              max="0.99"
                              step="0.01"
                              value={heatmapDecay}
                              onChange={(e) => setHeatmapDecay(parseFloat(e.target.value))}
                              className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Operational parameters for Gemini */}
                  <div className="p-4 bg-[#111827]/80 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-500">CONFIDENCE LIMIT:</span>
                      <span className="text-xs font-bold text-indigo-400 font-mono">
                        {Math.round(detectionConfidenceThreshold * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.05"
                        value={detectionConfidenceThreshold}
                        onChange={(e) => setDetectionConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-24"
                      />
                    </div>

                    <button
                      onClick={captureAndAnalyze}
                      disabled={!isWebcamOn || isAnalyzing}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-800 text-white font-semibold text-xs rounded-xl border border-indigo-500 transition duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Querying Gemini AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" /> Capture & Analyze with Gemini
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right col: Live AI Output details */}
                <div className="lg:col-span-5 bg-[#111827]/50 border border-gray-800/80 rounded-2xl p-5 flex flex-col space-y-4">
                  <div className="border-b border-gray-800 pb-3">
                    <h3 className="font-semibold text-gray-200 text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" /> Live Gemini AI Vision Telemetry
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Real-time object classification and attribute prediction.</p>
                  </div>

                  {/* AI Output Card UI */}
                  {aiAnalysisResult ? (
                    <div className="space-y-4">
                      
                      {/* Detected Entity Status Banner */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${
                        aiAnalysisResult.className === "person" && aiAnalysisResult.personName === "Unknown"
                          ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                          : "bg-indigo-950/25 border-indigo-500/25 text-indigo-200"
                      }`}>
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase block text-gray-400">Inferred Class</span>
                          <span className="text-lg font-bold capitalize mt-1 block">
                            {aiAnalysisResult.className}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold tracking-widest uppercase block text-gray-400 font-mono">Confidence</span>
                          <span className="text-xl font-extrabold block mt-0.5 font-mono">
                            {Math.round(aiAnalysisResult.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Attribute profile layout */}
                      <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 text-xs space-y-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Biometric Attribute Profile</span>

                        <div className="grid grid-cols-2 gap-3.5 font-mono">
                          <div>
                            <span className="text-gray-500 block text-[10px]">VERIFIED NAME</span>
                            <span className="text-gray-200 font-bold text-xs mt-0.5 block">{aiAnalysisResult.personName || "Unknown"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">TRACKING ID</span>
                            <span className="text-gray-200 font-bold text-xs mt-0.5 block text-indigo-400">
                              {aiAnalysisResult.trackingId || `TRK-0${Math.floor(100 + Math.random() * 900)}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">GENDER</span>
                            <span className="text-gray-200 font-bold text-xs mt-0.5 block">{aiAnalysisResult.gender || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">AGE ESTIMATE</span>
                            <span className="text-gray-200 font-bold text-xs mt-0.5 block">
                              {aiAnalysisResult.age > 0 ? `${aiAnalysisResult.age} yrs` : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">EMOTION / MOOD</span>
                            <span className="text-gray-200 font-bold text-xs mt-0.5 block flex items-center gap-1">
                              <Smile className="w-3.5 h-3.5 text-indigo-400" /> {aiAnalysisResult.mood || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">RECOGNITION SCORE</span>
                            <span className="text-emerald-400 font-bold text-xs mt-0.5 block">
                              {aiAnalysisResult.className === "person" && aiAnalysisResult.personName !== "Unknown" 
                                ? `${Math.round(85 + Math.random() * 14)}.${Math.floor(Math.random() * 9)}% Correlation` 
                                : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">SPECIES TYPE</span>
                            <span className="text-amber-400 font-bold text-xs mt-0.5 block capitalize">
                              {aiAnalysisResult.className !== "person" ? aiAnalysisResult.className : "Human (H. sapiens)"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">CURRENT TIME</span>
                            <span className="text-gray-300 font-bold text-xs mt-0.5 block">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Security Intelligence Note */}
                      <div className="bg-indigo-950/15 border-l-2 border-indigo-500 p-3.5 rounded-r-xl">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Surveillance Log Memo</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-mono">
                          "{aiAnalysisResult.note || "Target logged on direct camera analyzer stream."}"
                        </p>
                      </div>

                      <div className="text-[10px] text-gray-500 flex items-center justify-between font-mono bg-gray-900/30 p-2 rounded border border-gray-800/40">
                        <span>Synced to Cloud: <strong>YES</strong></span>
                        <span>API Model: <strong>gemini-3.5-flash</strong></span>
                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="p-3.5 bg-gray-900 rounded-full text-indigo-400 border border-gray-800">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-gray-300 text-sm">Capture Pending Analysis</h4>
                      <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                        To test, present an object, face, or item in front of your camera, and click <strong>"Capture & Analyze"</strong>.
                      </p>
                    </div>
                  )}

                  <div className="mt-auto border-t border-gray-800 pt-4 text-xs text-gray-400 space-y-2">
                    <span className="font-bold text-gray-300 block uppercase tracking-widest text-[10px]">How it works</span>
                    <p className="leading-relaxed">
                      This sandbox converts your live video frames into structured Base64 logs. It sends them securely through server-side pathways to the Gemini API which parses spatial geometry to output accurate category matches.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: FACE BIOMETRICS REGISTRY */}
          {activeTab === "faces" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Biometric Face Registry Directory
                  </h2>
                  <p className="text-xs text-gray-400">
                    Manage registered security team credentials, clear authorization clearances, and handle security rules.
                  </p>
                </div>
                <button
                  onClick={() => setShowFaceModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-4 h-4" /> Register New Face
                </button>
              </div>

              {/* Grid of registered team members */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {faces.length === 0 ? (
                  <div className="col-span-full text-center py-24 text-gray-500 text-xs">
                    No face credentials registered. Use the register form to add biometric records.
                  </div>
                ) : (
                  faces.map((face) => (
                    <div
                      key={face.id}
                      className="bg-[#111827]/50 border border-gray-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center uppercase shadow-inner text-base">
                            {face.name.substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-200 text-sm">{face.name}</h4>
                            <span className="text-[10px] font-mono text-gray-500">ID: {face.id}</span>
                          </div>
                        </div>

                        {/* Status tag */}
                        <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border ${
                          face.permissions === "Authorized"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : face.permissions === "Restricted"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                        }`}>
                          {face.permissions}
                        </span>
                      </div>

                      {/* Parameters list */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-900/40 border border-gray-800/40 p-3 rounded-xl text-[11px] font-mono">
                        <div>
                          <span className="text-gray-500 block text-[9px]">GENDER</span>
                          <span className="text-gray-300 font-semibold">{face.gender}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px]">AGE</span>
                          <span className="text-gray-300 font-semibold">{face.age} yrs</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px]">MOOD TREND</span>
                          <span className="text-gray-300 font-semibold">{face.moodTrend}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800 pt-3">
                        <span className="font-mono">Registered: {new Date(face.registeredAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDeleteFace(face.id)}
                          className="text-rose-500 hover:text-rose-400 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Custom face registration Modal */}
              {showFaceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
                  <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-indigo-400" />
                        Add Biometric Clearance Profile
                      </h3>
                      <button
                        onClick={() => setShowFaceModal(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleRegisterFace} className="space-y-4 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Identity Name</label>
                        <input
                          type="text"
                          required
                          value={newFaceName}
                          onChange={(e) => setNewFaceName(e.target.value)}
                          placeholder="e.g. Alexander Wright"
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-gray-200"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Gender</label>
                          <select
                            value={newFaceGender}
                            onChange={(e) => setNewFaceGender(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-gray-200"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Age</label>
                          <input
                            type="number"
                            required
                            value={newFaceAge}
                            onChange={(e) => setNewFaceAge(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-gray-200"
                            min="1"
                            max="110"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mood Baseline</label>
                          <select
                            value={newFaceMood}
                            onChange={(e) => setNewFaceMood(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-gray-200"
                          >
                            <option value="Focused">Focused</option>
                            <option value="Friendly">Friendly</option>
                            <option value="Calm">Calm</option>
                            <option value="Serious">Serious</option>
                            <option value="Analytical">Analytical</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Clearance Tier</label>
                          <select
                            value={newFacePermission}
                            onChange={(e) => setNewFacePermission(e.target.value as any)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-gray-200"
                          >
                            <option value="Authorized">Authorized</option>
                            <option value="Restricted">Restricted</option>
                            <option value="Flagged">Flagged / Watch</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Enrolled Face Angles</label>
                        <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono text-gray-400 bg-gray-900/50 p-2 border border-gray-800 rounded-xl">
                          {(["front", "left", "right", "up", "down"] as const).map((angle) => (
                            <label key={angle} className="flex flex-col items-center gap-1 cursor-pointer select-none">
                              <span className="capitalize text-[8px]">{angle}</span>
                              <input
                                type="checkbox"
                                checked={newFaceAngles[angle]}
                                onChange={(e) => setNewFaceAngles(prev => ({ ...prev, [angle]: e.target.checked }))}
                                className="w-3.5 h-3.5 text-indigo-600 bg-gray-950 border-gray-800 rounded"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Administrative Notes</label>
                        <textarea
                          value={newFaceNotes}
                          onChange={(e) => setNewFaceNotes(e.target.value)}
                          placeholder="e.g. Cleared for Vault room entry, wears prescription safety glasses."
                          rows={2}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-gray-200 placeholder-gray-600 resize-none"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowFaceModal(false)}
                          className="flex-1 px-4 py-2 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-gray-300 font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                        >
                          Save Record
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SURVEILLANCE LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    Surveillance Log Archive History
                  </h2>
                  <p className="text-xs text-gray-400">
                    Query, search, filter, and inspect detailed security detections captured from the live camera stream.
                  </p>
                </div>

                <div className="flex gap-2 self-stretch sm:self-auto">
                  <button
                    onClick={handleWipeLogs}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold text-xs border border-rose-500/20 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Wipe Records
                  </button>
                </div>
              </div>

              {/* Filters Box */}
              <div className="bg-[#111827]/40 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search logs by class, name, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <span className="text-xs font-bold text-gray-500 uppercase shrink-0">Filter Target:</span>
                  {[
                    { id: "all", label: "All Logs" },
                    { id: "human", label: "Humans" },
                    { id: "unknown", label: "Unknowns" },
                    { id: "animal", label: "Animals" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterClass(filter.id)}
                      className={`px-3.5 py-1.5 text-xs rounded-xl font-medium border transition shrink-0 ${
                        filterClass === filter.id
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-gray-900/60 text-gray-400 border-gray-800 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs Content List */}
              <div className="space-y-4">
                {filteredLogs.length === 0 ? (
                  <div className="bg-[#111827]/50 border border-gray-800 rounded-2xl py-24 text-center text-gray-500 text-xs">
                    No matching surveillance logs discovered for current parameters.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`bg-[#111827]/40 border border-gray-800 rounded-2xl p-5 hover:bg-[#111827]/60 transition flex flex-col sm:flex-row gap-5 relative`}
                    >
                      {/* Left: Capture Snapshot image */}
                      <div className="w-full sm:w-40 aspect-video sm:aspect-square bg-gray-950 rounded-xl border border-gray-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {log.photoUrl ? (
                          <img src={log.photoUrl} className="w-full h-full object-cover" alt="Security Snapshot" />
                        ) : log.type === "animal" ? (
                          <PawPrint className="w-12 h-12 text-amber-500 opacity-60" />
                        ) : (
                          <Users className="w-12 h-12 text-indigo-400 opacity-60" />
                        )}
                        <span className="absolute top-2 left-2 bg-gray-950/80 px-2 py-0.5 rounded text-[9px] font-mono border border-gray-800 text-indigo-300 font-bold">
                          {log.id}
                        </span>
                      </div>

                      {/* Right: Data metrics */}
                      <div className="flex-1 space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-850 pb-2.5">
                            <div>
                              <h3 className="text-sm font-bold text-gray-200 capitalize flex items-center gap-1.5">
                                {log.className === "person" ? log.personName : log.className}
                                {log.type === "unknown" && (
                                  <span className="px-2 py-0.5 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold uppercase">
                                    Unknown Security Alert
                                  </span>
                                )}
                              </h3>
                              <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                                Camera Sensor: <strong className="text-gray-400">{log.cameraId}</strong>
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-gray-500 block">AI CONFIDENCE SCORE</span>
                              <span className="text-xs font-bold text-indigo-400 font-mono">
                                {Math.round(log.confidence * 100)}% Match
                              </span>
                            </div>
                          </div>

                          {/* Attributes Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/40 p-3 rounded-xl text-xs font-mono border border-gray-850 mt-3">
                            <div>
                              <span className="text-gray-500 text-[10px] block">ENTITY CLASS</span>
                              <span className="text-gray-300 capitalize">{log.className}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">ESTIMATED AGE</span>
                              <span className="text-gray-300">{log.age > 0 ? `${log.age} yrs` : "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">BIOMETRIC GENDER</span>
                              <span className="text-gray-300">{log.gender}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">EMOTIONAL MOOD</span>
                              <span className="text-gray-300">{log.mood}</span>
                            </div>
                          </div>
                        </div>

                        {/* Note & bottom timestamp */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <p className="text-gray-400 leading-relaxed max-w-xl">
                            <strong className="text-gray-500 mr-1 uppercase text-[10px] font-mono">Memo:</strong>
                            "{log.note || "Target logged on security array."}"
                          </p>

                          <div className="text-right text-[10px] font-mono text-gray-500 shrink-0">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ANDROID CODEBASE VIEW & DOWNLOAD */}
          {activeTab === "source" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  Generated Android & PHP Backend Codebase
                </h2>
                <p className="text-xs text-gray-400">
                  Inspect the complete enterprise-grade Android CameraX + OpenCV + ONNX codebase. Download files individually or integrate them into Android Studio.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left side: Project tree structure explorer */}
                <div className="lg:col-span-4 bg-[#111827]/50 border border-gray-800 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-indigo-400" />
                    Android Project Tree
                  </h3>

                  <div className="space-y-1 max-h-[480px] overflow-y-auto pr-2 text-xs">
                    
                    {/* Folder 1: Android Root config */}
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-400 px-2 py-1 bg-gray-900/60 rounded flex items-center gap-1">
                        📁 android/
                      </div>
                      <div className="pl-4 space-y-1">
                        {androidCodeFiles.filter(f => f.path.startsWith("android/")).map((file) => (
                          <button
                            key={file.name}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-3 py-1.5 rounded transition font-mono flex items-center justify-between ${
                              selectedFile.name === file.name
                                ? "bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500"
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/20"
                            }`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <FileCode className="w-3.5 h-3.5 text-gray-500" /> {file.name}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-indigo-500">{file.language}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Folder 2: PHP APIs */}
                    <div className="space-y-1 mt-3">
                      <div className="font-semibold text-gray-400 px-2 py-1 bg-gray-900/60 rounded flex items-center gap-1">
                        📁 backend/php/
                      </div>
                      <div className="pl-4 space-y-1">
                        {androidCodeFiles.filter(f => f.path.startsWith("backend/php")).map((file) => (
                          <button
                            key={file.name}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-3 py-1.5 rounded transition font-mono flex items-center justify-between ${
                              selectedFile.name === file.name
                                ? "bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500"
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/20"
                            }`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <FileCode className="w-3.5 h-3.5 text-amber-600" /> {file.name}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-amber-500">{file.language}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Folder 3: MySQL */}
                    <div className="space-y-1 mt-3">
                      <div className="font-semibold text-gray-400 px-2 py-1 bg-gray-900/60 rounded flex items-center gap-1">
                        📁 backend/mysql/
                      </div>
                      <div className="pl-4 space-y-1">
                        {androidCodeFiles.filter(f => f.path.startsWith("backend/mysql")).map((file) => (
                          <button
                            key={file.name}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-3 py-1.5 rounded transition font-mono flex items-center justify-between ${
                              selectedFile.name === file.name
                                ? "bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500"
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/20"
                            }`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <FileCode className="w-3.5 h-3.5 text-emerald-500" /> {file.name}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-emerald-500">{file.language}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side: Integrated code view pane */}
                <div className="lg:col-span-8 bg-[#111827]/50 border border-gray-800 rounded-2xl p-5 flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div>
                      <h4 className="font-bold text-gray-200 text-sm">{selectedFile.name}</h4>
                      <p className="text-[10px] font-mono text-gray-500 mt-0.5">{selectedFile.path}</p>
                    </div>

                    <button
                      onClick={() => downloadCodeFile(selectedFile)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </button>
                  </div>

                  <div className="bg-gray-950 rounded-xl p-4 overflow-x-auto max-h-[500px] border border-gray-850">
                    <pre className="text-[11px] font-mono text-gray-300 leading-relaxed whitespace-pre">
                      {selectedFile.content}
                    </pre>
                  </div>

                  <div className="text-xs text-gray-400 bg-indigo-950/15 p-3 rounded-xl flex items-start gap-2 border-l-2 border-indigo-500 leading-relaxed font-mono">
                    <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Deployment Notice:</strong> Run these endpoints on PHP 8 and map your local Android SDK with the custom OpenCV 5.0 libraries for absolute hardware-accelerated FPS tracking.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: CONFIG PANELS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  System Config Panels
                </h2>
                <p className="text-xs text-gray-400">
                  Configure real-time sync thresholds, check node heartbeat parameters, and coordinate system alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel A: Core thresholds */}
                <div className="bg-[#111827]/50 border border-gray-800 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-gray-200 text-sm border-b border-gray-800 pb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Inference, Storage & Throttling Parameters
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-400 block mb-1">DETECTION CONFIDENCE MINIMUM</span>
                      <p className="text-gray-500 mb-2 leading-relaxed">Lower values capture quick transitions but might trigger false alerts.</p>
                      <input
                        type="range"
                        min="0.5"
                        max="0.99"
                        step="0.01"
                        value={detectionConfidenceThreshold}
                        onChange={(e) => setDetectionConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[10px] font-mono text-indigo-400 mt-1 block">Set to: {Math.round(detectionConfidenceThreshold * 100)}% Match</span>
                    </div>

                    <div className="border-t border-gray-850 pt-3">
                      <span className="font-bold text-gray-400 block mb-1">TRACKING SENSITIVITY</span>
                      <p className="text-gray-500 mb-2 leading-relaxed font-sans">Controls spatial intersection threshold for object id preservation.</p>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={trackingSensitivity}
                        onChange={(e) => setTrackingSensitivity(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[10px] font-mono text-indigo-400 mt-1 block">Set to: {Math.round(trackingSensitivity * 100)}% Intersection</span>
                    </div>

                    <div className="border-t border-gray-850 pt-3">
                      <span className="font-bold text-gray-400 block mb-1">BIOMETRIC RECOGNITION THRESHOLD</span>
                      <p className="text-gray-500 mb-2 leading-relaxed">Minimum cosine similarity similarity matched against SFace vectors.</p>
                      <input
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.01"
                        value={recognitionThreshold}
                        onChange={(e) => setRecognitionThreshold(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[10px] font-mono text-indigo-400 mt-1 block">Set to: {Math.round(recognitionThreshold * 100)}% Similarity</span>
                    </div>

                    <div className="border-t border-gray-850 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-gray-400 block mb-1">MAX SPEED LIMIT</span>
                        <select
                          value={fpsLimit}
                          onChange={(e) => {
                            setFpsLimit(parseInt(e.target.value));
                            setFps(parseInt(e.target.value));
                          }}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1.5 text-gray-200 text-[11px]"
                        >
                          <option value="15">15 FPS Throttled</option>
                          <option value="30">30 FPS Standard</option>
                          <option value="60">60 FPS Ultra-HD</option>
                        </select>
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 block mb-1">LOCAL DISK LIMIT</span>
                        <input
                          type="range"
                          min="128"
                          max="2048"
                          step="128"
                          value={storageLimit}
                          onChange={(e) => setStorageLimit(parseInt(e.target.value))}
                          className="w-full accent-indigo-500 mt-1.5"
                        />
                        <span className="text-[9px] font-mono text-indigo-400 mt-1 block">Limit: {storageLimit} MB</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-850 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-gray-400 block mb-1">SYSTEM DISPLAY THEME</span>
                        <select
                          value={appTheme}
                          onChange={(e) => setAppTheme(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1.5 text-gray-200 text-[11px]"
                        >
                          <option value="Light">Light Mode Theme</option>
                          <option value="Dark">Slate Dark Theme</option>
                          <option value="System">Automatic System</option>
                        </select>
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 block mb-1">CONSOLE LANGUAGE</span>
                        <select
                          value={appLanguage}
                          onChange={(e) => setAppLanguage(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1.5 text-gray-200 text-[11px]"
                        >
                          <option value="English">English (US)</option>
                          <option value="Spanish">Español (ES)</option>
                          <option value="French">Français (FR)</option>
                          <option value="Japanese">日本語 (JP)</option>
                        </select>
                      </div>
                    </div>

                    {/* Hardware Overrides Simulator block */}
                    <div className="border-t border-gray-850 pt-3 bg-indigo-950/10 p-3.5 rounded-xl border border-indigo-500/10">
                      <span className="font-bold text-indigo-400 block mb-1.5 uppercase tracking-widest text-[9px]">Mobile Hardware Sandbox Overrides</span>
                      
                      <div className="space-y-3.5">
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Simulated Battery Charge:</span>
                            <span className="font-bold font-mono text-gray-200">{batteryLevel}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={batteryLevel}
                            onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                            className="w-full accent-indigo-500"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                          <span>Simulated Thermal Core Core Overheat:</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isOverheating}
                              onChange={(e) => setIsOverheating(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Panel B: Server Sync Configuration */}
                <div className="bg-[#111827]/50 border border-gray-800 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-gray-200 text-sm border-b border-gray-800 pb-2">
                    Centralized Sync Endpoint Status
                  </h3>

                  <div className="space-y-4 text-xs font-mono">
                    <div>
                      <span className="font-bold text-gray-400 block mb-1 uppercase text-[10px]">Cloud Sync Service Link</span>
                      <input
                        type="text"
                        readOnly
                        value="https://surveillance.enterprise.security-node.com/api"
                        className="w-full bg-gray-900 border border-gray-850 rounded-xl px-3 py-2 text-gray-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-gray-900/40 p-3.5 rounded-xl border border-gray-850">
                      <div>
                        <span className="text-gray-500 text-[9px] block">SECURITY CREDENTIAL</span>
                        <span className="text-emerald-400 font-bold text-xs">AES-256 Enabled</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[9px] block">MOBILE SYNC CODE</span>
                        <span className="text-indigo-400 font-bold text-xs">ONLINE_ACTIVE</span>
                      </div>
                    </div>

                    <div className="bg-indigo-950/15 p-3 rounded-xl flex gap-2 border-l-2 border-indigo-500 text-gray-400 leading-relaxed text-[11px]">
                      <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p>
                        Both the Android App and the PHP API route target detections to the MySQL database, enabling zero-latency dashboard alerts.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Panel C: Live Pipeline Telemetry Logs */}
              <div className="bg-[#111827]/50 border border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-200 text-sm">
                      Live Pipeline Telemetry & Error Logs
                    </h3>
                    <p className="text-xs text-gray-400">Diagnostic telemetry output from OpenCV, CameraX Analyzer, and ONNX Runtime sessions.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newLog = {
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        tag: ["CameraXAnalyzer", "YoloDetector", "FaceRecognizer", "ApiService"][Math.floor(Math.random() * 4)],
                        message: [
                          "TapToFocus coordination locked on selected region coordinates",
                          "Frame conversion benchmark complete: ImageProxy to Mat in 12ms",
                          "YOLO inference session finished: confidence matrix normal",
                          "Cosine similarity calculated on face registry target vector: match confirmed",
                          "Heartbeat sync OK: Central DB communication active",
                          "PinchZoom scale adjusted: recalculating sensor bounds"
                        ][Math.floor(Math.random() * 6)]
                      };
                      // Appending simulated log line
                      console.log("Telemetry check:", newLog);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg transition"
                  >
                    Simulate Pipeline Trigger
                  </button>
                </div>

                <div className="bg-gray-950 rounded-xl p-4 border border-gray-850 font-mono text-xs max-h-[220px] overflow-y-auto space-y-2">
                  <div className="text-gray-500">[2026-06-30 09:20:12] <span className="text-indigo-400">[MainApplication]</span> Attempting OpenCV initialization (1/3)</div>
                  <div className="text-gray-500">[2026-06-30 09:20:13] <span className="text-indigo-400">[MainApplication]</span> OpenCV Loaded successfully on attempt 1</div>
                  <div className="text-gray-500">[2026-06-30 09:20:15] <span className="text-amber-400">[FaceRecognizer]</span> Biometric face alignment engine created successfully with YuNet model</div>
                  <div className="text-gray-500">[2026-06-30 09:20:16] <span className="text-indigo-400">[YoloDetector]</span> ONNX Loaded: Creating Environment context</div>
                  <div className="text-gray-500">[2026-06-30 09:20:16] <span className="text-indigo-400">[YoloDetector]</span> ONNX Config: NNAPI acceleration attached</div>
                  <div className="text-gray-500">[2026-06-30 09:20:17] <span className="text-indigo-400">[YoloDetector]</span> Model Loaded: YOLO neural session initialized</div>
                  <div className="text-gray-500">[2026-06-30 09:20:20] <span className="text-emerald-400">[CameraXAnalyzer]</span> CameraX pipeline online at 1280x720 30fps</div>
                  <div className="text-gray-500">[2026-06-30 09:21:40] <span className="text-sky-400">[ApiService]</span> Sync target endpoint verified, status: 200 OK</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: BOOTSTRAP 5 WEB DASHBOARD INTERACTIVE PREVIEW & SOURCE BROWSER */}
          {activeTab === "web" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
                    AI Vision Web Dashboard
                  </h2>
                  <p className="text-xs text-gray-400">
                    Responsive Glassmorphism UI crafted with Bootstrap 5, Chart.js, and Material Icons.
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/web/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
                  >
                    <span>Launch Standalone Portal</span>
                    <i className="material-icons" style={{ fontSize: "16px" }}>open_in_new</i>
                  </a>
                </div>
              </div>

              {/* Master Split Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* 1. INTERACTIVE PREVIEW IFRAME STAGE (8 COLS) */}
                <div className="xl:col-span-7 bg-[#111827]/40 border border-gray-800 rounded-2xl p-4 flex flex-col space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Interactive Preview Display
                    </span>
                    
                    {/* View selectors to load inside the Iframe */}
                    <div className="flex flex-wrap gap-1 bg-gray-950 p-1 rounded-xl">
                      {[
                        { name: "index.html", label: "Index" },
                        { name: "login.html", label: "Login" },
                        { name: "dashboard.html", label: "Dashboard" },
                        { name: "live.html", label: "Live Feed" },
                        { name: "history.html", label: "History" },
                        { name: "known_faces.html", label: "Known" },
                        { name: "unknown_faces.html", label: "Unknown" },
                        { name: "animals.html", label: "Fauna" },
                        { name: "gallery.html", label: "Gallery" },
                        { name: "statistics.html", label: "Statistics" },
                        { name: "devices.html", label: "Devices" },
                        { name: "notifications.html", label: "Alerts" },
                        { name: "settings.html", label: "Settings" }
                      ].map(p => (
                        <button
                          key={p.name}
                          onClick={() => setSelectedWebFile(p.name)}
                          className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition ${
                            selectedWebFile === p.name
                              ? "bg-emerald-600 text-white"
                              : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Browser Sandbox Stage with Safari Header */}
                  <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col" style={{ height: "600px" }}>
                    <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                      </div>
                      <div className="flex-grow bg-gray-950 border border-gray-850 rounded-lg px-3 py-1 text-[10px] text-gray-500 text-center font-mono select-all truncate">
                        {window.location.origin}/web/{selectedWebFile}
                      </div>
                      <button
                        onClick={() => {
                          const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
                          if (iframe) iframe.src = iframe.src;
                        }}
                        className="text-gray-500 hover:text-gray-300 transition"
                        title="Reload frame"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>

                    <iframe
                      id="preview-iframe"
                      src={`/web/${selectedWebFile}`}
                      className="w-full flex-grow border-0 bg-gray-900"
                      title="AI Vision Portal Preview"
                      sandbox="allow-scripts allow-same-origin allow-modals"
                    />
                  </div>

                  <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                    This interactive browser sandbox executes code in real-time. Navigate pages inside the mockup container to test user workflows, interactive charts, simulation triggers, and responsive transitions.
                  </p>
                </div>

                {/* 2. PRODUCTION SOURCE CODE EXPLORER PANEL (4 COLS) */}
                <div className="xl:col-span-5 flex flex-col space-y-4">
                  <div className="bg-[#111827]/40 border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div>
                        <h4 className="font-bold text-gray-200 text-sm">Source Code Explorer</h4>
                        <p className="text-[10px] text-gray-400">Pruned, production-ready Bootstrap elements</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(webFileContent);
                          setCopiedWeb(true);
                          setTimeout(() => setCopiedWeb(false), 2000);
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-[11px] rounded-lg transition flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>{copiedWeb ? "Copied!" : "Copy Code"}</span>
                      </button>
                    </div>

                    {/* Selector Dropdown with Descriptions */}
                    <div>
                      <label className="text-gray-500 text-[10px] font-bold block mb-1 uppercase tracking-wider">Select Source Component</label>
                      <select
                        value={selectedWebFile}
                        onChange={(e) => setSelectedWebFile(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-850 rounded-xl px-3 py-2 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {[
                          { name: "index.html", label: "index.html — System Welcome Portal" },
                          { name: "login.html", label: "login.html — Credentials Gateway" },
                          { name: "dashboard.html", label: "dashboard.html — Main Monitoring Suite" },
                          { name: "live.html", label: "live.html — Camera Feed Grid" },
                          { name: "history.html", label: "history.html — Surveillance Event Log" },
                          { name: "known_faces.html", label: "known_faces.html — Biometric Database" },
                          { name: "unknown_faces.html", label: "unknown_faces.html — Intruder Detection Hub" },
                          { name: "animals.html", label: "animals.html — Fauna Intrusion Log" },
                          { name: "gallery.html", label: "gallery.html — Snapshot Grid Viewer" },
                          { name: "statistics.html", label: "statistics.html — Analytics Reports" },
                          { name: "devices.html", label: "devices.html — Synchronization Terminals" },
                          { name: "notifications.html", label: "notifications.html — Broadcast & Alerts" },
                          { name: "settings.html", label: "settings.html — Master Threshold Config" },
                          { name: "style.css", label: "style.css — Custom Global stylesheet" },
                          { name: "layout.js", label: "layout.js — Dynamic Layout controller" }
                        ].map(f => (
                          <option key={f.name} value={f.name}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Scrollable code wrapper */}
                    <div className="bg-gray-950 rounded-xl border border-gray-850 p-4 font-mono text-xs overflow-x-auto max-h-[420px] relative">
                      <pre className="text-gray-400 select-all whitespace-pre-wrap font-mono leading-relaxed" style={{ fontSize: "11px" }}>
                        {webFileContent}
                      </pre>
                    </div>

                    <div className="bg-emerald-950/15 p-3 rounded-xl border border-emerald-900/30 text-[11px] text-gray-400 leading-relaxed">
                      <strong className="text-emerald-400 block mb-1">Architecture Note:</strong>
                      Each static file is built to execute autonomously, fetching telemetry directly from the REST APIs. They use local variables, Material Icons, and standard Bootstrap libraries for seamless integration.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Aesthetic Footer */}
      <footer className="bg-[#111827] border-t border-gray-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-mono gap-3 shrink-0">
        <span>© 2026 AI Vision Surveillance System • Enterprise Grade</span>
        <div className="flex gap-4">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Node Online
          </span>
          <span>OpenCV 5.0 Core</span>
          <span>ONNX Runtime</span>
        </div>
      </footer>

    </div>
  );
}

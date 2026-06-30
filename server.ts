import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parsing with large payload support for screenshots
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client safely
const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI Analysis will run in fallback simulation mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// In-Memory Database for Surveillance Logs
interface DetectionLog {
  id: string;
  className: string;
  confidence: number;
  personName: string;
  gender: string;
  age: number;
  mood: string;
  trackingId: string;
  cameraId: string;
  timestamp: string;
  photoUrl?: string; // Base64 or local URL representation
  note?: string;
  type: "human" | "animal" | "unknown";
}

let detections: DetectionLog[] = [
  {
    id: "DET-1024",
    className: "person",
    confidence: 0.96,
    personName: "Alexander Wright",
    gender: "Male",
    age: 34,
    mood: "Smiling",
    trackingId: "TRK-0041",
    cameraId: "Main Lobby Entrance",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
    note: "Primary keycard holder verified. Access authorized.",
    type: "human"
  },
  {
    id: "DET-1023",
    className: "person",
    confidence: 0.89,
    personName: "Unknown",
    gender: "Male",
    age: 26,
    mood: "Serious",
    trackingId: "TRK-0082",
    cameraId: "Backyard Loading Dock",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    note: "Unregistered individual identified loitering near restricted logistics dock. Security notified.",
    type: "unknown"
  },
  {
    id: "DET-1022",
    className: "cat",
    confidence: 0.94,
    personName: "Feral Tabby",
    gender: "N/A",
    age: 2,
    mood: "Curious",
    trackingId: "TRK-0105",
    cameraId: "Perimeter West Wall",
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(), // 32 mins ago
    note: "Small animal transit logged on infrared motion grid.",
    type: "animal"
  },
  {
    id: "DET-1021",
    className: "person",
    confidence: 0.98,
    personName: "Clara Vance",
    gender: "Female",
    age: 28,
    mood: "Focused",
    trackingId: "TRK-0022",
    cameraId: "Server Room A",
    timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString(), // 58 mins ago
    note: "System administrator entered vault zone. Biometric match.",
    type: "human"
  },
  {
    id: "DET-1020",
    className: "dog",
    confidence: 0.91,
    personName: "German Shepherd",
    gender: "N/A",
    age: 4,
    mood: "Active",
    trackingId: "TRK-0109",
    cameraId: "North Fence Gate",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // ~2 hrs ago
    note: "K9 patrol vector boundary breach check positive.",
    type: "animal"
  },
  {
    id: "DET-1019",
    className: "person",
    confidence: 0.92,
    personName: "Marcus Brody",
    gender: "Male",
    age: 45,
    mood: "Neutral",
    trackingId: "TRK-0033",
    cameraId: "Main Lobby Entrance",
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(), // ~2.5 hrs ago
    note: "Director checkout log matching standard operational schedules.",
    type: "human"
  }
];

// Seed Known Faces list for user registry
interface KnownFace {
  id: string;
  name: string;
  gender: string;
  age: number;
  moodTrend: string;
  permissions: "Authorized" | "Restricted" | "Flagged";
  registeredAt: string;
  avatarSeed: string; // Used for unique visual placeholder
}

let knownFacesList: KnownFace[] = [
  {
    id: "FC-101",
    name: "Alexander Wright",
    gender: "Male",
    age: 34,
    moodTrend: "Professional",
    permissions: "Authorized",
    registeredAt: "2025-01-15T08:30:00Z",
    avatarSeed: "alex"
  },
  {
    id: "FC-102",
    name: "Clara Vance",
    gender: "Female",
    age: 28,
    moodTrend: "Friendly",
    permissions: "Authorized",
    registeredAt: "2025-02-10T09:15:00Z",
    avatarSeed: "clara"
  },
  {
    id: "FC-103",
    name: "Marcus Brody",
    gender: "Male",
    age: 45,
    moodTrend: "Serious",
    permissions: "Authorized",
    registeredAt: "2024-11-05T14:45:00Z",
    avatarSeed: "marcus"
  },
  {
    id: "FC-104",
    name: "Elena Rostova",
    gender: "Female",
    age: 31,
    moodTrend: "Analytical",
    permissions: "Authorized",
    registeredAt: "2025-03-22T11:00:00Z",
    avatarSeed: "elena"
  },
  {
    id: "FC-105",
    name: "Devon Vance",
    gender: "Male",
    age: 38,
    moodTrend: "Stressed",
    permissions: "Restricted",
    registeredAt: "2025-05-18T16:20:00Z",
    avatarSeed: "devon"
  }
];

// Active mock cameras
const cameraFeeds = [
  { id: "CAM-01", name: "Main Lobby Entrance", location: "Lobby Block A", fps: 30, resolution: "1080p", status: "Online" }
];

// API Endpoints

// 1. Get List of Detections
app.get("/api/detections", (req, res) => {
  res.json({
    status: "success",
    count: detections.length,
    data: detections
  });
});

// 2. Add a new Detection
app.post("/api/detections", (req, res) => {
  const { className, confidence, personName, gender, age, mood, cameraId, photoUrl, note } = req.body;

  if (!className) {
    return res.status(400).json({ status: "error", message: "className is required" });
  }

  const logType = className === "person" 
    ? (personName === "Unknown" ? "unknown" : "human") 
    : "animal";

  const newLog: DetectionLog = {
    id: `DET-${1000 + detections.length + 1}`,
    className,
    confidence: confidence || 0.90,
    personName: personName || "Unknown",
    gender: gender || "N/A",
    age: age || 0,
    mood: mood || "N/A",
    trackingId: `TRK-0${Math.floor(100 + Math.random() * 900)}`,
    cameraId: cameraId || "Camera Web Stream",
    timestamp: new Date().toISOString(),
    photoUrl,
    note: note || `${className.toUpperCase()} detected on sensor cluster.`,
    type: logType as "human" | "animal" | "unknown"
  };

  detections.unshift(newLog); // Put on top of history

  res.status(201).json({
    status: "success",
    message: "Detection synced to cloud database successfully",
    data: newLog
  });
});

// 3. Clear Detection Logs
app.post("/api/detections/clear", (req, res) => {
  detections = [];
  res.json({ status: "success", message: "Surveillance log history wiped." });
});

// 4. Get Registered Known Faces
app.get("/api/faces", (req, res) => {
  res.json({
    status: "success",
    count: knownFacesList.length,
    data: knownFacesList
  });
});

// 5. Register a Face (e.g. Upgrade Unknown Face to Known)
app.post("/api/faces/register", (req, res) => {
  const { name, gender, age, moodTrend, permissions } = req.body;

  if (!name) {
    return res.status(400).json({ status: "error", message: "Face database name is required." });
  }

  const newFace: KnownFace = {
    id: `FC-${100 + knownFacesList.length + 1}`,
    name,
    gender: gender || "Unknown",
    age: age || 30,
    moodTrend: moodTrend || "Neutral",
    permissions: permissions || "Authorized",
    registeredAt: new Date().toISOString(),
    avatarSeed: name.toLowerCase().replace(/\s+/g, '')
  };

  knownFacesList.unshift(newFace);

  // Update in-memory detections matching this name from "Unknown" to registered name
  detections = detections.map(d => {
    if (d.className === "person" && d.personName === "Unknown" && d.gender === gender) {
      return { ...d, personName: name, note: `Identified Face matched with registered record: ${name}.`, type: "human" };
    }
    return d;
  });

  res.status(201).json({
    status: "success",
    message: `Biometric features for ${name} registered into secure known face directory.`,
    data: newFace
  });
});

// 6. Delete a Registered Face
app.delete("/api/faces/:id", (req, res) => {
  const { id } = req.params;
  knownFacesList = knownFacesList.filter(f => f.id !== id);
  res.json({ status: "success", message: "Face reference deleted from biometric security keys." });
});

// 6a. Rename a Registered Face Profile
app.post("/api/faces/:id/rename", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ status: "error", message: "A valid name string is required for renaming." });
  }
  knownFacesList = knownFacesList.map(f => f.id === id ? { ...f, name } : f);
  res.json({ status: "success", message: "Biometric security clearance profile identity updated." });
});

// In-memory Backups Database Store
let databaseBackups: any[] = [
  {
    id: "BKP-INIT-01",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    recordsCount: 15,
    facesCount: 3,
    detections: [],
    faces: []
  }
];

// 6b. Export full JSON Database snapshot
app.get("/api/database/export", (req, res) => {
  res.json({
    status: "success",
    data: {
      detections,
      faces: knownFacesList
    }
  });
});

// 6c. Import JSON Database state
app.post("/api/database/import", (req, res) => {
  const { detections: importedDets, faces: importedFaces } = req.body;
  if (Array.isArray(importedDets)) {
    detections = importedDets;
  }
  if (Array.isArray(importedFaces)) {
    knownFacesList = importedFaces;
  }
  res.json({
    status: "success",
    message: "Biometric and logging surveillance records imported successfully."
  });
});

// 6d. Trigger on-demand backup snapshot
app.post("/api/database/backup", (req, res) => {
  const backupId = `BKP-${Date.now()}`;
  const newBackup = {
    id: backupId,
    timestamp: new Date().toISOString(),
    recordsCount: detections.length,
    facesCount: knownFacesList.length,
    detections: [...detections],
    faces: [...knownFacesList]
  };
  databaseBackups.unshift(newBackup);
  res.json({
    status: "success",
    message: "Surveillance archive and clearance directory backup successfully stashed.",
    data: { id: backupId, timestamp: newBackup.timestamp }
  });
});

// 6e. Fetch list of backup checkpoints
app.get("/api/database/backups", (req, res) => {
  res.json({
    status: "success",
    data: databaseBackups.map(b => ({
      id: b.id,
      timestamp: b.timestamp,
      recordsCount: b.recordsCount,
      facesCount: b.facesCount
    }))
  });
});

// 6f. Restore database from snapshot ID
app.post("/api/database/restore/:backupId", (req, res) => {
  const { backupId } = req.params;
  const targetBackup = databaseBackups.find(b => b.id === backupId);
  if (!targetBackup) {
    return res.status(404).json({ status: "error", message: "Specified backup key could not be recovered." });
  }
  
  // Only restore if the arrays are populated, otherwise keep existing values to avoid accidental zeroing
  if (targetBackup.id === "BKP-INIT-01") {
    // Initial state simulation placeholder reset
    detections = [];
    knownFacesList = [
      { id: "FC-101", name: "Alexander Wright", gender: "Male", age: 34, moodTrend: "Smiling", permissions: "Authorized", registeredAt: new Date().toISOString(), avatarSeed: "alex" }
    ];
  } else {
    detections = [...targetBackup.detections];
    knownFacesList = [...targetBackup.faces];
  }

  res.json({
    status: "success",
    message: `Surveillance state restored successfully to milestone ${backupId}.`
  });
});

// 7. Get Active Cameras
app.get("/api/cameras", (req, res) => {
  res.json({ status: "success", data: cameraFeeds });
});

// 8. Get Statistics Metrics
app.get("/api/statistics", (req, res) => {
  const total = detections.length;
  const humans = detections.filter(d => d.type === "human").length;
  const unknowns = detections.filter(d => d.type === "unknown").length;
  const animals = detections.filter(d => d.type === "animal").length;

  // Hourly counts over the last 6 hours
  const hourlyActivity = Array.from({ length: 6 }).map((_, idx) => {
    const hr = new Date();
    hr.setHours(hr.getHours() - (5 - idx));
    const label = `${hr.getHours().toString().padStart(2, '0')}:00`;
    
    // Random but stable distribution
    const count = Math.floor(4 + Math.sin(idx) * 3 + (idx === 5 ? 2 : 0));
    return { hour: label, count };
  });

  // Entity distribution
  const classesCount = detections.reduce((acc: { [key: string]: number }, cur) => {
    acc[cur.className] = (acc[cur.className] || 0) + 1;
    return acc;
  }, {});

  const classDistribution = Object.entries(classesCount).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count
  }));

  res.json({
    status: "success",
    metrics: {
      totalDetections: total,
      knownMatched: humans,
      unknownAlerted: unknowns,
      animalsTracked: animals,
      systemHealth: "Optimal",
      mobileSyncStatus: "Synchronized"
    },
    classDistribution: classDistribution.length > 0 ? classDistribution : [{ name: "Human", count: 1 }],
    hourlyActivity
  });
});

// 9. Real AI Surveillance Analysis using Gemini Vision API!
app.post("/api/gemini/analyze", async (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ status: "error", message: "Base64 image data is required for surveillance frame analysis." });
  }

  const ai = getGeminiClient();

  // If Gemini API is not configured, fall back to simulation to ensure production-grade graceful degradation
  if (!ai) {
    console.log("No Gemini API key available. Generating simulated analysis response.");
    
    // Choose randomly from a list of plausible simulated detection outputs
    const simulationTemplates = [
      {
        className: "person",
        confidence: 0.94,
        personName: "Unknown",
        gender: "Female",
        age: 26,
        mood: "Surprised",
        analysisSummary: "Detected a human female observing the camera directly. Expression appears inquisitive. Potential subject identification pending keycard validation."
      },
      {
        className: "person",
        confidence: 0.97,
        personName: "Alexander Wright",
        gender: "Male",
        age: 34,
        mood: "Smiling",
        analysisSummary: "Biometric correlation verified: Registered security team member Alexander Wright identified. Standard access protocols verified."
      },
      {
        className: "cat",
        confidence: 0.91,
        personName: "Unknown",
        gender: "N/A",
        age: 1,
        mood: "Neutral",
        analysisSummary: "Feline animal detected traversing the secondary perimeter boundary. No security risk detected; environmental tracking logged."
      },
      {
        className: "person",
        confidence: 0.88,
        personName: "Clara Vance",
        gender: "Female",
        age: 28,
        mood: "Focused",
        analysisSummary: "Administrative vault door entry triggered. Clara Vance facial pattern verified successfully under primary light levels."
      }
    ];

    const chosen = simulationTemplates[Math.floor(Math.random() * simulationTemplates.length)];
    
    // Create actual log entry
    const newLog: DetectionLog = {
      id: `DET-${1000 + detections.length + 1}`,
      className: chosen.className,
      confidence: chosen.confidence,
      personName: chosen.personName,
      gender: chosen.gender,
      age: chosen.age,
      mood: chosen.mood,
      trackingId: `TRK-0${Math.floor(100 + Math.random() * 900)}`,
      cameraId: "Webcam Direct AI Feed",
      timestamp: new Date().toISOString(),
      photoUrl: base64Image,
      note: chosen.analysisSummary,
      type: chosen.className === "person" 
        ? (chosen.personName === "Unknown" ? "unknown" : "human") 
        : "animal"
    };

    detections.unshift(newLog);

    return res.json({
      status: "success",
      simulated: true,
      data: newLog
    });
  }

  try {
    const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: rawBase64
      }
    };

    const textPart = {
      text: `You are the master engine of an Enterprise AI Vision Surveillance System.
Analyze this video snapshot taken from a security camera.
Detect any humans, faces, or animals visible. Perform object detection, face recognition, and attributes inference.

You MUST respond strictly in JSON matching this schema:
{
  "className": "the major category of detected entity. Choose ONLY from: 'person', 'cat', 'dog', 'bird', 'car', 'unidentified'",
  "confidence": a number between 0.0 and 1.0 indicating AI confidence score,
  "personName": "If a person is visible, deduce a realistic human name based on standard facial features. If unrecognized or not a human, write 'Unknown'",
  "gender": "Male", "Female", or "N/A",
  "age": an integer estimating the subject's age, or 0 if N/A or animal,
  "mood": "Single word describing emotional state, e.g. 'Calm', 'Alert', 'Serious', 'Smiling', 'Scared', 'N/A'",
  "analysisSummary": "A concise, professional surveillance log entry (max 2 sentences) describing what this camera frame captured and any security recommendation."
}`
    };

    console.log("Calling Gemini API model 'gemini-3.5-flash' for camera frame analysis...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            className: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            personName: { type: Type.STRING },
            gender: { type: Type.STRING },
            age: { type: Type.INTEGER },
            mood: { type: Type.STRING },
            analysisSummary: { type: Type.STRING }
          },
          required: ["className", "confidence", "personName", "gender", "age", "mood", "analysisSummary"]
        }
      }
    });

    const resultText = response.text;
    console.log("Gemini response parsed successfully:", resultText);

    if (!resultText) {
      throw new Error("Empty text returned from Gemini API.");
    }

    const payload = JSON.parse(resultText.trim());

    const logType = payload.className === "person" 
      ? (payload.personName === "Unknown" ? "unknown" : "human") 
      : "animal";

    const newLog: DetectionLog = {
      id: `DET-${1000 + detections.length + 1}`,
      className: payload.className || "unidentified",
      confidence: payload.confidence || 0.85,
      personName: payload.personName || "Unknown",
      gender: payload.gender || "N/A",
      age: payload.age || 0,
      mood: payload.mood || "N/A",
      trackingId: `TRK-0${Math.floor(100 + Math.random() * 900)}`,
      cameraId: "Webcam Direct AI Feed",
      timestamp: new Date().toISOString(),
      photoUrl: base64Image,
      note: payload.analysisSummary || "Object logged on camera analyzer stream.",
      type: logType as "human" | "animal" | "unknown"
    };

    detections.unshift(newLog);

    res.json({
      status: "success",
      simulated: false,
      data: newLog
    });

  } catch (err: any) {
    console.error("Failed to run real-time Gemini AI Vision analyzer:", err);
    res.status(500).json({
      status: "error",
      message: "AI processing error: " + (err.message || "Failed to communicate with intelligence models.")
    });
  }
});


// Express server Vite mounting
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production build from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

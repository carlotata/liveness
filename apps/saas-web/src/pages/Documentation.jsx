import {
  ArrowRight,
  Bell,
  Book,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  FileCode,
  Key,
  Layers,
  Menu,
  Search,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

const SidebarItem = ({ id, label, activeId, onClick, icon: Icon }) => (
  <li>
    <button
      onClick={() => onClick(id)}
      className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all ${
        activeId === id
          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {Icon && (
        <Icon
          className={`mr-3 h-4 w-4 ${activeId === id ? "text-white" : "text-slate-400"}`}
        />
      )}
      {label}
    </button>
  </li>
);

const CodeBlock = ({ code, language, title }) => (
  <div className="relative my-6 overflow-hidden rounded-xl bg-slate-900 text-slate-300 shadow-2xl">
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/50 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></div>
        </div>
        {title && (
          <span className="text-xs font-medium text-slate-400 truncate max-w-50 sm:max-w-none">{title}</span>
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase shrink-0">
        {language}
      </span>
    </div>
    <pre className="overflow-x-auto p-4 sm:p-6 text-xs sm:text-sm leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const IntroContent = () => (
  <div>
    <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
      <Book className="mr-2 h-3.5 w-3.5" /> Documentation v1.0.0
    </div>
    <h1 className="mb-6 sm:mb-8 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
      Liveness SDK
    </h1>
    <p className="mb-8 sm:mb-12 text-lg sm:text-2xl leading-relaxed text-slate-600">
      The industry-standard JavaScript SDK for browser-based Active Liveness
      Detection and Biometric Identity Verification.
    </p>

    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8">
        <h3 className="mb-4 flex items-center text-lg sm:text-xl font-bold">
          <Terminal className="mr-2 h-5 w-5 text-blue-600" /> For Developers
        </h3>
        <p className="mb-6 text-sm text-slate-500">
          Everything you need to integrate biometric security into your web
          application in minutes.
        </p>
        <ul className="mb-8 space-y-3">
          <li className="flex items-center text-sm text-slate-600">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 shrink-0" /> Simple
            Event-Driven API
          </li>
          <li className="flex items-center text-sm text-slate-600">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 shrink-0" /> GPU/WASM
            Accelerated
          </li>
          <li className="flex items-center text-sm text-slate-600">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 shrink-0" /> 100%
            Client-Side Processing
          </li>
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8">
        <h3 className="mb-4 flex items-center text-lg sm:text-xl font-bold">
          <Cloud className="mr-2 h-5 w-5 text-blue-600" /> For Enterprises
        </h3>
        <p className="mb-6 text-sm text-slate-500">
          Managed infrastructure for secure biometric storage, identity
          matching, and audit logs.
        </p>
        <ul className="mb-8 space-y-3">
          <li className="flex items-center text-sm text-slate-600">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 shrink-0" /> Centralized
            API Key Management
          </li>
          <li className="flex items-center text-sm text-slate-600">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 shrink-0" /> Webhook
            Integrations
          </li>
          <li className="flex items-center text-sm text-slate-600">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 shrink-0" /> Secure
            Identity Vault
          </li>
        </ul>
      </div>
    </div>
  </div>
);

const SDKUsageContent = () => (
  <div>
    <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
      Using the SDK
    </h2>
    <p className="mb-6 sm:mb-8 text-base sm:text-lg text-slate-600">
      Integrate the Liveness SDK into your frontend to start capturing biometric
      data securely.
    </p>

    <div className="space-y-8 sm:space-y-12">
      <div>
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">1. Installation</h3>
        <CodeBlock language="bash" code={`npm install @liveness/sdk`} />
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">2. Initialization</h3>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-slate-600">
          You must provide a <code>basePath</code> that points to the MediaPipe
          and TensorFlow.js model assets.
        </p>
        <CodeBlock
          language="javascript"
          code={`import { LivenessSDK } from "@liveness/sdk";

const sdk = new LivenessSDK({
  basePath: "/assets/models", // Local or CDN path
  challengeTimeout: 8000,     // 8 seconds per challenge
  minBrightness: 60,
});`}
        />
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">3. Starting the Session</h3>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-slate-600">
          The SDK requires a <code>&lt;video&gt;</code> element for the camera
          feed and a <code>&lt;canvas&gt;</code> for the debug/face-mesh
          overlay.
        </p>
        <CodeBlock
          language="javascript"
          code={`// Load models
await sdk.load();

// Start camera and detection
const video = document.getElementById("liveness-video");
const canvas = document.getElementById("liveness-canvas");

await sdk.start(video, canvas);`}
        />
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">4. Handling Results</h3>
        <CodeBlock
          language="javascript"
          code={`sdk.on("success", (result) => {
  // result.descriptor is the 1792-d feature vector
  // result.antiSpoofing contains security metrics
  console.log("Success!", result);

  // Send to your backend for verification
  fetch("/api/verify", {
    method: "POST",
    body: JSON.stringify(result)
  });
});

sdk.on("failure", (error) => {
  alert(\`Verification failed: \${error.message}\`);
});`}
        />
      </div>
    </div>
  </div>
);

const CloudUsageContent = () => (
  <div>
    <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
      Liveness Cloud Guide
    </h2>
    <p className="mb-6 sm:mb-8 text-base sm:text-lg text-slate-600">
      The Liveness Cloud provides a managed backend for handling biometric data,
      API keys, and webhooks.
    </p>

    <div className="space-y-8 sm:space-y-12">
      <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/30 p-5 sm:p-8">
        <h3 className="mb-3 sm:mb-4 flex items-center text-lg sm:text-xl font-bold">
          <Key className="mr-2 h-5 w-5 text-blue-600" /> 1. Manage API Keys
        </h3>
        <p className="mb-4 sm:mb-6 text-sm text-slate-600">
          Every request to the Liveness Cloud API requires a valid API Key.
        </p>
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
          <li>
            Navigate to the <strong>API Keys</strong> section in your dashboard.
          </li>
          <li>Create a new key and give it a descriptive name.</li>
          <li>
            Store your <strong>Secret Key</strong> securely; it will only be
            shown once.
          </li>
        </ol>
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 flex items-center text-xl sm:text-2xl font-bold">
          <Bell className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /> 2. Configuring
          Webhooks
        </h3>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-slate-600">
          Get real-time notifications on your server whenever a liveness check
          is completed.
        </p>
        <ul className="mb-6 space-y-4">
          <li className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
              1
            </div>
            <p className="text-sm text-slate-600">
              Enter your endpoint URL in the <strong>Webhooks</strong> tab.
            </p>
          </li>
          <li className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
              2
            </div>
            <p className="text-sm text-slate-600">
              Subscribe to <code>verification.success</code> or{" "}
              <code>verification.failed</code> events.
            </p>
          </li>
          <li className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
              3
            </div>
            <p className="text-sm text-slate-600">
              Save the <strong>Webhook Secret</strong> for signature
              verification.
            </p>
          </li>
        </ul>
        <p className="mb-4 text-sm sm:text-base text-slate-600">
          To verify incoming webhook payloads and avoid formatting issues, use the raw request body buffer:
        </p>
        <CodeBlock
          language="javascript"
          title="Webhook Signature Verification (Node.js/Express)"
          code={`const crypto = require("crypto");

app.post("/webhooks/liveness", (req, res) => {
  const signature = req.headers["x-liveness-signature"];
  const secret = process.env.WEBHOOK_SECRET;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody) // Verify using the raw body buffer
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).send("Invalid signature");
  }

  // Handle verified payload
  const { event, data } = req.body;
  res.status(200).send("Verified!");
});`}
        />
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">3. Cloud API Endpoints</h3>
        <p className="mb-6 text-sm sm:text-base text-slate-600">
          The Liveness Cloud provides secure endpoints for biometric enrollment
          and identity matching. All requests require the <code>x-api-key</code>{" "}
          header.
        </p>
        <div className="space-y-6 sm:space-y-8">
          {/* Enroll Endpoint */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-5 sm:p-8 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-fit rounded px-2.5 py-1 text-xs font-black bg-emerald-100 text-emerald-700">
                POST
              </span>
              <code className="text-sm sm:text-lg font-bold text-slate-900 break-all">
                /api/liveness/enroll
              </code>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Registers a new user with their biometric descriptor. This creates
              a baseline for future identity verifications.
            </p>
            <h5 className="mb-3 text-xs font-black tracking-widest text-slate-400 uppercase">
              Request Body
            </h5>
            <CodeBlock
              language="json"
              code={`{
  "name": "John Doe",
  "descriptor": [...], // 1792-d vector
  "sessionToken": "unique-session-id",
  "timestamp": 1716336000000,
  "integrity": "hash_value"
}`}
            />
          </div>

          {/* Verify Endpoint */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-5 sm:p-8 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-fit rounded px-2.5 py-1 text-xs font-black bg-blue-100 text-blue-700">
                POST
              </span>
              <code className="text-sm sm:text-lg font-bold text-slate-900 break-all">
                /api/liveness/verify
              </code>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Compares a fresh liveness result against your enrolled user
              database. Returns a match if similarity exceeds <strong>0.65</strong>.
            </p>
            <h5 className="mb-3 text-xs font-black tracking-widest text-slate-400 uppercase">
              Response Schema
            </h5>
            <CodeBlock
              language="json"
              code={`{
  "verified": true,
  "status": "SUCCESS",
  "match": {
    "name": "John Doe",
    "similarity": 0.94
  }
}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">4. Payload Integrity</h3>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-slate-600">
          To prevent man-in-the-middle attacks, the Cloud API validates the{" "}
          <code>integrity</code> field using a deterministic hash of the
          payload.
        </p>
        <CodeBlock
          language="javascript"
          title="Integrity Hash (JS Implementation)"
          code={`const generateHash = (descriptor, sessionToken, timestamp) => {
  const data = JSON.stringify(descriptor) + sessionToken + timestamp;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};`}
        />
      </div>
    </div>
  </div>
);

const MethodologyContent = () => (
  <div>
    <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
      Detection Methodology
    </h2>

    <div className="space-y-8 sm:space-y-12">
      <div className="rounded-2xl border border-slate-100 p-5 sm:p-8">
        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">
          Active Verification (State Machine)
        </h3>
        <p className="mb-6 leading-relaxed text-sm sm:text-base text-slate-600">
          The SDK validates "aliveness" by requiring physiological responses to
          randomized challenges.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-5 sm:p-6">
            <h5 className="mb-2 font-bold text-sm sm:text-base">Blink Analysis (EAR)</h5>
            <p className="text-xs leading-relaxed text-slate-500">
              We calculate the Eye Aspect Ratio using 6 landmarks per eye. A
              blink is registered when the EAR drops below 0.25 after being
              above 0.3 (open).
            </p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-5 sm:p-6">
            <h5 className="mb-2 font-bold text-sm sm:text-base">Head Pose (3D)</h5>
            <p className="text-xs leading-relaxed text-slate-500">
              Yaw and Pitch are estimated by measuring the pixel-distance ratio
              between the nose bridge and the cheek boundaries in 3D space.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 p-5 sm:p-8">
        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">
          Anti-Spoofing Analytics
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600 text-xs">
              FFT
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">
                Moiré Detection
              </h5>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Detects high-frequency sub-pixel patterns from digital screens
                using Fast Fourier Transform.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600 text-xs">
              LV
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">
                Texture Variance
              </h5>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Uses Laplacian kernels to measure the edge-sharpness of the
                face, identifying flat printouts or low-res displays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const APIRefContent = () => (
  <div>
    <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
      API & Events Reference
    </h2>

    <div className="space-y-8 sm:space-y-12">
      <div>
        <h3 className="mb-4 sm:mb-6 font-mono text-lg sm:text-xl font-bold text-blue-600">
          LivenessSDK Configuration
        </h3>
        <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm min-w-125">
            <thead className="bg-slate-50 font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Option</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Default</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  name: "basePath",
                  def: '""',
                  desc: "Path to models directory.",
                },
                {
                  name: "challengeTimeout",
                  def: "5000",
                  desc: "Max ms allowed per active challenge.",
                },
                { name: "minBrightness", def: "50", desc: "Minimum frame brightness (0-255 or normalized -0.92)." },
                { name: "maxBrightness", def: "0.95", desc: "Maximum frame brightness before glare detection." },
                { name: "maxFFTPeak", def: "180.0", desc: "Threshold peak for digital screen Moiré pattern detection." },
                {
                  name: "targetFPS",
                  def: "30",
                  desc: "Frame rate limit for detection processing.",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono font-bold text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500">{row.def}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-4 sm:mb-6 font-bold text-slate-900">Event Registry</h3>
        <div className="space-y-4">
          {[
            { event: "ready", payload: "void", trigger: "Models loaded and environment checks passed." },
            {
              event: "challenge",
              payload: "{ type, instruction, distance }",
              trigger: "New challenge step requested or position updated.",
            },
            {
              event: "progress",
              payload: "{ progress, rawValue }",
              trigger: "Challenge step completion progress updated.",
            },
            {
              event: "success",
              payload: "{ descriptor, sessionToken, timestamp, challenges, integrity, antiSpoofing }",
              trigger: "All active challenges and quality checks passed.",
            },
            {
              event: "failure",
              payload: "{ code, message }",
              trigger: "Anti-spoofing validation or challenge check failed.",
            },
            {
              event: "error",
              payload: "{ code, message }",
              trigger: "System, browser, hardware, or model load error.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
            >
              <div>
                <span className="font-mono text-sm font-bold text-blue-600">
                  "{item.event}"
                </span>
                <p className="mt-1 text-xs text-slate-500">{item.trigger}</p>
              </div>
              <span className="w-fit rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-400">
                Payload: {item.payload}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 sm:mb-6 font-bold text-slate-900">Error Codes Reference</h3>
        <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm min-w-125">
            <thead className="bg-slate-50 font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Error Code</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Event</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { code: "POOR_LIGHTING", event: "failure", desc: "Environment is too dark or glare detected." },
                { code: "SPOOF_DETECTED", event: "failure", desc: "Screen pattern (Moiré) or flat surface detected." },
                { code: "OCCLUSION_DETECTED", event: "failure", desc: "Face is partially covered." },
                { code: "FACE_NOT_FOUND", event: "failure", desc: "No face detected in video stream." },
                { code: "CHALLENGE_TIMEOUT", event: "failure", desc: "Challenge time limit exceeded." },
                { code: "RECOGNITION_FAILED", event: "failure", desc: "Biometric feature extraction error." },
                { code: "WASM_NOT_SUPPORTED", event: "error", desc: "WebAssembly unsupported in browser." },
                { code: "WEBGL_NOT_SUPPORTED", event: "error", desc: "WebGL acceleration unavailable." },
                { code: "CAMERA_ACCESS_DENIED", event: "error/failure", desc: "User denied camera access permission." },
                { code: "CAMERA_NOT_FOUND", event: "error/failure", desc: "No camera device found on system." },
                { code: "MODEL_LOAD_FAILED", event: "error/failure", desc: "Failed to download neural network weights." },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono font-bold text-red-600 text-xs sm:text-sm">
                    {row.code}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-xs text-slate-500">{row.event}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const Documentation = () => {
  const [activePage, setActivePage] = useState("introduction");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = api.auth.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get("section") || hash;
    const validSections = ["introduction", "sdk-usage", "cloud-usage", "methodology", "api-ref"];
    if (section && validSections.includes(section)) {
      setActivePage(section);
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTopicChange = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const openModal = (path) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  const menu = [
    {
      title: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction", icon: Book },
        { id: "sdk-usage", label: "How to use SDK", icon: Code2 },
        { id: "cloud-usage", label: "How to use Cloud", icon: Cloud },
      ],
    },
    {
      title: "Deep Dive",
      items: [
        { id: "methodology", label: "Methodology", icon: Layers },
        { id: "api-ref", label: "API Reference", icon: FileCode },
      ],
    },
  ];

  const flatItems = menu.flatMap((g) => g.items);
  const currentIndex = flatItems.findIndex((i) => i.id === activePage);
  const prevItem = flatItems[currentIndex - 1];
  const nextItem = flatItems[currentIndex + 1];

  const renderContent = () => (
    <div key={activePage}>
      {(() => {
        switch (activePage) {
          case "introduction":
            return <IntroContent />;
          case "sdk-usage":
            return <SDKUsageContent />;
          case "cloud-usage":
            return <CloudUsageContent />;
          case "methodology":
            return <MethodologyContent />;
          case "api-ref":
            return <APIRefContent />;
          default:
            return <IntroContent />;
        }
      })()}
    </div>
  );

  const renderSidebarContent = () => (
    <>
      {menu.map((group, idx) => (
        <div key={idx} className="mb-6 last:mb-0">
          <h5 className="mb-2.5 px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            {group.title}
          </h5>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                id={item.id}
                label={item.label}
                activeId={activePage}
                onClick={handleTopicChange}
                icon={item.icon}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  const currentItem = flatItems.find((i) => i.id === activePage) || flatItems[0];
  const CurrentIcon = currentItem.icon;

  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);

  const pageContent = (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Custom Responsive Animated Mobile Topic Dropdown Selector */}
      <div className="lg:hidden w-full mb-3 relative">
        <button
          onClick={() => setTopicDropdownOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 px-4 shadow-sm transition-all hover:border-slate-300 active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <CurrentIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topic</span>
              <span className="text-sm font-bold text-slate-900 truncate">
                {currentItem.label}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              topicDropdownOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </button>

        {/* Custom Animated Topic Menu Panel */}
        {topicDropdownOpen && (
          <div className="absolute top-full left-0 right-0 z-40 mt-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {menu.map((group, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activePage === item.id;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleTopicChange(item.id);
                          setTopicDropdownOpen(false);
                        }}
                        className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {ItemIcon && (
                          <ItemIcon
                            className={`mr-3 h-4 w-4 ${
                              isActive ? "text-white" : "text-slate-400"
                            }`}
                          />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sub-navigation Sidebar for Docs Topics (Hidden on mobile, sticky on desktop) */}
      <aside className="hidden lg:block w-64 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs h-fit sticky top-24">
        {renderSidebarContent()}
      </aside>

      {/* Docs Main Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-8 md:p-10 shadow-xs">
          {renderContent()}

          {/* Compact Inline Pagination Controls */}
          <div className="mt-10 sm:mt-12 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
            {prevItem ? (
              <button
                onClick={() => handleTopicChange(prevItem.id)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
              >
                <ArrowRight className="h-4 w-4 rotate-180 text-slate-400 transition-transform group-hover:-translate-x-1 group-hover:text-blue-600" />
                <span>{prevItem.label}</span>
              </button>
            ) : (
              <div />
            )}

            {nextItem ? (
              <button
                onClick={() => handleTopicChange(nextItem.id)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group ml-auto"
              >
                <span>{nextItem.label}</span>
                <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
              </button>
            ) : null}
          </div>
        </div>

        <footer className="mt-8 text-center text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} Liveness Cloud Platform. All rights reserved.
        </footer>
      </div>
    </div>
  );

  return user ? (
    <DashboardLayout>{pageContent}</DashboardLayout>
  ) : (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased">
      {/* Shared Reusable Public Glassmorphism Header Navigation */}
      <Navbar />

      {/* Main Documentation Body with Original Light Slate Background */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-12">
        {pageContent}
      </div>
    </div>
  );
};

export default Documentation;



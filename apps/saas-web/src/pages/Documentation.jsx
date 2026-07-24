import {
  ArrowRight,
  Bell,
  Book,
  CheckCircle2,
  Cloud,
  Code2,
  FileCode,
  Key,
  Layers,
  Menu,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
          <span className="text-xs font-medium text-slate-400 truncate max-w-[200px] sm:max-w-none">{title}</span>
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
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
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
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
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
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="mb-8 text-4xl font-black tracking-tight text-slate-900">
      Using the SDK
    </h2>
    <p className="mb-8 text-lg text-slate-600">
      Integrate the Liveness SDK into your frontend to start capturing biometric
      data securely.
    </p>

    <div className="space-y-12">
      <div>
        <h3 className="mb-4 text-2xl font-bold">1. Installation</h3>
        <CodeBlock language="bash" code={`npm install @liveness/sdk`} />
      </div>

      <div>
        <h3 className="mb-4 text-2xl font-bold">2. Initialization</h3>
        <p className="mb-4 text-slate-600">
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
        <h3 className="mb-4 text-2xl font-bold">3. Starting the Session</h3>
        <p className="mb-4 text-slate-600">
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
        <h3 className="mb-4 text-2xl font-bold">4. Handling Results</h3>
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
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="mb-8 text-4xl font-black tracking-tight text-slate-900">
      Liveness Cloud Guide
    </h2>
    <p className="mb-8 text-lg text-slate-600">
      The Liveness Cloud provides a managed backend for handling biometric data,
      API keys, and webhooks.
    </p>

    <div className="space-y-12">
      <div className="rounded-3xl border-2 border-blue-100 bg-blue-50/30 p-8">
        <h3 className="mb-4 flex items-center text-xl font-bold">
          <Key className="mr-2 h-5 w-5 text-blue-600" /> 1. Manage API Keys
        </h3>
        <p className="mb-6 text-sm text-slate-600">
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
        <h3 className="mb-4 flex items-center text-2xl font-bold">
          <Bell className="mr-2 h-6 w-6 text-blue-600" /> 2. Configuring
          Webhooks
        </h3>
        <p className="mb-4 text-slate-600">
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
        <p className="mb-4 text-slate-600">
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
        <h3 className="mb-4 text-2xl font-bold">3. Cloud API Endpoints</h3>
        <p className="mb-6 text-slate-600">
          The Liveness Cloud provides secure endpoints for biometric enrollment
          and identity matching. All requests require the <code>x-api-key</code>{" "}
          header.
        </p>
        <div className="space-y-8">
          {/* Enroll Endpoint */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded px-2.5 py-1 text-xs font-black bg-emerald-100 text-emerald-700">
                POST
              </span>
              <code className="text-lg font-bold text-slate-900">
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
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded px-2.5 py-1 text-xs font-black bg-blue-100 text-blue-700">
                POST
              </span>
              <code className="text-lg font-bold text-slate-900">
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
        <h3 className="mb-4 text-2xl font-bold">4. Payload Integrity</h3>
        <p className="mb-4 text-slate-600">
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
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="mb-8 text-4xl font-black tracking-tight text-slate-900">
      Detection Methodology
    </h2>

    <div className="space-y-12">
      <div className="rounded-3xl border border-slate-100 p-8">
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          Active Verification (State Machine)
        </h3>
        <p className="mb-6 leading-relaxed text-slate-600">
          The SDK validates "aliveness" by requiring physiological responses to
          randomized challenges.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6">
            <h5 className="mb-2 font-bold">Blink Analysis (EAR)</h5>
            <p className="text-xs leading-relaxed text-slate-500">
              We calculate the Eye Aspect Ratio using 6 landmarks per eye. A
              blink is registered when the EAR drops below 0.25 after being
              above 0.3 (open).
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6">
            <h5 className="mb-2 font-bold">Head Pose (3D)</h5>
            <p className="text-xs leading-relaxed text-slate-500">
              Yaw and Pitch are estimated by measuring the pixel-distance ratio
              between the nose bridge and the cheek boundaries in 3D space.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 p-8">
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          Anti-Spoofing Analytics
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
              FFT
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">
                Moiré Detection
              </h5>
              <p className="mt-1 text-xs text-slate-500">
                Detects high-frequency sub-pixel patterns from digital screens
                using Fast Fourier Transform.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
              LV
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">
                Texture Variance
              </h5>
              <p className="mt-1 text-xs text-slate-500">
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
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="mb-8 text-4xl font-black tracking-tight text-slate-900">
      API & Events Reference
    </h2>

    <div className="space-y-12">
      <div>
        <h3 className="mb-6 font-mono text-xl font-bold text-blue-600">
          LivenessSDK Configuration
        </h3>
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Option</th>
                <th className="px-6 py-4">Default</th>
                <th className="px-6 py-4">Description</th>
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
                  desc: "Max ms per challenge.",
                },
                { name: "minBrightness", def: "50", desc: "Scale 0-255." },
                {
                  name: "targetFPS",
                  def: "30",
                  desc: "Throttling for performance.",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.def}</td>
                  <td className="px-6 py-4 text-slate-500">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-6 font-bold text-slate-900">Event Registry</h3>
        <div className="space-y-4">
          {[
            { event: "ready", payload: "void", trigger: "Models loaded." },
            {
              event: "challenge",
              payload: "{ type, instruction }",
              trigger: "New action requested.",
            },
            {
              event: "success",
              payload: "LivenessResult",
              trigger: "Checks passed.",
            },
            {
              event: "failure",
              payload: "{ code, message }",
              trigger: "Security check failed.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
            >
              <div>
                <span className="font-mono text-sm font-bold text-blue-600">
                  "{item.event}"
                </span>
                <p className="mt-1 text-xs text-slate-500">{item.trigger}</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-400">
                Payload: {item.payload}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Documentation = () => {
  const [activePage, setActivePage] = useState("introduction");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const renderContent = () => {
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
  };

  const renderSidebarContent = () => (
    <>
      {menu.map((group, idx) => (
        <div key={idx} className="mb-8">
          <h5 className="mb-3 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
            {group.title}
          </h5>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                id={item.id}
                label={item.label}
                activeId={activePage}
                onClick={(id) => {
                  setActivePage(id);
                  setMobileMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                icon={item.icon}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 sm:px-6 md:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Open documentation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-blue-600 shrink-0" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Liveness Cloud{" "}
              <span className="ml-1 font-medium text-slate-400">Docs</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-6">
          <Link
            to="/login"
            className="text-xs sm:text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
          >
            Dashboard
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-blue-600 px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 shrink-0"
          >
            Get API Key
          </Link>
        </div>
      </nav>

      {/* Mobile Docs Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl transition-transform duration-300 overflow-y-auto lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900">Documentation</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderSidebarContent()}
      </aside>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop Sidebar */}
        <aside className="fixed hidden h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-slate-100 bg-white p-8 lg:block">
          {renderSidebarContent()}
        </aside>

        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 sm:px-6 py-8 sm:py-16 lg:ml-72 lg:px-20">
          <div className="mx-auto max-w-4xl">
            {renderContent()}

            <div className="mt-16 sm:mt-24 md:mt-32 flex justify-between border-t border-slate-100 pt-8 sm:pt-12">
              <div></div>
              <button
                onClick={() => {
                  const flatItems = menu.flatMap((g) => g.items);
                  const currentIndex = flatItems.findIndex(
                    (i) => i.id === activePage,
                  );
                  const nextItem = flatItems[currentIndex + 1];
                  if (nextItem) {
                    setActivePage(nextItem.id);
                    window.scrollTo(0, 0);
                  }
                }}
                className="group flex items-center gap-3 text-right"
              >
                <div>
                  <span className="mb-1 block text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Next Page
                  </span>
                  <span className="block text-sm sm:text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                    {menu.flatMap((g) => g.items)[
                      menu
                        .flatMap((g) => g.items)
                        .findIndex((i) => i.id === activePage) + 1
                    ]?.label || "End of Docs"}
                  </span>
                </div>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 transition-all group-hover:border-blue-600 group-hover:bg-blue-50 shrink-0">
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </button>
            </div>

            <footer className="mt-12 sm:mt-20 border-t border-slate-100 pt-10 sm:pt-16 text-center text-slate-400">
              <p className="mb-6 font-medium text-xs sm:text-sm">
                &copy; {new Date().getFullYear()} Liveness Cloud Platform. MIT
                Licensed.
              </p>
              <div className="flex justify-center space-x-6 sm:space-x-8">
                <Link
                  to="/"
                  className="text-xs sm:text-sm font-semibold transition-colors hover:text-blue-600"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold transition-colors hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <Link
                  to="/signup"
                  className="text-xs sm:text-sm font-semibold transition-colors hover:text-blue-600"
                >
                  Pricing
                </Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documentation;

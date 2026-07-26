// src/components/LivenessChecker.jsx
import { calculateCosineSimilarity } from "@liveness/engine/utils";
import { LivenessSDK } from "@liveness/sdk";
import { useEffect, useRef, useState } from "react";
import { ApiSettings } from "./ApiSettings";
import { ProgressBar } from "./ProgressBar";

const UI_STATE = {
  IDLE: "IDLE",
  LOADING_MODELS: "LOADING_MODELS",
  READY_TO_START: "READY_TO_START",
  CAMERA_ERROR: "CAMERA_ERROR",
  CHECKING: "CHECKING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
};

const MODE = {
  ENROLL: "ENROLL",
  VERIFY: "VERIFY",
};

export function LivenessChecker() {
  const [uiState, setUiState] = useState(UI_STATE.IDLE);
  const [mode, setMode] = useState(MODE.ENROLL);
  const [instruction, setInstruction] = useState("");
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [distanceHint, setDistanceHint] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedChallenges, setSelectedChallenges] = useState([
    "WAITING",
    "BLINK",
    "TURN_LEFT",
    "TURN_RIGHT",
  ]);

  const [sessionMetrics, setSessionMetrics] = useState(null);

  const toggleChallenge = (type) => {
    setSelectedChallenges((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== type);
      } else {
        const order = ["WAITING", "BLINK", "TURN_LEFT", "TURN_RIGHT"];
        const next = [...prev, type];
        return order.filter((c) => next.includes(c));
      }
    });
  };

  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem("cloud_api_config");
    return saved
      ? JSON.parse(saved)
      : { apiKey: "", apiUrl: "http://localhost:3000/api/liveness" };
  });

  const isCloudEnabled = !!apiConfig.apiKey;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sdkRef = useRef(null);
  const userNameRef = useRef(userName);
  const enrolledUsersRef = useRef(enrolledUsers);
  const apiConfigRef = useRef(apiConfig);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    enrolledUsersRef.current = enrolledUsers;
  }, [enrolledUsers]);

  useEffect(() => {
    apiConfigRef.current = apiConfig;
    localStorage.setItem("cloud_api_config", JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    if (!isCloudEnabled) {
      const saved = localStorage.getItem("face_identity");
      if (saved) {
        try {
          const users = JSON.parse(saved);
          if (Array.isArray(users) && users.length > 0) {
            setEnrolledUsers(users);
            setMode(MODE.VERIFY);
          }
        } catch (e) {
          console.error("Failed to parse enrolled identities", e);
        }
      }
    } else {
      setEnrolledUsers([]);
      setMode(MODE.VERIFY);
    }
  }, [isCloudEnabled]);

  useEffect(() => {
    setUiState(UI_STATE.LOADING_MODELS);
    setInstruction("Loading models, please wait...");

    const sdk = new LivenessSDK({
      headTurnThreshold: 0.4,
      challengeTimeout: 10000,
    });

    sdk.on("ready", () => {
      setUiState(UI_STATE.READY_TO_START);
      setInstruction('Click "Start" to begin.');
    });

    sdk.on("challenge", ({ type, instruction, distance }) => {
      setCurrentChallenge(type);
      setInstruction(instruction);
      setDistanceHint(distance);
      setProgress(0);
    });

    sdk.on("progress", ({ progress }) => {
      setProgress(progress);
    });

    sdk.on("success", async (livenessResult) => {
      const { descriptor, challengeFaceData, identityContinuity } = livenessResult;
      setCurrentChallenge(null);

      setSessionMetrics({
        challengeCount: challengeFaceData?.length || 0,
        identityContinuity: identityContinuity
          ? (identityContinuity.minSimilarity * 100).toFixed(1)
          : "100.0",
      });

      if (apiConfigRef.current.apiKey) {
        try {
          const apiKey = apiConfigRef.current.apiKey.trim();
          if (/[\u0080-\uFFFF]/.test(apiKey) || apiKey.includes("•")) {
            throw new Error(
              "Invalid API Key: Contains masked bullet characters ('•') or non-ASCII characters. Please enter your full, unmasked API key.",
            );
          }
          if (apiKey.includes("*")) {
            throw new Error(
              "Invalid API Key: Masked keys cannot be used to authenticate. Please copy and use your full API key.",
            );
          }

          setInstruction("Syncing with Cloud API...");
          const endpoint =
            mode === MODE.ENROLL
              ? `${apiConfigRef.current.apiUrl}/enroll`
              : `${apiConfigRef.current.apiUrl}/verify`;

          const body =
            mode === MODE.ENROLL
              ? { name: userNameRef.current || "User", ...livenessResult }
              : livenessResult;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "API Request failed");
          }

          const cloudResult = await response.json();

          if (mode === MODE.ENROLL) {
            setUiState(UI_STATE.SUCCESS);
            setInstruction(
              `Cloud Identity Enrolled Successfully for ${cloudResult.name}!`,
            );
            setUserName("");
          } else {
            setMatchScore(cloudResult.match?.similarity || 0);
            setSessionMetrics((prev) => ({
              ...prev,
              confidence: cloudResult.confidence,
              effectiveThreshold: cloudResult.effectiveThreshold,
            }));
            setUiState(UI_STATE.SUCCESS);
            setInstruction(
              cloudResult.verified
                ? `Identity Verified: ${cloudResult.match?.name}`
                : "Identity Could Not Be Verified",
            );
          }
        } catch (err) {
          setUiState(UI_STATE.FAILURE);
          setInstruction(`Cloud API Error: ${err.message}`);
        }
      } else {
        if (mode === MODE.ENROLL) {
          const newIdentity = {
            name: userNameRef.current || "User",
            descriptor,
          };
          setEnrolledUsers((prev) => {
            const updated = [...prev, newIdentity];
            localStorage.setItem("face_identity", JSON.stringify(updated));
            return updated;
          });
          setUiState(UI_STATE.SUCCESS);
          setInstruction(
            `Identity Enrolled Successfully for ${newIdentity.name}!`,
          );
          setUserName("");
        } else {
          if (enrolledUsersRef.current.length > 0) {
            let bestMatch = { score: -1, name: "Unknown" };

            enrolledUsersRef.current.forEach((user) => {
              const score = calculateCosineSimilarity(
                descriptor,
                user.descriptor,
              );
              if (score > bestMatch.score) {
                bestMatch = { score, name: user.name };
              }
            });

            setMatchScore(bestMatch.score);
            setUiState(UI_STATE.SUCCESS);
            setInstruction(
              bestMatch.score > 0.65
                ? `Identity Verified! Welcome, ${bestMatch.name}.`
                : "Identity Mismatch!",
            );
          }
        }
      }
    });

    sdk.on("failure", (error) => {
      setUiState(UI_STATE.FAILURE);
      setInstruction(`Error: ${error.message}`);
      setCurrentChallenge(null);
    });

    sdk.on("error", (err) => {
      setUiState(UI_STATE.FAILURE);
      setInstruction(`System Error: ${err.message}`);
    });

    sdk.load().catch(console.error);
    sdkRef.current = sdk;

    const currentVideo = videoRef.current;
    return () => sdkRef.current?.stop(currentVideo);
  }, [mode]);

  const handleStartClick = async () => {
    if (!videoRef.current || !canvasRef.current || !sdkRef.current) return;
    setProgress(0);
    setMatchScore(null);
    setCurrentChallenge(null);
    setUiState(UI_STATE.CHECKING);

    // Generate a new session token for this attempt
    const sessionToken = `sess_${Math.random().toString(36).substring(2, 15)}`;
    if (typeof sdkRef.current.updateConfig === "function") {
      sdkRef.current.updateConfig({
        sessionToken,
        challenges: selectedChallenges,
      });
    } else {
      sdkRef.current.config.sessionToken = sessionToken;
      sdkRef.current.config.challenges = selectedChallenges;
    }

    try {
      await sdkRef.current.start(videoRef.current, canvasRef.current);
    } catch {
      setUiState(UI_STATE.CAMERA_ERROR);
    }
  };

  const clearIdentity = () => {
    localStorage.removeItem("face_identity");
    setEnrolledUsers([]);
    setUserName("");
    setMode(MODE.ENROLL);
    setUiState(UI_STATE.READY_TO_START);
  };

  const removeIdentity = (indexToRemove) => {
    setEnrolledUsers((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      if (updated.length === 0) {
        localStorage.removeItem("face_identity");
        setMode(MODE.ENROLL);
      } else {
        localStorage.setItem("face_identity", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isCloudEnabled ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-400"}`}
          ></div>
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {isCloudEnabled ? "Cloud Mode Enabled" : "Local Mode Only"}
          </span>
        </div>
        <ApiSettings config={apiConfig} onSave={setApiConfig} />
      </div>

      <div className="mb-6 flex w-full max-w-sm rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setMode(MODE.ENROLL)}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            mode === MODE.ENROLL
              ? "bg-white text-blue-600 shadow"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Enroll
        </button>
        <button
          onClick={() => setMode(MODE.VERIFY)}
          disabled={!isCloudEnabled && enrolledUsers.length === 0}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            mode === MODE.VERIFY
              ? "bg-white text-blue-600 shadow"
              : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
          }`}
        >
          Verify
        </button>
      </div>

      {mode === MODE.ENROLL && uiState === UI_STATE.READY_TO_START && (
        <div className="mb-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="Enter your full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      )}

      {uiState === UI_STATE.READY_TO_START && (
        <div className="mb-6 w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
            Active Challenges Sequence
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "WAITING", label: "Center Face" },
              { id: "BLINK", label: "Eye Blink" },
              { id: "TURN_LEFT", label: "Turn Left" },
              { id: "TURN_RIGHT", label: "Turn Right" },
            ].map((ch) => (
              <label
                key={ch.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                  selectedChallenges.includes(ch.id)
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>{ch.label}</span>
                <input
                  type="checkbox"
                  checked={selectedChallenges.includes(ch.id)}
                  onChange={() => toggleChallenge(ch.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-slate-900/10">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full scale-x-[-1] transform object-cover"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute top-4 right-0 left-0 z-10 flex justify-center px-4">
          <div className="rounded-full border border-white/10 bg-black/60 px-6 py-2 text-center text-sm font-medium text-white shadow-lg backdrop-blur-md">
            {uiState === UI_STATE.LOADING_MODELS
              ? "Loading AI Models..."
              : instruction}
          </div>
        </div>

        {currentChallenge === "WAITING" && distanceHint && (
          <div className="absolute top-1/2 right-0 left-0 z-10 flex justify-center">
            <div className="rounded-full border border-white/10 bg-red-500/80 px-6 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
              {`Move ${distanceHint}`}
            </div>
          </div>
        )}

        {(uiState === UI_STATE.READY_TO_START ||
          uiState === UI_STATE.FAILURE) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <button
              onClick={handleStartClick}
              disabled={mode === MODE.ENROLL && !userName.trim()}
              className={`flex transform items-center gap-2 rounded-full px-8 py-3 font-bold shadow-lg transition-all ${
                mode === MODE.ENROLL && !userName.trim()
                  ? "cursor-not-allowed bg-slate-500 text-slate-200 opacity-75"
                  : "bg-blue-600 text-white hover:scale-105 hover:bg-blue-500 active:scale-95"
              }`}
            >
              {uiState === UI_STATE.READY_TO_START
                ? "Start Session"
                : "Retry Check"}
            </button>
          </div>
        )}

        {(currentChallenge === "TURN_LEFT" ||
          currentChallenge === "TURN_RIGHT") && (
          <div className="absolute right-0 bottom-0 left-0 z-10 p-6">
            <ProgressBar
              progress={progress}
              direction={currentChallenge === "TURN_LEFT" ? "left" : "right"}
            />
          </div>
        )}

        {uiState === UI_STATE.SUCCESS && (
          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center text-white backdrop-blur-md ${
              (mode === MODE.VERIFY && matchScore < 0.65) ||
              instruction.includes("Mismatch")
                ? "bg-red-500/90"
                : "bg-green-500/90"
            }`}
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
              {(mode === MODE.VERIFY && matchScore < 0.65) ||
              instruction.includes("Mismatch") ? (
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              )}
            </div>
            <h3 className="px-6 text-center text-2xl leading-tight font-bold">
              {instruction}
            </h3>
            {matchScore !== null && (
              <p className="mt-2 font-mono text-white/90">
                Match Score: {(matchScore * 100).toFixed(2)}%
              </p>
            )}
            {sessionMetrics && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                  {sessionMetrics.challengeCount} Poses Aggregated
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                  Continuity: {sessionMetrics.identityContinuity}%
                </span>
                {sessionMetrics.confidence && (
                  <span className="rounded-full bg-white/30 px-3 py-1 font-bold backdrop-blur-sm">
                    Rating: {sessionMetrics.confidence}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => setUiState(UI_STATE.READY_TO_START)}
              className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {!isCloudEnabled && enrolledUsers.length > 0 && (
        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="font-bold text-slate-800">
              Local Identities ({enrolledUsers.length})
            </h3>
            <button
              onClick={clearIdentity}
              className="text-xs font-bold tracking-wider text-red-500 uppercase hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {enrolledUsers.map((user, index) => (
              <li
                key={index}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {user.name || "Unknown User"}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      ID:{" "}
                      {user.descriptor
                        .slice(0, 3)
                        .map((n) => n.toFixed(2))
                        .join(", ")}
                      ...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeIdentity(index)}
                  className="rounded-full p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                  title="Remove User"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isCloudEnabled && (
        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-700">
            <strong>Cloud Mode Active:</strong> All face data and logs are
            processed and stored on your secure SaaS backend.
          </p>
        </div>
      )}
    </div>
  );
}

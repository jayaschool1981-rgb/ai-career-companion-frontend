import { useState, useEffect } from "react";
import API from "../utils/api";
import { AiOutlineUpload, AiOutlineFileText } from "react-icons/ai";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.replace("/");
  }, []);

  const onFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
    setResumeText("");
    setResult(null);
    setError("");
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated. Please login again.");

      let res;
      const headers = { Authorization: `Bearer ${token}` };

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        res = await API.post("/analyze", formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(pct);
            }
          },
        });
      } else if (resumeText.trim()) {
        res = await API.post("/analyze", { text: resumeText }, { headers });
      } else {
        throw new Error(
          "Please upload a file or paste resume text before analyzing."
        );
      }

      setResult(res.data);
    } catch (err) {
      console.error("Analyze error:", err.response?.data ?? err.message);
      const msg =
        err.response?.data?.message ?? err.message ?? "Something went wrong.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const prettyScore = (n) => (typeof n === "number" ? `${n}%` : n ?? "—");

  // Prepare chart data if skills available
  const chartData =
    result?.skills?.map((s) => ({
      skill: s,
      level: Math.floor(Math.random() * 30) + 70, // mock skill strength
    })) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          AI Resume Analyzer
        </h2>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <label className="flex flex-col items-start p-4 border rounded-lg cursor-pointer hover:shadow-sm">
              <div className="flex items-center gap-3">
                <AiOutlineUpload className="text-2xl text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Upload resume (PDF or DOCX)
                  </div>
                  <div className="text-xs text-gray-400">
                    Or paste resume text in the box on the right
                  </div>
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,.docx"
                className="mt-4 block w-full text-sm"
                onChange={onFileChange}
              />

              {file && (
                <div className="mt-3 w-full bg-gray-100 p-3 rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </label>

            {/* Text area */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AiOutlineFileText className="text-xl text-green-600" />
                <div className="text-sm font-medium text-gray-700">
                  Paste your resume text
                </div>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setFile(null);
                  setResult(null);
                }}
                rows={10}
                placeholder="Paste resume content here..."
                className="w-full p-3 border rounded-md text-sm resize-y"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResumeText("");
                setResult(null);
                setError("");
                setProgress(0);
              }}
              className="px-4 py-2 rounded-md border text-sm"
            >
              Reset
            </button>

            <div className="ml-auto text-sm text-gray-500">
              {progress > 0 && progress < 100 && (
                <span>Uploading: {progress}%</span>
              )}
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Analysis Result</h3>
              <div className="text-sm text-gray-500">
                Source: {file ? file.name : "Pasted text"}
              </div>
            </div>

            {/* Score Circle */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative flex items-center justify-center"
              >
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (result.score / 100) * 377}
                    strokeLinecap="round"
                    transition={{ duration: 1 }}
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-800">
                  {prettyScore(result.score)}
                </span>
              </motion.div>

              {/* Skill Radar Chart */}
              {chartData.length > 0 && (
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <Tooltip />
                      <Radar
                        name="Skill Strength"
                        dataKey="level"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Extracted Skills */}
            {result.skills?.length > 0 && (
              <div className="p-4 border rounded-md bg-blue-50">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Extracted Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-sm px-3 py-1 bg-white text-blue-800 rounded-full border shadow-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {result.feedback && (
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Feedback & Suggestions
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {result.feedback}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="p-3 border rounded text-sm bg-gray-50">
              <summary className="cursor-pointer mb-2">
                View raw JSON result
              </summary>
              <pre className="text-xs max-h-48 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

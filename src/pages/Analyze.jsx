// src/pages/Analyze.jsx
import { useState, useEffect } from "react";
import API from "../utils/api";
import { AiOutlineUpload, AiOutlineFileText } from "react-icons/ai";

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // protect route (optional if you already added protection elsewhere)
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
        // file upload path
        const formData = new FormData();
        formData.append("file", file);

        // with progress
        res = await API.post("/analyze", formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(pct);
            }
          },
        });
      } else if (resumeText.trim()) {
        // text path
        res = await API.post("/analyze", { text: resumeText }, { headers });
      } else {
        throw new Error("Please upload a file or paste resume text before analyzing.");
      }

      // Expected shape: { skills: [], score: number, feedback: "...", keywords: [...], sections: {...} }
      setResult(res.data);
    } catch (err) {
      console.error("Analyze error:", err.response?.data ?? err.message);
      const msg = err.response?.data?.message ?? err.message ?? "Something went wrong.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const prettyScore = (n) => (typeof n === "number" ? `${n}%` : n ?? "—");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resume Analyzer</h2>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <label className="flex flex-col items-start p-4 border rounded-lg cursor-pointer hover:shadow-sm">
              <div className="flex items-center gap-3">
                <AiOutlineUpload className="text-2xl text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Upload resume (PDF or DOCX)</div>
                  <div className="text-xs text-gray-400">Or paste resume text in the box on the right</div>
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
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</div>
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
                <div className="text-sm font-medium text-gray-700">Paste your resume text</div>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setFile(null);
                  setResult(null);
                }}
                rows={10}
                placeholder="Paste resume content here (optional, if you don't want to upload a file)..."
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
              {progress > 0 && progress < 100 && <span>Uploading: {progress}%</span>}
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Result</h3>
              <div className="text-sm text-gray-500">Source: {file ? file.name : "Pasted text"}</div>
            </div>

            {/* Score */}
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Match / Quality Score</div>
                <div className="text-xl font-bold text-gray-800">{prettyScore(result.score)}</div>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
                <div
                  className="h-3 bg-green-500"
                  style={{ width: `${Math.min(100, result.score || 0)}%` }}
                />
              </div>
            </div>

            {/* Skills */}
            {result.skills?.length > 0 && (
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-2">Extracted Skills</div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-800 rounded-full border"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {result.keywords?.length > 0 && (
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-2">Suggested Keywords / ATS Words</div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k, i) => (
                    <span key={i} className="text-sm px-2 py-1 bg-yellow-50 text-yellow-800 rounded">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback / Recommendations */}
            {result.feedback && (
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-2">Feedback & Suggestions</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.feedback}</div>
              </div>
            )}

            {/* Raw JSON (toggle) */}
            <details className="p-3 border rounded text-sm bg-gray-50">
              <summary className="cursor-pointer mb-2">View raw JSON result</summary>
              <pre className="text-xs max-h-48 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

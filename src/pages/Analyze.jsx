import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Analyze() {
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/");
}, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Analyze Page</h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

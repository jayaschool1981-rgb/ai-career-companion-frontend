import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/");
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-purple-600 mb-6">Dashboard Page</h1>

            <button
                onClick={() => navigate("/analyze")}
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mb-3"
            >
                Go to Analyze
            </button>

            <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
                Logout
            </button>
        </div>
    );
}

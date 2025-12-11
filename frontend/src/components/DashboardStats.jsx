import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardStats({ apiBase }) {
  const [stats, setStats] = useState({
    total: 0,
    lastUpload: "N/A",
    storage: 0
  });

  const loadStats = async () => {
    try {
      const res = await axios.get(`${apiBase}/documents`);
      const docs = res.data.documents || [];

      const total = docs.length;

      const lastUpload = docs.length
        ? new Date(docs[0].created_at + "Z").toLocaleString()
        : "No uploads yet";

      const storage = docs.reduce((sum, d) => sum + d.filesize, 0);

      setStats({
        total,
        lastUpload,
        storage: Math.round(storage / 1024) // KB
      });
    } catch (err) {
      console.error("Stats load error:", err);
    }
  };

  useEffect(() => {
    loadStats();

    // Listen for document updates
    window.addEventListener("documents-updated", loadStats);

    return () => window.removeEventListener("documents-updated", loadStats);
  }, []);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">📄</div>
        <h3>Total Documents</h3>
        <p className="stat-number">{stats.total}</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">⏱️</div>
        <h3>Last Upload</h3>
        <p className="stat-number small">{stats.lastUpload}</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">💾</div>
        <h3>Storage Used</h3>
        <p className="stat-number">{stats.storage} KB</p>
      </div>
    </div>
  );
}

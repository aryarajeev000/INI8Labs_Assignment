import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import FileList from "./components/FileList";
import DashboardStats from "./components/DashboardStats";

export default function App() {
  const API_BASE = "http://localhost:4000";
  const [activePage, setActivePage] = useState("documents");

  return (
    <>
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Patient Portal</h2>

        <div
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </div>

        <div
          className={`nav-item ${activePage === "documents" ? "active" : ""}`}
          onClick={() => setActivePage("documents")}
        >
          Documents
        </div>

        <div
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          onClick={() => setActivePage("settings")}
        >
          Settings
        </div>
      </div>

      {/* Main content area */}
      <div className="main">
        {activePage === "dashboard" && (
          <>
            {activePage === "dashboard" && (
              <>
                <h1>Dashboard Overview</h1>

                {/* Welcome Card */}
                <div className="card">
                  <h2>Welcome Back!</h2>
                  <p>
                    Use this dashboard to manage patient documents efficiently.
                  </p>
                </div>

                {/* Stats Cards */}
                <DashboardStats apiBase={API_BASE} />
              </>
            )}
          </>
        )}

        {activePage === "documents" && (
          <>
            <h1>Document Management</h1>
            <div className="card">
              <UploadForm apiBase={API_BASE} />
            </div>

            <div className="card">
              <FileList apiBase={API_BASE} />
            </div>
          </>
        )}

        {activePage === "settings" && (
          <>
            <h1>Settings</h1>
            <div className="card">
              <h2>User Preferences</h2>
              <p>Additional settings can be configured here.</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

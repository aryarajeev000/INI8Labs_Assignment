import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FileList({ apiBase }) {
  const [docs, setDocs] = useState([]);

  const loadDocs = async () => {
    try {
      const res = await axios.get(`${apiBase}/documents`);
      setDocs(res.data.documents || []);
    } catch (err) {
      console.error(err);
      alert("Error loading documents");
    }
  };

  useEffect(() => {
    loadDocs();
    window.addEventListener("refresh-docs", loadDocs);

    return () => window.removeEventListener("refresh-docs", loadDocs);
  }, []);

  const downloadFile = (id) => {
    window.open(`${apiBase}/documents/${id}`, "_blank");
  };

  const deleteFile = async (id) => {
    if (!confirm("Delete this file?")) return;

    try {
      await axios.delete(`${apiBase}/documents/${id}`);
      loadDocs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="card">
      <h2>Uploaded Files</h2>

      {docs.length === 0 ? (
        <p>No documents uploaded.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size (KB)</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>{d.filename}</td>
                <td>{Math.round(d.filesize / 1024)}</td>
                <td>{d.created_at}</td>
                <td>
                  <button
                    className="action-btn download-btn"
                    onClick={() => downloadFile(d.id)}
                  >
                    Download
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => deleteFile(d.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

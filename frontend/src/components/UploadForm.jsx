import React, { useState } from "react";
import axios from "axios";

export default function UploadForm({ apiBase }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const handleFileChange = (e) => {
    setMsg("");
    setFile(e.target.files[0]);
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!file) return setMsg("Please select a PDF file.");
    if (!file.name.toLowerCase().endsWith(".pdf"))
      return setMsg("Only PDF files allowed.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${apiBase}/documents/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("Upload successful!");
      setFile(null);
      document.getElementById("file-input").value = "";

      window.dispatchEvent(new Event("refresh-docs"));
    } catch (err) {
      console.error(err);
      setMsg("Upload failed.");
    }
  };

  return (
    <div className="card">
      <h2>Upload PDF</h2>

      <form onSubmit={uploadFile}>
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <br />

        <button type="submit">Upload</button>
      </form>

      {msg && <p className="message">{msg}</p>}
    </div>
  );
}

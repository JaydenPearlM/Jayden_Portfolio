import React, { useMemo, useState } from "react";

export default function AddProjectForm({
  formData,
  handleChange,
  handleSubmit,
  onSave,
}) {
  const MAX_DESC = 500;
  const MAX_TEXT = 100;

  // NEW: track file inputs separately (thumbnail, assets, codeZip, etc.)
  const [formFiles, setFormFiles] = useState({});

  const githubOk = useMemo(() => {
    if (!formData.githubLink) return true;
    const re =
      /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?\/?$/i;
    return re.test((formData.githubLink || "").trim());
  }, [formData.githubLink]);

  const linkedinOk = useMemo(() => {
    if (!formData.linkedinLink) return true;
    const re = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+\/?$/i;
    return re.test((formData.linkedinLink || "").trim());
  }, [formData.linkedinLink]);

  const demoOk = useMemo(() => {
    if (!formData.demoLink) return true;
    const re = /^https?:\/\/.+$/i;
    return re.test((formData.demoLink || "").trim());
  }, [formData.demoLink]);

  const descCount = (formData.description || "").length;
  const titleCount = (formData.title || "").length;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!githubOk) {
      alert(
        "GitHub must be a profile or repo URL (e.g. https://github.com/you or https://github.com/you/repo)"
      );
      return;
    }
    if (!linkedinOk) {
      alert("LinkedIn must look like https://www.linkedin.com/in/yourProfile");
      return;
    }
    if (!demoOk) {
      alert("Demo link must start with http:// or https://");
      return;
    }

    // Build FormData including files
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v || ""));
    if (formFiles.thumbnail) fd.append("thumbnail", formFiles.thumbnail);
    if (formFiles.assets) fd.append("assets", formFiles.assets);
    if (formFiles.codeZip) fd.append("codeZip", formFiles.codeZip); // 👈 NEW

    await handleSubmit(fd);
    await handleSubmit();
    if (onSave) onSave();
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white/90 border-2 border-blue-400/60 shadow p-4 rounded-lg max-w-3xl w-full mx-auto mb-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4 text-center">
          Project Upload
        </h1>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label htmlFor="title" className="font-medium mb-1 block">
              Title{" "}
              <span className="text-xs text-gray-500">
                ({titleCount}/{MAX_TEXT})
              </span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={MAX_TEXT}
              required
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="font-medium mb-1 block">
              Description{" "}
              <span className="text-xs text-gray-500">
                ({descCount}/{MAX_DESC})
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={MAX_DESC}
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="font-medium mb-1 block">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              maxLength={MAX_TEXT}
              value={formData.skills || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="font-medium mb-1 block">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              maxLength={MAX_TEXT}
              value={formData.tags || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Demo URL (optional) */}
          <div>
            <label htmlFor="demoLink" className="font-medium mb-1 block">
              Demo URL (optional)
            </label>
            <input
              id="demoLink"
              name="demoLink"
              type="url"
              placeholder="https://your-demo-site.com"
              maxLength={MAX_TEXT}
              value={formData.demoLink || ""}
              onChange={handleChange}
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                demoOk
                  ? "focus:ring-blue-500"
                  : "focus:ring-red-500 border-red-400"
              }`}
            />
          </div>

          {/* GitHub (optional) */}
          <div>
            <label htmlFor="githubLink" className="font-medium mb-1 block">
              GitHub (optional)
            </label>
            <input
              id="githubLink"
              name="githubLink"
              type="url"
              placeholder="https://github.com/you  or  https://github.com/you/repo"
              value={formData.githubLink || ""}
              onChange={handleChange}
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
               githubOk ? "focus:ring-blue-500" : "focus:ring-red-500 border-red-400"
              }`}
            />
          </div>

          {/* LinkedIn (optional) */}
          <div>
            <label htmlFor="linkedinLink" className="font-medium mb-1 block">
              LinkedIn (optional)
            </label>
            <input
              id="linkedinLink"
              name="linkedinLink"
              type="url"
              placeholder="https://www.linkedin.com/in/yourProfile"
              value={formData.linkedinLink || ""}
              onChange={handleChange}
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                linkedinOk
                  ? "focus:ring-blue-500"
                  : "focus:ring-red-500 border-red-400"
              }`}
            />
          </div>

          {/* Thumbnail (single image) */}
          <div>
            <label htmlFor="thumbnail" className="font-medium mb-1 block">
              Thumbnail (image)
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormFiles((f) => ({ ...f, thumbnail: e.target.files?.[0] }))
              }
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Project Files (website) */}
          <div>
            <label htmlFor="assets" className="font-medium mb-1 block">
              Project Files (HTML/CSS/JS/JSX/ZIP)
            </label>
            <input
              id="assets"
              name="assets"
              type="file"
              multiple
              accept=".html,.css,.js,.jsx,.zip"
              onChange={(e) =>
                setFormFiles((f) => ({ ...f, assets: e.target.files?.[0] }))
              }
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Tip: Upload a single <strong>.zip</strong> containing an{" "}
              <code>index.html</code> at the root for a clean demo link
              (recommended).
            </p>
          </div>

          {/* NEW: Code ZIP */}
          <div>
            <label
              htmlFor="codeZip"
              className="block text-sm font-medium mt-4"
            >
              Code (ZIP of source)
            </label>
            <input
              id="codeZip"
              type="file"
              name="codeZip"
              accept=".zip"
              onChange={(e) =>
                setFormFiles((f) => ({ ...f, codeZip: e.target.files?.[0] }))
              }
              className="block w-full border rounded-md px-3 py-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              Tip: Upload a single <strong>.zip</strong> containing an <code>index.html</code> at the
              root for a clean demo link (recommended).
            </p>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Project
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CodePreview() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [rootUrl, setRootUrl] = useState('');
  const [active, setActive] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/projects/${id}/code/files`);
      const j = await r.json();
      setFiles(j.files || []);
      setRootUrl(j.rootUrl || '');
      setActive(j.files?.[0] || '');
    })();
  }, [id]);

  async function fetchRaw(path) {
    const r = await fetch(`/api/projects/${id}/code/raw?path=${encodeURIComponent(path)}`);
    return await r.text();
  }

  const [content, setContent] = useState('');
  useEffect(() => {
    if (!active) return;
    fetchRaw(active).then(setContent);
  }, [active]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Source Code</h1>
      <div className="grid md:grid-cols-[280px,1fr] gap-4">
        <aside className="rounded-lg border p-2 h-[70vh] overflow-auto">
          <ul className="text-sm">
            {files.map((f) => (
              <li key={f}>
                <button
                  onClick={() => setActive(f)}
                  className={`w-full text-left px-2 py-1 rounded ${active===f ? 'bg-indigo-100' : 'hover:bg-slate-100'}`}
                >
                  {f}
                </button>
              </li>
            ))}
          </ul>
          {rootUrl && (
            <a
              className="mt-3 inline-block text-xs underline text-indigo-700"
              href={rootUrl}
              target="_blank" rel="noreferrer"
            >
              Open extracted folder
            </a>
          )}
        </aside>

        <main className="rounded-lg border p-3 h-[70vh] overflow-auto bg-white">
          <pre className="text-xs leading-5 whitespace-pre-wrap break-words">
            <code>{content}</code>
          </pre>
        </main>
      </div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const v = process.env.REACT_APP_VERSION || "0.1.0-Alpha";

  return (
    <footer className="w-full bg-gradient-to-r from-green-200 via-teal-200 to-blue-200 text-center py-3 mt-100 text-xs text-blue-700 fixed bottom-0 left-0">
      <p className="tracking-wide">
        © {year} Jayden Maxwell · All Rights Reserved ·{" "}
        <a href="/privacy" className="underline hover:text-gray-100">Privacy</a> ·{" "}
        <a href="/terms" className="underline hover:text-gray-100">Terms</a> · v{v}
      </p>
    </footer>
  );
}

export default function OfflineFallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold">Offline mode</h1>
        <p className="mt-4 text-slate-400">The app is currently offline. You can still use the installed POS and access local data once the PWA is installed.</p>
        <p className="mt-4 text-slate-300">If you are seeing this page after installation, ensure the browser has storage access and try refreshing.</p>
      </div>
    </div>
  );
}

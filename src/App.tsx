import { ExportControls } from "./components/ExportControls";
import { SettingsPanel } from "./components/SettingsPanel";
import { CanvasPreview } from "./components/CanvasPreview";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <ExportControls />
      <div className="workspace">
        <aside className="sidebar">
          <SettingsPanel />
        </aside>
        <main className="canvas-area">
          <CanvasPreview />
        </main>
      </div>
    </div>
  );
}

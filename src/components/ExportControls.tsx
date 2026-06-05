import { useState } from "react";
import { useCircleStore } from "../store/useCircleStore";
import { exportPng } from "../export/png";
import { exportSvg } from "../export/svg";
import { encodeGif } from "../export/gif";
import { downloadBlob } from "../export/download";
import { GifModal } from "./GifModal";

export function ExportControls() {
  const randomize = useCircleStore((s) => s.randomize);
  const newSeed = useCircleStore((s) => s.newSeed);

  const [gifOpen, setGifOpen] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const handlePng = () => {
    const { configs, params } = useCircleStore.getState();
    void exportPng(configs, params);
  };

  const handleSvg = () => {
    const { configs, params } = useCircleStore.getState();
    exportSvg(configs, params);
  };

  const handleGif = async () => {
    const { configs, params, gif } = useCircleStore.getState();
    setGifOpen(true);
    setRendering(true);
    setProgress(0);
    setPreviewUrl(null);
    setBlob(null);
    try {
      const result = await encodeGif(configs, params, gif, setProgress);
      setBlob(result);
      setPreviewUrl(URL.createObjectURL(result));
    } finally {
      setRendering(false);
    }
  };

  const saveGif = () => {
    if (blob) downloadBlob(blob, "magic-circle.gif");
  };

  const closeGif = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBlob(null);
    setGifOpen(false);
  };

  return (
    <div className="topbar">
      <div className="brand">Magic Circle Maker</div>
      <div className="actions">
        <button type="button" onClick={randomize}>
          Randomize
        </button>
        <button type="button" onClick={newSeed}>
          New Seed
        </button>
        <span className="divider" />
        <button type="button" onClick={handlePng}>
          PNG
        </button>
        <button type="button" onClick={handleSvg}>
          SVG
        </button>
        <button type="button" className="primary" onClick={handleGif}>
          Render GIF
        </button>
      </div>
      {gifOpen && (
        <GifModal
          progress={progress}
          previewUrl={previewUrl}
          rendering={rendering}
          onSave={saveGif}
          onClose={closeGif}
        />
      )}
    </div>
  );
}

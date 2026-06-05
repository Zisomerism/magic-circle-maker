interface Props {
  progress: number;
  previewUrl: string | null;
  rendering: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function GifModal({ progress, previewUrl, rendering, onSave, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={rendering ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {rendering ? (
          <>
            <h2>Rendering GIF...</h2>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p>{Math.round(progress * 100)}%</p>
          </>
        ) : (
          <>
            <h2>GIF Preview</h2>
            {previewUrl && <img className="gif-preview" src={previewUrl} alt="GIF preview" />}
            <div className="modal-actions">
              <button type="button" onClick={onSave}>
                Save GIF
              </button>
              <button type="button" className="secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

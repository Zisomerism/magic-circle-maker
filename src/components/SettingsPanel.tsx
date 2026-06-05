import { useCircleStore } from "../store/useCircleStore";
import { SYMBOL_LIBRARIES, WEB_SAFE_FONTS } from "../data/symbolLibraries";
import { CollapsibleSection } from "./CollapsibleSection";
import { ColorInput, Select, Slider, TextInput, Toggle } from "./controls";

export function SettingsPanel() {
  const params = useCircleStore((s) => s.params);
  const gif = useCircleStore((s) => s.gif);
  const symbolLibraryId = useCircleStore((s) => s.symbolLibraryId);
  const setParam = useCircleStore((s) => s.setParam);
  const setGif = useCircleStore((s) => s.setGif);
  const setSymbolLibrary = useCircleStore((s) => s.setSymbolLibrary);

  return (
    <div className="settings">
      <CollapsibleSection title="Core" defaultOpen>
        <TextInput
          label="Seed"
          hint="Deterministic seed string"
          value={params.seed}
          onChange={(v) => setParam("seed", v)}
        />
        <Slider
          label="Symmetry"
          hint="Equidistant points on each ring"
          min={0}
          max={12}
          value={params.symNum}
          onChange={(v) => setParam("symNum", v)}
        />
        <Slider
          label="Complexity"
          hint="Higher enables more procedural features"
          min={0}
          max={1}
          step={0.01}
          value={params.complexity}
          onChange={(v) => setParam("complexity", v)}
          format={(v) => v.toFixed(2)}
        />
        <ColorInput
          label="Color"
          value={params.color}
          onChange={(v) => setParam("color", v)}
        />
        <Slider
          label="Line Thickness"
          min={1}
          max={40}
          value={params.lineWidth}
          onChange={(v) => setParam("lineWidth", v)}
        />
        <Slider
          label="Border Thickness"
          min={1}
          max={40}
          value={params.borderWidth}
          onChange={(v) => setParam("borderWidth", v)}
        />
        <Slider
          label="Border Spacing"
          hint="Gap that holds the outer text ring"
          min={0}
          max={150}
          value={params.borderSpace}
          onChange={(v) => setParam("borderSpace", v)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Sub Circles">
        <Slider
          label="Depth"
          hint="Levels of nested sub-circles"
          min={1}
          max={4}
          value={params.tiers}
          onChange={(v) => setParam("tiers", v)}
        />
        <Slider
          label="Spawn Chance"
          min={0}
          max={1}
          step={0.01}
          value={params.scsc}
          onChange={(v) => setParam("scsc", v)}
          format={(v) => v.toFixed(2)}
        />
        <Slider
          label="Scale"
          min={0.2}
          max={2}
          step={0.01}
          value={params.tierScale}
          onChange={(v) => setParam("tierScale", v)}
          format={(v) => v.toFixed(2)}
        />
        <Slider
          label="Symmetry Change"
          hint="Symmetry shift per tier"
          min={-6}
          max={6}
          value={params.tierSymmetryDelta}
          onChange={(v) => setParam("tierSymmetryDelta", v)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Text & Symbols">
        <Select
          label="Symbol Library"
          value={symbolLibraryId}
          options={SYMBOL_LIBRARIES.map((l) => ({ value: l.id, label: l.name }))}
          onChange={setSymbolLibrary}
        />
        <TextInput
          label="Symbols"
          hint="Space-delimited glyphs used in generation"
          value={params.symbols}
          onChange={(v) => setParam("symbols", v)}
          textarea
        />
        <TextInput
          label="Text Ring Vocabulary"
          hint="Space-delimited words for text rings"
          value={params.words}
          onChange={(v) => setParam("words", v)}
          textarea
        />
        <Slider
          label="Text Density"
          hint="Character size in text rings"
          min={0.02}
          max={0.2}
          step={0.005}
          value={params.textDensity}
          onChange={(v) => setParam("textDensity", v)}
          format={(v) => v.toFixed(3)}
        />
        <Select
          label="Font"
          value={params.font}
          options={WEB_SAFE_FONTS.map((f) => ({ value: f, label: f }))}
          onChange={(v) => setParam("font", v)}
        />
        <Toggle
          label="Text Reads Inward"
          value={params.faceTextInward}
          onChange={(v) => setParam("faceTextInward", v)}
        />
        <Toggle
          label="Symbols Face Center"
          value={params.symbolsFaceCenter}
          onChange={(v) => setParam("symbolsFaceCenter", v)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Image">
        <Slider
          label="Resolution"
          hint="Canvas width/height in pixels"
          min={256}
          max={2048}
          step={64}
          value={params.size}
          onChange={(v) => setParam("size", v)}
        />
        <Slider
          label="Margin"
          min={0}
          max={256}
          value={params.margin}
          onChange={(v) => setParam("margin", v)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Post Processing">
        <Toggle
          label="Draw Background"
          value={params.drawBackground}
          onChange={(v) => setParam("drawBackground", v)}
        />
        <ColorInput
          label="Background Color"
          value={params.backgroundColor}
          onChange={(v) => setParam("backgroundColor", v)}
        />
        <Toggle
          label="Draw Shadows"
          value={params.drawShadows}
          onChange={(v) => setParam("drawShadows", v)}
        />
        <ColorInput
          label="Shadow Color"
          value={params.shadowColor}
          onChange={(v) => setParam("shadowColor", v)}
        />
        <Slider
          label="Shadow Blur"
          min={0}
          max={60}
          value={params.shadowBlur}
          onChange={(v) => setParam("shadowBlur", v)}
        />
        <Slider
          label="Shadow Offset X"
          min={-60}
          max={60}
          value={params.shadowOffsetX}
          onChange={(v) => setParam("shadowOffsetX", v)}
        />
        <Slider
          label="Shadow Offset Y"
          min={-60}
          max={60}
          value={params.shadowOffsetY}
          onChange={(v) => setParam("shadowOffsetY", v)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Animation (GIF)">
        <Slider
          label="Duration"
          hint="Seconds per rotation cycle"
          min={1}
          max={20}
          value={gif.duration}
          onChange={(v) => setGif("duration", v)}
          format={(v) => `${v}s`}
        />
        <Slider
          label="Frames / Second"
          min={5}
          max={30}
          value={gif.fps}
          onChange={(v) => setGif("fps", v)}
        />
      </CollapsibleSection>
    </div>
  );
}

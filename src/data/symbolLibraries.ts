export interface SymbolLibrary {
  id: string;
  name: string;
  /** Space-delimited glyphs. */
  symbols: string;
}

const range = (startHex: number, endHex: number): string => {
  const chars: string[] = [];
  for (let cp = startHex; cp <= endHex; cp++) {
    chars.push(String.fromCodePoint(cp));
  }
  return chars.join(" ");
};

export const SYMBOL_LIBRARIES: SymbolLibrary[] = [
  {
    id: "alchemy",
    name: "Alchemy",
    // Unicode "Alchemical Symbols" block.
    symbols: range(0x1f700, 0x1f773),
  },
  {
    id: "astrology",
    name: "Astrology",
    symbols:
      "\u2600 \u263d \u263e \u2641 \u2640 \u2642 \u2643 \u2644 \u2645 \u2646 \u2647 \u2648 \u2649 \u264a \u264b \u264c \u264d \u264e \u264f \u2650 \u2651 \u2652 \u2653 \u26b3 \u26b4 \u26b5 \u26b6 \u26b7 \u26b8",
  },
  {
    id: "hebrew",
    name: "Hebrew",
    symbols: range(0x05d0, 0x05ea),
  },
  {
    id: "runic",
    name: "Runic",
    symbols: range(0x16a0, 0x16f0),
  },
  {
    id: "greek",
    name: "Greek",
    symbols: range(0x0391, 0x03a9) + " " + range(0x03b1, 0x03c9),
  },
  {
    id: "misc",
    name: "Misc",
    symbols:
      "\u2721 \u2727 \u272a \u2730 \u2734 \u2735 \u2736 \u2737 \u2738 \u2739 \u273a \u273b \u273d \u273e \u273f \u2740 \u2741 \u2742 \u2743 \u269a \u26a4 \u26a5 \u269b \u2698 \u2625 \u2628 \u269c",
  },
];

export const DEFAULT_WORDS =
  "Alchemia est ars antiqua et mystica studium per saecula traditionum " +
  "philosophicarum arcana in occulto creata scientia spiritualia vera " +
  "post examinis obscurant finis idem quod semper creatio elixir " +
  "immortalitatis principalissimum opus postrema spes spiraculum mundi " +
  "quaere potestatem lucrari per septem gradus emundare materias perfectas";

export const WEB_SAFE_FONTS = [
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Palatino Linotype",
  "Arial",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
];

export function getLibrary(id: string): SymbolLibrary {
  return SYMBOL_LIBRARIES.find((lib) => lib.id === id) ?? SYMBOL_LIBRARIES[0];
}

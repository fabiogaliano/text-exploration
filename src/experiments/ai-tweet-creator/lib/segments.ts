export function computeSegments(
  text: string,
  locks: string[],
): Array<{ text: string; locked: boolean }> {
  if (!text) return [];
  const uniqueLocks = Array.from(new Set(locks)).filter(Boolean);
  const matches: Array<{ start: number; end: number; text: string }> = [];
  for (const l of uniqueLocks) {
    let idx = 0;
    const step = Math.max(l.length, 1);
    while (true) {
      const found = text.indexOf(l, idx);
      if (found === -1) break;
      matches.push({ start: found, end: found + l.length, text: l });
      idx = found + step;
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const accepted: typeof matches = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      accepted.push(m);
      lastEnd = m.end;
    }
  }
  const segments: Array<{ text: string; locked: boolean }> = [];
  let pos = 0;
  for (const m of accepted) {
    if (m.start > pos) {
      segments.push({ text: text.slice(pos, m.start), locked: false });
    }
    segments.push({ text: text.slice(m.start, m.end), locked: true });
    pos = m.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), locked: false });
  return segments;
}

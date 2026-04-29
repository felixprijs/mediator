// ─────────────────────────────────────────────────────────────────────────────
// INTERVENTIONS — the four AI mediator interventions used across both scripts.
//
// Each entry needs:
//   id    - unique string, used internally
//   title - short label shown on the operator panel button
//   text  - full sentence(s) displayed on the participant screen during playback
//   audio - path to the audio file (relative to participant.html)
//           If the file is missing the system falls back to browser TTS.
// ─────────────────────────────────────────────────────────────────────────────

const INTERVENTIONS = [
  // ── Script 1 — Sustainable e-bike delivery service ───────────────────────
  {
    id:    's1_i1',
    title: 'S1 · #1  Gender role assumption',
    text:  "Pause. Nadia\u2019s gender was just used to decide her role, even after she asked for technical work. Maybe you should ask what each person actually wants to contribute, instead of relying on assumptions.",
    audio: 'script 1 int 1.mp3',
  },
  {
    id:    's1_i2',
    title: 'S1 · #2  Personal targeting',
    text:  "I want to step in. That comment targeted Nadia personally and framed her talking as not working. If that causes friction, you should discuss it. But maybe not while the group is focused on task division.",
    audio: 'script 1 int 2.mp3',
  },

  // ── Script 2 — Making campus more inclusive ──────────────────────────────
  {
    id:    's2_i1',
    title: 'S2 · #1  Stereotype as joke',
    text:  "Quick pause. That joke connected Mei\u2019s background to a stereotype instead of her idea. That could make her feel singled out or reduced to where she is from. Let\u2019s try to avoid doing that again, and return to her point about everyday campus moments.",
    audio: 'script 2 int 1.mp3',
  },
  {
    id:    's2_i2',
    title: 'S2 · #2  Language background',
    text:  "I want to pause. That comment targeted Mei\u2019s language background and called one form of English more real than another. Maybe you should discuss clear communication without targeting Mei personally.",
    audio: 'script 2 int 2.mp3',
  },
];

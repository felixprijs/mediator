// ─────────────────────────────────────────────────────────────────────────────
// INTERVENTIONS — the six AI mediator interventions used across both scripts.
//
// Each entry needs:
//   id    - unique string, used internally
//   title - short label shown on the operator panel button
//   text  - full sentence(s) displayed on the participant screen during playback
//   audio - path to the audio file (relative to participant.html)
//           If the file is missing the system falls back to browser TTS.
// ─────────────────────────────────────────────────────────────────────────────

const INTERVENTIONS = [
  // ── Script 1 — Bike trailer task division ────────────────────────────────
  {
    id:    's1_i1',
    title: 'S1 · #1  Microinsult',
    text:  "A technical task was just requested based on relevant experience, but redirected elsewhere. That can come across as doubting someone's competence.",
    audio: 's1_intervention_1.mp3',
  },
  {
    id:    's1_i2',
    title: 'S1 · #2  Microinvalidation',
    text:  "Responding with \u2018it\u2019s not about gender or where you\u2019re from\u2019 can feel dismissive when someone is naming how a decision landed for them.",
    audio: 's1_intervention_2.mp3',
  },
  {
    id:    's1_i3',
    title: 'S1 · #3  Undermining',
    text:  "Suggesting someone may slow the team down, right after they shared relevant experience, can undermine their standing in the group.",
    audio: 's1_intervention_3.mp3',
  },

  // ── Script 2 — Emergency housing brainstorm ──────────────────────────────
  {
    id:    's2_i1',
    title: 'S2 · #1  Microinsult',
    text:  "An idea seems to have been received differently when restated by someone else, and the original was narrowed to \u2018the international student angle.\u2019 That can feel dismissive.",
    audio: 's2_intervention_1.mp3',
  },
  {
    id:    's2_i2',
    title: 'S2 · #2  Microinvalidation',
    text:  "Suggesting someone notices an issue \u2018just because\u2019 of their background can invalidate their perspective rather than engage with the design point.",
    audio: 's2_intervention_2.mp3',
  },
  {
    id:    's2_i3',
    title: 'S2 · #3  Undermining',
    text:  "Framing a concept as support for people who \u2018haven\u2019t figured out how things work here\u2019 can carry a demeaning message about who belongs.",
    audio: 's2_intervention_3.mp3',
  },
];

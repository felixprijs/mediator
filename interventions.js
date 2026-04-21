// ─────────────────────────────────────────────────────────────────────────────
//  INTERVENTIONS — edit this file to add, remove, or change interventions.
//
//  Each entry needs:
//    id     – unique string, used internally
//    title  – short label shown on the operator panel button
//    text   – full sentence(s) displayed on the participant screen
//    audio  – path to the audio file (relative to this folder)
//             If the file is missing the system falls back to browser TTS.
// ─────────────────────────────────────────────────────────────────────────────

const INTERVENTIONS = [
  {
    id:    'eq_participation',
    title: 'Equal Participation',
    text:  'I notice not everyone has had a chance to share their perspective yet. It might be helpful to hear from those who haven\'t spoken.',
    audio: 'audio/eq_participation.mp3',
  },
  {
    id:    'summarize',
    title: 'Summarise Progress',
    text:  'You\'ve been discussing for a while now. It might help to pause and summarise what you\'ve agreed on so far before moving forward.',
    audio: 'audio/summarize.mp3',
  },
  {
    id:    'tension',
    title: 'Address Tension',
    text:  'I\'m noticing some tension in the conversation. It might help to focus on what you both agree on before addressing the differences.',
    audio: 'audio/tension.mp3',
  },
  {
    id:    'time_check',
    title: 'Time Check',
    text:  'You have about ten minutes remaining. You may want to start moving toward a decision.',
    audio: 'audio/time_check.mp3',
  },
  {
    id:    'elaborate',
    title: 'Encourage Elaboration',
    text:  'That\'s an interesting point. Could someone elaborate on that idea a bit more?',
    audio: 'audio/elaborate.mp3',
  },
  {
    id:    'decision',
    title: 'Prompt for Decision',
    text:  'You\'ve raised several ideas. It might be a good moment to consider which direction the group wants to commit to.',
    audio: 'audio/decision.mp3',
  },
];

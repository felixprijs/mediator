// ─────────────────────────────────────────────────────────────────────────────
// CHAT_REPLIES — pre-scripted acknowledgements the operator can send back to
// a participant who has texted the mediator privately.
//
// Design guidance (keep in mind if you edit these):
//   • The AI must NOT validate the participant's experience directly.
//     Validation in this research = verbal recognition by the group.
//     The AI's role is only to receive the flag and indicate something may
//     happen at the group level.
//   • Keep replies short, functional, neutral. They are acknowledgements,
//     not reassurance.
//   • Each entry needs id, title, text.
// ─────────────────────────────────────────────────────────────────────────────

const CHAT_REPLIES = [
  {
    id: 'received',
    title: 'Received',
    text: "Thanks — I've received your message and I'm tracking the conversation.",
  },
  {
    id: 'noted',
    title: 'Noted',
    text: "Noted. I'll keep this in mind as the discussion continues.",
  },
  {
    id: 'will_surface',
    title: 'Will surface',
    text: "Understood. I'll look for an appropriate moment to raise this with the group.",
  },
  {
    id: 'more_info',
    title: 'Ask for more',
    text: "Got it. If you'd like to add any detail about what felt off, feel free to send it.",
  },
  {
    id: 'acknowledged',
    title: 'Acknowledged',
    text: "Acknowledged.",
  },
];

// Make available to both browser (operator.html) and Node if ever needed.
if (typeof module !== 'undefined') module.exports = { CHAT_REPLIES };

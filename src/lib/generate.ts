/**
 * Local, frontend-only generation engine.
 * Composes structured drafts from the user's own input — no backend, no network.
 */

export type Tone = "formal" | "friendly" | "persuasive";

export type EmailInput = {
  purpose: string;
  recipient: string;
  keyPoints: string;
  tone: Tone;
  senderName: string;
};

const pick = <T,>(arr: T[], seed: number): T => arr[Math.abs(seed) % arr.length] as T;

function seedOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function lines(text: string) {
  return text
    .split(/\r?\n|;|•/)
    .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);
}

function sentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function generateEmail(input: EmailInput, variant = 0): string {
  const { purpose, recipient, keyPoints, tone, senderName } = input;
  const seed = seedOf(purpose + recipient + keyPoints + tone) + variant;
  const points = lines(keyPoints);
  const who = recipient.trim() || "there";
  const topic = purpose.trim() || "our recent discussion";

  const subject =
    tone === "persuasive"
      ? `${capitalize(topic)} — a proposal worth your time`
      : tone === "friendly"
        ? `Quick note about ${topic}`
        : `Regarding ${topic}`;

  const greeting =
    tone === "formal"
      ? `Dear ${who},`
      : tone === "friendly"
        ? `Hi ${who},`
        : `Hello ${who},`;

  const openers = {
    formal: [
      `I am writing with regard to ${topic}.`,
      `I hope this message finds you well. I am reaching out concerning ${topic}.`,
    ],
    friendly: [
      `Hope your week is going well! I wanted to touch base about ${topic}.`,
      `Just a quick note about ${topic} — wanted to keep you in the loop.`,
    ],
    persuasive: [
      `I would like to share an opportunity relating to ${topic} that I believe is worth your consideration.`,
      `There is a clear case for moving forward on ${topic}, and I would value a few minutes of your time to explain it.`,
    ],
  } as const;

  const closers = {
    formal: [
      "Please let me know if you require any further detail. I would be glad to assist.",
      "I would welcome your guidance on the appropriate next steps.",
    ],
    friendly: [
      "Let me know what you think — happy to jump on a quick call if that's easier.",
      "Shout if anything is unclear and I'll gladly walk you through it.",
    ],
    persuasive: [
      "If this direction makes sense to you, I can prepare the next steps immediately.",
      "I would appreciate the chance to discuss this further and answer any questions.",
    ],
  } as const;

  const signOff =
    tone === "formal" ? "Kind regards," : tone === "friendly" ? "Best," : "Thank you for your time,";

  const body = points.length
    ? points.map((p) => `• ${capitalize(p.replace(/\.$/, ""))}.`).join("\n")
    : "• Add key points in the form to see them structured here.";

  const bodyIntro =
    tone === "persuasive"
      ? "Here is why this matters:"
      : tone === "friendly"
        ? "Here's a quick summary:"
        : "The key points are set out below:";

  return [
    `Subject: ${subject}`,
    "",
    greeting,
    "",
    pick([...openers[tone]], seed),
    "",
    bodyIntro,
    body,
    "",
    pick([...closers[tone]], seed + 7),
    "",
    signOff,
    senderName.trim() || "[Your name]",
  ].join("\n");
}

export type ResearchOutput = {
  summary: string;
  findings: string[];
  insights: string[];
  recommendations: string[];
};

export function generateResearch(topic: string, variant = 0): ResearchOutput {
  const text = topic.trim();
  const seed = seedOf(text) + variant;
  const subject = text.split(/\r?\n/)[0]?.slice(0, 90) || "the topic";
  const src = sentences(text);
  const isArticle = text.length > 400;

  const summary = isArticle
    ? `This is a structured working summary of the material you provided on “${subject}”. ${src
        .slice(0, 3)
        .join(" ")} The remaining sections break the content into findings, insights and practical next steps you can adapt for internal use.`
    : `“${capitalize(subject)}” is framed here as a workplace research brief. The sections below organise what to establish, what it likely means for your team, and how to act on it. Because this brief is generated locally from your prompt, treat every date, figure and named source as unverified until checked against a current authoritative source.`;

  const findings = (
    isArticle
      ? src.slice(0, 5).map((s) => s.replace(/\s+/g, " "))
      : [
          `Define the scope of ${subject} precisely — the term is often used for several different things across teams.`,
          `Identify who owns ${subject} in your organisation and which processes it currently touches.`,
          `Gather the most recent published data on ${subject}; figures in this area change frequently.`,
          `Note the constraints — budget, compliance, tooling — that will shape any decision on ${subject}.`,
        ]
  ).map((s) => capitalize(s));

  const insights = [
    pick(
      [
        `The main risk with ${subject} is acting on outdated assumptions rather than current evidence.`,
        `Most of the value in ${subject} comes from consistent execution, not from the initial decision.`,
      ],
      seed,
    ),
    pick(
      [
        `Stakeholder alignment usually matters more than tooling when rolling out changes related to ${subject}.`,
        `Small, measurable pilots tend to outperform large all-at-once changes in this area.`,
      ],
      seed + 3,
    ),
    `Anything time-sensitive about ${subject} — pricing, regulation, vendor capability — should be re-checked before it is quoted in a decision.`,
  ];

  const recommendations = [
    `Verify the findings above against at least two current, authoritative sources before circulating.`,
    pick(
      [
        `Draft a one-page brief on ${subject} and circulate it to stakeholders for correction.`,
        `Run a short, time-boxed pilot before committing budget to ${subject}.`,
      ],
      seed + 5,
    ),
    `Agree a review date so the position on ${subject} does not silently go stale.`,
  ];

  return { summary, findings, insights, recommendations };
}

export function researchToText(r: ResearchOutput) {
  return [
    "SUMMARY",
    r.summary,
    "",
    "KEY FINDINGS",
    ...r.findings.map((f) => `• ${f}`),
    "",
    "INSIGHTS",
    ...r.insights.map((f) => `• ${f}`),
    "",
    "RECOMMENDATIONS",
    ...r.recommendations.map((f) => `• ${f}`),
  ].join("\n");
}

export const suggestedPrompts = [
  "Help me prepare an agenda for a weekly team stand-up",
  "How do I give constructive feedback to a colleague?",
  "Summarise this project status into three bullet points",
  "Draft a polite way to decline a meeting invitation",
  "What should I include in a handover document?",
  "Suggest a plan for my first 30 days in a new role",
];

export function generateAssistantReply(prompt: string, variant = 0): string {
  const q = prompt.trim();
  const seed = seedOf(q) + variant;
  const topic = q.replace(/^(how do i|how to|help me|can you|please)\s+/i, "").replace(/\?$/, "");

  const openings = [
    `Here's a practical way to approach ${topic}:`,
    `Good question. For ${topic}, this structure usually works well:`,
    `Let's break ${topic} into something you can act on today:`,
  ];

  const steps = [
    `**Clarify the outcome.** Write one sentence describing what "done" looks like for ${topic}. Everything else follows from that.`,
    `**Identify who is involved.** List the people affected and what each of them needs to know or decide.`,
    `**Draft the shortest useful version.** A short, clear artefact that people actually read beats a thorough one they skip.`,
    `**Set a check-in.** Agree a date to review progress so the work does not drift.`,
  ];

  const closings = [
    `If you share more context — audience, deadline, or constraints — I can tighten this into something you can send as-is.`,
    `Want me to turn this into an email or a short written brief? The Email Generator tool can structure it for you.`,
    `Tell me which step you'd like to expand and I'll go deeper on that one.`,
  ];

  return [
    pick(openings, seed),
    "",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    pick(closings, seed + 11),
  ].join("\n");
}

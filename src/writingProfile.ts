type WritingFormat = 'jira-comment' | 'jira-description' | 'email-reply' | 'teams-message';

const profile = {
  tone: [
    'Short and practical',
    'Clear status first',
    'Avoid overexplaining unless needed',
    'Use bullets for technical details',
    'Do not sound like vendor documentation',
  ],
  preferredPhrases: [
    'Could you please clarify',
    'Please provide the link',
    'I created the property',
    'Access is currently limited',
    'No changes were made to the field itself',
    'We will let you know if we find more examples',
    'Please let me know if you notice any issues',
  ],
  avoidPhrases: [
    'obvious',
    'completely',
    'disregarded list',
    'monthly cycle',
    'distinguish',
    'quick session',
    'workaround temporarily',
    'in simple terms',
    'looks like',
    'likely',
  ],
};

function buildStyledDraft(format: WritingFormat, notes: string) {
  const parsed = parseNotes(notes);

  switch (format) {
    case 'jira-comment':
      return buildJiraComment(parsed);
    case 'jira-description':
      return buildJiraDescription(parsed);
    case 'email-reply':
      return buildEmailReply(parsed);
    case 'teams-message':
      return buildTeamsMessage(parsed);
    default:
      return notes;
  }
}

function buildStyleGuideSummary() {
  return `Tone:
${profile.tone.map((item) => `- ${item}`).join('\n')}

Preferred phrases:
${profile.preferredPhrases.map((item) => `- ${item}`).join('\n')}

Avoid:
${profile.avoidPhrases.map((item) => `- ${item}`).join('\n')}`;
}

function parseNotes(notes: string) {
  const lines = notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] || 'Request needs review';
  const details = lines.length > 1 ? lines.slice(1) : splitInlineDetails(notes);

  return {
    raw: notes.trim(),
    summary: sentenceCase(firstLine.replace(/^raw note:\s*/i, '')),
    details: details.length ? details : [sentenceCase(notes.trim())],
  };
}

function splitInlineDetails(notes: string) {
  return notes
    .split(/[,.;]/)
    .map((item) => sentenceCase(item.trim()))
    .filter((item) => item.length > 2)
    .slice(0, 5);
}

function buildJiraComment(parsed: ReturnType<typeof parseNotes>) {
  return `${parsed.summary}

Details:
${parsed.details.map((detail) => `- ${detail}`).join('\n')}

Current status:
The requested item has been reviewed based on the provided notes.

Next step:
Please let me know if you notice any issues or if additional context is required.`;
}

function buildJiraDescription(parsed: ReturnType<typeof parseNotes>) {
  return `Summary
${parsed.summary}

Request / Issue
${parsed.raw}

Current Behavior
The current setup needs to be reviewed or updated based on the request.

Expected Behavior
The configuration should match the requested behavior and remain clear for future support.

Scope
${parsed.details.map((detail) => `- ${detail}`).join('\n')}

Notes
No changes should be made outside the requested scope unless confirmed.`;
}

function buildEmailReply(parsed: ReturnType<typeof parseNotes>) {
  return `Hi,

${parsed.summary}.

Details:
${parsed.details.map((detail) => `- ${detail}`).join('\n')}

Please let me know if you notice any issues.

Thank you,`;
}

function buildTeamsMessage(parsed: ReturnType<typeof parseNotes>) {
  return `${parsed.summary}.

${parsed.details.map((detail) => `- ${detail}`).join('\n')}

Next step: please provide any missing link or context if further review is needed.`;
}

function sentenceCase(value: string) {
  if (!value) {
    return value;
  }
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export type { WritingFormat };
export { buildStyledDraft, buildStyleGuideSummary };

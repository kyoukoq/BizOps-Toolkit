import {
  Braces,
  CalendarClock,
  Clipboard,
  Code2,
  Columns3,
  Copy,
  FileJson,
  Fingerprint,
  Globe2,
  Hash,
  KeyRound,
  ListChecks,
  Mail,
  Play,
  RefreshCw,
  Search,
  Send,
  Table2,
  TerminalSquare,
  TextCursorInput,
  Wand2,
} from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { format as formatSql } from 'sql-formatter';

type ToolId =
  | 'json'
  | 'jwt'
  | 'base64'
  | 'guid'
  | 'diff'
  | 'timezone'
  | 'regex'
  | 'api'
  | 'csv'
  | 'sql'
  | 'jira'
  | 'email';

type ApiHeader = {
  key: string;
  value: string;
};

type DiffLine = {
  type: 'same' | 'add' | 'remove';
  text: string;
};

const sampleJson = '{"company":"Acme","contacts":[{"email":"ana@example.com","role":"Admin"}],"active":true}';
const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNzIwMDAwMH0.signature';

const tools: Array<{
  id: ToolId;
  title: string;
  section: string;
  description: string;
  icon: ReactNode;
}> = [
  { id: 'json', title: 'JSON Formatter', section: 'Data', description: 'Format, validate, minify', icon: <FileJson /> },
  { id: 'jwt', title: 'JWT Decoder', section: 'Security', description: 'Decode headers and claims', icon: <KeyRound /> },
  { id: 'base64', title: 'Base64', section: 'Security', description: 'Encode and decode text', icon: <Hash /> },
  { id: 'guid', title: 'GUID Generator', section: 'Utilities', description: 'Create UUID values', icon: <Fingerprint /> },
  { id: 'diff', title: 'Diff Tool', section: 'Utilities', description: 'Compare two text blocks', icon: <Columns3 /> },
  { id: 'timezone', title: 'Time Zones', section: 'Utilities', description: 'Convert work times', icon: <CalendarClock /> },
  { id: 'regex', title: 'Regex Tester', section: 'Data', description: 'Match patterns quickly', icon: <Search /> },
  { id: 'api', title: 'API Tester', section: 'API', description: 'Send REST requests', icon: <Send /> },
  { id: 'csv', title: 'CSV Preview', section: 'Data', description: 'Inspect CSV rows', icon: <Table2 /> },
  { id: 'sql', title: 'SQL Formatter', section: 'Data', description: 'Clean up SQL queries', icon: <TerminalSquare /> },
  { id: 'jira', title: 'Jira Assistant', section: 'Writing', description: 'Draft ticket text', icon: <ListChecks /> },
  { id: 'email', title: 'Email Assistant', section: 'Writing', description: 'Professional replies', icon: <Mail /> },
];

function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('json');
  const [query, setQuery] = useState('');
  const active = tools.find((tool) => tool.id === activeTool)!;
  const filteredTools = tools.filter((tool) =>
    `${tool.title} ${tool.description} ${tool.section}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Braces size={22} />
          </div>
          <div>
            <h1>BizOps Toolkit</h1>
            <p>Daily admin utilities</p>
          </div>
        </div>

        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" />
        </label>

        <nav className="tool-list" aria-label="Tools">
          {filteredTools.map((tool) => (
            <button
              className={tool.id === activeTool ? 'tool-link active' : 'tool-link'}
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.description}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span>
                <strong>{tool.title}</strong>
                <small>{tool.description}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p>{active.section}</p>
            <h2>{active.title}</h2>
          </div>
          <div className="status-pill">
            <Globe2 size={16} />
            Local first
          </div>
        </header>
        <ToolPanel activeTool={activeTool} />
      </main>
    </div>
  );
}

function ToolPanel({ activeTool }: { activeTool: ToolId }) {
  switch (activeTool) {
    case 'json':
      return <JsonTool />;
    case 'jwt':
      return <JwtTool />;
    case 'base64':
      return <Base64Tool />;
    case 'guid':
      return <GuidTool />;
    case 'diff':
      return <DiffTool />;
    case 'timezone':
      return <TimeZoneTool />;
    case 'regex':
      return <RegexTool />;
    case 'api':
      return <ApiTool />;
    case 'csv':
      return <CsvTool />;
    case 'sql':
      return <SqlTool />;
    case 'jira':
      return <WritingTool kind="jira" />;
    case 'email':
      return <WritingTool kind="email" />;
    default:
      return null;
  }
}

function JsonTool() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Paste JSON and format it.');

  const run = (mode: 'format' | 'minify') => {
    try {
      const parsed = JSON.parse(input);
      setOutput(mode === 'format' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
      setStatus('Valid JSON');
    } catch (error) {
      setOutput('');
      setStatus(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  return (
    <TwoPane
      left={<TextArea label="Input" value={input} onChange={setInput} />}
      right={<Output label="Output" value={output || status} />}
      actions={
        <>
          <ActionButton icon={<Wand2 />} label="Format" onClick={() => run('format')} />
          <ActionButton icon={<Code2 />} label="Minify" onClick={() => run('minify')} />
          <CopyButton value={output} />
        </>
      }
    />
  );
}

function JwtTool() {
  const [token, setToken] = useState(sampleJwt);
  const decoded = useMemo(() => decodeJwt(token), [token]);

  return (
    <TwoPane
      left={<TextArea label="JWT" value={token} onChange={setToken} />}
      right={<Output label="Decoded" value={decoded} />}
      actions={<CopyButton value={decoded} />}
    />
  );
}

function Base64Tool() {
  const [input, setInput] = useState('hello bizops');
  const [output, setOutput] = useState('');

  const encode = () => setOutput(btoa(unescape(encodeURIComponent(input))));
  const decode = () => {
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setOutput('Invalid Base64 input');
    }
  };

  return (
    <TwoPane
      left={<TextArea label="Text" value={input} onChange={setInput} />}
      right={<Output label="Result" value={output} />}
      actions={
        <>
          <ActionButton icon={<Wand2 />} label="Encode" onClick={encode} />
          <ActionButton icon={<Code2 />} label="Decode" onClick={decode} />
          <CopyButton value={output} />
        </>
      }
    />
  );
}

function GuidTool() {
  const [count, setCount] = useState(5);
  const [values, setValues] = useState(() => generateGuids(5));

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field compact">
          Count
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
        <ActionButton icon={<RefreshCw />} label="Generate" onClick={() => setValues(generateGuids(count))} />
        <CopyButton value={values.join('\n')} />
      </div>
      <pre className="output large">{values.join('\n')}</pre>
    </section>
  );
}

function DiffTool() {
  const [left, setLeft] = useState('status: active\nowner: ops\nregion: EU');
  const [right, setRight] = useState('status: active\nowner: bizops\nregion: EU\npriority: high');
  const diff = useMemo(() => buildDiff(left, right), [left, right]);

  return (
    <TwoPane
      left={<TextArea label="Original" value={left} onChange={setLeft} />}
      right={<TextArea label="Changed" value={right} onChange={setRight} />}
      footer={
        <div className="diff-list">
          {diff.map((line, index) => (
            <div className={`diff-line ${line.type}`} key={`${line.text}-${index}`}>
              <span>{line.type === 'same' ? ' ' : line.type === 'add' ? '+' : '-'}</span>
              <code>{line.text || ' '}</code>
            </div>
          ))}
        </div>
      }
    />
  );
}

function TimeZoneTool() {
  const nowLocal = new Date();
  const [date, setDate] = useState(nowLocal.toISOString().slice(0, 16));
  const zones = ['Europe/Kyiv', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Singapore'];
  const sourceDate = new Date(date);

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Source time
          <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>
      <div className="timezone-grid">
        {zones.map((zone) => (
          <div className="metric-card" key={zone}>
            <span>{zone}</span>
            <strong>{formatDateInZone(sourceDate, zone)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState('ana@example.com\nbad-email\nops.team@company.io');
  const matches = useMemo(() => findRegexMatches(pattern, flags, text), [pattern, flags, text]);

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Pattern
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} />
        </label>
        <label className="field compact">
          Flags
          <input value={flags} onChange={(event) => setFlags(event.target.value)} />
        </label>
      </div>
      <TwoPane
        left={<TextArea label="Text" value={text} onChange={setText} />}
        right={<Output label="Matches" value={matches} />}
      />
    </section>
  );
}

function ApiTool() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState<ApiHeader[]>([{ key: 'Accept', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('Response will appear here.');
  const [loading, setLoading] = useState(false);

  const sendRequest = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const started = performance.now();
    try {
      const headerObject = Object.fromEntries(headers.filter((header) => header.key).map((header) => [header.key, header.value]));
      const res = await fetch(url, {
        method,
        headers: headerObject,
        body: method === 'GET' || method === 'HEAD' ? undefined : body,
      });
      const text = await res.text();
      const elapsed = Math.round(performance.now() - started);
      setResponse(
        `HTTP ${res.status} ${res.statusText} (${elapsed} ms)\n\n${tryPrettyJson(text)}`,
      );
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={sendRequest}>
      <div className="request-row">
        <select value={method} onChange={(event) => setMethod(event.target.value)}>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input value={url} onChange={(event) => setUrl(event.target.value)} />
        <button className="primary-button" disabled={loading}>
          <Play size={16} />
          {loading ? 'Sending' : 'Send'}
        </button>
      </div>
      <div className="headers-grid">
        {headers.map((header, index) => (
          <div className="header-row" key={index}>
            <input
              placeholder="Header"
              value={header.key}
              onChange={(event) => updateHeader(headers, setHeaders, index, 'key', event.target.value)}
            />
            <input
              placeholder="Value"
              value={header.value}
              onChange={(event) => updateHeader(headers, setHeaders, index, 'value', event.target.value)}
            />
          </div>
        ))}
        <button type="button" className="ghost-button" onClick={() => setHeaders([...headers, { key: '', value: '' }])}>
          Add header
        </button>
      </div>
      <TwoPane
        left={<TextArea label="Body" value={body} onChange={setBody} />}
        right={<Output label="Response" value={response} />}
      />
    </form>
  );
}

function CsvTool() {
  const [csv, setCsv] = useState('email,role,active\nana@example.com,Admin,true\nmax@example.com,User,false');
  const table = useMemo(() => parseCsv(csv), [csv]);

  return (
    <section className="panel">
      <TwoPane
        left={<TextArea label="CSV" value={csv} onChange={setCsv} />}
        right={
          <div className="table-wrap">
            <table>
              <tbody>
                {table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) =>
                      rowIndex === 0 ? <th key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>,
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </section>
  );
}

function SqlTool() {
  const [sql, setSql] = useState('select id,email,created_at from contacts where lifecycle_stage = \'customer\' order by created_at desc');
  const [output, setOutput] = useState('');

  const run = () => {
    try {
      setOutput(formatSql(sql, { language: 'sql' }));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Could not format SQL');
    }
  };

  return (
    <TwoPane
      left={<TextArea label="SQL" value={sql} onChange={setSql} />}
      right={<Output label="Formatted SQL" value={output} />}
      actions={
        <>
          <ActionButton icon={<Wand2 />} label="Format" onClick={run} />
          <CopyButton value={output} />
        </>
      }
    />
  );
}

function WritingTool({ kind }: { kind: 'jira' | 'email' }) {
  const [input, setInput] = useState('User cannot update a HubSpot property because the field is locked by a workflow.');
  const output = useMemo(() => (kind === 'jira' ? buildJiraDraft(input) : buildEmailDraft(input)), [input, kind]);

  return (
    <TwoPane
      left={<TextArea label="Notes" value={input} onChange={setInput} />}
      right={<Output label={kind === 'jira' ? 'Jira Draft' : 'Email Draft'} value={output} />}
      actions={<CopyButton value={output} />}
    />
  );
}

function TwoPane({
  left,
  right,
  actions,
  footer,
}: {
  left: ReactNode;
  right: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="panel">
      {actions && <div className="toolbar">{actions}</div>}
      <div className="two-pane">
        {left}
        {right}
      </div>
      {footer}
    </section>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="editor">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} spellCheck={false} />
    </label>
  );
}

function Output({ label, value }: { label: string; value: string }) {
  return (
    <label className="editor">
      <span>{label}</span>
      <pre className="output">{value}</pre>
    </label>
  );
}

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="secondary-button" type="button" onClick={onClick} title={label}>
      {icon}
      {label}
    </button>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button className="secondary-button" type="button" onClick={copy} disabled={!value} title="Copy">
      <Copy size={16} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function decodeJwt(token: string) {
  const [header, payload] = token.split('.');
  if (!header || !payload) {
    return 'JWT must include header and payload.';
  }

  try {
    return JSON.stringify(
      {
        header: JSON.parse(base64UrlDecode(header)),
        payload: JSON.parse(base64UrlDecode(payload)),
      },
      null,
      2,
    );
  } catch {
    return 'Could not decode JWT.';
  }
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return decodeURIComponent(escape(atob(normalized)));
}

function generateGuids(count: number) {
  return Array.from({ length: Math.min(Math.max(count || 1, 1), 50) }, () => crypto.randomUUID());
}

function buildDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const max = Math.max(leftLines.length, rightLines.length);
  const result: DiffLine[] = [];

  Array.from({ length: max }).forEach((_, index) => {
    if (leftLines[index] === rightLines[index]) {
      result.push({ type: 'same', text: leftLines[index] ?? '' });
      return;
    }
    if (leftLines[index] !== undefined) {
      result.push({ type: 'remove', text: leftLines[index] });
    }
    if (rightLines[index] !== undefined) {
      result.push({ type: 'add', text: rightLines[index] });
    }
  });

  return result;
}

function formatDateInZone(date: Date, timeZone: string) {
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(date);
}

function findRegexMatches(pattern: string, flags: string, text: string) {
  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches = [...text.matchAll(regex)].map((match) => `${match.index}: ${match[0]}`);
    return matches.length ? matches.join('\n') : 'No matches';
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid regex';
  }
}

function updateHeader(
  headers: ApiHeader[],
  setHeaders: (headers: ApiHeader[]) => void,
  index: number,
  field: keyof ApiHeader,
  value: string,
) {
  setHeaders(headers.map((header, headerIndex) => (headerIndex === index ? { ...header, [field]: value } : header)));
}

function tryPrettyJson(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function parseCsv(input: string) {
  return input
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const cells: string[] = [];
      let current = '';
      let quoted = false;
      for (const char of line) {
        if (char === '"') {
          quoted = !quoted;
        } else if (char === ',' && !quoted) {
          cells.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current);
      return cells;
    });
}

function buildJiraDraft(notes: string) {
  return `Summary
Investigate reported BizOps issue

Description
${notes}

Impact
User workflow is blocked or slowed down until the configuration is reviewed.

Acceptance Criteria
- Root cause is identified
- Required HubSpot/Jira/API configuration is documented
- User receives a clear update with next steps`;
}

function buildEmailDraft(notes: string) {
  return `Hi,

Thanks for flagging this. I reviewed the details:

${notes}

I will check the related configuration and confirm the next steps. If I need additional details, I will follow up with a specific question.

Best regards`;
}

export { App };

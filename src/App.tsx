import {
  Braces,
  CalendarClock,
  CheckCircle2,
  Code2,
  Columns3,
  Copy,
  FileCog,
  FileJson,
  Fingerprint,
  Globe2,
  Hash,
  KeyRound,
  Layers3,
  ListChecks,
  Mail,
  MessageSquareText,
  Play,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Table2,
  TerminalSquare,
  Trash2,
  UsersRound,
  Wand2,
} from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { format as formatSql } from 'sql-formatter';
import { buildStyledDraft, buildStyleGuideSummary, type WritingFormat } from './writingProfile';

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
  | 'hubspot'
  | 'bulk'
  | 'property'
  | 'access'
  | 'cleaner'
  | 'sop'
  | 'jira'
  | 'email'
  | 'teams';

type ApiHeader = {
  key: string;
  value: string;
};

type ApiHistoryItem = {
  method: string;
  url: string;
  status: string;
  createdAt: string;
};

type DiffLine = {
  type: 'same' | 'add' | 'remove';
  text: string;
};

type TimeZoneItem = {
  label: string;
  zone: string;
  note: string;
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
  { id: 'cleaner', title: 'CSV Cleaner', section: 'Data', description: 'Normalize and validate CSV', icon: <CheckCircle2 /> },
  { id: 'hubspot', title: 'HubSpot Duplicates', section: 'HubSpot', description: 'Find duplicate records', icon: <UsersRound /> },
  { id: 'bulk', title: 'Bulk Update Builder', section: 'HubSpot', description: 'CSV to update payload', icon: <Layers3 /> },
  { id: 'property', title: 'Property Builder', section: 'HubSpot', description: 'Create property payloads', icon: <FileCog /> },
  { id: 'access', title: 'Access Request', section: 'BizOps', description: 'Draft access requests', icon: <ShieldCheck /> },
  { id: 'sop', title: 'SOP Generator', section: 'BizOps', description: 'Turn notes into SOPs', icon: <ListChecks /> },
  { id: 'csv', title: 'CSV Preview', section: 'Data', description: 'Inspect CSV rows', icon: <Table2 /> },
  { id: 'sql', title: 'SQL Formatter', section: 'Data', description: 'Clean up SQL queries', icon: <TerminalSquare /> },
  { id: 'jira', title: 'Jira Assistant', section: 'Writing', description: 'Comments and descriptions', icon: <ListChecks /> },
  { id: 'email', title: 'Email Assistant', section: 'Writing', description: 'Professional replies', icon: <Mail /> },
  { id: 'teams', title: 'Teams Message', section: 'Writing', description: 'Short internal updates', icon: <MessageSquareText /> },
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
    case 'cleaner':
      return <CsvCleanerTool />;
    case 'hubspot':
      return <HubSpotDuplicatesTool />;
    case 'bulk':
      return <BulkUpdateTool />;
    case 'property':
      return <PropertyBuilderTool />;
    case 'access':
      return <AccessRequestTool />;
    case 'sop':
      return <SopGeneratorTool />;
    case 'csv':
      return <CsvTool />;
    case 'sql':
      return <SqlTool />;
    case 'jira':
      return <WritingTool defaultFormat="jira-comment" />;
    case 'email':
      return <WritingTool defaultFormat="email-reply" />;
    case 'teams':
      return <WritingTool defaultFormat="teams-message" />;
    default:
      return null;
  }
}

function JsonTool() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Paste JSON and format it.');
  const stats = useMemo(() => getJsonStats(input), [input]);

  const run = (mode: 'format' | 'minify' | 'sort') => {
    try {
      const parsed = JSON.parse(input);
      const nextValue = mode === 'sort' ? sortJsonKeys(parsed) : parsed;
      setOutput(mode === 'minify' ? JSON.stringify(nextValue) : JSON.stringify(nextValue, null, 2));
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
          <ActionButton icon={<Columns3 />} label="Sort keys" onClick={() => run('sort')} />
          <CopyButton value={output} />
        </>
      }
      footer={
        <div className="metric-row">
          <div className="small-metric">
            <span>Status</span>
            <strong>{stats.status}</strong>
          </div>
          <div className="small-metric">
            <span>Keys</span>
            <strong>{stats.keys}</strong>
          </div>
          <div className="small-metric">
            <span>Arrays</span>
            <strong>{stats.arrays}</strong>
          </div>
          <div className="small-metric">
            <span>Size</span>
            <strong>{stats.size} chars</strong>
          </div>
        </div>
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
  const zones: TimeZoneItem[] = [
    { label: 'Kyiv', zone: 'Europe/Kyiv', note: 'Ukraine' },
    { label: 'UTC', zone: 'UTC', note: 'Reference' },
    { label: 'London', zone: 'Europe/London', note: 'UK' },
    { label: 'EST / ET', zone: 'America/New_York', note: 'Eastern US' },
    { label: 'CST / CT', zone: 'America/Chicago', note: 'Central US' },
    { label: 'PST / PT', zone: 'America/Los_Angeles', note: 'Pacific US' },
    { label: 'Singapore', zone: 'Asia/Singapore', note: 'APAC' },
  ];
  const sourceDate = new Date(date);
  const tableText = zones.map((item) => `${item.label}: ${formatDateInZone(sourceDate, item.zone)}`).join('\n');

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Source time
          <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <ActionButton icon={<RefreshCw />} label="Now" onClick={() => setDate(new Date().toISOString().slice(0, 16))} />
        <CopyButton value={tableText} />
      </div>
      <div className="timezone-grid">
        {zones.map((item) => (
          <div className="metric-card" key={item.zone}>
            <span>{item.label}</span>
            <strong>{formatDateInZone(sourceDate, item.zone)}</strong>
            <small>{item.note}</small>
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
  const [history, setHistory] = useState<ApiHistoryItem[]>(() => readApiHistory());
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
      const status = `HTTP ${res.status} ${res.statusText} (${elapsed} ms)`;
      setResponse(
        `${status}\n\n${tryPrettyJson(text)}`,
      );
      const nextHistory = [
        { method, url, status, createdAt: new Date().toLocaleString() },
        ...history.filter((item) => !(item.method === method && item.url === url)),
      ].slice(0, 8);
      setHistory(nextHistory);
      writeApiHistory(nextHistory);
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
        footer={
          <div className="history-panel">
            <div className="history-header">
              <strong>Request history</strong>
              <button
                type="button"
                className="icon-button"
                title="Clear history"
                onClick={() => {
                  setHistory([]);
                  writeApiHistory([]);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <span className="muted">No requests yet</span>
              ) : (
                history.map((item) => (
                  <button
                    type="button"
                    className="history-item"
                    key={`${item.method}-${item.url}-${item.createdAt}`}
                    onClick={() => {
                      setMethod(item.method);
                      setUrl(item.url);
                    }}
                  >
                    <strong>{item.method}</strong>
                    <span>{item.url}</span>
                    <small>{item.status}</small>
                  </button>
                ))
              )}
            </div>
          </div>
        }
      />
    </form>
  );
}

function CsvTool() {
  const [csv, setCsv] = useState('email,role,active\nana@example.com,Admin,true\nmax@example.com,User,false');
  const [delimiter, setDelimiter] = useState(',');
  const table = useMemo(() => parseCsv(csv, delimiter), [csv, delimiter]);
  const csvJson = useMemo(() => tableToObjects(table), [table]);

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field compact">
          Delimiter
          <select value={delimiter} onChange={(event) => setDelimiter(event.target.value)}>
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value="	">Tab</option>
          </select>
        </label>
        <CopyButton value={JSON.stringify(csvJson, null, 2)} />
      </div>
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
            <div className="table-footer">
              {Math.max(table.length - 1, 0)} rows · {table[0]?.length ?? 0} columns
            </div>
          </div>
        }
      />
    </section>
  );
}

function CsvCleanerTool() {
  const [csv, setCsv] = useState('email,company,phone\n Ana@Example.COM , Acme Inc , +1 555 001 \nana@example.com,Acme Inc,+1555001\nbad-email,Northwind,');
  const [requiredFields, setRequiredFields] = useState('email,company');
  const [lowercaseEmails, setLowercaseEmails] = useState(true);
  const [dedupeField, setDedupeField] = useState('email');
  const result = useMemo(
    () => cleanCsv(csv, { requiredFields, lowercaseEmails, dedupeField }),
    [csv, requiredFields, lowercaseEmails, dedupeField],
  );

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Required fields
          <input value={requiredFields} onChange={(event) => setRequiredFields(event.target.value)} />
        </label>
        <label className="field wide">
          Dedupe field
          <input value={dedupeField} onChange={(event) => setDedupeField(event.target.value)} />
        </label>
        <label className="toggle-field">
          <input type="checkbox" checked={lowercaseEmails} onChange={(event) => setLowercaseEmails(event.target.checked)} />
          Lowercase emails
        </label>
        <CopyButton value={result.cleanedCsv} />
      </div>
      <TwoPane
        left={<TextArea label="Raw CSV" value={csv} onChange={setCsv} />}
        right={<Output label="Cleaned CSV" value={result.cleanedCsv} />}
        footer={
          <div className="metric-row">
            <div className="small-metric">
              <span>Rows</span>
              <strong>{result.rowCount}</strong>
            </div>
            <div className="small-metric">
              <span>Removed duplicates</span>
              <strong>{result.removedDuplicates}</strong>
            </div>
            <div className="small-metric">
              <span>Missing required</span>
              <strong>{result.missingRequired}</strong>
            </div>
            <div className="small-metric">
              <span>Invalid emails</span>
              <strong>{result.invalidEmails}</strong>
            </div>
          </div>
        }
      />
    </section>
  );
}

function HubSpotDuplicatesTool() {
  const [csv, setCsv] = useState(
    'recordId,email,company,phone\n101,ana@example.com,Acme,+15550001\n102,ana@example.com,Acme Ltd,+15550001\n103,max@example.com,Northwind,+15550002',
  );
  const [field, setField] = useState('email');
  const table = useMemo(() => parseCsv(csv, ','), [csv]);
  const headers = table[0] ?? [];
  const duplicates = useMemo(() => findDuplicates(table, field), [table, field]);
  const summary = duplicates.length
    ? duplicates.map((group) => `${group.value}: ${group.rows.length} records (${group.rows.map((row) => row.recordId || row.id || 'no id').join(', ')})`).join('\n')
    : 'No duplicates found for the selected field.';

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Match field
          <select value={field} onChange={(event) => setField(event.target.value)}>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </label>
        <CopyButton value={summary} />
      </div>
      <TwoPane
        left={<TextArea label="HubSpot export CSV" value={csv} onChange={setCsv} />}
        right={<Output label="Duplicate groups" value={summary} />}
        footer={
          <div className="metric-row">
            <div className="small-metric">
              <span>Records</span>
              <strong>{Math.max(table.length - 1, 0)}</strong>
            </div>
            <div className="small-metric">
              <span>Groups</span>
              <strong>{duplicates.length}</strong>
            </div>
            <div className="small-metric">
              <span>Duplicate records</span>
              <strong>{duplicates.reduce((total, group) => total + group.rows.length, 0)}</strong>
            </div>
            <div className="small-metric">
              <span>Field</span>
              <strong>{field || '-'}</strong>
            </div>
          </div>
        }
      />
    </section>
  );
}

function PropertyBuilderTool() {
  const [label, setLabel] = useState('Customer Segment');
  const [name, setName] = useState('customer_segment');
  const [groupName, setGroupName] = useState('contactinformation');
  const [type, setType] = useState('enumeration');
  const [fieldType, setFieldType] = useState('select');
  const [description, setDescription] = useState('Used by BizOps to segment customers for reporting and workflows.');
  const [options, setOptions] = useState('Enterprise\nMid Market\nSMB');
  const output = useMemo(
    () => buildPropertyOutput({ label, name, groupName, type, fieldType, description, options }),
    [label, name, groupName, type, fieldType, description, options],
  );

  return (
    <section className="panel">
      <div className="form-grid">
        <label className="field">
          Label
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label className="field">
          Internal name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          Group
          <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
        </label>
        <label className="field">
          Type
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="date">date</option>
            <option value="datetime">datetime</option>
            <option value="bool">bool</option>
            <option value="enumeration">enumeration</option>
          </select>
        </label>
        <label className="field">
          Field type
          <select value={fieldType} onChange={(event) => setFieldType(event.target.value)}>
            <option value="text">text</option>
            <option value="textarea">textarea</option>
            <option value="number">number</option>
            <option value="date">date</option>
            <option value="checkbox">checkbox</option>
            <option value="select">select</option>
            <option value="radio">radio</option>
            <option value="booleancheckbox">booleancheckbox</option>
          </select>
        </label>
      </div>
      <TwoPane
        left={
          <>
            <TextArea label="Description" value={description} onChange={setDescription} />
            <TextArea label="Options, one per line" value={options} onChange={setOptions} />
          </>
        }
        right={<Output label="Property payload and checklist" value={output} />}
        actions={<CopyButton value={output} />}
      />
    </section>
  );
}

function AccessRequestTool() {
  const [requester, setRequester] = useState('User Name');
  const [system, setSystem] = useState('HubSpot');
  const [access, setAccess] = useState('View and edit access to Contacts');
  const [reason, setReason] = useState('Needed to support customer data cleanup and validate recent updates.');
  const [link, setLink] = useState('https://example.atlassian.net/browse/OPS-123');
  const output = useMemo(
    () => buildAccessRequest({ requester, system, access, reason, link }),
    [requester, system, access, reason, link],
  );

  return (
    <section className="panel">
      <div className="form-grid">
        <label className="field">
          Requester
          <input value={requester} onChange={(event) => setRequester(event.target.value)} />
        </label>
        <label className="field">
          System
          <input value={system} onChange={(event) => setSystem(event.target.value)} />
        </label>
        <label className="field">
          Access required
          <input value={access} onChange={(event) => setAccess(event.target.value)} />
        </label>
        <label className="field">
          Link
          <input value={link} onChange={(event) => setLink(event.target.value)} />
        </label>
      </div>
      <TwoPane
        left={<TextArea label="Business reason" value={reason} onChange={setReason} />}
        right={<Output label="Access request draft" value={output} />}
        actions={<CopyButton value={output} />}
      />
    </section>
  );
}

function SopGeneratorTool() {
  const [notes, setNotes] = useState('Create a HubSpot property in Sandbox first. Validate field type and options. After approval, recreate the same property in Production. Add Jira comment with details.');
  const output = useMemo(() => buildSop(notes), [notes]);

  return (
    <TwoPane
      left={<TextArea label="Process notes" value={notes} onChange={setNotes} />}
      right={<Output label="SOP draft" value={output} />}
      actions={<CopyButton value={output} />}
    />
  );
}

function BulkUpdateTool() {
  const [csv, setCsv] = useState('id,lifecycle_stage,owner\n101,customer,ana@example.com\n102,lead,max@example.com');
  const [idField, setIdField] = useState('id');
  const table = useMemo(() => parseCsv(csv, ','), [csv]);
  const headers = table[0] ?? [];
  const payload = useMemo(() => buildBulkPayload(table, idField), [table, idField]);

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Object ID field
          <select value={idField} onChange={(event) => setIdField(event.target.value)}>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </label>
        <CopyButton value={payload} />
      </div>
      <TwoPane
        left={<TextArea label="Update CSV" value={csv} onChange={setCsv} />}
        right={<Output label="HubSpot batch payload" value={payload} />}
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

function WritingTool({ defaultFormat }: { defaultFormat: WritingFormat }) {
  const [input, setInput] = useState('User cannot update a HubSpot property because the field is locked by a workflow.');
  const [format, setFormat] = useState<WritingFormat>(defaultFormat);
  const output = useMemo(() => buildStyledDraft(format, input), [input, format]);

  return (
    <section className="panel">
      <div className="toolbar">
        <label className="field wide">
          Format
          <select value={format} onChange={(event) => setFormat(event.target.value as WritingFormat)}>
            <option value="jira-comment">Jira comment</option>
            <option value="jira-description">Jira description</option>
            <option value="email-reply">Email reply</option>
            <option value="teams-message">Teams message</option>
          </select>
        </label>
        <CopyButton value={output} />
      </div>
      <TwoPane
        left={<TextArea label="Raw notes" value={input} onChange={setInput} />}
        right={<Output label="Styled draft" value={output} />}
        footer={<Output label="Style profile" value={buildStyleGuideSummary()} compact />}
      />
    </section>
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

function Output({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <label className="editor">
      <span>{label}</span>
      <pre className={compact ? 'output compact-output' : 'output'}>{value}</pre>
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
        payload: enrichJwtPayload(JSON.parse(base64UrlDecode(payload))),
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

function readApiHistory() {
  try {
    return JSON.parse(localStorage.getItem('bizops-api-history') || '[]') as ApiHistoryItem[];
  } catch {
    return [];
  }
}

function writeApiHistory(history: ApiHistoryItem[]) {
  localStorage.setItem('bizops-api-history', JSON.stringify(history));
}

function getJsonStats(input: string) {
  try {
    const parsed = JSON.parse(input);
    const stats = walkJson(parsed);
    return {
      status: 'Valid',
      keys: String(stats.keys),
      arrays: String(stats.arrays),
      size: String(input.length),
    };
  } catch {
    return {
      status: 'Invalid',
      keys: '0',
      arrays: '0',
      size: String(input.length),
    };
  }
}

function walkJson(value: unknown): { keys: number; arrays: number } {
  if (Array.isArray(value)) {
    return value.reduce(
      (total, item) => {
        const child = walkJson(item);
        return { keys: total.keys + child.keys, arrays: total.arrays + child.arrays };
      },
      { keys: 0, arrays: 1 },
    );
  }
  if (value && typeof value === 'object') {
    return Object.values(value).reduce(
      (total, item) => {
        const child = walkJson(item);
        return { keys: total.keys + child.keys, arrays: total.arrays + child.arrays };
      },
      { keys: Object.keys(value).length, arrays: 0 },
    );
  }
  return { keys: 0, arrays: 0 };
}

function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortJsonKeys(item)]));
  }
  return value;
}

function enrichJwtPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if ((key === 'iat' || key === 'exp' || key === 'nbf') && typeof value === 'number') {
        return [key, `${value} (${new Date(value * 1000).toLocaleString()})`];
      }
      return [key, value];
    }),
  );
}

function parseCsv(input: string, delimiter: string) {
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
        } else if (char === delimiter && !quoted) {
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

function tableToObjects(table: string[][]) {
  const [headers = [], ...rows] = table;
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, row[index] ?? ''])));
}

function cleanCsv(
  input: string,
  options: { requiredFields: string; lowercaseEmails: boolean; dedupeField: string },
) {
  const table = parseCsv(input, ',');
  const [headers = [], ...rows] = table;
  const required = options.requiredFields
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  let removedDuplicates = 0;
  let missingRequired = 0;
  let invalidEmails = 0;

  const cleanedRows = rows
    .map((row) => {
      const normalized = headers.map((header, index) => {
        const value = (row[index] ?? '').trim().replace(/\s+/g, ' ');
        return options.lowercaseEmails && header.toLowerCase().includes('email') ? value.toLowerCase() : value;
      });
      const record = Object.fromEntries(headers.map((header, index) => [header, normalized[index] ?? '']));
      if (required.some((field) => !record[field])) {
        missingRequired += 1;
      }
      Object.entries(record).forEach(([key, value]) => {
        if (key.toLowerCase().includes('email') && value && !isValidEmail(value)) {
          invalidEmails += 1;
        }
      });
      return normalized;
    })
    .filter((row) => {
      const dedupeIndex = headers.indexOf(options.dedupeField);
      if (dedupeIndex === -1) {
        return true;
      }
      const value = row[dedupeIndex]?.toLowerCase();
      if (!value) {
        return true;
      }
      if (seen.has(value)) {
        removedDuplicates += 1;
        return false;
      }
      seen.add(value);
      return true;
    });

  return {
    cleanedCsv: [headers, ...cleanedRows].map(toCsvLine).join('\n'),
    rowCount: String(cleanedRows.length),
    removedDuplicates: String(removedDuplicates),
    missingRequired: String(missingRequired),
    invalidEmails: String(invalidEmails),
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toCsvLine(row: string[]) {
  return row.map((cell) => (cell.includes(',') || cell.includes('"') ? `"${cell.replace(/"/g, '""')}"` : cell)).join(',');
}

function buildPropertyOutput({
  label,
  name,
  groupName,
  type,
  fieldType,
  description,
  options,
}: {
  label: string;
  name: string;
  groupName: string;
  type: string;
  fieldType: string;
  description: string;
  options: string;
}) {
  const optionValues = options
    .split(/\r?\n/)
    .map((option) => option.trim())
    .filter(Boolean);
  const payload = {
    name,
    label,
    type,
    fieldType,
    groupName,
    description,
    options: optionValues.map((option, index) => ({
      label: option,
      value: option.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      displayOrder: index,
      hidden: false,
    })),
  };

  return `HubSpot property payload
${JSON.stringify(payload, null, 2)}

Implementation checklist
- Create in Sandbox first
- Confirm field type, internal name, and options
- Validate visibility and permissions
- Recreate in Production after approval
- Add Jira comment with property name, type, and environments

Jira comment
The property has been prepared for Sandbox and Production.

Details:
- Label: ${label}
- Internal name: ${name}
- Type: ${type}
- Field type: ${fieldType}
- Group: ${groupName}

Please let me know if you notice any issues.`;
}

function buildAccessRequest({
  requester,
  system,
  access,
  reason,
  link,
}: {
  requester: string;
  system: string;
  access: string;
  reason: string;
  link: string;
}) {
  return `Access request

Requester:
${requester}

System:
${system}

Access required:
${access}

Business reason:
${reason}

Related link:
${link || 'Please provide the link'}

Approval / next step:
Could you please confirm whether this access should be granted and whether any additional approval is required?`;
}

function buildSop(notes: string) {
  const steps = notes
    .split(/[.;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return `Purpose
Document the process so the same request can be handled consistently.

When to Use
Use this SOP when a similar BizOps or HubSpot admin request is received.

Steps
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Notes
- Keep changes limited to the approved scope
- Add screenshots or links when they help future review
- No changes should be made in Production before validation when Sandbox is available

Escalation
Escalate if permissions are missing, the request changes scope, or the expected behavior is unclear.`;
}

function findDuplicates(table: string[][], field: string) {
  const records = tableToObjects(table);
  const groups = records.reduce<Record<string, Array<Record<string, string>>>>((acc, row) => {
    const value = (row[field] || '').trim().toLowerCase();
    if (!value) {
      return acc;
    }
    acc[value] = [...(acc[value] || []), row];
    return acc;
  }, {});

  return Object.entries(groups)
    .filter(([, rows]) => rows.length > 1)
    .map(([value, rows]) => ({ value, rows }));
}

function buildBulkPayload(table: string[][], idField: string) {
  const rows = tableToObjects(table);
  return JSON.stringify(
    {
      inputs: rows
        .filter((row) => row[idField])
        .map((row) => ({
          id: row[idField],
          properties: Object.fromEntries(Object.entries(row).filter(([key, value]) => key !== idField && value !== '')),
        })),
    },
    null,
    2,
  );
}

export { App };

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_CV_TEX_URL =
  'https://raw.githubusercontent.com/duongoku/my.cv/main/main.tex';

const cvTexUrl = process.env.PROFILE_CV_TEX_URL ?? DEFAULT_CV_TEX_URL;
const outDir = path.resolve('_site/profile');
const outFile = path.join(outDir, 'index.html');

const allowedSections = new Map([
  ['education', 'Education'],
  ['research experience', 'Research Experience'],
  ['publications & presentations', 'Publications & Presentations'],
  ['awards and honors', 'Awards and Honors'],
  ['technical skills', 'Technical Skills'],
]);

const requiredPublicFields = [
  'name',
  'email',
  'location',
  'linkedin',
  'github',
  'orcid',
];

async function main() {
  const tex = await fetchCvTex(cvTexUrl);
  const parsed = parseCv(tex);
  validateProfile(parsed);

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, renderPage(parsed), 'utf8');
  console.log(`Generated ${path.relative(process.cwd(), outFile)}`);
}

async function fetchCvTex(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `CV fetch failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

function parseCv(tex) {
  const uncommented = stripLatexComments(tex);
  const body = extractEnvironment(uncommented, 'document');
  const headingTex = extractEnvironment(body, 'center');
  const sections = extractSections(body);

  return {
    sourceUrl: cvTexUrl,
    updatedAt: new Date().toISOString(),
    heading: parseHeading(headingTex),
    sections: sections
      .map(section => ({
        title: normalizeInlineText(section.title),
        key: sectionKey(section.title),
        content: section.content,
      }))
      .filter(section => allowedSections.has(section.key))
      .map(section => ({
        title: allowedSections.get(section.key),
        html:
          section.key === 'technical skills'
            ? renderSkills(section.content)
            : renderSectionEntries(section.content),
      })),
  };
}

function stripLatexComments(tex) {
  return tex
    .split('\n')
    .map(line => {
      for (let i = 0; i < line.length; i += 1) {
        if (line[i] === '%' && countBackslashesBefore(line, i) % 2 === 0) {
          return line.slice(0, i);
        }
      }
      return line;
    })
    .join('\n');
}

function countBackslashesBefore(text, index) {
  let count = 0;
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i -= 1) {
    count += 1;
  }
  return count;
}

function extractEnvironment(tex, name) {
  const startToken = `\\begin{${name}}`;
  const endToken = `\\end{${name}}`;
  const start = tex.indexOf(startToken);
  const end = tex.indexOf(endToken, start + startToken.length);

  if (start === -1 || end === -1) {
    throw new Error(`Missing LaTeX environment: ${name}`);
  }

  return tex.slice(start + startToken.length, end);
}

function extractSections(body) {
  const matches = [];
  let index = 0;

  while (index < body.length) {
    const commandIndex = body.indexOf('\\section', index);
    if (commandIndex === -1) {
      break;
    }

    const parsed = readCommandArgs(body, commandIndex, 'section', 1);
    if (!parsed) {
      index = commandIndex + '\\section'.length;
      continue;
    }

    matches.push({
      title: parsed.args[0],
      contentStart: parsed.end,
      sectionStart: commandIndex,
    });
    index = parsed.end;
  }

  return matches.map((match, i) => ({
    title: match.title,
    content: body.slice(
      match.contentStart,
      i + 1 < matches.length ? matches[i + 1].sectionStart : body.length,
    ),
  }));
}

function parseHeading(headingTex) {
  const textbfArgs = findCommandArgs(headingTex, 'textbf', 1);
  const name =
    textbfArgs.length > 0 ? normalizeInlineText(textbfArgs[0][0]) : '';
  const hrefs = findCommandArgs(headingTex, 'href', 2);
  const contacts = {};

  for (const [url, label] of hrefs) {
    if (url.startsWith('mailto:')) {
      contacts.email = {
        href: url,
        label: normalizeInlineText(label),
      };
    } else if (url.includes('linkedin.com')) {
      contacts.linkedin = {
        href: url,
        label: normalizeInlineText(label),
      };
    } else if (url.includes('github.com')) {
      contacts.github = {
        href: url,
        label: normalizeInlineText(label),
      };
    } else if (url.includes('orcid.org')) {
      contacts.orcid = {
        href: url,
        label: normalizeInlineText(label),
      };
    }
  }

  const locationMatch = headingTex.match(
    /\\faMapMarker\s*(?:\\hspace\s*\{[^{}]*\})?\s*([^\\\n]+?)(?:\\\\|\n)/,
  );
  const location = locationMatch ? normalizeInlineText(locationMatch[1]) : '';

  return {
    name,
    location,
    contacts,
  };
}

function renderSectionEntries(sectionTex) {
  const normalized = normalizeSectionLatex(sectionTex);
  const lines = normalized
    .split('\n')
    .map(cleanEntryLine)
    .filter(entry => entry.text);

  const entries = mergeContinuationLines(lines).map(renderInline);
  if (entries.length === 0) {
    throw new Error('Parsed empty CV section');
  }

  return `<ul>${entries.map(entry => `<li>${entry}</li>`).join('')}</ul>`;
}

function renderSkills(sectionTex) {
  const itemStart = sectionTex.indexOf('\\item');
  const body = itemStart === -1 ? sectionTex : sectionTex.slice(itemStart);
  const matches = findCommandPositions(body, 'textbf', 1);
  const skills = [];

  for (let i = 0; i < matches.length; i += 1) {
    const label = normalizeInlineText(matches[i].args[0]).replace(/:$/, '');
    const start = matches[i].end;
    const end = i + 1 < matches.length ? matches[i + 1].start : body.length;
    const value = cleanSkillValue(body.slice(start, end));

    if (label && value) {
      skills.push({ label, value });
    }
  }

  if (skills.length === 0) {
    return renderSectionEntries(sectionTex);
  }

  return `<dl>${skills
    .map(
      skill =>
        `<div><dt>${escapeHtml(skill.label)}</dt><dd>${renderInline(
          skill.value,
        )}</dd></div>`,
    )
    .join('')}</dl>`;
}

function cleanSkillValue(value) {
  return value
    .replace(/\\\\/g, '\n')
    .replace(/\\vspace\s*\{[^{}]*\}/g, '')
    .replace(/[{}]/g, '')
    .trim();
}

function normalizeSectionLatex(sectionTex) {
  let output = sectionTex;

  output = replaceCommand(output, 'resumeSubheadingQuad', 9, args =>
    [
      `${args[0]} & ${args[1]}`,
      args[2],
      `${args[3]} & ${args[4]}`,
      args[5] && args[6] ? `${args[5]} & ${args[6]}` : '',
      args[7] && args[8] ? `${args[7]} & ${args[8]}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
  output = replaceCommand(output, 'resumeSubheadingTriple', 5, args =>
    [`${args[0]} & ${args[1]}`, args[2], `${args[3]} & ${args[4]}`]
      .filter(Boolean)
      .join('\n'),
  );
  output = replaceCommand(output, 'resumeSubheading', 4, args =>
    [`${args[0]} & ${args[1]}`, `${args[2]} & ${args[3]}`]
      .filter(Boolean)
      .join('\n'),
  );
  output = replaceCommand(
    output,
    'resumeSubheadingSingle',
    2,
    args => `${args[0]} & ${args[1]}`,
  );
  output = replaceCommand(output, 'resumeOrganizationHeading', 4, args =>
    [`${args[0]} & ${args[1]}`, args[2], args[3]].filter(Boolean).join('\n'),
  );
  output = replaceCommand(
    output,
    'resumeProjectHeading',
    2,
    args => `${args[0]} & ${args[1]}`,
  );
  output = replaceCommand(
    output,
    'resumeItem',
    1,
    args => `\n\\item ${args[0]}\n`,
  );

  return output
    .replace(/\\begin\{tabular\*?\}[\s\S]*?(?=\n)/g, '')
    .replace(/\\end\{tabular\*?\}/g, '')
    .replace(/\\begin\{itemize\}|\s*\\end\{itemize\}/g, '\n')
    .replace(/\\item\b/g, '\n@@ITEM@@ ')
    .replace(/\\resume[A-Za-z]+/g, '\n')
    .replace(/\\vspace\s*\{[^{}]*\}/g, '\n')
    .replace(/\\\\/g, '\n')
    .replace(/(^|[^\\])&/g, '$1 - ')
    .replace(/\$\\mid\$/g, '|')
    .replace(/\n\s*\n+/g, '\n');
}

function cleanEntryLine(line) {
  const forced = line.includes('@@ITEM@@');
  const text = line
    .replace(/@@ITEM@@\s*/g, '')
    .replace(/^\s*\\item\s*/, '')
    .replace(/^\s*\\small\s*/, '')
    .replace(/^\s*\\normalsize\s*/, '')
    .trim();

  return {
    forced,
    text,
  };
}

function mergeContinuationLines(lines) {
  const entries = [];

  for (const { forced, text } of lines) {
    if (
      entries.length > 0 &&
      !forced &&
      !text.includes(' - ') &&
      !text.startsWith('\\textbf') &&
      !text.startsWith('Project ') &&
      !text.match(/^[A-Z][A-Za-z .'-]+:/)
    ) {
      entries[entries.length - 1] = `${entries[entries.length - 1]} ${text}`;
    } else {
      entries.push(text);
    }
  }

  return entries;
}

function renderInline(input) {
  let output = '';

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (char === '\\') {
      const rendered = renderCommand(input, i);
      if (rendered) {
        output += rendered.html;
        i = rendered.end - 1;
        continue;
      }
    }

    if (char === '$') {
      const end = input.indexOf('$', i + 1);
      if (end !== -1) {
        output += escapeHtml(normalizeMathText(input.slice(i + 1, end)));
        i = end;
        continue;
      }
    }

    if (char === '{' || char === '}') {
      continue;
    }

    output += escapeHtml(char);
  }

  return output
    .replace(/\s+/g, ' ')
    .replace(/\s+<br>/g, '<br>')
    .replace(/<br>\s+/g, '<br>')
    .trim();
}

function renderCommand(input, start) {
  if (input[start + 1] === '\\') {
    return { html: '<br>', end: start + 2 };
  }

  const escaped = input[start + 1];
  if (['&', '%', '_', '#', '{', '}'].includes(escaped)) {
    return { html: escapeHtml(escaped), end: start + 2 };
  }

  const nameMatch = input.slice(start + 1).match(/^[A-Za-z]+/);
  if (!nameMatch) {
    return { html: '', end: start + 1 };
  }

  const name = nameMatch[0];
  const commandEnd = start + 1 + name.length;

  if (name === 'href') {
    const parsed = readArgsFrom(input, commandEnd, 2);
    if (parsed) {
      return {
        html: `<a href="${escapeAttribute(normalizeInlineText(parsed.args[0]))}">${renderInline(
          parsed.args[1],
        )}</a>`,
        end: parsed.end,
      };
    }
  }

  if (['textbf', 'textit', 'emph', 'small', 'normalsize'].includes(name)) {
    const parsed = readArgsFrom(input, commandEnd, 1);
    const inner = parsed ? renderInline(parsed.args[0]) : '';
    const tag =
      name === 'textbf'
        ? 'strong'
        : name === 'small' || name === 'normalsize'
          ? ''
          : 'em';

    return {
      html: tag ? `<${tag}>${inner}</${tag}>` : inner,
      end: parsed ? parsed.end : commandEnd,
    };
  }

  if (name === 'parbox') {
    const parsed = readParboxArgs(input, commandEnd);
    if (parsed) {
      return { html: renderInline(parsed.content), end: parsed.end };
    }
  }

  if (
    name.startsWith('fa') ||
    ['hspace', 'vspace', 'begin', 'end', 'textwidth'].includes(name)
  ) {
    const parsed = readArgsFrom(input, commandEnd, 1);
    return { html: '', end: parsed ? parsed.end : commandEnd };
  }

  const parsed = readArgsFrom(input, commandEnd, 1);
  if (parsed) {
    return { html: renderInline(parsed.args[0]), end: parsed.end };
  }

  return { html: '', end: commandEnd };
}

function readParboxArgs(input, start) {
  let index = skipWhitespace(input, start);
  if (input[index] === '[') {
    const optionalEnd = input.indexOf(']', index + 1);
    if (optionalEnd !== -1) {
      index = optionalEnd + 1;
    }
  }

  const width = readBrace(input, skipWhitespace(input, index));
  if (!width) {
    return null;
  }

  const content = readBrace(input, skipWhitespace(input, width.end));
  if (!content) {
    return null;
  }

  return {
    content: content.value,
    end: content.end,
  };
}

function replaceCommand(input, name, argCount, formatter) {
  let output = '';
  let index = 0;
  const command = `\\${name}`;

  while (index < input.length) {
    const start = input.indexOf(command, index);
    if (start === -1) {
      output += input.slice(index);
      break;
    }

    const parsed = readCommandArgs(input, start, name, argCount);
    if (!parsed) {
      output += input.slice(index, start + command.length);
      index = start + command.length;
      continue;
    }

    output += input.slice(index, start);
    output += `\n${formatter(parsed.args)}\n`;
    index = parsed.end;
  }

  return output;
}

function findCommandArgs(input, name, argCount) {
  return findCommandPositions(input, name, argCount).map(
    position => position.args,
  );
}

function findCommandPositions(input, name, argCount) {
  const positions = [];
  let index = 0;
  const command = `\\${name}`;

  while (index < input.length) {
    const start = input.indexOf(command, index);
    if (start === -1) {
      break;
    }

    const parsed = readCommandArgs(input, start, name, argCount);
    if (parsed) {
      positions.push({ start, ...parsed });
      index = parsed.end;
    } else {
      index = start + command.length;
    }
  }

  return positions;
}

function readCommandArgs(input, start, name, argCount) {
  const command = `\\${name}`;
  if (!input.startsWith(command, start)) {
    return null;
  }

  return readArgsFrom(input, start + command.length, argCount);
}

function readArgsFrom(input, start, argCount) {
  const args = [];
  let index = start;

  for (let i = 0; i < argCount; i += 1) {
    index = skipWhitespace(input, index);
    const arg = readBrace(input, index);
    if (!arg) {
      return null;
    }
    args.push(arg.value);
    index = arg.end;
  }

  return { args, end: index };
}

function readBrace(input, start) {
  if (input[start] !== '{') {
    return null;
  }

  let depth = 0;
  for (let i = start; i < input.length; i += 1) {
    if (input[i] === '\\') {
      i += 1;
      continue;
    }

    if (input[i] === '{') {
      depth += 1;
    } else if (input[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          value: input.slice(start + 1, i),
          end: i + 1,
        };
      }
    }
  }

  return null;
}

function skipWhitespace(input, start) {
  let index = start;
  while (/\s/.test(input[index] ?? '')) {
    index += 1;
  }
  return index;
}

function validateProfile(profile) {
  for (const field of requiredPublicFields) {
    const value =
      field === 'name' || field === 'location'
        ? profile.heading[field]
        : profile.heading.contacts[field]?.href;

    if (!value) {
      throw new Error(`Missing public profile field: ${field}`);
    }
  }

  for (const title of allowedSections.values()) {
    if (!profile.sections.some(section => section.title === title)) {
      throw new Error(`Missing public profile section: ${title}`);
    }
  }

  const html = renderPage(profile);
  const forbidden = [
    'tel:',
    '+84 966 997 401',
    '84966997401',
    'References',
    'hungpn@vnu.edu.vn',
    'htthuong@hcmiu.edu.vn',
  ];

  for (const value of forbidden) {
    if (html.includes(value)) {
      throw new Error(`Private CV field leaked: ${value}`);
    }
  }
}

function renderPage(profile) {
  const { heading } = profile;
  const contacts = [
    heading.contacts.email,
    heading.location ? { label: heading.location } : null,
    heading.contacts.linkedin,
    heading.contacts.github,
    heading.contacts.orcid,
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading.name)} / Profile</title>
    <style>
      :root {
        color: #171717;
        background: #f8f7f3;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        margin: 0;
      }

      main {
        box-sizing: border-box;
        width: min(100%, 1080px);
        margin: 0 auto;
        padding: clamp(28px, 6vw, 56px) clamp(20px, 5vw, 56px);
      }

      nav {
        display: flex;
        gap: 12px;
        margin-bottom: 40px;
      }

      a {
        color: #151515;
        font-weight: 700;
        overflow-wrap: anywhere;
        text-decoration-thickness: 2px;
        text-underline-offset: 4px;
      }

      a:hover {
        color: #9a3412;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        max-width: 18ch;
        font-size: clamp(2.8rem, 7vw, 5rem);
        line-height: 1;
        letter-spacing: 0;
      }

      header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
        gap: 28px;
        align-items: end;
        margin-bottom: 48px;
      }

      .contacts {
        display: grid;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
        color: #4c4942;
      }

      .contacts li {
        line-height: 1.5;
      }

      section {
        border-top: 1px solid #d9d5ca;
        display: grid;
        grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
        gap: 24px;
        padding: 28px 0 32px;
      }

      h2 {
        font-size: clamp(1.35rem, 3vw, 2rem);
        line-height: 1.15;
        letter-spacing: 0;
      }

      header > *,
      section > * {
        min-width: 0;
      }

      ul {
        display: grid;
        gap: 10px;
        margin: 0;
        padding-left: 1.1rem;
      }

      li {
        line-height: 1.55;
        overflow-wrap: anywhere;
      }

      dl {
        display: grid;
        gap: 12px;
        margin: 0;
      }

      dl div {
        display: grid;
        grid-template-columns: minmax(140px, 220px) 1fr;
        gap: 12px;
      }

      dt {
        font-weight: 800;
      }

      dd {
        margin: 0;
        line-height: 1.55;
      }

      .generated {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #d9d5ca;
        color: #6b675f;
        font-size: 0.9rem;
      }

      @media (max-width: 760px) {
        header,
        section {
          grid-template-columns: 1fr;
        }

        header {
          gap: 20px;
        }

        dl div {
          grid-template-columns: 1fr;
          gap: 2px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <nav aria-label="Site sections"><a href="/">/home</a> <a href="/profile/">/profile</a> <a href="/archive/">/archive</a></nav>
      <header>
        <h1>${escapeHtml(heading.name)}</h1>
        <ul class="contacts">
          ${contacts
            .map(contact =>
              contact.href
                ? `<li><a href="${escapeAttribute(contact.href)}">${escapeHtml(
                    contact.label,
                  )}</a></li>`
                : `<li>${escapeHtml(contact.label)}</li>`,
            )
            .join('')}
        </ul>
      </header>
      ${profile.sections
        .map(
          section =>
            `<section><h2>${escapeHtml(section.title)}</h2>${section.html}</section>`,
        )
        .join('\n      ')}
      <p class="generated">Generated from public CV source during Pages build.</p>
    </main>
  </body>
</html>
`;
}

function normalizeInlineText(input) {
  return input
    .replace(/\\(?:hspace|vspace)\s*\{[^{}]*\}/g, '')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\#/g, '#')
    .replace(/\\textbf\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\textit\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\emph\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\small\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\[A-Za-z]+/g, '')
    .replace(/[{}$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMathText(input) {
  return input.replace(/\\mid/g, '|').replace(/\\&/g, '&');
}

function sectionKey(title) {
  return normalizeInlineText(title).replace(/\s+/g, ' ').toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const rest = (args.get("--rest") || "http://localhost:8080/server").replace(
  /\/+$/,
  "",
);
const output = resolve(
  args.get("--out") || "/tmp/uist-eden-data-quality.json",
);
const markdownOutput = resolve(
  args.get("--markdown") || output.replace(/\.json$/i, ".md"),
);
const pageSize = Number(args.get("--size") || 100);
const excludeTitlePrefix =
  args.get("--exclude-title-prefix") || "EDEN local QA fixture -";

const canonicalTypes = new Map(
  [
    "Dataset",
    "Article",
    "Conference paper",
    "Conference abstract",
    "Preprint",
    "Book",
    "Book chapter",
    "Chapter",
    "Report",
    "Technical Report",
    "Working Paper",
    "Software",
    "Source Code",
    "Thesis",
    "Dissertation",
    "Academic work",
    "Other",
  ].map((value) => [value.toLowerCase(), value]),
);

function metadataValues(item, key) {
  return (item.metadata?.[key] || [])
    .map((entry) => String(entry.value || ""))
    .filter((value) => value.trim());
}

function firstValues(item, keys) {
  return keys.flatMap((key) => metadataValues(item, key));
}

function issue(item, field, code, values, correction, automaticCandidate) {
  return {
    uuid: item.uuid,
    handle: item.handle,
    title: item.name,
    field,
    code,
    values,
    correction,
    automaticCandidate,
  };
}

async function fetchItems() {
  const items = [];
  let page = 0;
  let totalPages = 1;
  while (page < totalPages) {
    const url = new URL(`${rest}/api/discover/search/objects`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(pageSize));
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }
    const document = await response.json();
    const results =
      document?._embedded?.searchResult?._embedded?.objects || [];
    for (const result of results) {
      const object = result?._embedded?.indexableObject;
      if (object?.type === "item") {
        items.push(object);
      }
    }
    totalPages = document?._embedded?.searchResult?.page?.totalPages || 1;
    page += 1;
  }
  return items.sort((left, right) => left.uuid.localeCompare(right.uuid));
}

const discoveredItems = await fetchItems();
const items = discoveredItems.filter(
  (item) => !String(item.name || "").startsWith(excludeTitlePrefix),
);
const issues = [];
for (const item of items) {
  const types = metadataValues(item, "dc.type");
  if (types.length === 0) {
    issues.push(
      issue(
        item,
        "dc.type",
        "missing",
        [],
        "Curatorial review is required; do not infer a resource type.",
        false,
      ),
    );
  }
  for (const type of types) {
    const trimmed = type.trim();
    const canonical = canonicalTypes.get(trimmed.toLowerCase());
    if (!canonical) {
      issues.push(
        issue(
          item,
          "dc.type",
          "unsupported-value",
          [type],
          "Map only after confirming the resource class with repository staff.",
          false,
        ),
      );
    } else if (type !== canonical) {
      issues.push(
        issue(
          item,
          "dc.type",
          "noncanonical-spelling",
          [type],
          `Normalize to ${canonical}.`,
          true,
        ),
      );
    }
  }

  const languages = firstValues(item, ["dc.language.iso", "dc.language"]);
  if (languages.length === 0) {
    issues.push(
      issue(
        item,
        "dc.language",
        "missing",
        [],
        "Supply a language only from the item or an approved curator.",
        false,
      ),
    );
  }
  for (const language of languages) {
    if (!/^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/.test(language.trim())) {
      issues.push(
        issue(
          item,
          "dc.language",
          "invalid-code",
          [language],
          "Review against the repository language vocabulary.",
          false,
        ),
      );
    } else if (language.includes("_") || language !== language.trim()) {
      issues.push(
        issue(
          item,
          "dc.language",
          "noncanonical-code",
          [language],
          `Normalize mechanically to ${language.trim().replaceAll("_", "-")}.`,
          true,
        ),
      );
    }
  }

  if (
    firstValues(item, ["dc.author", "dc.contributor.author", "dc.creator"])
      .length === 0
  ) {
    issues.push(
      issue(
        item,
        "creator",
        "missing",
        [],
        "Curatorial review is required; do not invent a creator.",
        false,
      ),
    );
  }

  const rightsUris = metadataValues(item, "dc.rights.uri");
  const rights = firstValues(item, ["dc.rights.uri", "dc.rights"]);
  if (rights.length === 0) {
    issues.push(
      issue(
        item,
        "licence",
        "missing",
        [],
        "No repository-wide default is approved; obtain item-level evidence.",
        false,
      ),
    );
  }
  for (const value of rightsUris) {
    try {
      const parsed = new URL(value);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("unsupported protocol");
      }
    } catch {
      issues.push(
        issue(
          item,
          "dc.rights.uri",
          "invalid-url",
          [value],
          "Correct only from the licence statement or curator-supplied URI.",
          false,
        ),
      );
    }
  }

  const dates = firstValues(item, [
    "dc.date.issued",
    "dc.date.copyright",
    "dc.date.available",
    "dc.date.accessioned",
  ]);
  if (dates.length === 0) {
    issues.push(
      issue(
        item,
        "date",
        "missing",
        [],
        "Curatorial review is required; do not infer a publication date.",
        false,
      ),
    );
  }
  for (const date of dates) {
    if (!/^\d{4}(?:-\d{2}(?:-\d{2})?)?(?:T.*)?$/.test(date.trim())) {
      issues.push(
        issue(
          item,
          "date",
          "non-iso-value",
          [date],
          "Normalize only when the original date meaning is unambiguous.",
          false,
        ),
      );
    }
  }

  const identifiers = firstValues(item, [
    "dc.identifier.doi",
    "dc.identifier.handle",
    "dc.identifier.uri",
    "dc.identifier.isbn",
    "dc.identifier.issn",
  ]);
  if (identifiers.length === 0) {
    issues.push(
      issue(
        item,
        "identifier",
        "missing",
        [],
        "Keep the UUID route; add an identifier only from verified evidence.",
        false,
      ),
    );
  }
  const placeholderHandles = identifiers.filter((value) =>
    /(?:handle(?:\.net)?\/|^)123456789\//i.test(value),
  );
  if (placeholderHandles.length > 0) {
    issues.push(
      issue(
        item,
        "identifier",
        "unregistered-example-handle-prefix",
        placeholderHandles,
        "Treat as a local legacy identifier until UIST approves a registered prefix and migration plan.",
        false,
      ),
    );
  }
}

const byCode = Object.fromEntries(
  [...new Set(issues.map(({ field, code }) => `${field}:${code}`))]
    .sort()
    .map((key) => [
      key,
      issues.filter(({ field, code }) => `${field}:${code}` === key).length,
    ]),
);
const checkedFields = [
  "dc.type",
  "dc.language",
  "creator",
  "licence",
  "date",
  "identifier",
];
const byField = Object.fromEntries(
  checkedFields.map((field) => [
    field,
    issues.filter((candidate) => candidate.field === field).length,
  ]),
);
const typeValues = items.flatMap((item) => metadataValues(item, "dc.type"));
const typeDistribution = Object.fromEntries(
  [...new Set(typeValues)]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => [
      value,
      typeValues.filter((candidate) => candidate === value).length,
    ]),
);
const result = {
  generatedAt: new Date().toISOString(),
  source: `${rest}/api/discover/search/objects`,
  scope: "Public discoverable items returned by DSpace Discovery",
  itemCount: items.length,
  excludedFixtureCount: discoveredItems.length - items.length,
  issueCount: issues.length,
  automaticCandidateCount: issues.filter(
    ({ automaticCandidate }) => automaticCandidate,
  ).length,
  byField,
  byCode,
  typeDistribution,
  issues,
};

const markdown = [
  "# EDEN metadata data-quality report",
  "",
  `Generated: ${result.generatedAt}`,
  "",
  `Scope: ${result.scope} (${result.itemCount} items).`,
  "",
  "This report does not invent missing values. Only whitespace, casing, and separator normalizations are marked as automatic candidates; all semantic corrections require repository evidence or curatorial approval.",
  "",
  "| Check | Count |",
  "| --- | ---: |",
  ...Object.entries(byCode).map(([key, count]) => `| ${key} | ${count} |`),
  "",
  "| Audited field | Items/issues requiring attention |",
  "| --- | ---: |",
  ...Object.entries(byField).map(([field, count]) => `| ${field} | ${count} |`),
  "",
  `Automatic normalization candidates: ${result.automaticCandidateCount}.`,
  "",
  "The JSON companion contains item UUIDs, current values, and correction guidance.",
  "",
].join("\n");

await mkdir(dirname(output), { recursive: true });
await mkdir(dirname(markdownOutput), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
await writeFile(markdownOutput, markdown, "utf8");
console.log(JSON.stringify({ ...result, issues: undefined }, null, 2));

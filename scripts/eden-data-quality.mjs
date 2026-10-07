#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { auditItems, metadataValues } from "./eden-metadata-audit.mjs";

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
if (!Number.isInteger(pageSize) || pageSize < 1) {
  throw new Error("--size must be a positive integer.");
}
const excludeTitlePrefix =
  args.get("--exclude-title-prefix") || "EDEN local QA fixture -";

async function fetchItems() {
  const items = [];
  let page = 0;
  let totalPages = 1;
  let reportedTotal;
  let objectCount = 0;
  while (page < totalPages) {
    const url = new URL(`${rest}/api/discover/search/objects`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(pageSize));
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }
    const document = await response.json();
    const searchResult = document?._embedded?.searchResult;
    const pagination = searchResult?.page;
    if (!Number.isInteger(pagination?.totalPages) || !Number.isInteger(pagination?.totalElements)) {
      throw new Error(`${url} returned no valid Discovery pagination; refusing a partial audit.`);
    }
    if (reportedTotal !== undefined && (reportedTotal !== pagination.totalElements || totalPages !== pagination.totalPages)) {
      throw new Error("Discovery totals changed during pagination; repeat the census.");
    }
    reportedTotal = pagination.totalElements;
    const results = searchResult?._embedded?.objects || [];
    if (!Array.isArray(results)) throw new Error(`${url} returned no valid objects array.`);
    objectCount += results.length;
    for (const result of results) {
      const object = result?._embedded?.indexableObject;
      if (object?.type === "item") {
        items.push(object);
      }
    }
    totalPages = pagination.totalPages;
    page += 1;
  }
  if (objectCount !== reportedTotal) {
    throw new Error(`Discovery reported ${reportedTotal} objects but returned ${objectCount}; refusing a partial audit.`);
  }
  discovery = { pagesFetched: page, reportedTotalElements: reportedTotal, objectCount };
  return items;
}

const input = args.get("--input");
let discovery;
const snapshot = input ? JSON.parse(await readFile(resolve(input), "utf8")) : undefined;
const discoveredItems = snapshot ? snapshot.items : await fetchItems();
if (!Array.isArray(discoveredItems)) throw new Error("Input snapshot must contain an items array.");
const uniqueItemCount = new Set(discoveredItems.map(item => item.uuid)).size;
if (uniqueItemCount !== discoveredItems.length || discoveredItems.some(item => !item.uuid)) {
  throw new Error("Census contains duplicate or missing item UUIDs; refusing misleading counts.");
}
const items = discoveredItems.filter(
  (item) => !String(item.name || "").startsWith(excludeTitlePrefix),
).sort((left, right) => left.uuid.localeCompare(right.uuid));
const issues = auditItems(items);

const byCode = Object.fromEntries(
  [...new Set(issues.map(({ field, code }) => `${field}:${code}`))]
    .sort()
    .map((key) => [
      key,
      issues.filter(({ field, code }) => `${field}:${code}` === key).length,
    ]),
);
const checkedFields = [...new Set([
  "dc.type",
  "dc.language",
  "creator",
  "dc.title",
  "description",
  "dc.subject",
  "licence",
  "dc.rights.uri",
  "dc.rights.license",
  "access-rights",
  "publication-date",
  "dc.date.issued",
  "dc.date.copyright",
  "dc.date.available",
  "dc.date.accessioned",
  "identifier",
  ...issues.map(({ field }) => field),
])];
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
  source: snapshot?.source || `${rest}/api/discover/search/objects`,
  ...(snapshot ? { snapshotRetrievedAt: snapshot.retrievedAt, input: resolve(input) } : {}),
  scope: "Public discoverable items returned by DSpace Discovery",
  discovery: { ...discovery, rawItemCount: discoveredItems.length, uniqueItemCount },
  itemCount: items.length,
  excludedFixtureCount: discoveredItems.length - items.length,
  issueCount: issues.length,
  automaticCandidateCount: issues.filter(
    ({ automaticCandidate }) => automaticCandidate,
  ).length,
  byField,
  affectedItemCount: new Set(issues.map(issue => issue.uuid)).size,
  affectedItemsByField: Object.fromEntries(checkedFields.map(field => [field, new Set(issues.filter(issue => issue.field === field).map(issue => issue.uuid)).size])),
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
  "This is a read-only curation backlog, not a compliance score. Missing subjects, descriptions and access statements are discovery/reuse gaps, not necessarily mandatory fields. Rights-statement presence does not establish licence validity or permission for reuse. Only whitespace, casing, and separator normalizations are automatic candidates; semantic corrections need source evidence.",
  "",
  "| Check | Count |",
  "| --- | ---: |",
  ...Object.entries(byCode).map(([key, count]) => `| ${key} | ${count} |`),
  "",
  "| Audited field | Issue count | Distinct affected items |",
  "| --- | ---: | ---: |",
  ...Object.entries(byField).map(([field, count]) => `| ${field} | ${count} | ${result.affectedItemsByField[field]} |`),
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

#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const harvester = (args.get("--harvester") || "http://127.0.0.1:8090").replace(
  /\/$/,
  "",
);
const target = args.get("--target") || "http://localhost:4000/";
const output = resolve(args.get("--out") || "/tmp/uist-eden-regression.json");
const rawPrefix = resolve(
  args.get("--raw-prefix") || output.replace(/\.json$/i, ""),
);
const allowMissingRegistries =
  args.get("--allow-missing-registries") === "true";
const expectedType = args.get("--expect-type") || "DataCatalog";
const expectedHarvesterCommit =
  "200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380";
const harvesterCheckout = resolve(
  args.get("--harvester-checkout") ||
    process.env.EDEN_HARVESTER_CHECKOUT ||
    resolve(repositoryRoot, "../wp2-repo-harvester"),
);
const baselinePath = args.get("--baseline")
  ? resolve(args.get("--baseline"))
  : undefined;

const reportUrl = new URL(`${harvester}/`);
reportUrl.searchParams.set("url", target);
const apiUrl = new URL(`${harvester}/api/`);
apiUrl.searchParams.set("url", target);
const repositoryMetadataUrl = new URL("/.well-known/repository.jsonld", target);
const apiCatalogUrl = new URL("/.well-known/api-catalog", target);
const rootRobotsUrl = new URL("/robots.txt", target);
const homeRobotsUrl = new URL("/home/robots.txt", target);
const sitemapUrl = new URL("/sitemap_index.xml", target);

const actualHarvesterCommit = execFileSync(
  "git",
  ["-C", harvesterCheckout, "rev-parse", "HEAD"],
  { encoding: "utf8" },
).trim();
const harvesterDirty = execFileSync(
  "git",
  ["-C", harvesterCheckout, "status", "--porcelain"],
  { encoding: "utf8" },
).trim();
if (actualHarvesterCommit !== expectedHarvesterCommit || harvesterDirty) {
  throw new Error(
    `Harvester baseline check failed: commit=${actualHarvesterCommit}, dirty=${Boolean(harvesterDirty)}`,
  );
}

async function fetchEvidence(url) {
  try {
    const response = await fetch(url);
    return { response, body: await response.text() };
  } catch (error) {
    return { response: undefined, body: "", error: String(error) };
  }
}

const [landing, report, apiResult, repositoryResult, catalogResult, rootRobotsResult, homeRobotsResult, sitemapResult] =
  await Promise.all([
    fetchEvidence(target),
    fetchEvidence(reportUrl),
    fetchEvidence(apiUrl),
    fetchEvidence(repositoryMetadataUrl),
    fetchEvidence(apiCatalogUrl),
    fetchEvidence(rootRobotsUrl),
    fetchEvidence(homeRobotsUrl),
    fetchEvidence(sitemapUrl),
  ]);

const landingHtml = landing.body;
const reportHtml = report.body;
const rootRobots = rootRobotsResult.body;
const homeRobots = homeRobotsResult.body;
const sitemap = sitemapResult.body;
const parseErrors = [];
function parseJson(body, label) {
  try {
    return JSON.parse(body);
  } catch (error) {
    parseErrors.push(`${label}: ${String(error)}`);
    return {};
  }
}
const api = parseJson(apiResult.body, "harvester API JSON");
const repositoryMetadata = parseJson(
  repositoryResult.body,
  "repository JSON-LD",
);
const apiCatalog = parseJson(catalogResult.body, "FAIRiCat JSON");
const openSearchTag = [...landingHtml.matchAll(/<link\b[^>]*>/gi)]
  .map((match) => match[0])
  .find(
    (tag) =>
      /\brel=["']search["']/i.test(tag) &&
      /\btype=["']application\/opensearchdescription\+xml["']/i.test(tag),
  );
const openSearchHref = openSearchTag?.match(/\bhref=["']([^"']+)["']/i)?.[1]
  ?.replaceAll("&amp;", "&");
const openSearchUrl = openSearchHref
  ? new URL(openSearchHref, target)
  : undefined;
const openSearchResult = openSearchUrl
  ? await fetchEvidence(openSearchUrl)
  : {
    response: undefined,
    body: "",
    error: "Landing page does not advertise an OpenSearch description URL",
  };
const openSearch = openSearchResult.body;

function responseEvidence(result) {
  return {
    status: result.response?.status,
    contentType: result.response?.headers.get("content-type"),
    location: result.response?.headers.get("location"),
    error: result.error,
  };
}

const checks = [
  "Embedded JSON-LD Metadata Extraction",
  "Embedded Meta-Tags Metadata Extraction",
  "Linked (signposting) JSON-LD Metadata Extraction",
  "FAIRiCAT / Linkset / API Catalog Discovery",
  "Feed (Atom/RSS) Service Discovery",
  "Sitemap Service Discovery",
  "OpenSearch Service Discovery",
  "SearchAction",
];

function statusFor(label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = reportHtml.match(
    new RegExp(
      `<td>${escaped}[\\s\\S]*?<td class="status-[^"]+">\\s*([^<]+)`,
      "i",
    ),
  );
  return match?.[1]?.trim() || "Not checked";
}

function registryStatus(name) {
  const match = reportHtml.match(
    new RegExp(
      `<h2>${name}</h2>[\\s\\S]*?<p class="status-[^"]+">\\s*([^<]+)`,
      "i",
    ),
  );
  return match?.[1]?.trim() || "Not checked";
}

const mechanismStatuses = Object.fromEntries(
  checks.map((check) => [check, statusFor(check)]),
);
const registryStatuses = {
  re3data: registryStatus("re3data"),
  FAIRsharing: registryStatus("FAIRsharing"),
};
const primaryTopic = api?.metadata?.["foaf:primaryTopic"];
const primaryTypes = Array.isArray(primaryTopic?.["@type"])
  ? primaryTopic["@type"]
  : [primaryTopic?.["@type"]].filter(Boolean);
const repositoryGraph = Array.isArray(repositoryMetadata?.["@graph"])
  ? repositoryMetadata["@graph"]
  : [repositoryMetadata];
const repositoryNode = repositoryGraph[0];
const publisherId = repositoryNode?.publisher?.["@id"];
const publisherNode = repositoryGraph.find(
  (node) => node?.["@id"] === publisherId,
);

const failures = [...parseErrors];
const requiredResponses = {
  landing,
  report,
  api: apiResult,
  repositoryMetadata: repositoryResult,
  apiCatalog: catalogResult,
  rootRobots: rootRobotsResult,
  homeRobots: homeRobotsResult,
  sitemap: sitemapResult,
  openSearch: openSearchResult,
};
for (const [name, result] of Object.entries(requiredResponses)) {
  if (!result.response?.ok) {
    failures.push(
      `${name} request failed: ${result.error || result.response?.status || "no response"}`,
    );
  }
}
for (const [name, status] of Object.entries(mechanismStatuses)) {
  if (status !== "Found") {
    failures.push(`${name}: ${status}`);
  }
}
if (
  !primaryTypes.some(
    (type) =>
      String(type).endsWith(expectedType) || String(type).endsWith("Catalog"),
  )
) {
  failures.push(
    `primary type: ${primaryTypes.join(", ") || "missing"} (expected ${expectedType})`,
  );
}
if (repositoryNode?.["@type"] !== expectedType) {
  failures.push(
    `linked repository primary type: ${repositoryNode?.["@type"] || "missing"} (expected exact ${expectedType})`,
  );
}
for (const field of ["name", "url", "description", "inLanguage", "service"]) {
  const value = repositoryNode?.[field];
  if (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    failures.push(`linked repository field missing: ${field}`);
  }
}
if (
  !publisherId ||
  !publisherNode?.name
) {
  failures.push("linked repository publisher is missing");
}
if (
  !api?.repoURI ||
  typeof api?.metadata !== "object" ||
  !Array.isArray(api?.services)
) {
  failures.push("API response is missing repoURI, metadata, or services");
}
if (!catalogResult.response?.headers.get("content-type")?.startsWith("application/linkset+json")) {
  failures.push("FAIRiCat response has the wrong content type");
}
if (!Array.isArray(apiCatalog?.linkset) || apiCatalog.linkset.length === 0) {
  failures.push("FAIRiCat response has no linksets");
}
if (!repositoryResult.response?.headers.get("content-type")?.startsWith("application/ld+json")) {
  failures.push("linked repository metadata has the wrong content type");
}
if (!openSearchResult.response?.headers.get("content-type")?.startsWith("application/opensearchdescription+xml")) {
  failures.push("OpenSearch description has the wrong content type");
}
if (!openSearch.includes("<OpenSearchDescription")) {
  failures.push("OpenSearch description is not an OpenSearch document");
}
if (!rootRobots.includes("Sitemap:") || !homeRobots.includes("Sitemap:")) {
  failures.push("root or /home robots compatibility response lacks a sitemap");
}
if (!sitemap.includes("<sitemapindex")) {
  failures.push("sitemap index is not a sitemap index document");
}
if (landingHtml.includes("/server/opensearch/search/service")) {
  failures.push("landing page contains the invalid /server/opensearch/search/service URL");
}
if (!allowMissingRegistries) {
  for (const [name, status] of Object.entries(registryStatuses)) {
    if (status !== "Found") {
      failures.push(`${name}: ${status}`);
    }
  }
}

let baselineComparison;
if (baselinePath) {
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const regressions = [];
  if (baseline.target !== target) {
    regressions.push(
      `baseline target mismatch: ${baseline.target || "missing"} != ${target}`,
    );
  }
  for (const check of checks) {
    if (
      baseline?.mechanismStatuses?.[check] === "Found" &&
      mechanismStatuses[check] !== "Found"
    ) {
      regressions.push(
        `${check}: Found -> ${mechanismStatuses[check] || "missing"}`,
      );
    }
  }
  if (
    baseline?.linkedRepositoryType === expectedType &&
    repositoryNode?.["@type"] !== expectedType
  ) {
    regressions.push(
      `linked repository type: ${expectedType} -> ${repositoryNode?.["@type"] || "missing"}`,
    );
  }
  baselineComparison = {
    path: baselinePath,
    target: baseline.target,
    regressions,
    passed: regressions.length === 0,
  };
  failures.push(...regressions.map((regression) => `regression: ${regression}`));
}

const result = {
  checkedAt: new Date().toISOString(),
  harvesterCommit: actualHarvesterCommit,
  harvesterCheckout,
  target,
  mechanismStatuses,
  registryStatuses,
  primaryTypes,
  repoURI: api?.repoURI,
  linkedRepositoryType: repositoryNode?.["@type"],
  serviceTypes: (api?.services || [])
    .map((service) => service["dct:type"])
    .filter(Boolean),
  responseEvidence: {
    landing: responseEvidence(landing),
    report: responseEvidence(report),
    api: responseEvidence(apiResult),
    repositoryMetadata: responseEvidence(repositoryResult),
    apiCatalog: responseEvidence(catalogResult),
    rootRobots: responseEvidence(rootRobotsResult),
    homeRobots: responseEvidence(homeRobotsResult),
    openSearch: responseEvidence(openSearchResult),
    sitemap: responseEvidence(sitemapResult),
  },
  baselineComparison,
  rawArtifacts: {
    landingHtml: `${rawPrefix}.landing.html`,
    reportHtml: `${rawPrefix}.report.html`,
    api: `${rawPrefix}.api.json`,
    repositoryMetadata: `${rawPrefix}.repository.jsonld.json`,
    apiCatalog: `${rawPrefix}.api-catalog.json`,
    rootRobots: `${rawPrefix}.robots.txt`,
    homeRobots: `${rawPrefix}.home-robots.txt`,
    openSearch: `${rawPrefix}.opensearch.xml`,
    sitemap: `${rawPrefix}.sitemap.xml`,
    responseEvidence: `${rawPrefix}.response-evidence.json`,
  },
  passed: failures.length === 0,
  failures,
  api,
};

await mkdir(dirname(output), { recursive: true });
await mkdir(dirname(rawPrefix), { recursive: true });
await writeFile(`${rawPrefix}.landing.html`, landingHtml, "utf8");
await writeFile(`${rawPrefix}.report.html`, reportHtml, "utf8");
await writeFile(
  `${rawPrefix}.api.json`,
  apiResult.body,
  "utf8",
);
await writeFile(
  `${rawPrefix}.repository.jsonld.json`,
  repositoryResult.body,
  "utf8",
);
await writeFile(
  `${rawPrefix}.api-catalog.json`,
  catalogResult.body,
  "utf8",
);
await writeFile(`${rawPrefix}.robots.txt`, rootRobots, "utf8");
await writeFile(`${rawPrefix}.home-robots.txt`, homeRobots, "utf8");
await writeFile(`${rawPrefix}.opensearch.xml`, openSearch, "utf8");
await writeFile(`${rawPrefix}.sitemap.xml`, sitemap, "utf8");
await writeFile(
  `${rawPrefix}.response-evidence.json`,
  `${JSON.stringify(result.responseEvidence, null, 2)}\n`,
  "utf8",
);
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ...result, api: undefined }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}

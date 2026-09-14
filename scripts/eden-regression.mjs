#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

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

const reportUrl = new URL(`${harvester}/`);
reportUrl.searchParams.set("url", target);
const apiUrl = new URL(`${harvester}/api/`);
apiUrl.searchParams.set("url", target);
const repositoryMetadataUrl = new URL("/.well-known/repository.jsonld", target);
const apiCatalogUrl = new URL("/.well-known/api-catalog", target);
const rootRobotsUrl = new URL("/robots.txt", target);
const homeRobotsUrl = new URL("/home/robots.txt", target);
const sitemapUrl = new URL("/sitemap_index.xml", target);

const [
  landingResponse,
  reportResponse,
  apiResponse,
  repositoryMetadataResponse,
  apiCatalogResponse,
  rootRobotsResponse,
  homeRobotsResponse,
  sitemapResponse,
] =
  await Promise.all([
    fetch(target),
    fetch(reportUrl),
    fetch(apiUrl),
    fetch(repositoryMetadataUrl),
    fetch(apiCatalogUrl),
    fetch(rootRobotsUrl),
    fetch(homeRobotsUrl),
    fetch(sitemapUrl),
  ]);

if (
  !landingResponse.ok ||
  !reportResponse.ok ||
  !apiResponse.ok ||
  !repositoryMetadataResponse.ok ||
  !apiCatalogResponse.ok ||
  !rootRobotsResponse.ok ||
  !homeRobotsResponse.ok ||
  !sitemapResponse.ok
) {
  throw new Error(
    `Regression input failed: landing=${landingResponse.status}, report=${reportResponse.status}, api=${apiResponse.status}, ` +
      `repository-metadata=${repositoryMetadataResponse.status}, api-catalog=${apiCatalogResponse.status}, ` +
      `root-robots=${rootRobotsResponse.status}, home-robots=${homeRobotsResponse.status}, ` +
      `sitemap=${sitemapResponse.status}`,
  );
}

const landingHtml = await landingResponse.text();
const reportHtml = await reportResponse.text();
const api = await apiResponse.json();
const repositoryMetadata = await repositoryMetadataResponse.json();
const apiCatalog = await apiCatalogResponse.json();
const rootRobots = await rootRobotsResponse.text();
const homeRobots = await homeRobotsResponse.text();
const openSearchTag = [...landingHtml.matchAll(/<link\b[^>]*>/gi)]
  .map((match) => match[0])
  .find(
    (tag) =>
      /\brel=["']search["']/i.test(tag) &&
      /\btype=["']application\/opensearchdescription\+xml["']/i.test(tag),
  );
const openSearchHref = openSearchTag?.match(/\bhref=["']([^"']+)["']/i)?.[1]
  ?.replaceAll("&amp;", "&");
if (!openSearchHref) {
  throw new Error("Landing page does not advertise an OpenSearch description URL");
}
const openSearchUrl = new URL(openSearchHref, target);
const openSearchResponse = await fetch(openSearchUrl);
if (!openSearchResponse.ok) {
  throw new Error(
    `Advertised OpenSearch description failed: ${openSearchUrl} returned ${openSearchResponse.status}`,
  );
}
const openSearch = await openSearchResponse.text();
const sitemap = await sitemapResponse.text();

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

const failures = [];
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
  !publisherNode?.name ||
  !publisherNode?.address?.addressCountry
) {
  failures.push("linked repository publisher or country is missing");
}
if (
  !api?.repoURI ||
  typeof api?.metadata !== "object" ||
  !Array.isArray(api?.services)
) {
  failures.push("API response is missing repoURI, metadata, or services");
}
if (!apiCatalogResponse.headers.get("content-type")?.startsWith("application/linkset+json")) {
  failures.push("FAIRiCat response has the wrong content type");
}
if (!Array.isArray(apiCatalog?.linkset) || apiCatalog.linkset.length === 0) {
  failures.push("FAIRiCat response has no linksets");
}
if (!repositoryMetadataResponse.headers.get("content-type")?.startsWith("application/ld+json")) {
  failures.push("linked repository metadata has the wrong content type");
}
if (!openSearchResponse.headers.get("content-type")?.startsWith("application/opensearchdescription+xml")) {
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
if (!allowMissingRegistries) {
  for (const [name, status] of Object.entries(registryStatuses)) {
    if (status !== "Found") {
      failures.push(`${name}: ${status}`);
    }
  }
}

const result = {
  checkedAt: new Date().toISOString(),
  harvesterCommit: "200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380",
  target,
  mechanismStatuses,
  registryStatuses,
  primaryTypes,
  repoURI: api?.repoURI,
  linkedRepositoryType: repositoryNode?.["@type"],
  serviceTypes: (api?.services || [])
    .map((service) => service["dct:type"])
    .filter(Boolean),
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
  `${JSON.stringify(api, null, 2)}\n`,
  "utf8",
);
await writeFile(
  `${rawPrefix}.repository.jsonld.json`,
  `${JSON.stringify(repositoryMetadata, null, 2)}\n`,
  "utf8",
);
await writeFile(
  `${rawPrefix}.api-catalog.json`,
  `${JSON.stringify(apiCatalog, null, 2)}\n`,
  "utf8",
);
await writeFile(`${rawPrefix}.robots.txt`, rootRobots, "utf8");
await writeFile(`${rawPrefix}.home-robots.txt`, homeRobots, "utf8");
await writeFile(`${rawPrefix}.opensearch.xml`, openSearch, "utf8");
await writeFile(`${rawPrefix}.sitemap.xml`, sitemap, "utf8");
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ...result, api: undefined }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}

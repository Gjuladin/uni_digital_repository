import assert from "node:assert/strict";
import { test } from "node:test";
import { auditItems, isValidMetadataDate } from "./eden-metadata-audit.mjs";

function item(metadata = {}) {
  return {
    uuid: "test-item",
    name: "An evidenced publication",
    metadata: Object.fromEntries(Object.entries(metadata).map(([key, values]) => [
      key, values.map(value => ({ value })),
    ])),
  };
}

test("accepts partial publication dates and complete zoned timestamps", () => {
  for (const value of ["2024", "2024-02", "2024-02-29", "2000-02-29", "2024-02-29T12:30Z", "2024-02-29T12:30+02:00", "2024-02-29T23:59:59.123Z", "2024-02-29T00:00:00+02:00"]) {
    assert.equal(isValidMetadataDate(value), true, value);
  }
});

test("rejects impossible calendar dates and arbitrary timestamp suffixes", () => {
  for (const value of ["2023-02-29", "1900-02-29", "2024-13", "2024-04-31", "2024-01-00", "2021/06/30", "2024Tanything", "2024-02-29T24:00:00Z", "2024-02-29T00:60:00Z", "2024-02-29T00:00:00+14:30"]) {
    assert.equal(isValidMetadataDate(value), false, value);
  }
});

test("accession and availability dates cannot hide a missing issued date", () => {
  const issues = auditItems([item({
    "dc.date.accessioned": ["2026-10-06T12:00:00Z"],
    "dc.date.available": ["2026-10-06T12:00:00Z"],
  })]);
  assert.ok(issues.some(issue => issue.field === "publication-date" && issue.code === "missing"));
  assert.ok(!issues.some(issue => issue.code === "invalid-iso-date"));
});

test("malformed dates retain their qualified source field", () => {
  const issues = auditItems([item({ "dc.date.issued": ["2021/06/30"] })]);
  assert.deepEqual(issues.filter(issue => issue.code === "invalid-iso-date").map(issue => issue.field), ["dc.date.issued"]);
});

test("recognizes textual licences without inventing a URI or version", () => {
  const source = item({ "dc.rights.license": ["cc-by"] });
  const original = JSON.stringify(source);
  const issues = auditItems([source]);
  assert.ok(!issues.some(issue => issue.field === "licence" && issue.code === "missing"));
  assert.ok(issues.some(issue => issue.code === "licence-uri-not-supplied" && issue.automaticCandidate === false));
  assert.equal(JSON.stringify(source), original);
});

test("sharing-policy URLs require semantic review even when URL syntax is valid", () => {
  const issues = auditItems([item({ "dc.rights.uri": ["https://doi.org/10.15223/policy-029"] })]);
  assert.ok(issues.some(issue => issue.code === "publisher-sharing-policy-review"));
  assert.ok(!issues.some(issue => issue.code === "invalid-url"));
});

test("recognizes licence URIs in textual and dcterms fields", () => {
  for (const field of ["dc.rights.license", "dcterms.license"]) {
    const issues = auditItems([item({ [field]: ["https://doi.org/10.15223/policy-029"] })]);
    assert.ok(!issues.some(issue => issue.field === "licence" && issue.code === "missing"));
    assert.ok(!issues.some(issue => issue.code === "licence-uri-not-supplied"));
    assert.ok(issues.some(issue => issue.code === "publisher-sharing-policy-review"));
  }
});

test("missing descriptions and subjects remain separate discovery gaps", () => {
  const issues = auditItems([item()]);
  assert.ok(issues.some(issue => issue.field === "description"));
  assert.ok(issues.some(issue => issue.field === "dc.subject"));
});

test("provided abstract, subjects, and access statement satisfy those checks", () => {
  const issues = auditItems([item({
    "dc.description.abstract": ["A summary of the work."],
    "dc.subject": ["Computing"],
    "dcterms.accessRights": ["open access"],
  })]);
  assert.ok(!issues.some(issue => ["description", "dc.subject", "access-rights"].includes(issue.field)));
});

test("entity-looking source text is flagged for review and never decoded", () => {
  const source = item({ "dc.relation.ispartof": ["Security &amp; Applications"] });
  const issues = auditItems([source]);
  const issue = issues.find(issue => issue.code === "literal-html-entity-review");
  assert.equal(issue.field, "dc.relation.ispartof");
  assert.equal(issue.values[0], "Security &amp; Applications");
  assert.equal(issue.automaticCandidate, false);
  assert.equal(source.metadata["dc.relation.ispartof"][0].value, "Security &amp; Applications");
});

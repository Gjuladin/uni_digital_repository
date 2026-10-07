import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";

const run = promisify(execFile);

async function withDiscovery(pages, callback) {
  const directory = await mkdtemp(join(tmpdir(), "eden-quality-test-"));
  const server = createServer((request, response) => {
    const page = Number(new URL(request.url, "http://localhost").searchParams.get("page"));
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify(pages[page]));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const output = join(directory, "report.json");
  try {
    await callback([
      "scripts/eden-data-quality.mjs", "--rest", `http://127.0.0.1:${server.address().port}`,
      "--out", output, "--markdown", join(directory, "report.md"),
    ], output);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
}

function page(totalPages, totalElements, objects) {
  return { _embedded: { searchResult: {
    page: { totalPages, totalElements },
    _embedded: { objects: objects.map(object => ({ _embedded: { indexableObject: object } })) },
  } } };
}

test("census counts items separately from communities across all pages", async () => {
  await withDiscovery([
    page(2, 3, [{ type: "item", uuid: "a", metadata: {} }, { type: "community", uuid: "c" }]),
    page(2, 3, [{ type: "item", uuid: "b", metadata: {} }]),
  ], async (args, output) => {
    await run(process.execPath, args);
    const report = JSON.parse(await readFile(output, "utf8"));
    assert.equal(report.itemCount, 2);
    assert.equal(report.discovery.reportedTotalElements, 3);
    assert.equal(report.discovery.pagesFetched, 2);
    assert.equal(report.discovery.uniqueItemCount, 2);
  });
});

test("refuses a partial census or changing pagination totals", async () => {
  for (const pages of [
    [page(1, 2, [{ type: "item", uuid: "a" }])],
    [page(2, 2, [{ type: "item", uuid: "a" }]), page(2, 3, [{ type: "item", uuid: "b" }])],
    [{ error: "Unexpected HTTP-200 document" }],
  ]) {
    await withDiscovery(pages, async (args, output) => {
      await assert.rejects(run(process.execPath, args), /partial audit|totals changed/);
      await assert.rejects(readFile(output), { code: "ENOENT" });
    });
  }
});

test("refuses duplicate UUIDs rather than overstating issue counts", async () => {
  await withDiscovery([page(1, 2, [{ type: "item", uuid: "a" }, { type: "item", uuid: "a" }])], async args => {
    await assert.rejects(run(process.execPath, args), /duplicate or missing item UUIDs/);
  });
});

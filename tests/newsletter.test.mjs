import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNewsletterHandler } from "../server/newsletter.mjs";

test("newsletter persists consent, deduplicates concurrent requests and rejects invalid data", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "restaurant-newsletter-"));
  const file = join(directory, "subscribers.jsonl");
  const server = createServer(
    createNewsletterHandler({ siteSlug: "test-restaurant", file }),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  const url = `http://127.0.0.1:${server.address().port}/api/newsletter`;
  const input = {
    email: "guest@example.invalid",
    consent: true,
    site: "test-restaurant",
  };
  const submit = (body, headers = {}) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  const responses = await Promise.all(
    Array.from({ length: 5 }, () => submit(input)),
  );
  assert.ok(responses.every((response) => response.status === 201));
  const rows = (await readFile(file, "utf8"))
    .trim()
    .split("\n")
    .map(JSON.parse);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, input.email);
  assert.equal(rows[0].consent, true);
  assert.equal((await submit({ ...input, consent: false })).status, 400);
  assert.equal((await submit({ ...input, email: "bad-email" })).status, 400);
  assert.equal(
    (await submit({ ...input, site: "another-restaurant" })).status,
    400,
  );
  assert.equal(
    (await submit(input, { Origin: "https://unrelated.invalid" })).status,
    403,
  );
  assert.equal(
    (await submit(input, { "Content-Type": "text/plain" })).status,
    415,
  );
  assert.equal((await fetch(url)).status, 405);
  assert.equal(
    (await submit({ ...input, website: "spam.example" })).status,
    202,
  );
  assert.equal((await readFile(file, "utf8")).trim().split("\n").length, 1);
});

test("storage failure never reports a successful signup", async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), "restaurant-newsletter-error-"),
  );
  const file = join(directory, "not-a-file");
  await mkdir(file);
  const server = createServer(
    createNewsletterHandler({ siteSlug: "test", file }),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/newsletter`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "guest@example.invalid",
        consent: true,
        site: "test",
      }),
    },
  );
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, undefined);
});

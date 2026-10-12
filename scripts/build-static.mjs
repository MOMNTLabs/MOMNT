import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(projectRoot, "dist");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const entries = await readdir(projectRoot, { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name);

await Promise.all([
  ...htmlFiles.map((fileName) =>
    cp(path.join(projectRoot, fileName), path.join(outputDirectory, fileName)),
  ),
  cp(path.join(projectRoot, "assets"), path.join(outputDirectory, "assets"), {
    recursive: true,
  }),
]);

console.log(`Prepared ${htmlFiles.length} pages in dist/.`);


// oxlint-disable typescript/no-explicit-any
import { packageDist } from "../utils/package";
import { generateRobotsTxt } from "../utils/robots";
import { generateSitemap } from "../utils/sitemap";
import { spawn } from "child_process";
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

interface BuildOptions {
  input: string;
  output: string;
  tar?: boolean;
}

interface SiteData {
  schema: {
    pages: {
      path: string;
      isSystem: boolean;
      meta?: Record<string, string>;
      components: { name: string; props: Record<string, any> }[];
    }[];
    site?: Record<string, string>;
    siteConfig?: Record<string, any>;
    tenant?: string;
  };
  siteConfig: Record<string, any>;
}

function resolveRef(refPath: string, inputDir: string): any {
  const fullPath = join(inputDir, refPath);
  if (!existsSync(fullPath)) {
    return { components: [] };
  }
  const content = JSON.parse(readFileSync(fullPath, "utf-8"));
  if (content.$ref) {
    return resolveRef(content.$ref, inputDir);
  }
  return content;
}

function loadSiteData(inputDir: string): SiteData {
  const schemaPath = join(inputDir, "schema.json");
  const siteConfigPath = join(inputDir, "site.config.json");

  if (!existsSync(schemaPath)) {
    throw new Error(`schema.json not found: ${schemaPath}`);
  }

  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  const siteConfig = existsSync(siteConfigPath) ? JSON.parse(readFileSync(siteConfigPath, "utf-8")) : {};

  schema.pages = schema.pages.map((page: any) => {
    if (page.$ref) {
      return resolveRef(page.$ref, inputDir);
    }
    return page;
  });

  return { schema, siteConfig };
}

function copyAssets(srcDir: string, destDir: string) {
  const assetsDir = join(srcDir, "assets");
  const imagesDir = join(srcDir, "images");

  if (existsSync(assetsDir)) {
    copyDir(assetsDir, join(destDir, "assets"));
  }

  if (existsSync(imagesDir)) {
    copyDir(imagesDir, join(destDir, "assets/images"));
  }
}

function copyDir(src: string, dest: string) {
  if (!existsSync(src)) {
    return;
  }
  mkdirSync(dest, { recursive: true });

  for (const file of readdirSync(src)) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function copyDirRecursive(src: string, dest: string) {
  if (!existsSync(src)) {
    return;
  }
  copyDir(src, dest);
}

function validateConfig(data: SiteData, availableComponents: string[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const page of data.schema.pages) {
    for (const comp of page.components) {
      if (!availableComponents.includes(comp.name)) {
        errors.push(`Component "${comp.name}" does not exist. Available: ${availableComponents.join(", ")}`);
      }
    }
  }

  return { errors, warnings };
}

function runAstroBuild(inputDir: string): Promise<void> {
  return new Promise((resolve, reject) => {

    const astroBin = join(process.cwd(), "node_modules/.bin/astro");
    const env = {
      ...process.env,
      SSG_INPUT_DIR: inputDir,
    };

    const proc = spawn(
      astroBin,
      ["build"],
      {
        env,
        stdio: "inherit",
        shell: true,
      }
    );

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Astro build failed with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

function loadAvailableComponents(): string[] {
  const componentsDir = join(process.cwd(), "../ssg-components/src/components");
  if (!existsSync(componentsDir)) {
    return [];
  }

  const availableComponents: string[] = [];
  const entries = readdirSync(componentsDir);
  for (const entry of entries) {
    const entryPath = join(componentsDir, entry);
    if (statSync(entryPath).isDirectory()) {
      const name = entry
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      availableComponents.push(name);
    }
  }
  return availableComponents;
}

export async function build(options: BuildOptions) {
  const { input, output, tar } = options;


  if (existsSync(output)) {
    rmSync(output, { recursive: true });
  }

  mkdirSync(output, { recursive: true });

  const availableComponents = loadAvailableComponents();

  const data = loadSiteData(input);
  const validation = validateConfig(data, availableComponents);

  if (validation.errors.length > 0) {
    validation.errors.forEach((e) => void 0);
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach((w) => void 0);
  }

  await runAstroBuild(input);

  const astroDistDir = join(process.cwd(), "dist");
  if (existsSync(astroDistDir)) {
    copyDirRecursive(astroDistDir, output);
  }

  copyAssets(input, output);

  const siteUrl = data.siteConfig?.site?.url || "https://example.com";
  const sitemap = generateSitemap(data.schema.pages, siteUrl);
  writeFileSync(join(output, "sitemap.xml"), sitemap);

  const robotsTxt = generateRobotsTxt(siteUrl);
  writeFileSync(join(output, "robots.txt"), robotsTxt);


  if (tar) {
    const tenant = data.schema.tenant || "default";
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const tarName = `sg-website-${tenant}-${timestamp}.tgz`;
    const tarDir = existsSync("/app/output") ? "/app/output" : join(output, "..");
    const tarPath = join(tarDir, tarName);
    await packageDist(output, tarPath);
  }
}

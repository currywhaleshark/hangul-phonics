import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RENDER_ROUTE = "/api/timing-render";
const SAMPLE_DIR = path.join(ROOT, "public/video-assets/consonant-lesson-samples");
const TIMING_WORK_DIR = path.join(ROOT, "tmp/timing-render");
const RENDER_SCRIPT = path.join(ROOT, "tools/render_gogo_timed_lesson_video.py");

export function timingRenderPlugin() {
  return {
    name: "timing-render-api",
    configureServer(server) {
      server.middlewares.use(RENDER_ROUTE, async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "POST only" });
          return;
        }

        try {
          const project = await readJsonBody(req);
          const slug = safeSlug(project?.render?.outputSlug || project?.id);
          validateProject(project, slug);

          await mkdir(TIMING_WORK_DIR, { recursive: true });
          await mkdir(SAMPLE_DIR, { recursive: true });

          const timingPath = path.join(TIMING_WORK_DIR, `${slug}-card-timings.json`);
          const outputPath = path.join(SAMPLE_DIR, `${slug}-timed-lesson.mp4`);
          const previewPath = path.join(SAMPLE_DIR, `${slug}-timed-lesson-preview.jpg`);

          await writeFile(timingPath, `${JSON.stringify(project, null, 2)}\n`, "utf8");
          await runRenderer(timingPath, outputPath, previewPath);

          sendJson(res, 200, {
            videoUrl: `/public/video-assets/consonant-lesson-samples/${slug}-timed-lesson.mp4`,
            previewUrl: `/public/video-assets/consonant-lesson-samples/${slug}-timed-lesson-preview.jpg`,
            output: path.relative(ROOT, outputPath).replaceAll(path.sep, "/"),
            preview: path.relative(ROOT, previewPath).replaceAll(path.sep, "/"),
          });
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : "Render failed" });
        }
      });
    },
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Timing payload is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid timing JSON"));
      }
    });
    req.on("error", reject);
  });
}

function safeSlug(value) {
  if (typeof value !== "string" || !/^[a-z0-9-]+$/i.test(value)) {
    throw new Error("Timing project needs a safe id");
  }
  return value;
}

function validateProject(project, slug) {
  if (!project || typeof project !== "object") {
    throw new Error("Timing project is required");
  }
  if (!project.id && !project.render?.outputSlug) {
    throw new Error("Timing project id is required");
  }
  if (!Number.isFinite(project.segment?.start) || !Number.isFinite(project.segment?.end)) {
    throw new Error("Timing project segment start and end are required");
  }
  if (project.segment.end <= project.segment.start) {
    throw new Error("Timing project segment end must be after start");
  }
  project.render = {
    ...(project.render || {}),
    outputSlug: slug,
    timingFile: `${slug}-card-timings.json`,
  };
}

function runRenderer(timingPath, outputPath, previewPath) {
  const runtime = findBundledRuntime();
  const python = process.env.TIMING_RENDER_PYTHON || process.env.PYTHON || runtime.python || "python";
  const env = { ...process.env };
  if (runtime.bin) {
    env.PATH = `${runtime.bin}${path.delimiter}${env.PATH || ""}`;
  }
  const child = spawn(
    python,
    [
      RENDER_SCRIPT,
      "--timings",
      timingPath,
      "--output",
      outputPath,
      "--preview",
      previewPath,
      "--preview-time",
      "20.8",
    ],
    { cwd: ROOT, env, windowsHide: true },
  );

  return new Promise((resolve, reject) => {
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `Renderer exited with code ${code}`));
    });
  });
}

function findBundledRuntime() {
  const home = process.env.USERPROFILE || process.env.HOME;
  if (!home) {
    return {};
  }

  const root = path.join(home, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies");
  const python = path.join(root, "python", process.platform === "win32" ? "python.exe" : "bin/python");
  const bin = path.join(root, "bin");
  return {
    python: existsSync(python) ? python : null,
    bin: existsSync(bin) ? bin : null,
  };
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

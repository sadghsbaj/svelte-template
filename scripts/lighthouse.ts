/**
 * @file lighthouse.ts
 * Automated Lighthouse audit runner that starts a background preview server,
 * executes Lighthouse in headless Chrome (Mobile or Desktop), and generates
 * structured Markdown and HTML reports in dist/analysis/.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { build, preview } from "vite";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const DIST_DIR = path.resolve(PROJECT_ROOT, "dist");
const ANALYSIS_DIR = path.resolve(DIST_DIR, "analysis");

// ANSI Terminal Colors
const RED = "\u{1B}[1;31m";
const GREEN = "\u{1B}[1;32m";
const YELLOW = "\u{1B}[1;33m";
const BLUE = "\u{1B}[1;34m";
const CYAN = "\u{1B}[1;36m";
const BOLD = "\u{1B}[1m";
const RESET = "\u{1B}[0m";

function logInfo(msg: string): void {
    console.log(`${BLUE}[INFO]${RESET} ${msg}`);
}

function logSuccess(msg: string): void {
    console.log(`${GREEN}[SUCCESS]${RESET} ${msg}`);
}

function logError(msg: string): void {
    console.error(`${RED}[ERROR]${RESET} ${msg}`);
}

function getGitInfo(): string {
    try {
        const hash = execSync("git rev-parse --short HEAD", {
            stdio: ["ignore", "pipe", "ignore"],
        })
            .toString()
            .trim();
        const branch = execSync("git rev-parse --abbrev-ref HEAD", {
            stdio: ["ignore", "pipe", "ignore"],
        })
            .toString()
            .trim();
        const isDirty =
            execSync("git status --porcelain", {
                stdio: ["ignore", "pipe", "ignore"],
            })
                .toString()
                .trim().length > 0;
        return `\`${hash}\` (branch: \`${branch}\`${isDirty ? ", dirty" : ", clean"})`;
    } catch {
        return "N/A";
    }
}

function formatScore(score: number | null | undefined): {
    text: string;
    ansi: string;
    badge: string;
} {
    if (score === null || score === undefined) return { text: "N/A", ansi: "N/A", badge: "⚪ N/A" };
    const num = Math.round(score * 100);
    const padded = String(num).padStart(3, " ");

    if (num >= 90) {
        return {
            text: `${padded}/100 [PASS]`,
            ansi: `${GREEN}${padded}/100 [PASS]${RESET}`,
            badge: `✅ \`${num}/100\` PASS`,
        };
    }
    if (num >= 50) {
        return {
            text: `${padded}/100 [WARN]`,
            ansi: `${YELLOW}${padded}/100 [WARN]${RESET}`,
            badge: `⚠️ \`${num}/100\` WARN`,
        };
    }
    return {
        text: `${padded}/100 [FAIL]`,
        ansi: `${RED}${padded}/100 [FAIL]${RESET}`,
        badge: `❌ \`${num}/100\` FAIL`,
    };
}

async function ensureBuild(): Promise<void> {
    const indexPath = path.resolve(DIST_DIR, "index.html");
    if (!fs.existsSync(indexPath)) {
        logInfo("Production build not found. Running vite build...");
        await build();
    }
}

async function runAudit(): Promise<void> {
    const isDesktop = process.argv.includes("--desktop") || process.argv.includes("-d");
    const modeLabel = isDesktop ? "Desktop" : "Mobile (Simulated)";

    fs.mkdirSync(ANALYSIS_DIR, { recursive: true });

    await ensureBuild();

    logInfo("Starting background preview server...");
    const server = await preview({
        root: PROJECT_ROOT,
        preview: {
            port: 0,
            host: "127.0.0.1",
        },
    });

    const localUrl = server.resolvedUrls?.local?.[0] || "http://127.0.0.1:4173/";
    logInfo(`Preview server running at ${localUrl}`);

    let chrome: chromeLauncher.LaunchedChrome | undefined;

    try {
        logInfo(`Launching headless Chrome (Mode: ${modeLabel})...`);
        chrome = await chromeLauncher.launch({
            chromeFlags: [
                "--headless=new",
                "--no-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
            ],
        });

        logInfo("Executing Lighthouse audit (Performance, Accessibility, Best Practices, SEO)...");
        const runnerResult = await lighthouse(localUrl, {
            port: chrome.port,
            output: ["html", "json"],
            logLevel: "error",
            onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
            ...(isDesktop && { preset: "desktop" }),
        });

        if (!runnerResult || !runnerResult.lhr) {
            throw new Error("Lighthouse audit returned no results.");
        }

        const { lhr, report } = runnerResult;
        const htmlReport = Array.isArray(report) ? report[0] : (report as string);

        // Save HTML report
        const htmlReportPath = path.resolve(ANALYSIS_DIR, "lighthouse_stats.html");
        fs.writeFileSync(htmlReportPath, htmlReport, "utf8");

        // Extract Categories
        const perfScore = lhr.categories.performance?.score;
        const a11yScore = lhr.categories.accessibility?.score;
        const bpScore = lhr.categories["best-practices"]?.score;
        const seoScore = lhr.categories.seo?.score;

        const perf = formatScore(perfScore);
        const a11y = formatScore(a11yScore);
        const bp = formatScore(bpScore);
        const seo = formatScore(seoScore);

        // Extract Core Web Vitals
        const fcp = lhr.audits["first-contentful-paint"]?.displayValue || "N/A";
        const lcp = lhr.audits["largest-contentful-paint"]?.displayValue || "N/A";
        const tbt = lhr.audits["total-blocking-time"]?.displayValue || "N/A";
        const cls = lhr.audits["cumulative-layout-shift"]?.displayValue || "N/A";
        const si = lhr.audits["speed-index"]?.displayValue || "N/A";
        const tti = lhr.audits["interactive"]?.displayValue || "N/A";

        // Extract Opportunities / Issues with score < 1
        const opportunities: string[] = [];
        for (const audit of Object.values(lhr.audits)) {
            if (
                audit.score === null ||
                audit.score >= 1 ||
                audit.scoreDisplayMode === "notApplicable" ||
                audit.scoreDisplayMode === "informative" ||
                !audit.title
            ) {
                continue;
            }

            const display = audit.displayValue ? ` (${audit.displayValue})` : "";
            const firstSentence = audit.description ? audit.description.split(".", 1)[0] : "";
            opportunities.push(`- **[${audit.title}]**${display}: ${firstSentence}`);
        }

        // Generate Markdown Report
        const now = new Date().toISOString().replaceAll("T", " ").slice(0, 19);
        const gitInfo = getGitInfo();

        const mdLines: string[] = [
            `# 🚦 Lighthouse Audit Report (${modeLabel})`,
            "",
            `- **Git Commit**: ${gitInfo}`,
            `- **Generated At**: \`${now} UTC\``,
            `- **Target URL**: \`${localUrl}\``,
            `- **Lighthouse Version**: \`${lhr.lighthouseVersion}\``,
            `- **Interactive Report**: [\`lighthouse_stats.html\`](./lighthouse_stats.html)`,
            "",
            "## 🏆 Category Scores",
            "",
            "| Category | Score | Status |",
            "| :--- | :--- | :--- |",
            `| **Performance** | \`${perf.text.trim()}\` | ${perf.badge} |`,
            `| **Accessibility** | \`${a11y.text.trim()}\` | ${a11y.badge} |`,
            `| **Best Practices** | \`${bp.text.trim()}\` | ${bp.badge} |`,
            `| **SEO** | \`${seo.text.trim()}\` | ${seo.badge} |`,
            "",
            "## ⚡ Core Web Vitals & Key Metrics",
            "",
            "| Metric | Value |",
            "| :--- | :--- |",
            `| First Contentful Paint (FCP) | \`${fcp}\` |`,
            `| Largest Contentful Paint (LCP) | \`${lcp}\` |`,
            `| Total Blocking Time (TBT) | \`${tbt}\` |`,
            `| Cumulative Layout Shift (CLS) | \`${cls}\` |`,
            `| Speed Index (SI) | \`${si}\` |`,
            `| Time to Interactive (TTI) | \`${tti}\` |`,
            "",
        ];

        if (opportunities.length > 0) {
            mdLines.push(
                "## 💡 Improvement Opportunities & Diagnostics",
                "",
                ...opportunities.slice(0, 15),
                ""
            );
        } else {
            mdLines.push(
                "## 💡 Improvement Opportunities & Diagnostics",
                "",
                "> [!TIP]",
                "> All core audit checks passed cleanly with 100% score!",
                ""
            );
        }

        const mdContent = mdLines.join("\n");
        const mdReportPath = path.resolve(ANALYSIS_DIR, "lighthouse_stats.md");
        fs.writeFileSync(mdReportPath, mdContent, "utf8");

        // Clean Terminal Output
        console.log(
            `\n${BOLD}${CYAN}==========================================================================${RESET}`
        );
        console.log(
            `${BOLD}                       LIGHTHOUSE AUDIT RESULTS (${modeLabel})             ${RESET}`
        );
        console.log(
            `${BOLD}${CYAN}==========================================================================${RESET}`
        );
        console.log(`  Git Commit    : ${gitInfo.replaceAll("`", "")}`);
        console.log(`  ${BOLD}Performance   :${RESET} ${perf.ansi}`);
        console.log(`  ${BOLD}Accessibility :${RESET} ${a11y.ansi}`);
        console.log(`  ${BOLD}Best Practices:${RESET} ${bp.ansi}`);
        console.log(`  ${BOLD}SEO           :${RESET} ${seo.ansi}`);
        console.log(
            `${CYAN}--------------------------------------------------------------------------${RESET}`
        );
        console.log(`  FCP: ${fcp} │ LCP: ${lcp} │ TBT: ${tbt} │ CLS: ${cls}`);
        console.log(
            `${CYAN}==========================================================================${RESET}`
        );

        logSuccess("Lighthouse reports generated:");
        logInfo(` - ${mdReportPath}`);
        logInfo(` - ${htmlReportPath}\n`);
    } finally {
        if (chrome) {
            try {
                chrome.kill();
            } catch {
                // Ignore kill errors
            }
        }
        await server.close();
    }
}

try {
    await runAudit();
} catch (error: unknown) {
    logError(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
}

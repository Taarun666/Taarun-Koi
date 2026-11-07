const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

async function ghJson(args) {
  const { stdout } = await execFileAsync("gh", args, {
    maxBuffer: 1024 * 1024 * 32,
  });
  return JSON.parse(stdout);
}

const CONTRIBUTIONS_QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function collectContributions(login) {
  const data = await ghJson([
    "api", "graphql",
    "-f", `query=${CONTRIBUTIONS_QUERY}`,
    "-f", `login=${login}`,
  ]);
  const calendar = data.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = days.find((day) => day.date === today);
  return {
    totalContributions: calendar.totalContributions,
    todayContributions: todayEntry ? todayEntry.contributionCount : 0,
  };
}

async function collectTopLanguage(login) {
  const repos = await ghJson([
    "api", `users/${login}/repos?type=owner&per_page=100`,
  ]);
  const ownRepos = repos.filter((repo) => !repo.fork && !repo.archived);

  const bytesByLanguage = {};
  for (const repo of ownRepos) {
    let languages;
    try {
      languages = await ghJson(["api", `repos/${login}/${repo.name}/languages`]);
    } catch {
      continue; // Skip repos we can't read (e.g. empty or removed mid-run).
    }
    for (const [language, bytes] of Object.entries(languages)) {
      bytesByLanguage[language] = (bytesByLanguage[language] || 0) + bytes;
    }
  }

  let topLanguage = null;
  let topBytes = -1;
  for (const [language, bytes] of Object.entries(bytesByLanguage)) {
    if (bytes > topBytes) {
      topLanguage = language;
      topBytes = bytes;
    }
  }

  return { topLanguage, bytesByLanguage };
}

async function collectAccountSnapshot(login) {
  const [contributions, languages] = await Promise.all([
    collectContributions(login),
    collectTopLanguage(login),
  ]);
  return { login, ...contributions, ...languages };
}

module.exports = { collectAccountSnapshot };

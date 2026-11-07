const { collectAccountSnapshot } = require("./collect");
const { renderKoi } = require("./render");

function input(name, fallback) {
  const value = process.env[`INPUT_${name.toUpperCase()}`];
  return value && value.length > 0 ? value : fallback;
}

async function main() {
  const login = input("login", process.env.GITHUB_REPOSITORY_OWNER);
  const outputDir = input("output-dir", "koi");

  if (!login) {
    throw new Error("No login given, and GITHUB_REPOSITORY_OWNER is unset.");
  }

  const snapshot = await collectAccountSnapshot(login);
  const result = renderKoi(snapshot, outputDir);

  console.log(
    `Drew ${login}'s koi: ${snapshot.totalContributions} contributions, ` +
      `top language ${snapshot.topLanguage || "none"} (${result.bodyColor}), ` +
      `${snapshot.todayContributions} today -> ${result.gifPath}`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

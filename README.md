# Taarun-Koi

Taarun-Koi draws a pixel-art koi from a GitHub account's public activity. Its
languages color it, its contributions grow it, its streaks mark it, and the day
that just ended decides how it swims. A nightly workflow puts the koi on a
profile README as a looping GIF, and the same tool runs from the command line.

This is a fork of [git-koi](https://github.com/yalongwastaken/git-koi) by
Anthony Yalong, used unmodified under its MIT license — see
[NOTICE.md](NOTICE.md). It is not published separately on crates.io; the
`documentation` link below points at the upstream crate's docs, which still
describe this code.

<p align="center">
  <img src="https://raw.githubusercontent.com/yalongwastaken/yalongwastaken/main/koi/koi.gif" width="256" alt="The author's koi, redrawn every night from the day's activity" />
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/bodies-dark.png" />
  <img src="docs/bodies-light.png" alt="The six bodies, white, black, Asagi, tea, gold, and platinum, at each growth stage" />
</picture>

## Repository Structure

```text
.
├── .github/      workflows, issue forms, and Dependabot
├── docs/         the getting-started guide and the render sheets
├── examples/     the profile workflow and the koi library generator
├── src/          the library and the git-koi command
├── tests/        the public-boundary tests and their fixtures
└── action.yml    the GitHub Action
```

## Usage

### Requirements

- For a koi on your profile README: a GitHub account. The Action runs in your
  profile repository's workflow with its built-in token.
- For the command line: a binary from the
  [releases page](https://github.com/taarun666/Taarun-Koi/releases), or Rust
  at or above the `rust-version` in [Cargo.toml](Cargo.toml), plus the
  [GitHub CLI](https://cli.github.com), authenticated.
- For the library: Rust at or above that same version.

[docs/getting-started.md](docs/getting-started.md) walks through all three: the
Action in a profile workflow, the command line, and the library. The API is
documented on [docs.rs](https://docs.rs/git-koi).

## Author

**Anthony Yalong** wrote the original `git-koi`.

- Email: yalong.anthony123@gmail.com
- GitHub: [@yalongwastaken](https://github.com/yalongwastaken)

This fork is maintained by **Taarun** ([@taarun666](https://github.com/taarun666)).

## License

MIT, unchanged from upstream. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).

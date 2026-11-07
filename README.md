# Taarun-Koi

A GitHub Action that draws a pixel-art koi fish from a GitHub account's public
activity, as a looping GIF for a profile README.

- **Size** grows with the account's total public contributions.
- **Color** is set by the account's most-used programming language (by bytes
  across its public, non-fork repositories).
- **Swim speed** picks up with the day's contribution count.

<p align="center">
  <img src="docs/koi-preview.gif" width="336" alt="Example koi" />
</p>

## Usage

Copy [examples/profile-workflow.yml](examples/profile-workflow.yml) into your
GitHub profile repository (the one named after your username, e.g.
`octocat/octocat`) as `.github/workflows/koi.yml`, then embed the GIF in that
repository's `README.md`:

```html
<img src="koi/koi.gif" width="336" alt="My koi" />
```

Run the workflow once from the Actions tab so the first koi appears
immediately, rather than waiting for the nightly schedule.

### Inputs

| Input        | Default               | Meaning                                         |
| ------------ | ---------------------- | ------------------------------------------------ |
| `login`      | The repository owner   | Account whose koi to draw                        |
| `output-dir` | `koi`                  | Folder that receives `koi.gif` and `preview.html` |
| `token`      | The built-in token     | Token for reading the account's public data       |

## How it works

`src/collect.js` reads public data through the GitHub CLI (`gh`, preinstalled
on GitHub-hosted runners): the account's daily contribution calendar, and the
language byte totals across its public, non-fork repositories. `src/sprite.js`
draws a fixed pixel-art koi shape; `src/render.js` scales it by total
contributions, colors it by top language, and encodes a two-frame swimming
loop as a GIF with [`gifenc`](https://www.npmjs.com/package/gifenc), timed by
the day's contribution count.

## License

MIT. See [LICENSE](LICENSE).

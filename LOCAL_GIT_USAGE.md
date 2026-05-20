# Local Git Usage

This local folder uses `git-data` as the Git metadata directory because macOS blocked writes to a normal hidden `.git` directory in this workspace.

Use this command pattern in this local folder:

```bash
git --git-dir=git-data --work-tree=. status
```

When this repository is pushed to GitHub and cloned normally, it will behave like a regular Git repository.

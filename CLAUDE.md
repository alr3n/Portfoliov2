# Git workflow

GitHub is the single source of truth for this project.

Repository: https://github.com/alr3n/Portfoliov2.git

After every completed task, automatically (without asking first):

1. Stage the relevant modified files.
2. Commit in logical groups — one commit per feature/fix/refactor, never a single
   generic "update everything" commit. Commit messages must be descriptive and
   specific to the files/change involved (not "update project", "bug fixes", etc.).
3. Push to `origin` immediately.

Only stop and ask the user if something blocks the push: authentication failure,
merge conflict, protected branch rejection, or similar.

# .studio

This folder was created by [soroush.studio](https://soroush.studio). It holds what the studio's
agent reads about this app; edit and commit it like any other file.

- `settings.json` - the studio's settings for this app: where the files below are (`paths`) and
  how the agent works (`ai`: `model`, `memory`, `maxSteps`, `language`).
- `agents.md` - how the agent should work on this app.
- `design.md` - the app's design-system rules, kept short. The agent reads it whole every time.
- `memory/` - decisions made while designing, one file each. The agent lists them and reads the
  ones it needs; it writes one when you decide something it should keep to, and changes or removes
  it when you change your mind. Each starts with its `name` and a one-line `description`.

# Running RepoMind (local & Docker)

## Using nvm (recommended)

1. Install nvm if needed:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

2. Use the repository's Node version:

```bash
cd /path/to/repo
nvm install
nvm use
node -v  # should be >= 20.9.0
npm install
npm run dev
```

## Using Docker

Build and run:

```bash
docker build -t repomind .
docker run --rm -it -p 3000:3000 -v "$PWD":/app -w /app repomind
```

Open http://localhost:3000

## Notes
- `.nvmrc` specifies `20.9.0`. Use `nvm install` to match it.
- `.env.local` contains placeholders; copy `.env.example` and fill secrets as needed.

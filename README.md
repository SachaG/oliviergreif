# oliviergreif.com

A pnpm workspace with three packages:

- `site/`: the static Astro site, deployed to GitHub Pages by `.github/workflows/deploy.yml`
- `admin/`: a password-protected app for editing concerts and actualités, deployed to Render (`render.yaml`)
- `shared/`: the content schemas and locale list used by both

## Commands

Run from the repository root:

| Command | Action |
| --- | --- |
| `pnpm install` | Install all packages |
| `pnpm dev` | Site at `localhost:4321` |
| `pnpm build` | Check and build the site to `site/dist/` |
| `pnpm dev:admin` | Admin at `localhost:4322` |
| `pnpm build:admin` | Check and build the admin |

## Content

Concerts and actualités are stored one YAML file per entry in `site/src/data/concerts/` and `site/src/data/actualites/`. Text fields have one value per language (`fr` is required, `en` is optional and falls back to French). Their schemas are in `shared/src/schemas.ts`.

`concerts-full.yml` and `actualites-full.yml` are the original single-file versions, kept for reference. They aren't loaded by the site and aren't updated by the admin.

## Admin

The admin edits the YAML files through the GitHub API: every save is a commit to `main`, which triggers the site's deploy. There is one shared password and no database.

Locally, copy `admin/.env.example` to `admin/.env`. Without a `GITHUB_TOKEN`, the admin edits the files in your checkout directly instead of committing to GitHub.

### Deploying to Render

1. Create a fine-grained GitHub token at github.com → Settings → Developer settings → Fine-grained tokens:
   - Repository access: only `SachaG/oliviergreif`
   - Permissions: Contents → Read and write
   - These tokens expire (one year at most): set a reminder to renew it.
2. In Render, create a new Blueprint from this repository. It reads `render.yaml`.
3. Set `ADMIN_PASSWORD` (long and random) and `GITHUB_TOKEN` in the service's environment. `SESSION_SECRET` is generated automatically.

Changing `ADMIN_PASSWORD` signs everyone out.

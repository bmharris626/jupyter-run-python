# Versioning Plan

This project uses Semantic Versioning (`MAJOR.MINOR.PATCH`).

- `MAJOR`: breaking changes to commands, settings schema, or behavior contracts.
- `MINOR`: new backwards-compatible features (new options, improved flows).
- `PATCH`: backwards-compatible fixes, test-only updates, and docs corrections.

## Initial release approach

- `0.1.0`: first MVP-capable release during active build-out.
- `0.2.x`: iterative feature hardening and UX improvements before stable.
- `1.0.0`: stable release once MVP definition-of-done items are fully validated.

## Release checklist (lightweight)

1. Update `CHANGELOG.md` for the release.
2. Bump `package.json` version.
3. Run `npm run lint && npm run typecheck && npm run build && npm test`.
4. Ensure CI is green.
5. Tag release in git (`vX.Y.Z`).

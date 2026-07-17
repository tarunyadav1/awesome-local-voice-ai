# Contributing

This catalog is useful only when a reader can trace a claim to its source. New projects, corrections, runtime reports, and benchmark results are welcome.

## Before opening a pull request

A project must:

1. Run inference on hardware controlled by the user.
2. Publish enough code or artifacts for someone else to reproduce a local run.
3. Perform a voice or speech task covered by the catalog.
4. Link to the original repository or model card.
5. State both the code license and the model-weight license. Use `Varies` or `Unknown` when the source is unclear.

Popularity and star count are not requirements.

## Add or correct an entry

Edit `data/catalog.json`. Do not edit the generated table in `README.md` or the generated `site/catalog.json` file by hand.

Then run:

```bash
npm run generate
npm run check
```

Your pull request should include the generated files. For a simple correction, link the source that proves the change.

## Evidence rules

Prefer these sources, in order:

1. The original repository and its license file
2. The publisher's model card
3. The project documentation or paper
4. A maintained runtime repository for platform support

Do not use a search snippet, generated summary, repost, or third-party directory as the only evidence.

## Verification upgrades

Do not mark an entry `runtime-reproduced` without attaching a report that contains:

- Model and revision
- Runtime and revision
- Operating system and hardware
- Install command or environment file
- Prompt, language, wall time, and peak memory when available
- Output artifact or a stable link to it

Use `benchmark-reproduced` only after following [the benchmark protocol](docs/BENCHMARK.md).

## Consent and safety

Only submit cloned-voice samples when the speaker gave informed permission for that specific use. Do not attach biometric voice data from a public figure, private person, or dataset whose consent terms are unclear.

## App listings and affiliations

Apps must make a checkable local-processing claim. Paid apps are allowed. Contributors must disclose employment, ownership, sponsorship, or another material relationship in `maintainer_affiliation` and in the pull request.

## Review

Maintainers may ask for a narrower claim, a better license source, or an `unknown` value. That is preferable to guessing. Entries can be removed when their artifacts disappear or their stated terms no longer match the catalog.

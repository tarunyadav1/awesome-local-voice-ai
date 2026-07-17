# Methodology

The catalog records what can be supported by linked evidence. It does not rank projects by hype, GitHub stars, or a single audio sample.

## Sources

Each entry starts with the original repository, publisher model card, and license files. Platform claims may also cite a maintained runtime such as MLX-Audio, FluidAudio, or sherpa-onnx.

A first-party source review checks:

- Supported voice tasks
- Published language coverage
- Parameter count or release size
- Streaming claim
- Supported local targets
- Code license
- Checkpoint or weight license
- Restrictions noted by the publisher

The review date is stored in the data. It is not a promise that the upstream project has remained unchanged since that date.

## Verification levels

### Source reviewed

A maintainer read the linked first-party sources. No local execution is implied.

### Runtime reproduced

A maintainer completed a local inference run and retained an environment report. The label applies to that recorded combination of model, revision, runtime, hardware, and operating system.

### Benchmark reproduced

A maintainer completed the repository's benchmark protocol and retained the audio and measurements. Results from different hardware or model revisions should not be treated as directly interchangeable.

## No quality score yet

Speech quality is language, speaker, text, and listener dependent. A neat one-number leaderboard would conceal those choices. The first release therefore exposes factual filters and publishes a benchmark protocol instead of assigning unsupported scores.

When enough consent-cleared runs exist, the site can show separate latency, memory, intelligibility, and listening results with hardware and revision attached.

## Corrections

Open a correction issue with the field, current value, proposed value, and a first-party source. License corrections are treated as urgent because they can change whether a deployment is lawful.

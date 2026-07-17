# Local benchmark protocol

This protocol is designed to make local runs inspectable, not to crown one universal winner.

## Required report

Record:

- Model name, checkpoint, and exact revision
- Runtime name and exact revision
- Hardware, memory, operating system, and relevant driver versions
- Precision and quantization
- Cold-start time
- Time to first audio when streaming is available
- Total synthesis time and output duration
- Peak resident memory or accelerator memory
- Every prompt and random seed

Report real-time factor as `synthesis seconds / output seconds`. Values below 1 mean faster-than-real-time synthesis.

## Prompt set

Use text whose redistribution is clear. The starter English set is:

1. `The small copper clock kept perfect time through the quiet winter night.`
2. `Please send the revised report by 4:35 p.m. on Tuesday, October 14.`
3. `A curious engineer asked, "Can this tiny device speak clearly without a network connection?"`
4. `Dr. Rivera bought 2.75 kilograms of tea for $18.40, then walked six blocks home.`
5. `Rain tapped the window softly; inside, everyone waited for the final train announcement.`

Language-specific prompt sets should test native numbers, dates, names, punctuation, and sentence rhythm. Add the exact text and its provenance to the report.

## Voice cloning

Use only a speaker who gave informed permission for the benchmark and publication of the generated samples. Record the reference duration and transcription. Do not place the reference recording in this repository unless its license and consent allow redistribution.

## Listening tests

Keep intelligibility, naturalness, speaker similarity, and preference as separate questions. Randomize sample order and hide model names from listeners. Publish the number of listeners and the scoring scale. Do not compare results collected with different questions as if they were one study.

## Submission format

Benchmark submissions should add a dated report under a future `benchmarks/` directory and link its artifacts. The catalog label changes only after a maintainer checks the report for completeness.

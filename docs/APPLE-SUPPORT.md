# Apple support labels

Apple support is not a single yes-or-no field. A Python project running through MPS on a Mac is different from a Swift package that can ship inside an iPhone app.

## Labels

- `upstream`: the original project documents an Apple path such as MPS or CPU execution.
- `verified-runtime`: a maintained local runtime lists an implementation for the model family, such as MLX-Audio, FluidAudio, or sherpa-onnx.
- `community-port`: a separate community project provides the Apple implementation.
- `unverified`: no maintained Apple path was found during source review.
- `not-supported`: upstream explicitly excludes the target.

The evidence link says why the label was assigned. It does not mean this catalog's maintainers reproduced that path unless the verification level also says `runtime-reproduced`.

## Shipping on iPhone or iPad

Before choosing a model, check binary size, peak memory, tokenizer and phonemizer dependencies, first-run download behavior, background execution, and every bundled voice license. A working Mac command is not proof that an App Store build is practical.

# Changelog

All notable changes to this project will be documented in this file.

## [Next]

### Added

- `Validation<E, T>` applicative — accumulates errors across independent validations instead of short-circuiting on the first failure (unlike `Either`)

### Changed

- **BREAKING** `EitherV<E, T>` renamed to `EitherValue<E, T>`.
- **BREAKING** `OptionV<T>` renamed to `OptionValue<T>`.

## [0.0.1](https://github.com/pwlmc/okfp/compare/v0.0.0...v0.0.1) - 2026-02-21

### Added

- Initial release of `ok-fp`.
- `Option` type with `some`, `none`, `map`, `flatMap`, and related utilities.
- `Either` type with `right`, `left`, `map`, `flatMap`, and related utilities.

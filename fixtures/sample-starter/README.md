# Starter: StringCalculator

A tiny C# console app to practise test-driven development.

## Task

Implement `StringCalculator`:

1. `Add("")` returns `0`
2. `Add("1")` returns `1`
3. `Add("1,2")` returns `3`
4. `Add` handles newlines as separators: `Add("1\n2,3")` returns `6`
5. `Add` rejects negatives with `Exception: "negatives not allowed: -1,-2"`

## Getting started

```bash
dotnet build
dotnet test
dotnet run
```

Open this folder in Cursor or VS Code, or `practice-drill.sln` in Visual Studio.

## Submission

Zip the **whole solution folder** (not just `Program.cs`) and upload it in the app.

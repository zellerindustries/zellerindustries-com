---
name: webdesign-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
argument-hint: <file-or-pattern>
metadata:
  author: vercel
  version: '1.0.0'
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## Findings Ledger

Open findings from past full-site audits are tracked in
`.claude/webdesign-guidelines-findings.md` instead of being re-derived from scratch each time.

- On a **full-site review** ("review the whole project", "audit everything"): after producing
  findings, write/update the ledger — mark items fixed that no longer reproduce, add newly found
  items, leave everything else as-is. Report only the diff (newly found, newly fixed) plus a
  reference to the ledger for the full open list — not the entire re-scanned output.
- On a **scoped review** (specific files/pattern given): just report findings for those files,
  don't touch the ledger unless the reviewed files overlap with existing ledger entries (then
  update just those entries).
- If the user asks "what's outstanding" / "show me the errors": read the ledger directly, don't
  re-run the audit.

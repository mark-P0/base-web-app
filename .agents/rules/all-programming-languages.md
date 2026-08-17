- Functions: Prefer returning variables instead of expressions directly
- Prefer NOT using unclear variable names, e.g. single characters, abbreviations
	- If unavoidable, they must have a clear, documented reason why
- Try to sort imports of source code files
- Prefer NOT writing one-liners
	- Readability is preferred over concision and cleverness

## Ponytail rules

<!-- Source: https://github.com/dietrichgebert/ponytail -->

The following is a modified list of "ponytail" rules.

When writing code, go through each of them, and STOP at the first item that holds true:

- Does this need to exist?    → no: skip it (YAGNI)
- Already in this codebase?   → reuse it, don't rewrite
- Stdlib present and does it? → use it
- Native platform feature?    → use it
- Installed dependency?       → use it
- Only then: the minimum that works
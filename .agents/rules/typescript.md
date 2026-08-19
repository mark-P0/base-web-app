- Prefer `type` over `interface`
- Define types at the top of the files
	- Prefer inferring and/or in-lining types over explicit type definitions
- Consider the pattern `x satisfies never` as debug code. It serves as marker for lines that need to be dealt with later so that the type checker can notify about it
- Functions with single object argument: Prefer `args` name. Define type inline with function definition. Destructure `args` in function body.
- In tab auto-complete: append `satisfies never` when completing console expressions, e.g. `console.warn`, `console.debug`
- Prefer function declarations (`function doSomething() {}`) over arrow functions (`const doSomething = () => {}`)
  - Arrow functions are preferred in cases like the following:
    - As callback args, e.g. in `Array.map()`
    - React effect cleanup function
- Prefer actual if/else over ternaries. If verbose, wrap if/else sequence in an arrow function, maybe even an IIFE.
- Prefer inferring function return type over explicit hint. If type hinting is required, type hint the returned variable instead
- Prefer implicit falsy checks
	- e.g. for a `value` of type `T | null`, check if it has an actual value by `!value`, NOT `value !== null`. Same for types `T | undefined` and `T | null | undefined`
	- The exception is when the type includes a valid falsy value. For example, if value is `number | null` and `0` is valid, explicitly exclude the valid falsy value: `!value && value !== 0`. Same for strings `!value && value !== ''`.
	- Exception can also apply to booleans, but consider that most of the time, `false` `null` and `undefined` should refer to the same thing
- Prefer nullish operator `??` whenever applicable
	- This overrides the "implicit falsy check" preference above

- Prefer NOT writing a types file
	- Types must be defined in the "domain" file in which it is most relevant
	- If must be used elsewhere, the types should be exported from that "domain" file
	- If this leads to circular imports, only then can a dedicated types file be written
- Prefer NO type casts
	- If unavoidable, add a comment explaining so
	- If possible, keep type casts to a single location
- Prefer runtime type schemas over manual checking of types and object shapes
	- e.g. Zod schemas

## General file structure

```ts
// imports at the top, sorted, no empty lines in between
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// define types at the top as well

export type User = {
  id: string;
  name: string;
};

export type UserSummary = {
  id: string;
  displayName: string;
};

// define runtime type schemas after the types, before other constants
// consider them in the same "class" as types

export const UserInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

// define constants here near the top

export const DEFAULT_USER_FILE_PATH = "./default-user.json";
export const DEFAULT_USER_NAME = "Unknown";
export const USER_FILE_ENCODING = "utf8";

// define functions after the constants, before any of them are used, despite hoisting

export function createUser(args: { user: Partial<User> }) {
  const { user } = args;
  const createdUser: User = {
    id: user.id ?? randomUUID(),
    name: user.name ?? DEFAULT_USER_NAME,
  };

  return createdUser;
}

export function createUserSummary(args: { user: User }) {
  const { user } = args;
  const userSummary: UserSummary = {
    id: user.id,
    displayName: user.name.trim(),
  };

  return userSummary;
}

export async function loadUser(args: { filePath: string }) {
  const { filePath } = args;
  const absoluteFilePath = path.resolve(filePath);
  const fileContent = await readFile(absoluteFilePath, USER_FILE_ENCODING);
  const parsedValue: unknown = JSON.parse(fileContent);
  const parsedUser = UserInputSchema.parse(parsedValue);
  const loadedUser = createUser({ user: parsedUser });

  return loadedUser;
}

export async function loadUserSummary(args: { filePath: string }) {
  const { filePath } = args;
  const user = await loadUser({ filePath });
  const userSummary = createUserSummary({ user });

  return userSummary;
}

async function loadDefaultUser() {
  const defaultUser = await loadUser({
    filePath: DEFAULT_USER_FILE_PATH,
  });

  return defaultUser;
}

// general logic and actual running code here, if any

const user = await loadUser({
  filePath: DEFAULT_USER_FILE_PATH,
});

const userSummary = createUserSummary({ user });

if (userSummary.displayName === DEFAULT_USER_NAME) {
  console.warn("The user name was not set.");
}

// default exports are discouraged; prefer named exports as above
// if a default export is necessary, it must be at the very bottom. the definition must be referenced only, not in-lined here
export default loadDefaultUser;
```

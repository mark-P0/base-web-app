- Prefer functional components over classical components
	- Regular Typescript rules apply, e.g. prefer function declarations
- About component props
	- Regular Typescript rules apply, e.g. use a single named `props` argument, define prop types inline, destructure props inside component body
- Do not be afraid to return null for components
	- This is handy for "defensive" rendering, e.g. components that depend on a value but is currently missing
	- This is also useful for "variants" rendering, e.g. if a component is a "gateway" for several other components
- `useEffect()` hooks
	- As much as possible, define effect hooks as a custom hook function so that it is properly named
	- Prefer splitting effects into several calls instead of putting all logic into one
- General component structure: As much as possible, components should have the following structured order
	- Props destructure, if any
	- Hooks. These should also be ordered as much as possible from general to specific. For example:
		- The most general hooks are the ones that come from framework dependencies, e.g. Next.js `useRouter()`
		- Then are the application's custom hooks, likely those that are shared by components across several domains
		- Next are domain hooks. These are shared by components within the same domain
			- Boundary store hooks would fall under this
		- Last are hooks specific only to the component, like `useState()`
			- Some library hooks would fall under this like `useScroll()`, `useIntersectionObserver()`
		- `useEffect()` hooks should be called at the last here if they do not depend on derived values
	- Derived values, e.g. coming from the props and/or hooks
		- Derived values used by effects may be defined before them
	- `useEffect()` hooks
		- Many effect hooks use not only the props and other hook values, but also derived values as dependencies
		- In such situations, they may be defined after the lines of derived values
		- However, if the effect hooks do not use any of the derived values, they must be called at the end of the lines of hooks
		- As much as possible, group all `useEffect()` calls together.
	- Internal callbacks, likely those used by the markup below
		- Regular Typescript rules apply, e.g. prefer function declarations
		- If callbacks are brief enough, they may be even defined inline with the markup
	- Markup. At the very last because components return markup
		- Conditional rendering should also be done as last as possible
- Component structure of components with variants
	- As much as possible these components should be kept light. Ideally they will only take props and conditionally render based on those props. But if they must contain internal logic as well, the general component structure should still be applied
	- Each variant should be accounted for with an `if` call
		- Regular Typescript rules apply, e.g. prefer `if` over `switch` and ternaries
	- The "default" return of such components should be `null`
		- If all variants are properly accounted for, this should be unreachable

- Files that primarily export a component should be named after a that component
	- e.g. a file that primarily exports a `ThemeToggle` component should be named `ThemeToggle.tsx`
	- In general, this means that all `*.tsx` files must be named after their primary component export

## Example component

```tsx
function Component(props: {
	prop1: string,
	prop2: number,
}) {
	const { prop1, prop2 } = props

	const hook1 = useLibraryHook()
	const hook2 = useApplicationHook()
	const [state, setState] = useState()

	useEffect(() => {
		// do something
	}, [prop1, hook1, state])

	const derived1 = compute(prop1, prop2)

	function callback1() {
		// do something
	}

	if (someCondition) {
		return ANOTHER_MARKUP
	}

	return MARKUP
}
```

## Example component with variants

```tsx
function ComponentWithVariants(props: {
	variant: 'variant-1' | 'variant-2'
}) {
	const { variant } = props

	if (variant === 'variant-1') {
		return <Variant1Component />
	}

	if (variant === 'variant-2') {
		return <Variant2Component />
	}

	variant satisfies never // this indicates at the type level that all variants are accounted for

	return null
}
```

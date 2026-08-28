export function AuthStatus(props: { message: string | null }) {
  const { message } = props;

  if (!message) {
    return null;
  }

  return (
    <output
      aria-live="polite"
      className="block rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm"
    >
      {message}
    </output>
  );
}

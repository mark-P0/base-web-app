export function AuthPendingState(props: { active: boolean; message: string }) {
  const { active, message } = props;

  if (!active) {
    return null;
  }

  return (
    <output aria-live="polite" className="block text-sm text-muted-foreground">
      {message}
    </output>
  );
}

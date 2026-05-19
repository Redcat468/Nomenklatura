export default function AppFooter() {
  return (
    <footer className="h-12 border-t border-border-subtle flex items-center justify-center">
      <p className="text-xs text-text-muted">
        Nomenklatura v1.0 — Félix Abt — Cairn Studios —{' '}
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:underline decoration-dashed">
          CC BY-NC-SA 4.0
        </a>
      </p>
    </footer>
  );
}

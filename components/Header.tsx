
interface HeaderProps {
  title?: string;
}

export default function Header({
  title,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
          <span className="material-symbols-outlined text-primary text-2xl">
            monitoring
          </span>
        </div>
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      </div>
      {/* <button
        onClick={onActionClick}
        className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors"
        aria-label="Start monitoring"
      >
        <span className="material-symbols-outlined text-primary">
          play_circle
        </span>
      </button> */}
    </header>
  );
}
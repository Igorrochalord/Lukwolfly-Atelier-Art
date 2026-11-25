/** Estado vazio de galeria — "prateleira" tracejada aguardando peças. */
export function EmptyShelf({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-[1.5rem] border-[1.5px] border-dashed border-line-2 p-10 text-center">
      <div aria-hidden className="absolute inset-0 grid grid-cols-3 gap-4 p-4 opacity-40 md:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="animate-float rounded-xl bg-ink-3" style={{ animationDelay: `${i * -0.7}s`, ["--r" as string]: `${(i % 3) - 1}deg` }} />
        ))}
      </div>
      <div className="relative max-w-md">
        <p className="serif-i text-3xl text-lime">{title}</p>
        {children && <div className="mt-3 text-mute">{children}</div>}
      </div>
    </div>
  );
}

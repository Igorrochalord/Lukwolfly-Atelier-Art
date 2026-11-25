"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="shell grid min-h-[70svh] place-items-center pt-28 text-center">
      <div>
        <p className="serif-i text-4xl">Algo deu errado por aqui.</p>
        <button type="button" onClick={reset} className="btn btn-lime mt-8">
          Tentar de novo
        </button>
      </div>
    </section>
  );
}

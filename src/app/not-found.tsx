import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell grid min-h-[80svh] place-items-center pt-28 text-center">
      <div>
        <p className="display text-[clamp(6rem,25vw,18rem)] text-lime">404</p>
        <p className="serif-i text-3xl">Essa costura se soltou.</p>
        <Link href="/" className="btn btn-ghost mt-8">
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}

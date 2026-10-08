import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1222px] px-[15px] py-24 text-center">
      <h1 className="mb-4 text-[48px] font-bold text-primary">404</h1>
      <p className="mb-2">Sorry, the page you are looking for could not be found.</p>
      <p className="mb-8">お探しのページは見つかりませんでした。</p>
      <Link href="/" className="btn-primary">
        Home
      </Link>
    </div>
  );
}

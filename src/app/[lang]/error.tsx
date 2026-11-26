"use client"; // Error boundaries must be Client Components

import { useParams } from "next/navigation";

// Shown inside the site layout (header and footer stay) when a page below it throws, e.g. when the database is
// unreachable. The real error is logged on the server, see error.digest in the Worker logs.
export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  const { lang } = useParams<{ lang?: string }>();
  const ja = lang === "ja";
  return (
    <div className="container-site flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-4 text-[24px] font-bold text-primary">{ja ? "ただいまご利用いただけません" : "Temporarily unavailable"}</h1>
      <p className="mb-8 max-w-[560px]">
        {ja
          ? "このページを読み込めませんでした。しばらくしてからもう一度お試しください。"
          : "We couldn't load this page right now. Please try again in a few minutes."}
      </p>
      <button type="button" onClick={() => retry()} className="btn-primary min-w-[150px]">
        {ja ? "再読み込み" : "Try again"}
      </button>
    </div>
  );
}

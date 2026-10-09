import { wordDiff } from "@/lib/translation/text";

/** Inline diff: removed text struck through in red, added text highlighted in green. */
export default function DiffView({ before, after, lang }: { before: string; after: string; lang?: string }) {
  return (
    <p lang={lang} className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#333]">
      {wordDiff(before, after).map((p, i) =>
        p.type === "same" ? (
          <span key={i}>{p.text}</span>
        ) : p.type === "del" ? (
          <del key={i} className="bg-red-100 text-red-700">
            {p.text}
          </del>
        ) : (
          <ins key={i} className="bg-green-100 text-green-800 no-underline">
            {p.text}
          </ins>
        ),
      )}
    </p>
  );
}

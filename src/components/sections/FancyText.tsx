"use client";

import { useEffect, useState } from "react";

/** eael-fancy-text "typing" effect: types each word (70ms/char), holds 2.5s, erases, loops. */
export default function FancyText({
  prefix,
  words,
  suffix,
  className = "",
}: {
  prefix: string;
  words: string[];
  suffix: string;
  className?: string;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((r) => (timer = setTimeout(r, ms)));
    (async () => {
      for (let w = 0; !cancelled; w = (w + 1) % words.length) {
        const word = words[w];
        for (let i = 1; i <= word.length && !cancelled; i++) {
          setText(word.slice(0, i));
          await wait(70);
        }
        await wait(2500);
        for (let i = word.length - 1; i >= 0 && !cancelled; i--) {
          setText(word.slice(0, i));
          await wait(30);
        }
        await wait(300);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [words]);

  return (
    <p className={className} aria-label={`${prefix}${words.join(", ")}${suffix}`}>
      <span aria-hidden>
        {prefix}
        {text}
        <span className="seats-typed-cursor">|</span>
        {suffix}
      </span>
    </p>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Only loads the SociableKit widget script (and the dozen-plus images/requests it then pulls in from
// a third-party domain) once this section actually scrolls near the viewport, instead of on every page
// load regardless of whether the visitor ever scrolls this far - this is the single heaviest thing on
// the homepage otherwise.
export default function FacebookFeed({ embedId }: { embedId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="sk-ww-facebook-page-posts" data-embed-id={embedId}>
      {visible && <Script src="https://widgets.sociablekit.com/facebook-page-posts/widget.js" strategy="lazyOnload" />}
    </div>
  );
}

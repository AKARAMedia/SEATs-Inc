"""Discovery export: pull all content/assets from the live WordPress site.

Usage: python -I scripts/export-live-site.py
Writes to content-export/ (raw HTML, JSON) and public/media/ (images).
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

BASE = "https://seats-inc.com"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "content-export")
MEDIA = os.path.join(ROOT, "public", "media")
UA = {"User-Agent": "Mozilla/5.0 (seats-rebuild export)"}

PAGES = [
    "", "overview", "history", "philosophy-our-value", "ceo-message",
    "loka-japanese-foods-beverage", "nova-marketing", "pisa-food-retail",
    "news-event", "contact", "option-career", "media-content",
]


def get(url, binary=False, retries=3):
    for i in range(retries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            if i == retries - 1:
                print("FAIL", url, e, file=sys.stderr)
                return None
            time.sleep(2)


def save(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mode = "wb" if isinstance(content, bytes) else "w"
    with open(path, mode, **({} if mode == "wb" else {"encoding": "utf-8"})) as f:
        f.write(content)


def main():
    if "--media-only" in sys.argv:
        return download_media()
    os.makedirs(OUT, exist_ok=True)
    asset_urls = set()

    # Rendered pages, EN + JA (TranslatePress serves JA under /ja/)
    for slug in PAGES:
        for lang, prefix in (("en", ""), ("ja", "/ja")):
            url = f"{BASE}{prefix}/{slug + '/' if slug else ''}"
            html = get(url)
            if html:
                save(os.path.join(OUT, "pages", lang, (slug or "home") + ".html"), html)
                asset_urls.update(find_assets(html))
            print("page", lang, slug or "home", bool(html))

    # Posts via REST (EN source of truth), then rendered JA version of each
    posts = json.loads(get(f"{BASE}/wp-json/wp/v2/posts?per_page=100&_embed=1"))
    cats = json.loads(get(f"{BASE}/wp-json/wp/v2/categories?per_page=100"))
    save(os.path.join(OUT, "categories.json"), json.dumps(cats, ensure_ascii=False, indent=2))
    out_posts = []
    for p in posts:
        slug = p["slug"]
        en_html = get(p["link"])
        ja_link = p["link"].replace(BASE + "/", BASE + "/ja/", 1)
        ja_html = get(ja_link)
        save(os.path.join(OUT, "posts", "en", urllib.parse.unquote(slug)[:120] + ".html"), en_html or "")
        save(os.path.join(OUT, "posts", "ja", urllib.parse.unquote(slug)[:120] + ".html"), ja_html or "")
        fm = None
        emb = p.get("_embedded", {}).get("wp:featuredmedia")
        if emb and isinstance(emb, list) and emb[0].get("source_url"):
            fm = emb[0]["source_url"]
            asset_urls.add(fm)
        asset_urls.update(find_assets(p["content"]["rendered"]))
        out_posts.append({
            "id": p["id"], "slug": slug, "date": p["date"], "link": p["link"],
            "categories": p["categories"], "title": p["title"]["rendered"],
            "excerpt": p["excerpt"]["rendered"], "content": p["content"]["rendered"],
            "featured_image": fm,
        })
        print("post", slug[:60])
    save(os.path.join(OUT, "posts.json"), json.dumps(out_posts, ensure_ascii=False, indent=2))

    # Theme / Elementor CSS for design-system reference
    home = open(os.path.join(OUT, "pages", "en", "home.html"), encoding="utf-8").read()
    for href in re.findall(r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)', home):
        css = get(urllib.parse.urljoin(BASE, href))
        if css:
            name = re.sub(r"[^a-zA-Z0-9._-]", "_", urllib.parse.urlparse(href).path.strip("/"))[-120:]
            save(os.path.join(OUT, "css", name), css)

    download_media()


def download_media():
    """Download original-size uploads only; resized WP variants (-300x200) map to the original.
    Next.js <Image> generates responsive sizes itself."""
    from concurrent.futures import ThreadPoolExecutor

    blobs = []
    for d, _, files in os.walk(OUT):
        for f in files:
            if f.endswith((".html", ".json")) and f != "media-manifest.json":
                blobs.append(open(os.path.join(d, f), encoding="utf-8").read())
    found = set()
    for b in blobs:
        found.update(re.findall(r"seats-inc\.com(?:\\)?/wp-content(?:\\)?/uploads(?:\\)?/[^\"'\s<>)]+", b))
    manifest, originals = {}, set()
    for raw in found:
        rel = raw.replace("\\", "").split("/wp-content/uploads/", 1)[1].split("?")[0].replace("&amp;", "&")
        rel = urllib.parse.unquote(rel)
        orig = re.sub(r"-\d+x\d+(\.[a-zA-Z0-9]+)$", r"\1", rel)
        if not re.search(r"\.(jpe?g|png|gif|webp|svg|avif|mp4|pdf)$", orig, re.I):
            continue
        manifest[f"{BASE}/wp-content/uploads/{rel}"] = "/media/" + orig
        originals.add(orig)

    def fetch(rel):
        dest = os.path.join(MEDIA, *rel.split("/"))
        if os.path.exists(dest):
            return rel, True
        data = get(f"{BASE}/wp-content/uploads/{urllib.parse.quote(rel)}", binary=True)
        if data:
            save(dest, data)
        return rel, bool(data)

    with ThreadPoolExecutor(max_workers=8) as ex:
        failed = [rel for rel, ok in ex.map(fetch, sorted(originals)) if not ok]
    for k, v in list(manifest.items()):
        if v[len("/media/"):] in failed:
            del manifest[k]
    save(os.path.join(OUT, "media-manifest.json"), json.dumps(manifest, indent=2, ensure_ascii=False))
    print("originals:", len(originals), "failed:", len(failed))


def find_assets(html):
    urls = set(re.findall(r'https?://seats-inc\.com/wp-content/uploads/[^"\'\s<>)]+', html or ""))
    for srcset in re.findall(r'srcset=["\']([^"\']+)', html or ""):
        for part in srcset.split(","):
            u = part.strip().split(" ")[0]
            if "/wp-content/uploads/" in u:
                urls.add(urllib.parse.urljoin(BASE, u))
    # Keep only original (non-resized) variants plus what's referenced
    return {u.replace("&amp;", "&") for u in urls}


if __name__ == "__main__":
    main()

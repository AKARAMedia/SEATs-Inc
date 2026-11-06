import "server-only";
import { revalidatePath, updateTag } from "next/cache";

/**
 * updateTag() for admin actions that change public content.
 *
 * Public pages are rendered from the database on request and kept in the edge cache for a short time by
 * worker/index.mjs (PAGE_TTL), so an edit shows up on its own within about a minute: there is no rebuild
 * or redeploy to trigger any more. The Next.js cache entries for the changed page are still dropped (when
 * the content has its own public page, e.g. a post) so a since-deleted/unpublished page is not served from
 * Next's own cache.
 */
export function publishChange(tag: string, slugs?: string | (string | undefined)[]) {
  updateTag(tag);
  for (const slug of [slugs].flat()) {
    if (!slug) continue;
    revalidatePath(`/${slug}/`);
    revalidatePath(`/ja/${slug}/`);
  }
}

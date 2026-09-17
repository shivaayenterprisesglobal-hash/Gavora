import { useEffect } from 'react';

const SITE_NAME = 'Gavora';

function setMeta(selector, attribute, value, content) {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

/**
 * Keeps the document title, meta description and canonical URL in step with the
 * active route.
 *
 * Done by hand rather than with a helmet-style library: this is a handful of
 * DOM writes, and the app does not need another dependency for it. Server-side
 * rendering would be the next step if crawler coverage ever demands it.
 *
 * @param {{ title?: string, description?: string, noIndex?: boolean }} options
 */
export function useDocumentMeta({ title, description, noIndex = false } = {}) {
  useEffect(() => {
    if (title) {
      const ogTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
      document.title = ogTitle;
      setMeta('meta[property="og:title"]', 'property', 'og:title', ogTitle);
    }

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }

    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');

    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}${window.location.pathname}`);
  }, [title, description, noIndex]);
}

export default useDocumentMeta;

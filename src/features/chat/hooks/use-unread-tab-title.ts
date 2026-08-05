"use client";

import { useEffect, useMemo, useRef } from "react";

type UnreadConversation = {
  unreadCount?: number;
};

type FaviconSnapshot = {
  href: string | null;
  type: string | null;
};

function getFaviconLink() {
  const existingLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (existingLink) {
    return existingLink;
  }

  const link = document.createElement("link");
  link.rel = "icon";
  document.head.append(link);
  return link;
}

function restoreFavicon(link: HTMLLinkElement, snapshot: FaviconSnapshot | null) {
  if (!snapshot) {
    return;
  }

  if (snapshot.href === null) {
    link.removeAttribute("href");
  } else {
    link.setAttribute("href", snapshot.href);
  }

  if (snapshot.type === null) {
    link.removeAttribute("type");
  } else {
    link.setAttribute("type", snapshot.type);
  }
}

function createUnreadFavicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect x="5" y="5" width="46" height="46" rx="12" fill="#22d3ee"/>
    <text x="28" y="37" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" font-weight="700" fill="#083344">C</text>
    <circle cx="50" cy="14" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function useUnreadTabTitle({
  appName,
  conversations,
}: {
  appName: string;
  conversations: readonly UnreadConversation[];
}) {
  const initialTitleRef = useRef<string | null>(null);
  const initialFaviconRef = useRef<FaviconSnapshot | null>(null);
  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations],
  );

  useEffect(() => {
    initialTitleRef.current = document.title;
    const favicon = getFaviconLink();
    initialFaviconRef.current = {
      href: favicon.getAttribute("href"),
      type: favicon.getAttribute("type"),
    };

    return () => {
      if (initialTitleRef.current !== null) {
        document.title = initialTitleRef.current;
      }

      restoreFavicon(favicon, initialFaviconRef.current);
    };
  }, []);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) ${appName}` : appName;
  }, [appName, unreadCount]);

  useEffect(() => {
    const favicon = getFaviconLink();

    if (unreadCount > 0) {
      favicon.href = createUnreadFavicon();
      favicon.type = "image/svg+xml";
      return;
    }

    restoreFavicon(favicon, initialFaviconRef.current);
  }, [unreadCount]);
}

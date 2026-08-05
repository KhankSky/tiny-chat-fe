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

function createUnreadFavicon(faviconHref: string) {
  return new Promise<string>((resolve, reject) => {
    const sourceImage = new Image();
    sourceImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Unable to create a favicon canvas."));
        return;
      }

      context.drawImage(sourceImage, 0, 0, 64, 64);
      context.beginPath();
      context.arc(51, 13, 11, 0, Math.PI * 2);
      context.fillStyle = "#ef4444";
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = "#ffffff";
      context.stroke();

      resolve(canvas.toDataURL("image/png"));
    };
    sourceImage.onerror = () => reject(new Error("Unable to load the original favicon."));
    sourceImage.src = faviconHref;
  });
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
    let isCurrent = true;

    if (unreadCount > 0) {
      const originalHref = initialFaviconRef.current?.href;
      if (!originalHref) {
        return () => {
          isCurrent = false;
        };
      }

      void createUnreadFavicon(originalHref)
        .then((faviconWithBadge) => {
          if (!isCurrent) {
            return;
          }

          favicon.href = faviconWithBadge;
          favicon.type = "image/png";
        })
        .catch(() => {
          // Keep the original favicon if the browser cannot draw it on a canvas.
        });

      return () => {
        isCurrent = false;
      };
    }

    restoreFavicon(favicon, initialFaviconRef.current);
    return () => {
      isCurrent = false;
    };
  }, [unreadCount]);
}

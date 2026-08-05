import { privateRouteMetadata } from "@/shared/seo/private-route-metadata";

export const metadata = privateRouteMetadata;

export default function ConversationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

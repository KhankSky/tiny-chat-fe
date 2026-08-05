import { privateRouteMetadata } from "@/shared/seo/private-route-metadata";

export const metadata = privateRouteMetadata;

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

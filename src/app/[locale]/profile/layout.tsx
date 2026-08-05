import { privateRouteMetadata } from "@/shared/seo/private-route-metadata";

export const metadata = privateRouteMetadata;

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

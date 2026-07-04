import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("mobile-app-development");

export default function Page() {
  return <ServiceDetailPage slug="mobile-app-development" />;
}

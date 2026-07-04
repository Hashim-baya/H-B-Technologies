import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("artificial-intelligence");

export default function Page() {
  return <ServiceDetailPage slug="artificial-intelligence" />;
}

import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("data-science");

export default function Page() {
  return <ServiceDetailPage slug="data-science" />;
}

import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("machine-learning");

export default function Page() {
  return <ServiceDetailPage slug="machine-learning" />;
}

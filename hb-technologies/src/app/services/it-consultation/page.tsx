import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("it-consultation");

export default function Page() {
  return <ServiceDetailPage slug="it-consultation" />;
}

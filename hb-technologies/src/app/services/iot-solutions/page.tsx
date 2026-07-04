import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("iot-solutions");

export default function Page() {
  return <ServiceDetailPage slug="iot-solutions" />;
}

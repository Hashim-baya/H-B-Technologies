import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("smart-cctv-installation");

export default function Page() {
  return <ServiceDetailPage slug="smart-cctv-installation" />;
}

import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("cyber-security");

export default function Page() {
  return <ServiceDetailPage slug="cyber-security" />;
}

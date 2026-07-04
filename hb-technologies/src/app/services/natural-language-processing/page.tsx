import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("natural-language-processing");

export default function Page() {
  return <ServiceDetailPage slug="natural-language-processing" />;
}

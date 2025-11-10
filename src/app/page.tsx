import Dashboard from '@/components/app/dashboard';
import { samples } from '@/lib/data';

export default function Home() {
  return <Dashboard initialSamples={samples} />;
}

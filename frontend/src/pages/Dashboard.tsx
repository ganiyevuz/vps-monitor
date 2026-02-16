import { Layout } from '../components/layout/Layout';
import { VPSDashboard } from '../components/vps/VPSDashboard';
import { usePageTitle } from '../lib/hooks/usePageTitle';

export function DashboardPage() {
  usePageTitle('Dashboard');
  return (
    <Layout>
      <VPSDashboard />
    </Layout>
  );
}

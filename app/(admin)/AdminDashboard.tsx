import Actions from '@/components/admin/dashboard/Actions';
import DispatchCard from '@/components/admin/dashboard/DispatchCard';
import DashboardHeader from '@/components/DashboardHeader';

export default function AdminDashboard() {
  return (
    <>
      <DashboardHeader />
      <DispatchCard />
      <Actions />
    </>
  );
}

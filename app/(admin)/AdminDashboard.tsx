import AdminHeader from '@/components/admin/AdminHeader';
import Actions from '@/components/admin/dashboard/Actions';
import DispatchCard from '@/components/admin/dashboard/DispatchCard';

export default function AdminDashboard() {
  return (
    <>
      <AdminHeader />
      <DispatchCard />
      <Actions />
    </>
  );
}

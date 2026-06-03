import DispatchCard from '@/components/admin/dashboard/DispatchCard';
import DashboardHeader from '@/components/DashboardHeader';
import UserActions from '@/components/user/UserActions';

const UserDashboard = () => {
  return (
    <>
      <DashboardHeader />
      <DispatchCard />
      <UserActions />
    </>
  );
};

export default UserDashboard;

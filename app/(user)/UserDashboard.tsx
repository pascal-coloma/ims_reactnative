import DispatchCard from '@/components/admin/dashboard/DispatchCard';
import UserActions from '@/components/user/UserActions';
import UserHeader from '@/components/user/UserHeader';

const UserDashboard = () => {
  return (
    <>
      <UserHeader />
      <DispatchCard />
      <UserActions />
    </>
  );
};

export default UserDashboard;

import { UserProfile } from "@clerk/nextjs";

function Profile() {
  return (
    <div className="flex justify-center items-center">
      <UserProfile />
    </div>
  );
}

export default Profile;

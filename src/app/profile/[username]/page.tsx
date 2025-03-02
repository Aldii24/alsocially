import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "./ProfilePageClient";


export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const user = await getProfileByUsername(params.username);

  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username} profile.`,
  };
}

const ProfilePageServer = async ({
  params,
}: {
  params: { username: string };
}) => {
  const username = params.username;
  const user = await getProfileByUsername(username);

  if (!user) return;

  const [posts, likedPosts, isCurrentUserFollow] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <div>
      <ProfilePageClient
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollow}
      />
    </div>
  );
};

export default ProfilePageServer;

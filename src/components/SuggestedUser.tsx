import { getRandomUser } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import FollowButton from "./FollowButton";
import Image from "next/image";
import { verifiedAccount } from "@/lib/utils";

const SuggestedUser = async () => {
  const users = await getRandomUser();

  if (users.length === 0) return null;

  return (
    <div className="sticky top-20">
    <Card>
      <CardHeader>
        <CardTitle>Suggested User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex gap-2 items-center justify-between "
            >
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.username}`}>
                  <Avatar>
                    <AvatarImage src={user.image ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/profile/${user.username}`}
                      className="font-medium cursor-pointer"
                    >
                      {user.name}
                    </Link>
                    <Image
                      title="Verified"
                      src="/verified.png"
                      alt="verified"
                      width={15}
                      height={15}
                      className={`pointer-events-none select-none ${
                        verifiedAccount.includes(user.username)
                          ? "block"
                          : "hidden"
                      }`}
                    />
                  </div>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-muted-foreground">
                    {user._count.followers}{" "}
                    <span>
                      {user._count.followers <= 1 ? "follower" : "followers"}
                    </span>
                  </p>
                </div>
              </div>
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default SuggestedUser;

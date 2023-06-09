import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api"

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("")
      // Void removes red line that TS gives as an error since its waiting on a promise.
      void ctx.posts.getAll.invalidate();
    }
  });

  if (!user) return null;

  return (
    <div className="flex gap-2 w-full">
      <Image width={56} height={56} className="h-14 w-14 rounded-full" src={user.profileImageUrl} alt="Profile_Image" />
      <input className="grow outline-none bg-transparent" type="text" placeholder="Type some emojis!" value={input} onChange={(e) => setInput(e.target.value)} disabled={isPosting}/>
      <button className="rounded-[15px] bg-green-500 px-2 hover:opacity-80 transition duration-500" onClick={() => mutate({ content: input})}>Post𓅪</button>
      <SignOutButton />
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image className="h-14 w-14 rounded-full"alt={`${author.username}'s-profile-image`} src={author.profileImageUrl} height={63} width={63}></Image>
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-200">
          <Link className="hover:opacity-80 transition duration-500" target="_blank" rel="no-referrer" href={`https://www.github.com/${author.username}`}>{`@${author.username} ·`}<span className="font-thin">{` ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong...</div>

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  const {isLoaded: userLoaded, isSignedIn} = useUser();

// Fetch apis asap
  api.posts.getAll.useQuery();

  // Return empty div if it isnt loaded
  if(!userLoaded) return <div />


  return (
    <>
      <Head>
        <title>Little Birdie</title>
        <meta name="description" content="Post an emoji for the world to see on LittleBirdie!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full md:max-w-2xl border-x border-slate-400">
          <div className="flex border-b border-slate-400 p-6">
            {!isSignedIn && 
              <div className="overflow-hidden flex xs:gap-[0px] gap-[180px] md:gap-[470px] lg:gap-[470px]">
                <div className="">
                  <Link href="/">Little Birdie𓅪</Link>
                </div>
                <div className="hover:opacity-80 transition duration-500">
                  <SignInButton />
                </div>
                
              </div>
            }
            {isSignedIn && <CreatePostWizard />}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

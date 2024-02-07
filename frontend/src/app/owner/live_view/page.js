// pages/owner/live_view/page.js
import React from 'react';
import {LiveView} from './page.client';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const Page = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <LiveView {...session} />
    </div>
  );
};

export default Page;

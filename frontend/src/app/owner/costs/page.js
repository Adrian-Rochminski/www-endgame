// pages/owner/costs/page.js
import React from 'react';
import {Costs} from './page.client';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const Page = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <Costs {...session} />
    </div>
  );
};

export default Page;

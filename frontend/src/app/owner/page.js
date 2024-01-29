// pages/owner/page.js
import React from 'react';
import {Owner} from './page.client';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const Page = async () => {
    const session = await getServerSession(authOptions)

    return (
        <div>
            <Owner {...session} />
        </div>
    );
};

export default Page;

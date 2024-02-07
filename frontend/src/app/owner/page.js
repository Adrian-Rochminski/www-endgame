// pages/owner/page.js
import React from 'react';
import {Owner} from './page.client';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

const Page = async () => {
    const session = await getServerSession(authOptions)

    if(session.role === "driver"){
        redirect("/driver")
    }

    return (
        <div>
            <Owner {...session} />
        </div>
    );
};

export default Page;

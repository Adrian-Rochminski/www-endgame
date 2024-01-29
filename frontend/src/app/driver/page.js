// pages/driver/page.js
import React from 'react';
import PageClient, {Driver} from './page.client';
import {UserSession} from "@/components/Authenticated";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const Page = async () => {
    const session = await getServerSession(authOptions)

    return (
        <div>
            <Driver {...session} />
        </div>
    );
};

export default Page;

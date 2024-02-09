import React from 'react';
import {Summary} from "./page.client";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const Page = async () => {
    const session = await getServerSession(authOptions)

    return (
        <div>
            <Summary {...session}/>
        </div>
    );
};

export default Page;

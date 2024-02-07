// pages/driver/page.js
import React from 'react';
import PageClient, {Driver} from './page.client';
import {UserSession} from "@/components/Authenticated";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

const Page = async () => {
    const session = await getServerSession(authOptions)

    if(session.role === "owner"){
        redirect("/owner")
    }


    return (
        <div>
            <Driver {...session} />
        </div>
    );
};

export default Page;

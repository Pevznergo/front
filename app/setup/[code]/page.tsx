import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SetupClient from "@/components/SetupClient";

interface SetupPageProps {
    params: {
        code: string;
    };
}

export default async function SetupPage({ params }: SetupPageProps) {
    const session = await getServerSession();

    // Security check: only allow admin to perform setup
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        redirect("/s/" + params.code); // Redirect back to public view (which shows "Coming Soon")
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <SetupClient code={params.code} />
        </div>
    );
}

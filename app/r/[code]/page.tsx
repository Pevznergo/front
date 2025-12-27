import { sql, initDatabase } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface RedirectPageProps {
    params: {
        code: string;
    };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
    await initDatabase();
    const { code } = params;

    // 1. Find the link in the database
    const links = await sql`
    SELECT target_url, id 
    FROM short_links 
    WHERE code = ${code}
  `;

    if (links.length === 0) {
        notFound();
    }

    const link = links[0];

    // 2. Increment click count asynchronously (don't block the redirect)
    // Note: Vercel/Next.js might terminate the execution after redirect, 
    // so we should ideally await it or use a background job. 
    // For simplicity here we await it to ensure it's recorded.
    try {
        await sql`
          UPDATE short_links 
          SET clicks_count = COALESCE(clicks_count, 0) + 1 
          WHERE id = ${link.id}
        `;
    } catch (error) {
        console.error("Error updating click count:", error);
    }

    // 3. Redirect to the target URL
    redirect(link.target_url);
}

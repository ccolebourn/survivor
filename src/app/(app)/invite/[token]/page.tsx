import { acceptInvite } from "@/lib/group-actions";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InviteAcceptPage({ params }: Props) {
  const { token } = await params;

  let result: { groupId: number; groupName: string } | null = null;
  let errorMessage: string | null = null;

  try {
    result = await acceptInvite(token);
  } catch (err) {
    // Re-throw Next.js redirect/not-found errors — they must not be swallowed
    if ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw err;
    errorMessage = err instanceof Error ? err.message : "Something went wrong.";
  }

  if (result) {
    redirect("/my-survivors");
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-red-600 mb-3">Invitation Error</h1>
        <p className="text-gray-600 text-sm">{errorMessage}</p>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:underline text-sm">
          Go to home
        </a>
      </div>
    </div>
  );
}

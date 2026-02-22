import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserGroups } from "@/lib/group-actions";
import { GroupProvider } from "@/lib/group-context";
import NavBar from "@/components/navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const groups = await getUserGroups();

  return (
    <GroupProvider initialGroups={groups}>
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </GroupProvider>
  );
}

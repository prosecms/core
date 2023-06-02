import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import authOptions from "lib/auth";
import { prisma } from "lib/prisma";

import EditorProvider from "components/EditorProvider";
import Header from "components/Header";

type Props = {
  params: {
    id: string;
  };
};

export default async function AdminDraftPage({ params: { id } }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`${process.env.BASE_URL}/admin/login`);
  }

  const config = await prisma.config.findFirst({
    orderBy: {
      id: "desc",
    },
    take: 1,
  });

  return (
    <main className="container mx-auto">
      <Header session={session} config={config} />
      <EditorProvider id={id} />
    </main>
  );
}

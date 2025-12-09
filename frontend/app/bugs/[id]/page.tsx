import BugDetailClient from "./../../components/BugDetailClient";

export default async function BugDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BugDetailClient id={id} />;
}

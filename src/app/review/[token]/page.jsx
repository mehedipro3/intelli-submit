import ReviewerWorkspace from "./ReviewerWorkspace";

export const metadata = {
  title: "Manuscript Peer Review | IntelliSubmit",
  description: "Peer reviewer portal for manuscript assessment and publishing decisions.",
};

export default async function ReviewPage({ params }) {
  const { token } = await params;

  return <ReviewerWorkspace token={token} />;
}

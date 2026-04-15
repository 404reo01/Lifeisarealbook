import { redirect } from "next/navigation";

// /admin/articles redirects to dashboard which already lists all articles
export default function AdminArticlesPage() {
  redirect("/admin");
}

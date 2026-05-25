import { redirect } from "next/navigation";

/** Route group root — send users to the main dashboard */
export default function DashboardGroupRoot() {
  redirect("/dashboard");
}

import { revalidateTag, revalidatePath } from "next/cache";

// This is a dummy action to force revalidate
export async function forceRevalidate(userId: string) {
  revalidateTag(`dashboard-v2-${userId}`);
  revalidatePath("/");
  console.log("Revalidated dashboard for", userId);
}

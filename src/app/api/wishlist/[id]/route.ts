import { NextResponse } from "next/server";
import { patchWishlistItem, removeWishlistItem } from "@/lib/data/wishlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    await dbConnect();
    const { item, source } = await patchWishlistItem(session.user.id, id, body);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Wishlist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item, source });
  } catch (error) {
    console.error("PATCH Wishlist Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update wishlist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await dbConnect();
    const { success, source } = await removeWishlistItem(session.user.id, id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Wishlist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, source });
  } catch (error) {
    console.error("DELETE Wishlist Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete wishlist item" },
      { status: 500 }
    );
  }
}

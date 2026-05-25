import { NextResponse } from "next/server";
import { patchWishlistItem, removeWishlistItem } from "@/lib/data/wishlist";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { item, source } = await patchWishlistItem(id, body);

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
    const { id } = await params;
    const { success, source } = await removeWishlistItem(id);

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

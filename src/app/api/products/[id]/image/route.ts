import { NextResponse } from "next/server";
import { getProductImage } from "@dal";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const product = await getProductImage(id);

  if (!product?.image || !product.imageMimeType) {
    return NextResponse.json({ error: "Geen foto gevonden." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(product.image), {
    status: 200,
    headers: {
      "Content-Type": product.imageMimeType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

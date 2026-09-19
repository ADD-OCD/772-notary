import { submitNotaryRequest } from "@/modules/requests/submit";
import { RequestValidationError } from "@/modules/requests/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  try {
    const payload: unknown = await request.json();
    const result = await submitNotaryRequest(payload);
    return Response.json(
      {
        reference: result.reference,
        requestStatus: result.status,
        appointmentConfirmed: false,
        message: "Your request was received. Your appointment is not confirmed.",
      },
      {
        status: result.created ? 201 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return Response.json(
        { error: "Please correct the highlighted fields.", fieldErrors: error.fieldErrors },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }
    console.error("Notary request submission failed.");
    return Response.json(
      { error: "We could not submit your request. Please try again or contact 772 Notary at (772) 800-4555." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

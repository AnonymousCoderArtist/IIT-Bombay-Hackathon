import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { Notification } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  await dbConnect();

  const encoder = new TextEncoder();

  let lastCount = -1;
  let lastEmit = 0;

  async function check() {
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    const now = Date.now();
    if (count !== lastCount && now - lastEmit > 1000) {
      lastCount = count;
      lastEmit = now;
      return encoder.encode(`data: ${JSON.stringify({ unreadCount: count })}\n\n`);
    }
    return null;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const initial = await check();
      if (initial) controller.enqueue(initial);

      const timer = setInterval(async () => {
        const chunk = await check();
        if (chunk) controller.enqueue(chunk);
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

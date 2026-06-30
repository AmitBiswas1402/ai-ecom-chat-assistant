import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { messages, imageUrl } = await req.json();
    const gemmaMessages = [...messages];

    if (imageUrl && gemmaMessages.length > 0) {
      const last = gemmaMessages[gemmaMessages.length - 1];
      last.content = [
        { type: "text", text: last.content },
        { type: "image_url", image_url: { url: imageUrl } },
      ];
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // model: "google/gemma-3-4b-it:free", 
        // model: "google/gemma-3-27b-it:free",
        model: "google/gemma-4-31b-it:free",
        // model: "meta-llama/llama-4-maverick:free",
        // model: "google/gemini-2.0-flash-exp:free",
        messages: gemmaMessages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Next.js App",
        },
        responseType: "stream",
        validateStatus: (status) => status < 500,
      }
    );

    if (!response.data || response.status !== 200) {
      const errorBody = await new Promise<string>((resolve) => {
        let body = "";
        response.data.on("data", (chunk: any) => { body += chunk.toString(); });
        response.data.on("end", () => resolve(body));
      });
      const parsed = JSON.parse(errorBody);
      return NextResponse.json(
        { error: parsed.error?.message || "Upstream API error" },
        { status: response.status }
      );
    }

    const stream = response.data;
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        stream.on("data", (chunk: any) => {
          const payloads = chunk.toString().split("\n\n");
          for (const payload of payloads) {
            if (payload.includes("[DONE]")) {
              controller.close();
              return;
            }
            if (payload.startsWith("data:")) {
              try {
                const data = JSON.parse(payload.replace("data:", ""));
                const text = data.choices[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        });

        stream.on("end", () => {
          controller.close();
        });

        stream.on("error", (error: any) => {
          console.error("Stream error", error);
          controller.error(error);
        });
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("API error:", error);
    const message = error.response?.data
      ? await new Promise<string>((resolve) => {
          let body = "";
          error.response.data.on("data", (chunk: any) => { body += chunk.toString(); });
          error.response.data.on("end", () => resolve(body));
        }).then((b) => JSON.parse(b).error?.message || "Something went wrong")
      : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

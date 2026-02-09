import { NextResponse } from "next/server";
import { Resend } from "resend";

type SectionData = {
  name: string;
  items: { text: string; done: boolean }[];
  notes: string;
};

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { property, sections } = (await request.json()) as {
      property: string;
      sections: SectionData[];
    };

    if (!property || !sections) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    // Build HTML email
    let html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #5FB8AD; font-size: 24px; margin-bottom: 4px;">Cleaning Complete — ${property}</h1>
        <p style="color: #888; font-size: 14px; margin-top: 0;">${dateStr} at ${timeStr}</p>
        <hr style="border: none; border-top: 1px solid #E8E1D6; margin: 16px 0;" />
    `;

    for (const section of sections) {
      const doneCount = section.items.filter((i) => i.done).length;
      const totalCount = section.items.length;
      const allDone = doneCount === totalCount;
      const missedItems = section.items.filter((i) => !i.done);

      html += `<h2 style="font-size: 16px; margin-bottom: 8px; color: ${allDone ? "#5FB8AD" : "#D4874D"};">
        ${section.name} <span style="font-weight: normal; font-size: 14px;">(${doneCount}/${totalCount})</span>
      </h2>`;

      if (allDone && !section.notes) {
        html += `<p style="color: #5FB8AD; font-size: 14px; margin: 4px 0 16px;">All items completed</p>`;
      } else {
        if (missedItems.length > 0) {
          html += `<p style="color: #D4874D; font-size: 13px; margin: 4px 0 4px; font-weight: 600;">Incomplete:</p><ul style="margin: 0 0 8px; padding-left: 20px;">`;
          for (const item of missedItems) {
            html += `<li style="font-size: 13px; color: #666; margin-bottom: 2px;">${item.text}</li>`;
          }
          html += `</ul>`;
        }
        if (section.notes) {
          html += `<p style="font-size: 13px; margin: 4px 0 16px; padding: 8px 12px; background: #F5F1EB; border-radius: 6px; color: #444;">
            <strong>Notes:</strong> ${section.notes.replace(/\n/g, "<br>")}
          </p>`;
        }
      }
    }

    // Summary
    const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
    const totalDone = sections.reduce(
      (sum, s) => sum + s.items.filter((i) => i.done).length,
      0
    );

    html += `
        <hr style="border: none; border-top: 1px solid #E8E1D6; margin: 16px 0;" />
        <p style="font-size: 14px; color: #444;"><strong>Total:</strong> ${totalDone}/${totalItems} items completed</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "oAZis Properties <onboarding@resend.dev>",
      to: "admin@oazisproperties.com",
      subject: `Cleaning Complete — ${property} (${dateStr})`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Submit error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

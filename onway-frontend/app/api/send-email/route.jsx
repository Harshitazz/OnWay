

import Email from "@/emails";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const response = await req.json();

        var postmark = require("postmark");

        // Send an email:
        var client = new postmark.ServerClient("401520fe-d1b4-4792-b7ca-16e295113ff5");

        const result = await client.sendEmail({
            "From": "harshita.pathak.2022@msit.in",
            "To": "harshita.pathak.2022@msit.in",
            "Subject": "Hello from Foodie-Cart",
            "HtmlBody": Email(),
            
            "MessageStream": "outbound"
        });

        return NextResponse.json({ result });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: error.message });
    }
}

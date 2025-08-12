import {NextResponse} from "next/server";
import axios from "axios";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const size = searchParams.get("size");
    const query = searchParams.get("query");

    if (!size) {
        return NextResponse.json({error: "missing parameter"}, {status: 400});
    }

    const token = process.env.NEWS_TOKEN;
    if (!token) {
        return NextResponse.json({error: "Missing NEWS_TOKEN in env"}, {status: 500});
    }

    try {
        const {data} = await axios.get(
            `https://serpapi.com/search?api_key=${token}&engine=google_news_light&q=${query}&num=${size}`,
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Failed to fetch from API"}, {status: 500});
    }
}

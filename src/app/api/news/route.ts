import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const size = searchParams.get("size");
    const query = searchParams.get("query");
    const cacheTTL = 1800 // 3 hours, to reduce actual API calls

    if (!size) {
        return NextResponse.json({error: "missing parameter"}, {status: 400});
    }

    const token = process.env.NEWS_TOKEN;
    if (!token) {
        return NextResponse.json({error: "Missing NEWS_TOKEN in env"}, {status: 500});
    }

    try {
        const res = await fetch(
            `https://serpapi.com/search?api_key=${token}&engine=google_news_light&q=${query}&num=${size}`,
            { next: { revalidate: cacheTTL } }
        );
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Failed to fetch from API"}, {status: 500});
    }
}

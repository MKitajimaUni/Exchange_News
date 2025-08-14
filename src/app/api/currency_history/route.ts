import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const base = searchParams.get("base");
    const date = searchParams.get("date");
    const cacheTTL = 1800 // 3 hours, to reduce actual API calls

    if (!base || !date) {
        return NextResponse.json({error: "missing parameter"}, {status: 400});
    }

    const token = process.env.CURRENCY_TOKEN;
    if (!token) {
        return NextResponse.json({error: "Missing CURRENCY_TOKEN in env"}, {status: 500});
    }

    try {
        const res = await fetch(
            `https://api.currencyapi.com/v3/historical?apikey=${token}&date=${date}&base_currency=${base}`,
            { next: { revalidate: cacheTTL } }
        );
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Failed to fetch from API"}, {status: 500});
    }
}


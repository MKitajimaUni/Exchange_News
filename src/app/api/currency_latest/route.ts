import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const base = searchParams.get("base");
    const cacheTTL = 1800 // 3 hours, to reduce actual API calls

    if (!base) {
        return NextResponse.json({error: "currency is required"}, {status: 400});
    }

    const token = process.env.CURRENCY_TOKEN;
    if (!token) {
        return NextResponse.json({error: "Missing CURRENCY_TOKEN in env"}, {status: 500});
    }

    try {
        const res = await fetch(
            `https://api.currencyapi.com/v3/latest?apikey=${token}&currencies=&base_currency=${base}`,
            { next: { revalidate: cacheTTL } }
        );
        const data = await res.json();
        return NextResponse.json(data); //JSON data is capsuled with .data
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Failed to fetch from API"}, {status: 500});
    }
}
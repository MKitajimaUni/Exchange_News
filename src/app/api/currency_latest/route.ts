import {NextResponse} from "next/server";
import axios from "axios";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const base = searchParams.get("base");

    if (!base) {
        return NextResponse.json({error: "currency is required"}, {status: 400});
    }

    const token = process.env.CURRENCY_TOKEN;
    if (!token) {
        return NextResponse.json({error: "Missing CURRENCY_TOKEN in env"}, {status: 500});
    }

    try {
        const {data} = await axios.get(
            `https://api.currencyapi.com/v3/latest?apikey=${token}&currencies=&base_currency=${base}`,
        );
        return NextResponse.json(data); //JSON data is capsuled with .data
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Failed to fetch from API"}, {status: 500});
    }
}
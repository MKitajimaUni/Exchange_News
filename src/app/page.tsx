"use client";

import {useEffect, useState} from "react";

type CurrentCurrency = {
    JPY: number;
    EUR: number;
    USD: number;
    AUD: number;
    GBP: number;
};

type NewsResult = {
    position: number,
    title: string,
    link: string,
    source: string,
    thumbnail: string,
    snippet: string,
    date: string
};

type NewsMetadata = {};


export default function HomePage() {
    const [base, setBase] = useState("JPY");
    const [selectedBase, setSelectedBase] = useState("USD"); // grid initialized usd
    const [rate, setRate] = useState<CurrentCurrency>();
    const [historyRate, setHistoryRate] = useState<CurrentCurrency>();
    const [loading, setLoading] = useState(false);
    const [topRates, setTopRates] = useState<{ EUR: number; USD: number; GBP: number }>();
    const [topRatesLastweek, setTopRatesLastweek] = useState<{ EUR: number; USD: number; GBP: number }>();
    const [newsList, setNewsList] = useState<NewsResult[]>([]);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch(`/api/currency_latest?base=JPY`);
                const data = await res.json();
                const rates = data.data;

                setTopRates({
                    EUR: Math.floor((1 / rates.EUR) * 100) / 100,
                    USD: Math.floor((1 / rates.USD) * 100) / 100,
                    GBP: Math.floor((1 / rates.GBP) * 100) / 100,
                });
            } catch (error) {
                console.error("Failed to fetch top rates:", error);
            }
        };

        const fetchHistory = async (date: string) => {
            try {
                const res = await fetch(`/api/currency_history?base=JPY&date=${date}`);
                const json = await res.json();
                const rates = json.data[date];

                setTopRatesLastweek({
                    EUR: Math.floor((1 / rates.EUR) * 100) / 100,
                    USD: Math.floor((1 / rates.USD) * 100) / 100,
                    GBP: Math.floor((1 / rates.GBP) * 100) / 100,
                });
            } catch (error) {
                console.error("Failed to fetch top rates:", error);
            }
        };

        const fetchNewsList = async (size: number, query: string) => {
            try {
                const res = await fetch(`/api/news?size=${size}&query=${query}`);
                const json = await res.json();
                setNewsList(json.news_results);

            } catch (error) {
                console.error("Failed to fetch news list:", error);
            }
        };

        fetchRate();

        const date = new Date();
        const lastWeek = new Date(date.setDate(date.getDate() - 7));
        fetchHistory(lastWeek.toISOString().split("T")[0]);

        setNewsList([]);
        fetchNewsList(5, "為替");
    }, []);

    const fetchSpecificCurrency = async () => {
        if (!selectedBase) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/currency_latest?base=${encodeURIComponent(selectedBase)}`);
            const data = await res.json();
            setRate(data.data);
            setBase(selectedBase)
        } catch (error) {
            console.error(error);
            alert("取得に失敗しました: " + error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecificHistory = async (date: string) => {
        if (!selectedBase) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/currency_history?base=${encodeURIComponent(selectedBase)}&date=${date}`);
            const data = await res.json();
            setHistoryRate(data.data[date]);
            setBase(selectedBase);
        } catch (error) {
            console.error(error);
            alert("取得に失敗しました: " + error);
        } finally {
            setLoading(false);
        }
    };

    const RateCard = ({label, value, diff, date}: { label: string; value: number; diff: number; date: string }) => (
        <div className="card text-center shadow-sm" style={{width: "10rem"}}>
            <div className="card-body">
                <small className="text-muted">1 {label}=</small>
                <h3 className="fw-bold">{value} 円</h3>
                <small className={`mb-0 fw-bold ${diff >= 0 ? "text-danger" : "text-success"}`}>
                    {diff >= 0 ? "+" : "-"}{diff}({date})
                </small>
            </div>
        </div>
    );

    const MiniRateCard = ({label, value}: { label: string, value: number }) => (
        <div className="card text-center shadow-sm" style={{width: "10rem"}}>
            <div className="card-body">
                <small className="text-muted">1 {label}=</small>
                <h3 className="fw-bold">{value} 円</h3>
            </div>
        </div>
    );

    return (
        <div className="container py-4">
            {/* page title */}
            <h1 className="mb-5 border-bottom pb-2">円為替とニュース</h1>

            {/* exchange rate */}
            <section className="mb-5">
                <h2 className="mb-4">現在の円為替レート</h2>
                {topRates && topRatesLastweek ? (
                    <div className="d-flex gap-4 justify-content-center overflow-auto"
                         style={{flexWrap: "nowrap"}}
                    >
                        <RateCard
                            label="EUR"
                            value={topRates.EUR}
                            diff={Math.floor((topRates.EUR - topRatesLastweek.EUR) * 100) / 100}
                            date="先週比"
                        />
                        <RateCard
                            label="USD"
                            value={topRates.USD}
                            diff={Math.floor((topRates.USD - topRatesLastweek.USD) * 100) / 100}
                            date="先週比"
                        />
                        <RateCard
                            label="GBP"
                            value={topRates.GBP}
                            diff={Math.floor((topRates.GBP - topRatesLastweek.GBP) * 100) / 100}
                            date="先週比"
                        />
                    </div>
                ) : (
                    <p>読み込み中...</p>
                )}
            </section>

            {/* search form */}
            <section className="mb-5">
                <h2 className="mb-3">通貨検索</h2>
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <label className="form-label mb-0">通貨を選択:</label>
                    <select
                        className="form-select w-auto"
                        value={selectedBase}
                        onChange={(e) => setSelectedBase(e.target.value)}
                    >
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪🇺 EUR</option>
                        <option value="GBP">🇬🇧 GBP</option>
                        <option value="AUD">🇦🇺 AUD</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => {
                        const date = new Date();
                        const lastWeek = new Date(date.setDate(date.getDate() - 7));

                        fetchSpecificCurrency();
                        fetchSpecificHistory(lastWeek.toISOString().split("T")[0]);
                    }
                    }
                    >
                        検索
                    </button>
                </div>

                {/* result */}
                {loading && <p className="mt-3"> 読み込み中...</p>}
                {rate && historyRate && (
                    <div className="mt-4">
                        <RateCard
                            label={base}
                            value={Math.floor(rate.JPY * 100) / 100}
                            diff={Math.floor((rate.JPY - historyRate.JPY) * 100) / 100}
                            date="先週比"
                        />
                    </div>
                )}
            </section>

            {/* news list */}
            <section>
                <h2 className="mb-4">円為替に関する最新ニュース</h2>
                <div className="row g-4">
                    {newsList.map((item) => (
                        <div className="col-12" key={item.position}>
                            <div className="card shadow-sm border-0">
                                <div className="row g-0">
                                    {/* left is thumbnail */}
                                    <div className="col-md-4">
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="img-fluid w-100 h-100"
                                                style={{objectFit: "cover"}}
                                            />
                                        ) : (
                                            <div
                                                className="bg-light d-flex align-items-center justify-content-center h-100"
                                                style={{minHeight: "180px"}}
                                            >
                                                <span className="text-muted small">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* right is text */}
                                    <div className="col-md-8 d-flex flex-column p-3">
                                        <h5 className="card-title mb-2">
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="stretched-link text-decoration-none"
                                            >
                                                {item.title}
                                            </a>
                                        </h5>
                                        <p className="card-text text-muted small mb-3">
                                            {item.snippet.length > 100
                                                ? item.snippet.slice(0, 100) + "..."
                                                : item.snippet}
                                        </p>
                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                            <small className="text-secondary">{item.source}</small>
                                            <small className="text-secondary">{item.date}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );


}


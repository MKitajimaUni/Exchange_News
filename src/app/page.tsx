"use client"

import {useEffect, useState} from "react";
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer} from "recharts";

type CurrentCurrency = {
    date: string;
    JPY: number;
    EUR: number;
    USD: number;
    AUD: number;
    GBP: number;
    CNY: number; // 中国人民元
    KRW: number; // 韓国ウォン
    SGD: number; // シンガポールドル
    HKD: number; // 香港ドル
    CAD: number; // カナダドル
    NZD: number; // ニュージーランドドル
    CHF: number; // スイスフラン
};

type NewsResult = {
    position: number;
    title: string;
    link: string;
    source: string;
    thumbnail: string;
    snippet: string;
    date: string;
};

export default function HomePage() {
    const [base, setBase] = useState("JPY");
    const [selectedBase, setSelectedBase] = useState("USD");
    const [rate, setRate] = useState<CurrentCurrency>();
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [historyRate, setHistoryRate] = useState<CurrentCurrency>();
    const [loading, setLoading] = useState(false);
    const [topRates, setTopRates] = useState<{ EUR: number; USD: number; GBP: number }>();
    const [topRatesLastweek, setTopRatesLastweek] = useState<{ EUR: number; USD: number; GBP: number }>();
    const [newsList, setNewsList] = useState<NewsResult[]>([]);
    const [weeklyRateTimeSeries, setWeeklyRateTimeSeries] = useState<Record<string, CurrentCurrency>>();
    const WEEK_LENGTH = 7;

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch(`/api/currency_latest?base=JPY`);
                const data = await res.json();
                const rates = data.data;

                setTopRates({
                    EUR: Math.floor((1 / rates.EUR.value) * 100) / 100,
                    USD: Math.floor((1 / rates.USD.value) * 100) / 100,
                    GBP: Math.floor((1 / rates.GBP.value) * 100) / 100,
                });
            } catch (error) {
                console.error("Failed to fetch top rates:", error);
            }
        };

        const fetchHistory = async (date: string) => {
            try {
                const res = await fetch(`/api/currency_history?base=JPY&date=${date}`);
                const data = await res.json();
                const rates = data.data;

                setTopRatesLastweek({
                    EUR: Math.floor((1 / rates.EUR.value) * 100) / 100,
                    USD: Math.floor((1 / rates.USD.value) * 100) / 100,
                    GBP: Math.floor((1 / rates.GBP.value) * 100) / 100,
                });
            } catch (error) {
                console.error("Failed to fetch top rates last week:", error);
            }
        };

        const fetchNewsList = async (size: number, query: string) => {
            try {
                const res = await fetch(`/api/news?size=${size}&query=${query}`);
                const data = await res.json();
                setNewsList(data.news_results);
            } catch (error) {
                console.error("Failed to fetch news list:", error);
            }
        };

        fetchRate();

        const date = new Date();
        const lastWeek = new Date(date);
        lastWeek.setDate(date.getDate() - 7);
        fetchHistory(lastWeek.toISOString().split("T")[0]);

        setNewsList([]);
        fetchNewsList(5, "為替");

        setCurrentDate(new Date());
    }, []);

    const fetchSpecificCurrency = async () => {
        if (!selectedBase) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/currency_latest?base=${encodeURIComponent(selectedBase)}&currencies=JPY`);
            const data = await res.json();
            setRate({
                date: new Date().toISOString().split("T")[0],
                JPY: data.data.JPY.value,
                EUR: 0,
                USD: 0,
                AUD: 0,
                GBP: 0,
                CNY: 0,
                KRW: 0,
                SGD: 0,
                HKD: 0,
                CAD: 0,
                NZD: 0,
                CHF: 0
            });
            setBase(selectedBase);
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
            const res = await fetch(`/api/currency_history?base=${encodeURIComponent(selectedBase)}&currencies=JPY&date=${date}`);
            const data = await res.json();
            setHistoryRate({
                date, JPY: data.data.JPY.value,
                EUR: 0,
                USD: 0,
                AUD: 0,
                GBP: 0,
                CNY: 0,
                KRW: 0,
                SGD: 0,
                HKD: 0,
                CAD: 0,
                NZD: 0,
                CHF: 0
            });
            setBase(selectedBase);
        } catch (error) {
            console.error(error);
            alert("取得に失敗しました: " + error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyRateTimeSeries = async () => {
        if (!selectedBase) return;
        setLoading(true);

        setWeeklyRateTimeSeries({}); // important for clear because state is async
        const newSeries: Record<string, CurrentCurrency> = {};

        try {
            const rateDates: string[] = [];
            for (let i = 1; i < WEEK_LENGTH; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const rateDate = d.toISOString().split("T")[0];
                rateDates.push(rateDate);
            }

            const results: Response[] = await Promise.all(
                rateDates.map((rateDate) => {
                        return fetch(`/api/currency_history?base=${encodeURIComponent(selectedBase)}&currencies=JPY&date=${rateDate}`);
                    }
                )
            )

            for (const result of results) {
                const json = await result.json();
                const date: string = json.meta.last_updated_at.split("T")[0];
                newSeries[date] = {
                    date: date,
                    JPY: json.data.JPY.value,
                    EUR: 0,
                    USD: 0,
                    AUD: 0,
                    GBP: 0,
                    CNY: 0,
                    KRW: 0,
                    SGD: 0,
                    HKD: 0,
                    CAD: 0,
                    NZD: 0,
                    CHF: 0
                };
            }

            const res = await fetch(`/api/currency_latest?base=${encodeURIComponent(selectedBase)}&currencies=JPY`);
            const latest = await res.json();
            const today = currentDate.toISOString().split("T")[0];
            newSeries[today] = {
                date: today,
                JPY: latest.data.JPY.value,
                EUR: 0,
                USD: 0,
                AUD: 0,
                GBP: 0,
                CNY: 0,
                KRW: 0,
                SGD: 0,
                HKD: 0,
                CAD: 0,
                NZD: 0,
                CHF: 0
            };

            setWeeklyRateTimeSeries(newSeries);
        } catch (error) {
            console.error(error);
            alert("取得に失敗しました: " + error);
        } finally {
            setLoading(false);
        }
    };

    const RateCard = ({label, value, diff, date}: { label: string; value: number; diff: number; date: string }) => (
        <div className="card text-center shadow-sm" style={{width: "10rem", flex: "0 0 auto"}}>
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
                    <div className="d-flex gap-4 overflow-auto"
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
                <small
                    className="text-muted">日付:{currentDate?.toISOString().split("T")[0].replaceAll("-", "/")}</small>
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
                        <option value="CNY">🇨🇳 CNY</option>
                        <option value="EUR">🇪🇺 EUR</option>
                        <option value="GBP">🇬🇧 GBP</option>
                        <option value="AUD">🇦🇺 AUD</option>
                        <option value="KRW">🇰🇷 KRW</option>
                        <option value="SGD">🇸🇬 SGD</option>
                        <option value="HKD">🇭🇰 HKD</option>
                        <option value="CAD">🇨🇦 CAD</option>
                        <option value="NZD">🇳🇿 NZD</option>
                        <option value="CHF">🇨🇭 CHF</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => {
                        const date = new Date();
                        const lastWeek = new Date(date.setDate(date.getDate() - 7));

                        fetchSpecificCurrency();
                        fetchSpecificHistory(lastWeek.toISOString().split("T")[0]);
                        fetchWeeklyRateTimeSeries();
                    }
                    }
                    >
                        検索
                    </button>
                </div>

                {/* result */}
                {loading && <p className="mt-3"> 読み込み中...</p>}
                {rate && historyRate && (
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="row g-0">

                                {/* 右側: 為替レート */}
                                <div className="col-md-4 d-flex flex-column p-3">

                                    {rate && historyRate ? (
                                        <div>
                                            <p className="card-text text-muted mb-2">
                                                1 {base} = {" "}
                                            </p>
                                            <h3 className="fw-bold">
                                                {Math.floor(rate.JPY * 100) / 100} 円
                                            </h3>
                                            <small
                                                className={`fw-bold ${
                                                    rate.JPY - historyRate.JPY >= 0
                                                        ? "text-danger"
                                                        : "text-success"
                                                }`}
                                            >
                                                {rate.JPY - historyRate.JPY >= 0 ? "+" : "-"}
                                                {Math.floor(
                                                    Math.abs(rate.JPY - historyRate.JPY) * 100
                                                ) / 100}{" "}
                                                (先週比)
                                            </small>
                                        </div>
                                    ) : (
                                        <p className="text-muted">レートデータを取得してください</p>
                                    )}
                                </div>

                                {/* 左側: グラフ（アスペクト比固定） */}
                                <div className="col-md-8">
                                    {Object.keys(weeklyRateTimeSeries || {}).length > 0 ? (
                                        <div style={{
                                            alignContent: "center",
                                            width: "100%",
                                            height: "100%",
                                            minHeight: "150px"
                                        }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={Object.entries(weeklyRateTimeSeries || {})
                                                        .map(([date, currency]) => ({
                                                            date: date,
                                                            rate: currency.JPY
                                                        }))
                                                        .sort(
                                                            (a, b) =>
                                                                new Date(a.date).getTime() - new Date(b.date).getTime()
                                                        )}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3"/>
                                                    <XAxis
                                                        dataKey="date"
                                                        tickFormatter={(dateStr) => {
                                                            const [year, month, day] = dateStr.split("-");
                                                            return `${month}/${day}`;
                                                        }}
                                                    />
                                                    <YAxis
                                                        domain={['dataMin', 'dataMax']}
                                                        allowDecimals={false}/>
                                                    <Tooltip/>
                                                    <Line
                                                        type="monotone"
                                                        dataKey="rate"
                                                        stroke="#8884d8"
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div
                                            className="bg-light d-flex align-items-center justify-content-center h-100"
                                            style={{minHeight: "250px"}}
                                        >
                                            <span className="text-muted small">データなし</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                            <small className="text-secondary">
                                更新日: {new Date().toLocaleDateString()}
                            </small>
                        </div>
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


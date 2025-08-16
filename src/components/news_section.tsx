import {useState} from "react";

export default function NewsSection({newsList}: { newsList: any[] }) {
    const itemsPerPage = 5; // 1ページあたりの件数
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(newsList.length / itemsPerPage);

    // ページ切り替え処理
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // 表示するニュースの範囲を計算
    const paginatedNews = newsList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ページ番号UI
    const PaginationUI = () => {
        const pageNeighbours = 2; // 現在ページの前後に表示するページ数
        const startEdge = Math.min((totalPages - pageNeighbours) - currentPage, 0);
        const endEdge = Math.max((pageNeighbours + 1) - currentPage, 0);
        const startPage = Math.max(1, currentPage - pageNeighbours + startEdge);
        const endPage = Math.min(totalPages, currentPage + pageNeighbours + endEdge );

        const pageNumbers = [];
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <nav>
                <ul className="pagination justify-content-center">
                    {/* 前へボタン */}
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            &laquo;
                        </button>
                    </li>

                    {/* ページ番号 */}
                    {pageNumbers.map((page) => (
                        <li
                            key={page}
                            className={`page-item ${currentPage === page ? "active" : ""}`}
                        >
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        </li>
                    ))}

                    {/* 次へボタン */}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };


    return (
        <section>
            <h2 className="mb-4">円為替に関する最新ニュース</h2>

            {/* 上部ページネーション */}
            <PaginationUI/>

            <div className="row g-4">
                {paginatedNews.map((item) => (
                    <div className="col-12" key={item.position}>
                        <div className="card shadow-sm border-0">
                            <div className="row g-0">
                                {/* サムネイル部分 */}
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

                                {/* テキスト部分 */}
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

            {/* 下部ページネーション */}
            <PaginationUI/>
        </section>
    );
}

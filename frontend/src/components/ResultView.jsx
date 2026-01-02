import React from "react";
import PropTypes from "prop-types";

const ResultView = ({ score = 0, total = 0, details = [], onRetake = () => {}, onClose }) => {
    const percent = total ? Math.round((score / total) * 100) : 0;
    const grade =
        percent >= 90 ? "A" : percent >= 80 ? "B" : percent >= 70 ? "C" : percent >= 60 ? "D" : "F";

    const handleShare = async () => {
        const text = `I scored ${score}/${total} (${percent}%) on this quiz!`;
        if (navigator.share) {
            try {
                await navigator.share({ title: "Quiz result", text });
            } catch {
                /* user cancelled */
            }
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            // no UI here — parent app can show a toast
        } else {
            // fallback: open mailto
            window.open(`mailto:?subject=My Quiz Result&body=${encodeURIComponent(text)}`);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <header style={styles.header}>
                    <h2 style={styles.title}>Result</h2>
                    {onClose && (
                        <button aria-label="Close" onClick={onClose} style={styles.closeBtn}>
                            ×
                        </button>
                    )}
                </header>

                <div style={styles.summary}>
                    <div style={styles.scoreBlock}>
                        <div style={styles.scoreValue}>{score}</div>
                        <div style={styles.scoreLabel}>/ {total}</div>
                    </div>
                    <div style={styles.meta}>
                        <div style={styles.percent}>{percent}%</div>
                        <div style={styles.grade}>Grade: {grade}</div>
                    </div>
                </div>

                <div style={styles.actions}>
                    <button onClick={onRetake} style={{ ...styles.btn, ...styles.primary }}>
                        Retake Quiz
                    </button>
                    <button onClick={handleShare} style={styles.btn}>
                        Share
                    </button>
                </div>

                {details && details.length > 0 && (
                    <section style={styles.breakdown}>
                        <h3 style={styles.breakdownTitle}>Question breakdown</h3>
                        <ul style={styles.list}>
                            {details.map((d, i) => (
                                <li
                                    key={i}
                                    style={{
                                        ...styles.item,
                                        background: d.correct ? "#e6ffed" : "#fff6f6",
                                        borderLeft: d.correct ? "4px solid #2ecc71" : "4px solid #e74c3c",
                                    }}
                                >
                                    <div style={styles.qIndex}>Q{i + 1}</div>
                                    <div style={styles.qText}>{d.question}</div>
                                    <div style={styles.qResult}>{d.correct ? "Correct" : "Incorrect"}</div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
};

ResultView.propTypes = {
    score: PropTypes.number,
    total: PropTypes.number,
    details: PropTypes.arrayOf(
        PropTypes.shape({
            question: PropTypes.string,
            correct: PropTypes.bool,
        })
    ),
    onRetake: PropTypes.func,
    onClose: PropTypes.func,
};

export default ResultView;

const styles = {
    overlay: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        width: 760,
        maxWidth: "100%",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        padding: 20,
        boxSizing: "border-box",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: { margin: 0, fontSize: 20 },
    closeBtn: {
        background: "transparent",
        border: "none",
        fontSize: 22,
        cursor: "pointer",
        lineHeight: 1,
    },
    summary: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
    },
    scoreBlock: {
        display: "flex",
        alignItems: "baseline",
        gap: 8,
    },
    scoreValue: { fontSize: 44, fontWeight: 700 },
    scoreLabel: { color: "#666" },
    meta: { marginLeft: "auto", textAlign: "right" },
    percent: { fontSize: 20, fontWeight: 600 },
    grade: { color: "#444" },
    actions: { display: "flex", gap: 8, marginBottom: 16 },
    btn: {
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#fafafa",
        cursor: "pointer",
    },
    primary: {
        background: "#0078d4",
        color: "#fff",
        border: "none",
    },
    breakdown: {
        marginTop: 8,
    },
    breakdownTitle: {
        margin: "8px 0",
        fontSize: 16,
    },
    list: {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "grid",
        gap: 8,
    },
    item: {
        display: "grid",
        gridTemplateColumns: "48px 1fr 120px",
        gap: 12,
        alignItems: "center",
        padding: 10,
        borderRadius: 6,
    },
    qIndex: { fontWeight: 700, color: "#333" },
    qText: { color: "#222" },
    qResult: { textAlign: "right", fontWeight: 600 },
};
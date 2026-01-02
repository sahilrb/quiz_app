import React from "react";
import PropTypes from "prop-types";

/**
 * QuizRenderer
 * Responsible only for rendering questions & collecting answers.
 * Parent (Quiz.jsx) controls submit & result.
 */
export default function QuizRenderer({ questions = [], answers = {}, onChange }) {
    if (!questions.length) {
        return <div>No questions available.</div>;
    }

    return (
        <div>
            {questions.map((q, index) => {
                const qId = q.id;
                const value = answers[qId];

                return (
                    <fieldset key={qId} style={styles.fieldset}>
                        <legend style={styles.legend}>
                            {index + 1}. {q.text}
                        </legend>

                        {/* Single choice */}
                        {q.type === "single_choice" && (
                            <div>
                                {q.options.map((opt) => (
                                    <label key={opt.id} style={styles.option}>
                                        <input
                                            type="radio"
                                            name={`q-${qId}`}
                                            value={opt.id}
                                            checked={value === opt.id}
                                            onChange={() => onChange(qId, opt.id)}
                                        />
                                        <span style={styles.optionText}>{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Text input */}
                        {q.type === "text" && (
                            <input
                                type="text"
                                value={value || ""}
                                onChange={(e) => onChange(qId, e.target.value)}
                                style={styles.textInput}
                                placeholder="Type your answer"
                            />
                        )}
                    </fieldset>
                );
            })}
        </div>
    );
}

QuizRenderer.propTypes = {
    questions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            options: PropTypes.array,
        })
    ),
    answers: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

const styles = {
    fieldset: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 6,
        border: "1px solid #ddd",
    },
    legend: {
        fontWeight: 600,
        marginBottom: 8,
    },
    option: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
        cursor: "pointer",
    },
    optionText: {
        lineHeight: 1.4,
    },
    textInput: {
        width: "100%",
        padding: 8,
        borderRadius: 4,
        border: "1px solid #ccc",
        fontSize: 14,
    },
};

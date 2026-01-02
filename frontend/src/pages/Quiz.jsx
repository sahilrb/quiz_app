import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getQuiz } from "../api";

export default function Quiz({ quizId: propQuizId, onSubmitSuccess }) {
    const params = useParams();
    const quizId = propQuizId || params.quizId || "1";

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: choiceIndexOrId }
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        getQuiz(quizId)
            .then((data) => {
                if (!mounted) return;
                setQuiz(data);
                setAnswers({});
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err.message || "Unknown error");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [quizId]);

    function handleSelect(questionId, choiceKey) {
        setAnswers((s) => ({ ...s, [questionId]: choiceKey }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!quiz) return;
        setSubmitting(true);
        setResult(null);

        // If quiz includes correct answers, score locally
        const hasCorrect =
            Array.isArray(quiz.questions) &&
            quiz.questions.every((q) => q.hasOwnProperty("correctIndex") || q.hasOwnProperty("correctId"));

        if (hasCorrect) {
            let score = 0;
            quiz.questions.forEach((q) => {
                const given = answers[q.id];
                if (q.hasOwnProperty("correctIndex")) {
                    if (given === q.correctIndex) score++;
                } else if (q.hasOwnProperty("correctId")) {
                    if (given === q.correctId) score++;
                }
            });
            setResult({ type: "local", score, total: quiz.questions.length });
            setSubmitting(false);
            if (onSubmitSuccess) onSubmitSuccess({ score, total: quiz.questions.length });
            return;
        }

        // Otherwise post answers to backend for scoring
        try {
            const data = getQuiz(quizId).then((quizData) => {
                return {
                    quiz: quizData,
                    answers: answers,
                };
            }
            );

            setResult({ type: "server", payload: data });
            if (onSubmitSuccess) onSubmitSuccess(data);
        } catch (err) {
            setError(err.message || "Submit error");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div>Loading quiz...</div>;
    if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
    if (!quiz) return <div>No quiz found.</div>;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
            <h1>{quiz.title || "Quiz"}</h1>
            {quiz.description && <p>{quiz.description}</p>}

            <form onSubmit={handleSubmit}>
                {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
                    quiz.questions.map((q, qi) => {
                        const qKey = q.id ?? qi;
                        const choices = Array.isArray(q.choices) ? q.choices : [];
                        return (
                            <fieldset key={qKey} style={{ marginBottom: 16 }}>
                                <legend style={{ fontWeight: "600" }}>
                                    {qi + 1}. {q.text || q.prompt}
                                </legend>

                                {choices.length > 0 ? (
                                    choices.map((choice, ci) => {
                                        const choiceId = choice.id ?? ci;
                                        const label = choice.text ?? choice;
                                        const inputValue = q.hasOwnProperty("correctId") ? choiceId : ci;
                                        const name = `q-${qKey}`;
                                        return (
                                            <label key={choiceId} style={{ display: "block", marginBottom: 6 }}>
                                                <input
                                                    type="radio"
                                                    name={name}
                                                    value={inputValue}
                                                    checked={answers[qKey] === inputValue}
                                                    onChange={() => handleSelect(qKey, inputValue)}
                                                />{" "}
                                                {label}
                                            </label>
                                        );
                                    })
                                ) : (
                                    // fallback to free text
                                    <input
                                        type="text"
                                        value={answers[qKey] ?? ""}
                                        onChange={(e) => handleSelect(qKey, e.target.value)}
                                        style={{ width: "100%", padding: 8 }}
                                    />
                                )}
                            </fieldset>
                        );
                    })
                ) : (
                    <div>No questions in this quiz.</div>
                )}

                <div style={{ marginTop: 12 }}>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>

            {result && result.type === "local" && (
                <div style={{ marginTop: 16 }}>
                    <strong>
                        Score: {result.score} / {result.total}
                    </strong>
                </div>
            )}

            {result && result.type === "server" && (
                <div style={{ marginTop: 16 }}>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.payload, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

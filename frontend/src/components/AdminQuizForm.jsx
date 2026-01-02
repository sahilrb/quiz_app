import React, { useState, useMemo } from "react";
import { createQuiz } from "../api";

/**
 * AdminQuizForm.jsx
 *
 * Props:
 * - initialQuiz: optional object { id, title, description, questions: [{ id, text, options: [str], correctIndex }] }
 * - onSubmit: optional async function(quiz) => Promise. Default posts to /api/quizzes (creates or updates)
 *
 * Usage:
 * <AdminQuizForm onSubmit={myHandler} initialQuiz={...} />
 */

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
// small RFC4122 v4 UUID generator for browsers that lack crypto.randomUUID
const uuidv4 = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export default function AdminQuizForm({ initialQuiz = null, onSubmit = null }) {
    const [title, setTitle] = useState(initialQuiz?.title || "");
    const [description, setDescription] = useState(initialQuiz?.description || "");
    const [questions, setQuestions] = useState(
        (initialQuiz?.questions || []).map((q) => ({
            id: q.id || uid(),
            text: q.text || "",
            options: q.options?.length ? q.options.slice() : ["", ""],
            correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        }))
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEdit = !!initialQuiz?.id;

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            { id: uid(), text: "", options: ["", ""], correctIndex: 0 },
        ]);
    };

    const removeQuestion = (id) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const updateQuestionText = (id, text) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
    };

    const addOption = (qid) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid ? { ...q, options: [...q.options, "" ] } : q
            )
        );
    };

    const removeOption = (qid, index) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qid) return q;
                const newOptions = q.options.filter((_, i) => i !== index);
                let newCorrect = q.correctIndex;
                if (index < q.correctIndex) newCorrect = q.correctIndex - 1;
                if (newCorrect >= newOptions.length) newCorrect = Math.max(0, newOptions.length - 1);
                return { ...q, options: newOptions, correctIndex: newCorrect };
            })
        );
    };

    const updateOptionText = (qid, index, text) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid
                    ? { ...q, options: q.options.map((opt, i) => (i === index ? text : opt)) }
                    : q
            )
        );
    };

    const setCorrectIndex = (qid, index) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === qid ? { ...q, correctIndex: index } : q))
        );
    };

    const validate = useMemo(() => {
        if (!title.trim()) return "Title is required";
        if (questions.length === 0) return "At least one question is required";
        for (const [qi, q] of questions.entries()) {
            if (!q.text.trim()) return `Question ${qi + 1}: text is required`;
            if (!Array.isArray(q.options) || q.options.length < 2)
                return `Question ${qi + 1}: at least two options are required`;
            for (const [oi, opt] of q.options.entries()) {
                if (!opt.trim()) return `Question ${qi + 1}, Option ${oi + 1}: text is required`;
            }
            if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
                return `Question ${qi + 1}: correct answer is invalid`;
        }
        return null;
    }, [title, questions]);

    const defaultSubmit = async (quiz) => {
        console.log("Submitting quiz:", quiz);
        return createQuiz(quiz);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (validate) {
            setError(validate);
            return;
        }
        // Build payload matching backend `QuizInDB` schema:
        // - quiz id must be a valid UUID
        // - questions[].id must be UUID
        // - questions[].options must be array of { id, text, is_correct }
        const quizId = initialQuiz?.id || uuidv4();
        const payload = {
            // id: quizId,
            title: title.trim(),
            questions: questions.map((q) => {
                const qid = q.id && q.id.length === 36 ? q.id : uuidv4();
                const opts = q.options.map((optText, oi) => ({
                    // id: uuidv4(),
                    text: optText.trim(),
                    is_correct: oi === q.correctIndex,
                }));
                return {
                    id: qid,
                    text: q.text.trim(),
                    options: opts,
                    type: "single_choice",
                    // multiple_choice: false,
                    // points: 1,
                };
            }),
        };
        setSubmitting(true);
        try {
            const submitFn = onSubmit || defaultSubmit;
            const result = await submitFn(payload);
            // Optionally you might redirect or reset form — caller can handle via onSubmit result
            setSubmitting(false);
            return result;
        } catch (err) {
            setError(err.message || "Submission failed");
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2>{isEdit ? "Edit Quiz" : "Create Quiz"}</h2>

            <div style={{ marginBottom: 12 }}>
                <label>
                    Title
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Quiz title"
                        required
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>
                    Description
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                        rows={3}
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
                    />
                </label>
            </div>

            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Questions</h3>
                    <button type="button" onClick={addQuestion} style={{ padding: "6px 10px" }}>
                        + Add question
                    </button>
                </div>

                {questions.length === 0 && <p style={{ color: "#666" }}>No questions yet.</p>}

                {questions.map((q, qi) => (
                    <fieldset key={q.id} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <legend style={{ fontWeight: "bold" }}>Question {qi + 1}</legend>
                            <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                            >
                                Remove
                            </button>
                        </div>

                        <div style={{ marginTop: 8 }}>
                            <input
                                value={q.text}
                                onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                placeholder="Question text"
                                style={{ display: "block", width: "100%", padding: 8 }}
                            />
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div style={{ marginBottom: 6, fontSize: 14 }}>Options (select the correct one)</div>
                            {q.options.map((opt, oi) => (
                                <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                    <input
                                        type="radio"
                                        name={`correct-${q.id}`}
                                        checked={q.correctIndex === oi}
                                        onChange={() => setCorrectIndex(q.id, oi)}
                                    />
                                    <input
                                        value={opt}
                                        onChange={(e) => updateOptionText(q.id, oi, e.target.value)}
                                        placeholder={`Option ${oi + 1}`}
                                        style={{ flex: 1, padding: 6 }}
                                    />
                                    {q.options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(q.id, oi)} style={{ color: "red" }}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div style={{ marginTop: 6 }}>
                                <button type="button" onClick={() => addOption(q.id)}>
                                    + Add option
                                </button>
                            </div>
                        </div>
                    </fieldset>
                ))}
            </div>

            {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={!!validate || submitting} style={{ padding: "8px 12px" }}>
                    {submitting ? "Saving..." : isEdit ? "Update Quiz" : "Create Quiz"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        // reset to initial or empty
                        setTitle(initialQuiz?.title || "");
                        setDescription(initialQuiz?.description || "");
                        setQuestions(
                            (initialQuiz?.questions || []).map((q) => ({
                                id: q.id || uid(),
                                text: q.text || "",
                                options: q.options?.length ? q.options.slice() : ["", ""],
                                correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
                            }))
                        );
                        setError(null);
                    }}
                    style={{ padding: "8px 12px" }}
                >
                    Reset
                </button>
            </div>
        </form>
    );
}

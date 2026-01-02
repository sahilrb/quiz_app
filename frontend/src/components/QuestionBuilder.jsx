import React, { useState, useEffect } from "react";

/**
 * QuestionBuilder
 *
 * Props:
 * - initialQuestion: { id?, text: string, options: string[], correctIndex: number }
 * - onSave: function(questionObject) -> void
 * - onCancel: function() -> void
 *
 * Simple, self-contained question builder for single-correct multiple choice questions.
 */
export default function QuestionBuilder({ initialQuestion, onSave, onCancel }) {
    const [text, setText] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [correctIndex, setCorrectIndex] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialQuestion) {
            setText(initialQuestion.text || "");
            setOptions(
                Array.isArray(initialQuestion.options) && initialQuestion.options.length >= 2
                    ? initialQuestion.options.slice()
                    : ["", ""]
            );
            setCorrectIndex(
                typeof initialQuestion.correctIndex === "number" ? initialQuestion.correctIndex : null
            );
        }
    }, [initialQuestion]);

    const updateOption = (idx, value) => {
        const next = options.slice();
        next[idx] = value;
        setOptions(next);
    };

    const addOption = () => setOptions((o) => [...o, ""]);

    const removeOption = (idx) => {
        if (options.length <= 2) return;
        const next = options.slice();
        next.splice(idx, 1);
        setOptions(next);
        if (correctIndex === idx) setCorrectIndex(null);
        else if (correctIndex > idx) setCorrectIndex((c) => c - 1);
    };

    const validate = () => {
        if (!text.trim()) {
            setError("Question text is required.");
            return false;
        }
        if (options.length < 2) {
            setError("At least two options are required.");
            return false;
        }
        if (options.some((o) => !o.trim())) {
            setError("All options must have non-empty text.");
            return false;
        }
        if (correctIndex === null || correctIndex < 0 || correctIndex >= options.length) {
            setError("Please select the correct option.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;
        const question = {
            id: initialQuestion && initialQuestion.id,
            text: text.trim(),
            options: options.map((o) => o.trim()),
            correctIndex,
        };
        if (onSave) onSave(question);
    };

    return (
        <div style={{ maxWidth: 700, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
            <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>Question</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: 8, fontSize: 14 }}
                    placeholder="Enter question text"
                />
            </div>

            <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>Options</label>
                {options.map((opt, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 6,
                        }}
                    >
                        <input
                            type="radio"
                            name="correctOption"
                            checked={correctIndex === idx}
                            onChange={() => setCorrectIndex(idx)}
                            aria-label={`Mark option ${idx + 1} correct`}
                        />
                        <input
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            style={{ flex: 1, padding: 6, fontSize: 14 }}
                        />
                        <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            disabled={options.length <= 2}
                            title="Remove option"
                            style={{
                                padding: "6px 8px",
                                cursor: options.length <= 2 ? "not-allowed" : "pointer",
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <div style={{ marginTop: 8 }}>
                    <button type="button" onClick={addOption} style={{ marginRight: 8, padding: "6px 10px" }}>
                        Add option
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ color: "crimson", marginTop: 10, fontSize: 13 }}>
                    {error}
                </div>
            )}

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button type="button" onClick={handleSave} style={{ padding: "8px 12px" }}>
                    Save
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (onCancel) onCancel();
                    }}
                    style={{ padding: "8px 12px" }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
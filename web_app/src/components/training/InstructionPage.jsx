import { useEffect } from "react";
import instructionContent from "../../data/questions/training/instruction";

export default function InstructionPage({ onValidChange, uid }) {
    const storageKey = `train-${uid ?? "anon"}-training-instruction-draft`;

    // Mark valid + persist once on mount
    useEffect(() => {
        onValidChange?.(true);
        try {
            const payload = {
                isValid: true,
                updatedAtMs: Date.now()
            };
            localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch { }
    }, [storageKey]);

    return (
        <div className="space-y-6">
            {/* Intro paragraphs */}
            <div className="text-base leading-relaxed space-y-3">
                {instructionContent.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full border border-base-300">
                    <tbody>
                        {instructionContent.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="align-top">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border border-base-300 p-4">
                                        <div className="font-semibold mb-2">{cell.title}</div>
                                        <div className="text-sm leading-relaxed">{cell.text}</div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Outro */}
            <p className="text-base leading-relaxed">
                {instructionContent.outro}
            </p>
        </div>
    );
}

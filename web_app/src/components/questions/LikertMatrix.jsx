import ReadAloudButton from "../ReadAloudButton";

export default function LikertMatrix({
    baseKey,
    label,
    rows = [],
    columns = [],
    answers = {},
    onChangeRow,
    onSelect,
    onClick,
}) {
    const optionsListText = columns.map(c => c.label).join(", ");
    const speechText =
        `${label}. ` +
        rows.map((r, i) => `${i + 1}: ${r.label}. Options: ${optionsListText}`).join(" ");

    return (
        <div className="space-y-3">
            <div className="block font-medium">
                {label}
                <ReadAloudButton onClick={onClick} text={speechText} />
            </div>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th></th>
                            {columns.map(col => (
                                <th key={col.key} className="text-center" scope="col">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const answerKey = `${baseKey}-${row.key}`;
                            const rowVal = answers[answerKey] ?? "";
                            return (
                                <tr key={row.key}>
                                    <th className="font-medium" scope="row">{row.label}</th>
                                    {columns.map(col => {
                                        const id = `${baseKey}__${row.key}__${col.key}`;
                                        return (
                                            <td key={col.key} className="text-center">
                                                <label htmlFor={id} className="inline-flex items-center">
                                                    <input
                                                        id={id}
                                                        type="radio"
                                                        name={`${baseKey}__${row.key}`}
                                                        value={col.key}
                                                        checked={rowVal === col.label}
                                                        onChange={() => {
                                                            onChangeRow?.(row.key, col.label);
                                                            onSelect?.(`${row.label}: ${col.label}`);
                                                        }}
                                                    />
                                                    <span className="sr-only">{row.label}: {col.label}</span>
                                                </label>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

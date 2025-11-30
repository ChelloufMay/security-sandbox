
export default function FeatureExplain({ title, whatIs, whatDoes, steps, notes }: {
    title: string; whatIs: string; whatDoes: string; steps: string[]; notes?: string;
}) {
    return (
        <div className="form-card">
            <h2 className="feature-title">{title}</h2>
            <p className="feature-explain">{whatIs}</p>

            <div className="mt-3">
                <h3 className="font-semibold">What it does</h3>
                <p className="text-sm text-gray-600 mt-2">{whatDoes}</p>
            </div>

            <div className="mt-4">
                <h3 className="font-semibold">Steps</h3>
                <ol className="step-list mt-2">
                    {steps.map((s, i) => <li key={i} className="mb-2">{s}</li>)}
                </ol>
            </div>

            {notes ? <div className="mt-4 text-sm text-gray-600">{notes}</div> : null}
        </div>
    );
}

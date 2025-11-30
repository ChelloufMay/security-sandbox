// frontend/src/pages/Features.tsx
import { useNavigate } from "react-router-dom";
import { FeaturesContent } from "../content/features";

export default function Features() {
    const keys = Object.keys(FeaturesContent) as Array<keyof typeof FeaturesContent>;
    const nav = useNavigate();

    return (
        <div className="container py-10">
            <div className="hero mx-auto max-w-3xl">
                <h1 className="mb-3">Choose a security feature</h1>
                <p className="text-sm text-gray-600 mb-6">Click a feature to open its page. The header only contains logout (far right).</p>

                <div className="form-card">
                    <div className="features-grid">
                        {keys.map((k) => (
                            <button key={k} onClick={() => nav(`/feature/${k}`)} className="feature-btn">
                                {FeaturesContent[k].title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

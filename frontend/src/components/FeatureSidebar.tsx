import { Link } from "react-router-dom";
import { FeaturesContent } from "../content/features";

export default function FeatureSidebar({ currentKey }: { currentKey?: string }) {
    const keys = Object.keys(FeaturesContent);
    return (
        <aside className="page-sidebar">
            <div className="form-card">
                <div className="sidebar-title">Security features</div>
                <div className="mt-2">
                    {keys.map((k) => (
                        <Link key={k} to={`/feature/${k}`} className={"sidebar-link" + (k === currentKey ? " active" : "")}>
                            {FeaturesContent[k].title}
                        </Link>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <Link to="/features" className="sidebar-link">Back to features</Link>
                    <div style={{ height: 8 }} />
                    <Link to="/" className="sidebar-link">Logout</Link>
                </div>
            </div>
        </aside>
    );
}

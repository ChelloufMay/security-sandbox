// frontend/src/pages/FeaturePage.tsx
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FeaturesContent } from "../content/features";
import FeatureExplain from "../components/FeatureExplain";

/* interactive feature components */
import CSRFDemo from "../components/interactive/CSRFDemo";
import InboxInteractive from "../components/interactive/InboxInteractive";
import SMSInteractive from "../components/interactive/SMSInteractive";
import TOTPInteractive from "../components/interactive/TOTPInteractive";
import HashInfoInteractive from "../components/interactive/HashInfoInteractive";
import RBACInteractive from "../components/interactive/RBACInteractive";
import LogsInteractive from "../components/interactive/LogsInteractive";
import SymmetricDemo from "../pages/Demo/Symmetric";
import RSADemo from "../pages/Demo/RSA";
import VaultsPage from "../pages/Demo/Vaults";

export default function FeaturePage() {
    const { featureKey } = useParams() as { featureKey?: string };
    const key = featureKey ?? "email";
    const content = FeaturesContent[key];

    function renderInteractive(k: string) {
        switch (k) {
            case "csrf": return <CSRFDemo />;
            case "inbox": return <InboxInteractive />;
            case "sms": return <SMSInteractive />;
            case "totp": return <TOTPInteractive />;
            case "hash-info": return <HashInfoInteractive />;
            case "rbac": return <RBACInteractive />;
            case "logs": return <LogsInteractive />;
            case "symmetric": return <SymmetricDemo />;
            case "rsa": return <RSADemo />;
            case "vaults": return <VaultsPage />;
            case "email": // email is covered by register/verify flow; show simple note
                return <div className="form-card">This project uses email MFA during registration. Use Register → Verify flows to exercise it.</div>;
            default:
                return <div className="form-card">Interactive demo not implemented for this feature yet.</div>;
        }
    }

    return (
        <div className="container py-8">
            <div className="page-grid">
                <Sidebar currentKey={key} />
                <div className="page-main">
                    <FeatureExplain title={content.title} whatIs={content.whatIs} whatDoes={content.whatDoes} steps={content.steps} notes={content.notes} />
                    <div className="mt-4">{renderInteractive(key)}</div>
                </div>
            </div>
        </div>
    );
}

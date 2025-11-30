export type FeatureDef = {
    title: string;
    whatIs: string;
    whatDoes: string;
    steps: string[];
    notes?: string;
};

export const FeaturesContent: Record<string, FeatureDef> = {
    csrf: {
        title: "CSRF (demo)",
        whatIs: "Cross-Site Request Forgery: we demonstrate using the CSRF token and how requests are protected.",
        whatDoes: "Frontend will attempt a state-changing POST while showing whether CSRF is required/accepted by server.",
        steps: [
            "Ensure you are logged in (session cookie).",
            "Click 'Send CSRF-protected POST' to attempt a protected request; the UI will include X-CSRFToken header automatically."
        ],
        notes: ""
    },
    email: {
        title: "Email MFA (already used during register)",
        whatIs: "Email-based multi-factor authentication (6-digit code).",
        whatDoes: "Registration triggers email send, MailHog captures it. Use Verify screen to paste code and finish.",
        steps: [
            "Register with username/email/password.",
            "Open MailHog (http://localhost:8025) and copy the 6-digit code.",
            "Paste code into Verify screen and confirm."
        ],
        notes: ""
    },
    sms: {
        title: "SMS (simulated)",
        whatIs: "Simulated SMS verification using the backend Inbox and token storage.",
        whatDoes: "Send an SMS token (simulated) and verify it.",
        steps: ["Send SMS using the Send button.", "Open Inbox to read token and use Verify to confirm it."],
        notes: ""
    },
    totp: {
        title: "TOTP",
        whatIs: "Time-based One-Time Password for 2FA.",
        whatDoes: "Setup secret, scan QR, verify code from authenticator app.",
        steps: ["Setup secret", "Scan QR", "Verify the code in the app"],
        notes: ""
    },
    "hash-info": {
        title: "Password hash info",
        whatIs: "Compute an Argon2 hash on the backend and measure the time.",
        whatDoes: "Send a password to /password/hash-info/ to see a generated hash and elapsed time.",
        steps: ["Enter a password", "Click 'Hash' to send to backend", "See resulting hash + time (ms)"],
        notes: ""
    },
    rbac: {
        title: "RBAC (Role Requests)",
        whatIs: "Request a role and — if you are admin — approve role requests.",
        whatDoes: "User can request a role. Admins can approve by providing request ID (demo).",
        steps: [
            "Request a role (e.g., 'admin' or 'moderator').",
            "If you are admin, approve a request by its ID (returned on creation)."
        ],
        notes: "This is a demo: approvals set a 15-minute expiry per backend logic."
    },
    logs: {
        title: "View logs",
        whatIs: "View recent application events created by the backend.",
        whatDoes: "Fetches /logs/ and displays the latest events.",
        steps: ["Click 'Refresh logs' to load the last 200 events."],
        notes: ""
    },
    "symmetric": {
        title: "Symmetric (AES-GCM)",
        whatIs: "Authenticated symmetric encryption using AES-GCM.",
        whatDoes: "Encrypt plaintext and decrypt it using returned key+nonce.",
        steps: ["Encrypt", "Decrypt"],
        notes: ""
    },
    rsa: {
        title: "RSA (sign/verify)",
        whatIs: "Asymmetric signing and verification demo.",
        whatDoes: "Generate keys, sign and verify messages.",
        steps: ["Generate keys", "Sign", "Verify"],
        notes: ""
    },
    vaults: {
        title: "Vaults",
        whatIs: "Create vaults, store secrets, retrieve and rotate keys.",
        whatDoes: "Managed/unmanaged vaults and secrets stored via the vault key.",
        steps: ["Create vault", "Store secret", "Retrieve secret", "Rotate vault"],
        notes: ""
    },
    inbox: {
        title: "Inbox",
        whatIs: "View demo Inbox messages (email + sms); MailHog captures emails.",
        whatDoes: "List messages, filter by email or sms, copy message body.",
        steps: ["Open Inbox", "Filter by type", "Copy or inspect message body"],
        notes: ""
    }
};

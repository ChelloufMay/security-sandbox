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
        whatIs: "Cross-Site Request Forgery: we demonstrate using the CSRF token and how requests are protected. " +
            " Prevents an attacker from making authenticated requests (via victim’s browser cookies) to your site from another origin.",
        whatDoes: "Requiring a token tied to the user’s session stops cross-site forms or scripts from performing state-changing actions.",
        steps: [
            "Ensure you are logged in (session cookie).",
            "Click 'Send CSRF-protected POST' to attempt a protected request; the UI will include X-CSRFToken header automatically."
        ],
        notes: "-Limits in this project-->\n\n" +
            "If the SPA doesn’t reliably get/set the csrftoken cookie (or initial view doesn’t set it), CSRF protection may be bypassed or broken in dev. Also CSRF defends browser-based attacks — it’s not a substitute for auth checks or CORS configuration.\n\n"
    },
    email: {
        title: "Email MFA (already used during register)",
        whatIs: "Email-based multi-factor authentication (6-digit code).",
        whatDoes: "Registration triggers email send, MailHog captures it. Use Verify screen to paste code and finish. --> Verifies ownership of the email address and adds an extra step to prevent account takeover if the attacker doesn’t have access to the mailbox.",
        steps: [
            "Register with username/email/password.",
            "Open MailHog (http://localhost:8025) and copy the 6-digit code.",
            "Paste code into Verify screen and confirm."
        ],
        notes: "-Limits in this project-->\n\n" +
            "Implementation is simulated using MailHog / InboxMessage. Tokens are short numeric codes which have lower entropy than some other factors. There is no rate-limiting or lockout, and messages are visible in the dev inbox."
    },
    sms: {
        title: "SMS (simulated)",
        whatIs: "Simulated SMS verification using the backend Inbox and token storage.",
        whatDoes: "Send an SMS token (simulated) and verify it.--> Verifies possession of a phone number; second factor increases account security.",
        steps: ["Send SMS using the Send button.", "Open Inbox to read token and use Verify to confirm it."],
        notes:
            "- Limits in this project-->\n\n" +
            "SMS delivery is simulated and not secure against real-world threats (SIM swap, SS7). The demo stores tokens in the inbox; do not do this in production."
    },
    totp: {
        title: "TOTP",
        whatIs: "Time-based One-Time Password for 2FA.",
        whatDoes: "Setup secret, scan QR, verify code from authenticator app.-->Provides a phishing-resistant second factor (compared to SMS), requires possession of secret on authenticator device.",
        steps: ["Setup secret", "Scan QR", "Verify the code in the app"],
        notes:
            "-Limits in this project-->\n\n" +
            "TOTP secrets are stored on user.profile (likely plaintext in DB). There are no backup codes, no recovery flow, and no brute-force rate limit on verification in the demo."
    },
    "hash-info": {
        title: "Password hash info",
        whatIs: "Compute an Argon2 hash on the backend and measure the time.",
        whatDoes: "Send a password to /password/hash-info/ to see a generated hash and elapsed time.-->Demonstrates the use of memory-hard hashing (Argon2) that defends against offline cracking and encourages using slow hashes for passwords.",
        steps: ["Enter a password", "Click 'Hash' to send to backend", "See resulting hash + time (ms)"],
        notes:
            "- Limits in this project-->\n\n" +
            "This endpoint is educational — it must be rate-limited and not exposed publicly in production since computing Argon2 is CPU/memory intensive and returning hashes of arbitrary input is dangerous."
    },

    rbac: {
        title: "RBAC (Role Requests)",
        whatIs: "Request a role and — if you are admin — approve role requests.-->Limits privilege assignment to admins and allows temporary elevation controls in demo.",
        whatDoes: "User can request a role. Admins can approve by providing request ID (demo).",
        steps: [
            "Request a role (e.g., 'admin' or 'moderator').",
            "If you are admin, approve a request by its ID (returned on creation)."
        ],
        notes:
            "-Limits in this project-->\n\n" +
            "Demo logic has an admin-check bug: missing profile could bypass admin check. In production, role assignment must be strictly enforced and audited."
    },
    logs: {
        title: "View logs",
        whatIs: "View recent application events created by the backend.",
        whatDoes: "Fetches /logs/ and displays the latest events.-->Keeps an audit trail to investigate incidents and detect anomalies.",
        steps: ["Click 'Refresh logs' to load the last 200 events."],
        notes:
            "-Limits in this project-->\n\n" +
            "Logs are returned to any authenticated user in the demo — restrict log viewing to auditors/admins and redact sensitive data in production."
    },
    "symmetric": {
        title: "Symmetric (AES-GCM)",
        whatIs: "Authenticated symmetric encryption using AES-GCM.",
        whatDoes: "Encrypt plaintext and decrypt it using returned key+nonce.",
        steps: ["Encrypt", "Decrypt"],
        notes:
            "-Limits in this project-->\n\n" +
            "Demo-level symmetric encryption is fine for learning; production must use authenticated encryption and proper key storage (KMS/HSM)."
    },
    rsa: {
        title: "RSA (sign/verify)",
        whatIs: "Asymmetric signing and verification demo.",
        whatDoes: "Generate keys, sign and verify messages.-->Symmetric keys encrypt secret blobs; RSA can be used to protect keys (wrap/unwrap) or sign things.",
        steps: ["Generate keys", "Sign", "Verify"],
        notes:
            "-Limits in this project-->\n\n" +
            "If RSA keys are stored or generated insecurely, it undermines the demo. Use secure key handling and modern curve algorithms where possible (ECDSA/Ed25519) in production."
    },
    vaults: {
        title: "Vaults",
        whatIs: "Create vaults, store secrets, retrieve and rotate keys.",
        whatDoes: "Managed/unmanaged vaults and secrets stored via the vault key.-->Demonstrates symmetric encryption concepts, key rotation, and secret storage inside an access-controlled service.",
        steps: ["Create vault", "Store secret", "Retrieve secret", "Rotate vault"],
        notes:
            "-Limits in this project-->\n\n" +
            "Vault keys and secrets in the demo are not managed by a KMS/HSM and may be stored in DB. Production secret managers should use envelope encryption, audited access, and hardware-backed key stores."
    },
    inbox: {
        title: "Inbox",
        whatIs: "View demo Inbox messages (email + sms); MailHog captures emails.",
        whatDoes: "List messages, filter by email or sms, copy message body.-->Makes it easy to view messages in the UI during development without relying on external services.",
        steps: ["Open Inbox", "Filter by type", "Copy or inspect message body"],
        notes:
            "-Limits in this project-->\n\n" +
            "Inbox is convenient in dev but storing tokens/messages in plain DB and exposing them to unauthenticated users is insecure. In production, limit access and avoid storing sensitive codes in readable form."
    }
};

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
        whatIs: "CSRF est une attaque où un site malveillant essaie d’utiliser votre navigateur pour envoyer des actions à votre place, sans votre accord.",
        whatDoes:  "Un jeton spécial (CSRF token) est ajouté aux requêtes. Si le jeton est absent ou incorrect, l’action est refusée.",
        steps: [
            "Étant donné que vous êtes connecté, vous disposez automatiquement d'un (cookie de session ).",
            "Quand vous cliquez sur le bouton, la requête vers (http://127.0.0.1:8000/sanctum/csrf-cookie) demande au serveur de créer et d’envoyer un cookie CSRF au navigateur afin que les prochaines requêtes puissent être vérifiées et protégées."
        ],
        notes: `-Limites dans ce projet: 
        La protection CSRF peut ne pas fonctionner correctement si l’application ne récupère pas bien le cookie csrftoken.
        + Cette protection fonctionne seulement contre les attaques via navigateur.
        + Elle ne remplace pas la vérification de connexion ou la configuration CORS.`
    },
    email: {
        title: "Email MFA (utiliser lors de la sign in)",
        whatIs: "Email-based multi-factor authentication (6-digit code): Une sécurité supplémentaire qui envoie un code à votre adresse e-mail.",
        whatDoes: "L’inscription déclenche l’envoi d’un e-mail, capturé par MailHog. Utilisez l’écran de vérification pour coller le code et finaliser. --> Vérifie la possession de l’adresse e-mail et ajoute une étape supplémentaire pour empêcher la prise de contrôle du compte si l’attaquant n’a pas accès à la boîte mail.",
        steps: [
            "S’inscrire avec nom d’utilisateur / e-mail / mot de passe.",
            "Ouvrir MailHog (http://localhost:8025) et copier le code à 6 chiffres.",
            "Coller le code dans l’écran de vérification et confirmer."
        ],
        notes: `-Limites dans ce projet:
        L’implémentation est simulée à l’aide de MailHog / InboxMessage.
        + Les jetons sont de courts codes numériques ayant une entropie plus faible que certains autres facteurs.
        + Il n’y a ni limitation de tentatives ni verrouillage, et les messages sont visibles dans la boîte de réception de développement.`
    },
    sms: {
        title: "SMS",
        whatIs: "Vérification SMS simulée à l’aide de la boîte de réception backend et du stockage de jetons.",
        whatDoes: "Envoi d’un jeton SMS (simulé) et vérification. --> Vérifie la possession d’un numéro de téléphone ; le second facteur renforce la sécurité du compte.",
        steps: [
            "Envoyer un SMS en utilisant le bouton Send.",
            "Ouvrir Inbox pour lire le jeton et utiliser Verify pour le confirmer."],
        notes: `-Limites dans ce projet:
        La livraison SMS est simulée et n’est pas sécurisée contre les menaces réelles (SIM swap, SS7).
        + La démo stocke les jetons dans la boîte de réception ; ne pas faire cela en production.`
    },
    totp: {
        title: "TOTP",
        whatIs: "Mot de passe à usage unique basé sur le temps pour l’authentification à deux facteurs (2FA).",
        whatDoes: "Configurer un secret, scanner le QR code, vérifier le code depuis une application d’authentification. --> Fournit un second facteur plus résistant au phishing (comparé au SMS) et nécessite la possession du secret sur l’appareil d’authentification.",
        steps: ["Configurer le secret", "Scanner le QR code", "Vérifier le code dans l’application"],
        notes:`-Limites dans ce projet:
        Il n’y a pas de codes de secours, pas de procédure de récupération et pas de limitation contre le brute-force lors de la vérification dans la démo.`
    },
    "hash-info": {
        title: "Password hash info",
        whatIs: "Calcul d’un hachage Argon2 côté backend et mesure du temps.",
        whatDoes: "Envoie un mot de passe vers /password/hash-info/ pour afficher le hachage généré et le temps écoulé. --> Démontre l’utilisation d’un hachage gourmand en mémoire (Argon2) qui protège contre le cassage hors ligne et encourage l’utilisation de hachages lents pour les mots de passe.",
        steps: [
            "Saisir un mot de passe",
            "Cliquer sur « Hash » pour l’envoyer au backend",
            "Voir le hachage résultant et le temps (ms)"
        ],
        notes:
            `-Limites dans ce projet:
        Ce point d’accès est éducatif, il doit être limité en nombre de requêtes et ne pas être exposé publiquement en production, car le calcul d’Argon2 est coûteux en CPU/mémoire et retourner des hachages d’entrées arbitraires est dangereux.`
    },

    rbac: {
        title: "RBAC (Role Requests)",
        whatIs: "Demander un rôle et — si vous êtes administrateur — approuver les demandes de rôles. --> Limite l’attribution des privilèges aux administrateurs et permet un contrôle d’élévation temporaire dans la démo.",
        whatDoes: "L’utilisateur peut demander un rôle. Les administrateurs peuvent approuver en fournissant l’ID de la demande.",
        steps: [
            "Demander un rôle (par ex. « admin » ou « moderator »).",
            "Copier le (role request id ) pour que la demande soit accepter."
        ],
    },
    logs: {
        title: "View logs",
        whatIs: "Afficher les événements récents de l’application générés par le backend.",
        whatDoes: "Récupère /logs/ et affiche les derniers événements. --> Conserve une trace d’audit pour enquêter sur les incidents et détecter les anomalies.",
        steps: ["Cliquer sur « Refresh logs » pour charger les 200 derniers événements."],
    },
    "symmetric": {
        title: "Symmetric (AES-GCM)",
        whatIs: "Chiffrement symétrique authentifié utilisant AES-GCM.",
        whatDoes: "Chiffre un texte en clair et le déchiffre à l’aide de la clé et du nonce retournés.",
        steps: ["Encrypt", "Decrypt"],
        notes:
            `-Limites dans ce projet:
        Le chiffrement symétrique au niveau démo est adapté à l’apprentissage ; en production, il faut utiliser un chiffrement authentifié et un stockage de clés approprié (KMS/HSM).`
    },
    rsa: {
        title: "RSA (sign/verify)",
        whatIs: "Démonstration de signature et de vérification asymétriques.",
        whatDoes: "Générer des clés, signer et vérifier des messages. --> Les clés symétriques chiffrent les données secrètes ; RSA peut être utilisé pour protéger des clés (wrap/unwrap) ou signer des éléments.",
        steps: ["Generate keys", "Sign", "Verify"],
        notes:
            `-Limites dans ce projet:
        Si les clés RSA sont stockées ou générées de manière non sécurisée, cela compromet la démo. En production, utiliser une gestion sécurisée des clés et des algorithmes modernes basés sur des courbes (ECDSA / Ed25519).`
    },
    vaults: {
        title: "Vaults",
        whatIs: "Créer des coffres-forts, stocker des secrets, récupérer et faire tourner les clés.",
        whatDoes: "Coffres-forts gérés / non gérés et secrets stockés via la clé du coffre. --> Démontre les concepts de chiffrement symétrique, de rotation de clés et de stockage de secrets dans un service à accès contrôlé.",
        steps: [
            "Créer un coffre",
            "Stocker un secret",
            "Récupérer un secret",
            "Faire tourner le coffre (optionnel)"
        ],
        notes:
            `-Limites dans ce projet:
        Dans la démo, les clés et secrets ne sont pas gérés par un KMS/HSM et peuvent être stockés en base de données. En production, les gestionnaires de secrets doivent utiliser le chiffrement par enveloppe, des accès audités et des stockages de clés matériels.`
    },
    inbox: {
        title: "Inbox (Boîte de réception)",
        whatIs: "Afficher les messages de démonstration Inbox (e-mail + SMS) ; MailHog capture les e-mails.",
        whatDoes: "Lister les messages, filtrer par e-mail ou SMS, copier le contenu. --> Facilite la consultation des messages dans l’interface pendant le développement sans dépendre de services externes.",
        steps: [
            "Ouvrir Inbox",
            "Filtrer par type",
            "Copier ou inspecter le contenu du message"
        ],
    }
};

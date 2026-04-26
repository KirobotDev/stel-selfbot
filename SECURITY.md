# 🔐 SECURITY.md — Documentation de Sécurité Complète

> **Version :** 1.0.0  
> **Dernière mise à jour :** 2026-04-25  
> **Statut :** Actif  
> **Langue :** Français  

---

## Table des Matières

1. [Introduction & Philosophie de Sécurité](#1-introduction--philosophie-de-sécurité)
2. [Périmètre & Portée](#2-périmètre--portée)
3. [Signalement de Vulnérabilités](#3-signalement-de-vulnérabilités)
4. [Politique de Divulgation Responsable](#4-politique-de-divulgation-responsable)
5. [Classification des Données](#5-classification-des-données)
6. [Contrôle d'Accès & Gestion des Identités (IAM)](#6-contrôle-daccès--gestion-des-identités-iam)
7. [Authentification & Mots de Passe](#7-authentification--mots-de-passe)
8. [Cryptographie & Chiffrement](#8-cryptographie--chiffrement)
9. [Sécurité des API](#9-sécurité-des-api)
10. [Sécurité des Dépendances & Supply Chain](#10-sécurité-des-dépendances--supply-chain)
11. [Sécurité du Code & Développement Sécurisé (SSDLC)](#11-sécurité-du-code--développement-sécurisé-ssdlc)
12. [Sécurité des Infrastructures & Cloud](#12-sécurité-des-infrastructures--cloud)
13. [Sécurité des Conteneurs & Kubernetes](#13-sécurité-des-conteneurs--kubernetes)
14. [Sécurité du Réseau](#14-sécurité-du-réseau)
15. [Journalisation, Audit & Surveillance](#15-journalisation-audit--surveillance)
16. [Réponse aux Incidents](#16-réponse-aux-incidents)
17. [Plan de Reprise d'Activité (PRA/BCP)](#17-plan-de-reprise-dactivité-pracbcp)
18. [Gestion des Secrets](#18-gestion-des-secrets)
19. [Sécurité des Bases de Données](#19-sécurité-des-bases-de-données)
20. [Sécurité Frontend & Applications Web](#20-sécurité-frontend--applications-web)
21. [Tests de Sécurité & Pentesting](#21-tests-de-sécurité--pentesting)
22. [Conformité & Réglementations](#22-conformité--réglementations)
23. [Formation & Sensibilisation](#23-formation--sensibilisation)
24. [Politique de Mise à Jour & Patching](#24-politique-de-mise-à-jour--patching)
25. [Responsabilités & Contacts](#25-responsabilités--contacts)
26. [Glossaire](#26-glossaire)
27. [Changelog](#27-changelog)

---

## 1. Introduction & Philosophie de Sécurité

### 1.1 Objet du Document

Ce document constitue la référence centrale en matière de sécurité du projet. Il s'adresse à l'ensemble des parties prenantes : développeurs, DevOps, auditeurs externes, chercheurs en sécurité et contributeurs open source.

La sécurité n'est pas une fonctionnalité ajoutée en fin de cycle : c'est une propriété fondamentale, intégrée dès la conception et maintenue tout au long du cycle de vie du logiciel. Cette philosophie est connue sous le nom de **Security by Design** et **Privacy by Default**.

### 1.2 Principes Fondamentaux

Toutes les décisions de sécurité prises dans ce projet reposent sur les principes suivants :

#### Principe du Moindre Privilège (Least Privilege)
Chaque composant, service, utilisateur ou processus ne doit disposer que des droits **strictement nécessaires** à l'accomplissement de sa tâche. Aucun accès superflu n'est accordé, même temporairement. Les droits sont révisés périodiquement et révoqués dès qu'ils ne sont plus nécessaires.

#### Défense en Profondeur (Defense in Depth)
La sécurité ne repose jamais sur une couche unique. Plusieurs mécanismes de protection indépendants sont superposés : si l'un d'eux est compromis, les autres limitent l'impact. Cela inclut des contrôles au niveau réseau, applicatif, système d'exploitation, base de données et organisationnel.

#### Fail Secure (Echec Sécurisé)
En cas d'erreur ou d'état inattendu, le système doit toujours adopter le comportement le plus restrictif. Par défaut, un accès refusé est préférable à un accès accordé par défaut.

#### Séparation des Responsabilités (Separation of Duties)
Aucun acteur unique ne doit pouvoir effectuer seul une opération sensible de bout en bout. Les opérations critiques nécessitent plusieurs approbations indépendantes.

#### Zero Trust
Le modèle Zero Trust part du principe que **personne n'est de confiance par défaut**, qu'il soit à l'intérieur ou à l'extérieur du réseau. Chaque requête est vérifiée, authentifiée et autorisée explicitement.

#### Transparence & Auditabilité
Toute action sensible est tracée. Les logs sont immuables, horodatés et protégés contre la modification. L'intégralité des décisions de sécurité doit pouvoir être reconstituée à posteriori.

#### Réduction de la Surface d'Attaque (Attack Surface Reduction)
Les fonctionnalités inutilisées sont désactivées. Les ports non nécessaires sont fermés. Les composants non utilisés sont supprimés. Moins il y a de code exposé, moins il y a de vecteurs d'attaque potentiels.

### 1.3 Modèle de Menaces (Threat Model)

Ce projet adopte la méthode **STRIDE** pour l'identification des menaces :

| Menace | Description | Exemple |
|--------|-------------|---------|
| **S**poofing | Usurpation d'identité | Faux token JWT, ARP poisoning |
| **T**ampering | Altération de données | Injection SQL, modification de paquets |
| **R**epudiation | Nier avoir effectué une action | Absence de logs, logs falsifiés |
| **I**nformation Disclosure | Fuite d'information | Réponses d'erreur verbosées, fichiers exposés |
| **D**enial of Service | Déni de service | Flood réseau, bomb décompression |
| **E**levation of Privilege | Escalade de privilèges | Injection de commandes, SSRF |

Chaque fonctionnalité nouvelle doit faire l'objet d'une analyse STRIDE avant sa mise en production.

### 1.4 Niveaux de Maturité Sécurité (Security Maturity Levels)

Ce projet vise le niveau **3 (Défini)** du modèle BSIMM, avec pour objectif à terme le niveau **4 (Géré)** :

- **Niveau 1 — Initial** : Sécurité réactive, pas de processus formalisé.
- **Niveau 2 — Géré** : Processus de sécurité définis mais non systématiques.
- **Niveau 3 — Défini** : Processus standardisés, intégrés dans le SDLC.
- **Niveau 4 — Géré quantitativement** : Métriques de sécurité mesurées et pilotées.
- **Niveau 5 — Optimisé** : Amélioration continue, threat intelligence intégrée.

---

## 2. Périmètre & Portée

### 2.1 Systèmes Couverts

Ce document de sécurité s'applique à l'ensemble des systèmes suivants :

- **Application principale** : API backend, services web, interfaces utilisateur
- **Infrastructure cloud** : Instances de calcul, stockage objet, bases de données managées
- **Pipelines CI/CD** : GitHub Actions / GitLab CI, registres d'images, runners
- **Outils de développement** : Dépôts de code, gestion des secrets, outils de monitoring
- **Environnements** : Production, staging, développement (chacun avec ses propres contrôles)

### 2.2 Exclusions

Les éléments suivants sont hors périmètre direct mais peuvent faire l'objet de recommandations :

- Les postes de travail personnels des développeurs (hors MDM d'entreprise)
- Les fournisseurs tiers dont la sécurité est régie par des SLA contractuels séparés
- Les systèmes legacy non maintenus en attente de décommissionnement

### 2.3 Environnements & Ségrégation

```
┌─────────────────────────────────────────────────────────┐
│  PRODUCTION        │  STAGING           │  DEV/TEST      │
│  ─────────────────  │  ─────────────────  │  ─────────────│
│  Données réelles   │  Données anonymisées│  Données fictives│
│  Accès restreint   │  Accès équipe       │  Accès libre    │
│  MFA obligatoire   │  MFA recommandé     │  MFA optionnel  │
│  Logs immuables    │  Logs 30 jours      │  Logs 7 jours   │
│  Chiffré au repos  │  Chiffré au repos   │  Chiffrement opt│
└─────────────────────────────────────────────────────────┘
```

**Règle absolue** : Les données de production ne doivent **jamais** être copiées dans un environnement de développement ou de test sans processus d'anonymisation préalable validé.

---

## 3. Signalement de Vulnérabilités

### 3.1 Comment Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans ce projet, **ne créez pas d'issue publique GitHub**. Merci d'utiliser l'un des canaux de signalement sécurisés ci-dessous.

#### Canal Privilégié — Email Chiffré

Envoyez un email à : **security@[votre-domaine].com**

Si vous disposez de notre clé PGP publique, chiffrez votre message. Notre fingerprint PGP :

```
Fingerprint: XXXX XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX
Clé disponible sur : https://keys.openpgp.org/
```

#### Canal Alternatif — GitHub Security Advisories

Utilisez la fonctionnalité "Report a vulnerability" disponible dans l'onglet **Security** du dépôt GitHub. Ce canal est confidentiel et chiffré de bout en bout.

#### Canal d'Urgence

Pour les vulnérabilités critiques nécessitant une action immédiate (exploitation active détectée) :

- **Téléphone d'astreinte sécurité** : +XX XX XX XX XX (disponible 24h/24, 7j/7)
- **Signal** : Disponible sur demande après contact email initial

### 3.2 Informations à Inclure dans le Rapport

Un rapport de qualité accélère considérablement la prise en charge. Merci d'inclure :

```markdown
## Résumé de la Vulnérabilité
[Description concise du problème]

## Type de Vulnérabilité
[Ex: XSS, SQLi, IDOR, RCE, CSRF, ...]

## Composant(s) Affecté(s)
[Service / endpoint / version]

## Étapes de Reproduction
1. ...
2. ...
3. ...

## Preuve de Concept (PoC)
[Code, payload, captures d'écran — sans exploitation active]

## Impact Estimé
[Ce qu'un attaquant pourrait accomplir]

## Suggestions de Correction
[Optionnel mais apprécié]

## Vos Coordonnées
[Nom, email, handle si vous souhaitez être crédité]
```

### 3.3 Ce à Quoi Vous Pouvez S'Attendre

| Délai | Action |
|-------|--------|
| **24 heures** | Accusé de réception de votre rapport |
| **72 heures** | Évaluation initiale et classification de sévérité |
| **7 jours** | Confirmation de la vulnérabilité ou demande d'informations complémentaires |
| **30 jours** | Correction déployée pour les vulnérabilités critiques et hautes |
| **90 jours** | Correction déployée pour les vulnérabilités moyennes et basses |
| **Post-correction** | Publication d'un CVE et crédit public (si souhaité) |

### 3.4 Programme de Bug Bounty

Ce projet dispose d'un programme de bug bounty sur la plateforme **[HackerOne / Bugcrowd / Intigriti]**.

| Sévérité | Récompense |
|----------|------------|
| Critique (CVSS 9.0–10.0) | 1 000 € – 5 000 € |
| Haute (CVSS 7.0–8.9) | 500 € – 1 000 € |
| Moyenne (CVSS 4.0–6.9) | 100 € – 500 € |
| Basse (CVSS 0.1–3.9) | Hall of Fame |
| Informationnelle | Hall of Fame |

Les récompenses sont conditionnées au respect de la politique de divulgation responsable décrite ci-dessous.

---

## 4. Politique de Divulgation Responsable

### 4.1 Engagements de Notre Part

En échange d'un signalement responsable, nous nous engageons à :

- Ne pas entreprendre d'action légale contre le chercheur ayant respecté cette politique
- Reconnaître votre contribution publiquement (avec votre accord)
- Vous tenir informé de l'avancement de la correction
- Vous notifier avant la publication publique de la vulnérabilité

### 4.2 Ce Que Nous Demandons aux Chercheurs

- **Ne pas exploiter** la vulnérabilité au-delà de ce qui est nécessaire pour la démonstration
- **Ne pas accéder, modifier ou supprimer** des données appartenant à d'autres utilisateurs
- **Ne pas effectuer** d'attaques de déni de service, de phishing ou d'ingénierie sociale
- **Respecter le délai** de 90 jours avant toute divulgation publique (sauf accord mutuel)
- **Ne pas divulguer** la vulnérabilité à des tiers pendant la période de correction

### 4.3 Processus de Publication (Coordinated Disclosure)

1. Le chercheur signale la vulnérabilité en privé
2. Notre équipe valide et classifie la vulnérabilité
3. Un correctif est développé, testé et déployé
4. Un CVE est demandé si applicable
5. Un Security Advisory est publié sur GitHub
6. Le chercheur est crédité (si souhaité)
7. La communauté est notifiée via les canaux officiels (email, changelog, release notes)

---

## 5. Classification des Données

### 5.1 Niveaux de Sensibilité

Toutes les données traitées par ce système sont classifiées selon quatre niveaux :

#### 🔴 NIVEAU 4 — SECRET (Très Sensible)
**Exemples :** Clés privées cryptographiques, secrets d'API de production, credentials de bases de données de production, données de santé (HIPAA), données financières (PCI-DSS), fichiers de configuration de sécurité.

**Règles :**
- Stockage exclusif dans un gestionnaire de secrets dédié (Vault, AWS Secrets Manager)
- Chiffrement AES-256 au repos, TLS 1.3 en transit
- Accès restreint aux personnes ayant strictement besoin d'y accéder
- Audit log de chaque accès
- Rotation obligatoire : clés tous les 90 jours, secrets applicatifs tous les 30 jours
- Jamais dans le code source, les logs, ou les messages d'erreur

#### 🟠 NIVEAU 3 — CONFIDENTIEL
**Exemples :** Données personnelles identifiables (PII), données de sessions utilisateurs, rapports d'audit internes, métriques de performance, configuration des environnements de staging.

**Règles :**
- Chiffrement au repos et en transit obligatoire
- Accès sur demande justifiée et approbation managériale
- Conservation limitée selon la politique de rétention
- Journalisation des accès
- Anonymisation obligatoire pour usage en environnement de test

#### 🟡 NIVEAU 2 — INTERNE
**Exemples :** Documentation technique, schémas d'architecture non sensibles, données agrégées anonymisées, logs applicatifs sans PII.

**Règles :**
- Accès réservé aux membres de l'organisation
- Pas de partage public sans approbation
- Chiffrement en transit recommandé

#### 🟢 NIVEAU 1 — PUBLIC
**Exemples :** Documentation publique, changelogs, code source open source, assets marketing.

**Règles :**
- Peut être partagé librement
- Revue avant publication pour éviter toute fuite involontaire
- Pas de mélange avec des données de niveaux supérieurs

### 5.2 Matrice de Protection des Données

| Contrôle | Secret | Confidentiel | Interne | Public |
|----------|--------|--------------|---------|--------|
| Chiffrement au repos | ✅ Obligatoire | ✅ Obligatoire | 🟡 Recommandé | ➖ Non requis |
| Chiffrement en transit | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | 🟡 Recommandé |
| MFA pour accès | ✅ Obligatoire | ✅ Obligatoire | 🟡 Recommandé | ➖ Non requis |
| Audit log | ✅ Obligatoire | ✅ Obligatoire | 🟡 Recommandé | ➖ Non requis |
| DLP activé | ✅ Obligatoire | ✅ Obligatoire | ➖ Non requis | ➖ Non requis |
| Partage externe | ❌ Interdit | ⚠️ Autorisation requise | ⚠️ Autorisation requise | ✅ Libre |

### 5.3 Gestion du Cycle de Vie des Données

```
Collecte → Traitement → Stockage → Archivage → Suppression
   ↓           ↓           ↓           ↓           ↓
Consentement  Minimisation Chiffrement  Immutabilité Effacement
              Finalité     Contrôle     Accès limité certifié
                          d'accès
```

**Durées de rétention par type :**

| Type de Données | Rétention Active | Archivage | Suppression |
|-----------------|-----------------|-----------|-------------|
| Logs de sécurité | 90 jours | 1 an | 13 mois |
| Logs applicatifs | 30 jours | 6 mois | 7 mois |
| Données utilisateurs | Durée du compte + 30j | 1 an (légal) | 13 mois post-résiliation |
| Sauvegardes | 30 jours (quotidiennes) | 1 an (mensuelles) | Selon politique |
| Données financières | 5 ans (légal) | 10 ans | 11 ans |

---

## 6. Contrôle d'Accès & Gestion des Identités (IAM)

### 6.1 Modèle d'Accès — RBAC

Ce projet implémente un modèle **Role-Based Access Control (RBAC)** avec les rôles suivants :

```
┌──────────────────────────────────────────────────────────┐
│                    HIÉRARCHIE DES RÔLES                  │
│                                                          │
│   super-admin                                            │
│       └── admin                                          │
│             ├── developer-lead                           │
│             │       └── developer                        │
│             ├── security-officer                         │
│             ├── devops-lead                              │
│             │       └── devops                           │
│             └── auditor (lecture seule)                  │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Définition des Rôles

| Rôle | Périmètre | Accès Production | Accès Secrets | Approbation Requise |
|------|-----------|-----------------|---------------|---------------------|
| `super-admin` | Global | ✅ Total | ✅ Total | Comité sécurité |
| `admin` | Organisationnel | ✅ Limité | 🟡 Partiel | Security officer |
| `security-officer` | Sécurité | 👁️ Lecture | ✅ Total | N/A |
| `developer-lead` | Équipe | 🚫 Non | 🟡 Dev seulement | Manager |
| `developer` | Projet | 🚫 Non | 🚫 Non | Tech lead |
| `devops` | Infrastructure | ✅ Limité | 🟡 Partiel | DevOps lead |
| `auditor` | Lecture seule | 👁️ Lecture | 🚫 Non | Responsable conformité |

### 6.3 Provisioning & Deprovisioning

**Procédure d'onboarding (accès nouveau membre) :**

1. Le manager soumet une demande d'accès via le système ITSM
2. Le security officer valide les droits demandés selon le principe du moindre privilège
3. Les accès sont créés avec une date d'expiration (renouvellement trimestriel)
4. L'utilisateur reçoit ses accès via un canal sécurisé (jamais par email en clair)
5. La formation sécurité obligatoire est complétée avant le premier accès
6. Un audit des accès est effectué à J+30

**Procédure d'offboarding (départ d'un membre) :**

1. **Immédiatement** à la notification de départ : révocation de tous les accès
2. Rotation de tous les secrets auxquels la personne avait accès
3. Revue des actions récentes dans les logs d'audit (30 derniers jours)
4. Archivage du compte (non suppression immédiate pour préservation des preuves)
5. Suppression définitive après 90 jours

### 6.4 Revue des Accès (Access Review)

Les accès sont revus de manière régulière selon le calendrier suivant :

| Fréquence | Périmètre |
|-----------|-----------|
| **Mensuelle** | Comptes super-admin et admin |
| **Trimestrielle** | Tous les rôles avec accès production |
| **Semestrielle** | Tous les comptes actifs |
| **À chaque incident** | Comptes impliqués dans l'incident |
| **À chaque départ** | Comptes de l'équipe du partant |

**Processus de revue :**
- Le manager certifie que chaque accès est toujours nécessaire
- Les accès non certifiés sont révoqués automatiquement après 7 jours
- Les résultats des revues sont archivés pour 3 ans (conformité)

### 6.5 Comptes de Service & Identités Machines

Les comptes de service (CI/CD, services applicatifs, bots) obéissent à des règles strictes :

- Chaque compte de service est associé à **un et un seul** service
- Les credentials sont stockés dans le gestionnaire de secrets (jamais en dur)
- Les comptes de service n'ont pas de session interactive
- Rotation automatique des credentials tous les 30 jours
- Les comptes de service inutilisés depuis 90 jours sont désactivés automatiquement

---

## 7. Authentification & Mots de Passe

### 7.1 Politique de Mots de Passe

**Exigences minimales :**

| Critère | Valeur Minimale |
|---------|----------------|
| Longueur | 12 caractères |
| Complexité | Majuscule + minuscule + chiffre + symbole |
| Réutilisation | Les 10 derniers mots de passe interdits |
| Expiration | 90 jours (comptes utilisateurs), 30 jours (comptes privilégiés) |
| Tentatives avant verrouillage | 5 tentatives |
| Durée de verrouillage | 15 minutes (automatique) ou déblocage manuel |

**Mots de passe proscrits :**
- Mots de passe présents dans les listes de mots de passe compromis (HaveIBeenPwned)
- Variantes du nom de l'application, de l'entreprise ou du nom d'utilisateur
- Séquences évidentes (`123456`, `qwerty`, `password`, `azerty`)

**Recommandation forte :** L'utilisation d'un **gestionnaire de mots de passe** (Bitwarden, 1Password, KeePassXC) est fortement encouragée pour l'ensemble des membres de l'équipe.

### 7.2 Authentification Multi-Facteurs (MFA)

Le MFA est **obligatoire** pour tous les accès aux systèmes suivants :

- Interface d'administration
- Accès SSH aux serveurs de production
- Accès aux gestionnaires de secrets
- Accès aux pipelines CI/CD
- Accès aux fournisseurs cloud (AWS, GCP, Azure)
- Accès aux dépôts de code (GitHub/GitLab)

**Méthodes MFA acceptées (par ordre de préférence) :**

1. **Clé de sécurité matérielle** (YubiKey, FIDO2/WebAuthn) — ✅ Recommandé
2. **Application TOTP** (Authy, Google Authenticator, Bitwarden) — ✅ Accepté
3. **Push notification** (Duo Security) — ✅ Accepté
4. **SMS** — ❌ Déconseillé (vulnérable au SIM swapping)
5. **Email** — ❌ Non accepté pour les accès privilégiés

### 7.3 Gestion des Sessions

```yaml
session_config:
  access_token_ttl: 15m          # Tokens à courte durée de vie
  refresh_token_ttl: 7d          # Refresh token plus long
  refresh_token_rotation: true   # Rotation à chaque utilisation
  idle_timeout: 30m              # Déconnexion après inactivité
  concurrent_sessions: 3         # Sessions simultanées max
  session_binding:               # Liée à l'IP et User-Agent
    - ip_address
    - user_agent
  secure_cookie: true
  httponly: true
  samesite: strict
```

**Bonnes pratiques sessions :**
- Régénération de l'identifiant de session après authentification (prévention de session fixation)
- Invalidation de toutes les sessions lors d'un changement de mot de passe
- Invalidation de toutes les sessions lors d'une détection d'activité suspecte
- Les tokens JWT incluent obligatoirement : `iat`, `exp`, `jti`, `sub`, `iss`, `aud`

### 7.4 Authentification OAuth 2.0 / OpenID Connect

Pour les intégrations tierces, ce projet utilise OAuth 2.0 avec les contraintes suivantes :

- **Flow autorisés** : Authorization Code avec PKCE uniquement
- **Flow interdits** : Implicit flow, Password grant (dépréciés)
- Validation stricte des `redirect_uri` (liste blanche exacte, pas de wildcard)
- État CSRF (`state`) obligatoire pour les requêtes d'autorisation
- Validation du `nonce` pour prévenir les attaques de replay
- Vérification de la signature JWT côté serveur (algorithme RS256 ou ES256 uniquement)
- **Algorithme HS256 interdit** pour les tokens publics

---

## 8. Cryptographie & Chiffrement

### 8.1 Algorithmes Approuvés

#### Chiffrement Symétrique
| Algorithme | Longueur de Clé | Statut | Usage |
|------------|----------------|--------|-------|
| AES-GCM | 256 bits | ✅ Approuvé | Chiffrement de données au repos |
| AES-GCM | 128 bits | 🟡 Acceptable | Contextes non critiques |
| ChaCha20-Poly1305 | 256 bits | ✅ Approuvé | Alternatives mobiles/IoT |
| 3DES | N/A | ❌ Interdit | Déprécié |
| DES | N/A | ❌ Interdit | Vulnérable |
| RC4 | N/A | ❌ Interdit | Cassé |

#### Chiffrement Asymétrique
| Algorithme | Longueur | Statut | Usage |
|------------|----------|--------|-------|
| RSA-OAEP | 4096 bits | ✅ Approuvé | Échange de clés, signatures |
| RSA-OAEP | 2048 bits | 🟡 Minimal | Systèmes legacy uniquement |
| ECDSA | P-256 | ✅ Approuvé | Signatures numériques |
| Ed25519 | N/A | ✅ Approuvé | Signatures SSH, JWT |
| RSA-PKCS#1 v1.5 | N/A | ❌ Interdit | Vulnérable (Bleichenbacher) |

#### Fonctions de Hachage
| Algorithme | Statut | Usage |
|------------|--------|-------|
| SHA-3 (256/512) | ✅ Approuvé | Intégrité, hachage général |
| SHA-256 | ✅ Approuvé | Intégrité, HMAC |
| SHA-512 | ✅ Approuvé | Signatures haute sécurité |
| SHA-1 | ❌ Interdit | Cassé (SHAttered) |
| MD5 | ❌ Interdit | Cassé |

#### Hachage de Mots de Passe
| Algorithme | Statut | Paramètres |
|------------|--------|-----------|
| Argon2id | ✅ Recommandé | mémoire: 64MB, itérations: 3, parallélisme: 4 |
| bcrypt | ✅ Acceptable | cost factor: 12 minimum |
| scrypt | ✅ Acceptable | N=32768, r=8, p=1 |
| PBKDF2 | 🟡 Minimal | 600 000 itérations (NIST 2024) |
| MD5/SHA-1 pour mots de passe | ❌ Interdit | Jamais |

### 8.2 Protocoles de Transport

- **TLS 1.3** : Version obligatoire pour tous les nouveaux déploiements
- **TLS 1.2** : Autorisé temporairement pour la compatibilité legacy
- **TLS 1.0 / 1.1** : ❌ Strictement interdits (désactivés au niveau du load balancer)
- **SSL** : ❌ Strictement interdit

**Configuration TLS recommandée :**

```nginx
# Nginx — Configuration TLS sécurisée
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:MozSSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS — 2 ans avec preload
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

### 8.3 Gestion des Clés (Key Management)

**Cycle de vie d'une clé cryptographique :**

```
Génération → Distribution → Stockage → Utilisation → Rotation → Révocation → Destruction
     ↓             ↓           ↓           ↓           ↓           ↓            ↓
  PRNG sécurisé  Canal chiffré  HSM/KMS    Audit log  Automatique  Immédiate   Effacement
                                                                               certifié
```

**Règles de gestion des clés :**
- Les clés sont générées avec un générateur de nombres aléatoires cryptographiquement sécurisé (CSPRNG)
- Aucune clé n'est jamais stockée en clair dans le code source ou les variables d'environnement non chiffrées
- Les clés de chiffrement de données (DEK) sont elles-mêmes chiffrées par des clés maîtresses (KEK)
- La destruction des clés suit le standard NIST SP 800-88 (secure erase)
- Toutes les opérations sur les clés sont auditées

---

## 9. Sécurité des API

### 9.1 Principes de Conception Sécurisée des API

Toutes les API exposées par ce projet respectent les principes suivants :

**Authentification & Autorisation**
- Chaque endpoint est authentifié par défaut — les endpoints publics sont des exceptions explicitement documentées
- L'autorisation est vérifiée à chaque requête, jamais cachée
- Les tokens d'API ont une portée minimale (scopes)
- L'expiration des tokens est systématique

**Validation des Entrées**
- Toutes les entrées sont validées côté serveur (la validation côté client est cosmétique)
- Le schéma de validation est défini avec OpenAPI/JSON Schema
- Les types, formats, longueurs et valeurs sont vérifiés
- Les payloads dépassant la taille maximale sont rejetés avec code 413

**Protection des Sorties**
- Les réponses d'erreur ne révèlent jamais de détails d'implémentation
- Les traces de stack sont masquées en production
- Les données sensibles sont masquées dans les réponses (ex: `****` pour numéros de carte)

### 9.2 Headers de Sécurité HTTP

```http
# Headers obligatoires sur toutes les réponses

Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cache-Control: no-store (pour les endpoints authentifiés)
```

**Score SecurityHeaders.com visé : A+**

### 9.3 Rate Limiting & Protection DDoS

```yaml
rate_limiting:
  global:
    requests_per_minute: 1000
    burst: 200

  per_ip:
    requests_per_minute: 60
    burst: 20

  per_user:
    requests_per_minute: 120
    burst: 30

  auth_endpoints:
    login:
      attempts: 5
      window: 15m
      lockout: 15m
    password_reset:
      attempts: 3
      window: 1h
    register:
      requests: 3
      window: 1h
      per_ip: true

  response_on_limit: 429  # Too Many Requests
  include_retry_after_header: true
```

**Implémentation :** Token Bucket ou Sliding Window (Redis-backed pour la distribution)

### 9.4 Protection CORS

```javascript
// Configuration CORS stricte
const corsOptions = {
  origin: [
    'https://app.mondomaine.com',
    'https://admin.mondomaine.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24h de cache preflight
  optionsSuccessStatus: 204
};

// JAMAIS : origin: '*' avec credentials: true
// JAMAIS : origin: true (miroir de l'origine requête)
```

### 9.5 Protection contre les Injections

**SQL Injection :**
- Utilisation exclusive des requêtes paramétrées / prepared statements
- ORM avec protection activée (pas de raw queries dynamiques)
- Principe du moindre privilège pour les comptes base de données

**NoSQL Injection :**
- Validation stricte des types (éviter l'injection d'opérateurs MongoDB)
- Sérialisation/désérialisation contrôlée

**Command Injection :**
- Interdiction des fonctions shell avec entrées utilisateur (`exec`, `system`, `eval`)
- Si inévitable, utilisation de listes blanches et sanitisation stricte

**SSRF (Server-Side Request Forgery) :**
- Validation des URLs contre une liste blanche de domaines
- Blocage des plages IP privées (RFC 1918), link-local, loopback
- Timeout strict sur toutes les requêtes sortantes

### 9.6 Codes de Réponse HTTP et Gestion des Erreurs

```json
// ✅ Bonne réponse d'erreur
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "La ressource demandée n'existe pas.",
    "request_id": "req_abc123xyz",
    "timestamp": "2026-04-25T10:30:00Z"
  }
}

// ❌ Mauvaise réponse d'erreur (fuite d'informations)
{
  "error": "SQLException: Table 'users' doesn't exist at /app/src/db/users.js:42",
  "stack": "Error: connect ETIMEDOUT 10.0.0.5:5432..."
}
```

---

## 10. Sécurité des Dépendances & Supply Chain

### 10.1 Gestion des Dépendances

**Politique générale :**
- Toute nouvelle dépendance doit faire l'objet d'une revue de sécurité avant intégration
- Les critères d'évaluation incluent : popularité, maintenance active, historique des vulnérabilités, licence
- Privilégier les dépendances avec moins de 0 dépendances transitives (réduction de la surface)

**Critères de rejet automatique d'une dépendance :**
- Dernière mise à jour > 2 ans sans maintenance explicite
- CVE non corrigé depuis > 90 jours
- Licence incompatible (GPL dans un projet commercial, par exemple)
- Suspicion de typosquatting ou de compromission du compte auteur

### 10.2 Scanning Automatique des Vulnérabilités

**Outils intégrés dans la pipeline CI/CD :**

```yaml
# Exemple GitHub Actions — Security scanning
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      # 1. Audit des dépendances npm
      - name: npm audit
        run: npm audit --audit-level=high

      # 2. Scan des secrets dans le code
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}

      # 3. Analyse statique de code (SAST)
      - name: SAST — Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: "p/owasp-top-ten p/nodejs p/typescript p/secrets"

      # 4. Scan des images Docker
      - name: Container scan — Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'monapp:${{ github.sha }}'
          format: 'sarif'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

      # 5. Software Bill of Materials (SBOM)
      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          format: spdx-json
```

### 10.3 Software Bill of Materials (SBOM)

Un SBOM au format **SPDX** ou **CycloneDX** est généré automatiquement à chaque release et archivé. Il contient :

- Liste de toutes les dépendances directes et transitives
- Versions exactes et hashes de vérification
- Licences associées
- CVEs connus au moment de la génération

### 10.4 Vérification de l'Intégrité des Artefacts

Tous les artefacts de build sont signés avec **Sigstore/cosign** ou **GPG** :

```bash
# Signature d'une image Docker
cosign sign --key cosign.key monapp:v1.2.3

# Vérification avant déploiement
cosign verify --key cosign.pub monapp:v1.2.3

# Vérification des checksums npm
npm ci --ignore-scripts  # Désactive les scripts post-install par défaut
```

### 10.5 Politique de Mise à Jour des Dépendances

| Sévérité CVE | Délai de Correction |
|--------------|---------------------|
| Critique (9.0–10.0) | 24 heures |
| Haute (7.0–8.9) | 7 jours |
| Moyenne (4.0–6.9) | 30 jours |
| Basse (0.1–3.9) | Prochain sprint |
| Aucune CVE (maj mineure) | Release mensuelle |

Un outil comme **Dependabot** ou **Renovate** est configuré pour créer automatiquement des pull requests de mise à jour.

---

## 11. Sécurité du Code & Développement Sécurisé (SSDLC)

### 11.1 Secure Software Development Lifecycle (SSDLC)

```
┌──────────────────────────────────────────────────────────────────┐
│ PHASE           │ ACTIVITÉS SÉCURITÉ                             │
├──────────────────────────────────────────────────────────────────┤
│ 📋 Planification │ Threat modeling, exigences sécurité, risques  │
│ 🎨 Conception    │ Security architecture review, revue STRIDE    │
│ 💻 Développement │ Secure coding guidelines, linting, pre-commit │
│ 🧪 Test          │ SAST, DAST, SCA, tests de sécurité unitaires  │
│ 🚀 Déploiement   │ Revue de configuration, scan infra            │
│ 🔍 Production    │ RASP, monitoring, alertes, pentest annuel     │
└──────────────────────────────────────────────────────────────────┘
```

### 11.2 Standards de Codage Sécurisé

**Revue de Code (Code Review) :**
- Toute modification du code source nécessite une revue par au moins **2 développeurs**
- Les modifications touchant à la sécurité (auth, crypto, accès données) nécessitent en plus la revue du **security officer**
- L'auteur du code ne peut pas approuver sa propre pull request
- Les branches de protection sur `main` et `production` sont activées

**Checklist de revue de code sécurité :**

```markdown
## Checklist Sécurité — Code Review

### Authentification & Autorisation
- [ ] Les endpoints sensibles vérifient l'authentification
- [ ] Les vérifications d'autorisation sont côté serveur
- [ ] Pas de références directes d'objets non vérifiées (IDOR)

### Validation des Entrées
- [ ] Toutes les entrées utilisateurs sont validées
- [ ] Les requêtes SQL utilisent des paramètres liés
- [ ] Les chemins de fichiers sont vérifiés (path traversal)

### Cryptographie
- [ ] Aucun algorithme déprécié utilisé
- [ ] Pas de génération aléatoire non cryptographique pour données sensibles
- [ ] Les mots de passe sont hachés avec Argon2id/bcrypt

### Secrets & Configuration
- [ ] Aucun secret en dur dans le code
- [ ] Les fichiers de config sensibles sont dans .gitignore
- [ ] Les variables d'environnement sensibles sont documentées

### Logging
- [ ] Les erreurs sont loguées sans données sensibles
- [ ] Les actions critiques génèrent des événements d'audit
- [ ] Les mots de passe/tokens ne sont pas loggés

### Gestion des Erreurs
- [ ] Les erreurs n'exposent pas de traces de stack en production
- [ ] Les codes d'erreur sont appropriés (pas de 200 sur erreur)
```

### 11.3 Hooks Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.0.0
    hooks:
      - id: trufflehog
        name: Secret Detection
        entry: trufflehog git file://. --since-commit HEAD --only-verified --fail

  - repo: https://github.com/semgrep/semgrep
    rev: 1.0.0
    hooks:
      - id: semgrep
        args: ['--config', 'p/secrets', '--config', 'p/owasp-top-ten', '--error']

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: no-commit-to-branch
        args: [--branch, main, --branch, production]
```

### 11.4 Protection de la Branche Principale

```yaml
# Règles de protection de branche (GitHub)
branch_protection:
  main:
    require_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    require_status_checks:
      strict: true
      contexts:
        - "security-scan"
        - "sast-semgrep"
        - "dependency-audit"
    require_signed_commits: true
    enforce_admins: true
    restrict_pushes: true
    allow_force_pushes: false
    allow_deletions: false
```

---

## 12. Sécurité des Infrastructures & Cloud

### 12.1 Principe du Moindre Privilège pour les Ressources Cloud

**AWS IAM — Règles :**
- Aucun compte racine utilisé pour des opérations courantes (accès uniquement pour break-glass)
- Toutes les politiques IAM suivent le moindre privilège
- `*` (wildcard) dans `Resource` ou `Action` est interdit sauf exception documentée
- MFA obligatoire pour tous les accès console
- Les credentials programmatiques sont gérés via IAM Roles (pas d'Access Keys statiques pour les services cloud)

```json
// Exemple de politique IAM restrictive
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::mon-bucket-specifique/*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "eu-west-1"
        },
        "Bool": {
          "aws:SecureTransport": "true"
        }
      }
    }
  ]
}
```

### 12.2 Sécurité du Stockage Cloud

**Amazon S3 / Google Cloud Storage / Azure Blob :**

```yaml
bucket_security:
  public_access_block:
    block_public_acls: true
    ignore_public_acls: true
    block_public_policy: true
    restrict_public_buckets: true
  versioning: enabled
  encryption:
    algorithm: AES-256  # ou SSE-KMS pour les données sensibles
    kms_key_rotation: enabled
  logging:
    enabled: true
    destination: security-logs-bucket
  lifecycle_rules:
    - transition_to_glacier_after: 90d
    - delete_after: 365d (selon politique rétention)
  replication:
    enabled: true  # cross-region pour résilience
```

### 12.3 Configuration de Sécurité des Instances

**Durcissement (Hardening) des instances EC2/VM :**

```bash
#!/bin/bash
# Script de hardening minimal

# Désactiver les services inutiles
systemctl disable avahi-daemon cups bluetooth

# Configurer SSH sécurisé
cat >> /etc/ssh/sshd_config << EOF
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
AllowUsers deploy ansible
MaxAuthTries 3
LoginGraceTime 20
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
Banner /etc/ssh/banner
EOF

# Activer le firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow from 10.0.0.0/8 to any port 22  # SSH depuis VPN uniquement
ufw allow 443/tcp
ufw enable

# Activer les mises à jour de sécurité automatiques
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Activer auditd
apt-get install -y auditd
systemctl enable auditd
systemctl start auditd
```

### 12.4 Infrastructure as Code (IaC) Security

Tout le code d'infrastructure (Terraform, CloudFormation, Pulumi) est soumis aux mêmes contrôles de sécurité que le code applicatif :

```yaml
# Outils de scan IaC dans la pipeline
iac_security_scanning:
  tools:
    - name: Checkov
      scope: Terraform, CloudFormation, Kubernetes
      fail_on: CRITICAL, HIGH
    - name: tfsec
      scope: Terraform
      fail_on: CRITICAL, HIGH
    - name: kube-score
      scope: Kubernetes manifests
    - name: Terrascan
      scope: Multi-cloud IaC

  rules:
    - "No unrestricted security group ingress (0.0.0.0/0)"
    - "S3 buckets must have public access blocked"
    - "RDS instances must have encryption enabled"
    - "CloudTrail must be enabled"
    - "Security groups must not allow SSH from 0.0.0.0/0"
```

---

## 13. Sécurité des Conteneurs & Kubernetes

### 13.1 Sécurité des Images Docker

**Dockerfile sécurisé — Bonnes pratiques :**

```dockerfile
# ✅ Image de base minimale et vérifiée
FROM node:20-alpine3.19@sha256:<hash_specifique>

# ✅ Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# ✅ Copie des fichiers nécessaires uniquement
WORKDIR /app
COPY --chown=nextjs:nodejs package*.json ./
RUN npm ci --only=production --ignore-scripts

COPY --chown=nextjs:nodejs . .

# ✅ Exécution en tant qu'utilisateur non-root
USER nextjs

# ✅ Port non-privilégié
EXPOSE 3000

# ✅ Signal de santé
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

**Interdictions dans les Dockerfiles :**
- `USER root` en phase de production
- Secrets en arguments `--build-arg`
- Commandes `curl | bash` ou `wget | sh`
- Images `latest` sans hash épinglé
- `COPY . .` sans `.dockerignore` approprié

### 13.2 Security Context Kubernetes

```yaml
# Pod Security Standards — Restricted
apiVersion: v1
kind: Pod
metadata:
  name: mon-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault

  containers:
    - name: mon-app
      image: monapp:v1.2.3@sha256:<hash>
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
      resources:
        limits:
          cpu: "500m"
          memory: "512Mi"
        requests:
          cpu: "100m"
          memory: "128Mi"
      volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /app/.cache

  volumes:
    - name: tmp
      emptyDir: {}
    - name: cache
      emptyDir: {}

  automountServiceAccountToken: false
```

### 13.3 Network Policies Kubernetes

```yaml
# Politique réseau — Isolation par défaut
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}  # Applique à tous les pods
  policyTypes:
    - Ingress
    - Egress
---
# Autoriser uniquement les communications nécessaires
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

---

## 14. Sécurité du Réseau

### 14.1 Architecture Réseau (Defense in Depth)

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  WAF / CDN (Cloudflare / AWS Shield)    │
│  - Protection DDoS L3/L4/L7            │
│  - Filtrage géographique               │
│  - Bot protection                       │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Load Balancer (Public Subnet)          │
│  - TLS Termination                      │
│  - Health checks                        │
│  - Rate limiting global                 │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  API Gateway / Reverse Proxy            │
│  - Authentification                     │
│  - Rate limiting par utilisateur        │
│  - Logging centralisé                   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Application Tier (Private Subnet)      │
│  - Pas d'accès internet direct          │
│  - Communication via NAT Gateway        │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Data Tier (Isolated Subnet)            │
│  - Accès uniquement depuis App Tier     │
│  - Pas de route internet               │
└─────────────────────────────────────────┘
```

### 14.2 Règles de Pare-feu

**Politique par défaut : DENY ALL, puis autoriser explicitement**

```
Flux autorisés entrants :
├── 0.0.0.0/0 → Load Balancer : 443/tcp (HTTPS)
├── VPN CIDR → Bastion : 22/tcp (SSH)
├── Bastion → App Servers : 22/tcp (SSH)
├── App Tier CIDR → DB Tier : 5432/tcp (PostgreSQL)
└── App Tier CIDR → Cache : 6379/tcp (Redis)

Flux interdits :
├── Internet → App Servers (direct)
├── Internet → DB Servers (direct)
├── App Servers → Internet (sauf via NAT pour updates)
└── DB Servers → Internet
```

### 14.3 VPN & Accès Distant

- Tout accès à l'infrastructure de production se fait **exclusivement via VPN**
- VPN configuré avec **WireGuard** ou **OpenVPN** avec authentification par certificat + MFA
- Les tunnels Split VPN sont interdits (tout le trafic passe par le VPN)
- Les sessions VPN sont limitées à 8 heures et nécessitent une re-authentification
- Journalisation de toutes les connexions VPN

### 14.4 Détection d'Intrusion (IDS/IPS)

- **Suricata** ou **Snort** déployé en mode inline sur les segments critiques
- Règles mises à jour quotidiennement (ET Open, Emerging Threats)
- Alertes en temps réel vers le SIEM
- Blocage automatique des IP malveillantes connues (threat intelligence feeds)

---

## 15. Journalisation, Audit & Surveillance

### 15.1 Événements à Journaliser Obligatoirement

**Authentification :**
- Tentatives de connexion (succès et échec)
- Activations/désactivations MFA
- Changements de mot de passe
- Création/suppression de comptes
- Demandes de réinitialisation de mot de passe

**Autorisation :**
- Accès aux ressources sensibles
- Refus d'accès (403)
- Modifications de permissions et de rôles
- Accès aux données classifiées

**Opérations Critiques :**
- Déploiements en production
- Modifications de configuration
- Exports de données (surtout en masse)
- Suppressions de données
- Accès aux secrets

**Sécurité :**
- Détections d'anomalies
- Alertes WAF/IDS
- Changements de politique de sécurité
- Accès aux clés cryptographiques

### 15.2 Format de Log Standardisé

```json
{
  "timestamp": "2026-04-25T10:30:00.000Z",
  "level": "INFO",
  "event_type": "AUTH_LOGIN_SUCCESS",
  "request_id": "req_abc123xyz789",
  "user": {
    "id": "usr_456",
    "email": "user@example.com",  // Masqué si classifié
    "role": "developer",
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  },
  "resource": {
    "type": "application",
    "id": "app_789",
    "action": "login"
  },
  "outcome": "success",
  "duration_ms": 245,
  "geo": {
    "country": "FR",
    "city": "Paris"
  },
  "session_id": "sess_xyz"
}
```

**Données à NE JAMAIS logger :**
- Mots de passe (même hachés)
- Tokens d'authentification complets
- Numéros de carte bancaire
- Clés privées ou secrets
- Données de santé complètes

### 15.3 Protection des Logs

- Les logs sont transmis en temps réel vers un SIEM centralisé (stockage externe)
- Les logs ne peuvent être modifiés ou supprimés par l'application (write-once)
- Les logs sont chiffrés en transit (TLS) et au repos
- Intégrité des logs vérifiée via hachage enchaîné (hash chain)
- Rétention des logs de sécurité : minimum 1 an online + 2 ans archive

### 15.4 Alertes & Seuils

```yaml
alerting_rules:
  critical:  # Notification immédiate (PagerDuty)
    - event: "brute_force_attack"
      threshold: ">10 failed logins in 5min from same IP"
    - event: "privilege_escalation"
      threshold: "any attempt"
    - event: "data_exfiltration"
      threshold: ">10MB exported in <1min"
    - event: "production_deploy_outside_window"
      threshold: "any deploy 10PM–6AM"

  high:  # Notification dans l'heure (email + Slack)
    - event: "account_lockout"
      threshold: ">5 in 1 hour"
    - event: "new_admin_created"
      threshold: "any"
    - event: "secret_rotation_failure"
      threshold: "any"

  medium:  # Rapport quotidien
    - event: "login_from_new_country"
    - event: "api_error_rate"
      threshold: ">5% over 15min"
    - event: "dependency_vulnerability"
      threshold: "HIGH or CRITICAL"
```

---

## 16. Réponse aux Incidents

### 16.1 Classification des Incidents de Sécurité

| Niveau | Sévérité | Exemples | Temps de Réponse |
|--------|----------|---------|-----------------|
| **P0** | Critique | RCE en production, fuite de données massives, ransomware | Immédiat (< 15 min) |
| **P1** | Haute | Compromission de compte admin, exploitation active d'une vuln | < 1 heure |
| **P2** | Moyenne | Tentative d'intrusion bloquée, vulnérabilité découverte non exploitée | < 4 heures |
| **P3** | Basse | Scan de port, tentative de brute force, spam | < 24 heures |

### 16.2 Procédure de Réponse aux Incidents (IRP)

```
┌─────────────────────────────────────────────────────────────┐
│               PROCESSUS DE RÉPONSE AUX INCIDENTS            │
│                                                             │
│  1. DÉTECTION & IDENTIFICATION                              │
│     - Alerte automatique ou signalement manuel              │
│     - Classification de la sévérité                        │
│     - Activation de l'équipe de réponse (CSIRT)            │
│                    ↓                                        │
│  2. CONFINEMENT                                             │
│     - Isolation des systèmes affectés                       │
│     - Blocage des accès compromis                          │
│     - Préservation des preuves (snapshots, logs)           │
│                    ↓                                        │
│  3. ÉRADICATION                                             │
│     - Identification et suppression de la cause racine      │
│     - Correction des vulnérabilités exploitées             │
│     - Analyse forensique si nécessaire                     │
│                    ↓                                        │
│  4. RESTAURATION                                            │
│     - Remise en service contrôlée                          │
│     - Vérification de l'intégrité des systèmes             │
│     - Surveillance renforcée post-incident                 │
│                    ↓                                        │
│  5. POST-MORTEM                                             │
│     - Rapport d'incident complet                           │
│     - Analyse des causes racines (RCA)                     │
│     - Actions correctives documentées                      │
│     - Mise à jour des procédures si nécessaire             │
└─────────────────────────────────────────────────────────────┘
```

### 16.3 War Room & Communication

**Communication interne pendant un incident :**
- Canal Slack dédié créé immédiatement : `#incident-YYYYMMDD-<nom>`
- Bridge téléphonique disponible pour les incidents P0/P1
- Mise à jour de statut toutes les 30 minutes pour P0, toutes les 2 heures pour P1
- Rôles définis : Incident Commander, Communications Lead, Technical Lead

**Communication externe (si applicable) :**
- Obligation légale de notification CNIL dans les 72 heures si violation de données personnelles (RGPD Art. 33)
- Communication aux utilisateurs affectés dans les meilleurs délais
- Communication publique validée par la direction et le service juridique
- **Jamais de communication technique externe sans validation**

### 16.4 Collecte de Preuves Forensiques

```bash
# Protocole de collecte de preuves — À exécuter immédiatement lors d'un incident

# 1. Créer un snapshot de l'instance avant toute action
aws ec2 create-snapshot --volume-id vol-xxxxx --description "Forensic-$(date +%Y%m%d-%H%M%S)"

# 2. Capturer l'état mémoire (si possible)
sudo dd if=/dev/mem of=/forensics/memory-$(date +%Y%m%d).dump bs=1M

# 3. Collecter les logs système
sudo tar -czf /forensics/logs-$(date +%Y%m%d).tar.gz /var/log/

# 4. Lister les processus et connexions actives
sudo ps auxwww > /forensics/processes-$(date +%Y%m%d).txt
sudo netstat -tulpn > /forensics/connections-$(date +%Y%m%d).txt
sudo ss -tulpn >> /forensics/connections-$(date +%Y%m%d).txt

# 5. Hacher toutes les preuves pour garantir leur intégrité
sha256sum /forensics/* > /forensics/hashes-$(date +%Y%m%d).txt

# 6. Transférer vers stockage sécurisé hors ligne
# (copie vers bucket S3 isolé avec write-once policy)
```

---

## 17. Plan de Reprise d'Activité (PRA/BCP)

### 17.1 Objectifs de Reprise

| Métrique | Définition | Objectif Production | Objectif Staging |
|----------|------------|---------------------|-----------------|
| **RTO** (Recovery Time Objective) | Temps max avant reprise | 1 heure | 4 heures |
| **RPO** (Recovery Point Objective) | Perte de données acceptable | 15 minutes | 1 heure |
| **MTTR** (Mean Time To Recovery) | Temps moyen de restauration | < 30 min | < 2 heures |
| **Disponibilité cible** | SLA uptime | 99.9% (8.7h downtime/an) | 99% |

### 17.2 Stratégie de Sauvegarde

```yaml
backup_strategy:
  databases:
    frequency: every_15_minutes  # Continuous WAL archiving
    full_backup: daily_at_3am
    retention:
      daily: 30_days
      weekly: 12_weeks
      monthly: 12_months
    encryption: AES-256-GCM
    location:
      - primary: same-region-different-az
      - secondary: cross-region (eu-central-1)
    verification:
      frequency: weekly
      method: restore_and_validate

  object_storage:
    versioning: enabled
    replication: cross-region
    retention: per_classification_policy

  code_and_config:
    provider: git (GitHub/GitLab)
    backup_mirror: secondary_git_server
    secrets: vault_with_raft_storage
```

### 17.3 Tests de Reprise

Les exercices de reprise sont planifiés et documentés :

- **Mensuel** : Test de restauration d'une sauvegarde en environnement isolé
- **Trimestriel** : Simulation de panne d'une zone de disponibilité
- **Annuel** : Exercice complet de reprise (simulation de sinistre total)

Chaque exercice donne lieu à un rapport documentant le RTO/RPO réel atteint et les axes d'amélioration.

---

## 18. Gestion des Secrets

### 18.1 Règles Fondamentales

**Ce qui constitue un secret :**
- Mots de passe de bases de données
- Clés d'API tierces (Stripe, SendGrid, AWS, etc.)
- Clés privées SSL/TLS
- Clés cryptographiques
- Tokens OAuth (client_secret)
- Credentials SMTP
- Tout identifiant permettant l'accès à un système

**Règle d'or :** Un secret n'existe **jamais** dans :
- Le code source (même dans l'historique git)
- Les fichiers de configuration versionnés
- Les variables d'environnement non chiffrées en production
- Les logs, les traces, les messages d'erreur
- Les emails, Slack, ou tout canal de communication
- Les bases de données en clair

### 18.2 Outils de Gestion des Secrets

**Solution recommandée : HashiCorp Vault**

```bash
# Écriture d'un secret
vault kv put secret/prod/database \
  username="app_user" \
  password="$(openssl rand -base64 32)"

# Lecture d'un secret (par l'application)
vault kv get -field=password secret/prod/database

# Rotation automatique
vault write sys/rotate  # Rotation des clés de chiffrement internes
```

**Alternatives acceptées :**
- AWS Secrets Manager (avec rotation automatique intégrée)
- Google Secret Manager
- Azure Key Vault
- Doppler (pour les équipes de développement)

**Non acceptés pour les secrets de production :**
- `.env` files non chiffrés
- Variables d'environnement système sans protection
- Fichiers de configuration en clair

### 18.3 Rotation des Secrets

| Type de Secret | Fréquence de Rotation | Rotation Automatique |
|----------------|----------------------|---------------------|
| Credentials DB de production | 30 jours | ✅ Via Vault |
| Clés API critiques | 90 jours | 🟡 Semi-auto |
| Certificats TLS | Avant expiration (Let's Encrypt: 60j) | ✅ Certbot/ACME |
| Clés SSH | 1 an | 🟡 Manuel |
| Secrets de session | 30 jours | ✅ Via script |
| Tokens CI/CD | 90 jours | 🟡 Semi-auto |
| Après tout incident | Immédiat | 🔴 Manuel (urgence) |

### 18.4 Détection de Secrets Exposés

```yaml
# Outils de détection configurés
secret_detection:
  pre_commit:
    - trufflehog (vérifié entropy + patterns)
    - detect-secrets (baseline)
    - git-secrets

  ci_pipeline:
    - trufflehog (scan full history)
    - gitleaks
    - semgrep (règles secrets)

  continuous_monitoring:
    - GitHub Secret Scanning (activé)
    - GitLab Secret Detection (activé)
    - Monitoring des paste sites (Pastebin, etc.)

  response_to_detected_secret:
    1: "Rotation immédiate du secret"
    2: "Audit des accès avec ce secret (dernières 90 jours)"
    3: "Réécriture de l'historique git si nécessaire"
    4: "Notification si secret externe exposé"
```

---

## 19. Sécurité des Bases de Données

### 19.1 Contrôle d'Accès

```sql
-- Principe du moindre privilège pour les rôles BD

-- Application web (lecture/écriture limitée)
CREATE ROLE app_user WITH LOGIN PASSWORD '${VAULT_DB_PASSWORD}';
GRANT CONNECT ON DATABASE app_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON TABLE users, sessions, products TO app_user;
GRANT DELETE ON TABLE sessions TO app_user;  -- Nettoyage sessions uniquement
-- Pas de DROP, ALTER, TRUNCATE, CREATE

-- Migrations (droits étendus, connexions limitées)
CREATE ROLE migrator WITH LOGIN PASSWORD '${VAULT_MIGRATOR_PASSWORD}' CONNECTION LIMIT 1;
GRANT ALL ON DATABASE app_db TO migrator;

-- Lecture seule (pour analytics/reporting)
CREATE ROLE readonly_user WITH LOGIN PASSWORD '${VAULT_READONLY_PASSWORD}';
GRANT CONNECT ON DATABASE app_db TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 19.2 Chiffrement des Données Sensibles

Les colonnes contenant des données sensibles sont chiffrées au niveau applicatif (en plus du chiffrement au repos) :

```javascript
// Chiffrement applicatif pour les champs PII sensibles
const { createCipheriv, createDecipheriv, randomBytes } = require('crypto');

function encryptField(plaintext, key) {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
    tag: tag.toString('hex')
  };
}

// Champs chiffrés : numéros de téléphone, IBAN, numéros de sécurité sociale
// Champs hachés non réversibles : adresses email (pour recherche sans déchiffrement)
```

### 19.3 Prévention des Injections SQL

```javascript
// ✅ CORRECT — Requêtes paramétrées
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND active = $2',
  [email, true]
);

// ✅ CORRECT — ORM sécurisé
const user = await User.findOne({
  where: { email: email, active: true }
});

// ❌ INTERDIT — Concaténation de chaînes
const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ❌ INTERDIT — Template literals avec entrées utilisateurs
const query = `SELECT * FROM ${tableName} WHERE id = ${userId}`;
```

### 19.4 Audit des Bases de Données

```sql
-- Activer l'audit PostgreSQL (pg_audit)
ALTER SYSTEM SET pgaudit.log = 'write, ddl, role';
ALTER SYSTEM SET pgaudit.log_relation = 'on';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_min_duration_statement = '1000';  -- Requêtes > 1s

-- Vérification des accès suspects
SELECT usename, client_addr, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

---

## 20. Sécurité Frontend & Applications Web

### 20.1 Protection XSS (Cross-Site Scripting)

```javascript
// ✅ Sanitisation systématique des sorties
import DOMPurify from 'dompurify';

// Contenu HTML dynamique — TOUJOURS sanitiser
const safeHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
  ALLOWED_ATTR: []
});

// React — Protection automatique par défaut
// ✅ Safe
return <div>{userContent}</div>;  // Échappé automatiquement

// ❌ Dangereux — À éviter absolument
return <div dangerouslySetInnerHTML={{ __html: userContent }} />;

// CSP Header — Bloquer les scripts inline et sources non autorisées
// Content-Security-Policy: script-src 'self' 'nonce-{random}'
```

### 20.2 Protection CSRF (Cross-Site Request Forgery)

```javascript
// Protection CSRF — Token synchronisé (SameSite + CSRF token)

// 1. Génération du token serveur
const csrfToken = crypto.randomBytes(32).toString('hex');
req.session.csrfToken = csrfToken;

// 2. Envoi au client (dans le HTML ou une API dédiée)
res.json({ csrfToken });

// 3. Vérification à chaque requête mutante
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
});

// 4. Cookies SameSite=Strict pour une protection complémentaire
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### 20.3 Content Security Policy (CSP) Avancée

```nginx
# CSP stricte avec nonces pour les scripts inline légitimes
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'nonce-${REQUEST_NONCE}';
  style-src 'self' 'nonce-${REQUEST_NONCE}';
  img-src 'self' data: https://cdn.mondomaine.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.mondomaine.com;
  frame-src 'none';
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  block-all-mixed-content;
  report-uri https://mondomaine.report-uri.com/r/d/csp/enforce;
";
```

### 20.4 Subresource Integrity (SRI)

```html
<!-- Vérification de l'intégrité des ressources CDN externes -->
<script
  src="https://cdn.example.com/library.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>
```

---

## 21. Tests de Sécurité & Pentesting

### 21.1 Types de Tests de Sécurité

| Type | Fréquence | Périmètre | Responsable |
|------|-----------|-----------|-------------|
| SAST (analyse statique) | À chaque commit | Code source | CI/CD automatisé |
| SCA (dépendances) | À chaque commit | Bibliothèques | CI/CD automatisé |
| DAST (analyse dynamique) | Hebdomadaire | App déployée (staging) | DevSecOps |
| Scan d'infrastructure | Hebdomadaire | Cloud config, IaC | DevSecOps |
| Pentest interne | Trimestriel | Périmètre complet | Security team |
| Pentest externe | Annuel | Périmètre complet | Cabinet externe |
| Red Team | Tous les 2 ans | Organisation complète | Cabinet spécialisé |

### 21.2 Outils DAST

```yaml
# OWASP ZAP — Scan DAST automatisé
zap_scan:
  target: https://staging.mondomaine.com
  mode: attack  # passive / attack
  rules:
    - id: 10020  # X-Frame-Options Missing
    - id: 10038  # Content Security Policy
    - id: 40018  # SQL Injection
    - id: 40014  # Cross Site Scripting
    - id: 40017  # Path Traversal
  ajax_spider: true
  fail_on:
    risk: HIGH
    confidence: MEDIUM
```

### 21.3 Checklist OWASP Top 10 (2021)

Chaque déploiement majeur est vérifié contre l'OWASP Top 10 :

- [ ] **A01:2021 — Broken Access Control** : Vérification RBAC, IDOR, path traversal
- [ ] **A02:2021 — Cryptographic Failures** : Algorithmes, longueurs de clés, TLS
- [ ] **A03:2021 — Injection** : SQL, NoSQL, OS, LDAP injection
- [ ] **A04:2021 — Insecure Design** : Threat modeling, security requirements
- [ ] **A05:2021 — Security Misconfiguration** : Headers, services exposés, comptes par défaut
- [ ] **A06:2021 — Vulnerable Components** : Dépendances à jour, SBOM
- [ ] **A07:2021 — Authentication Failures** : MFA, politique de mots de passe, sessions
- [ ] **A08:2021 — Software and Data Integrity Failures** : SBOM, signatures, CI/CD
- [ ] **A09:2021 — Logging & Monitoring Failures** : Alertes, audit logs, SIEM
- [ ] **A10:2021 — SSRF** : Validation URL, isolation réseau

---

## 22. Conformité & Réglementations

### 22.1 RGPD (Règlement Général sur la Protection des Données)

Ce projet traite des données personnelles de résidents européens et est donc soumis au RGPD.

**Bases légales du traitement :**
- Consentement explicite de l'utilisateur
- Exécution d'un contrat
- Obligation légale

**Droits des personnes et délais de réponse :**

| Droit | Description | Délai Maximal |
|-------|-------------|---------------|
| Droit d'accès (Art. 15) | Obtenir une copie des données | 1 mois |
| Droit de rectification (Art. 16) | Corriger des données inexactes | 1 mois |
| Droit à l'effacement (Art. 17) | Supprimer ses données | 1 mois |
| Droit à la portabilité (Art. 20) | Exporter ses données | 1 mois |
| Droit d'opposition (Art. 21) | S'opposer au traitement | Immédiat |
| Droit de limitation (Art. 18) | Limiter le traitement | 1 mois |

**Délégué à la Protection des Données (DPO) :**
- Nom : [Nom du DPO]
- Email : dpo@[votre-domaine].com
- Disponible pour toute demande relative aux données personnelles

### 22.2 PCI-DSS (si applicable)

Si le projet traite des données de cartes bancaires :
- Aucune donnée de carte n'est stockée en clair (PCI-DSS Req. 3)
- Utilisation d'un PSP certifié PCI-DSS de niveau 1 (Stripe, Adyen, etc.)
- Les formulaires de paiement sont hébergés par le PSP (réduction du périmètre PCI)
- Scan trimestriel par un ASV (Approved Scanning Vendor)

### 22.3 ISO 27001

Ce projet s'aligne sur les contrôles de l'ISO/IEC 27001:2022 dans les domaines suivants :
- Contrôle d'accès (Annexe A.5.15 à A.5.18)
- Cryptographie (Annexe A.8.24)
- Sécurité des opérations (Annexe A.8.8 à A.8.23)
- Gestion des incidents (Annexe A.5.24 à A.5.28)

---

## 23. Formation & Sensibilisation

### 23.1 Formation Obligatoire

Tous les membres de l'équipe doivent compléter les formations suivantes :

| Formation | Fréquence | Audience | Durée |
|-----------|-----------|---------|-------|
| Sécurité de base (phishing, mots de passe) | Annuelle | Tous | 1 heure |
| Développement sécurisé (OWASP) | Annuelle | Développeurs | 4 heures |
| Sécurité cloud et infrastructure | Annuelle | DevOps | 4 heures |
| Gestion des incidents | Annuelle | Tous | 2 heures |
| RGPD et protection des données | Annuelle | Tous | 2 heures |
| Onboarding sécurité | À l'arrivée | Tous les nouveaux | 3 heures |

### 23.2 Simulations & Exercices

- **Phishing simulé** : Tests trimestriels pour évaluer la sensibilisation des équipes
- **Tabletop exercises** : Simulation d'incidents semestrielle (discussion de scénarios)
- **Red/Blue team exercises** : Exercices annuels d'attaque/défense

### 23.3 Ressources & Références

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Have I Been Pwned](https://haveibeenpwned.com/) — Vérification de compromissions
- [CVE Database](https://cve.mitre.org/) — Base de vulnérabilités

---

## 24. Politique de Mise à Jour & Patching

### 24.1 Fenêtres de Maintenance

| Environnement | Fenêtre de Patch | Type |
|---------------|-----------------|------|
| Production | Mardi 02h00–04h00 UTC | Planifié |
| Production (urgent) | N'importe quand avec approbation | Urgence |
| Staging | Lundi 22h00–23h00 UTC | Planifié |
| Développement | À tout moment | Libre |

### 24.2 Processus de Patching d'Urgence

Pour les CVE critiques (CVSS ≥ 9.0) :

1. Détection via scanning automatique ou notification CERT
2. Évaluation de l'impact sur nos systèmes (< 2 heures)
3. Si vulnérable : mise en place de mesures de mitigation temporaires (WAF rule, désactivation de feature)
4. Développement et test du correctif (< 24 heures)
5. Déploiement en production après approbation du security officer
6. Validation post-déploiement
7. Notification aux parties prenantes

### 24.3 Inventaire des Assets & EOL Tracking

Un inventaire complet des composants est maintenu :

```yaml
# Exemple d'entrée dans l'inventaire
components:
  - name: Node.js
    version: "20.12.0"
    type: runtime
    lts_until: "2026-04-30"
    action_required: "Upgrade to 22.x before EOL"
    owner: "team-backend"

  - name: PostgreSQL
    version: "15.6"
    type: database
    eol: "2027-11-11"
    owner: "team-infra"
```

Les composants en fin de vie (EOL) sont identifiés 6 mois à l'avance pour planifier la migration.

---

## 25. Responsabilités & Contacts

### 25.1 RACI Sécurité

| Activité | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|---------|
| Politique de sécurité | Security Officer | RSSI | CTO, Legal | Tous |
| Code review sécurité | Dev lead | CTO | Security Officer | Dev team |
| Gestion des incidents | CSIRT lead | RSSI | CTO, Legal, DPO | Direction |
| Gestion des secrets | DevOps lead | CTO | Security Officer | Dev lead |
| Revues d'accès | Security Officer | RSSI | Managers | HR |
| Tests de pénétration | Security team | RSSI | CTO | Direction |
| Formation sécurité | Security Officer | HR | RSSI | Tous |

### 25.2 Contacts Clés

| Rôle | Nom | Email | Disponibilité |
|------|-----|-------|--------------|
| RSSI / CISO | [Nom] | ciso@[domaine].com | 24/7 (urgences) |
| Security Officer | [Nom] | security@[domaine].com | 9h–18h LV |
| DPO | [Nom] | dpo@[domaine].com | 9h–18h LV |
| Astreinte sécurité | Rotation équipe | oncall-security@[domaine].com | 24/7 |
| Signalement vulnérabilités | — | security@[domaine].com | 24/7 |

### 25.3 Escalade

```
Incident détecté
      │
      ▼
Ingénieur d'astreinte
  (réponse < 15 min)
      │
      ▼ (si P0/P1)
Security Officer
  (notifié immédiatement)
      │
      ▼ (si P0 ou impact business majeur)
RSSI + CTO
  (notifiés dans l'heure)
      │
      ▼ (si fuite de données ou impact réglementaire)
Direction + Legal + DPO
  (notifiés immédiatement)
```

---

## 26. Glossaire

| Terme | Définition |
|-------|------------|
| **ASVS** | Application Security Verification Standard (OWASP) |
| **BSIMM** | Building Security In Maturity Model |
| **CERT** | Computer Emergency Response Team |
| **CSRF** | Cross-Site Request Forgery — attaque forçant des actions non voulues |
| **CSIRT** | Computer Security Incident Response Team |
| **CVE** | Common Vulnerabilities and Exposures — identifiant standardisé de vulnérabilité |
| **CVSS** | Common Vulnerability Scoring System — score de sévérité des vulnérabilités |
| **DAST** | Dynamic Application Security Testing — test en boîte noire sur application déployée |
| **DLP** | Data Loss Prevention — prévention de la fuite de données |
| **DPO** | Délégué à la Protection des Données |
| **IAM** | Identity and Access Management |
| **IDS/IPS** | Intrusion Detection/Prevention System |
| **KEK** | Key Encryption Key — clé qui chiffre d'autres clés |
| **DEK** | Data Encryption Key — clé qui chiffre les données |
| **MFA** | Multi-Factor Authentication |
| **MTTR** | Mean Time To Recovery |
| **OWASP** | Open Web Application Security Project |
| **PCI-DSS** | Payment Card Industry Data Security Standard |
| **PII** | Personally Identifiable Information — données personnelles identifiables |
| **PKCE** | Proof Key for Code Exchange |
| **RPO** | Recovery Point Objective — perte de données maximale acceptable |
| **RTO** | Recovery Time Objective — temps de reprise maximal acceptable |
| **RBAC** | Role-Based Access Control |
| **RGPD** | Règlement Général sur la Protection des Données (GDPR en anglais) |
| **RSSI** | Responsable de la Sécurité des Systèmes d'Information |
| **SAST** | Static Application Security Testing — analyse statique du code source |
| **SBOM** | Software Bill of Materials — inventaire des composants logiciels |
| **SCA** | Software Composition Analysis — analyse des dépendances |
| **SIEM** | Security Information and Event Management |
| **SSRF** | Server-Side Request Forgery |
| **SSDLC** | Secure Software Development Lifecycle |
| **STRIDE** | Modèle de classification des menaces (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) |
| **TLS** | Transport Layer Security |
| **TOTP** | Time-Based One-Time Password |
| **WAF** | Web Application Firewall |
| **XSS** | Cross-Site Scripting |
| **Zero Trust** | Modèle de sécurité où aucune entité n'est de confiance par défaut |

---

## 27. Changelog

| Version | Date | Auteur | Modifications |
|---------|------|--------|--------------|
| 1.0.0 | 2026-04-25 | Security Team | Création initiale du document |

---

> **Note légale :** Ce document est classifié **INTERNE** (Niveau 2). Il ne doit pas être partagé publiquement sans révision préalable par le RSSI pour s'assurer qu'aucune information sensible sur l'infrastructure réelle n'est exposée.

> **Revue suivante :** Ce document doit être révisé tous les **6 mois** ou suite à tout incident de sécurité majeur ou changement architectural significatif.

---

*Dernière révision : 2026-04-25 | Prochain audit planifié : 2026-10-25*

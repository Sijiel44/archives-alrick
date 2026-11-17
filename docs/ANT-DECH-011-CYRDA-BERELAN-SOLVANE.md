---
title: "ANT-DECH-011 — Trois Déchus, branches d'apprentissage et restitution"
date: 2026-11-17
statut: "lore_valide"
---

# ANT-DECH-011 — Trois trajectoires de Déchéance

## Portée et publication

Trois personnages publics : **PER-DECH-41 Cyrda Loven**, **PER-DECH-42 Bérélan Voche** et **PER-DECH-43 Solvane Dercé** ; portraits originaux `.webp` et compagnons vectoriels `.svg` ; répertoire public étendu de 40 à **43** fiches ; catalogue local Studio MJ synchronisé et versionné par contenu Git. Le réseau d'ateliers de la **Cour des Compagnons** est décrit comme milieu de formation, sans code organisationnel nouveau ni déclaration de corruption collective.

Leurs histoires, pactes initiaux, chutes liées et liens deviennent de la **référence d'univers partagé**, jamais des événements artificiellement attribués aux aventures d'Orin. Les issues de campagne restent ouvertes et modifiables dans chaque Studio MJ local.

## Pyramide de tribut : faits de départ

```text
Tarek Osme (N12, Rupture)
└─ Cyrda Loven (N5, Fêlure) : Chute liée réelle ; pas Lieuse

Solvane Dercé (N16, Déchéance)
├─ Bérélan Voche (N10, Rupture, Lieur)
│  └─ Ravi Folen (N4, Fêlure) : Chute liée réelle
└─ Isma Revet (N9, Rupture, Lieuse)
   └─ Lira Fenet (Fêlure) : Chute liée réelle
```

Ravi, Isma et Lira sont des personnages secondaires **décrits**, mais pas encore des fiches `PER-DECH` chiffrées ni des acteurs de campagne jouée. Les niveaux de ce document sont narratifs, aucun bonus de combat n'en découle. Distinguer systématiquement **fait matériel utile**, **transformation surnaturelle effective**, **lien de tribut** et **responsabilité**. Les étudiants ordinaires, employés, malades et bénéficiaires ne sont jamais comptés comme tribut.

## Fronts modulaires

| Niveau indicatif | Enjeu accessible | Preuves et alternatives | Retour possible |
| --- | --- | --- | --- |
| 2–5 | Infiltration d'une digue et témoignage de Cyrda | Carotte de limon, double relevé, travaux ordinaires | Cyrda rompt le pacte, Tarek reconnaît la dette |
| 3–7 | Ravi veut quitter un apprentissage | Compte des leçons, nouveau banc d'essai, autre maître | Bérélan renonce au Fil, restitue formation et certificats |
| 7–12 | Deux maîtres se disputent la formation | Documents d'atelier, témoignages des adultes liés, rites distincts | Délier Bérélan ou Isma diminue le tribut sans autre effet automatique |
| 13–20 | Réseau d'ateliers opposé à Solvane | Copies de contrats, fonds transparents, succession crédible | Solvane peut réparer après avoir renoncé à ses deux branches |

L'échec n'impose pas de transformation : un nouveau pacte, un consentement répété et le lien de tribut doivent être **joués et établis**. Une victoire contre une branche n'élimine pas ses effets matériels ni les besoins des élèves. Les victimes ne doivent ni pardon ni service après délivrance.

## Intégration Studio MJ

Le tableau `catalogue-antagonistes.json` reste **public**, limité aux informations déjà présentes sur les pages du monde. L'import de référence devient une **copie locale** dont le rôle coloré peut être changé en `Allié / rédemption` sans modifier la fiche commune. Les notes privées du MJ ne sont pas projetées dans la fenêtre joueur. Aucune statistique M01/M03 n'est ajoutée.

## Vérifications demandées

1. Recherche de doublons de noms dans `content/` et `studio-local/` avant création.
2. Pour chaque fichier, `publish: true`, `lore_valide`, code, niveau, image publique et SHA de référence.
3. Liens entre Cyrda/Tarek, Bérélan/Solvane, index et répertoire des antagonistes.
4. Dépendances du Tribut décrites sans assimiler formation ou subordination civile à Chute.
5. Tests Node, bibliothèque Studio, parcours navigateur sur GitHub Actions, publication Pages vérifiée après fusion.

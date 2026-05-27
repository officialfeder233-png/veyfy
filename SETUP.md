# 🎵 Veyfy – Setup Anleitung

Folge diese Anleitung **Schritt für Schritt**. Dauert ca. 30–45 Minuten.

---

## 📋 Was du brauchst

- [Node.js 18+](https://nodejs.org) installiert
- [Git](https://git-scm.com) installiert
- Ein kostenloses Konto bei: MongoDB Atlas, Vercel, Railway, Google Cloud

---

## SCHRITT 1 – MongoDB Atlas (Datenbank)

1. Gehe zu **https://cloud.mongodb.com** → kostenlosen Account erstellen
2. Klick auf **"Create a deployment"** → **M0 Free** auswählen
3. Region: z.B. **Frankfurt (eu-central-1)** → **Create Deployment**
4. Username und Passwort notieren (wird automatisch generiert)
5. Bei **"Add IP"** klick auf **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Danach: **"Go to Overview"** → **"Connect"** → **"Drivers"**
7. Den Connection String kopieren, sieht so aus:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Den String anpassen: `?retryWrites...` ersetzen durch `/veyfy?retryWrites=true&w=majority`

---

## SCHRITT 2 – YouTube Data API Key

1. Gehe zu **https://console.cloud.google.com**
2. Neues Projekt erstellen (z.B. "veyfy")
3. Links im Menü: **"APIs & Dienste"** → **"Bibliothek"**
4. Suche nach **"YouTube Data API v3"** → aktivieren
5. **"Anmeldedaten"** → **"Anmeldedaten erstellen"** → **"API-Schlüssel"**
6. API-Schlüssel kopieren und sicher aufbewahren

---

## SCHRITT 3 – Download Worker auf Railway deployen

Der Worker ist ein separates Python-Programm das Songs von YouTube herunterlädt.

1. Gehe zu **https://railway.app** → kostenlosen Account (mit GitHub)
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Falls noch nicht: GitHub Account verbinden
4. Ein neues **öffentliches** GitHub Repo erstellen, z.B. `veyfy-worker`
5. Den `veyfy-worker/` Ordner in dieses Repo pushen:
   ```bash
   cd veyfy-worker
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/DEIN_NAME/veyfy-worker.git
   git push -u origin main
   ```
6. In Railway: dieses Repo auswählen → **Deploy**
7. Nach dem Deploy: **"Variables"** Tab → diese hinzufügen:
   ```
   WORKER_SECRET = einLangesZufälligesPasswort123!  ← selbst ausdenken & merken!
   PORT = 8000
   ```
8. **"Settings"** → **"Networking"** → **"Generate Domain"** anklicken
9. Die URL kopieren, sieht so aus: `https://veyfy-worker-production.up.railway.app`

---

## SCHRITT 4 – Veyfy (Next.js App) auf Vercel deployen

1. Ein neues GitHub Repo erstellen, z.B. `veyfy`
2. Den `veyfy/` Ordner pushen:
   ```bash
   cd veyfy
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/DEIN_NAME/veyfy.git
   git push -u origin main
   ```
3. Gehe zu **https://vercel.com** → **"New Project"** → GitHub Repo auswählen
4. Framework: **Next.js** (wird automatisch erkannt)
5. Klick auf **"Environment Variables"** und folgende eintragen:

   | Name | Wert |
   |------|------|
   | `MONGODB_URI` | dein MongoDB Connection String aus Schritt 1 |
   | `JWT_SECRET` | ein langer zufälliger String (min. 32 Zeichen) |
   | `YOUTUBE_API_KEY` | dein YouTube API Key aus Schritt 2 |
   | `WORKER_URL` | deine Railway URL aus Schritt 3 |
   | `WORKER_SECRET` | das gleiche Passwort wie bei Railway |

   > **JWT_SECRET generieren:** Öffne Terminal und tippe: `openssl rand -hex 32`
   > Falls du kein Terminal hast, nimm z.B.: `meinSuperGeheimesJWTSecret2024VeyfyApp!XyZ`

6. Klick **"Deploy"** → warten bis fertig
7. Deine App-URL kopieren, z.B. `https://veyfy.vercel.app`

---

## SCHRITT 5 – Ersten Admin-Account erstellen

Jetzt musst du einmalig den Admin-Account in der Datenbank anlegen.

1. Öffne die Datei `veyfy/scripts/create-admin.js`
2. Ändere diese zwei Zeilen:
   ```javascript
   const ADMIN_USERNAME = 'deinName'      // ← dein gewünschter Username
   const ADMIN_PASSWORD = 'DeinPasswort!' // ← ein sicheres Passwort
   ```
3. Im Terminal im `veyfy/` Ordner:
   ```bash
   npm install
   export MONGODB_URI="dein-connection-string-aus-schritt-1"
   node scripts/create-admin.js
   ```
4. Du solltest sehen: `✅ Admin-Account "deinName" erfolgreich erstellt!`

---

## SCHRITT 6 – Lokal testen (optional aber empfohlen)

```bash
cd veyfy

# .env.local erstellen (kopiere .env.local.example und fülle aus)
cp .env.local.example .env.local
# Öffne .env.local und trage alle Werte ein

npm install
npm run dev
```

Öffne **http://localhost:3000** → Login-Screen sollte erscheinen!

---

## SCHRITT 7 – Freunde hinzufügen

1. Logge dich auf deiner Vercel-URL ein (mit deinem Admin-Account)
2. Klick links auf **"Admin"**
3. Trage den gewünschten Username + Passwort ein → **Account erstellen**
4. Schick deinen Freunden die URL + ihre Login-Daten

---

## 🎉 Das war's!

Deine Veyfy-Instanz ist jetzt live. Gehe auf **Suche**, tippe z.B. `AK Ausserkontrolle` und klick auf **Hinzufügen** um den ersten Song zu laden!

---

## ❓ Häufige Probleme

**"Worker antwortet nicht"**
→ Gehe auf Railway → Logs überprüfen. Oft hilft es, den Service neu zu starten.

**"YouTube API Fehler"**  
→ Stelle sicher, dass die YouTube Data API v3 aktiviert ist und der Key korrekt ist.

**"Download hängt ewig"**  
→ Railway Free Tier hat manchmal Kaltstart-Latenz (~30 Sek). Einfach nochmal probieren.

**Songs werden nicht angezeigt nach Download**  
→ Seite neu laden. Der Download läuft asynchron.

**"Catbox Upload schlägt fehl"**  
→ Catbox.moe hat manchmal kurze Ausfälle. Einfach nochmal versuchen.

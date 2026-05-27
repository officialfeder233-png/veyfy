// Dieses Script einmalig ausführen um den ersten Admin-Account zu erstellen
// Ausführen mit: npx ts-node --project tsconfig.json scripts/create-admin.ts
// Oder: node -e "require('./scripts/create-admin.js')"

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable nicht gesetzt!')
  console.error('   Setze sie mit: export MONGODB_URI="dein-connection-string"')
  process.exit(1)
}

// Hardcode deine Admin-Daten hier für einmalige Ausführung:
const ADMIN_USERNAME = 'admin'         // ← ÄNDERN
const ADMIN_PASSWORD = 'DeinPasswort!' // ← ÄNDERN (sicheres Passwort wählen!)

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Mit MongoDB verbunden')

  const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: Boolean,
    createdAt: { type: Date, default: Date.now },
    likedSongs: [],
  })

  const User = mongoose.models.User || mongoose.model('User', UserSchema)

  const existing = await User.findOne({ username: ADMIN_USERNAME.toLowerCase() })
  if (existing) {
    console.log(`⚠️  User "${ADMIN_USERNAME}" existiert bereits`)
    await mongoose.disconnect()
    return
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12)
  await User.create({
    username: ADMIN_USERNAME.toLowerCase(),
    password: hashed,
    isAdmin: true,
  })

  console.log(`✅ Admin-Account "${ADMIN_USERNAME}" erfolgreich erstellt!`)
  console.log(`   Jetzt kannst du dich unter /login einloggen.`)
  await mongoose.disconnect()
}

main().catch(console.error)

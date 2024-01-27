const crypto = require('crypto');
const fs = require('fs');

// Fonction pour générer une clé de chiffrement aléatoire
function generateKey() {
  return crypto.randomBytes(32); // 32 bytes pour la clé AES-256
}

// Fonction pour crypter le contenu JSON
function encryptJSON(json, key) {
  const iv = crypto.randomBytes(16); // Génération d'un vecteur d'initialisation aléatoire
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(json), 'utf-8'), cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

// Fonction pour décrypter le contenu JSON
function decryptJSON(encryptedData, key) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(encryptedData.iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData.content, 'hex')), decipher.final()]);
  return JSON.parse(decrypted.toString('utf-8'));
}

// Exemple d'utilisatio
const file = require("../required.json")
//ssssssssssssssssssssssssssssssssssssssfile.key = generateKey();
const key = require("../required.json").key
console.log(key)
const jsonData = { message: 'Hello, World!' };

// Crypter le fichier JSON
const encryptedData = encryptJSON(jsonData, key);

// Enregistrer le fichier crypté
fs.writeFileSync('encrypted.json', JSON.stringify(encryptedData));

// Lire le fichier crypté
const fileContent = fs.readFileSync('encrypted.json', 'utf-8');
const decryptedData = decryptJSON(JSON.parse(fileContent), key);

console.log('Fichier JSON décrypté:', decryptedData);
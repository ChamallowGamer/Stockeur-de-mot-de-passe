//Importations
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt")
const { Resolver } = require("dns");
const { parse } = require("path");
const os = require('os')
const axios = require("axios")


//Variables
const desktopPath = `${os.homedir()}\\Desktop`;
const passwordsFile = './main.json';
const requiredFile = './required.json';


//Couleurs de console
const Black = "\x1b[30m";
const Red = "\x1b[31m";
const Green = "\x1b[32m";
const Yellow = "\x1b[33m";
const Blue = "\x1b[34m";
const Magenta = "\x1b[35m";
const Cyan = "\x1b[36m";
const White = "\x1b[37m";
const Gray = "\x1b[90m";
const Reset = "\x1b[0m";


//Fonction vérification de l'existence d'un fichier
function fichierExiste(url) {
    return fetch(url)
      .then(response => {
        // Vérifiez si le statut de la réponse est OK (200)
        if (response.ok) {
          return true;
        } else {
          return false;
        }
      })
      .catch(error => {
        // Une erreur s'est produite (probablement car le fichier n'existe pas)
        return false;
    });
}

//Fonctions
function generatePassword(length) {
    let password ="";
    let numbers = ["1","2", "3", "4", "5", "6", "7", "8", "9", "0"];
    let symbols = ["$","!","@","#","$","%","^","&","*","(",")","-","_","{","}","[","]","<",">","?","/","|",",","'","`","~","`"];
    let upperCase = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    let lowerCase = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    let i = 0;
    while (i < length) {
        let random = Math.floor(Math.random() * 4);
        if(random === 0){
            random = Math.floor(Math.random() * numbers.length);
            let randomNumber = numbers[random];
            password += randomNumber;
            i++
        }
        if(random === 1){
            random = Math.floor(Math.random() * symbols.length);
            let randomSymbol = symbols[random];
            password += randomSymbol;
            i++
        }
        if(random === 2){
            random = Math.floor(Math.random() * upperCase.length);
            let randomUpperCase = upperCase[random];
            password += randomUpperCase;
            i++
        }
        if(random === 3){
            random = Math.floor(Math.random() * numbers.length);
            let randomLowerCase = lowerCase[random];
            password += randomLowerCase;
            i++
        }

    }
    console.log(password)
    return password

}

function readFileAsync(file) {
    return new Promise((res, rej) => {
        fs.readFile(file, 'utf8', (err, content) => {
            if (err) {
                return rej(err)
            }
            res(content)
        })
    })
}

function writeFileAsync(file, data) {
    return new Promise((res, rej) => {
        fs.writeFile(file, data, 'utf8', (err) => {
            if (err) {
                return rej(err)
            }
            res(true)
        })
    })
}


async function readJsonFile(file) {
    const contentFile = await readFileAsync(file)
    return JSON.parse(contentFile)
}

async function writeJsonFile(file, data) {
    await writeFileAsync(file, JSON.stringify(data))
}

function backup(manuelle) {
    var date = new Date();

    var jour = date.getDate().toString().padStart(2, '0');
    var mois = (date.getMonth() + 1).toString().padStart(2, '0');
    var annee = date.getFullYear();
    var heures = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var secondes = date.getSeconds().toString().padStart(2, '0');

    var date_now = 'Le ' + jour + '-' + mois + '-' + annee + ' à ' + heures + 'H' + minutes + ' ' + secondes + 'S';

    readJsonFile(passwordsFile)
    .then((content) => {
        if(manuelle === false){
            return writeJsonFile(`./backups/${date_now}.json`, content)
        }
        
        if(manuelle === true){
            return writeJsonFile(`./backups/${date_now} - Backup Manuelle.json`, content)
        }
    })
    .then(() => {
        console.log('Sauvegarde effectué')
    })
    .catch((err) => {
        console.error(err)
    })
}

//Vérification existence du fichier des mots de passe
fichierExiste(passwordsFile).then(existe => {
    if(existe === false) {
        console.error(Red +"Le fichier contenant les mots de passe n'existe pas." + Reset);
    
        const data = {};
        const jsonData = JSON.stringify(data, null, 2);
    
        fs.writeFile(passwordsFile, jsonData, (err) => {
            if (err) {
                console.error("Erreur lors de la création du fichier JSON :", err);
            } else {
                console.log(Green +"Le fichier contenant les mots de passe a été créé avec succès !" + Reset);
            }
        });
        }
    });
    

    //Verification du fichier des préréquis
fichierExiste(requiredFile).then(existe => {
    if(existe === false) {
        console.error(Red +"Le fichier contenant les prérequis n'existe pas." + Reset);
        
        const data = {};
        const jsonData = JSON.stringify(data, null, 2);
        
        fs.writeFile(passwordsFile, jsonData, (err) => {
            if (err) {
                console.error("Erreur lors de la création du fichier JSON :", err);
            } else {
                console.log(Green +"Le fichier contenant les prérequis a été créé avec succès !" + Reset);
            }
        });
    }
});

if(!requiredFile.MainPassword){
    let password = prompt(Blue + "Veuillez définir un mot de passe : " + Reset)

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    readJsonFile(requiredFile)
    .then((content) => {

        content.MainPassword = hash

        return writeJsonFile(requiredFile, content)
    })
    .then(() => {
        console.log(Green + 'Mot de passe enregistré' + Reset)
    })
    .catch((err) => {
        console.error(err)
    })
}else{
    let password = "";
    const salt = bcrypt.genSaltSync(10);
    
    const hash = bcrypt.hashSync(password, salt);

    while(bcrypt.compareSync(password,requiredFile.MainPassword) === false){
        password = prompt(Blue + "Mot de passe : " + Reset)
        if(bcrypt.compareSync(password,requiredFile.MainPassword)){
            console.log(Green + "Bienvenue!" + Reset)
        }else{
            console.log(Red + "Mot de passe incorrect, veuillez réessayer." + Reset)
        }
    }
}

console.log(Cyan + "1 - Chercher un mot de passe" + Reset);
console.log(Cyan + "2 - Ajoutez un mot de passe dans un Site/Jeux déjà existant" + Reset);
console.log(Cyan + "3 - Ajoutez un mot de passe dans un nouveau compte" + Reset);
console.log(Cyan + "4 - Changer un mot de passe" + Reset)
console.log(Cyan + "5 - Supprimer un compte d'un Site/Jeux" + Reset)
console.log(Cyan + "6 - Supprimer un Site/Jeux" + Reset)
console.log(Cyan + "7 - Lister les sauvegardes" + Reset)
console.log(Cyan + "8 - Effectuer une sauvegarde" + Reset)
console.log(Cyan + "99 - Paramètres"  + Reset)
let ask = prompt(Blue + "Réponse :" + Reset)

if(ask === "1"){
    let gameSearch = prompt(Blue + "Site/Jeux :" + Reset)
    if(passwordsFile[gameSearch] != undefined){

        let accounts = passwordsFile[gameSearch];

        let i = 0;
        let ii = accounts.length;
        let NumberAccounts = 0;

        let AccountNumbersArray = []
        while(i != ii){
            if(accounts[i] === null){
                i++
                delete accounts[i]
            }else{
                i++
                NumberAccounts++
                AccountNumbersArray.push(i)
            }
        }

        if(NumberAccounts > 1){

            console.log(`Il y a ${NumberAccounts} comptes ${gameSearch}`)

            i = 0;
            while(i != AccountNumbersArray.length){ 

                const a = AccountNumbersArray[i] - 1

                //
                console.log(a)
                console.log(accounts[a])
                //

                console.log(Green +"Nom d'utilisateur : " + accounts[2].username)
                console.log("Email : " + accounts[a].email)
                console.log("Identifiant : " + accounts[a].identifiant)
                console.log("Mot de passe : " + accounts[a].password)
                console.log("Clé de backup : " + accounts[a].backup)
                console.log(Green + "Comptes liés : " + accounts[a].accountlinked + Reset)
                console.log( Cyan + "----------" + Reset)
                i++

            }
        }else{
            i = 0

            console.log(`Il y a 1 compte ${gameSearch}`)

            console.log(Green + "Username : " + accounts[AccountNumbersArray[i]].username)
            console.log("Email : " + accounts[AccountNumbersArray[i]].email)
            console.log("Identifiant : " + accounts[AccountNumbersArray[i]].identifiant)
            console.log("Password : " + accounts[AccountNumbersArray[i]].password)
            console.log("Backup : " + accounts[AccountNumbersArray[i]].backup)
            console.log(Green + "Account linked : " + accounts[AccountNumbersArray[i]].accountlinked + Reset)
            console.log(Cyan + "----------" + Reset)
        }
    }else{
        console.warn(Red + "Aucun résultat" + Reset)
    }
}

if(ask === "2"){
    let gameSearch = prompt(Blue + "Site/Jeux :" + Reset)

    if(passwordsFile[gameSearch] != undefined){

        const data = JSON.parse(fs.readFileSync(passwordsFile, 'utf-8'));

        const compteactuel = data[gameSearch]

        let usernameAsk = prompt(Green + "Nom d'utilisateur :");
        if(usernameAsk === "")usernameAsk = null;

        let emailAsk = prompt("Email :");
        if(emailAsk === "")emailAsk = null;

        let identifiantAsk = prompt("Identifiant :");
        if(identifiantAsk === "")identifiantAsk = null;

        let passwordAsk = prompt("Mot de passe :");
        if(passwordAsk === "")passwordAsk = null;
        if(passwordAsk === "generate")passwordAsk = generatePassword(24);

        let backupAsk = prompt("Backup :");
        if(backupAsk === "")backupAsk = null;

        let accountlinkedAsk = prompt(Green + "Compte lié :" + Reset);
        if(accountlinkedAsk === "")accountlinkedAsk = null;

        readJsonFile(passwordsFile)
        .then((content) => {
    
            content[gameSearch].push({
                username: usernameAsk,
                email: emailAsk,
                identifiant: identifiantAsk,
                password: passwordAsk,
                backup: backupAsk,
                accountlinked: accountlinkedAsk
            })

            return writeJsonFile(passwordsFile, content)
        })
        .then(() => {
            console.log('Changement effectué')
        })
        .catch((err) => {
            console.error(err)
        })


    }else{
        console.log(Red + "Aucun compte trouvé" + Reset)
    }
}

if(ask === "3"){
    console.log("Laisser vide pour ne rien entrer")

    let name = prompt(Green +"Nom du site/jeu :");
    if(name === "")name = null;

    let usernameAsk = prompt("Nom d'utilisateur :");
    if(usernameAsk === "")usernameAsk = null;

    let emailAsk = prompt("Email :");
    if(emailAsk === "")emailAsk = null;

    let identifiantAsk = prompt("Identifiant :");
    if(identifiantAsk === "")identifiantAsk = null;

    let passwordAsk = prompt("Mot de passe :");
    if(passwordAsk === "")passwordAsk = null;
    if(passwordAsk === "generate")passwordAsk = generatePassword(24);

    let backupAsk = prompt("Backup :");
    if(backupAsk === "")backupAsk = null;

    let accountlinkedAsk = prompt(Green + "Compte lié :" + Reset);
    if(accountlinkedAsk === "")accountlinkedAsk = null;

    readJsonFile(passwordsFile)
        .then((content) => {

            content[name] = [];
    
            content[name].push({
                username: usernameAsk,
                email: emailAsk,
                identifiant: identifiantAsk,
                password: passwordAsk,
                backup: backupAsk,
                accountlinked: accountlinkedAsk
            })
    
            return writeJsonFile(passwordsFile, content)
        })
        .then(() => {
            console.log('Changement effectué')
        })
        .catch((err) => {
            console.error(err)
        })
        
}

if(ask === "4"){
    backup(false)
    console.log(Red +"En dévellopement" + Reset)

    let gameSearch = prompt(Blue + "Site/Jeux :" + Reset)

    if(json[gameSearch] != undefined){

        console.log(Red + `Laissez vide pour generer un mot de passe aléatoirement` + Reset)
        let newPassword = prompt(Blue + "Nouveau mot de passe :" + Reset);
        if(!newPassword)newPassword = generatePassword(24);

        readJsonFile(passwordsFile)
        .then((content) => {

            content[gameSearch].password = newPassword;

            return writeJsonFile(passwordsFile, content)
        })
        .then(() => {
            console.log('Changement effectué')
        })
        .catch((err) => {
            console.error(err)
        })
    }
}

if(ask === "5"){
    backup(false)
    let gameSearch = prompt(Blue + "Site/Jeux :" + Reset)

    console.log(Red +"Attention, le compte que vous aller selectionner vas être supprimé" + Reset)
    console.log(Red + "Attention : Le premier est N°0!" + Reset)
    let accountnumber = prompt(Blue + "Compte N° :" + Reset)

    readJsonFile(passwordsFile)
    .then((content) => {
        delete content[gameSearch][accountnumber]

        return writeJsonFile(passwordsFile, content)
    })
    .then(() => {
        console.log('Changement effectué')
    })
    .catch((err) => {
        console.error(err)
    })

}

if(ask === "6"){
    backup(false)
    console.log(Red +"Attention, tout les comptes de cette platforme vont êtres supprimés!" + Reset)
    let gameSearch = prompt(Blue + "Site/Jeux :" + Reset)

    readJsonFile(passwordsFile)
    .then((content) => {
        delete content[gameSearch]

        return writeJsonFile(passwordsFile, content)
    })
    .then(() => {
        console.log('Changement effectué')
    })
    .catch((err) => {
        console.error(err)
    })
}

if(ask === "7"){
    const directoryPath = './backups';

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Erreur de lecture du dossier :', err);
        }

        console.log('Liste des sauvegardes :');
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            const isDirectory = fs.statSync(filePath).isDirectory();
            if (!isDirectory) {
                console.log(file);
            }
        });
    });
}

if(ask === "8"){
    backup(true)
}

if(ask === "99"){
    console.log(Cyan + "0 - Retour" + Reset)
    console.log(Cyan + "1 - Créer un racourci sur le bureau" + Reset)
    console.log(Cyan + "2 - Changez la langue" + Reset)
    optionsAsk = prompt(Blue + "Réponse : " + Reset)

    if(optionsAsk === "1"){
        const sourceFilePath = './Stockeur de mot de passe.lnk';

        // Lire le contenu du fichier source
        fs.readFile(sourceFilePath, (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier source :', err);
        } else {
            // Écrire le contenu dans le fichier de destination
            fs.writeFile(desktopPath, data, (err) => {
            if(err){
                console.error("Erreur lors de l'écriture dans le fichier de destination :", err);
            }else{
                console.log('Raccourci créé avec succés!');
            }
            });
        }
        });
    }

    if(optionsAsk === "2"){
        console.log(Red + "L'option de traduction est en développement" + Reset)
    }
}

if(ask === "admin"){
    console.log(Red + "Attention,vous entrez dans la zone d'administration!" + Reset)
    const password = generatePassword(12);
    console.log(Green + "Mot de passe : " + password + Reset)
    
}
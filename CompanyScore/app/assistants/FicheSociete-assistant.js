/*
* Copyright (C) 2010 Marc de Verdelhan (http://www.verdelhan.eu/)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function FicheSocieteAssistant(ficheSociete, estEnFavoris, siren, formulaire) {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
      this.ficheSociete = ficheSociete;
      this.siren = siren;
      this.estEnFavoris = estEnFavoris;
      this.formulaire = formulaire;
}

FicheSocieteAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
        
    /* use Mojo.View.render to render view templates and add them to the scene, if needed. */
    
    /* setup widgets here */
    
    /* add event handlers to listen to events from widgets */
    
    
    // Mise en place du menu
    this.controller.setupWidget(Mojo.Menu.appMenu, newsMenuAttr, newsMenuModel); // Affichage du menu "formulaire" pour cette scene
    
    // Titre/nom de la société
    var titreSociete = this.ficheSociete.replace(/^(.*?)<td class="Arial14Bold" colspan="2">(.*?)<\/td>(.*?)$/, "$2");
    titreSociete = titreSociete.replace(/^(.*?)<td class="titreEntreprise">(.*?)$/, "$2");
    $('main-hdr').update(titreSociete);
    //console.log(this.ficheSociete);
    // Données sur la société
    var colonnes = this.ficheSociete.match(/<td valign="top" width="50%"><table width="100%" cellspacing="3" cellpadding="0" border="0">(.*?)<tr><td height="5"><\/td><\/tr><\/table><\/td>/g);
    
    tabColonneUn = colonnes[0].match(/<table width="100%" cellspacing="3" cellpadding="0" border="0">(.*?)<tr><td height="5"><\/td><\/tr><\/table>/g);
    tabColonneDeux = colonnes[1].match(/<table width="100%" cellspacing="3" cellpadding="0" border="0">(.*?)<tr><td height="5"><\/td><\/tr><\/table>/g);
    
    // On met en forme les données
    var donneesSociete = "";
    for(var i = 1; i < tabColonneUn.length-2; i++) {
        donneesSociete = donneesSociete.concat(tabColonneUn[i]);
    }
    for(var i = 1; i < tabColonneDeux.length; i++) {
        donneesSociete = donneesSociete.concat(tabColonneDeux[i]);
    }
    
    // Nettoyage...
    donneesSociete = donneesSociete.replace(/<a[^>]*>(.*?)<\/a>/g,""); // Suppression des liens
    donneesSociete = donneesSociete.replace(/<img[^>]*>/g,""); // Suppression des images
    donneesSociete = donneesSociete.replace(/&nbsp;/g," "); // Suppression des espaces insecables
    donneesSociete = donneesSociete.replace(/ouvrirComptesSociaux/g,"FicheSocieteAssistant.prototype.ouvrirComptesSociaux"); // Correction des liens pour les comptes sociaux
    
    $('data-societe').update(donneesSociete);
    
    this.adresseSociete = this.ficheSociete.replace(/^(.*?)<tr><td width="40%" class="ligne1_2">Adresse<\/td><td class="ligne2_2">(.*?)<\/td><\/tr>(.*?)$/, "$2");
    this.adresseSociete = this.adresseSociete.replace(/&nbsp;/g," "); // Suppression des espaces insecables
    this.adresseSociete = this.adresseSociete.replace(/<br>/g," - "); // Suppression des <br>
    
    // Mise en place du menu "commande" de la société
    if(estEnFavoris) { // La société est déjà en favoris
        this.cmdMenuModel = {items:[{iconPath:'images/google_maps.png', command:'show-on-map'}, {iconPath:"images/crystal_clear_delete_fav.png", command:'remove-from-favorites'}]};
    } else { // La société n'est pas en favoris
        this.cmdMenuModel = {items:[{iconPath:'images/google_maps.png', command:'show-on-map'}, {iconPath:"images/crystal_clear_add_fav.png", command:'add-to-favorites'}]};
    }
    this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel);
}

/**
 * 
 * @param {Object} 
 */
FicheSocieteAssistant.prototype.ouvrirComptesSociaux = function(siren, annee) {

    /* Recupère les comptes sociaux d'une société à partir d'une année et du SIREN */
    var request = new Ajax.Request("http://score3.fr/comptes-sociaux.shtml", {
        method: 'get',
        parameters: "siren="+siren+"&annee="+annee,
        evalJSON: 'false',
        onSuccess: this.gotResults.bind(this),
        onFailure: this.failure.bind(this)
    });
}

/**
 * Appelée par Prototype quand la requête réussit
 * @param {Object} transport
 */
FicheSocieteAssistant.prototype.gotResults = function(transport) {

    var titre = transport.responseText.replace(/^(.*?)<td class="titreEntreprise">(.*?)pour (.*?) sur Score3<\/td>(.*?)$/, "$3");
    var tableauComptesSociaux = transport.responseText.replace(/^(.*?)<fieldset class="cadre2">(.*?)<\/fieldset>(.*?)$/, "$2");

    // On a obtenu les comptes sociaux, on les envoie à la scene suivante
    Mojo.Controller.stageController.pushScene("ComptesSociaux", titre, tableauComptesSociaux);
}

/**
 * Appelée par Prototype quand la requête échoue
 * @param {Object} transport
 */
FicheSocieteAssistant.prototype.failure = function(transport) {

    //console.log("failure !!!!!!");
}

FicheSocieteAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
              case 'show-on-map':
                this.controller.serviceRequest('palm://com.palm.applicationManager', {
                    method:'open',
                    parameters:{target: 'mapto:'+this.adresseSociete, zoom: 10 }
                }); 
                break;
              case 'add-to-favorites':
                  this.addFav();
                break;
              case 'remove-from-favorites':
                  this.removeFav();
                break;
        }
      }
};

FicheSocieteAssistant.prototype.addFav = function() {
    
    var sql = "INSERT INTO 'table_favoris' (siren, data) VALUES ("+this.siren+", '"+escape(this.formulaire)+"')";
    //console.log(sql);
    db.transaction( function (transaction) {
          transaction.executeSql(sql, [], 
            function(transaction, results) {    // success handler
                Mojo.Log.info("Successfully inserted record"); 
            },
            function(transaction, error) {      // error handler
                Mojo.Log.error("Could not insert record: " + error.message);
            });
    });

    this.cmdMenuModel.items[1].iconPath = "images/crystal_clear_delete_fav.png";
    this.cmdMenuModel.items[1].command = "remove-from-favorites";
    this.controller.modelChanged(this.cmdMenuModel);
}

FicheSocieteAssistant.prototype.removeFav = function() {
    
    var sql = "DELETE FROM table_favoris WHERE siren="+this.siren;
    db.transaction( function (transaction) {
          transaction.executeSql(sql, [], 
            function(transaction) {    // success handler
                Mojo.Log.info("Successfully delete"); 
            },
            function(transaction, error) {      // error handler
                Mojo.Log.error("Could not delete record: " + error.message);
            });
    });
    
    this.cmdMenuModel.items[1].iconPath = "images/crystal_clear_add_fav.png";
    this.cmdMenuModel.items[1].command = "add-to-favorites";
    this.controller.modelChanged(this.cmdMenuModel);
}

FicheSocieteAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
}

FicheSocieteAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
}

FicheSocieteAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
}

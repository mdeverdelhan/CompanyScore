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

function ListeFavorisAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
}

ListeFavorisAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
        
    /* use Mojo.View.render to render view templates and add them to the scene, if needed. */
    
    /* setup widgets here */
    
    /* add event handlers to listen to events from widgets */
    
    // Mise en place du menu
    this.controller.setupWidget(Mojo.Menu.appMenu, favMenuAttr, favMenuModel); // Affichage du menu "favoris" pour cette scene
} 

/**
 * 
 * @param {Object} urlSociete
 */
ListeFavorisAssistant.prototype.getInfos = function(urlSociete) {
    // Récupération du siren
    this.sirenSelectionne = urlSociete.replace(/^(.*?)([0-9]{9})(.*?)$/,"$2");
    
    var sql = "SELECT siren FROM 'table_favoris' WHERE siren = "+this.sirenSelectionne;
    db.transaction( function (transaction) {
          transaction.executeSql(sql, [], 
            function(transaction, results) {    // success handler
                //console.log("results.rows.length : "+results.rows.length);
                estEnFavoris = (results.rows.length > 0);
            },
            function(transaction, error) {      // error handler
                Mojo.Log.error("Could not : " + error.message);
            });
    });

    /* Recupère les infos d'une société à partir de son URL */
    var request = new Ajax.Request(urlSociete, {
        evalJSON: 'false',
        onSuccess: this.gotResults.bind(this),
        onFailure: this.failure.bind(this)
    });
}

/**
 * Appelée par Prototype quand la requête réussit
 * @param {Object} transport
 */
ListeFavorisAssistant.prototype.gotResults = function(transport) {
    
    var tableauFicheSociete = transport.responseText.match(/<table cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td class="Arial14Bold" colspan="2">(.*?)<\/tr><\/table><\/td><\/tr><\/table><table/g);

    // On a obtenu les resultats, on les envoie à la scene suivante
    Mojo.Controller.stageController.pushScene("FicheSociete", tableauFicheSociete[0], estEnFavoris, this.sirenSelectionne, $("F"+this.sirenSelectionne).outerHTML);
}

/**
 * Appelée par Prototype quand la requête échoue
 * @param {Object} transport
 */
ListeFavorisAssistant.prototype.failure = function(transport) {

    //console.log("failure !!!!!!");
}

ListeFavorisAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
      
    // Récupération des données de la base
    var sql = "SELECT * FROM 'table_favoris'";
 
    db.transaction(function(transaction) {
          transaction.executeSql(sql, [],
            function(transaction, results) {
                /* Mise en place de la liste des favoris */
                var list = [];
                var currentSociete;
                for(var i = 0; i < results.rows.length; i++) {
                    currentSociete = results.rows.item(i).data.replace(/ListeResultatsAssistant/, "ListeFavorisAssistant");
                    list.push({champItemSociete: unescape(currentSociete)});
                }    
            
                
                var content = Mojo.View.render({
                    collection: list,
                    template: 'ListeFavoris/itemFavoris',
                    separator: 'separator'
                });
                $('items').update(content);
                
                
                if (list.length > 0) {
                    $('listeFavorisVide').innerHTML = "";
                } else {
                    $('listeFavorisVide').innerHTML = "Aucun favoris enregistré";
                }
                /* Fin de la mise en place de la liste des favoris */
            },
            function(transaction, error) {
                Mojo.Log.error("Could not read: " + error.message);
            });
    });
}

ListeFavorisAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
}

ListeFavorisAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
}

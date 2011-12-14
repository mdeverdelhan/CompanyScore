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

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
    
    // Création de la base de données et de la table des favoris
    var name = "db_favoris_cs";  // required
    var version = "0.1";  // required
 
    db = openDatabase(name, version);
 
    if (!db) {
          Mojo.Log.error("Could not open database");
    } else {
          var sql = "CREATE TABLE IF NOT EXISTS 'table_favoris' (id INTEGER PRIMARY KEY, siren INTEGER, data TEXT)";
          db.transaction( function (transaction) {
            transaction.executeSql(sql,  // SQL to execute
                [],    // array of substitution values (if you were inserting, for example)
                function(transaction, results) {    // success handler
                    Mojo.Log.info("Successfully created table"); 
                },
                function(transaction, error) {      // error handler
                       Mojo.Log.error("Could not create table: " + error.message);
                 });
          }.bind(this));
    }
    // Fin de la création de la base
    
    // Description du menu de l'application
    newsMenuAttr = {omitDefaultItems: true};
    newsMenuModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem, // Edit
            {label: "Favoris", iconPath: "images/crystal_clear_favoris.png",command: 'do-favoris'},
            //Mojo.Menu.prefsItem, // Préférences
            //Mojo.Menu.helpItem, // Aide
            {label: "À propos...", command: 'do-about'},
            {label: "Aide", iconPath: "images/crystal_clear_aide.png",command: 'do-aide'} // Nouvelle aide
        ]
    };
    
    // Description du menu de la scene des favoris
    favMenuAttr = {omitDefaultItems: true};
    favMenuModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem, // Edit
            {label: "À propos...", command: 'do-about'},
            {label: "Aide", iconPath: "images/crystal_clear_aide.png",command: 'do-aide'} // Nouvelle aide
        ]
    };
    
    // Description du menu de la scene de l'aide
    aideMenuAttr = {omitDefaultItems: true};
    aideMenuModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem, // Edit
            {label: "Favoris", iconPath: "images/crystal_clear_favoris.png",command: 'do-favoris'},
            {label: "À propos...", command: 'do-about'}
        ]
    };

    this.controller.pushScene("Formulaire"); // Lancement de la scene du formulaire
}

/**
 * Fonction de gestion du menu
 * @param {Object} event
 */
StageAssistant.prototype.handleCommand = function(event) {
    var currentScene = this.controller.activeScene();
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'do-about': // Menu "A propos..."
                currentScene.showAlertDialog({
                    onChoose: function(value) {},
                    title: "CompanyScore - v1.0",
                    message: "Marc de Verdelhan pour le SFRJTD 2010",
                    choices:[
                        {label: "OK", value:""}
                    ]
                });
                break;
            case 'do-favoris': // Menu "Favoris"
                Mojo.Controller.stageController.pushScene("ListeFavoris");
                break;
            case 'do-aide': // Menu "Aide"
                Mojo.Controller.stageController.pushScene("Aide");
                break;
        }
    }
}

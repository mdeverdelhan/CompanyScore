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

function FormulaireAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
}

FormulaireAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
        
    /* use Mojo.View.render to render view templates and add them to the scene, if needed. */
    
    /* setup widgets here */
    
    /* add event handlers to listen to events from widgets */
    
    this.numPageCourante = 1;
    this.nbPages = 1;
        
    // Mise en place du menu
    this.controller.setupWidget(Mojo.Menu.appMenu, newsMenuAttr, newsMenuModel); // Affichage du menu "formulaire" pour cette scene
    
    // Mise en place des champs de texte
    this.controller.setupWidget('siretTextField', {
                                                    hintText: 'SIREN',
                                                    modifierState: Mojo.Widget.numLock,
                                                    limitResize: false,
                                                    focusMode: Mojo.Widget.focusSelectMode,
                                                    changeOnKeyPress: true,
                                                    textReplacement: false,
                                                    maxLength: 9,
                                                    requiresEnterKey: false
                                                    }, {});
    this.controller.setupWidget('raisonSocialeTextField', {
                                                    hintText: 'Raison sociale',
                                                    limitResize: false,
                                                    focusMode: Mojo.Widget.focusSelectMode,
                                                    changeOnKeyPress: true,
                                                    textReplacement: false,
                                                    maxLength: 50,
                                                    requiresEnterKey: false
                                                    }, {});
    this.controller.setupWidget('nafTextField', {
                                                    hintText: 'Code NAF/APE',
                                                    modifierState: Mojo.Widget.capsLock,
                                                    limitResize: false,
                                                    focusMode: Mojo.Widget.focusSelectMode,
                                                    changeOnKeyPress: true,
                                                    textReplacement: false,
                                                    maxLength: 6,
                                                    requiresEnterKey: false
                                                    }, {});
    this.controller.setupWidget('nomDirigeantTextField', {
                                                    hintText: 'Nom du dirigeant',
                                                    limitResize: false,
                                                    focusMode: Mojo.Widget.focusSelectMode,
                                                    changeOnKeyPress: true,
                                                    textReplacement: false,
                                                    maxLength: 50,
                                                    requiresEnterKey: false
                                                    }, {});
    this.controller.setupWidget('departementTextField', {
                                                    hintText: 'Département',
                                                    modifierState: Mojo.Widget.numLock,
                                                    limitResize: false,
                                                    focusMode: Mojo.Widget.focusSelectMode,
                                                    changeOnKeyPress: true,
                                                    textReplacement: false,
                                                    maxLength: 3,
                                                    requiresEnterKey: false
                                                    }, {});
    this.controller.setupWidget("spinnerFormulaire",
        this.attributes = {},
        this.model = {
            spinning: false 
        }
    ); 
    // Mise en place du bouton de "Recherche"
    this.findButtonModel = {
        buttonLabel : 'Rechercher',
        disabled : false
    };
    this.controller.setupWidget("findButton", {}, this.findButtonModel);
    this.handleFindButtonPressed = this.handleFindButtonPressed.bind(this);
    Mojo.Event.listen(this.controller.get('findButton'), Mojo.Event.tap, this.handleFindButtonPressed);
    
}

/**
 * Fonction d'envoi des variables par GET
 */
FormulaireAssistant.prototype.sendGetData = function() {

    var url = 'http://www.score3.fr/entreprises.shtml';
    var parametres = '';
    var siret = this.controller.get('siretTextField').mojo.getValue();
    if((siret != '') && (siret.length == 9)) { // SIRET défini
        parametres = 'siren='+siret+'&page='+this.numPageCourante;
        //console.log("param : "+parametres);
        var request = new Ajax.Request(url, {
            method: 'get',
            parameters: parametres,
            evalJSON: 'false',
            onSuccess: this.gotResults.bind(this),
            onFailure: this.failure.bind(this)
        });
        
    } else { // SIRET non défini
        var dpt = this.controller.get('departementTextField').mojo.getValue();
        var rs = this.controller.get('raisonSocialeTextField').mojo.getValue();
        var nd = this.controller.get('nomDirigeantTextField').mojo.getValue();
        var naf = this.controller.get('nafTextField').mojo.getValue();
        if((dpt != '') || (rs != '') || (nd != '') || (naf != '')) { // Un autre champ est défini
            parametres = 'activite='+escape(naf)+'&departement='+escape(dpt)+'&raison_sociale='+escape(rs)+'&dirigeant='+escape(nd)+'&page='+this.numPageCourante;
            //console.log("param : "+parametres);
            var request = new Ajax.Request(url, {
                method: 'get',
                parameters: parametres,
                evalJSON: 'false',
                onSuccess: this.gotResults.bind(this),
                onFailure: this.failure.bind(this)
            });
            
        } else { // Aucun autre champ n'est défini
            this.controller.get('spinnerFormulaire').mojo.stop();
            this.controller.showAlertDialog({
                onChoose: function(value) {},
                title: "CompanyScore",
                message: "Merci de remplir au moins un champ.",
                choices:[
                    {label: "OK", value:""}
                ]
            });
            //parametres = 'departement=69&raison_sociale=po&page='+this.numPageCourante;
            //parametres = 'raison_sociale=polica&page='+this.numPageCourante;
        }
        
    }    
}

/**
 * Appelée par Prototype quand la requête réussit
 * @param {Object} transport
 */
FormulaireAssistant.prototype.gotResults = function(transport) {
    // Lors de la première page, on calcule le nombre total de pages
    if (this.numPageCourante == 1) {
        this.listeSocietes = new Array();
        var listePages = transport.responseText.match(/(<td width="5%" align="center" [^>]*>&nbsp;[0-9]+&nbsp;<\/td>)/g);
        if (listePages != null) {
            this.nbPages = listePages.length / 2;
        }
    }
    //console.log("************* gotResults ----- pageCourante : "+this.numPageCourante+" ----- nbPages : "+this.nbPages);
    if (this.nbPages > 5) {
        this.controller.get('spinnerFormulaire').mojo.stop();
        this.controller.showAlertDialog({
            onChoose: function(value) {},
            title: "CompanyScore",
            message: "Trop de résultats. Veuillez affiner votre recherche.",
            choices:[
                {label: "OK", value:""}
            ]
        });
        this.numPageCourante = 1; // Réinitialisation de la page courante pour les futures recherches
        this.nbPages = 1;
    } else {
        // On ajoute les societes trouvées sur cette page à la liste des sociétés
        this.listeSocietes = this.listeSocietes.concat(transport.responseText.match(/<form name="[^"]*" action="[^.]*.ent" method="post">(.*?)<\/form>/g));
        
        // Si on n'a pas encore atteint le nombre total de pages...
        if (this.numPageCourante < this.nbPages) { // ...on recupere les pages suivantes
            this.numPageCourante++;
            this.sendGetData();
        } else { // ...sinon on a obtenu les resultats, on les envoie à la scene suivante
            this.controller.get('spinnerFormulaire').mojo.stop();
            Mojo.Controller.stageController.pushScene("ListeResultats", this.listeSocietes);
            this.numPageCourante = 1; // Réinitialisation de la page courante pour les futures recherches
            this.nbPages = 1; // Réinitialisation du nombre de pages pour les futures recherches
        }
    }
    
    
    
    
    
}

/**
 * Appelée par Prototype quand la requête échoue
 * @param {Object} transport
 */
FormulaireAssistant.prototype.failure = function(transport) {

    //console.log("***** ERREUR : CAS A TRAITER - Requete echouee");
}


/**
 * Appelée lorsque l'on clique sur le bouton de recherche
 * @param {Object} event
 */
FormulaireAssistant.prototype.handleFindButtonPressed = function(event){
    
    this.controller.get('spinnerFormulaire').mojo.start();
    this.sendGetData();
    
}

FormulaireAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
}

FormulaireAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
}

FormulaireAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
    Mojo.Event.stopListening(this.controller.get('findButton'), Mojo.Event.tap, this.handleFindButtonPressed);
}

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

function ComptesSociauxAssistant(titre, tableauComptesSociaux) {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
       this.titre = titre;
       this.tableauComptesSociaux = tableauComptesSociaux;
}

ComptesSociauxAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
        
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    
    /* add event handlers to listen to events from widgets */
    
    // Mise en place du menu
    this.controller.setupWidget(Mojo.Menu.appMenu, newsMenuAttr, newsMenuModel); // Affichage du menu "formulaire" pour cette scene
    
    $('main-hdr').update(this.titre);
    $('comptes-sociaux').update(this.tableauComptesSociaux);
    
    this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel);
};

ComptesSociauxAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
};

ComptesSociauxAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
};

ComptesSociauxAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};

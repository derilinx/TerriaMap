'use strict';

var terriaOptions = {
    baseUrl: 'build/TerriaJS'
};

import { runInAction } from "mobx";

// checkBrowserCompatibility('ui');
import ConsoleAnalytics from 'terriajs/lib/Core/ConsoleAnalytics';
import GoogleAnalytics from 'terriajs/lib/Core/GoogleAnalytics';
import ShareDataService from 'terriajs/lib/Models/ShareDataService';
// import registerAnalytics from 'terriajs/lib/Models/registerAnalytics';
// import registerCatalogMembers from 'terriajs/lib/Models/registerCatalogMembers';
import registerCustomComponentTypes from 'terriajs/lib/ReactViews/Custom/registerCustomComponentTypes';
import Terria from 'terriajs/lib/Models/Terria';
import updateApplicationOnHashChange from 'terriajs/lib/ViewModels/updateApplicationOnHashChange';
import updateApplicationOnMessageFromParentWindow from 'terriajs/lib/ViewModels/updateApplicationOnMessageFromParentWindow';
import ViewState from 'terriajs/lib/ReactViewModels/ViewState';
import BingMapsSearchProviderViewModel from 'terriajs/lib/ViewModels/BingMapsSearchProviderViewModel.js';
import defined from 'terriajs-cesium/Source/Core/defined';
import render from './lib/Views/render';
import registerCatalogMembers from 'terriajs/lib/Models/Catalog/registerCatalogMembers';
import defined from 'terriajs-cesium/Source/Core/defined';
import loadPlugins from "./lib/Core/loadPlugins";
import plugins from "./plugins";

// Register all types of catalog members in the core TerriaJS.  If you only want to register a subset of them
// (i.e. to reduce the size of your application if you don't actually use them all), feel free to copy a subset of
// the code in the registerCatalogMembers function here instead.
// registerCatalogMembers();
// registerAnalytics();

// we check exact match for development to reduce chances that production flag isn't set on builds(?)
if (process.env.NODE_ENV === "development") {
    terriaOptions.analytics = new ConsoleAnalytics();
} else {
    terriaOptions.analytics = new GoogleAnalytics();
}

// Construct the TerriaJS application, arrange to show errors to the user, and start it up.
var terria = new Terria(terriaOptions);

// Register custom components in the core TerriaJS.  If you only want to register a subset of them, or to add your own,
// insert your custom version of the code in the registerCustomComponentTypes function here instead.
registerCustomComponentTypes(terria);

// Create the ViewState before terria.start so that errors have somewhere to go.
const viewState = new ViewState({
    terria: terria
});

registerCatalogMembers();


if (process.env.NODE_ENV === "development") {
    window.viewState = viewState;
}

// If we're running in dev mode, disable the built style sheet as we'll be using the webpack style loader.
// Note that if the first stylesheet stops being nationalmap.css then this will have to change.
if (process.env.NODE_ENV !== "production" && module.hot) {
    document.styleSheets[0].disabled = true;
}

module.exports = terria.start({
    configUrl: 'config.json',
    shareDataService: new ShareDataService({
        terria: terria
    })
}).catch(function(e) {
  terria.raiseErrorToUser(e);
}).finally(function() {
  // Load plugins before reading the application URL and loading init sources
  // as plugins can register new catalog member types.
  loadPlugins(viewState, plugins)
    .catch(error => {
      console.error(`Error loading plugins`);
      console.error(error);
    })
    .finally(() => {
      terria.updateApplicationUrl(window.location.href);
      terria
        .loadInitSources()
        .then(result => result.raiseError(terria));
    });

    try {
        viewState.searchState.locationSearchProviders = [
            new BingMapsSearchProviderViewModel({
                terria: terria,
                key: terria.configParameters.bingMapsKey
            })
        ];

        // Automatically update Terria (load new catalogs, etc.) when the hash part of the URL changes.
        updateApplicationOnHashChange(terria, window);
        updateApplicationOnMessageFromParentWindow(terria, window);

        // Create the various base map options.
        var createGlobalBaseMapOptions = require('terriajs/lib/ViewModels/createGlobalBaseMapOptions');
        var selectBaseMap = require('terriajs/lib/ViewModels/selectBaseMap');

        var OpenStreetMapCatalogItem = require('terriajs/lib/Models/OpenStreetMapCatalogItem');
        var BaseMapViewModel = require('terriajs/lib/ViewModels/BaseMapViewModel');

        var osm = new OpenStreetMapCatalogItem(terria);
        osm.name = "OpenStreetMap";
        osm.url = "https://tile.openstreetmap.org/";
        // https://a.tile.openstreetmap.org/9/391/223.png
        osm.attribution = '© OpenStreetMap contributors';
        osm.opacity = 1.0;
        osm.subdomains=['a','b','c'];

        var globalBaseMaps = createGlobalBaseMapOptions(terria, terria.configParameters.bingMapsKey);

        globalBaseMaps.push(new BaseMapViewModel({
            image:require('terriajs/wwwroot/images/osm.png'),
            catalogItem: osm,
          contrastColor: "#000000"
        })
                           );

        selectBaseMap(terria, globalBaseMaps, 'Positron', true);

        // Add font-imports
        const fontImports = terria.configParameters.theme?.fontImports;
        if (fontImports) {
          const styleSheet = document.createElement("style");
          styleSheet.type = "text/css";
          styleSheet.innerText = fontImports;
          document.head.appendChild(styleSheet);
        }

        render(terria, globalBaseMaps, viewState);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
});

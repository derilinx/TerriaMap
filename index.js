'use strict';

/*global require,window */

var terriaOptions = {
    baseUrl: 'build/TerriaJS'
};

// checkBrowserCompatibility('ui');
import GoogleAnalytics from 'terriajs/lib/Core/GoogleAnalytics';
import ShareDataService from 'terriajs/lib/Models/ShareDataService';
import raiseErrorToUser from 'terriajs/lib/Models/raiseErrorToUser';
import registerAnalytics from 'terriajs/lib/Models/registerAnalytics';
import registerCatalogMembers from 'terriajs/lib/Models/registerCatalogMembers';
import registerCustomComponentTypes from 'terriajs/lib/ReactViews/Custom/registerCustomComponentTypes';
import Terria from 'terriajs/lib/Models/Terria';
import updateApplicationOnHashChange from 'terriajs/lib/ViewModels/updateApplicationOnHashChange';
import updateApplicationOnMessageFromParentWindow from 'terriajs/lib/ViewModels/updateApplicationOnMessageFromParentWindow';
import ViewState from 'terriajs/lib/ReactViewModels/ViewState';
import BingMapsSearchProviderViewModel from 'terriajs/lib/ViewModels/BingMapsSearchProviderViewModel.js';
import defined from 'terriajs-cesium/Source/Core/defined';
import render from './lib/Views/render';

// Register all types of catalog members in the core TerriaJS.  If you only want to register a subset of them
// (i.e. to reduce the size of your application if you don't actually use them all), feel free to copy a subset of
// the code in the registerCatalogMembers function here instead.
registerCatalogMembers();
registerAnalytics();

terriaOptions.analytics = new GoogleAnalytics();

// Construct the TerriaJS application, arrange to show errors to the user, and start it up.
var terria = new Terria(terriaOptions);

// Register custom components in the core TerriaJS.  If you only want to register a subset of them, or to add your own,
// insert your custom version of the code in the registerCustomComponentTypes function here instead.
registerCustomComponentTypes(terria);

// Create the ViewState before terria.start so that errors have somewhere to go.
const viewState = new ViewState({
    terria: terria
});

if (process.env.NODE_ENV === "development") {
    window.viewState = viewState;
}

// If we're running in dev mode, disable the built style sheet as we'll be using the webpack style loader.
// Note that if the first stylesheet stops being nationalmap.css then this will have to change.
if (process.env.NODE_ENV !== "production" && module.hot) {
    document.styleSheets[0].disabled = true;
}

module.exports = terria.start({
    // If you don't want the user to be able to control catalog loading via the URL, remove the applicationUrl property below
    // as well as the call to "updateApplicationOnHashChange" further down.
    applicationUrl: window.location,
    configUrl: 'config.json',
    shareDataService: new ShareDataService({
        terria: terria
    })
}).otherwise(function(e) {
    raiseErrorToUser(terria, e);
}).always(function() {
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

        // Do not use default basemaps from TerriaJS
        var globalBaseMaps = [];
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


        globalBaseMaps.push(new BaseMapViewModel({
            image:require('terriajs/wwwroot/images/osm.png'),
            catalogItem: osm,
          contrastColor: "#000000"
        })
                           );

        // add stadia maps
        var stadiaAttribution = "© <a href='https://stadiamaps.com/' target='_blank'>Stadia Maps</a> © <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> © <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a>";

        var stadiaBaseMaps = [
            {
                name: "Stadia Smooth (Light)",
                url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/",
                image: require('./wwwroot/images/basemaps/stadia-smooth.png'),
                contrastColor: "#000000"
            },
            {
                name: "Stadia Smooth (Dark)",
                url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/",
                image: require('./wwwroot/images/basemaps/stadia-dark.png'),
                contrastColor: "#ffffff"
            },
            {
                name: "Stadia OSM Bright",
                url: "https://tiles.stadiamaps.com/tiles/osm_bright/",
                image: require('./wwwroot/images/basemaps/stadia-osm-bright.png'),
                contrastColor: "#000000"
            },
            {
                name: "Stadia Terrain",
                url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/",
                image: require('./wwwroot/images/basemaps/stadia-terrain.png'),
                contrastColor: "#000000"
            },
            {
                name: "Stadia Toner",
                url: "https://tiles.stadiamaps.com/tiles/stamen_toner/",
                image: require('./wwwroot/images/basemaps/stadia-toner.png'),
                contrastColor: "#ffffff"
            }
        ];

        stadiaBaseMaps.forEach(function(def) {
            var item = new OpenStreetMapCatalogItem(terria);
            item.name = def.name;
            item.url = def.url;
            item.attribution = stadiaAttribution;
            item.opacity = 1.0;

            globalBaseMaps.push(new BaseMapViewModel({
                image: def.image,
                catalogItem: item,
                contrastColor: def.contrastColor
            }));
        });

        // Default basemap is set to stadia maps alidade smooth
        selectBaseMap(terria, globalBaseMaps, 'Stadia Smooth (Light)', true);

        // Update the ViewState based on Terria config parameters.
        // Note: won't do anything unless terriajs version is >7.9.0
        if (defined(viewState.afterTerriaStarted)) {
            viewState.afterTerriaStarted();
        }

        render(terria, globalBaseMaps, viewState);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
});

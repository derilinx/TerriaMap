import ReactDOM from 'react-dom';
import RedBox from 'redbox-react';
import React from 'react';

import { LocalizeProvider } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";
import globalTranslations from "./../translations/global.json";
import languages from "./../translations/languages.json";


export default function renderUi(terria, allBaseMaps, viewState) {
       
  let langChecker = (val) => {
     return languages.some(e => e.code == val) && val 
  }
  
  let render = () => {
    const UI = require('./UserInterface').default;

      let params = new URLSearchParams(document.location.search.substring(1));
      
      const options = {
      	  renderToStaticMarkup,
	  defaultLanguage: langChecker(params.get("lang")) || "en_US"
      };

      languages.forEach(function(e) {
	  if (e.img) {
	      e.src = require('../../wwwroot/images/i18n/'+e.img)
	  }
      })
      
      ReactDOM.render(
	    <LocalizeProvider>
	    <UI terria={terria} allBaseMaps={allBaseMaps} viewState={viewState}
	translation={globalTranslations} languages={languages} options={options}/>
	    </LocalizeProvider>
	    , document.getElementById('ui'));
  };

  if (module.hot && process.env.NODE_ENV !== "production") {
    // Support hot reloading of components
    // and display an overlay for runtime errors
    const renderApp = render;
    const renderError = (error) => {
      console.error(error);
      console.error(error.stack);
      ReactDOM.render(
        <RedBox error={error}/>,
        document.getElementById('ui')
      );
    };
    render = () => {
      try {
        renderApp();
      } catch (error) {
        renderError(error);
      }
    };
    module.hot.accept('./UserInterface', () => {
      setTimeout(render);
    });
  }

  render();
}

import { Menu, Nav, ExperimentalMenu } from 'terriajs/lib/ReactViews/StandardUserInterface/customizable/Groups';
import MeasureTool from 'terriajs/lib/ReactViews/Map/Navigation/MeasureTool';
import MenuItem from 'terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import RelatedMaps from './RelatedMaps';
import SplitPoint from 'terriajs/lib/ReactViews/SplitPoint';
import StandardUserInterface from 'terriajs/lib/ReactViews/StandardUserInterface/StandardUserInterface.jsx';

import { withLocalize } from "react-localize-redux";
import version from '../../version';

import './global.scss';

function loadAugmentedVirtuality(callback) {
    require.ensure('terriajs/lib/ReactViews/Map/Navigation/AugmentedVirtualityTool', () => {
        const AugmentedVirtualityTool = require('terriajs/lib/ReactViews/Map/Navigation/AugmentedVirtualityTool');
        callback(AugmentedVirtualityTool);
    }, 'AugmentedVirtuality');
}

function isBrowserSupportedAV() {
    return /Android|iPhone|iPad/i.test(navigator.userAgent);
}

// possibly pull the menu out here.
function UserInterface(props) {
    return (
        <StandardUserInterface {... props} version={version}>
            <Menu>

            </Menu>
            <Nav>
                <MeasureTool terria={props.viewState.terria} key="measure-tool"/>
            </Nav>
            <ExperimentalMenu>
                <If condition={isBrowserSupportedAV()}>
                    <SplitPoint loadComponent={loadAugmentedVirtuality} viewState={props.viewState} terria={props.viewState.terria} experimentalWarning={true}/>
                </If>
            </ExperimentalMenu>
        </StandardUserInterface>
    );
}

export default withLocalize(UserInterface)

UserInterface.propTypes = {
    terria: PropTypes.object,
    viewState: PropTypes.object
};

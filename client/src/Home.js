'use strict';

import React, {Component} from 'react';
import {withTranslation} from './lib/i18n';
import {requiresAuthenticatedUser} from './lib/page';
import {withComponentMixins} from "./lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        return (
            <div>
<<<<<<< HEAD
                {/* START - Modified by Tim */}
                <h2>Integra Newsletter & Email Marketing Platform</h2>
                <div>This page is under development.</div>
                {/* END - Modified by Tim */}
=======
                <h2>{t('Mailtrain 2 beta')}</h2>
                <div>{t('Build') + ' 2019-09-05-1547'}</div>
>>>>>>> cdd57224f6a5f846a8c4e269ab1f07eaccdc8493
            </div>
        );
    }
}

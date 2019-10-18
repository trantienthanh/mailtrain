'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {Trans} from 'react-i18next';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import axios from "../lib/axios";
import {getUrl} from "../lib/urls";
import {AlignedRow} from "../lib/form";
import {Icon} from "../lib/bootstrap-components";

import styles from "./styles.scss";
import {Link} from "react-router-dom";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Statistics extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
            entity: props.entity,
        };

        this.refreshTimeoutHandler = ::this.periodicRefreshTask;
        this.refreshTimeoutId = 0;
    }

    static propTypes = {
        entity: PropTypes.object
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        let resp;

        resp = await axios.get(getUrl(`rest/campaigns-stats/${this.props.entity.id}`));
        const entity = resp.data;

        this.setState({
            entity
        });
    }

    async periodicRefreshTask() {
        // The periodic task runs all the time, so that we don't have to worry about starting/stopping it as a reaction to the buttons.
        await this.refreshEntity();
        if (this.refreshTimeoutHandler) { // For some reason the task gets rescheduled if server is restarted while the page is shown. That why we have this check here.
            this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 60000);
        }
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.periodicRefreshTask();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutHandler = null;
    }


    render() {
        const t = this.props.t;
        const entity = this.state.entity;
        const total = entity.total;

        const renderMetrics = (key, label, showZoomIn = true) => {
            const val = entity[key]

            return (
                <AlignedRow label={label}><span className={styles.statsMetrics}>{val}</span>{showZoomIn && <span className={styles.zoomIn}><Link to={`/campaigns/${entity.id}/statistics/${key}`}><Icon icon="search-plus"/></Link></span>}</AlignedRow>
            );
        }

        {/* START - Modified by Tim */}
        const renderDeliveredMetrics = () => {
            const val = total - entity['bounced']

            return (
                <AlignedRow label='Delivered'><span className={styles.statsMetrics}>{val}</span><span className={styles.zoomIn}><Link to={`/campaigns/${entity.id}/statistics/delivered`}><Icon icon="search-plus"/></Link></span></AlignedRow>
          );
        }
        {/* END - Modified by Tim */}

        const renderMetricsWithProgress = (key, label, progressBarClass, showZoomIn = true) => {
            if (!total) {
                return renderMetrics(key, label);
            }

            {/* START - Modified by Tim */}
            const total_delivered = total - entity['bounced'];
            let val = entity[key];
            let rate = Math.round(val / total_delivered * 100);

            if (key == 'delivered') {
                val = total - entity['bounced']
            }

            if (key == 'bounced' || key == 'delivered') {
                rate = Math.round(val / total * 100);
            }
            {/* END - Modified by Tim */}

            return (
                <AlignedRow label={label}>
                    {showZoomIn && <span className={styles.statsProgressBarZoomIn}><Link to={`/campaigns/${entity.id}/statistics/${key}`}><Icon icon="search-plus"/></Link></span>}
                    <div className={`progress ${styles.statsProgressBar}`}>
                        <div
                            className={`progress-bar progress-bar-${progressBarClass}`}
                            role="progressbar"
                            style={{minWidth: '6em', width: rate + '%'}}>
                            {val}&nbsp;({rate}%)
                        </div>
                    </div>
                </AlignedRow>
            );
        }

        return (
            <div>
                <Title>{t('campaignStatistics')}</Title>

                {renderMetrics('total', t('total'), false)}
                {renderMetricsWithProgress('delivered', t('delivered'))}
                {/* renderDeliveredMetrics() */}
                {/* START - Modified by Tim renderMetrics('blacklisted', t('blacklisted'), false) */}
                {renderMetricsWithProgress('bounced', 'Total '+t('bounced'), 'info')}
                {renderMetricsWithProgress('complained', t('complaints')+' for Delivered', 'danger')}
                {renderMetricsWithProgress('unsubscribed', t('unsubscribed')+' for Delivered', 'warning')}
                {!entity.open_tracking_disabled && renderMetricsWithProgress('opened', t('opened')+' for Delivered', 'success')}
                {!entity.click_tracking_disabled && renderMetricsWithProgress('clicks', t('clicked')+' for Delivered', 'success')}
                {/* END - Modified by Tim */}
                <hr/>

                <h3>{t('quickReports')}</h3>
                <small className="text-muted"><Trans i18nKey="belowYouCanDownloadPremadeReportsRelated">Below, you can download pre-made reports related to this campaign. Each link generates a CSV file that can be viewed in a spreadsheet editor. Custom reports and reports that cover more than one campaign can be created through <Link to="/reports">Reports</Link> functionality of Mailtrain.</Trans></small>
                <ul className="list-unstyled my-3">
                    <li><a href={getUrl(`quick-rpts/open-and-click-counts/${entity.id}`)}>Open and click counts per currently subscribed subscriber</a></li>
                </ul>
           </div>
        );
    }
}

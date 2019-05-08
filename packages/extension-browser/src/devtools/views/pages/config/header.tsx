import * as React from 'react';

import { getMessage } from '../../../utils/i18n';

import Button from '../../controls/button';

import * as styles from './header.css';

const ConfigHeader = () => {
    return (
        <header className={styles.root}>
            <div className={styles.help}>
                {getMessage('checkForBestPracticesDescription')}
            </div>
            <Button type="submit" primary={true}>
                {getMessage('startScanButtonLabel')}
            </Button>
        </header>
    );
};

export default ConfigHeader;

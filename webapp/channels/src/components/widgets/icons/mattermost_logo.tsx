// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import hsweLogoIcon from '../../../../assets/HSWE_logo_icon.png';

export default function MattermostLogo(props: React.HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={hsweLogoIcon}
            width={32}
            height={32}
            alt='HSWE'
        />
    );
}

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import hsweLogo from '../../../../assets/hswe_logo.png';

const LeftControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;
    flex-basis: 30%;
`;

const LogoImage = styled.img`
    height: 34px;
    margin-left: 16px;
`;

const LeftControls = (): JSX.Element => (
    <LeftControlsContainer>
        <LogoImage
            src={hsweLogo}
            alt='HSWE'
        />
    </LeftControlsContainer>
);

export default LeftControls;

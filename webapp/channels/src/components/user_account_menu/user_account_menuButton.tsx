// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MouseEvent, KeyboardEvent} from 'react';

import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import Avatar from 'components/widgets/users/avatar/avatar';

interface Props {
    profilePicture?: string;
    openCustomStatusModal: ((event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void);
}

export default function UserAccountMenuButton({
    profilePicture,
    openCustomStatusModal,
}: Props) {
    return (
        <>
            <CustomStatusEmoji
                showTooltip={true}
                emojiStyle={{marginRight: '6px'}}
                aria-hidden={true}
                onClick={openCustomStatusModal}
            />
            <Avatar
                size='sm'
                url={profilePicture}
                aria-hidden={true}
            />
        </>
    );
}

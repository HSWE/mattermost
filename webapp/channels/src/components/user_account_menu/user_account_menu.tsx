// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import type {MouseEvent, KeyboardEvent} from 'react';
import {useIntl} from 'react-intl';

import CustomStatusModal from 'components/custom_status/custom_status_modal';
import * as Menu from 'components/menu';

import {ModalIdentifiers} from 'utils/constants';

import UserAccountMenuButton from './user_account_menuButton';
import UserAccountProfileMenuItem from './user_account_profile_menuitem';

import type {PropsFromRedux} from './index';

import './user_account_menu.scss';

type Props = PropsFromRedux;

export const ELEMENT_ID_FOR_USER_ACCOUNT_MENU_BUTTON = 'userAccountMenuButton';
export const ELEMENT_ID_FOR_USER_ACCOUNT_MENU = 'userAccountMenu';

export default function UserAccountMenu(props: Props) {
    const {formatMessage} = useIntl();

    function openCustomStatusModal(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
        event.stopPropagation();
        props.actions.openModal({
            modalId: ModalIdentifiers.CUSTOM_STATUS,
            dialogType: CustomStatusModal,
        });
    }

    const isCustomStatusSet = !props.isCustomStatusExpired && props.customStatus && (props.customStatus.text?.length > 0 || props.customStatus.emoji?.length > 0);

    return (
        <Menu.Container
            menuButton={{
                id: ELEMENT_ID_FOR_USER_ACCOUNT_MENU_BUTTON,
                class: classNames('userAccountMenu_menuButton', {
                    withCustomStatus: isCustomStatusSet,
                }),
                'aria-label': formatMessage({id: 'userAccountMenu.menuButton.ariaLabel', defaultMessage: 'User\'s account menu'}),
                children: (
                    <UserAccountMenuButton
                        profilePicture={props.profilePicture}
                        openCustomStatusModal={openCustomStatusModal}
                    />
                ),
            }}
            menu={{
                id: ELEMENT_ID_FOR_USER_ACCOUNT_MENU,
                width: '264px',
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <UserAccountProfileMenuItem
                userId={props.userId}
            />
        </Menu.Container>
    );
}

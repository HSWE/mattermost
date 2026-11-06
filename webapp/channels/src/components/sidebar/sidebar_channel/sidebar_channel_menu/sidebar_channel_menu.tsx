// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, memo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {
    LinkVariantIcon,
    AccountPlusOutlineIcon,
    DotsVerticalIcon,
    ExitToAppIcon,
} from '@mattermost/compass-icons/components';

import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMoveToSubmenu from 'components/channel_move_to_sub_menu';
import * as Menu from 'components/menu';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

import type {PropsFromRedux, OwnProps} from './index';

type Props = PropsFromRedux & OwnProps;

const SidebarChannelMenu = ({
    channel,
    channelLink,
    managePrivateChannelMembers,
    managePublicChannelMembers,
    onMenuToggle,
    openModal,
    channelLeaveHandler,
}: Props) => {
    const isLeaving = useRef(false);

    const {formatMessage} = useIntl();

    let copyLinkMenuItem: JSX.Element | null = null;
    if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
        function handleCopyLink() {
            copyToClipboard(channelLink);
        }

        copyLinkMenuItem = (
            <Menu.Item
                id={`copyLink-${channel.id}`}
                onClick={handleCopyLink}
                leadingElement={<LinkVariantIcon size={18}/>}
                labels={(
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.copyLink'
                        defaultMessage='Copy Link'
                    />
                )}
            />
        );
    }

    let addMembersMenuItem: JSX.Element | null = null;
    if ((channel.type === Constants.PRIVATE_CHANNEL && managePrivateChannelMembers) || (channel.type === Constants.OPEN_CHANNEL && managePublicChannelMembers)) {
        function handleAddMembers() {
            openModal({
                modalId: ModalIdentifiers.CHANNEL_INVITE,
                dialogType: ChannelInviteModal,
                dialogProps: {channel},
            });
        }

        addMembersMenuItem = (
            <Menu.Item
                id={`addMembers-${channel.id}`}
                onClick={handleAddMembers}
                aria-haspopup='true'
                leadingElement={<AccountPlusOutlineIcon size={18}/>}
                labels={(
                    <FormattedMessage
                        id='sidebar_left.sidebar_channel_menu.addMembers'
                        defaultMessage='Add Members'
                    />
                )}
            />
        );
    }

    let leaveChannelMenuItem: JSX.Element | null = null;
    if (channel.name !== Constants.DEFAULT_CHANNEL) {
        let leaveChannelText = (
            <FormattedMessage
                id='sidebar_left.sidebar_channel_menu.leaveChannel'
                defaultMessage='Leave Channel'
            />
        );
        if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = (
                <FormattedMessage
                    id='sidebar_left.sidebar_channel_menu.leaveConversation'
                    defaultMessage='Close Conversation'
                />
            );
        }

        function handleLeaveChannel() {
            if (isLeaving.current || !channelLeaveHandler) {
                return;
            }

            isLeaving.current = true;

            channelLeaveHandler(() => {
                isLeaving.current = false;
            });
        }

        leaveChannelMenuItem = (
            <Menu.Item
                id={`leave-${channel.id}`}
                onClick={handleLeaveChannel}
                leadingElement={<ExitToAppIcon size={18}/>}
                labels={leaveChannelText}
                isDestructive={true}
            />
        );
    }

    return (
        <Menu.Container
            menuButton={{
                id: `SidebarChannelMenu-Button-${channel.id}`,
                class: 'SidebarMenu_menuButton',
                'aria-label': formatMessage({
                    id: 'sidebar_left.sidebar_channel_menu.editChannel.ariaLabel',
                    defaultMessage: 'Channel options for {channelName}',
                }, {channelName: channel.name}),
                children: <DotsVerticalIcon size={16}/>,
            }}
            menuButtonTooltip={{
                class: 'hidden-xs',
                text: formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'}),
            }}
            menu={{
                id: `SidebarChannelMenu-MenuList-${channel.id}`,
                'aria-label': formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Edit channel menu'}),
                onToggle: onMenuToggle,
            }}
        >
            <ChannelMoveToSubmenu channel={channel}/>
            {(copyLinkMenuItem || addMembersMenuItem) && <Menu.Separator/>}
            {copyLinkMenuItem}
            {addMembersMenuItem}
            {leaveChannelMenuItem && <Menu.Separator/>}
            {leaveChannelMenuItem}
        </Menu.Container>
    );
};

export default memo(SidebarChannelMenu);

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import UserCard from 'src/components/UserCard';

/**
 * 用户姓名，正常用户可以点到其详情页。带 hover 的层
 */
class UserName extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      userName: PropTypes.string,
      accountId: PropTypes.string,
    }),
    className: PropTypes.string,
    chatButton: PropTypes.bool,
  };

  static defaultProps = {
    chatButton: true,
  };

  render() {
    const { user, className, chatButton } = this.props;

    const disabled =
      this.props.disabled ||
      !user.accountId ||
      [
        'user-self',
        'user-sub',
        'user-undefined',
        'user-workflow',
        'user-publicform',
        'user-api',
        'user-integration',
        '2',
        '4',
      ].includes(user.accountId);

    return (
      <UserCard sourceId={user.accountId} disabled={disabled} chatButton={chatButton}>
        <a
          className={cx({ Gray_6: !user.accountId }, className)}
          href={disabled ? 'javascript:void(0);' : '/user_' + user.accountId}
          target="_blank"
          onClick={e => disabled && e.preventDefault()}
        >
          {user.userName}
        </a>
      </UserCard>
    );
  }
}

export default UserName;

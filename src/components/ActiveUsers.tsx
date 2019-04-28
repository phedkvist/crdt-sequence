import * as React from 'react';
import Cursor from 'src/service/Cursor';
import './ActiveUsers.css';

interface IState {

}

interface IProps {
  users: Array<Cursor>;
}

class ActiveUsers extends React.Component<IProps, IState> {

  public render() {
    let userAvatars = this.props.users.map(user => {
      return (
        <div className={'circle ' + user.color}>
          {user.name[0]}
          <div className={'tooltip ' + user.color}>{user.name}</div>
        </div>
      );
    })

    return (
      userAvatars
    );
  }
}

export default ActiveUsers;
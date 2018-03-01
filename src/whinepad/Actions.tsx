import * as React from 'react';
import './Actions.css';
class ActionsProps {
    onAction: () => {};
}
function Actions(props: ActionsProps) {
    return (
        <div className="Actions">
            <span
                tabIndex={0}
                className="ActionsInfo"
                title="詳しい情報"
                onClick={props.onAction.bind(undefined, 'info')}
            >
            &#8505;
            </span>
            <span
                tabIndex={0}
                className="ActionsEdit"
                title="編集"
                onClick={props.onAction.bind(undefined, 'edit')}
            >
            &#10000;
            </span>
            <span 
                tabIndex={0}
                className="ActionsDelete"
                title="削除"
                onClick={props.onAction.bind(undefined, 'delete')}
            >
            x
            </span>
        </div>
    );
}
export default Actions;
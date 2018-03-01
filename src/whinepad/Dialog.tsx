import Button from './Button';
import * as classNames from 'classnames'; 
import * as React from 'react';
import './Dialog.css';

interface DialogProps {
    header: string;
    confirmLabel?: string;
    modal?: boolean;
    hasCancel?: boolean;
    onAction?(s: string): void;
}

class Dialog extends React.Component<DialogProps, {}> {
    public static defaultProps = {
        confirmLabel: 'OK',
        modal: false,
        onAction: (s: string) => undefined,
        hasCancel: true
    };
    componentWillUnmount() {
        document.body.classList.remove('DialogModalOpen');
    }
    componentDidMount() {
        if (this.props.modal) {
            document.body.classList.add('DialogModalOen');
        }
    }
    render () {
        return (
            <div className={classNames({'Dialog': true, 'DialogModal': this.props.modal})}>
                <div className={this.props.modal ? 'DialogModalWrap' : undefined}>
                    <div className="DialogHeader">{this.props.header}</div>
                    <div className="DialogBody">{this.props.children}</div>
                    <div className="DialogFooter">{
                        this.props.hasCancel 
                            ? <span
                                className="DialogDismiss"
                                onClick={
                                    (this.props as {onAction(s: string): void})
                                        .onAction.bind(this, 'dismiss')}
                            >キャンセル
                            </span>
                            : null
                    }
                        <Button
                            onClick={(this.props as {onAction(s: string): void}).onAction.bind(
                                this, 
                                this.props.hasCancel ? 'confirm' : 'dismiss'
                            )}
                        >
                            {this.props.confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
export default Dialog;
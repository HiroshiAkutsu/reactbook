import * as React from 'react';

interface DialogProps {
    message?: string;
    onAction?(str: string): void;
}
interface DefaultDialogProps extends DialogProps {
    onAction(str: string): void;
}

class Dialogtest extends React.Component<DefaultDialogProps, {}> {
    static defaultProps = {
        /**
         * @param str: numb
         * 
         */ 
          
        onAction: (str: string) => {window.console.log(str + 'default'); },
    };
    emit (mystr: DefaultDialogProps) {
        // const str = this.props.message!.length;

    }
    render() {
        
        return (
            <div className="DialogFooter">{
                <span
                    className="DialogDismiss"
                    onClick={this.props.onAction.bind(this, 'hello')}
                >{this.props.message}
                </span>
            }
            </div>
        );
    }
}
export default Dialogtest as React.ComponentClass<DialogProps>;
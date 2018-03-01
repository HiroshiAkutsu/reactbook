import Button from './Button';
import Dialog from './Dialog';
import Excel from './Excel';
import Form from './Form';
import * as React from 'react';
import './Whinepad.css';
import CRUDStore from '../flux/CRUDStore';
import CRUDActions from '../flux/CRUDActions';

interface WhinepadProps {
}
interface WhinepadStates {
    addnew: boolean;
    count: number;
}
class Whinepad extends React.Component<WhinepadProps, WhinepadStates> {
    private Formref: Form | null;
    constructor(props: WhinepadProps) {
        super(props);
        this.state = {
            addnew: false,
            count: CRUDStore.getCount()
        };
        CRUDStore.addListener('change', () => {
            this.setState({
                count: CRUDStore.getCount()
            });
        });
        // this._preSearchData ;

        this._addNewDialog = this._addNewDialog.bind(this);
        this._addNew = this._addNew.bind(this);
    }
    shouldComponentUpdate(newProps: WhinepadProps, newState: WhinepadStates): boolean {
        return (
            newState.addnew !== this.state.addnew || newState.count !== this.state.count
        );
    }
    _addNewDialog() {
        this.setState({addnew: true});
    }
    _addNew(action: string) {
        this.setState({addnew: false});
        if (action === 'confirm') {
            if (this.Formref instanceof Form) {
                CRUDActions.create(this.Formref.getData());
            }
        }
    }
    render() {
        return (
            <div className="Whinepad">
                <div className="WhinepadToolbar">
                    <div className="WhinepadToolbarAdd">
                        <Button
                            onClick={this._addNewDialog}
                            className="WhinepadToolbarAddButton"
                        >
                            追加
                        </Button>
                    </div>
                    <div className="WhinepadToolbarSearch">
                        <input 
                            placeholder={`${this.state.count}件から検索...`}
                            onChange={CRUDActions.search.bind(CRUDActions)}
                            onFocus={CRUDActions.startSearching.bind(CRUDActions)}
                        />                        
                    </div>
                </div>
                <div className="WhinepadDatagrid">
                    
                    <Excel/>
                </div>
                {this.state.addnew
                    ? <Dialog
                        modal={true}
                        header="項目の追加"
                        confirmLabel="追加"
                        onAction={this._addNew} 
                    >
                        <Form 
                            ref={el => {this.Formref = el; }}
                        />
                    </Dialog>
                    : undefined
                }
            </div>
        );
    }
}
export default Whinepad;
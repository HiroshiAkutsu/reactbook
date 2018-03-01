import Button from './Button';
import Dialog from './Dialog';
import Excel from './Excel';
import Form from './Form';
import * as React from 'react';
import './Whinepad.css';

interface WhinepadProps {
    schema: {
        id: string,
        label: string,
        show?: boolean,
        sample: string | number,
        align?: string,
        type?: string, 
        options?: string[],
    }[];
    initialData: {[key: string]: number | string}[];
}
interface WhinepadStates {
    data: {}[];
    addnew: boolean;
}
class Whinepad extends React.Component<WhinepadProps, WhinepadStates> {
    private Formref: Form | null;
    private _preSearchData: {}[];
    constructor(props: WhinepadProps) {
        super(props);
        this.state = {
            data: props.initialData,
            addnew: false
        };
        // this._preSearchData ;

        this._addNewDialog = this._addNewDialog.bind(this);
        this._search = this._search.bind(this);
        this._startSearching = this._startSearching.bind(this);
        this._doneSearching = this._doneSearching.bind(this);
        this._onExcelDataChange = this._onExcelDataChange.bind(this);
        this._addNew = this._addNew.bind(this);
    }
    _addNewDialog() {
        this.setState({addnew: true});
    }
    _addNew(action: string) {
        if (action === 'dismiss') {
            this.setState({addnew: false});
            return;
        }
        if (!this.Formref) {
            throw Error('stateのdataかthis.Formrefがnullです。');
        }
        global.console.log(typeof this.Formref);
        let data = Array.from(this.state.data);
        data.unshift(this.Formref.getData());
        this.setState({
            addnew: false,
            data: data
        });
        this._commitToStorage(data);
    }
    _onExcelDataChange(data: {}[]) {
        this.setState({data: data});
        this._commitToStorage(data);
    }
    _commitToStorage(data: {}[]) {
        localStorage.setItem('data', JSON.stringify(data));
    }
    _startSearching(e: React.FocusEvent<HTMLInputElement>) {
        this._preSearchData = this.state.data;
    }
    _doneSearching(e: React.FocusEvent<HTMLInputElement>) {
        this.setState({
            data: this._preSearchData
        });
    }
    _search(e: React.ChangeEvent<HTMLInputElement>) {
        const needle = e.currentTarget.value.toLowerCase();
        if (!needle) {
            this.setState({data: this._preSearchData});
            return;
        }
        if (!this._preSearchData) {
            throw Error('stateのpreSearchDataがnullです。');
        }
        const fields = this.props.schema.map(item => item.id);
        const searchdata = this._preSearchData.filter(row => {
            for (let f = 0; f < fields.length; f ++) {
                if (row[fields[f]].toString().toLowerCase().indexOf(needle) > -1) {
                    return true;
                }
            }
            return false;
        });
        this.setState({data: searchdata});
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
                            placeholder="検索 ..."
                            onChange={this._search}
                            onFocus={this._startSearching}
                            onBlur={this._doneSearching}
                        />                        
                    </div>
                </div>
                <div className="WhinepadDatagrid">
                    
                    <Excel 
                        schema={this.props.schema}
                        initialData={
                            this.state.data
                            ? this.state.data
                            : [{}]
                        }
                        onDataChange={this._onExcelDataChange} 
                    />
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
                            fields={this.props.schema}
                        />
                    </Dialog>
                    : null
                }
            </div>
        );
    }
}
export default Whinepad;
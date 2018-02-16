import * as React from 'react';
import './Excel.css';

interface ExcelProps {
    headers: string[];
    initialData: string[][];
}
interface ExcelState {
    data: string[][];
    sortby: number | null;
    descending: boolean;
    edit: null | {
        row: number,
        cell: number
    };
    search: boolean;
    searchTexts: string[];
}

class Excel extends React.PureComponent<ExcelProps, ExcelState> {
    private _log: ExcelState[] = [];
    constructor(props: ExcelProps) {
        super(props);
        this.state = {
            data: props.initialData,
            sortby: null,
            descending: false,
            edit: null,
            search: false,
            searchTexts: []
        };
        this._sort = this._sort.bind(this);
        this._showEditor = this._showEditor.bind(this);
        this._save = this._save.bind(this);
        this._toggleSearch = this._toggleSearch.bind(this);
        this._search = this._search.bind(this);
    }
    componentDidMount() {
        window.document.onkeydown = (e) => {
            if (e.altKey && e.shiftKey && e.keyCode === 82) {
                global.console.log('replay');
                this._replay();
            }
        };
    } 
    _replay() {
        if (this._log.length === 0) {
            global.console.warn('ステートが記録されていません');
            return;
        }
        let idx = -1;
        const interval = setInterval(
            () => {
                idx ++;
                if (idx === this._log.length - 1) {
                    clearInterval(interval);
                }
                this.setState(this._log[idx]);
            }, 
            1000
        );
    }

    _logSetState(newState: {}) {
        this._log.push(JSON.parse(JSON.stringify(
            this._log.length === 0 ? this.state : newState
        )));        
        this.setState(newState);
    }

    _sort(e: React.MouseEvent<HTMLTableSectionElement>) {
        const column = (e.target as HTMLTableCellElement).cellIndex;
        const descending = this.state.sortby === column && !this.state.descending;
        let data = Array.from(this.state.data);
        data.sort((a, b) => {
            return descending ? (a[column] < b[column] ? 1 : -1) : (a[column] > b[column] ? 1 : -1);
        });
        this._logSetState({
            data: data,
            sortby: column,
            descending: descending
        });
    }
    _showEditor(e: React.MouseEvent<HTMLTableSectionElement>) {
        const td = e.target as HTMLTableCellElement;
        const num = td.dataset.row === undefined ? 0 : parseInt(td.dataset.row, 10);
        
        this._logSetState({
            edit: {
                row: num,
                cell: td.cellIndex
            }
        });
    }
    _save(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const input = e.currentTarget.firstChild as HTMLInputElement;
        let data = this.state.data.slice();
        if (this.state.edit) {
            data[this.state.edit.row][this.state.edit.cell] = input.value;
        }
        this._logSetState({
            edit: null,
            data: data
        });
    }
    _toggleSearch(e: React.FormEvent<HTMLButtonElement>) {
        if (this.state.search) {
            this._logSetState({
                search: false
            });
        } else {
            this._logSetState({
                search: true
            });
        }
    }
    _search(e: React.FormEvent<HTMLTableRowElement>) {
        const rows = e.currentTarget;
        let searchdata = this.props.initialData;
        let searchTexts = []; 
        for ( let i = 0; i < rows.children.length; i ++) {
            const cell = rows.children.item(i) as HTMLTableCellElement;
            const input = cell.firstChild as HTMLInputElement;
            const needle = input.value.toLowerCase();
            if (needle) {
                searchdata = searchdata.filter((row) => {
                    return row[i].toString().toLowerCase().indexOf(needle) > -1;
                });
                searchTexts.push(input.value);
            } else {
                searchTexts.push('');
            } 
        }
        this._logSetState({
            data: searchdata,
            searchTexts: searchTexts
        });
    }    
    _download(format: string, ev: React.MouseEvent<HTMLAnchorElement>) {
        const contents = format === 'json'
            ? JSON.stringify(this.state.data)
            : this.state.data.reduce(
                (result, row) => {
                    return result + row.reduce(
                        (rowresult, cell, idx) => {
                            return rowresult + 
                                '"' + cell.replace(/"/g, '""') + '"' + 
                                (idx < row.length - 1 ? ',' : '');
                        }, 
                        ''
                    ) + '\n';
                }, 
                ''
            );
        
        const URL = window.URL;
        var blob = new Blob([contents], {type: 'text/' + format});
        ev.currentTarget.href = URL.createObjectURL(blob);
        ev.currentTarget.download = 'data.' + format;
    }
    _renderToolbar() {
        return (
            <div>
                <button onClick={this._toggleSearch} className="toolbar">検索</button>
                <a href="data.json" onClick={this._download.bind(this, 'json')}>JSONで保存</a>
                <a href="data.csv" onClick={this._download.bind(this, 'csv')}>CSVで保存</a>
            </div>
        );
    }
    _renderSearch() {
        if (!this.state.search) {
            return null;
        }
        return (
            <tr onChange={this._search}>{
                this.props.headers.map((_ignore, idx) => {
                    let defval = '';
                    if (idx in this.state.searchTexts) {
                        defval = this.state.searchTexts[idx];
                    }
                    return <td key={idx}><input type="text" data-idx={idx} defaultValue={defval} /></td>;
                })
            }</tr>
        );
    }
    _renderTable(): JSX.Element {
        return (
            <table>
                <thead onClick={this._sort}>
                    <tr>
                        {this.props.headers.map((title: string, idx: number) => {
                            {if (this.state.sortby === idx) {
                                title += this.state.descending ? ' \u2191' : ' \u2193';
                            }}
                            return <th key={idx}>{title}</th>;
                        })}
                    </tr>
                </thead>
                <tbody onDoubleClick={this._showEditor} >
                    {this._renderSearch()}
                    {this.state.data.map((row: string[], idx: number) => {
                        return (
                            <tr key={idx}>{
                                row.map((cell: string, idx2: number) => {
                                    let content: string | JSX.Element = cell;
                                    const edit = this.state.edit;
                                    if (edit && edit.row === idx && edit.cell === idx2) {
                                        content = (
                                            <form onSubmit={this._save}>
                                                <input type="text" defaultValue={content}/>
                                            </form>
                                        ); 
                                    }
                                    return (
                                        <td key={idx2} data-row={idx}>
                                            {content}
                                        </td>
                                    );
                                })
                            }</tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
    render(): JSX.Element {
        return(
            <div>
                {this._renderToolbar()}
                {this._renderTable()}
            </div>
        );
    }
}
export default Excel;
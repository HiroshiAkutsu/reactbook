import Actions from './Actions';
import Dialog from './Dialog';
import Form from './Form';
import FormInput from './FormInput';
import Rating from './Rating';
import FormInputAbs from './FormInputAbs';
import * as React from 'react';
import * as classNames from 'classnames';
import './Excel.css';

interface ExcelProps {
    initialData: {}[];
    schema: {
        id: string,
        label?: string,
        type?: string,
        options?: string[],
        show?: boolean,
        sample?: string | number,
        align?: string
    }[];
    onDataChange(arg: {}): void;
}
interface ExcelStates {
    data: {}[];
    sortby?: string;
    descending: boolean;
    edit?: {row: number, key: string};
    dialog?: {type: string, idx: number};
}
class Excel extends React.Component<ExcelProps, ExcelStates> {

    private FormInputrefs: FormInputAbs<{}, {}> | null;
    private Formrefs: Form | null;
    constructor (props: ExcelProps) {
        super(props);
        this.state = {
            data: this.props.initialData,
            descending: false,
        };
        
        this._deleteConfirmationClick = this._deleteConfirmationClick.bind(this);
        this._saveDataDialog = this._saveDataDialog.bind(this);
        this._showEditor = this._showEditor.bind(this);
        this._save = this._save.bind(this);
    }
    componentWillReceiveProps(nextProps: ExcelProps) {
        this.setState({data: nextProps.initialData});
    }
    _fireDataChange(data: {}) {
        this.props.onDataChange(data);
    }
    _sort(key: string) {
        let data = Array.from(this.state.data);
        const descending = this.state.sortby === key && ! this.state.descending;
        data.sort((a, b) => {
            return descending
                ? (a[key] < b[key] ? 1 : -1)
                : (a[key] > b[key] ? 1 : -1);
        });
        this.setState({
            data: data,
            sortby: key,
            descending: descending,
        });
        this._fireDataChange(data);
    }
    _showEditor(e: React.MouseEvent<HTMLTableSectionElement>) {
        const t = e.target as HTMLTableCellElement;
        if (t.dataset.row !== undefined && t.dataset.key !== undefined) {
            this.setState({
                edit: {
                    row: parseInt(t.dataset.row, 10),
                    key: t.dataset.key
                }
            });
        }
    }
    
    _save(e: React.MouseEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!this.state.edit || !this.FormInputrefs) {
            throw Error('stateにeditまたはforminputrefsがセットされていません');
        }
        const value = this.FormInputrefs.getValue();
        let data = Array.from(this.state.data);
        data[this.state.edit.row][this.state.edit.key] = value;
        this.setState({
            edit: undefined,
            data: data
        });
        this._fireDataChange(data);
    }
    _actionClick(rowidx: number, action: string) {
        this.setState({
            dialog: {type: action, idx: rowidx}
        });
    }
    
    _deleteConfirmationClick(action: string) {
        if (action === 'dismiss') {
            this._closeDialog();
            return;
        }
        if (!this.state.data || !this.state.dialog ) {
            throw Error('dataまたはdialogがstateにありません');
        }
        let data = Array.from(this.state.data);
        data.splice(this.state.dialog.idx, 1);
        this.setState({
            dialog: undefined,
            data: data
        });
        this._fireDataChange(data);
    }
    _closeDialog() {
        this.setState({dialog: undefined});
    }
    _saveDataDialog(action: string) {
        if (action === 'dismiss') {
            this._closeDialog();
            return;
        }
        if (!this.state.data || !this.state.dialog) {
            throw Error('stateにdataがありません');
        }
        let data = Array.from(this.state.data);
        if (!this.Formrefs) {
            throw Error('Formrefsがnullです。');
        }

        data[this.state.dialog.idx] = this.Formrefs.getData();
        this.setState({
            dialog: undefined,
            data: data
        });
        this._fireDataChange(data);
    }
    render() {
        return (
            <div className="Excel">
                {this._renderTable()}
                {this._renderDialog()}
            </div>
        );
    }
    _renderDialog() {
        if (!this.state.dialog) {
            return null;
        }
        switch (this.state.dialog.type) {
            case 'delete' :
                return this._renderDeleteDialog();
            case 'info' :
                return this._renderFormDialog(true);
            case 'edit' :
                return this._renderFormDialog();
            default :
                throw Error(`不正なダイアログの種類： ${this.state.dialog.type}`);
        }
    }
    
    _renderDeleteDialog() {
        if (!this.state.dialog) {
            throw Error('stateのdialogにデータが入っていません');
        }
        const first = this.state.data[this.state.dialog.idx];
        const nameguess = first[Object.keys(first)[0]];
        return (
            <Dialog
                modal={true}
                header="削除の確認"
                confirmLabel="削除"
                onAction={this._deleteConfirmationClick}
            >
                {`削除しても良いですか："${nameguess}"?`}
            </Dialog>
        );
    }
    _renderFormDialog(readonly?: boolean) {
        return (
            <Dialog
                modal={true}
                header={readonly ? '項目の情報' : '項目の編集'}
                confirmLabel={readonly ? 'OK' : '保存'}
                hasCancel={!readonly}
                onAction={this._saveDataDialog}
            >
                <Form
                    ref={(el) => {this.Formrefs = el; }}
                    fields={this.props.schema}
                    initialData={
                        this.state.dialog
                        ? this.state.data[this.state.dialog.idx]
                        : {}
                    }
                    readonly={readonly}
                />
            </Dialog>
        );
    }
    _renderTable() {
        return (
            <table>
                <thead>
                    <tr>{
                        this.props.schema.map((item: {show: boolean, id: string, label: string}) => {
                            if (!item.show) {
                                return null;
                            }
                            let title = item.label;
                            if (this.state.sortby === item.id) {
                                title += this.state.descending ? '\u2191' : '\u2193';
                            }
                            return (
                                <th
                                    className={`schema-${item.id}`}
                                    key={item.id}
                                    onClick={this._sort.bind(this, item.id)}
                                >
                                    {title}
                                </th>
                            );
                        })}
                        <th className="ExcelNotSortable">操作</th>
                    </tr>
                </thead>
                <tbody onDoubleClick={this._showEditor}>
                    {this.state.data.map((row, rowidx) => {
                        return (
                            <tr key={rowidx}>
                                {Object.keys(row).map((cell, idx) => {
                                    const schema = this.props.schema[idx];
                                    if (!schema || !schema.show) {
                                        return null;
                                    }
                                    const isRating = schema.type === 'rating';
                                    const edit = this.state.edit;
                                    let content = row[cell];
                                    if (!isRating && edit && edit.row === rowidx && edit.key === schema.id) {
                                        content = (
                                            <form onSubmit={this._save}>
                                                <FormInput 
                                                    ref={(el) => {this.FormInputrefs = el; }}
                                                    {...schema}
                                                    defaultValue={content}
                                                />
                                            </form>
                                        );
                                    } else if (isRating) {
                                        content = <Rating readonly={true} defaultValue={Number(content)}/>;
                                    }
                                    return (
                                        <td
                                            className={classNames({
                                                [`schema-${schema.id}`]: true,
                                                'ExcelEditable': !isRating,
                                                'ExcelDataLeft': schema.align === 'left',
                                                'ExcelDataRight': schema.align === 'right',
                                                'ExcelDataCenter': schema.align !== 'left' &&
                                                     schema.align !== 'right'
                                            })}
                                            key={idx}
                                            data-row={rowidx}
                                            data-key={schema.id}
                                        >
                                            {content}
                                        </td>
                                    );
                                })
                                }
                                <td className="ExcelDataCenter">
                                    <Actions onAction={this._actionClick.bind(this, rowidx)}/>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
export default Excel;
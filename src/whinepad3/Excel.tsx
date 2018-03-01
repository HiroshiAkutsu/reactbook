import Actions from './Actions';
import Dialog from './Dialog';
import Form from './Form';
import FormInput from './FormInput';
import Rating from './Rating';
import FormInputAbs from './FormInputAbs';
import * as React from 'react';
import * as classNames from 'classnames';
import './Excel.css';
import CRUDStore from '../flux/CRUDStore';
import { SchemaProps } from '../flux/CRUDStore';
import CRUDActions from '../flux/CRUDActions';

interface ExcelStates {
    data: {}[];
    sortby?: string;
    descending: boolean;
    edit?: {row: number, key: string};
    dialog?: {type: string, idx: number};
}
class Excel extends React.Component<{}, ExcelStates> {
    private schema: SchemaProps[];
    private FormInputrefs: FormInputAbs<{}, {}> | null;
    private Formrefs: Form | null;
    constructor () {
        super({});
        this.state = {
            data: CRUDStore.getData(),
            descending: false,
        };
        this.schema = CRUDStore.getSchema();
        CRUDStore.addListener('change', () => {
            this.setState({
                data: CRUDStore.getData()
            });
        });
        this._deleteConfirmationClick = this._deleteConfirmationClick.bind(this);
        this._saveDataDialog = this._saveDataDialog.bind(this);
        this._showEditor = this._showEditor.bind(this);
        this._save = this._save.bind(this);
    }
    _sort(key: string) {
        const descending = this.state.sortby === key && ! this.state.descending;
        CRUDActions.sort(key, descending);
        this.setState({
            sortby: key,
            descending: descending,
        });
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
        const val = this.FormInputrefs.getValue();
        if (val !== null) {
            CRUDActions.updateField(
                this.state.edit.row,
                this.state.edit.key,
                val
            );
        }
        this.setState({
            edit: undefined
        });
    }
    _actionClick(rowidx: number, action: string) {
        this.setState({
            dialog: {type: action, idx: rowidx}
        });
    }
    
    _deleteConfirmationClick(action: string) {
        this.setState({
            dialog: undefined
        });
        if (action === 'dismiss') {
            return;
        }
        const index = this.state.dialog && this.state.dialog.idx;
        if (typeof index !== 'number') {
            throw Error('ステートdialogが不正です'); 
        }
        CRUDActions.delete(index);
    }
    _closeDialog() {
        this.setState({dialog: undefined});
    }
    _saveDataDialog(action: string) {
        this.setState({dialog: undefined});
        if (action === 'dismiss') {
            return;
        }
        const index = this.state.dialog && this.state.dialog.idx;
        if (typeof index !== 'number') {
            throw Error('ステートdialogが不正です');
        }
        if (!this.Formrefs) {
            throw Error('Formrefsがnullです。');
        }
        CRUDActions.updateRecord(index, this.Formrefs.getData());
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
        const index = this.state.dialog ? this.state.dialog.idx : undefined;
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
                    recordId={index}
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
                        this.schema.map((item) => {
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
                                    const schema = this.schema[idx];
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
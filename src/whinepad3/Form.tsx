import FormInput from './FormInput';
import * as React from 'react';
import Rating from './Rating';
import './Form.css';
import CRUDStore from '../flux/CRUDStore';
import { SchemaProps } from '../flux/CRUDStore';

interface FormProps {
    recordId?: number;
    readonly?: boolean;
}
class Form extends React.Component<FormProps, {}> {
    private commonrefs: {[key: string]: FormInput | null} = {};
    private fields: SchemaProps[];
    private initialData?: {};
    constructor(props: FormProps) {
        super(props);
        this.fields = CRUDStore.getSchema();
        if (this.props.recordId !== undefined) {
            this.initialData = CRUDStore.getRecord(this.props.recordId);
        }

    }    
    getData () {
        let data = {};
        if (this.commonrefs) {
            this.fields.forEach((field) => {
                data[field.id] = (this.commonrefs[field.id] as FormInput).getValue(); 
            });
        } else {
            throw Error('commonrefsに値がありません');
        }
        return data;
    }
    render() {
        return (
            <form className="Form">{
                this.fields.map(field => {
                    const prefilled = this.initialData 
                        ? this.initialData[field.id]
                        : '';
                    if (! this.props.readonly ) {
                        return (
                            <div className="FormRow" key={field.id}>
                                <label className="FormLabel" htmlFor={field.id}>{field.label}:</label>
                                <FormInput 
                                    {...field}
                                    ref={(el) => {
                                        this.commonrefs[field.id] = el;
                                    }}
                                    defaultValue={prefilled}
                                />
                            </div>
                        );
                    }
                    if (!prefilled) {
                        return null;
                    }
                    return (
                        <div className="FormRow" key={field.id}>
                            <span className="FormLabel">{field.label}:</span>
                            {
                                field.type === 'rating'
                                    ? <Rating 
                                        readonly={true} 
                                        defaultValue={parseInt(prefilled, 10)} 
                                        max={5} 
                                        id={field.id}
                                    />
                                    : <div>{prefilled}</div>
                            }
                        </div>

                    );
                })
            }
            </form>
        );
    }
}
export default Form;
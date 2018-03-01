import * as React from 'react';
import Rating from './Rating';
import Suggest from './Suggest';
import FormInputAbs from './FormInputAbs';
interface FormInputProps {
    defaultValue: string | number;
    id: string;
    type?: string;
    options?: string[];
}
class FormInput extends React.PureComponent<FormInputProps, {}> {
    private commonref: HTMLInputElement | FormInputAbs<{}, {}> | null;
    getValue() {
        let ret = null;
        if (this.commonref) {
            if ('value' in this.commonref) {
                ret = this.commonref.value;
            } else {
                ret = this.commonref.getValue();
            }
        }
        return ret;
    }
    render () {
        switch (this.props.type) {
            case  'year':
                return (
                    <input
                        id={this.props.id}
                        ref={(el) => {this.commonref = el; }}
                        type="number" 
                        defaultValue={
                            String(this.props.defaultValue || new Date().getFullYear())
                        } 
                    />
                );
            case 'suggest' :
                return (
                    <Suggest 
                        defaultValue={String(this.props.defaultValue)} 
                        options={this.props.options ? this.props.options : []}
                        id={this.props.id}
                        ref={(el) => { this.commonref = el; }}
                    />
                );
            case 'rating':
                return(
                    <Rating
                        id={this.props.id}
                        defaultValue={parseInt(String(this.props.defaultValue), 10)}
                        ref={(el => { this.commonref = el; })}
                        max={5}
                    />
                );
            default:
                return (
                    <input 
                        id={this.props.id}
                        defaultValue={String(this.props.defaultValue)}
                        type="text"
                        ref={(el) => { this.commonref = el; }}
                    />
                );
        }
    }
    
}
export default FormInput;
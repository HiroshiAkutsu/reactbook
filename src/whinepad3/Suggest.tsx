import * as React from 'react';
import FormInputAbs from './FormInputAbs';

interface SuggestProps {
    defaultValue: string;
    id: string;
    options: string[];
}
interface SuggestStates {
    value: string;
}
class Suggest extends FormInputAbs<SuggestProps, SuggestStates> {
    constructor(props: SuggestProps) {
        super(props);
        this.state = {value: props.defaultValue};
        this.changeHandler = this.changeHandler.bind(this);
    }
    getValue() {
        return this.state.value;
    }
    changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            value: e.currentTarget.value
        });
    }
    render() {
        const randomid = Math.random().toString(16).substring(2);
        return (
            <div>
                <input 
                    list={randomid}
                    onChange={this.changeHandler}
                    id={this.props.id}
                    defaultValue={this.props.defaultValue}
                    
                />    
                <datalist id={randomid}>{
                    this.props.options.map((item, idx) => 
                        <option value={item} key={idx}/>
                    )
                }</datalist>
            </div>
        );
    }
}

export default Suggest;
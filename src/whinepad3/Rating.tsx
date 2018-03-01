import * as React from 'react';
import * as classNames from 'classnames';
import './Rating.css';
import FormInputAbs from './FormInputAbs';

interface RatingProps {
    defaultValue: number;
    max?: number;
    readonly?: boolean;
    id?: string;
}
interface RatingDefaultProps extends RatingProps {
    max: number;
    defaultValue: number;
    readonly: boolean;
}
interface RatingStates {
    rating: number;
    tmpRating: number;
}
class Rating extends FormInputAbs<RatingProps, RatingStates> {
    static defaultProps = {
        max: 5,
        defaultValue: 0,
        readonly: false
    };
    constructor(props: RatingDefaultProps) {
        super(props);
        this.state = {
            tmpRating: props.defaultValue,
            rating : props.defaultValue
        };
        this.reset = this.reset.bind(this);
    }
    getValue() {
        return this.state.rating;
    }
    setTemp(value: number) {
        this.setState({tmpRating: value});
    }
    setRating(value: number) {
        this.setState({
            tmpRating: value,
            rating: value
        });
    }
    reset() {
        this.setTemp(this.state.rating);
    }
    componentWillReceiveProps(nextProps: RatingProps) {
        this.setRating(nextProps.defaultValue);
    }
    render() {
        const stars = [];
        const {max} = this.props as RatingDefaultProps;
        for (let i = 1; i <= max; i ++ ) {
            stars.push(
                <span
                    className={i <= this.state.tmpRating ? 'RatingOn' : ''}
                    key={i}
                    onClick={
                        this.props.readonly === false
                        ? this.setRating.bind(this, i)
                        : undefined
                    }
                    onMouseOver={
                        this.props.readonly === false 
                        ? this.setTemp.bind(this, i)
                        : undefined
                    }
                >
                &#9734;
                </span>
            );
        }

        return (
            <div
                className={classNames({
                    'Rating': true,
                    'RatingReadonly': this.props.readonly
                })}
                onMouseOut={this.reset}
            >
                {stars}
                {
                    this.props.readonly || !this.props.id
                    ? null
                    : <input 
                        type="hidden"
                        id={this.props.id}
                        value={String(this.state.rating)}
                    />
                }
            </div>
        );
    }
}
export default Rating;
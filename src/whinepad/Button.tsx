import * as React from 'react';
import * as classNames from 'classnames';
import './Button.css';

interface ButtonProps {
    href?: string;
    className?: string;
    children?: string;
    onClick?(): void;
}

function  Button(props: ButtonProps) {
    const cssclasses: string = classNames('Button', props.className);
    return (
        props.href 
            ? <a {...props} className={cssclasses} />
            : <button {...props} className={cssclasses}/>
    );
}
export default Button;
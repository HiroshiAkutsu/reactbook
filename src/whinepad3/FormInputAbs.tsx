import * as React from 'react';

abstract class FormInputAbs<P, S> extends React.Component<P, S>  {
    public abstract getValue(): string | number | null ;
}
export default FormInputAbs;
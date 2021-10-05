import React from 'react';

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.currentList.items[this.props.index],
            editActive: false,
        }
    }

    render() {
        return(
            <div className="top5-item">
                {this.props.currentList.items[this.props.index]}
            </div>
        )
    }
}
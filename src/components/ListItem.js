import React from 'react';

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.currentList.items[this.props.index],
            editActive: false,
            draggedOver: false
        }
    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }

    handleBlur = () => {
        let textValue = this.state.text;
        let i = this.props.index;
        console.log(i);
        console.log(textValue);
        this.props.renameListItemCallback(i, textValue); 
        this.handleToggleEdit();
    }

    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }

    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }

    handleUpdate = (event) => {
        console.log(event.target.value);
        this.setState({ text: event.target.value });
    }

    handleDragOver = (event) => {
        this.setState({
            draggedOver: true
        })
    }

    handleDragLeave = (event) => {
        this.setState({
            draggedOver: false
        })
    }

    render() {
        if(this.state.editActive) {
            return(
                <input 
                    className = "top5-item"
                    onKeyPress = {this.handleKeyPress}
                    onBlur = {this.handleBlur}
                    onChange = {this.handleUpdate}
                    defaultValue = {this.props.currentList.items[this.props.index]}
                />
            )
        }
        else if(this.state.draggedOver) {
            return(
                <div 
                    className="top5-item-dragged-to"
                    onDragLeave={this.handleDragLeave}>
                {this.props.currentList.items[this.props.index]}
                </div>
            )
        }
        else{
            return(
                <div 
                    className="top5-item"
                    onClick={this.handleClick}
                    onDragOver={this.handleDragOver}
                    draggable>
                    {this.props.currentList.items[this.props.index]}
                </div>
            )
        }
        
    }
}
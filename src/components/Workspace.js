import React from "react";
import ListItem from './ListItem'

export default class Workspace extends React.Component {
    render() {
        const {currentList,
                renameListItemCallback,
                dragStartCallback,
                onDropCallback,
                dragOverCallback} = this.props;
        if (currentList != null) {
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                        <div id="edit-items">
                        {
                            currentList.items.map((item, index) =>( 
                                <ListItem
                                    currentList = {currentList}
                                    index = {index}
                                    renameListItemCallback = {renameListItemCallback}
                                    dragStartCallback = {dragStartCallback}
                                    onDropCallback = {onDropCallback}
                                    dragOverCallback = {dragOverCallback}
                                />
                            ))
                        }
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}
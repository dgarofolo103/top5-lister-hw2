import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal.js';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            currentListKey : null,
            swapIndexes: [null, null]
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            currentListKey: prevState.currentListKey
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            },
            currentListKey: prevState.currentListKey
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    renameListItem = (index, newName) => {
        let currentList = this.state.currentList;
        currentList.items[index] = newName;
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: prevState.sessionData.keyNamePairs
            },
            currentListKey: prevState.currentListKey
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData,
            currentListKey: prevState.currentListKey
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData,
            currentListKey: prevState.currentListKey
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    deleteList = (listKeyPair) => {
        this.showDeleteListModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            currentListKey: listKeyPair
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    removeList = (listKeyPair) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === listKeyPair.key) {
                newKeyNamePairs.splice(i, 1)
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        let currentList = this.state.currentList;
        if (currentList !== null) {
            if (currentList.key === listKeyPair.key) {
                currentList = null;
            }
        }

        this.setState(prevState => ({
            currentList: currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            currentListKey: prevState.currentListKey
        }), () => {
            this.hideDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    startDrag = (startIndex) => {
        let newSwapIndexes = [startIndex, this.state.swapIndexes[1]]
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: prevState.sessionData.keyNamePairs,
            },
            currentListKey: prevState.currentListKey,
            swapIndexes: newSwapIndexes
        }), () => {
            //MORE THINGS?
        });
    }

    startDragOver = (endIndex) => {
        let newSwapIndexes = [this.state.swapIndexes[0], endIndex];
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: prevState.sessionData.keyNamePairs,
            },
            currentListKey: prevState.currentListKey,
            swapIndexes: newSwapIndexes
        }))
    }

    startDrop = () => {
        let swappedList = this.state.currentList.items;
        swappedList.splice(this.state.swapIndexes[1], 0, swappedList.splice(this.state.swapIndexes[0], 1)[0]);
        console.log(swappedList);
        let newList = this.state.currentList
        newList.items = swappedList;
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: prevState.sessionData.keyNamePairs,
            },
            currentListKey: prevState.currentListKey,
            swapIndexes: [null, null]
        }), () => {
            //MORE THINGS?
        });
    }

    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    currentList={this.state.currentList}
                    closeCallback={this.closeCurrentList} 
                />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList} 
                    renameListItemCallback={this.renameListItem}
                    dragStartCallback={this.startDrag}
                    dragOverCallback={this.startDragOver}
                    onDropCallback={this.startDrop}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.currentListKey}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    removeListCallback={this.removeList}
                />
            </div>
        );
    }
}

export default App;

import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import _ from "lodash";
import "./App.css";
import { v4 } from "uuid";
import Swal from 'sweetalert2';
import { StringifyOptions } from 'querystring';
import { setMaxListeners, title } from 'process';

function App() {

    interface Item {
        id: string;
        name: string;
    }
    interface List {
        id: string,
        title: string,
        items: Item[],
    }
    interface ListState {
        todo: List;
        inProgress: List;
        done: List;
    }

    const items: Item[] = [
        {
            id: v4(),
            name: "Finir la filmographie de Godard"
        },
        {
            id: v4(),
            name: "Apprendre"
        }
    ]

    const todo = {
        id: v4(),
        title: "Todo",
        items: [items[0], items[1]]
    }
    const inProgress = {
        id: v4(),
        title: "In Progress",
        items: []
    }
    const done = {
        id: v4(),
        title: "Completed",
        items: []
    }

    const [text, setText] = useState('')
    const isEditable = false

    const [state, setState] = useState<List[]>([
        todo, inProgress, done
    ])
    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }
    const handleDragEnd = ({ source, destination }: any) => {
        console.log({ destination, source, state });

        const sourceId = source.droppableId;
        const destinationId = destination.droppableId;
        const newSate: any = { ...state };

        if (!destination) {
            console.log('Destination is null');
            return;
        }

        if (destination.index === source.index && destination.droppableId === source.droppableId) {
            console.log('Destination is the same as source');
            return;
        }

        if (sourceId === destinationId) {
            const items = newSate[sourceId].items;
            const reorderedTasks = reorder(items, source.index, destination.index);
            newSate[sourceId].items = reorderedTasks;
        } else {
            const item = newSate[sourceId].items[source.index];
            newSate[sourceId].items.splice(source.index, 1);
            newSate[destinationId].items.splice(destination.index, 0, item);
        }

        setState(newSate);
    }
    const addItem = () => {
        const newItem = { id: v4(), name: text };
        const newState = { ...state };

        newState[0].items.push(newItem);

        setState(newState);
        setText('');
    }
    const handleDelete = (id: string) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Voulez-vous vraiment supprimer cette tâche ?',
            text: "Cette action est irréversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const newList: List[] = { ...state };
                newList[0].items = newList[0].items.filter((item: Item) => item.id !== id);
                newList[1].items = newList[1].items.filter((item: Item) => item.id !== id);
                newList[2].items = newList[2].items.filter((item: Item) => item.id !== id);
                setState(newList);
                swalWithBootstrapButtons.fire(
                    'Supprimé !',
                    'Votre tâche a bien été supprimée',
                    'success'
                )
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    'Annulé',
                    'Votre tâche est toujours en place sur le rainté',
                    'error'
                )
            }
        })
    }
    const handleEdit = (id: string, name: string) => {
        Swal.fire({
            title: 'Modifier la tâche',
            input: 'text',
            inputValue: name,
            showCancelButton: true,
        }).then((result) => {
            if (result.value) {
                const newList: List[] = { ...state };

                for (let i = 0; i < 3; i++) {
                    newList[i].items = newList[i].items.map((item: Item) => {
                        if (item.id === id) {
                            item.name = result.value;
                        }
                        return item;
                    });
                }

                setState(newList);
            }
        })
    }

    return (
        <div className='App'>
            <h1 className='title'>Manage your projects</h1>
            <div className='add'>
                <input className='taskname' type="text" placeholder='Ajouter une tâche' value={text} onChange={(e) => setText(e.target.value)} />
                <button className='btnadd' onClick={addItem}>Ajouter</button>
            </div>
            <div className='allTasks'>
                <DragDropContext onDragEnd={handleDragEnd}>
                    {_.map(state, (data, key: string) => {
                        return (
                            <div key={key} className={"column"}>
                                <h3 className='todotitle'>{data.title}</h3>
                                <Droppable droppableId={key}>
                                    {(provided) => {
                                        return (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={"droppable-col"}
                                            >
                                                {data.items.map((el, index) => {
                                                    return (
                                                        <Draggable key={el.id} index={index} draggableId={el.id}>
                                                            {(provided) => {
                                                                return (
                                                                    <div className='item'
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        {el.name}
                                                                        <div className='operations'>
                                                                            <button onClick={() => handleEdit(el.id, el.name)} className='edit'><img src={'./edit.png'}></img></button>
                                                                            <button onClick={() => handleDelete(el.id)} className='delete'><img src={'./delete.png'}></img></button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }}
                                                        </Draggable>
                                                    )
                                                })}
                                                {provided.placeholder}
                                            </div>

                                        )
                                    }}
                                </Droppable>
                            </div>
                        )
                    })}
                </DragDropContext >
            </div>
        </div >
    );
}
export default App;



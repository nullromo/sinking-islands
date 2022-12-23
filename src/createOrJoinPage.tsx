import React from 'react';

export const CreateOrJoinPage = (props: {
    emitCreate: () => void;
    emitJoin: (id: string) => void;
}) => {
    const [joinID, setJoinID] = React.useState('');

    return (
        <div>
            <button
                type='button'
                onClick={() => {
                    props.emitCreate();
                }}
            >
                Create Game
            </button>
            <input
                type='text'
                value={joinID}
                onChange={(event) => {
                    setJoinID(event.target.value);
                }}
            />
            <button
                type='button'
                onClick={() => {
                    props.emitJoin(joinID);
                }}
            >
                Join Game
            </button>
        </div>
    );
};

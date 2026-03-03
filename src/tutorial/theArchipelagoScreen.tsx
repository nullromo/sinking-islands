import { createBasicGame } from './pageData';

const TheArchipelagoScreen = () => {
    return (
        <div
            style={{
                width: '200px',
                height: '200px',
                //clipPath:
                //'polygon( 0% 0%, 0% 100%, 20% 100%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 100%, 100% 100%, 100% 0%) ',
                maskImage:
                    'radial-gradient(circle 50px at center, transparent 50px, black 0)',
                background: 'blue',
                margin: '200px auto',
            }}
        >
            a
        </div>
    );
};

export const TheArchipelagoScreenData = {
    createGame: createBasicGame,
    overlay: <TheArchipelagoScreen />,
};

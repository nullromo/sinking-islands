import './gamePage.css';

type CSSWithVariables = React.CSSProperties & Record<string, number | string>;

const imgs = [
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_14.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_15.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_16.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_17.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_18.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_19.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_20.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_21.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_22.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_23.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_24.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_25.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_26.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_27.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_28.jpg',
    'https://assets.codepen.io/2017/17_05_a_amur_leopard_29.jpg',
];
const m = imgs.length;
const containerStyle: CSSWithVariables = {
    '--diameter': '100px',
    '--m': m,
    '--spacing': 0.3,
    '--tan': Math.tan(Math.PI / m),
};

interface CircularContainerProps {
    //items: React.ReactElement[];
}

export const CircularContainer = (props: CircularContainerProps) => {
    return (
        <div className='circular-container' style={containerStyle}>
            {[...Array(m).keys()].map((index) => {
                const style: CSSWithVariables = { '--i': index };
                return (
                    <a key={index} style={style}>
                        <img src={imgs[index]} />
                        <div style={{ background: 'skyblue' }}>asdf</div>
                    </a>
                );
            })}
        </div>
    );
};

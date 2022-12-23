interface IslandSelectorProps {
    islandNumber: number;
    setIslandNumber: (islandNumber: number) => void;
}

export const IslandSelector = (props: IslandSelectorProps) => {
    return (
        <>
            {'Choose island'}
            <select
                value={props.islandNumber}
                onChange={(event) => {
                    props.setIslandNumber(Number(event.target.value));
                }}
            >
                {[...Array(16).keys()].map((islandIndex) => {
                    const islandNumber = islandIndex + 1;
                    return (
                        <option key={islandNumber} value={islandNumber}>
                            {islandNumber}
                        </option>
                    );
                })}
            </select>
        </>
    );
};

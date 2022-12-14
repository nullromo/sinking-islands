import { Character } from './character';

export enum IslandType {
    NORMAL = 'NORMAL',
    SACRED = 'SACRED',
    VOLCANO = 'VOLCANO',
}

export class Island {
    public readonly islandNumber: number;

    public readonly islandType: IslandType;

    public readonly largeCapacity: boolean;

    private readonly characters: Character[] = [];

    public constructor(
        islandNumber: number,
        islandType: IslandType,
        largeCapacity: boolean,
    ) {
        this.islandNumber = islandNumber;
        this.islandType = islandType;
        this.largeCapacity = largeCapacity;
    }

    public readonly addCharacter = (character: Character) => {
        this.characters.push(character);
    };

    public readonly dump = () => {
        return `${this.islandNumber}:${this.characters
            .map((character) => {
                return character.dump();
            })
            .join(',')}`;
    };
}

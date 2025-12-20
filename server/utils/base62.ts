const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = characters.length;

export function encode(id: number) : string {
    if(id === 0) return characters[0];

    let encoded = '';
    while(id > 0) {
        const remiander = id % base;
        encoded = characters[remiander] + encoded;
        id = Math.floor(id / base);
    }

    return encoded;
}
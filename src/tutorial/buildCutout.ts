export const buildCutout = (box: DOMRect, pad: number) => {
    return `polygon(0% 0%, 0% 100%, ${box.left - pad}px 100%, ${box.left - pad}px ${box.top - pad}px, ${box.right + pad}px ${box.top - pad}px, ${box.right + pad}px ${box.bottom + pad}px, ${box.left - pad}px ${box.bottom + pad}px, ${box.left - pad}px 100%, 100% 100%, 100% 0%)`;
};

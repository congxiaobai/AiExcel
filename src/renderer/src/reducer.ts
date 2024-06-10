export const Action = {
    Loading: 'Loading',
    UpdateSheets: 'UpdateSheets'
}

export default (state, action: { tyep: string, payload: any }) => {
    switch (action.type) {
        case 'Loading':
            return { ...state, loading:action.payload };
        case 'UpdateSheets':
            return { ...state,sheets: action.payload};
        default:
            return state;
    }
};
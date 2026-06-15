export interface WikiApiResponse {
    query: {
        pages: {
            revisions: {
                slots: {
                    main: {
                        content: string;
                    };
                };
            }[];
        }[];
    };
}

export type Ticker = {
    symbol: string;
    index: Array<'nasdaq' | 'sp500'>;
}